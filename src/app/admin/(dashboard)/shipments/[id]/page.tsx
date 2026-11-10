import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { ShipmentStatusForm } from '@/components/admin/order-actions';
import { ShipmentEditForm } from '@/components/admin/shipment-edit-form';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';
import type { ShipmentStatusValue } from '@/lib/validations/admin-shipment';
import { getAdminShipmentById } from '@/services/admin-shipment.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shipment detail',
  robots: { index: false, follow: false, nocache: true },
};

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminShipmentDetailPage({
  params,
}: ShipmentDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (!admin) {
    redirect(`/admin/login?next=/admin/shipments/${encodeURIComponent(id)}`);
  }

  let shipment;
  try {
    shipment = await getAdminShipmentById(id);
  } catch (error) {
    console.error(
      'Failed to load shipment:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    notFound();
  }

  if (!shipment) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/shipments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-muted transition-colors hover:text-terracotta-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to shipments
      </Link>

      <AdminPageHeader
        eyebrow="Shipment"
        title={shipment.trackingNumber}
        description={`${shipment.courierName} / ${shipment.orderNumber || 'Order'}`}
        action={<AdminStatusBadge status={shipment.status} />}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Shipment details
            </h2>
            <div className="mt-3">
              <ShipmentEditForm
                shipmentId={shipment.id}
                courierName={shipment.courierName}
                trackingNumber={shipment.trackingNumber}
                trackingUrl={shipment.trackingUrl}
                shippingFee={shipment.shippingFee}
                dispatchDate={shipment.dispatchDate}
              />
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Status history
            </h2>
            {shipment.statusHistory.length === 0 ? (
              <p className="mt-3 text-sm text-espresso-muted">
                No status history recorded.
              </p>
            ) : (
              <ol className="mt-4 space-y-3 border-l border-border pl-4">
                {shipment.statusHistory.map((entry, index) => (
                  <li key={`${entry.status}-${entry.timestamp}-${index}`}>
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge status={entry.status} />
                      <span className="text-[11px] text-espresso-soft">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="mt-1 text-xs text-espresso-muted">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4 border-t border-border-subtle pt-4">
              <p className="text-xs font-semibold text-espresso-main">
                Update shipment status
              </p>
              <ShipmentStatusForm
                shipmentId={shipment.id}
                currentStatus={shipment.status as ShipmentStatusValue}
              />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Order
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-espresso-soft">Number</dt>
                <dd>
                  <Link
                    href={`/admin/orders/${shipment.orderId}`}
                    className="text-terracotta-700 hover:underline"
                  >
                    {shipment.orderNumber || 'View order'}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-espresso-soft">Customer</dt>
                <dd className="text-right text-espresso-main">
                  {shipment.customerName || '-'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-espresso-soft">Email</dt>
                <dd className="break-all text-right text-espresso-main">
                  {shipment.customerEmail || '-'}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/orders/${shipment.orderId}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-terracotta-700 hover:underline"
            >
              Open order
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Tracking
            </h2>
            {shipment.trackingUrl ? (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 break-all text-sm text-terracotta-700 hover:underline"
              >
                {shipment.trackingUrl}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-espresso-muted">
                No tracking URL saved.
              </p>
            )}
            <p className="mt-3 text-[11px] text-espresso-soft">
              Created {formatDate(shipment.createdAt)}
            </p>
            {shipment.deliveryDate && (
              <p className="text-[11px] text-espresso-soft">
                Delivered {formatDate(shipment.deliveryDate)}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
