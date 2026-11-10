import { connectToDatabase } from '@/lib/db';
import {
  releaseOrderCouponUsage,
  releaseOrderStock,
} from '@/lib/order-reservations';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type AdminOrderListQuery,
  type AdminOrderUpdateInput,
  type OrderStatusValue,
  type PaymentStatusValue,
} from '@/lib/validations/admin-order';
import { Order, type IOrder, type IOrderItem } from '@/models/Order';
import { Payment } from '@/models/Payment';
import { Shipment, type IShipment } from '@/models/Shipment';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-order.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanOrder = IOrder & { _id: unknown };

export interface AdminOrderItemRecord {
  editionId: string;
  slug: string;
  titleEn: string;
  titleKn: string;
  coverUrl: string;
  language: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface AdminOrderSummaryRecord {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  itemCount: number;
  quantity: number;
  firstItemTitle: string;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatusValue;
  orderStatus: OrderStatusValue;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderDetailRecord extends AdminOrderSummaryRecord {
  items: AdminOrderItemRecord[];
  pricing: {
    basePrice: number;
    discountAmount: number;
    shippingFee: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  purchaseType: string;
  payments: Array<{
    id: string;
    status: string;
    provider: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    amount: number;
    currency: string;
    verifiedAt?: string;
    failureReason?: string;
    createdAt: string;
  }>;
  shipments: Array<{
    id: string;
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    status: string;
    dispatchDate?: string;
    deliveryDate?: string;
    createdAt: string;
  }>;
}

export interface AdminOrderListResult {
  items: AdminOrderSummaryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<OrderStatusValue | 'all', number>;
  paymentCounts: Record<PaymentStatusValue | 'all', number>;
}

export class AdminOrderServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'ORDER_ERROR', status = 400) {
    super(message);
    this.name = 'AdminOrderServiceError';
    this.code = code;
    this.status = status;
  }
}

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function serializeItem(item: IOrderItem): AdminOrderItemRecord {
  return {
    editionId: String(item.editionId),
    slug: item.slug,
    titleEn: item.titleEn,
    titleKn: item.titleKn,
    coverUrl: item.coverUrl,
    language: item.selectedLanguage,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
  };
}

export function serializeOrderSummary(order: LeanOrder): AdminOrderSummaryRecord {
  const items = order.items ?? [];

  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    customer: {
      name: order.customerDetails.name,
      email: order.customerDetails.email,
      phone: order.customerDetails.phone,
    },
    itemCount: items.length,
    quantity: items.reduce((total, item) => total + item.quantity, 0),
    firstItemTitle: items[0]?.titleEn ?? 'Order',
    totalAmount: order.pricing.totalAmount,
    currency: order.pricing.currency,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    ...(order.couponCode ? { couponCode: order.couponCode } : {}),
    createdAt: toIso(order.createdAt) ?? '',
    updatedAt: toIso(order.updatedAt) ?? '',
  };
}

function buildDateFilter(query: AdminOrderListQuery) {
  if (!query.from && !query.to) return undefined;

  const range: Record<string, Date> = {};
  if (query.from) range.$gte = query.from;

  if (query.to) {
    const isMidnight =
      query.to.getUTCHours() === 0 &&
      query.to.getUTCMinutes() === 0 &&
      query.to.getUTCSeconds() === 0;
    range.$lte = isMidnight
      ? new Date(query.to.getTime() + 24 * 60 * 60 * 1000 - 1)
      : query.to;
  }

  return range;
}

export async function listAdminOrders(
  query: AdminOrderListQuery
): Promise<AdminOrderListResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};

  if (query.orderStatus !== 'all') filter.orderStatus = query.orderStatus;
  if (query.paymentStatus !== 'all') filter.paymentStatus = query.paymentStatus;

  const dateFilter = buildDateFilter(query);
  if (dateFilter) filter.createdAt = dateFilter;

  if (query.q) {
    const pattern = new RegExp(escapeRegExp(query.q), 'i');
    filter.$or = [
      { orderNumber: pattern },
      { 'customerDetails.name': pattern },
      { 'customerDetails.email': pattern },
      { 'customerDetails.phone': pattern },
      { 'deliveryAddress.postalCode': pattern },
    ];
  }

  const sort: Record<string, 1 | -1> =
    query.sort === 'oldest'
      ? { createdAt: 1 }
      : query.sort === 'highest_value'
        ? { 'pricing.totalAmount': -1, createdAt: -1 }
        : { createdAt: -1 };

  const [docs, total, orderStatusCounts, paymentStatusCounts] = await Promise.all([
    Order.find(filter)
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<LeanOrder[]>(),
    Order.countDocuments(filter),
    Order.aggregate<{ _id: OrderStatusValue; count: number }>([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: PaymentStatusValue; count: number }>([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = ORDER_STATUSES.reduce(
    (counts, status) => {
      counts[status] = 0;
      return counts;
    },
    { all: 0 } as Record<OrderStatusValue | 'all', number>
  );

  for (const row of orderStatusCounts) {
    if (row?._id in statusCounts) statusCounts[row._id] = row.count;
    statusCounts.all += row?.count ?? 0;
  }

  const paymentCounts = PAYMENT_STATUSES.reduce(
    (counts, status) => {
      counts[status] = 0;
      return counts;
    },
    { all: 0 } as Record<PaymentStatusValue | 'all', number>
  );

  for (const row of paymentStatusCounts) {
    if (row?._id in paymentCounts) paymentCounts[row._id] = row.count;
    paymentCounts.all += row?.count ?? 0;
  }

  return {
    items: docs.map(serializeOrderSummary),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    statusCounts,
    paymentCounts,
  };
}

export async function getAdminOrderById(
  id: string
): Promise<AdminOrderDetailRecord | null> {
  await connectToDatabase();

  const order = await Order.findById(id).lean<LeanOrder | null>();
  if (!order) return null;

  const [payments, shipments] = await Promise.all([
    Payment.find({ orderId: order._id })
      .sort({ createdAt: -1 })
      .lean(),
    Shipment.find({ orderId: order._id })
      .sort({ createdAt: -1 })
      .lean<(IShipment & { _id: unknown })[]>(),
  ]);

  const summary = serializeOrderSummary(order);

  return {
    ...summary,
    items: (order.items ?? []).map(serializeItem),
    pricing: {
      basePrice: order.pricing.basePrice,
      discountAmount: order.pricing.discountAmount,
      shippingFee: order.pricing.shippingFee,
      taxAmount: order.pricing.taxAmount,
      totalAmount: order.pricing.totalAmount,
      currency: order.pricing.currency,
    },
    address: {
      line1: order.deliveryAddress.line1,
      ...(order.deliveryAddress.line2 ? { line2: order.deliveryAddress.line2 } : {}),
      city: order.deliveryAddress.city,
      state: order.deliveryAddress.state,
      postalCode: order.deliveryAddress.postalCode,
      country: order.deliveryAddress.country,
    },
    ...(order.notes ? { notes: order.notes } : {}),
    purchaseType: order.purchaseType,
    payments: payments.map((payment) => ({
      id: String(payment._id),
      status: payment.status,
      provider: payment.provider,
      ...(payment.providerOrderId
        ? { providerOrderId: payment.providerOrderId }
        : {}),
      ...(payment.providerPaymentId
        ? { providerPaymentId: payment.providerPaymentId }
        : {}),
      amount: payment.amount,
      currency: payment.currency,
      ...(payment.verifiedAt ? { verifiedAt: toIso(payment.verifiedAt) } : {}),
      ...(payment.failureReason ? { failureReason: payment.failureReason } : {}),
      createdAt: toIso(payment.createdAt) ?? '',
    })),
    shipments: shipments.map((shipment) => ({
      id: String(shipment._id),
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      ...(shipment.trackingUrl ? { trackingUrl: shipment.trackingUrl } : {}),
      status: shipment.status,
      ...(shipment.dispatchDate
        ? { dispatchDate: toIso(shipment.dispatchDate) }
        : {}),
      ...(shipment.deliveryDate
        ? { deliveryDate: toIso(shipment.deliveryDate) }
        : {}),
      createdAt: toIso(shipment.createdAt) ?? '',
    })),
  };
}

export async function updateAdminOrder(
  id: string,
  input: AdminOrderUpdateInput
): Promise<AdminOrderDetailRecord | null> {
  await connectToDatabase();

  const existing = await Order.findById(id).lean<LeanOrder | null>();
  if (!existing) return null;

  const update: Record<string, unknown> = {};

  if (input.notes !== undefined) {
    update.notes = input.notes.length > 0 ? input.notes : undefined;
  }

  if (input.orderStatus && input.orderStatus !== existing.orderStatus) {
    const allowed = ALLOWED_ORDER_TRANSITIONS[existing.orderStatus] ?? [];
    if (!allowed.includes(input.orderStatus)) {
      throw new AdminOrderServiceError(
        `Cannot move an order from ${existing.orderStatus} to ${input.orderStatus}.`,
        'INVALID_ORDER_TRANSITION',
        409
      );
    }

    if (
      input.orderStatus === 'cancelled' &&
      (existing.paymentStatus === 'captured' ||
        existing.paymentStatus === 'authorized')
    ) {
      throw new AdminOrderServiceError(
        'This order has an active payment. Process a refund before cancelling it.',
        'ORDER_HAS_ACTIVE_PAYMENT',
        409
      );
    }

    update.orderStatus = input.orderStatus;
  }

  if (Object.keys(update).length === 0) {
    return getAdminOrderById(id);
  }

  if (update.notes === undefined) delete update.notes;

  await Order.updateOne(
    { _id: id },
    {
      $set: update,
      ...(input.notes !== undefined && input.notes.length === 0
        ? { $unset: { notes: 1 } }
        : {}),
    }
  );

  // A cancelled order no longer holds the stock and coupon usage that were
  // reserved when it was created, so hand both back.
  if (update.orderStatus === 'cancelled') {
    await releaseOrderStock(
      (existing.items ?? []).map((item) => ({
        editionId: String(item.editionId),
        quantity: item.quantity,
      }))
    );

    if (existing.couponId) {
      await releaseOrderCouponUsage(String(existing.couponId));
    }
  }

  return getAdminOrderById(id);
}
