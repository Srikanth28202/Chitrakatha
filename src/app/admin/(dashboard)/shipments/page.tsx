import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Truck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate } from '@/lib/utils';
import {
  adminShipmentListQuerySchema,
  SHIPMENT_STATUSES,
  type AdminShipmentListQuery,
} from '@/lib/validations/admin-shipment';
import {
  listAdminShipments,
  type AdminShipmentListResult,
} from '@/services/admin-shipment.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shipments',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminShipmentListQuery = {
  q: undefined,
  status: 'all',
  page: 1,
  limit: 20,
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface ShipmentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function statusLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminShipmentsPage({
  searchParams,
}: ShipmentsPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/shipments');
  }

  const params = await searchParams;
  const parsed = adminShipmentListQuerySchema.safeParse(flattenSearchParams(params));
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminShipmentListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: {
      all: 0,
      manifested: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      returned: 0,
      failed: 0,
    },
  };
  let loadError: string | null = null;

  try {
    result = await listAdminShipments(query);
  } catch (error) {
    console.error(
      'Failed to load shipments:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load shipments from the database. Please try again.';
  }

  const baseParams = new URLSearchParams();
  if (query.q) baseParams.set('q', query.q);
  if (query.status !== 'all') baseParams.set('status', query.status);

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams(baseParams);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/shipments?${queryString}` : '/admin/shipments';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Operations"
        title="Shipments"
        description="Track dispatched parcels and keep delivery status in sync with orders."
      />

      <form
        method="get"
        action="/admin/shipments"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-3">
            <label htmlFor="shipment-search" className="sr-only">
              Search shipments
            </label>
            <input
              id="shipment-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Courier or tracking number"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="shipment-status" className="sr-only">
              Shipment status
            </label>
            <select
              id="shipment-status"
              name="status"
              defaultValue={query.status}
              className={inputClass}
            >
              <option value="all">All statuses</option>
              {SHIPMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Link
            href="/admin/shipments"
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
        <div className="border-b border-border-subtle px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-espresso-dark">
            {result.total} {result.total === 1 ? 'shipment' : 'shipments'}
          </h2>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No shipments found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Create a shipment from an order detail page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Tracking</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Courier</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/shipments/${shipment.id}`}
                        className="font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                      >
                        {shipment.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${shipment.orderId}`}
                        className="text-espresso-muted hover:text-terracotta-700"
                      >
                        {shipment.orderNumber || 'View order'}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-espresso-main">{shipment.customerName || '-'}</p>
                      <p className="text-xs text-espresso-soft">
                        {shipment.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {shipment.courierName}
                    </td>
                    <td className="px-5 py-3">
                      <AdminStatusBadge status={shipment.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      {formatDate(shipment.createdAt)}
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
