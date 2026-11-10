'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface ShipmentEditFormProps {
  shipmentId: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingFee: number;
  dispatchDate?: string;
}

export function ShipmentEditForm({
  shipmentId,
  courierName,
  trackingNumber,
  trackingUrl,
  shippingFee,
  dispatchDate,
}: ShipmentEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    courierName,
    trackingNumber,
    trackingUrl: trackingUrl ?? '',
    shippingFee: String(shippingFee),
    dispatchDate: dispatchDate ? dispatchDate.slice(0, 10) : '',
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          courierName: form.courierName,
          trackingNumber: form.trackingNumber,
          trackingUrl: form.trackingUrl,
          shippingFee: Number(form.shippingFee),
          ...(form.dispatchDate ? { dispatchDate: form.dispatchDate } : {}),
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setIsError(true);
        setMessage(body?.error?.message ?? 'Unable to update shipment.');
        return;
      }

      setIsError(false);
      setMessage('Shipment details updated.');
      router.refresh();
    } catch {
      setIsError(true);
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Courier
          </label>
          <input
            value={form.courierName}
            onChange={(event) => update('courierName', event.target.value)}
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Tracking number
          </label>
          <input
            value={form.trackingNumber}
            onChange={(event) => update('trackingNumber', event.target.value)}
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Tracking URL
          </label>
          <input
            value={form.trackingUrl}
            onChange={(event) => update('trackingUrl', event.target.value)}
            type="url"
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Shipping fee
          </label>
          <input
            value={form.shippingFee}
            onChange={(event) => update('shippingFee', event.target.value)}
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Dispatch date
          </label>
          <input
            value={form.dispatchDate}
            onChange={(event) => update('dispatchDate', event.target.value)}
            type="date"
            className={inputClass}
          />
        </div>
      </div>
      {message && (
        <p className={isError ? 'text-xs text-rose-700' : 'text-xs text-sage-700'}>
          {message}
        </p>
      )}
      <Button type="submit" size="sm" isLoading={busy}>
        Save shipment details
      </Button>
    </form>
  );
}
