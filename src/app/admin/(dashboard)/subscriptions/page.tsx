import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate, formatINR } from '@/lib/utils';
import {
  adminSubscriptionListQuerySchema,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  type AdminSubscriptionListQuery,
} from '@/lib/validations/admin-subscription';
import {
  listAdminSubscriptions,
  type AdminSubscriptionListResult,
} from '@/services/admin-subscription.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscriptions',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminSubscriptionListQuery = {
  q: undefined,
  status: 'all',
  plan: 'all',
  page: 1,
  limit: 20,
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface SubscriptionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function humanize(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/subscriptions');
  }

  const params = await searchParams;
  const parsed = adminSubscriptionListQuerySchema.safeParse(
    flattenSearchParams(params)
  );
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminSubscriptionListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: {
      all: 0,
      pending: 0,
      active: 0,
      paused: 0,
      past_due: 0,
      cancelled: 0,
    },
  };
  let loadError: string | null = null;

  try {
    result = await listAdminSubscriptions(query);
  } catch (error) {
    console.error(
      'Failed to load subscriptions:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load subscriptions from the database. Please try again.';
  }

  const baseParams = new URLSearchParams();
  if (query.q) baseParams.set('q', query.q);
  if (query.status !== 'all') baseParams.set('status', query.status);
  if (query.plan !== 'all') baseParams.set('plan', query.plan);

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams(baseParams);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString
      ? `/admin/subscriptions?${queryString}`
      : '/admin/subscriptions';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Recurring"
        title="Subscriptions"
        description="Manage recurring reader memberships and Razorpay mandate states."
      />

      <form
        method="get"
        action="/admin/subscriptions"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="subscription-search" className="sr-only">
              Search subscriptions
            </label>
            <input
              id="subscription-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Customer, email or mandate ID"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="subscription-status" className="sr-only">
              Subscription status
            </label>
            <select
              id="subscription-status"
              name="status"
              defaultValue={query.status}
              className={inputClass}
            >
              <option value="all">All statuses</option>
              {SUBSCRIPTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanize(status)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subscription-plan" className="sr-only">
              Subscription plan
            </label>
            <select
              id="subscription-plan"
              name="plan"
              defaultValue={query.plan}
              className={inputClass}
            >
              <option value="all">All plans</option>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {humanize(plan)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end gap-2">
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center rounded-paper border border-border px-3 py-2 text-xs font-medium text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main"
            >
              Reset
            </Link>
            <button
              type="submit"
              className="inline-flex items-center rounded-paper bg-terracotta-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {loadError && (
        <div
          className="rounded-paper border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <section className="rounded-warm border border-border bg-white shadow-card">
        <div className="border-b border-border-subtle px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-espresso-dark">
            {result.total}{' '}
            {result.total === 1 ? 'subscription' : 'subscriptions'}
          </h2>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No subscriptions found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Recurring memberships will appear here once they are created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Next billing</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Mandate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/subscriptions/${subscription.id}`}
                        className="font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                      >
                        {subscription.customer.name}
                      </Link>
                      <p className="text-xs text-espresso-soft">
                        {subscription.customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-espresso-main">{subscription.planTitle}</p>
                      <p className="text-xs text-espresso-soft">
                        {humanize(subscription.billingFrequency)}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium text-espresso-main">
                      {formatINR(subscription.pricePerCycle)}
                    </td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      {formatDate(subscription.nextBillingDate)}
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={subscription.status} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-44 truncate text-[11px] text-espresso-soft">
                        {subscription.razorpaySubscriptionId ?? 'Not linked'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        createHref={createPageHref}
      />
    </div>
  );
}
