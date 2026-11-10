import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { CART_LIMITS, DUPLICATE_ORDER_WINDOW_MS } from '@/config/constants';
import { connectToDatabase } from '@/lib/db';
import { isDuplicateKeyError } from '@/lib/mongo-errors';
import { Coupon, ICoupon } from '@/models/Coupon';
import { Edition, IEdition } from '@/models/Edition';
import { Order, IOrder, IOrderItem } from '@/models/Order';
import {
  getBusinessSettings,
  type BusinessSettings,
} from '@/services/business-settings.service';
import type { PendingOrderPayload, QuoteRequestPayload } from '@/lib/validations/checkout';
import type { CartItem, CartLanguage } from '@/types/cart';
import type {
  CheckoutCouponResult,
  CheckoutLine,
  CheckoutQuote,
  CheckoutServiceability,
  CheckoutTotals,
  PendingOrderSummary,
} from '@/types/checkout';

type EditionRecord = IEdition & { _id: Types.ObjectId };

interface CouponEvaluation {
  result: CheckoutCouponResult | null;
  couponId?: string;
}

interface QuoteComputation {
  quote: CheckoutQuote;
  couponId?: string;
}

const INVALID_COUPON_MESSAGE = 'This coupon is invalid or has expired.';

export class CheckoutServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code = 'CHECKOUT_ERROR', status = 400, details?: unknown) {
    super(message);
    this.name = 'CheckoutServiceError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function toPositiveNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * Indian PIN codes are regional: the leading digit 5 covers the southern
 * states, and Karnataka's sorting districts occupy 56xxxx–59xxxx while
 * Andhra Pradesh and Telangana use 50xxxx–53xxxx. This prefix check is a
 * coarse, offline state gate; an explicit serviceable-pincodes allowlist
 * can still restrict delivery further.
 */
function isKarnatakaPincode(pincode: string): boolean {
  return /^5[6-9]\d{4}$/.test(pincode);
}

const PAN_INDIA_REGION_LABELS = ['pan-india', 'pan india', 'all india', 'india'];

function evaluatePincode(
  pincode: string | undefined,
  settings: BusinessSettings
): CheckoutServiceability | null {
  if (!pincode) return null;

  const normalized = pincode.trim();

  if (!/^[1-9]\d{5}$/.test(normalized)) {
    return {
      pincode: normalized,
      serviceable: false,
      message: 'Enter a valid 6-digit pincode.',
    };
  }

  const regions = settings.deliveryRegions.map((region) => region.trim().toLowerCase());
  const includesKarnataka = regions.includes('karnataka');
  const includesPanIndia = regions.some((region) => PAN_INDIA_REGION_LABELS.includes(region));

  if (regions.length > 0 && !includesKarnataka && !includesPanIndia) {
    return {
      pincode: normalized,
      serviceable: false,
      message: 'Deliveries are not currently enabled for your region.',
    };
  }

  // While Karnataka is among the active delivery regions, orders must ship to
  // a Karnataka sorting district. The checkout form and order pipeline both
  // hard-code Karnataka as the delivery state.
  if (regions.length > 0 && includesKarnataka && !isKarnatakaPincode(normalized)) {
    return {
      pincode: normalized,
      serviceable: false,
      message: 'We currently deliver only within Karnataka.',
    };
  }

  if (
    settings.serviceablePincodes.length > 0 &&
    !settings.serviceablePincodes.includes(normalized)
  ) {
    return {
      pincode: normalized,
      serviceable: false,
      message: 'This pincode is not serviceable yet.',
    };
  }

  return {
    pincode: normalized,
    serviceable: true,
  };
}

function mergeCartItems(items: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of items) {
    const key = `${item.slug}::${item.language}`;
    const existing = merged.get(key);
    const quantity = (existing?.quantity ?? 0) + item.quantity;

    if (quantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
      throw new CheckoutServiceError(
        `Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} boxes are allowed for the same edition and language.`,
        'QUANTITY_LIMIT_EXCEEDED',
        400,
        { slug: item.slug, language: item.language }
      );
    }

    merged.set(key, {
      slug: item.slug,
      language: item.language,
      quantity,
    });
  }

  if (merged.size > CART_LIMITS.MAX_ITEMS) {
    throw new CheckoutServiceError(
      `A cart can contain at most ${CART_LIMITS.MAX_ITEMS} different edition lines.`,
      'CART_LIMIT_EXCEEDED'
    );
  }

  return Array.from(merged.values());
}

async function loadEditions(slugs: string[]): Promise<Map<string, EditionRecord>> {
  const records = (await Edition.find({
    slug: { $in: slugs },
    status: { $in: ['active', 'upcoming'] },
  })
    .lean()
    .exec()) as unknown as EditionRecord[];

  const bySlug = new Map(records.map((record) => [record.slug, record]));
  const unavailable = slugs.filter((slug) => !bySlug.has(slug));

  if (unavailable.length > 0) {
    throw new CheckoutServiceError(
      'One or more selected editions are no longer available.',
      'EDITION_UNAVAILABLE',
      409,
      { slugs: unavailable }
    );
  }

  return bySlug;
}

function getEditionLanguages(edition: EditionRecord): CartLanguage[] {
  if (!edition.availableLanguages || edition.availableLanguages.length === 0) {
    return ['bilingual'];
  }

  return edition.availableLanguages;
}

function calculateCouponDiscount(
  coupon: ICoupon,
  basePrice: number
): number {
  const value = toPositiveNumber(coupon.discountValue, 0);
  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = Math.round((basePrice * value) / 100);
    if (coupon.maximumDiscount !== undefined && coupon.maximumDiscount !== null) {
      discount = Math.min(discount, toPositiveNumber(coupon.maximumDiscount, discount));
    }
  } else {
    discount = value;
  }

  return Math.max(0, Math.min(Math.round(discount), basePrice));
}

function invalidCoupon(code: string, message: string): CouponEvaluation {
  return {
    result: {
      code,
      valid: false,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      message,
    },
  };
}

async function evaluateCoupon(params: {
  code?: string;
  basePrice: number;
  editionIds: string[];
  email?: string;
}): Promise<CouponEvaluation> {
  const code = params.code?.trim().toUpperCase();
  if (!code) return { result: null };

  const coupon = await Coupon.findOne({ code }).lean<ICoupon>();
  if (!coupon) return invalidCoupon(code, INVALID_COUPON_MESSAGE);

  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const expiryDate = new Date(coupon.expiryDate);

  if (!coupon.isActive) return invalidCoupon(code, INVALID_COUPON_MESSAGE);
  if (Number.isNaN(startDate.getTime()) || now < startDate) {
    return invalidCoupon(code, 'This coupon is not active yet.');
  }
  if (Number.isNaN(expiryDate.getTime()) || now > expiryDate) {
    return invalidCoupon(code, INVALID_COUPON_MESSAGE);
  }

  if (
    coupon.usageLimit !== undefined &&
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return invalidCoupon(code, 'This coupon has reached its usage limit.');
  }

  if (toPositiveNumber(coupon.minimumOrderValue, 0) > params.basePrice) {
    return invalidCoupon(code, 'Your order does not meet the minimum value for this coupon.');
  }

  if (
    Array.isArray(coupon.applicablePurchaseTypes) &&
    coupon.applicablePurchaseTypes.length > 0 &&
    !coupon.applicablePurchaseTypes.includes('one_time')
  ) {
    return invalidCoupon(
      code,
      'This coupon is only valid with subscription plans and cannot be used on one-time orders.'
    );
  }

  if (Array.isArray(coupon.applicableEditions) && coupon.applicableEditions.length > 0) {
    const applicable = new Set(coupon.applicableEditions.map((editionId) => String(editionId)));
    const hasIneligibleEdition = params.editionIds.some((editionId) => !applicable.has(editionId));

    if (hasIneligibleEdition) {
      return invalidCoupon(code, 'This coupon does not apply to every edition in your cart.');
    }
  }

  const perCustomerLimit = coupon.perCustomerLimit ?? 0;

  if (params.email && perCustomerLimit > 0) {
    const usedByCustomer = await Order.countDocuments({
      'customerDetails.email': params.email.trim().toLowerCase(),
      couponCode: code,
      paymentStatus: 'captured',
    });

    if (usedByCustomer >= perCustomerLimit) {
      return invalidCoupon(code, 'You have already used this coupon the maximum number of times.');
    }
  }

  const discountAmount = calculateCouponDiscount(coupon, params.basePrice);

  return {
    couponId: String(coupon._id),
    result: {
      code,
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    },
  };
}

async function computeQuote(input: QuoteRequestPayload): Promise<QuoteComputation> {
  try {
    await connectToDatabase();
  } catch {
    throw new CheckoutServiceError(
      'Checkout is temporarily unavailable. Please try again shortly.',
      'CHECKOUT_UNAVAILABLE',
      503
    );
  }

  const mergedItems = mergeCartItems(input.items);
  const slugs = Array.from(new Set(mergedItems.map((item) => item.slug)));
  const editionsBySlug = await loadEditions(slugs);
  const settings = await getBusinessSettings();
  const lines: CheckoutLine[] = [];

  for (const item of mergedItems) {
    const edition = editionsBySlug.get(item.slug);

    if (!edition) {
      throw new CheckoutServiceError(
        'One or more selected editions are no longer available.',
        'EDITION_UNAVAILABLE',
        409,
        { slug: item.slug }
      );
    }

    const allowedLanguages = getEditionLanguages(edition);
    if (!allowedLanguages.includes(item.language)) {
      throw new CheckoutServiceError(
        'The selected language is not available for this edition.',
        'INVALID_LANGUAGE',
        400,
        { slug: item.slug, language: item.language }
      );
    }

    const stock = Math.max(0, Math.floor(toPositiveNumber(edition.stock, 0)));
    if (stock < item.quantity) {
      throw new CheckoutServiceError(
        'The requested quantity exceeds the available stock for this edition.',
        'INSUFFICIENT_STOCK',
        409,
        { slug: item.slug, available: stock, requested: item.quantity }
      );
    }

    const unitPrice = toPositiveNumber(edition.price, 0);
    lines.push({
      editionId: String(edition._id),
      slug: edition.slug,
      titleEn: edition.titleEn,
      titleKn: edition.titleKn,
      coverUrl: edition.images?.coverUrl ?? '',
      language: item.language,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      stock,
      maxQuantity: Math.min(CART_LIMITS.MAX_QUANTITY_PER_ITEM, stock),
    });
  }

  const basePrice = lines.reduce((total, line) => total + line.lineTotal, 0);
  const serviceability = evaluatePincode(input.pincode, settings);

  const freeShippingThreshold = settings.shippingConfiguration.freeShippingThreshold;
  const standardFee = settings.shippingConfiguration.standardFee;
  const freeShippingApplied = standardFee === 0 || basePrice >= freeShippingThreshold;
  const shippingFee = freeShippingApplied ? 0 : standardFee;

  const couponEvaluation = await evaluateCoupon({
    code: input.couponCode,
    basePrice,
    editionIds: lines.map((line) => line.editionId),
    email: input.email,
  });

  const discountAmount = couponEvaluation.result?.discountAmount ?? 0;
  const totals: CheckoutTotals = {
    basePrice,
    discountAmount,
    shippingFee,
    taxAmount: 0,
    totalAmount: Math.max(0, basePrice - discountAmount + shippingFee),
    currency: settings.currency,
  };

  return {
    couponId: couponEvaluation.couponId,
    quote: {
      items: lines,
      totals,
      coupon: couponEvaluation.result,
      serviceability,
      shipping: {
        freeShippingThreshold,
        standardFee,
        freeShippingApplied,
      },
    },
  };
}

export async function quoteCheckout(input: QuoteRequestPayload): Promise<CheckoutQuote> {
  const { quote } = await computeQuote(input);
  return quote;
}

function createPaymentAccessToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

function createOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();

  return `CK-${datePart}-${randomPart}`;
}

function createOrderFingerprint(input: PendingOrderPayload, quote: CheckoutQuote): string {
  const payload = JSON.stringify({
    email: input.customer.email.trim().toLowerCase(),
    pincode: input.address.postalCode,
    coupon: input.couponCode?.trim().toUpperCase() ?? '',
    items: quote.items
      .map((item) => ({
        editionId: item.editionId,
        language: item.language,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
      .sort((left, right) =>
        `${left.editionId}:${left.language}`.localeCompare(`${right.editionId}:${right.language}`)
      ),
    total: quote.totals.totalAmount,
  });

  return crypto.createHash('sha256').update(payload).digest('hex');
}

function serializeOrder(order: IOrder, duplicate = false): PendingOrderSummary {
  const items: CheckoutLine[] = order.items.map((item) => ({
    editionId: String(item.editionId),
    slug: item.slug,
    titleEn: item.titleEn,
    titleKn: item.titleKn,
    coverUrl: item.coverUrl,
    language: item.selectedLanguage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    stock: 0,
    maxQuantity: CART_LIMITS.MAX_QUANTITY_PER_ITEM,
  }));

  return {
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentToken: order.paymentAccessToken ?? order.idempotencyKey ?? '',
    items,
    totals: {
      basePrice: order.pricing.basePrice,
      discountAmount: order.pricing.discountAmount,
      shippingFee: order.pricing.shippingFee,
      taxAmount: order.pricing.taxAmount,
      totalAmount: order.pricing.totalAmount,
      currency: order.pricing.currency,
    },
    couponCode: order.couponCode,
    customer: {
      name: order.customerDetails.name,
      email: order.customerDetails.email,
      phone: order.customerDetails.phone,
    },
    address: {
      line1: order.deliveryAddress.line1,
      line2: order.deliveryAddress.line2,
      city: order.deliveryAddress.city,
      state: 'Karnataka',
      postalCode: order.deliveryAddress.postalCode,
      country: 'India',
    },
    createdAt: new Date(order.createdAt).toISOString(),
    duplicate,
  };
}

async function findDuplicateOrder(
  idempotencyKey: string,
  fingerprint: string
): Promise<IOrder | null> {
  return Order.findOne({
    $or: [
      { idempotencyKey },
      {
        fingerprint,
        paymentStatus: 'pending',
        createdAt: {
          $gte: new Date(Date.now() - DUPLICATE_ORDER_WINDOW_MS),
        },
      },
    ],
  }).lean<IOrder>();
}

/**
 * Atomically reserves stock for every cart line at order creation.
 *
 * A plain read-then-create check would allow two concurrent orders to both
 * pass validation and both pay for the last unit. The conditional $inc
 * guarantees the decrement only happens while enough stock exists, and the
 * caller rolls reservations back if anything later in the flow fails.
 */
async function reserveStock(items: CheckoutLine[]): Promise<void> {
  const reserved: Array<{ editionId: string; quantity: number }> = [];

  try {
    for (const item of items) {
      const result = await Edition.updateOne(
        {
          _id: new Types.ObjectId(item.editionId),
          status: { $in: ['active', 'upcoming'] },
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount === 0) {
        throw new CheckoutServiceError(
          'The requested quantity exceeds the available stock for this edition.',
          'INSUFFICIENT_STOCK',
          409,
          { slug: item.slug, requested: item.quantity }
        );
      }

      reserved.push({ editionId: item.editionId, quantity: item.quantity });
    }
  } catch (error) {
    // Release whatever was already reserved so a failed attempt does not
    // leak stock.
    await releaseStock(reserved);
    throw error;
  }
}

async function releaseStock(items: Array<{ editionId: string; quantity: number }>): Promise<void> {
  await Promise.all(
    items.map((item) =>
      Edition.updateOne(
        { _id: new Types.ObjectId(item.editionId) },
        { $inc: { stock: item.quantity } }
      ).catch(() => undefined)
    )
  );
}

/**
 * Atomically reserves one usage of the coupon against its global limit at
 * order creation. The conditional update guarantees `usedCount` can never
 * exceed `usageLimit`, no matter how many orders race.
 */
async function reserveCouponUsage(couponId: string): Promise<void> {
  const result = await Coupon.updateOne(
    {
      _id: new Types.ObjectId(couponId),
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    },
    { $inc: { usedCount: 1 } }
  );

  if (result.modifiedCount === 0) {
    throw new CheckoutServiceError(
      'This coupon has reached its usage limit.',
      'COUPON_INVALID',
      409
    );
  }
}

function releaseCouponUsage(couponId: string): Promise<unknown> {
  return Coupon.updateOne(
    { _id: new Types.ObjectId(couponId), usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  ).catch(() => undefined);
}

export async function createPendingOrder(input: PendingOrderPayload): Promise<PendingOrderSummary> {
  try {
    await connectToDatabase();
  } catch {
    throw new CheckoutServiceError(
      'Checkout is temporarily unavailable. Please try again shortly.',
      'CHECKOUT_UNAVAILABLE',
      503
    );
  }

  // Idempotent retries must return the existing order before coupon
  // per-customer limits make the same request look invalid.
  const existingByIdempotency = await Order.findOne({
    idempotencyKey: input.idempotencyKey.trim(),
  }).lean<IOrder>();

  if (existingByIdempotency) {
    return serializeOrder(existingByIdempotency, true);
  }

  const { quote, couponId } = await computeQuote({
    items: input.items,
    pincode: input.address.postalCode,
    couponCode: input.couponCode,
    email: input.customer.email,
  });

  if (!quote.serviceability?.serviceable) {
    throw new CheckoutServiceError(
      quote.serviceability?.message ?? 'This pincode is not serviceable.',
      'PINCODE_NOT_SERVICEABLE',
      400,
      quote.serviceability
    );
  }

  if (input.couponCode && (!quote.coupon || !quote.coupon.valid)) {
    throw new CheckoutServiceError(
      quote.coupon?.message ?? INVALID_COUPON_MESSAGE,
      'COUPON_INVALID',
      400
    );
  }

  const fingerprint = createOrderFingerprint(input, quote);
  const existingOrder = await findDuplicateOrder(input.idempotencyKey, fingerprint);

  if (existingOrder) {
    return serializeOrder(existingOrder, true);
  }

  // Razorpay cannot collect less than ₹1 (100 paise). An order that a 100%
  // coupon (or a flat coupon covering the whole total with free shipping)
  // reduces to zero would be created but could never be paid, so reject it
  // up front with a clear message instead of dead-ending at payment time.
  if (Math.round(quote.totals.totalAmount * 100) < 100) {
    throw new CheckoutServiceError(
      'This order has no payable amount after discounts. Please remove the coupon or contact us to complete this order.',
      'ORDER_AMOUNT_TOO_LOW',
      400
    );
  }

  // Reserve stock and coupon usage before the order exists so concurrent
  // orders can never oversell editions or over-redeem a coupon. Both are
  // released again if the order cannot be created.
  await reserveStock(quote.items);

  if (couponId && input.couponCode) {
    try {
      await reserveCouponUsage(couponId);
    } catch (error) {
      await releaseStock(
        quote.items.map((item) => ({ editionId: item.editionId, quantity: item.quantity }))
      );
      throw error;
    }
  }

  const orderItems: IOrderItem[] = quote.items.map((item) => ({
    editionId: new Types.ObjectId(item.editionId),
    slug: item.slug,
    titleEn: item.titleEn,
    titleKn: item.titleKn,
    coverUrl: item.coverUrl,
    selectedLanguage: item.language,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  }));

  const reservedStock = quote.items.map((item) => ({
    editionId: item.editionId,
    quantity: item.quantity,
  }));
  const firstItem = orderItems[0];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const order = await Order.create({
        orderNumber: createOrderNumber(),
        customerDetails: {
          name: input.customer.name.trim(),
          email: input.customer.email.trim().toLowerCase(),
          phone: input.customer.phone.trim(),
        },
        deliveryAddress: {
          line1: input.address.line1.trim(),
          line2: input.address.line2?.trim(),
          city: input.address.city.trim(),
          state: 'Karnataka',
          postalCode: input.address.postalCode.trim(),
          country: 'India',
        },
        items: orderItems,
        editionId: firstItem?.editionId,
        selectedLanguage: firstItem?.selectedLanguage,
        purchaseType: 'one_time',
        quantity: firstItem?.quantity,
        couponId: couponId ? new Types.ObjectId(couponId) : undefined,
        couponCode: input.couponCode?.trim().toUpperCase(),
        idempotencyKey: input.idempotencyKey.trim(),
        fingerprint,
        paymentAccessToken: createPaymentAccessToken(),
        pricing: {
          basePrice: quote.totals.basePrice,
          discountAmount: quote.totals.discountAmount,
          shippingFee: quote.totals.shippingFee,
          taxAmount: quote.totals.taxAmount,
          totalAmount: quote.totals.totalAmount,
          currency: quote.totals.currency,
        },
        paymentStatus: 'pending',
        orderStatus: 'placed',
      });

      return serializeOrder(order);
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        // The order was never persisted; give the reservations back.
        await releaseStock(reservedStock);
        if (couponId) await releaseCouponUsage(couponId);
        throw error;
      }

      const duplicate = await findDuplicateOrder(input.idempotencyKey, fingerprint);
      if (duplicate) {
        // The winning order already holds its own stock and coupon
        // reservations, so release this attempt's reservations.
        await releaseStock(reservedStock);
        if (couponId) await releaseCouponUsage(couponId);
        return serializeOrder(duplicate, true);
      }
    }
  }

  await releaseStock(reservedStock);
  if (couponId) await releaseCouponUsage(couponId);

  throw new CheckoutServiceError(
    'We could not create your order. Please try again.',
    'ORDER_CREATE_FAILED',
    500
  );
}
