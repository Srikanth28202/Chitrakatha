import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getAdminSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login?next=/admin');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        <AdminSidebar
          admin={{ name: session.name ?? 'Administrator', email: session.email }}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
