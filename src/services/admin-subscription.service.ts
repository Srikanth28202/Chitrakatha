import { connectToDatabase } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import { Subscription, type ISubscription } from '@/models/Subscription';
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  type AdminSubscriptionListQuery,
  type AdminSubscriptionUpdateInput,
  type SubscriptionPlanValue,
  type SubscriptionStatusValue,
} from '@/lib/validations/admin-subscription';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-subscription.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanSubscription = ISubscription & { _id: unknown };

interface RazorpaySubscriptionClient {
  subscriptions: {
    cancel: (
      id: string,
      options?: { cancel_at_cycle_end?: boolean }
    ) => Promise<unknown>;
    pause: (id: string, options?: { pause_at?: string }) => Promise<unknown>;
    resume: (id: string, options?: { resume_at?: string }) => Promise<unknown>;
  };
}

export interface AdminSubscriptionRecord {
  id: string;
  plan: SubscriptionPlanValue;
  planTitle: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  status: SubscriptionStatusValue;
  billingFrequency: string;
  pricePerCycle: number;
  preferredLanguage: string;
  startDate: string;
  nextBillingDate: string;
  cancelledAt?: string;
  pausedAt?: string;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  consent: {
    termsAccepted: boolean;
    acceptedAt: string;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubscriptionListResult {
  items: AdminSubscriptionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<SubscriptionStatusValue | 'all', number>;
}

export class AdminSubscriptionServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'SUBSCRIPTION_ERROR', status = 400) {
    super(message);
    this.name = 'AdminSubscriptionServiceError';
    this.code = code;
    this.status = status;
  }
}

const ALLOWED_TRANSITIONS: Record<
  SubscriptionStatusValue,
  SubscriptionStatusValue[]
> = {
  pending: ['active', 'cancelled'],
  active: ['paused', 'cancelled', 'past_due'],
  paused: ['active', 'cancelled'],
  past_due: ['active', 'paused', 'cancelled'],
  cancelled: [],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function planTitle(planId: SubscriptionPlanValue): string {
  const titles: Record<SubscriptionPlanValue, string> = {
    'monthly-letterbox': 'Monthly Letterbox',
    'quarterly-season-pass': 'Quarterly Season Pass',
    'annual-patron': 'Annual Connoisseur',
  };
  return titles[planId] ?? planId;
}

function serializeSubscription(
  subscription: LeanSubscription
): AdminSubscriptionRecord {
  return {
    id: String(subscription._id),
    plan: subscription.subscriptionPlan,
    planTitle: planTitle(subscription.subscriptionPlan),
    customer: {
      name: subscription.customerDetails.name,
      email: subscription.customerDetails.email,
      phone: subscription.customerDetails.phone,
    },
    status: subscription.status,
    billingFrequency: subscription.billingFrequency,
    pricePerCycle: subscription.pricePerCycle,
    preferredLanguage: subscription.preferredLanguage,
    startDate: toIso(subscription.startDate),
    nextBillingDate: toIso(subscription.nextBillingDate),
    ...(subscription.cancelledAt
      ? { cancelledAt: toIso(subscription.cancelledAt) }
      : {}),
    ...(subscription.pausedAt ? { pausedAt: toIso(subscription.pausedAt) } : {}),
    ...(subscription.razorpaySubscriptionId
      ? { razorpaySubscriptionId: subscription.razorpaySubscriptionId }
      : {}),
    ...(subscription.razorpayCustomerId
      ? { razorpayCustomerId: subscription.razorpayCustomerId }
      : {}),
    consent: {
      termsAccepted: subscription.consent.termsAccepted,
      acceptedAt: toIso(subscription.consent.acceptedAt),
      ...(subscription.consent.ipAddress
        ? { ipAddress: subscription.consent.ipAddress }
        : {}),
    },
    createdAt: toIso(subscription.createdAt),
    updatedAt: toIso(subscription.updatedAt),
  };
}

export async function listAdminSubscriptions(
  query: AdminSubscriptionListQuery
): Promise<AdminSubscriptionListResult> {
  await connectToDatabase();

  const filter: Record<string, unknown> = {};

  if (query.status !== 'all') filter.status = query.status;
  if (query.plan !== 'all') filter.subscriptionPlan = query.plan;

  if (query.q) {
    const pattern = new RegExp(escapeRegExp(query.q), 'i');
    filter.$or = [
      { 'customerDetails.name': pattern },
      { 'customerDetails.email': pattern },
      { 'customerDetails.phone': pattern },
      { razorpaySubscriptionId: pattern },
    ];
  }

  const [docs, total, statusAgg] = await Promise.all([
    Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<LeanSubscription[]>(),
    Subscription.countDocuments(filter),
    Subscription.aggregate<{ _id: SubscriptionStatusValue; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = SUBSCRIPTION_STATUSES.reduce(
    (counts, status) => {
      counts[status] = 0;
      return counts;
    },
    { all: 0 } as Record<SubscriptionStatusValue | 'all', number>
  );

  for (const row of statusAgg) {
    if (row?._id in statusCounts) statusCounts[row._id] = row.count;
    statusCounts.all += row?.count ?? 0;
  }

  return {
    items: docs.map(serializeSubscription),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    statusCounts,
  };
}

export async function getAdminSubscriptionById(
  id: string
): Promise<AdminSubscriptionRecord | null> {
  await connectToDatabase();
  const subscription = await Subscription.findById(id).lean<LeanSubscription | null>();
  return subscription ? serializeSubscription(subscription) : null;
}

async function applyProviderAction(
  subscription: LeanSubscription,
  nextStatus: SubscriptionStatusValue
): Promise<void> {
  if (!subscription.razorpaySubscriptionId) return;

  const client = getRazorpayClient() as unknown as RazorpaySubscriptionClient;
  const providerId = subscription.razorpaySubscriptionId;

  try {
    if (nextStatus === 'cancelled') {
      await client.subscriptions.cancel(providerId, { cancel_at_cycle_end: false });
    } else if (nextStatus === 'paused') {
      // Razorpay requires pause_at ('now' or 'cycle_end'); omitting it fails with a 400.
      await client.subscriptions.pause(providerId, { pause_at: 'now' });
    } else if (nextStatus === 'active' && subscription.status === 'paused') {
      await client.subscriptions.resume(providerId);
    }
  } catch (error) {
    console.error(
      'Razorpay subscription action failed:',
      error instanceof Error ? error.message : 'Unknown Razorpay error'
    );
    throw new AdminSubscriptionServiceError(
      'Could not update the subscription with Razorpay. Please try again.',
      'SUBSCRIPTION_PROVIDER_ERROR',
      502
    );
  }
}

export async function updateAdminSubscriptionStatus(
  id: string,
  input: AdminSubscriptionUpdateInput
): Promise<AdminSubscriptionRecord | null> {
  await connectToDatabase();

  const subscription = await Subscription.findById(id).lean<LeanSubscription | null>();
  if (!subscription) return null;

  if (input.status === subscription.status) {
    return serializeSubscription(subscription);
  }

  const allowed = ALLOWED_TRANSITIONS[subscription.status] ?? [];
  if (!allowed.includes(input.status)) {
    throw new AdminSubscriptionServiceError(
      `Cannot move a subscription from ${subscription.status} to ${input.status}.`,
      'INVALID_SUBSCRIPTION_TRANSITION',
      409
    );
  }

  try {
    await applyProviderAction(subscription, input.status);
  } catch (error) {
    if (error instanceof AdminSubscriptionServiceError) throw error;
    throw new AdminSubscriptionServiceError(
      'The subscription provider is not configured for this action.',
      'SUBSCRIPTION_PROVIDER_UNAVAILABLE',
      503
    );
  }

  const now = new Date();
  const update: Record<string, unknown> = { status: input.status };
  const unset: Record<string, 1> = {};

  if (input.status === 'paused') {
    update.pausedAt = now;
  } else if (input.status === 'cancelled') {
    update.cancelledAt = now;
  } else if (input.status === 'active') {
    unset.pausedAt = 1;
    unset.cancelledAt = 1;
  }

  const updated = await Subscription.findByIdAndUpdate(
    id,
    {
      $set: update,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    },
    { new: true, runValidators: true }
  ).lean<LeanSubscription | null>();

  return updated ? serializeSubscription(updated) : null;
}
