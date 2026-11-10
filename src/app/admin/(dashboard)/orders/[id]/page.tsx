import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import {
  OrderActions,
  ShipmentCreateForm,
  ShipmentStatusForm,
} from '@/components/admin/order-actions';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import type { OrderStatusValue } from '@/lib/validations/admin-order';
import type { ShipmentStatusValue } from '@/lib/validations/admin-shipment';
import { getAdminOrderById } from '@/services/admin-order.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order detail',
  robots: { index: false, follow: false, nocache: true },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-xs font-medium text-espresso-soft">{label}</dt>
      <dd className="text-right text-sm text-espresso-main">{value}</dd>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (!admin) {
    redirect(`/admin/login?next=/admin/orders/${encodeURIComponent(id)}`);
  }

  let order;
  try {
    order = await getAdminOrderById(id);
  } catch (error) {
    console.error(
      'Failed to load order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    notFound();
  }

  if (!order) notFound();

  const canCreateShipment = order.orderStatus !== 'cancelled';

  return (
    <div className="space-y-5">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-muted transition-colors hover:text-terracotta-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to orders
      </Link>

      <AdminPageHeader
        eyebrow="Order"
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)} for ${order.customer.name}`}
        action={
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={order.paymentStatus} />
            <AdminStatusBadge status={order.orderStatus} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-warm border border-border bg-white shadow-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Items
              </h2>
            </div>
            <ul className="divide-y divide-border-subtle">
              {order.items.map((item) => (
                <li key={`${item.editionId}-${item.language}`} className="flex gap-4 px-5 py-4">
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt=""
                      className="h-20 w-14 shrink-0 rounded-paper border border-border object-cover"
                    />
                  ) : (
                    <div className="h-20 w-14 shrink-0 rounded-paper border border-border bg-canvas-paper" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-espresso-main">{item.titleEn}</p>
                    <p className="text-sm text-espresso-muted">{item.titleKn}</p>
                    <p className="mt-1 text-xs text-espresso-soft">
                      {item.language.toUpperCase()} / {item.quantity} x{' '}
                      {formatINR(item.unitPrice)}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium text-espresso-main">
                    {formatINR(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-warm border border-border bg-white p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Customer
              </h2>
              <dl className="mt-2 divide-y divide-border-subtle">
                <DetailRow label="Name" value={order.customer.name} />
                <DetailRow
                  label="Email"
                  value={
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-terracotta-700 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  }
                />
                <DetailRow label="Phone" value={order.customer.phone} />
              </dl>
              <Link
                href={`/admin/customers/${encodeURIComponent(order.customer.email)}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-terracotta-700 hover:underline"
              >
                View customer history
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </section>

            <section className="rounded-warm border border-border bg-white p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Delivery address
              </h2>
              <address className="mt-3 space-y-1 text-sm not-italic text-espresso-main">
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
                <p>{order.address.country}</p>
              </address>
            </section>
          </div>

          <section className="rounded-warm border border-border bg-white shadow-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Pricing
              </h2>
            </div>
            <dl className="px-5 py-2">
              <DetailRow label="Subtotal" value={formatINR(order.pricing.basePrice)} />
              <DetailRow
                label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}
                value={`- ${formatINR(order.pricing.discountAmount)}`}
              />
              <DetailRow label="Shipping" value={formatINR(order.pricing.shippingFee)} />
              <DetailRow label="Tax" value={formatINR(order.pricing.taxAmount)} />
              <div className="border-t border-border-subtle">
                <DetailRow
                  label="Total"
                  value={
                    <span className="font-serif text-lg font-semibold text-espresso-dark">
                      {formatINR(order.pricing.totalAmount)}
                    </span>
                  }
                />
              </div>
            </dl>
          </section>

          <section className="rounded-warm border border-border bg-white shadow-card">
            <div className="border-b border-border-subtle px-5 py-4">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Shipments
              </h2>
            </div>
            {order.shipments.length === 0 ? (
              <p className="px-5 py-8 text-sm text-espresso-muted">
                No shipments have been created for this order.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {order.shipments.map((shipment) => (
                  <li key={shipment.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-espresso-main">
                          {shipment.courierName}
                        </p>
                        <p className="text-xs text-espresso-soft">
                          Tracking: {shipment.trackingNumber}
                        </p>
                        {shipment.trackingUrl && (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-terracotta-700 hover:underline"
                          >
                            Track shipment
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                      <AdminStatusBadge status={shipment.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-espresso-soft">
                      <span>Created {formatDate(shipment.createdAt)}</span>
                      {shipment.dispatchDate && (
                        <span>Dispatched {formatDate(shipment.dispatchDate)}</span>
                      )}
                      {shipment.deliveryDate && (
                        <span>Delivered {formatDate(shipment.deliveryDate)}</span>
                      )}
                    </div>
                    <ShipmentStatusForm
                      shipmentId={shipment.id}
                      currentStatus={shipment.status as ShipmentStatusValue}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Order actions
            </h2>
            <div className="mt-3">
              <OrderActions
                orderId={order.id}
                orderStatus={order.orderStatus as OrderStatusValue}
                paymentStatus={order.paymentStatus}
                notes={order.notes}
                canRefund={order.paymentStatus === 'captured'}
              />
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Payments
            </h2>
            {order.payments.length === 0 ? (
              <p className="mt-3 text-sm text-espresso-muted">
                No payment attempts recorded.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {order.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="rounded-paper border border-border-subtle p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-espresso-main">
                        {formatINR(payment.amount)}
                      </span>
                      <AdminStatusBadge status={payment.status} />
                    </div>
                    <p className="mt-1 break-all text-[11px] text-espresso-soft">
                      {payment.providerPaymentId ?? payment.providerOrderId ?? payment.id}
                    </p>
                    <p className="mt-1 text-[11px] text-espresso-soft">
                      {formatDate(payment.createdAt)}
                    </p>
                    {payment.failureReason && (
                      <p className="mt-1 text-[11px] text-rose-700">
                        {payment.failureReason}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {canCreateShipment && (
            <section className="rounded-warm border border-border bg-white p-5 shadow-card">
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Add shipment
              </h2>
              <div className="mt-3">
                <ShipmentCreateForm orderId={order.id} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
