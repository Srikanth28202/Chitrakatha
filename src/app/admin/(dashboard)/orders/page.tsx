import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate, formatINR } from '@/lib/utils';
import {
  ADMIN_ORDER_SORTS,
  adminOrderListQuerySchema,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type AdminOrderListQuery,
} from '@/lib/validations/admin-order';
import {
  listAdminOrders,
  type AdminOrderListResult,
} from '@/services/admin-order.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Orders',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminOrderListQuery = {
  q: undefined,
  orderStatus: 'all',
  paymentStatus: 'all',
  from: undefined,
  to: undefined,
  sort: 'newest',
  page: 1,
  limit: 20,
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface OrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function statusLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/orders');
  }

  const params = await searchParams;
  const parsed = adminOrderListQuerySchema.safeParse(flattenSearchParams(params));
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminOrderListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: {
      all: 0,
      placed: 0,
      confirmed: 0,
      packed: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    },
    paymentCounts: {
      all: 0,
      pending: 0,
      authorized: 0,
      captured: 0,
      failed: 0,
      refunded: 0,
    },
  };
  let loadError: string | null = null;

  try {
    result = await listAdminOrders(query);
  } catch (error) {
    console.error(
      'Failed to load orders:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load orders from the database. Please try again.';
  }

  const baseParams = new URLSearchParams();
  if (query.q) baseParams.set('q', query.q);
  if (query.orderStatus !== 'all') baseParams.set('orderStatus', query.orderStatus);
  if (query.paymentStatus !== 'all') baseParams.set('paymentStatus', query.paymentStatus);
  if (query.from) baseParams.set('from', query.from.toISOString().slice(0, 10));
  if (query.to) baseParams.set('to', query.to.toISOString().slice(0, 10));
  if (query.sort !== 'newest') baseParams.set('sort', query.sort);

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams(baseParams);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/orders?${queryString}` : '/admin/orders';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Review payments, update fulfilment status and manage customer deliveries."
      />

      <form
        method="get"
        action="/admin/orders"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Order number, customer, email, pincode"
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="order-status" className="sr-only">
              Order status
            </label>
            <select
              id="order-status"
              name="orderStatus"
              defaultValue={query.orderStatus}
              className={inputClass}
            >
              <option value="all">All order statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="payment-status" className="sr-only">
              Payment status
            </label>
            <select
              id="payment-status"
              name="paymentStatus"
              defaultValue={query.paymentStatus}
              className={inputClass}
            >
              <option value="all">All payment statuses</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="order-from" className="sr-only">
              From date
            </label>
            <input
              id="order-from"
              name="from"
              type="date"
              defaultValue={query.from ? query.from.toISOString().slice(0, 10) : ''}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="order-to" className="sr-only">
              To date
            </label>
            <input
              id="order-to"
              name="to"
              type="date"
              defaultValue={query.to ? query.to.toISOString().slice(0, 10) : ''}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="order-sort" className="sr-only">
              Sort orders
            </label>
            <select
              id="order-sort"
              name="sort"
              defaultValue={query.sort}
              className={inputClass}
            >
              {ADMIN_ORDER_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {sort === 'newest'
                    ? 'Newest'
                    : sort === 'oldest'
                      ? 'Oldest'
                      : 'Highest value'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-paper border border-border px-3 py-2 text-xs font-medium text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="inline-flex items-center rounded-paper bg-terracotta-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
          >
            Apply filters
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-espresso-dark">
            {result.total} {result.total === 1 ? 'order' : 'orders'}
          </h2>
          <p className="text-xs text-espresso-soft">
            {result.paymentCounts.captured} paid / {result.statusCounts.all} total
          </p>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">No orders found</p>
            <p className="mt-1 text-sm text-espresso-muted">
              Orders will appear here once customers begin checking out.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((order) => (
                  <tr key={order.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-espresso-soft">
                        {order.itemCount} {order.itemCount === 1 ? 'line' : 'lines'}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-espresso-main">{order.customer.name}</p>
                      <p className="text-xs text-espresso-soft">{order.customer.email}</p>
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {order.quantity} box{order.quantity === 1 ? '' : 'es'}
                    </td>
                    <td className="px-5 py-3 font-medium text-espresso-main">
                      {formatINR(order.totalAmount)}
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      {formatDate(order.createdAt)}
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
