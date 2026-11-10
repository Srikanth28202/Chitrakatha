import { connectToDatabase } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import {
  releaseOrderCouponUsage,
  releaseOrderStock,
} from '@/lib/order-reservations';
import {
  PAYMENT_RECORD_STATUSES,
  type AdminPaymentListQuery,
  type AdminRefundInput,
} from '@/lib/validations/admin-payment';
import { Order, type IOrder } from '@/models/Order';
import { Payment, type IPayment, type PaymentRecordStatus } from '@/models/Payment';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-payment.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanPayment = IPayment & { _id: unknown };
type LeanOrder = IOrder & { _id: unknown };

interface RazorpayRefundClient {
  payments: {
    refund: (
      id: string,
      options: { amount: number; notes?: Record<string, string> }
    ) => Promise<{ id?: string; status?: string; amount?: number | string }>;
  };
}

export interface AdminPaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  verifiedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface AdminPaymentListResult {
  items: AdminPaymentRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<PaymentRecordStatus | 'all', number>;
}

export class AdminPaymentServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'PAYMENT_ADMIN_ERROR', status = 400) {
    super(message);
    this.name = 'AdminPaymentServiceError';
    this.code = code;
    this.status = status;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function serializePayment(
  payment: LeanPayment,
  order?: LeanOrder
): AdminPaymentRecord {
  return {
    id: String(payment._id),
    orderId: String(payment.orderId),
    orderNumber: order?.orderNumber ?? '',
    customerName: order?.customerDetails.name ?? '',
    customerEmail: order?.customerDetails.email ?? '',
    provider: payment.provider,
    ...(payment.providerOrderId
      ? { providerOrderId: payment.providerOrderId }
      : {}),
    ...(payment.providerPaymentId
      ? { providerPaymentId: payment.providerPaymentId }
      : {}),
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    ...(payment.verifiedAt
      ? { verifiedAt: toIso(payment.verifiedAt) }
      : {}),
    ...(payment.failureReason ? { failureReason: payment.failureReason } : {}),
    createdAt: toIso(payment.createdAt) ?? '',
  };
}

export async function listAdminPayments(
  query: AdminPaymentListQuery
): Promise<AdminPaymentListResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (query.status !== 'all') filter.status = query.status;

  if (query.q) {
    const pattern = new RegExp(escapeRegExp(query.q), 'i');
    filter.$or = [
      { providerOrderId: pattern },
      { providerPaymentId: pattern },
    ];
  }

  const [docs, total, statusAgg] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<LeanPayment[]>(),
    Payment.countDocuments(filter),
    Payment.aggregate<{ _id: PaymentRecordStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const orderIds = docs.map((payment) => payment.orderId);
  const orders = await Order.find({ _id: { $in: orderIds } }).lean<LeanOrder[]>();
  const ordersById = new Map(orders.map((order) => [String(order._id), order]));

  const statusCounts = PAYMENT_RECORD_STATUSES.reduce(
    (counts, status) => {
      counts[status] = 0;
      return counts;
    },
    { all: 0 } as Record<PaymentRecordStatus | 'all', number>
  );

  for (const row of statusAgg) {
    if (row?._id in statusCounts) statusCounts[row._id] = row.count;
    statusCounts.all += row?.count ?? 0;
  }

  return {
    items: docs.map((payment) =>
      serializePayment(payment, ordersById.get(String(payment.orderId)))
    ),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    statusCounts,
  };
}

export async function refundAdminOrder(
  input: AdminRefundInput
): Promise<AdminPaymentRecord> {
  await connectToDatabase();

  const order = await Order.findById(input.orderId).lean<LeanOrder | null>();
  if (!order) {
    throw new AdminPaymentServiceError('Order not found.', 'ORDER_NOT_FOUND', 404);
  }

  if (order.paymentStatus === 'refunded') {
    throw new AdminPaymentServiceError(
      'This order has already been refunded.',
      'ORDER_ALREADY_REFUNDED',
      409
    );
  }

  if (order.paymentStatus !== 'captured') {
    throw new AdminPaymentServiceError(
      'Only captured payments can be refunded.',
      'PAYMENT_NOT_CAPTURED',
      409
    );
  }

  const payment = await Payment.findOne({
    orderId: order._id,
    provider: 'razorpay',
    status: 'success',
  }).lean<LeanPayment | null>();

  if (!payment?.providerPaymentId) {
    throw new AdminPaymentServiceError(
      'A successful Razorpay payment was not found for this order.',
      'PAYMENT_NOT_FOUND',
      404
    );
  }

  const amountPaise = Math.round(order.pricing.totalAmount * 100);
  if (amountPaise < 100) {
    throw new AdminPaymentServiceError(
      'This order does not have a refundable amount.',
      'REFUND_AMOUNT_INVALID',
      400
    );
  }

  // Atomically claim the refund before calling the provider. Two concurrent
  // refund requests (double click, retry, two admins) would otherwise both
  // pass the read-only checks above and both call Razorpay.
  const claim = await Order.updateOne(
    { _id: order._id, paymentStatus: 'captured' },
    { $set: { paymentStatus: 'refunded' } }
  );

  if (claim.modifiedCount === 0) {
    throw new AdminPaymentServiceError(
      'This order has already been refunded.',
      'ORDER_ALREADY_REFUNDED',
      409
    );
  }

  let refundResponse: { id?: string; status?: string; amount?: number | string };

  try {
    const client = getRazorpayClient() as unknown as RazorpayRefundClient;
    refundResponse = await client.payments.refund(payment.providerPaymentId, {
      amount: amountPaise,
      notes: {
        orderNumber: order.orderNumber,
        adminReason: input.reason,
        source: 'chitrakatha_admin',
      },
    });
  } catch (error) {
    console.error(
      'Razorpay refund failed:',
      error instanceof Error ? error.message : 'Unknown Razorpay error'
    );

    // Roll the claim back so the refund can be retried after the provider
    // error is resolved.
    await Order.updateOne(
      { _id: order._id, paymentStatus: 'refunded' },
      { $set: { paymentStatus: 'captured' } }
    ).catch(() => undefined);

    throw new AdminPaymentServiceError(
      'Razorpay could not process the refund. No local refund was recorded.',
      'REFUND_PROVIDER_ERROR',
      502
    );
  }

  if (!refundResponse?.id) {
    await Order.updateOne(
      { _id: order._id, paymentStatus: 'refunded' },
      { $set: { paymentStatus: 'captured' } }
    ).catch(() => undefined);

    throw new AdminPaymentServiceError(
      'Razorpay returned an unexpected refund response.',
      'REFUND_PROVIDER_ERROR',
      502
    );
  }

  const updatedPayment = await Payment.findByIdAndUpdate(
    payment._id,
    {
      $set: {
        status: 'refunded',
        rawResponse: {
          ...(payment.rawResponse ?? {}),
          refund: {
            id: refundResponse.id,
            status: refundResponse.status,
            amount: refundResponse.amount,
            reason: input.reason,
            createdAt: new Date().toISOString(),
          },
        },
      },
    },
    { new: true }
  ).lean<LeanPayment | null>();

  // Return the stock and coupon usage that were reserved when the order was
  // created; a refunded order no longer consumes inventory or coupon quota.
  await releaseOrderStock(
    (order.items ?? []).map((item) => ({
      editionId: String(item.editionId),
      quantity: item.quantity,
    }))
  );

  if (order.couponId) {
    await releaseOrderCouponUsage(String(order.couponId));
  }

  if (!updatedPayment) {
    throw new AdminPaymentServiceError(
      'The refund completed but the local payment record could not be updated.',
      'REFUND_RECORD_UPDATE_FAILED',
      500
    );
  }

  return serializePayment(updatedPayment, order);
}
