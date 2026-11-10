'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_LANGUAGES } from '@/lib/validations/admin-settings';
import type { BusinessSettings } from '@/services/business-settings.service';

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

interface SettingsFormProps {
  settings: BusinessSettings;
}

function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessNameEn: settings.businessName.en,
    businessNameKn: settings.businessName.kn,
    deliveryRegions: settings.deliveryRegions.join(', '),
    serviceablePincodes: settings.serviceablePincodes.join('\n'),
    freeShippingThreshold: String(
      settings.shippingConfiguration.freeShippingThreshold
    ),
    standardFee: String(settings.shippingConfiguration.standardFee),
    expressFee: String(settings.shippingConfiguration.expressFee),
    email: settings.contactInformation.email,
    phone: settings.contactInformation.phone,
    address: settings.contactInformation.address,
  });
  const [languages, setLanguages] = useState<string[]>(
    settings.supportedLanguages
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleLanguage(language: string) {
    setLanguages((current) =>
      current.includes(language)
        ? current.filter((item) => item !== language)
        : [...current, language]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (languages.length === 0) {
      setIsError(true);
      setMessage('Select at least one supported language.');
      setBusy(false);
      return;
    }

    const payload = {
      businessName: {
        en: form.businessNameEn,
        kn: form.businessNameKn,
      },
      supportedLanguages: languages,
      deliveryRegions: form.deliveryRegions
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      serviceablePincodes: form.serviceablePincodes
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean),
      shippingConfiguration: {
        freeShippingThreshold: Number(form.freeShippingThreshold),
        standardFee: Number(form.standardFee),
        expressFee: Number(form.expressFee),
      },
      contactInformation: {
        email: form.email,
        phone: form.phone,
        address: form.address,
      },
      currency: 'INR',
    };

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: { message?: string; details?: Record<string, string[]> } }
          | null;
        const detail = body?.error?.details
          ? Object.values(body.error.details).flat()[0]
          : undefined;
        setIsError(true);
        setMessage(detail ?? body?.error?.message ?? 'Unable to save settings.');
        return;
      }

      setIsError(false);
      setMessage('Settings saved.');
      router.refresh();
    } catch {
      setIsError(true);
      setMessage('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h2 className="font-serif text-lg font-semibold text-espresso-dark">
          Business identity
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Business name (English)
            </label>
            <input
              value={form.businessNameEn}
              onChange={(event) => update('businessNameEn', event.target.value)}
              required
              maxLength={160}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Business name (Kannada)
            </label>
            <input
              value={form.businessNameKn}
              onChange={(event) => update('businessNameKn', event.target.value)}
              required
              maxLength={160}
              className={inputClass}
            />
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-espresso-main">
            Supported languages
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {BUSINESS_LANGUAGES.map((language) => (
              <label
                key={language}
                className="inline-flex items-center gap-2 text-sm text-espresso-main"
              >
                <input
                  type="checkbox"
                  checked={languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                />
                {humanize(language)}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="border-t border-border-subtle pt-5">
        <h2 className="font-serif text-lg font-semibold text-espresso-dark">
          Delivery and shipping
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Free shipping threshold (INR)
            </label>
            <input
              value={form.freeShippingThreshold}
              onChange={(event) =>
                update('freeShippingThreshold', event.target.value)
              }
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Standard shipping fee (INR)
            </label>
            <input
              value={form.standardFee}
              onChange={(event) => update('standardFee', event.target.value)}
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Express shipping fee (INR)
            </label>
            <input
              value={form.expressFee}
              onChange={(event) => update('expressFee', event.target.value)}
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Delivery regions
          </label>
          <input
            value={form.deliveryRegions}
            onChange={(event) => update('deliveryRegions', event.target.value)}
            required
            className={inputClass}
            placeholder="Karnataka, Pan-India"
          />
          <p className="mt-1 text-[11px] text-espresso-soft">
            Separate regions with commas.
          </p>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Serviceable pincodes
          </label>
          <textarea
            value={form.serviceablePincodes}
            onChange={(event) => update('serviceablePincodes', event.target.value)}
            rows={5}
            className={inputClass}
            placeholder={'560004\n560038'}
          />
          <p className="mt-1 text-[11px] text-espresso-soft">
            One 6-digit pincode per line, or separated by commas. Leave empty to
            allow the configured delivery regions.
          </p>
        </div>
      </section>

      <section className="border-t border-border-subtle pt-5">
        <h2 className="font-serif text-lg font-semibold text-espresso-dark">
          Contact information
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Support email
            </label>
            <input
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              required
              type="email"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-espresso-main">
              Support phone
            </label>
            <input
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-espresso-main">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(event) => update('address', event.target.value)}
            required
            rows={3}
            maxLength={500}
            className={inputClass}
          />
        </div>
      </section>

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

      <Button type="submit" isLoading={busy}>
        Save settings
      </Button>
    </form>
  );
}
