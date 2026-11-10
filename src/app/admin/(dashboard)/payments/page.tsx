import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate, formatINR } from '@/lib/utils';
import {
  adminPaymentListQuerySchema,
  PAYMENT_RECORD_STATUSES,
  type AdminPaymentListQuery,
} from '@/lib/validations/admin-payment';
import {
  listAdminPayments,
  type AdminPaymentListResult,
} from '@/services/admin-payment.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payments',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminPaymentListQuery = {
  q: undefined,
  status: 'all',
  page: 1,
  limit: 20,
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface PaymentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/payments');
  }

  const params = await searchParams;
  const parsed = adminPaymentListQuerySchema.safeParse(flattenSearchParams(params));
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminPaymentListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: {
      all: 0,
      created: 0,
      pending: 0,
      authorized: 0,
      success: 0,
      failed: 0,
      refunded: 0,
    },
  };
  let loadError: string | null = null;

  try {
    result = await listAdminPayments(query);
  } catch (error) {
    console.error(
      'Failed to load payments:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load payments from the database. Please try again.';
  }

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams();
    if (query.q) nextParams.set('q', query.q);
    if (query.status !== 'all') nextParams.set('status', query.status);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/payments?${queryString}` : '/admin/payments';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Finance"
        title="Payments"
        description="Review Razorpay payment attempts. Refunds are issued from the related order."
      />

      <form
        method="get"
        action="/admin/payments"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="payment-search" className="sr-only">
              Search payments
            </label>
            <input
              id="payment-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Razorpay order or payment ID"
              className={inputClass}
            />
          </div>
          <div className="min-w-40">
            <label htmlFor="payment-status-filter" className="sr-only">
              Payment status
            </label>
            <select
              id="payment-status-filter"
              name="status"
              defaultValue={query.status}
              className={inputClass}
            >
              <option value="all">All statuses</option>
              {PAYMENT_RECORD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {humanize(status)}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/admin/payments"
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
            {result.total} {result.total === 1 ? 'payment' : 'payments'}
          </h2>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No payments found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Payment attempts appear here during checkout.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((payment) => (
                  <tr key={payment.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <p className="max-w-52 truncate font-mono text-[11px] text-espresso-main">
                        {payment.providerPaymentId ?? payment.providerOrderId ?? payment.id}
                      </p>
                      <p className="text-[11px] uppercase text-espresso-soft">
                        {payment.provider}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${payment.orderId}`}
                        className="text-espresso-main hover:text-terracotta-700"
                      >
                        {payment.orderNumber || 'View order'}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-espresso-main">{payment.customerName || '-'}</p>
                      <p className="text-xs text-espresso-soft">
                        {payment.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium text-espresso-main">
                      {formatINR(payment.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={payment.status} />
                      {payment.failureReason && (
                        <p className="mt-1 max-w-48 text-[11px] text-rose-700">
                          {payment.failureReason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      {formatDate(payment.createdAt)}
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
