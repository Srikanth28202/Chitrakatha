'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SubscriptionStatusValue } from '@/lib/validations/admin-subscription';

const ALLOWED_TRANSITIONS: Record<
  SubscriptionStatusValue,
  SubscriptionStatusValue[]
> = {
  pending: ['active', 'cancelled'],
  active: ['paused', 'cancelled', 'past_due'],
  paused: ['active', 'cancelled'],
  past_due: ['active', 'paused', 'cancelled'],
  cancelled: [],
};

const ACTION_LABELS: Record<string, string> = {
  active: 'Mark active',
  paused: 'Pause subscription',
  cancelled: 'Cancel subscription',
  past_due: 'Mark past due',
};

interface SubscriptionActionsProps {
  subscriptionId: string;
  status: SubscriptionStatusValue;
  hasProviderSubscription: boolean;
}

export function SubscriptionActions({
  subscriptionId,
  status,
  hasProviderSubscription,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<SubscriptionStatusValue | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const transitions = ALLOWED_TRANSITIONS[status] ?? [];

  async function handleUpdate(nextStatus: SubscriptionStatusValue) {
    if (
      nextStatus === 'cancelled' &&
      !window.confirm('Cancel this subscription? This cannot be undone here.')
    ) {
      return;
    }

    setBusy(nextStatus);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setIsError(true);
        setMessage(body?.error?.message ?? 'Unable to update subscription.');
        return;
      }

      setIsError(false);
      setMessage('Subscription updated.');
      router.refresh();
    } catch {
      setIsError(true);
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-espresso-muted">
        This subscription is cancelled and has no further admin actions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {hasProviderSubscription && (
        <p className="rounded-paper border border-border bg-canvas-paper px-3 py-2 text-xs text-espresso-muted">
          This subscription is linked to Razorpay. Pause, resume and cancel actions
          will first be sent to the payment provider.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {transitions.map((nextStatus) => (
          <Button
            key={nextStatus}
            type="button"
            size="sm"
            variant={nextStatus === 'cancelled' ? 'rose' : 'secondary'}
            isLoading={busy === nextStatus}
            disabled={busy !== null}
            onClick={() => handleUpdate(nextStatus)}
          >
            {ACTION_LABELS[nextStatus] ?? `Move to ${nextStatus}`}
          </Button>
        ))}
      </div>
      {message && (
        <p
          className={
            isError
              ? 'flex items-center gap-1.5 text-xs text-rose-700'
              : 'flex items-center gap-1.5 text-xs text-sage-700'
          }
          role="status"
        >
          {isError ? (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {message}
        </p>
      )}
    </div>
  );
}
