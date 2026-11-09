import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { EditionForm } from '@/components/admin/edition-form';
import { requireAdmin } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create edition',
  robots: { index: false, follow: false, nocache: true },
};

export default async function NewEditionPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login?next=/admin/editions/new');
  }

  return <EditionForm mode="create" />;
}
