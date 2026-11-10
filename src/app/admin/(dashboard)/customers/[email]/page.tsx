import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import { getAdminCustomerByEmail } from '@/services/admin-customer.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer detail',
  robots: { index: false, follow: false, nocache: true },
};

interface CustomerDetailPageProps {
  params: Promise<{ email: string }>;
}

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function AdminCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const admin = await requireAdmin();
  const { email } = await params;

  if (!admin) {
    redirect(`/admin/login?next=/admin/customers/${encodeURIComponent(email)}`);
  }

  let customer;
  try {
    customer = await getAdminCustomerByEmail(email);
  } catch (error) {
    console.error(
      'Failed to load customer:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    notFound();
  }

  if (!customer) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-muted transition-colors hover:text-terracotta-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to customers
      </Link>

      <AdminPageHeader
        eyebrow="Customer"
        title={customer.name || customer.email}
        description={
          customer.registered
            ? 'Registered account with order and subscription history.'
            : 'Guest customer from order history.'
        }
        action={
          <Badge variant={customer.registered ? 'sage' : 'paper'}>
            {customer.registered ? 'Registered' : 'Guest'}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-warm border border-border bg-white p-4 shadow-subtle">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
            Total spent
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold text-espresso-dark">
            {formatINR(customer.totalSpent)}
          </p>
          <p className="text-xs text-espresso-soft">
            {customer.paidOrderCount} paid of {customer.orderCount} orders
          </p>
        </div>
        <div className="rounded-warm border border-border bg-white p-4 shadow-subtle">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
            First order
          </p>
          <p className="mt-2 text-sm text-espresso-main">
            {formatDate(customer.firstOrderAt)}
          </p>
        </div>
        <div className="rounded-warm border border-border bg-white p-4 shadow-subtle">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
            Last order
          </p>
          <p className="mt-2 text-sm text-espresso-main">
            {formatDate(customer.lastOrderAt)}
          </p>
          <p className="text-xs text-espresso-soft">{customer.lastOrderNumber}</p>
        </div>
        <div className="rounded-warm border border-border bg-white p-4 shadow-subtle">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
            Subscriptions
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold text-espresso-dark">
            {customer.subscriptions.length}
          </p>
          <p className="text-xs text-espresso-soft">
            {customer.preferredLanguage
              ? `Prefers ${customer.preferredLanguage.toUpperCase()}`
              : 'No language preference'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-warm border border-border bg-white shadow-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Orders
              </h2>
            </div>
            {customer.orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-espresso-muted">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-5 py-3 font-semibold">Total</th>
                      <th className="px-5 py-3 font-semibold">Payment</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-canvas-paper/60">
                        <td className="px-5 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-espresso-main hover:text-terracotta-700"
                          >
                            {order.orderNumber}
                          </Link>
                          <p className="text-[11px] text-espresso-soft">
                            {order.firstItemTitle}
                          </p>
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

          <section className="rounded-warm border border-border bg-white shadow-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Subscriptions
              </h2>
            </div>
            {customer.subscriptions.length === 0 ? (
              <p className="px-5 py-8 text-sm text-espresso-muted">
                No subscriptions yet.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {customer.subscriptions.map((subscription) => (
                  <li
                    key={subscription.id}
                    className="flex flex-wrap items-start justify-between gap-2 px-5 py-4"
                  >
                    <div>
                      <Link
                        href={`/admin/subscriptions/${subscription.id}`}
                        className="text-sm font-medium text-espresso-main hover:text-terracotta-700"
                      >
                        {humanize(subscription.plan)}
                      </Link>
                      <p className="text-xs text-espresso-soft">
                        {humanize(subscription.frequency)} /{' '}
                        {formatINR(subscription.pricePerCycle)}
                      </p>
                      <p className="text-[11px] text-espresso-soft">
                        Next billing {formatDate(subscription.nextBillingDate)}
                      </p>
                    </div>
                    <AdminStatusBadge status={subscription.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Contact
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 break-all text-terracotta-700 hover:underline"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {customer.email}
              </a>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-2 text-espresso-main hover:text-terracotta-700"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {customer.phone}
                </a>
              )}
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Saved addresses
            </h2>
            {customer.addresses.length === 0 ? (
              <p className="mt-2 text-sm text-espresso-muted">
                No addresses saved to an account.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {customer.addresses.map((address, index) => (
                  <li
                    key={`${address.postalCode}-${address.line1}-${index}`}
                    className="rounded-paper border border-border-subtle p-3 text-xs text-espresso-muted"
                  >
                    {address.isDefault && (
                      <Badge variant="sage" className="mb-1">
                        Default
                      </Badge>
                    )}
                    <p className="text-espresso-main">{address.line1}</p>
                    {address.line2 && <p>{address.line2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
