import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { SettingsForm } from '@/components/admin/settings-form';
import { requireAdmin } from '@/lib/auth/guards';
import { getBusinessSettings } from '@/services/business-settings.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect('/admin/login?next=/admin/settings');
  }

  const settings = await getBusinessSettings();

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Business settings"
        description="Shared configuration used by checkout, shipping validation and customer-facing contact details."
      />

      <div className="rounded-warm border border-border bg-white p-5 shadow-card">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
