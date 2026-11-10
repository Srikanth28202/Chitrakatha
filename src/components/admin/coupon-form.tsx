'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminCouponRecord } from '@/services/admin-coupon.service';
import {
  COUPON_DISCOUNT_TYPES,
  COUPON_PURCHASE_TYPES,
  type CouponDiscountTypeValue,
  type CouponPurchaseTypeValue,
} from '@/lib/validations/admin-coupon';

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface EditionOption {
  id: string;
  titleEn: string;
  month: string;
  year: number;
  status: string;
}

interface CouponFormProps {
  coupon?: AdminCouponRecord;
}

function toLocalDateTime(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [editions, setEditions] = useState<EditionOption[]>([]);
  const [editionsError, setEditionsError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    discountType: (coupon?.discountType ?? 'percentage') as CouponDiscountTypeValue,
    discountValue: coupon ? String(coupon.discountValue) : '',
    maximumDiscount:
      coupon?.maximumDiscount !== undefined ? String(coupon.maximumDiscount) : '',
    minimumOrderValue: coupon ? String(coupon.minimumOrderValue) : '0',
    usageLimit: coupon?.usageLimit !== undefined ? String(coupon.usageLimit) : '',
    perCustomerLimit: coupon ? String(coupon.perCustomerLimit) : '1',
    startDate: toLocalDateTime(coupon?.startDate),
    expiryDate: toLocalDateTime(coupon?.expiryDate),
    isActive: coupon?.isActive ?? true,
  });
  const [purchaseTypes, setPurchaseTypes] = useState<CouponPurchaseTypeValue[]>(
    coupon?.applicablePurchaseTypes ?? [...COUPON_PURCHASE_TYPES]
  );
  const [selectedEditions, setSelectedEditions] = useState<string[]>(
    coupon?.applicableEditions ?? []
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEditions() {
      try {
        const response = await fetch('/api/admin/editions?limit=100', {
          credentials: 'same-origin',
        });
        if (!response.ok) {
          setEditionsError('Unable to load editions for targeting.');
          return;
        }
        const body = (await response.json()) as {
          data?: EditionOption[];
        };
        if (!cancelled) setEditions(body.data ?? []);
      } catch {
        if (!cancelled) setEditionsError('Unable to load editions for targeting.');
      }
    }

    loadEditions();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function togglePurchaseType(value: CouponPurchaseTypeValue) {
    setPurchaseTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function toggleEdition(id: string) {
    setSelectedEditions((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (purchaseTypes.length === 0) {
      setMessage('Select at least one purchase type.');
      setBusy(false);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      ...(form.discountType === 'percentage' && form.maximumDiscount !== ''
        ? { maximumDiscount: Number(form.maximumDiscount) }
        : {}),
      minimumOrderValue: Number(form.minimumOrderValue || 0),
      ...(form.usageLimit !== '' ? { usageLimit: Number(form.usageLimit) } : {}),
      perCustomerLimit: Number(form.perCustomerLimit || 1),
      applicableEditions: selectedEditions,
      applicablePurchaseTypes: purchaseTypes,
      startDate: new Date(form.startDate).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),
      isActive: form.isActive,
    };

    try {
      const response = await fetch(
        coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons',
        {
          method: coupon ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string; details?: Record<string, string[]> } }
          | null;
        const detail = body?.error?.details
          ? Object.values(body.error.details).flat()[0]
          : undefined;
        setMessage(
          detail ?? body?.error?.message ?? 'Unable to save coupon.'
        );
        return;
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Coupon code
          </label>
          <input
            value={form.code}
            onChange={(event) => update('code', event.target.value.toUpperCase())}
            required
            minLength={3}
            maxLength={30}
            className={inputClass}
            placeholder="FESTIVE100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Discount type
          </label>
          <select
            value={form.discountType}
            onChange={(event) => {
              const nextType = event.target.value as CouponDiscountTypeValue;
              setForm((current) => ({
                ...current,
                discountType: nextType,
                // A discount cap only applies to percentage coupons.
                ...(nextType === 'flat' ? { maximumDiscount: '' } : {}),
              }));
            }}
            className={inputClass}
          >
            {COUPON_DISCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {humanize(type)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Discount value {form.discountType === 'percentage' ? '(%)' : '(INR)'}
          </label>
          <input
            value={form.discountValue}
            onChange={(event) => update('discountValue', event.target.value)}
            required
            type="number"
            min={0.01}
            step="0.01"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Maximum discount (INR)
          </label>
          <input
            value={form.maximumDiscount}
            onChange={(event) => update('maximumDiscount', event.target.value)}
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            placeholder="Only for percentage coupons"
            disabled={form.discountType === 'flat'}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Minimum order value (INR)
          </label>
          <input
            value={form.minimumOrderValue}
            onChange={(event) => update('minimumOrderValue', event.target.value)}
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Per-customer limit
          </label>
          <input
            value={form.perCustomerLimit}
            onChange={(event) => update('perCustomerLimit', event.target.value)}
            type="number"
            min={1}
            step={1}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Global usage limit
          </label>
          <input
            value={form.usageLimit}
            onChange={(event) => update('usageLimit', event.target.value)}
            type="number"
            min={coupon?.usedCount ?? 1}
            step={1}
            className={inputClass}
            placeholder="Unlimited"
          />
          {coupon && (
            <p className="mt-1 text-[11px] text-espresso-soft">
              Used {coupon.usedCount} time{coupon.usedCount === 1 ? '' : 's'}.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Status
          </label>
          <label className="flex items-center gap-2 rounded-paper border border-border px-3 py-2.5 text-sm text-espresso-main">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => update('isActive', event.target.checked)}
            />
            Active
          </label>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Starts
          </label>
          <input
            value={form.startDate}
            onChange={(event) => update('startDate', event.target.value)}
            required
            type="datetime-local"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Expires
          </label>
          <input
            value={form.expiryDate}
            onChange={(event) => update('expiryDate', event.target.value)}
            required
            type="datetime-local"
            className={inputClass}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold text-espresso-main">
          Applicable purchase types
        </legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {COUPON_PURCHASE_TYPES.map((type) => (
            <label
              key={type}
              className="inline-flex items-center gap-2 text-sm text-espresso-main"
            >
              <input
                type="checkbox"
                checked={purchaseTypes.includes(type)}
                onChange={() => togglePurchaseType(type)}
              />
              {humanize(type)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-espresso-main">
          Edition targeting
        </legend>
        <p className="mt-1 text-[11px] text-espresso-soft">
          Leave all unchecked to apply the coupon to every edition.
        </p>
        {editionsError && (
          <p className="mt-2 text-xs text-rose-700">{editionsError}</p>
        )}
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-paper border border-border p-2">
          {editions.length === 0 && !editionsError ? (
            <p className="px-2 py-1 text-xs text-espresso-soft">
              Loading editions...
            </p>
          ) : (
            editions.map((edition) => (
              <label
                key={edition.id}
                className="flex items-center gap-2 rounded-paper px-2 py-1.5 text-sm text-espresso-main hover:bg-canvas-paper"
              >
                <input
                  type="checkbox"
                  checked={selectedEditions.includes(edition.id)}
                  onChange={() => toggleEdition(edition.id)}
                />
                <span className="min-w-0 flex-1 truncate">{edition.titleEn}</span>
                <span className="text-[11px] uppercase text-espresso-soft">
                  {edition.month} {edition.year}
                </span>
              </label>
            ))
          )}
        </div>
      </fieldset>

      {message && (
        <p className="flex items-center gap-1.5 text-xs text-rose-700" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={busy}>
          {coupon ? 'Save coupon' : 'Create coupon'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/coupons')}
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
