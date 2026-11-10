import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { flattenSearchParams } from '@/lib/search-params';
import { formatDate, formatINR } from '@/lib/utils';
import {
  adminCustomerListQuerySchema,
  type AdminCustomerListQuery,
} from '@/lib/validations/admin-customer';
import {
  listAdminCustomers,
  type AdminCustomerListResult,
} from '@/services/admin-customer.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customers',
  robots: { index: false, follow: false, nocache: true },
};

const FALLBACK_QUERY: AdminCustomerListQuery = {
  q: undefined,
  page: 1,
  limit: 20,
};

interface CustomersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCustomersPage({
  searchParams,
}: CustomersPageProps) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/customers');
  }

  const params = await searchParams;
  const parsed = adminCustomerListQuerySchema.safeParse(flattenSearchParams(params));
  const query = parsed.success ? parsed.data : FALLBACK_QUERY;

  let result: AdminCustomerListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
  };
  let loadError: string | null = null;

  try {
    result = await listAdminCustomers(query);
  } catch (error) {
    console.error(
      'Failed to load customers:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load customers from the database. Please try again.';
  }

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams();
    if (query.q) nextParams.set('q', query.q);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/customers?${queryString}` : '/admin/customers';
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Relationships"
        title="Customers"
        description="Customers who have placed orders, including contact and spend history."
      />

      <form
        method="get"
        action="/admin/customers"
        className="rounded-warm border border-border bg-white p-4 shadow-subtle"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <input
              id="customer-search"
              name="q"
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Name, email or phone"
              className="w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25"
            />
          </div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center rounded-paper border border-border px-3 py-2 text-xs font-medium text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main"
          >
            Reset
          </Link>
          <button
            type="submit"
            className="inline-flex items-center rounded-paper bg-terracotta-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
          >
            Search
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
            {result.total} {result.total === 1 ? 'customer' : 'customers'}
          </h2>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No customers found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Customers appear after their first order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Spent</th>
                  <th className="px-5 py-3 font-semibold">Last order</th>
                  <th className="px-5 py-3 font-semibold">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((customer) => (
                  <tr key={customer.email} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                        className="font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                      >
                        {customer.name || customer.email}
                      </Link>
                      <p className="text-xs text-espresso-soft">{customer.email}</p>
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {customer.orderCount} / {customer.paidOrderCount} paid
                    </td>
                    <td className="px-5 py-3 font-medium text-espresso-main">
                      {formatINR(customer.totalSpent)}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-espresso-muted">
                        {customer.lastOrderNumber}
                      </p>
                      <p className="text-[11px] text-espresso-soft">
                        {formatDate(customer.lastOrderAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={customer.registered ? 'sage' : 'paper'}>
                        {customer.registered ? 'Registered' : 'Guest'}
                      </Badge>
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
