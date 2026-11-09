'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditionActionsProps {
  id: string;
  status: string;
}

export function EditionActions({ id, status }: EditionActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<'archive' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    setBusy('archive');
    setError(null);
    try {
      const response = await fetch(`/api/admin/editions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? 'Unable to archive edition');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Permanently delete this edition? This action cannot be undone.'
    );
    if (!confirmed) return;

    setBusy('delete');
    setError(null);
    try {
      const response = await fetch(`/api/admin/editions/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? 'Unable to delete edition');
        return;
      }

      router.push('/admin/editions');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-700" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {status !== 'archived' && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={busy === 'archive'}
            leftIcon={<Archive className="h-4 w-4" aria-hidden="true" />}
            onClick={handleArchive}
          >
            Archive
          </Button>
        )}
        <Button
          type="button"
          variant="rose"
          size="sm"
          isLoading={busy === 'delete'}
          leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
