import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Plus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { SummaryCard } from '@/components/admin/summary-card';
import { EditionStatusBadge } from '@/components/admin/edition-status-badge';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import { getAdminDashboardSummary } from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login?next=/admin');
  }

  const summary = await getAdminDashboardSummary();
  const { editions, orders, subscriptions, recentEditions } = summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso-soft">
            Overview
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold text-espresso-dark">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-espresso-muted">
            Welcome back, {admin.name || 'Administrator'}.
          </p>
        </div>
        <Link
          href="/admin/editions/new"
          className="inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New edition
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total editions"
          value={editions.total}
          hint={`${editions.draft} draft · ${editions.archived} archived`}
          icon={BookOpen}
          accent="espresso"
          href="/admin/editions"
        />
        <SummaryCard
          label="Active editions"
          value={editions.active}
          hint={`${editions.upcoming} upcoming · ${editions.soldOut} sold out`}
          icon={CheckCircle2}
          accent="sage"
          href="/admin/editions?status=active"
        />
        <SummaryCard
          label="Orders"
          value={orders.total}
          hint="All time orders"
          icon={ShoppingBag}
          accent="terracotta"
        />
        <SummaryCard
          label="Subscriptions"
          value={subscriptions.total}
          hint={`${subscriptions.active} active subscriptions`}
          icon={RefreshCw}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: 'Draft', value: editions.draft },
          { label: 'Upcoming', value: editions.upcoming },
          { label: 'Active', value: editions.active },
          { label: 'Sold out', value: editions.soldOut },
          { label: 'Archived', value: editions.archived },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-paper border border-border bg-white px-4 py-3 shadow-subtle"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
              {item.label}
            </p>
            <p className="mt-1 font-serif text-xl font-semibold text-espresso-dark">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {editions.lowStock > 0 && (
        <div className="flex items-start gap-2.5 rounded-paper border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">{editions.lowStock}</span>{' '}
            {editions.lowStock === 1 ? 'edition is' : 'editions are'} low on stock
            (20 units or fewer) among active and upcoming publications.
          </p>
        </div>
      )}

      <section className="rounded-warm border border-border bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-espresso-dark">
              Recent editions
            </h2>
            <p className="mt-0.5 text-xs text-espresso-muted">
              Latest publications from MongoDB
            </p>
          </div>
          <Link
            href="/admin/editions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 transition-colors hover:text-terracotta-800"
          >
            View all editions
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentEditions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-espresso-muted">
              No editions in the database yet.
            </p>
            <Link
              href="/admin/editions/new"
              className="mt-3 inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first edition
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Edition</th>
                  <th className="px-5 py-3 font-semibold">Period</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Dispatch</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentEditions.map((edition) => (
                  <tr key={edition.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/editions/${edition.id}`}
                        className="font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                      >
                        {edition.titleEn}
                      </Link>
                      <p className="font-kannada text-xs text-espresso-soft">
                        {edition.titleKn}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {edition.month} {edition.year}
                    </td>
                    <td className="px-5 py-3">
                      <EditionStatusBadge status={edition.status} />
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {formatINR(edition.price)}
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {formatDate(edition.dispatchDate)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/editions/${edition.id}/edit`}
                        className="text-xs font-semibold text-terracotta-700 transition-colors hover:text-terracotta-800"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
