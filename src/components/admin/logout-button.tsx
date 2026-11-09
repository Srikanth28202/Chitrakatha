'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Clearing the cookie client-side is best-effort; redirect regardless.
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="md"
      isLoading={isSigningOut}
      leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
      onClick={handleSignOut}
    >
      {isSigningOut ? 'Signing out' : 'Sign out'}
    </Button>
  );
}
