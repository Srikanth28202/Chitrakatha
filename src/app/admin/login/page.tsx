import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Feather, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { LoginForm } from '@/components/admin/login-form';
import { sanitizeAdminRedirect } from '@/lib/validations/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface AdminLoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const redirectTo = sanitizeAdminRedirect(rawNext);

  return (
    <Container width="narrow" className="flex items-center justify-center py-16 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-warm border border-terracotta-200 bg-terracotta-50 text-terracotta-700 shadow-subtle">
            <Feather className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-espresso-soft">
            Chitrakatha Curatorial Desk
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso-dark">
            Admin Sign In
          </h1>
          <p className="mt-2 text-sm text-espresso-muted">
            Secure access for authorized administrators only.
          </p>
        </div>

        <div className="rounded-warm border border-border bg-white p-6 shadow-card sm:p-8">
          <LoginForm redirectTo={redirectTo} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 text-xs text-espresso-soft">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to website
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />
            Protected session
          </span>
        </div>
      </div>
    </Container>
  );
}
