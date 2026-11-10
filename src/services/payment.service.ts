import crypto from 'node:crypto';
import { connectToDatabase } from '@/lib/db';
import { isDuplicateKeyError } from '@/lib/mongo-errors';
import {
  RazorpayConfigurationError,
  getRazorpayClient,
  getRazorpayCredentials,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '@/lib/razorpay';
import { Order, IOrder } from '@/models/Order';
import { Payment, IPayment, PaymentRecordStatus } from '@/models/Payment';
import {
  PaymentWebhookEvent,
  IPaymentWebhookEvent,
} from '@/models/PaymentWebhookEvent';
import type {
  PaymentAccessPayload,
  PaymentInitPayload,
  PaymentVerifyPayload,
} from '@/lib/validations/payment';
import type { CheckoutLine } from '@/types/checkout';
import type {
  PaymentInitResponse,
  PaymentVerificationResult,
  PublicPaymentStatus,
} from '@/types/payment';

interface RazorpayOrderEntity {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  receipt?: string;
  created_at?: number;
}

interface RazorpayPaymentEntity {
  id: string;
  amount: number | string;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  method?: string;
  captured?: boolean;
  email?: string;
  contact?: string | number;
  created_at?: number;
  error_code?: string;
  error_description?: string;
}

interface RazorpayWebhookBody {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
    order?: {
      entity?: RazorpayOrderEntity;
    };
  };
}

type ProviderStatus = RazorpayPaymentEntity['status'];

const SUPPORTED_WEBHOOK_EVENTS = new Set([
  'payment.captured',
  'payment.authorized',
  'payment.failed',
  'order.paid',
]);

const STALE_WEBHOOK_PROCESSING_MS = 5 * 60 * 1000;

export class PaymentServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, code = 'PAYMENT_ERROR', status = 400, details?: unknown) {
    super(message);
    this.name = 'PaymentServiceError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function connectForPayment(): Promise<void> {
  try {
    await connectToDatabase();
  } catch {
    throw new PaymentServiceError(
      'Payments are temporarily unavailable. Please try again shortly.',
      'PAYMENT_UNAVAILABLE',
      503
    );
  }
}

function toPaise(amount: number): number {
  return Math.round(Number(amount) * 100);
}

function expectedAmountPaise(order: IOrder): number {
  const amount = toPaise(order.pricing.totalAmount);

  if (!Number.isFinite(amount) || amount < 100) {
    throw new PaymentServiceError(
      'This order does not have a payable amount.',
      'PAYMENT_AMOUNT_INVALID',
      400
    );
  }

  return amount;
}

function normalizeCurrency(currency: string | undefined): string {
  return (currency || 'INR').trim().toUpperCase();
}

function tokensMatch(expected: string | undefined, provided: string): boolean {
  if (!expected) return false;

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

async function loadOrderForAccess(input: PaymentAccessPayload): Promise<IOrder> {
  const order = await Order.findOne({
    orderNumber: input.orderNumber.trim().toUpperCase(),
  }).lean<IOrder>();

  if (!order) {
    throw new PaymentServiceError('Order not found.', 'ORDER_NOT_FOUND', 404);
  }

  const expectedToken = order.paymentAccessToken || order.idempotencyKey;
  if (!tokensMatch(expectedToken, input.paymentToken)) {
    throw new PaymentServiceError('Order not found.', 'ORDER_NOT_FOUND', 404);
  }

  return order;
}

function serializeCheckoutItems(order: IOrder): CheckoutLine[] {
  return order.items.map((item) => ({
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
    maxQuantity: 10,
  }));
}

function safePaymentResponse(payment: RazorpayPaymentEntity): Record<string, unknown> {
  return {
    id: payment.id,
    entity: 'payment',
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    order_id: payment.order_id,
    method: payment.method,
    captured: Boolean(payment.captured),
    email: payment.email,
    contact: payment.contact,
    created_at: payment.created_at,
    error_code: payment.error_code,
    error_description: payment.error_description,
  };
}

function safeOrderResponse(order: RazorpayOrderEntity): Record<string, unknown> {
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    status: order.status,
    receipt: order.receipt,
    created_at: order.created_at,
  };
}

function safeWebhookPayload(
  body: RazorpayWebhookBody,
  payment?: RazorpayPaymentEntity
): Record<string, unknown> {
  return {
    event: body.event,
    created_at: body.created_at,
    payment: payment ? safePaymentResponse(payment) : undefined,
  };
}

function mapProviderStatus(status: ProviderStatus): PaymentRecordStatus {
  if (status === 'captured') return 'success';
  if (status === 'authorized') return 'authorized';
  if (status === 'failed') return 'failed';
  if (status === 'refunded') return 'refunded';
  return 'pending';
}

/**
 * Terminal-ish ranking used to keep recorded payment statuses monotonic.
 * A late webhook (or a verify call racing a webhook) must never regress an
 * already recorded status, e.g. "authorized" arriving after "success".
 */
const PAYMENT_STATUS_RANK: Record<PaymentRecordStatus, number> = {
  created: 0,
  pending: 0,
  failed: 0,
  authorized: 1,
  success: 2,
  refunded: 3,
};

function statusesAboveRank(rank: number): PaymentRecordStatus[] {
  return (Object.keys(PAYMENT_STATUS_RANK) as PaymentRecordStatus[]).filter(
    (status) => PAYMENT_STATUS_RANK[status] > rank
  );
}

function validateProviderPayment(
  order: IOrder,
  payment: IPayment,
  providerPayment: RazorpayPaymentEntity
): void {
  const amountPaise = expectedAmountPaise(order);
  const providerAmount = Number(providerPayment.amount);

  if (!Number.isFinite(providerAmount) || providerAmount !== amountPaise) {
    throw new PaymentServiceError(
      'The paid amount does not match the order amount.',
      'PAYMENT_AMOUNT_MISMATCH',
      400
    );
  }

  if (
    normalizeCurrency(providerPayment.currency) !==
    normalizeCurrency(order.pricing.currency || payment.currency)
  ) {
    throw new PaymentServiceError(
      'The payment currency does not match the order currency.',
      'PAYMENT_CURRENCY_MISMATCH',
      400
    );
  }

  if (payment.providerOrderId && providerPayment.order_id !== payment.providerOrderId) {
    throw new PaymentServiceError(
      'The payment does not belong to this order.',
      'PAYMENT_ORDER_MISMATCH',
      400
    );
  }
}

async function applyVerifiedPayment(
  order: IOrder,
  payment: IPayment,
  providerPayment: RazorpayPaymentEntity
): Promise<PaymentVerificationResult> {
  validateProviderPayment(order, payment, providerPayment);

  const providerStatus = providerPayment.status;
  const isCaptured = providerStatus === 'captured';
  const isAuthorized = providerStatus === 'authorized';
  const isFailure = providerStatus === 'failed';
  const isRefund = providerStatus === 'refunded';

  if (!isCaptured && !isAuthorized && !isFailure && !isRefund) {
    throw new PaymentServiceError(
      'The payment has not been completed yet.',
      'PAYMENT_NOT_COMPLETED',
      400
    );
  }

  if (
    isFailure &&
    (payment.status === 'success' || payment.status === 'authorized')
  ) {
    return {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentRecordStatus: payment.status,
      providerPaymentId: payment.providerPaymentId ?? providerPayment.id,
      alreadyProcessed: true,
    };
  }

  const alreadyProcessed =
    isCaptured &&
    payment.status === 'success' &&
    payment.providerPaymentId === providerPayment.id;

  if (
    (payment.status === 'success' || payment.status === 'authorized') &&
    payment.providerPaymentId &&
    payment.providerPaymentId !== providerPayment.id
  ) {
    throw new PaymentServiceError(
      'A different payment has already been recorded for this order.',
      'PAYMENT_ALREADY_RECORDED',
      409
    );
  }

  const capturedPayment = await Payment.findOne({
    orderId: order._id,
    provider: 'razorpay',
    status: 'success',
  }).lean<IPayment>();

  if (
    capturedPayment?.providerPaymentId &&
    capturedPayment.providerPaymentId !== providerPayment.id
  ) {
    throw new PaymentServiceError(
      'This order has already been paid.',
      'ORDER_ALREADY_PAID',
      409
    );
  }

  const nextPaymentStatus = mapProviderStatus(providerStatus);
  const nextCurrency = normalizeCurrency(providerPayment.currency);
  const now = new Date();

  // Never regress a recorded status (e.g. a retried "payment.authorized"
  // webhook arriving after the capture was already processed).
  const nextRank = PAYMENT_STATUS_RANK[nextPaymentStatus] ?? 0;
  const currentRank = PAYMENT_STATUS_RANK[payment.status] ?? 0;

  if (nextRank < currentRank) {
    return {
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentRecordStatus: payment.status,
      providerPaymentId: payment.providerPaymentId ?? providerPayment.id,
      alreadyProcessed: true,
    };
  }

  const paymentSet: Record<string, unknown> = {
    providerPaymentId: providerPayment.id,
    amount: order.pricing.totalAmount,
    currency: nextCurrency,
    status: nextPaymentStatus,
    rawResponse: safePaymentResponse(providerPayment),
  };

  if (isCaptured || isAuthorized) {
    paymentSet.verifiedAt = now;
  }

  if (isFailure) {
    paymentSet.failureReason =
      providerPayment.error_description || 'Razorpay reported that the payment failed.';
  }

  try {
    await Payment.updateOne(
      // The status filter keeps this write monotonic even when two verified
      // deliveries (webhook + verify, or concurrent webhook retries) race.
      { _id: payment._id, status: { $nin: statusesAboveRank(nextRank) } },
      {
        $set: paymentSet,
        ...(isCaptured || isAuthorized ? { $unset: { failureReason: 1 } } : {}),
      }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new PaymentServiceError(
        'This Razorpay payment has already been linked to another order.',
        'PAYMENT_ALREADY_RECORDED',
        409
      );
    }

    throw error;
  }

  if (isCaptured) {
    // Coupon usage was already reserved atomically when the pending order
    // was created (see checkout.service.ts), so nothing to increment here.
    await Order.updateOne(
      { _id: order._id, paymentStatus: { $ne: 'captured' } },
      { $set: { paymentStatus: 'captured' } }
    );

    await Order.updateOne(
      { _id: order._id, orderStatus: { $ne: 'cancelled' } },
      { $set: { orderStatus: 'confirmed' } }
    );
  } else if (isAuthorized) {
    await Order.updateOne(
      { _id: order._id, paymentStatus: { $nin: ['captured'] } },
      { $set: { paymentStatus: 'authorized' } }
    );
  } else if (isFailure) {
    await Order.updateOne(
      { _id: order._id, paymentStatus: { $in: ['pending', 'failed'] } },
      { $set: { paymentStatus: 'failed' } }
    );
  } else if (isRefund) {
    await Order.updateOne({ _id: order._id }, { $set: { paymentStatus: 'refunded' } });
  }

  const updatedOrder = await Order.findById(order._id).lean<IOrder>();

  return {
    orderNumber: order.orderNumber,
    paymentStatus: updatedOrder?.paymentStatus ?? order.paymentStatus,
    orderStatus: updatedOrder?.orderStatus ?? order.orderStatus,
    paymentRecordStatus: nextPaymentStatus,
    providerPaymentId: providerPayment.id,
    alreadyProcessed,
  };
}

function buildPaymentInitResponse(
  order: IOrder,
  payment: IPayment,
  keyId: string,
  existing: boolean
): PaymentInitResponse {
  const amount = expectedAmountPaise(order);
  const currency = normalizeCurrency(order.pricing.currency);

  if (payment.providerOrderId && Math.round(Number(payment.amount) * 100) !== amount) {
    throw new PaymentServiceError(
      'The existing payment amount does not match this order.',
      'PAYMENT_AMOUNT_MISMATCH',
      409
    );
  }

  return {
    keyId,
    razorpayOrderId: payment.providerOrderId ?? '',
    orderNumber: order.orderNumber,
    amount,
    currency,
    description: `Chitrakatha order ${order.orderNumber}`,
    prefill: {
      name: order.customerDetails.name,
      email: order.customerDetails.email,
      contact: order.customerDetails.phone,
    },
    existing,
  };
}

export async function getPublicPaymentStatus(
  input: PaymentAccessPayload
): Promise<PublicPaymentStatus> {
  await connectForPayment();
  const order = await loadOrderForAccess(input);
  const payment = await Payment.findOne({
    orderId: order._id,
    provider: 'razorpay',
  })
    .sort({ createdAt: -1 })
    .lean<IPayment>();

  return {
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    items: serializeCheckoutItems(order),
    totals: {
      basePrice: order.pricing.basePrice,
      discountAmount: order.pricing.discountAmount,
      shippingFee: order.pricing.shippingFee,
      taxAmount: order.pricing.taxAmount,
      totalAmount: order.pricing.totalAmount,
      currency: order.pricing.currency,
    },
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
    payment: {
      recordStatus: payment?.status ?? null,
      providerPaymentId: payment?.providerPaymentId,
      verifiedAt: payment?.verifiedAt
        ? new Date(payment.verifiedAt).toISOString()
        : undefined,
      failureReason: payment?.failureReason,
    },
  };
}

export async function createPaymentOrder(
  input: PaymentInitPayload
): Promise<PaymentInitResponse> {
  await connectForPayment();
  const order = await loadOrderForAccess(input);

  if (
    order.paymentStatus === 'captured' ||
    order.paymentStatus === 'authorized' ||
    order.paymentStatus === 'refunded'
  ) {
    throw new PaymentServiceError(
      order.paymentStatus === 'authorized'
        ? 'A payment authorization for this order is already in progress.'
        : 'This order has already been paid.',
      'ORDER_ALREADY_PAID',
      409,
      { paymentStatus: order.paymentStatus }
    );
  }

  if (order.orderStatus === 'cancelled') {
    throw new PaymentServiceError(
      'This order has been cancelled.',
      'ORDER_CANCELLED',
      409
    );
  }

  const amount = expectedAmountPaise(order);
  const currency = normalizeCurrency(order.pricing.currency);
  const existing = await Payment.findOne({
    orderId: order._id,
    provider: 'razorpay',
  }).lean<IPayment>();

  let keyId: string;
  let client: ReturnType<typeof getRazorpayClient>;

  try {
    keyId = getRazorpayCredentials().keyId;
    client = getRazorpayClient();
  } catch (error) {
    if (error instanceof RazorpayConfigurationError) {
      throw new PaymentServiceError(error.message, error.code, 503);
    }
    throw error;
  }

  if (existing?.providerOrderId) {
    if (existing.status === 'success' || existing.status === 'authorized') {
      throw new PaymentServiceError(
        existing.status === 'authorized'
          ? 'A payment authorization for this order is already in progress.'
          : 'This order has already been paid.',
        'ORDER_ALREADY_PAID',
        409
      );
    }

    return buildPaymentInitResponse(order, existing, keyId, true);
  }

  let razorpayOrder: RazorpayOrderEntity;

  try {
    razorpayOrder = (await client.orders.create({
      amount,
      currency,
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        orderId: String(order._id),
        source: 'chitrakatha_web_checkout',
      },
    })) as unknown as RazorpayOrderEntity;
  } catch (error) {
    console.error(
      'Razorpay order creation failed:',
      error instanceof Error ? error.message : 'Unknown Razorpay error'
    );
    throw new PaymentServiceError(
      'Could not start the payment. Please try again.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }

  if (
    !razorpayOrder?.id ||
    Number(razorpayOrder.amount) !== amount ||
    normalizeCurrency(razorpayOrder.currency) !== currency
  ) {
    throw new PaymentServiceError(
      'Razorpay returned an unexpected order. Please try again.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }

  const paymentSet = {
    provider: 'razorpay' as const,
    providerOrderId: razorpayOrder.id,
    amount: order.pricing.totalAmount,
    currency,
    status: 'created' as const,
    rawResponse: safeOrderResponse(razorpayOrder),
  };

  if (existing) {
    const updated = await Payment.findOneAndUpdate(
      {
        _id: existing._id,
        $or: [{ providerOrderId: { $exists: false } }, { providerOrderId: null }],
      },
      { $set: paymentSet },
      { new: true }
    ).lean<IPayment>();

    if (updated?.providerOrderId) {
      return buildPaymentInitResponse(order, updated, keyId, false);
    }

    const winner = await Payment.findById(existing._id).lean<IPayment>();
    if (winner?.providerOrderId) {
      return buildPaymentInitResponse(order, winner, keyId, true);
    }

    throw new PaymentServiceError(
      'Could not prepare the payment. Please try again.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }

  try {
    const created = await Payment.create({
      orderId: order._id,
      ...paymentSet,
    });

    return buildPaymentInitResponse(order, created, keyId, false);
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;

    const winner = await Payment.findOne({
      orderId: order._id,
      provider: 'razorpay',
    }).lean<IPayment>();

    if (winner?.providerOrderId) {
      return buildPaymentInitResponse(order, winner, keyId, true);
    }

    if (winner) {
      const updated = await Payment.findOneAndUpdate(
        {
          _id: winner._id,
          $or: [{ providerOrderId: { $exists: false } }, { providerOrderId: null }],
        },
        { $set: paymentSet },
        { new: true }
      ).lean<IPayment>();

      if (updated?.providerOrderId) {
        return buildPaymentInitResponse(order, updated, keyId, false);
      }
    }

    throw new PaymentServiceError(
      'Could not prepare the payment. Please try again.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }
}

export async function verifyRazorpayPayment(
  input: PaymentVerifyPayload
): Promise<PaymentVerificationResult> {
  await connectForPayment();
  const order = await loadOrderForAccess(input);
  const payment = await Payment.findOne({
    orderId: order._id,
    provider: 'razorpay',
    providerOrderId: input.razorpayOrderId,
  }).lean<IPayment>();

  if (!payment) {
    throw new PaymentServiceError(
      'Payment record not found for this order.',
      'PAYMENT_NOT_FOUND',
      404
    );
  }

  let signatureValid = false;

  try {
    signatureValid = verifyRazorpayPaymentSignature(
      {
        order_id: input.razorpayOrderId,
        payment_id: input.razorpayPaymentId,
      },
      input.razorpaySignature
    );
  } catch (error) {
    if (error instanceof RazorpayConfigurationError) {
      throw new PaymentServiceError(error.message, error.code, 503);
    }
    throw error;
  }

  if (!signatureValid) {
    throw new PaymentServiceError(
      'Payment signature verification failed.',
      'PAYMENT_SIGNATURE_INVALID',
      400
    );
  }

  let providerPayment: RazorpayPaymentEntity;

  try {
    providerPayment = (await getRazorpayClient().payments.fetch(
      input.razorpayPaymentId
    )) as unknown as RazorpayPaymentEntity;
  } catch (error) {
    console.error(
      'Razorpay payment fetch failed:',
      error instanceof Error ? error.message : 'Unknown Razorpay error'
    );
    throw new PaymentServiceError(
      'Could not verify the payment with Razorpay. Please try again.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }

  if (providerPayment.id !== input.razorpayPaymentId) {
    throw new PaymentServiceError(
      'Razorpay returned an unexpected payment.',
      'PAYMENT_PROVIDER_ERROR',
      502
    );
  }

  const result = await applyVerifiedPayment(order, payment, providerPayment);

  if (providerPayment.status !== 'captured' && providerPayment.status !== 'authorized') {
    throw new PaymentServiceError(
      providerPayment.error_description || 'The payment was not successful.',
      'PAYMENT_NOT_SUCCESSFUL',
      400,
      { paymentStatus: result.paymentStatus }
    );
  }

  return result;
}

/**
 * Razorpay retries failed webhooks for hours. When an event keeps failing for
 * a permanent reason (e.g. a data bug on our side), retrying never helps, so
 * after this many attempts the event is acknowledged with a 200 to end the
 * provider's retry loop and left for manual reconciliation.
 */
const MAX_WEBHOOK_ATTEMPTS = 5;

async function claimWebhookEvent(input: {
  eventId: string;
  eventType: string;
  payment?: RazorpayPaymentEntity;
  body: RazorpayWebhookBody;
}): Promise<{
  event: IPaymentWebhookEvent | null;
  exhausted: boolean;
}> {
  const existing = await PaymentWebhookEvent.findOne({
    eventId: input.eventId,
  }).lean<IPaymentWebhookEvent>();

  if (existing) {
    if (existing.status === 'failed') {
      if ((existing.attempts ?? 0) >= MAX_WEBHOOK_ATTEMPTS) {
        // Permanently failed. Acknowledge instead of reprocessing so the
        // provider stops retrying; the record stays flagged for manual
        // reconciliation.
        return { event: null, exhausted: true };
      }

      const requeued = await PaymentWebhookEvent.findOneAndUpdate(
        { _id: existing._id, status: 'failed' },
        { $set: { status: 'processing', error: undefined }, $inc: { attempts: 1 } },
        { new: true }
      ).lean<IPaymentWebhookEvent>();

      return { event: requeued ?? null, exhausted: false };
    }

    const isStaleProcessing =
      existing.status === 'processing' &&
      Date.now() - new Date(existing.updatedAt).getTime() > STALE_WEBHOOK_PROCESSING_MS;

    if (!isStaleProcessing) return { event: null, exhausted: false };

    const requeued = await PaymentWebhookEvent.findOneAndUpdate(
      { _id: existing._id, status: 'processing' },
      { $inc: { attempts: 1 } },
      { new: true }
    ).lean<IPaymentWebhookEvent>();

    return { event: requeued ?? null, exhausted: false };
  }

  try {
    const created = await PaymentWebhookEvent.create({
      eventId: input.eventId,
      provider: 'razorpay',
      eventType: input.eventType,
      status: 'processing',
      attempts: 1,
      providerOrderId: input.payment?.order_id,
      providerPaymentId: input.payment?.id,
      payload: safeWebhookPayload(input.body, input.payment),
    });

    return { event: created, exhausted: false };
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    return { event: null, exhausted: false };
  }
}

export async function processRazorpayWebhook(input: {
  rawBody: string;
  signature: string | null;
  eventIdHeader: string | null;
}): Promise<{ received: boolean; duplicate: boolean; ignored?: boolean }> {
  let signatureValid = false;

  try {
    if (!input.signature) {
      throw new PaymentServiceError(
        'Missing Razorpay webhook signature.',
        'WEBHOOK_SIGNATURE_MISSING',
        400
      );
    }

    signatureValid = verifyRazorpayWebhookSignature(input.rawBody, input.signature);
  } catch (error) {
    if (error instanceof RazorpayConfigurationError) {
      throw new PaymentServiceError(error.message, error.code, 503);
    }
    throw error;
  }

  if (!signatureValid) {
    throw new PaymentServiceError(
      'Invalid Razorpay webhook signature.',
      'WEBHOOK_SIGNATURE_INVALID',
      400
    );
  }

  let body: RazorpayWebhookBody;

  try {
    body = JSON.parse(input.rawBody) as RazorpayWebhookBody;
  } catch {
    throw new PaymentServiceError('Invalid webhook JSON.', 'WEBHOOK_INVALID_JSON', 400);
  }

  const eventType = body.event?.trim();
  if (!eventType) {
    throw new PaymentServiceError('Webhook event type is missing.', 'WEBHOOK_INVALID', 400);
  }

  const eventId =
    input.eventIdHeader?.trim() ||
    `sha256:${crypto.createHash('sha256').update(input.rawBody).digest('hex')}`;

  await connectForPayment();

  const providerPayment = body.payload?.payment?.entity;
  const claim = await claimWebhookEvent({
    eventId,
    eventType,
    payment: providerPayment,
    body,
  });

  if (claim.exhausted) {
    console.error(
      `Razorpay webhook event ${eventId} (${eventType}) permanently failed after ` +
        `${MAX_WEBHOOK_ATTEMPTS} attempts. Acknowledging to stop provider retries; ` +
        'manual reconciliation required.'
    );
    return { received: true, duplicate: false, ignored: true };
  }

  const eventRecord = claim.event;

  if (!eventRecord) {
    return { received: true, duplicate: true };
  }

  try {
    if (!SUPPORTED_WEBHOOK_EVENTS.has(eventType) || !providerPayment?.id) {
      await PaymentWebhookEvent.updateOne(
        { _id: eventRecord._id },
        { $set: { status: 'processed', processedAt: new Date() } }
      );
      return { received: true, duplicate: false, ignored: true };
    }

    const payment = await Payment.findOne({
      $or: [
        { providerOrderId: providerPayment.order_id },
        { providerPaymentId: providerPayment.id },
      ],
      provider: 'razorpay',
    }).lean<IPayment>();

    if (!payment) {
      await PaymentWebhookEvent.updateOne(
        { _id: eventRecord._id },
        { $set: { status: 'processed', processedAt: new Date() } }
      );
      return { received: true, duplicate: false, ignored: true };
    }

    if (payment.providerOrderId && payment.providerOrderId !== providerPayment.order_id) {
      await PaymentWebhookEvent.updateOne(
        { _id: eventRecord._id },
        {
          $set: {
            status: 'processed',
            processedAt: new Date(),
            error: 'Payment order mismatch ignored.',
          },
        }
      );
      return { received: true, duplicate: false, ignored: true };
    }

    const order = await Order.findById(payment.orderId).lean<IOrder>();
    if (!order) {
      await PaymentWebhookEvent.updateOne(
        { _id: eventRecord._id },
        { $set: { status: 'processed', processedAt: new Date() } }
      );
      return { received: true, duplicate: false, ignored: true };
    }

    await applyVerifiedPayment(order, payment, providerPayment);

    await PaymentWebhookEvent.updateOne(
      { _id: eventRecord._id },
      {
        $set: {
          status: 'processed',
          processedAt: new Date(),
          providerOrderId: providerPayment.order_id,
          providerPaymentId: providerPayment.id,
        },
      }
    );

    return { received: true, duplicate: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook error';

    await PaymentWebhookEvent.updateOne(
      { _id: eventRecord._id },
      { $set: { status: 'failed', error: message.slice(0, 1000) } }
    );

    if (error instanceof PaymentServiceError) throw error;

    throw new PaymentServiceError(
      'Webhook processing failed. Please retry.',
      'WEBHOOK_PROCESSING_FAILED',
      500
    );
  }
}
