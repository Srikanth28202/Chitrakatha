'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Package, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ORDER_STATUSES,
  type OrderStatusValue,
} from '@/lib/validations/admin-order';
import {
  SHIPMENT_STATUSES,
  type ShipmentStatusValue,
} from '@/lib/validations/admin-shipment';

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};

const ALLOWED_SHIPMENT_TRANSITIONS: Record<
  ShipmentStatusValue,
  ShipmentStatusValue[]
> = {
  manifested: ['in_transit', 'failed', 'returned'],
  in_transit: ['out_for_delivery', 'failed', 'returned'],
  out_for_delivery: ['delivered', 'failed', 'returned'],
  delivered: [],
  returned: [],
  failed: ['in_transit', 'returned'],
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface OrderActionsProps {
  orderId: string;
  orderStatus: OrderStatusValue;
  paymentStatus: string;
  notes?: string;
  canRefund: boolean;
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

function FeedbackMessage({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  return (
    <p
      className={
        feedback.type === 'success'
          ? 'flex items-center gap-1.5 text-xs text-sage-700'
          : 'flex items-center gap-1.5 text-xs text-rose-700'
      }
      role="status"
    >
      {feedback.type === 'success' ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {feedback.message}
    </p>
  );
}

async function readErrorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return body?.error?.message ?? fallback;
}

export function OrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  notes,
  canRefund,
}: OrderActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatusValue | ''>('');
  const [noteText, setNoteText] = useState(notes ?? '');
  const [busy, setBusy] = useState<'status' | 'notes' | 'refund' | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const nextStatuses = ALLOWED_ORDER_TRANSITIONS[orderStatus] ?? [];

  async function handleSave() {
    if (!status && noteText === (notes ?? '')) return;

    setBusy('status');
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...(status ? { orderStatus: status } : {}),
          ...(noteText !== (notes ?? '') ? { notes: noteText } : {}),
        }),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: await readErrorMessage(response, 'Unable to update order'),
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Order updated.' });
      setStatus('');
      router.refresh();
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setBusy(null);
    }
  }

  async function handleRefund() {
    const reason = window.prompt(
      'Enter the reason for this full refund. This will call Razorpay and cannot be undone.'
    );
    if (!reason?.trim()) return;

    setBusy('refund');
    setFeedback(null);

    try {
      const response = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ orderId, reason: reason.trim() }),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: await readErrorMessage(response, 'Unable to process refund'),
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Refund processed successfully.' });
      router.refresh();
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <label
            htmlFor="order-next-status"
            className="mb-1 block text-xs font-semibold text-espresso-main"
          >
            Fulfilment status
          </label>
          <select
            id="order-next-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatusValue | '')}
            className={inputClass}
            disabled={nextStatuses.length === 0}
          >
            <option value="">
              {nextStatuses.length === 0 ? 'No further transitions' : 'Keep current status'}
            </option>
            {nextStatuses.map((value) => (
              <option key={value} value={value}>
                {value
                  .split('_')
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="order-notes"
            className="mb-1 block text-xs font-semibold text-espresso-main"
          >
            Internal notes
          </label>
          <textarea
            id="order-notes"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            rows={3}
            maxLength={500}
            className={inputClass}
            placeholder="Dispatch notes, customer request, refund reference..."
          />
        </div>

        <FeedbackMessage feedback={feedback} />

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          isLoading={busy === 'status'}
          disabled={
            busy !== null || (!status && noteText === (notes ?? ''))
          }
        >
          Save updates
        </Button>

        {canRefund && (
          <div className="border-t border-border-subtle pt-4">
            <p className="text-xs font-semibold text-espresso-main">Payment refund</p>
            <p className="mt-1 text-xs text-espresso-muted">
              Issues a full Razorpay refund for this order. It cannot be reversed from
              this admin panel.
            </p>
            <Button
              type="button"
              variant="rose"
              size="sm"
              className="mt-2"
              onClick={handleRefund}
              isLoading={busy === 'refund'}
              disabled={busy !== null || paymentStatus !== 'captured'}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Refund payment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ShipmentCreateFormProps {
  orderId: string;
}

export function ShipmentCreateForm({ orderId }: ShipmentCreateFormProps) {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('India Post Speed Post');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingFee, setShippingFee] = useState('0');
  const [dispatchDate, setDispatchDate] = useState('');
  const [status, setStatus] = useState<ShipmentStatusValue>('manifested');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          orderId,
          courierName,
          trackingNumber,
          ...(trackingUrl ? { trackingUrl } : {}),
          shippingFee: Number(shippingFee),
          ...(dispatchDate ? { dispatchDate } : {}),
          status,
          ...(note ? { note } : {}),
        }),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: await readErrorMessage(response, 'Unable to create shipment'),
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Shipment created.' });
      setTrackingNumber('');
      setTrackingUrl('');
      setNote('');
      router.refresh();
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
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
            value={courierName}
            onChange={(event) => setCourierName(event.target.value)}
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
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
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
            value={trackingUrl}
            onChange={(event) => setTrackingUrl(event.target.value)}
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
            value={shippingFee}
            onChange={(event) => setShippingFee(event.target.value)}
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
            value={dispatchDate}
            onChange={(event) => setDispatchDate(event.target.value)}
            type="date"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Initial status
          </label>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ShipmentStatusValue)
            }
            className={inputClass}
          >
            {SHIPMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value
                  .split('_')
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-espresso-main">
          Note
        </label>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          className={inputClass}
          placeholder="Optional shipment note"
        />
      </div>
      <FeedbackMessage feedback={feedback} />
      <Button
        type="submit"
        size="sm"
        isLoading={busy}
        leftIcon={<Package className="h-3.5 w-3.5" aria-hidden="true" />}
      >
        Create shipment
      </Button>
    </form>
  );
}

interface ShipmentStatusFormProps {
  shipmentId: string;
  currentStatus: ShipmentStatusValue;
}

export function ShipmentStatusForm({
  shipmentId,
  currentStatus,
}: ShipmentStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ShipmentStatusValue | ''>('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const nextStatuses = ALLOWED_SHIPMENT_TRANSITIONS[currentStatus] ?? [];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) return;

    setBusy(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ status, ...(note ? { note } : {}) }),
      });

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: await readErrorMessage(response, 'Unable to update shipment'),
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Shipment updated.' });
      setStatus('');
      setNote('');
      router.refresh();
    } catch {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  if (nextStatuses.length === 0) {
    return <p className="text-xs text-espresso-soft">No further shipment transitions.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2">
      <div className="min-w-36 flex-1">
        <label className="mb-1 block text-[11px] font-semibold text-espresso-main">
          Next status
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ShipmentStatusValue | '')}
          className={inputClass}
          required
        >
          <option value="">Select status</option>
          {nextStatuses.map((value) => (
            <option key={value} value={value}>
              {value
                .split('_')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-40 flex-[2]">
        <label className="mb-1 block text-[11px] font-semibold text-espresso-main">
          Note
        </label>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          className={inputClass}
          placeholder="Optional"
        />
      </div>
      <Button type="submit" size="sm" isLoading={busy}>
        Update
      </Button>
      {feedback && (
        <div className="w-full">
          <FeedbackMessage feedback={feedback} />
        </div>
      )}
    </form>
  );
}
