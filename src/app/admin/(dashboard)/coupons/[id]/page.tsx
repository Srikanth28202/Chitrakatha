import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { AdminStatusBadge } from '@/components/admin/admin-status-badge';
import { CouponForm } from '@/components/admin/coupon-form';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminCouponById } from '@/services/admin-coupon.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit coupon',
  robots: { index: false, follow: false, nocache: true },
};

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditCouponPage({ params }: EditCouponPageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (!admin) {
    redirect(`/admin/login?next=/admin/coupons/${encodeURIComponent(id)}`);
  }

  let coupon;
  try {
    coupon = await getAdminCouponById(id);
  } catch (error) {
    console.error(
      'Failed to load coupon:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    notFound();
  }

  if (!coupon) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/admin/coupons"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-muted transition-colors hover:text-terracotta-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to coupons
      </Link>

      <AdminPageHeader
        eyebrow="Commerce"
        title={coupon.code}
        description="Update discount rules, limits and targeting."
        action={<AdminStatusBadge status={coupon.status} />}
      />

      <div className="rounded-warm border border-border bg-white p-5 shadow-card">
        <CouponForm coupon={coupon} />
      </div>
    </div>
  );
}
