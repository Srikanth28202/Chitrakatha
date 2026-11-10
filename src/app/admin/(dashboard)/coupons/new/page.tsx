import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { CouponForm } from '@/components/admin/coupon-form';
import { requireAdmin } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New coupon',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminNewCouponPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/coupons/new');
  }

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
        title="New coupon"
        description="Set a code, discount rules and the editions it should apply to."
      />

      <div className="rounded-warm border border-border bg-white p-5 shadow-card">
        <CouponForm />
      </div>
    </div>
  );
}
