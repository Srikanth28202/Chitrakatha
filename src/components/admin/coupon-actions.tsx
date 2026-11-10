'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface CouponActionsProps {
  couponId: string;
  isActive: boolean;
}

export function CouponActions({ couponId, isActive }: CouponActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<'toggle' | 'delete' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle() {
    setBusy('toggle');
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setMessage(body?.error?.message ?? 'Unable to update coupon.');
        return;
      }

      router.refresh();
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;

    setBusy('delete');
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setMessage(body?.error?.message ?? 'Unable to delete coupon.');
        return;
      }

      router.refresh();
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleToggle}
          isLoading={busy === 'toggle'}
          disabled={busy !== null}
        >
          {isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-rose-700 hover:text-rose-800"
          onClick={handleDelete}
          isLoading={busy === 'delete'}
          disabled={busy !== null}
        >
          Delete
        </Button>
      </div>
      {message && <p className="text-right text-[11px] text-rose-700">{message}</p>}
    </div>
  );
}
