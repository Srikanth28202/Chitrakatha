import type { PipelineStage } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import {
  serializeOrderSummary,
  type AdminOrderSummaryRecord,
} from '@/services/admin-order.service';
import type { AdminCustomerListQuery } from '@/lib/validations/admin-customer';
import { Order, type IOrder } from '@/models/Order';
import { Subscription, type ISubscription } from '@/models/Subscription';
import { User, type IUser } from '@/models/User';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-customer.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanOrder = IOrder & { _id: unknown };
type LeanSubscription = ISubscription & { _id: unknown };
type LeanUser = IUser & { _id: unknown };

interface CustomerAggregateRow {
  _id: string;
  name: string;
  phone: string;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  firstOrderAt: Date;
  lastOrderAt: Date;
  lastOrderNumber: string;
}

export interface AdminCustomerSummaryRecord {
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  lastOrderNumber: string;
  registered: boolean;
  userId?: string;
  preferredLanguage?: string;
}

export interface AdminCustomerDetailRecord extends AdminCustomerSummaryRecord {
  addresses: Array<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  orders: AdminOrderSummaryRecord[];
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    frequency: string;
    pricePerCycle: number;
    preferredLanguage: string;
    startDate: string;
    nextBillingDate: string;
    razorpaySubscriptionId?: string;
  }>;
}

export interface AdminCustomerListResult {
  items: AdminCustomerSummaryRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminCustomerServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'CUSTOMER_ERROR', status = 400) {
    super(message);
    this.name = 'AdminCustomerServiceError';
    this.code = code;
    this.status = status;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function loadRegisteredUsers(
  emails: string[]
): Promise<Map<string, LeanUser>> {
  if (emails.length === 0) return new Map();

  const users = await User.find({ email: { $in: emails } }).lean<LeanUser[]>();
  return new Map(users.map((user) => [normalizeEmail(user.email), user]));
}

async function loadCustomerAggregates(params: {
  q?: string;
  skip: number;
  limit: number;
}): Promise<{ rows: CustomerAggregateRow[]; total: number }> {
  const match: Record<string, unknown> = {};

  if (params.q) {
    const pattern = new RegExp(escapeRegExp(params.q), 'i');
    match.$or = [
      { 'customerDetails.email': pattern },
      { 'customerDetails.name': pattern },
      { 'customerDetails.phone': pattern },
    ];
  }

  const pipeline: PipelineStage[] = [
    { $match: match },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: { $toLower: '$customerDetails.email' },
        name: { $last: '$customerDetails.name' },
        phone: { $last: '$customerDetails.phone' },
        orderCount: { $sum: 1 },
        paidOrderCount: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'captured'] }, 1, 0] },
        },
        totalSpent: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', 'captured'] },
              '$pricing.totalAmount',
              0,
            ],
          },
        },
        firstOrderAt: { $first: '$createdAt' },
        lastOrderAt: { $last: '$createdAt' },
        lastOrderNumber: { $last: '$orderNumber' },
      },
    },
    { $sort: { lastOrderAt: -1 as const } },
  ];

  const [rows, countRows] = await Promise.all([
    Order.aggregate<CustomerAggregateRow>([
      ...pipeline,
      { $skip: params.skip },
      { $limit: params.limit },
    ]),
    Order.aggregate<{ total: number }>([...pipeline, { $count: 'total' }]),
  ]);

  return { rows, total: countRows[0]?.total ?? 0 };
}

function serializeAggregate(
  row: CustomerAggregateRow,
  user?: LeanUser
): AdminCustomerSummaryRecord {
  return {
    email: normalizeEmail(row._id),
    name: row.name,
    phone: row.phone,
    orderCount: row.orderCount,
    paidOrderCount: row.paidOrderCount,
    totalSpent: Math.round(row.totalSpent),
    firstOrderAt: toIso(row.firstOrderAt),
    lastOrderAt: toIso(row.lastOrderAt),
    lastOrderNumber: row.lastOrderNumber,
    registered: Boolean(user),
    ...(user?._id ? { userId: String(user._id) } : {}),
    ...(user?.preferredLanguage
      ? { preferredLanguage: user.preferredLanguage }
      : {}),
  };
}

export async function listAdminCustomers(
  query: AdminCustomerListQuery
): Promise<AdminCustomerListResult> {
  await connectToDatabase();

  const { rows, total } = await loadCustomerAggregates({
    q: query.q,
    skip: (query.page - 1) * query.limit,
    limit: query.limit,
  });

  const users = await loadRegisteredUsers(rows.map((row) => row._id));

  return {
    items: rows.map((row) => serializeAggregate(row, users.get(normalizeEmail(row._id)))),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getAdminCustomerByEmail(
  emailInput: string
): Promise<AdminCustomerDetailRecord | null> {
  await connectToDatabase();

  const email = normalizeEmail(emailInput);
  const [orders, user, subscriptions] = await Promise.all([
    Order.find({ 'customerDetails.email': email })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean<LeanOrder[]>(),
    User.findOne({ email }).lean<LeanUser | null>(),
    Subscription.find({ 'customerDetails.email': email })
      .sort({ createdAt: -1 })
      .lean<LeanSubscription[]>(),
  ]);

  if (orders.length === 0 && !user) {
    return null;
  }

  const latest = orders[0];
  const paidOrders = orders.filter((order) => order.paymentStatus === 'captured');
  const firstOrder = orders[orders.length - 1];

  const summary: AdminCustomerSummaryRecord = {
    email,
    name: latest?.customerDetails.name ?? user?.name ?? '',
    phone: latest?.customerDetails.phone ?? user?.phone ?? '',
    orderCount: orders.length,
    paidOrderCount: paidOrders.length,
    totalSpent: paidOrders.reduce(
      (total, order) => total + order.pricing.totalAmount,
      0
    ),
    firstOrderAt: toIso(firstOrder?.createdAt ?? user?.createdAt ?? new Date()),
    lastOrderAt: toIso(latest?.createdAt ?? user?.createdAt ?? new Date()),
    lastOrderNumber: latest?.orderNumber ?? '',
    registered: Boolean(user),
    ...(user?._id ? { userId: String(user._id) } : {}),
    ...(user?.preferredLanguage
      ? { preferredLanguage: user.preferredLanguage }
      : {}),
  };

  return {
    ...summary,
    addresses: (user?.addresses ?? []).map((address) => ({
      line1: address.line1,
      ...(address.line2 ? { line2: address.line2 } : {}),
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: Boolean(address.isDefault),
    })),
    orders: orders.map(serializeOrderSummary),
    subscriptions: subscriptions.map((subscription) => ({
      id: String(subscription._id),
      plan: subscription.subscriptionPlan,
      status: subscription.status,
      frequency: subscription.billingFrequency,
      pricePerCycle: subscription.pricePerCycle,
      preferredLanguage: subscription.preferredLanguage,
      startDate: toIso(subscription.startDate),
      nextBillingDate: toIso(subscription.nextBillingDate),
      ...(subscription.razorpaySubscriptionId
        ? { razorpaySubscriptionId: subscription.razorpaySubscriptionId }
        : {}),
    })),
  };
}
