'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  redirectTo: string;
}

interface LoginErrorBody {
  error?: {
    message?: string;
  };
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as LoginErrorBody | null;
        setError(body?.error?.message ?? 'Unable to sign in. Please try again.');
        setPassword('');
        return;
      }

      setPassword('');
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-paper border border-terracotta-200 bg-terracotta-50 px-3.5 py-3 text-sm text-terracotta-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold uppercase tracking-widest text-espresso-soft"
        >
          Email address
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-faint"
            aria-hidden="true"
          />
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-paper border border-border bg-canvas-paper py-2.5 pl-10 pr-3.5 text-sm text-espresso-main placeholder:text-espresso-faint focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25"
            placeholder="curator@chitrakatha.art"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="admin-password"
          className="block text-xs font-semibold uppercase tracking-widest text-espresso-soft"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-faint"
            aria-hidden="true"
          />
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-paper border border-border bg-canvas-paper py-2.5 pl-10 pr-3.5 text-sm text-espresso-main placeholder:text-espresso-faint focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Signing in' : 'Sign in'}
      </Button>

      <p className="text-center text-xs leading-relaxed text-espresso-soft">
        Authorized personnel only. All sign-in attempts are rate limited.
      </p>
    </form>
  );
}
