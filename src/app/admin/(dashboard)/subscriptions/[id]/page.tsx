import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { SubscriptionActions } from '@/components/admin/subscription-actions';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import type { SubscriptionStatusValue } from '@/lib/validations/admin-subscription';
import { getAdminSubscriptionById } from '@/services/admin-subscription.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Subscription detail',
  robots: { index: false, follow: false, nocache: true },
};

interface SubscriptionDetailPageProps {
  params: Promise<{ id: string }>;
}

function humanize(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-xs font-medium text-espresso-soft">{label}</dt>
      <dd className="text-right text-sm text-espresso-main">{value}</dd>
    </div>
  );
}

export default async function AdminSubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (!admin) {
    redirect(`/admin/login?next=/admin/subscriptions/${encodeURIComponent(id)}`);
  }

  let subscription;
  try {
    subscription = await getAdminSubscriptionById(id);
  } catch (error) {
    console.error(
      'Failed to load subscription:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    notFound();
  }

  if (!subscription) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/subscriptions"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-muted transition-colors hover:text-terracotta-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to subscriptions
      </Link>

      <AdminPageHeader
        eyebrow="Subscription"
        title={subscription.planTitle}
        description={`${subscription.customer.name} / ${subscription.customer.email}`}
        action={<AdminStatusBadge status={subscription.status} />}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Plan and billing
            </h2>
            <dl className="mt-2 divide-y divide-border-subtle">
              <DetailRow label="Plan" value={subscription.planTitle} />
              <DetailRow
                label="Billing frequency"
                value={humanize(subscription.billingFrequency)}
              />
              <DetailRow
                label="Price per cycle"
                value={formatINR(subscription.pricePerCycle)}
              />
              <DetailRow
                label="Preferred language"
                value={humanize(subscription.preferredLanguage)}
              />
              <DetailRow
                label="Start date"
                value={formatDate(subscription.startDate)}
              />
              <DetailRow
                label="Next billing"
                value={formatDate(subscription.nextBillingDate)}
              />
              {subscription.pausedAt && (
                <DetailRow label="Paused at" value={formatDate(subscription.pausedAt)} />
              )}
              {subscription.cancelledAt && (
                <DetailRow
                  label="Cancelled at"
                  value={formatDate(subscription.cancelledAt)}
                />
              )}
            </dl>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Provider and consent
            </h2>
            <dl className="mt-2 divide-y divide-border-subtle">
              <DetailRow
                label="Razorpay subscription"
                value={
                  <span className="break-all text-xs">
                    {subscription.razorpaySubscriptionId ?? 'Not linked'}
                  </span>
                }
              />
              <DetailRow
                label="Razorpay customer"
                value={
                  <span className="break-all text-xs">
                    {subscription.razorpayCustomerId ?? 'Not linked'}
                  </span>
                }
              />
              <DetailRow
                label="Terms accepted"
                value={subscription.consent.termsAccepted ? 'Yes' : 'No'}
              />
              <DetailRow
                label="Accepted at"
                value={formatDate(subscription.consent.acceptedAt)}
              />
              {subscription.consent.ipAddress && (
                <DetailRow label="IP address" value={subscription.consent.ipAddress} />
              )}
            </dl>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Admin actions
            </h2>
            <div className="mt-3">
              <SubscriptionActions
                subscriptionId={subscription.id}
                status={subscription.status as SubscriptionStatusValue}
                hasProviderSubscription={Boolean(subscription.razorpaySubscriptionId)}
              />
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-card">
            <h2 className="font-serif text-lg font-semibold text-espresso-dark">
              Customer
            </h2>
            <dl className="mt-2 divide-y divide-border-subtle">
              <DetailRow label="Name" value={subscription.customer.name} />
              <DetailRow
                label="Email"
                value={
                  <a
                    href={`mailto:${subscription.customer.email}`}
                    className="break-all text-terracotta-700 hover:underline"
                  >
                    {subscription.customer.email}
                  </a>
                }
              />
              <DetailRow label="Phone" value={subscription.customer.phone} />
            </dl>
            <Link
              href={`/admin/customers/${encodeURIComponent(subscription.customer.email)}`}
              className="mt-3 inline-flex text-xs font-medium text-terracotta-700 hover:underline"
            >
              View customer history
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
