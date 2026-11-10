import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Tags } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { CouponActions } from '@/components/admin/coupon-actions';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate, formatINR } from '@/lib/utils';
import {
  adminCouponListQuerySchema,
  COUPON_FILTER_STATUSES,
  type AdminCouponListQuery,
} from '@/lib/validations/admin-coupon';
import {
  listAdminCoupons,
  type AdminCouponListResult,
} from '@/services/admin-coupon.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Coupons',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminCouponListQuery = {
  q: undefined,
  status: 'all',
  page: 1,
  limit: 20,
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface CouponsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminCouponsPage({ searchParams }: CouponsPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/coupons');
  }

  const params = await searchParams;
  const parsed = adminCouponListQuerySchema.safeParse(flattenSearchParams(params));
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminCouponListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: {
      all: 0,
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
      exhausted: 0,
    },
  };
  let loadError: string | null = null;

  try {
    result = await listAdminCoupons(query);
  } catch (error) {
    console.error(
      'Failed to load coupons:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load coupons from the database. Please try again.';
  }

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams();
    if (query.q) nextParams.set('q', query.q);
    if (query.status !== 'all') nextParams.set('status', query.status);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/coupons?${queryString}` : '/admin/coupons';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Coupons"
        description="Create limited-time offers and control which editions and purchase types they apply to."
        action={
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New coupon
          </Link>
        }
      />

      <form
        method="get"
        action="/admin/coupons"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="coupon-search" className="sr-only">
              Search coupons
            </label>
            <input
              id="coupon-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Coupon code"
              className={inputClass}
            />
          </div>
          <div className="min-w-40">
            <label htmlFor="coupon-status" className="sr-only">
              Coupon status
            </label>
            <select
              id="coupon-status"
              name="status"
              defaultValue={query.status}
              className={inputClass}
            >
              {COUPON_FILTER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All statuses' : humanize(status)}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/admin/coupons"
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
            {result.total} {result.total === 1 ? 'coupon' : 'coupons'}
          </h2>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <Tags className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No coupons found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Create a coupon to offer a discount at checkout.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Discount</th>
                  <th className="px-5 py-3 font-semibold">Usage</th>
                  <th className="px-5 py-3 font-semibold">Window</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="font-medium tracking-wide text-espresso-main hover:text-terracotta-700"
                      >
                        {coupon.code}
                      </Link>
                      <p className="text-[11px] text-espresso-soft">
                        {coupon.applicableEditions.length === 0
                          ? 'All editions'
                          : `${coupon.applicableEditions.length} targeted`}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-espresso-main">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : formatINR(coupon.discountValue)}
                      {coupon.maximumDiscount !== undefined && (
                        <p className="text-[11px] text-espresso-soft">
                          Max {formatINR(coupon.maximumDiscount)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {coupon.usedCount}
                      {coupon.usageLimit !== undefined
                        ? ` / ${coupon.usageLimit}`
                        : ' / unlimited'}
                      <p className="text-[11px] text-espresso-soft">
                        {coupon.perCustomerLimit} per customer
                      </p>
                    </td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      <p>{formatDate(coupon.startDate)}</p>
                      <p className="text-espresso-soft">
                        to {formatDate(coupon.expiryDate)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={coupon.status} />
                    </td>
                    <td className="px-5 py-3">
                      <CouponActions
                        couponId={coupon.id}
                        isActive={coupon.isActive}
                      />
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
