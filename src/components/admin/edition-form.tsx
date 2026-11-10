'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  EDITION_ITEM_TYPES,
  EDITION_LANGUAGES,
  EDITION_MONTHS,
  EDITION_STATUSES,
  type AdminEditionFormData,
  type AdminEditionFormItem,
  type EditionItemTypeValue,
  type EditionStatusValue,
} from '@/lib/validations/admin-edition';

interface EditionFormProps {
  mode: 'create' | 'edit';
  initialData?: AdminEditionFormData;
}

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3.5 py-2.5 text-sm text-espresso-main placeholder:text-espresso-faint focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

const ITEM_TYPE_LABELS: Record<EditionItemTypeValue, string> = {
  story_letter: 'Story letter',
  art_card: 'Art card',
  sticker_sheet: 'Sticker sheet',
  bookmark: 'Bookmark',
  puzzle: 'Puzzle',
  colouring_sheet: 'Colouring sheet',
  keepsake: 'Keepsake',
};

const STATUS_LABELS: Record<EditionStatusValue, string> = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  sold_out: 'Sold out',
  archived: 'Archived',
};

const LANGUAGE_LABELS: Record<string, string> = {
  kannada: 'Kannada',
  english: 'English',
  bilingual: 'Bilingual',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function monthDates(year: number, monthNumber: number) {
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return {
    startDate: `${year}-${pad(monthNumber)}-01`,
    endDate: `${year}-${pad(monthNumber)}-${pad(lastDay)}`,
    dispatchDate: `${year}-${pad(monthNumber)}-05`,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

function buildSlug(titleEn: string, month: string, year: number): string {
  const title = slugify(titleEn);
  const suffix = `${slugify(month)}-${year}`;
  return title ? `${title}-${suffix}` : suffix;
}

function createEmptyItem(): AdminEditionFormItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemType: 'keepsake',
    nameEn: '',
    nameKn: '',
    descEn: '',
    descKn: '',
  };
}

function createRowKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultFormData(): AdminEditionFormData {
  const now = new Date();
  const monthNumber = now.getMonth() + 1;
  const month = EDITION_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return {
    month,
    monthNumber,
    year,
    slug: '',
    titleEn: '',
    titleKn: '',
    descriptionEn: '',
    descriptionKn: '',
    themeEn: '',
    themeKn: '',
    seasonEn: '',
    seasonKn: '',
    curatorEn: '',
    curatorKn: '',
    status: 'draft',
    price: 0,
    recurringPrice: 0,
    stock: 0,
    ...monthDates(year, monthNumber),
    availableLanguages: ['bilingual'],
    images: {
      coverUrl: '',
      bannerUrl: '',
      galleryUrls: [],
    },
    includedItems: [],
  };
}

function formatDetails(details: unknown): string {
  if (!details || typeof details !== 'object') return '';
  const parts: string[] = [];

  for (const [key, value] of Object.entries(details as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const message of value) {
        parts.push(`${key}: ${String(message)}`);
      }
    } else if (value) {
      parts.push(`${key}: ${String(value)}`);
    }
  }

  return parts.join(' · ');
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-semibold uppercase tracking-wider text-espresso-soft"
      >
        {label}
        {required && <span className="text-terracotta-600"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-espresso-faint">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-warm border border-border bg-white p-5 shadow-subtle sm:p-6">
      <div className="mb-5 border-b border-border-subtle pb-3">
        <h2 className="font-serif text-xl font-semibold text-espresso-dark">{title}</h2>
        {description && <p className="mt-1 text-sm text-espresso-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function EditionForm({ mode, initialData }: EditionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AdminEditionFormData>(
    () => initialData ?? createDefaultFormData()
  );
  const [galleryText, setGalleryText] = useState(() =>
    (initialData?.images.galleryUrls ?? []).join('\n')
  );
  // Stable React keys for included-item rows, tracked separately from the
  // editable `id` field so typing an item's internal ID does not remount
  // the row and drop focus.
  const [itemRowKeys, setItemRowKeys] = useState<string[]>(() =>
    (initialData?.includedItems ?? []).map(() => createRowKey())
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelHref =
    mode === 'edit' && initialData?.id
      ? `/admin/editions/${initialData.id}`
      : '/admin/editions';

  function updateField<K extends keyof AdminEditionFormData>(
    key: K,
    value: AdminEditionFormData[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleTitleEnChange(value: string) {
    setForm((previous) => ({
      ...previous,
      titleEn: value,
      slug: slugTouched ? previous.slug : buildSlug(value, previous.month, previous.year),
    }));
  }

  function handleMonthChange(monthName: string) {
    const monthNumber = EDITION_MONTHS.indexOf(monthName as (typeof EDITION_MONTHS)[number]) + 1;
    setForm((previous) => ({
      ...previous,
      month: monthName,
      monthNumber,
      ...monthDates(previous.year, monthNumber),
      slug: slugTouched
        ? previous.slug
        : buildSlug(previous.titleEn, monthName, previous.year),
    }));
  }

  function handleYearChange(year: number) {
    setForm((previous) => ({
      ...previous,
      year,
      ...monthDates(year, previous.monthNumber),
      slug: slugTouched
        ? previous.slug
        : buildSlug(previous.titleEn, previous.month, year),
    }));
  }

  function handleGenerateSlug() {
    setSlugTouched(true);
    setForm((previous) => ({
      ...previous,
      slug: buildSlug(previous.titleEn, previous.month, previous.year),
    }));
  }

  function updateImage(key: 'coverUrl' | 'bannerUrl', value: string) {
    setForm((previous) => ({
      ...previous,
      images: { ...previous.images, [key]: value },
    }));
  }

  function toggleLanguage(language: string) {
    setForm((previous) => {
      const hasLanguage = previous.availableLanguages.includes(
        language as (typeof previous.availableLanguages)[number]
      );

      if (hasLanguage && previous.availableLanguages.length === 1) {
        return previous;
      }

      const nextLanguages = hasLanguage
        ? previous.availableLanguages.filter((value) => value !== language)
        : [...previous.availableLanguages, language as (typeof previous.availableLanguages)[number]];

      return { ...previous, availableLanguages: nextLanguages };
    });
  }

  function addItem() {
    const rowKey = createRowKey();
    setItemRowKeys((previous) => [...previous, rowKey]);
    setForm((previous) => ({
      ...previous,
      includedItems: [...previous.includedItems, createEmptyItem()],
    }));
  }

  function updateItem(index: number, patch: Partial<AdminEditionFormItem>) {
    setForm((previous) => ({
      ...previous,
      includedItems: previous.includedItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function removeItem(index: number) {
    setItemRowKeys((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    setForm((previous) => ({
      ...previous,
      includedItems: previous.includedItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const galleryUrls = galleryText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const { id: _id, ...rest } = form;

    const payload = {
      ...rest,
      price: Number(rest.price),
      recurringPrice: Number(rest.recurringPrice),
      stock: Number(rest.stock),
      monthNumber: Number(rest.monthNumber),
      year: Number(rest.year),
      images: { ...rest.images, galleryUrls },
    };

    const isEdit = mode === 'edit' && Boolean(initialData?.id);
    const endpoint = isEdit
      ? `/api/admin/editions/${initialData?.id}`
      : '/api/admin/editions';

    try {
      const response = await fetch(endpoint, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => null)) as
        | {
            data?: { id?: string };
            error?: { message?: string; details?: unknown };
          }
        | null;

      if (!response.ok) {
        const message = body?.error?.message ?? 'Unable to save edition';
        const details = formatDetails(body?.error?.details);
        setError(details ? `${message} — ${details}` : message);
        return;
      }

      const savedId = body?.data?.id ?? initialData?.id;
      router.push(savedId ? `/admin/editions/${savedId}` : '/admin/editions');
      router.refresh();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/editions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to editions
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso-dark">
            {mode === 'create' ? 'Create edition' : 'Edit edition'}
          </h1>
          <p className="mt-1 text-sm text-espresso-muted">
            Bilingual edition content, schedule, pricing and assets. Saved to MongoDB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={cancelHref}
            className="inline-flex items-center justify-center rounded-paper border border-border bg-white px-4 py-2.5 text-sm font-medium text-espresso-main transition-colors hover:bg-canvas-paper"
          >
            Cancel
          </Link>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
            {mode === 'create' ? 'Create edition' : 'Save changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-paper border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="break-words">{error}</span>
        </div>
      )}

      <Section
        title="Identity & publication"
        description="Month, year, slug and publication status."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Month" htmlFor="edition-month" required>
            <select
              id="edition-month"
              value={form.month}
              onChange={(event) => handleMonthChange(event.target.value)}
              className={inputClass}
            >
              {EDITION_MONTHS.map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year" htmlFor="edition-year" required>
            <input
              id="edition-year"
              type="number"
              min={2024}
              max={2050}
              value={form.year}
              onChange={(event) => handleYearChange(Number(event.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Month number" hint="Derived from the selected month">
            <input
              value={form.monthNumber}
              readOnly
              className={cn(inputClass, 'bg-canvas-paper text-espresso-muted')}
            />
          </Field>

          <Field label="Status" htmlFor="edition-status" required>
            <select
              id="edition-status"
              value={form.status}
              onChange={(event) =>
                updateField('status', event.target.value as EditionStatusValue)
              }
              className={inputClass}
            >
              {EDITION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Slug"
            htmlFor="edition-slug"
            required
            hint="Lowercase letters, numbers and hyphens"
            className="sm:col-span-2 lg:col-span-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="edition-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField('slug', event.target.value.toLowerCase());
                }}
                maxLength={100}
                placeholder="e.g. monsoon-melodies-july-2026"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-paper border border-border bg-canvas-paper px-3.5 py-2.5 text-xs font-medium text-espresso-main transition-colors hover:bg-canvas-warm"
              >
                <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                Generate
              </button>
            </div>
          </Field>
        </div>
      </Section>

      <Section
        title="Bilingual content"
        description="English and Kannada titles, descriptions and thematic details."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Title (English)" htmlFor="title-en" required>
            <input
              id="title-en"
              value={form.titleEn}
              onChange={(event) => handleTitleEnChange(event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </Field>

          <Field label="Title (Kannada)" htmlFor="title-kn" required>
            <input
              id="title-kn"
              value={form.titleKn}
              onChange={(event) => updateField('titleKn', event.target.value)}
              maxLength={200}
              className={cn(inputClass, 'font-kannada')}
            />
          </Field>

          <Field label="Description (English)" htmlFor="desc-en" required>
            <textarea
              id="desc-en"
              value={form.descriptionEn}
              onChange={(event) => updateField('descriptionEn', event.target.value)}
              maxLength={5000}
              rows={4}
              className={cn(inputClass, 'min-h-[110px] resize-y')}
            />
          </Field>

          <Field label="Description (Kannada)" htmlFor="desc-kn" required>
            <textarea
              id="desc-kn"
              value={form.descriptionKn}
              onChange={(event) => updateField('descriptionKn', event.target.value)}
              maxLength={5000}
              rows={4}
              className={cn(inputClass, 'min-h-[110px] resize-y font-kannada')}
            />
          </Field>

          <Field label="Theme (English)" htmlFor="theme-en" required>
            <input
              id="theme-en"
              value={form.themeEn}
              onChange={(event) => updateField('themeEn', event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </Field>

          <Field label="Theme (Kannada)" htmlFor="theme-kn" required>
            <input
              id="theme-kn"
              value={form.themeKn}
              onChange={(event) => updateField('themeKn', event.target.value)}
              maxLength={200}
              className={cn(inputClass, 'font-kannada')}
            />
          </Field>

          <Field label="Season (English)" htmlFor="season-en">
            <input
              id="season-en"
              value={form.seasonEn}
              onChange={(event) => updateField('seasonEn', event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </Field>

          <Field label="Season (Kannada)" htmlFor="season-kn">
            <input
              id="season-kn"
              value={form.seasonKn}
              onChange={(event) => updateField('seasonKn', event.target.value)}
              maxLength={200}
              className={cn(inputClass, 'font-kannada')}
            />
          </Field>

          <Field label="Curator (English)" htmlFor="curator-en">
            <input
              id="curator-en"
              value={form.curatorEn}
              onChange={(event) => updateField('curatorEn', event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </Field>

          <Field label="Curator (Kannada)" htmlFor="curator-kn">
            <input
              id="curator-kn"
              value={form.curatorKn}
              onChange={(event) => updateField('curatorKn', event.target.value)}
              maxLength={200}
              className={cn(inputClass, 'font-kannada')}
            />
          </Field>
        </div>
      </Section>

      <Section title="Pricing, stock & dates" description="Commercial details and registration schedule.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="One-time price (INR)" htmlFor="price" required>
            <input
              id="price"
              type="number"
              min={0}
              step="1"
              value={form.price}
              onChange={(event) => updateField('price', Number(event.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Recurring price (INR)" htmlFor="recurring-price" required>
            <input
              id="recurring-price"
              type="number"
              min={0}
              step="1"
              value={form.recurringPrice}
              onChange={(event) => updateField('recurringPrice', Number(event.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Stock" htmlFor="stock" required>
            <input
              id="stock"
              type="number"
              min={0}
              step="1"
              value={form.stock}
              onChange={(event) => updateField('stock', Number(event.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Registration start" htmlFor="start-date" required>
            <input
              id="start-date"
              type="date"
              value={form.startDate}
              onChange={(event) => updateField('startDate', event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Registration end" htmlFor="end-date" required>
            <input
              id="end-date"
              type="date"
              value={form.endDate}
              onChange={(event) => updateField('endDate', event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Dispatch date" htmlFor="dispatch-date" required>
            <input
              id="dispatch-date"
              type="date"
              value={form.dispatchDate}
              onChange={(event) => updateField('dispatchDate', event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-espresso-soft">
            Available languages <span className="text-terracotta-600">*</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {EDITION_LANGUAGES.map((language) => {
              const checked = form.availableLanguages.includes(language);
              return (
                <label
                  key={language}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-2 rounded-paper border px-3 py-2 text-sm transition-colors',
                    checked
                      ? 'border-terracotta-200 bg-terracotta-50 text-terracotta-800'
                      : 'border-border bg-white text-espresso-muted hover:bg-canvas-paper'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLanguage(language)}
                    className="h-4 w-4 accent-[#C86446]"
                  />
                  {LANGUAGE_LABELS[language]}
                </label>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-espresso-faint">
            At least one language must remain selected.
          </p>
        </div>
      </Section>

      <Section title="Images" description="Cover, banner and gallery image URLs.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field
            label="Cover image URL"
            htmlFor="cover-url"
            required
            hint="Absolute URL or a path under /public"
          >
            <input
              id="cover-url"
              value={form.images.coverUrl}
              onChange={(event) => updateImage('coverUrl', event.target.value)}
              maxLength={2048}
              placeholder="/images/editions/cover.jpg"
              className={inputClass}
            />
          </Field>

          <Field label="Banner image URL" htmlFor="banner-url">
            <input
              id="banner-url"
              value={form.images.bannerUrl}
              onChange={(event) => updateImage('bannerUrl', event.target.value)}
              maxLength={2048}
              placeholder="/images/editions/banner.jpg"
              className={inputClass}
            />
          </Field>

          <Field
            label="Gallery image URLs"
            htmlFor="gallery-urls"
            hint="One URL per line (maximum 30)"
            className="lg:col-span-2"
          >
            <textarea
              id="gallery-urls"
              value={galleryText}
              onChange={(event) => setGalleryText(event.target.value)}
              rows={4}
              className={cn(inputClass, 'min-h-[100px] resize-y font-mono text-xs')}
              placeholder={'/images/editions/letter.jpg\n/images/editions/cards.jpg'}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Included items"
        description="Everything that ships inside this edition, with both languages."
      >
        <div className="space-y-4">
          {form.includedItems.length === 0 && (
            <p className="rounded-paper border border-dashed border-border bg-canvas-paper px-4 py-6 text-center text-sm text-espresso-soft">
              No included items yet. Add the physical contents of this edition.
            </p>
          )}

          {form.includedItems.map((item, index) => (
            <div
              key={itemRowKeys[index] ?? `row-${index}`}
              className="rounded-paper border border-border-subtle bg-canvas-paper/50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-espresso-soft">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center gap-1 rounded-paper px-2 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Item type" required>
                  <select
                    value={item.itemType}
                    onChange={(event) =>
                      updateItem(index, {
                        itemType: event.target.value as EditionItemTypeValue,
                      })
                    }
                    className={inputClass}
                  >
                    {EDITION_ITEM_TYPES.map((itemType) => (
                      <option key={itemType} value={itemType}>
                        {ITEM_TYPE_LABELS[itemType]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Internal ID" required hint="Stable identifier within the edition">
                  <input
                    value={item.id}
                    onChange={(event) => updateItem(index, { id: event.target.value })}
                    maxLength={120}
                    className={cn(inputClass, 'font-mono text-xs')}
                  />
                </Field>

                <Field label="Name (English)" required>
                  <input
                    value={item.nameEn}
                    onChange={(event) => updateItem(index, { nameEn: event.target.value })}
                    maxLength={200}
                    className={inputClass}
                  />
                </Field>

                <Field label="Name (Kannada)" required>
                  <input
                    value={item.nameKn}
                    onChange={(event) => updateItem(index, { nameKn: event.target.value })}
                    maxLength={200}
                    className={cn(inputClass, 'font-kannada')}
                  />
                </Field>

                <Field label="Description (English)">
                  <textarea
                    value={item.descEn}
                    onChange={(event) => updateItem(index, { descEn: event.target.value })}
                    maxLength={1000}
                    rows={2}
                    className={cn(inputClass, 'resize-y')}
                  />
                </Field>

                <Field label="Description (Kannada)">
                  <textarea
                    value={item.descKn}
                    onChange={(event) => updateItem(index, { descKn: event.target.value })}
                    maxLength={1000}
                    rows={2}
                    className={cn(inputClass, 'resize-y font-kannada')}
                  />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-paper border border-dashed border-border-strong px-3.5 py-2.5 text-xs font-medium text-espresso-main transition-colors hover:border-terracotta-400 hover:bg-terracotta-50/40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add included item
          </button>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-2 pb-2">
        <Link
          href={cancelHref}
          className="inline-flex items-center justify-center rounded-paper border border-border bg-white px-4 py-2.5 text-sm font-medium text-espresso-main transition-colors hover:bg-canvas-paper"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
          {mode === 'create' ? 'Create edition' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
