'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, RotateCcw, Search } from 'lucide-react';
import {
  EDITION_MONTHS,
  EDITION_STATUSES,
  type EditionStatusValue,
} from '@/lib/validations/admin-edition';

interface EditionFiltersProps {
  initial: {
    q: string;
    status: string;
    year: string;
    month: string;
  };
  statusCounts: Record<EditionStatusValue | 'all', number>;
}

const STATUS_LABELS: Record<EditionStatusValue | 'all', string> = {
  all: 'All statuses',
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  sold_out: 'Sold out',
  archived: 'Archived',
};

const inputClass =
  'w-full rounded-paper border border-border bg-white px-3 py-2 text-sm text-espresso-main placeholder:text-espresso-faint focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-600/25';

export function EditionFilters({ initial, statusCounts }: EditionFiltersProps) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const [status, setStatus] = useState(initial.status || 'all');
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (status && status !== 'all') params.set('status', status);
    if (year.trim()) params.set('year', year.trim());
    if (month) params.set('month', month);

    const queryString = params.toString();
    router.push(queryString ? `/admin/editions?${queryString}` : '/admin/editions');
  }

  function handleReset() {
    setQ('');
    setStatus('all');
    setYear('');
    setMonth('');
    router.push('/admin/editions');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-warm border border-border bg-white p-4 shadow-subtle"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label htmlFor="edition-search" className="sr-only">
            Search editions
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-faint"
              aria-hidden="true"
            />
            <input
              id="edition-search"
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search title, theme, slug, month…"
              maxLength={100}
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="edition-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="edition-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClass}
          >
            {(['all', ...EDITION_STATUSES] as const).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]} ({statusCounts[value] ?? 0})
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="edition-year" className="sr-only">
            Filter by year
          </label>
          <input
            id="edition-year"
            type="number"
            min={2024}
            max={2050}
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="Year"
            className={inputClass}
          />
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="edition-month" className="sr-only">
            Filter by month
          </label>
          <select
            id="edition-month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className={inputClass}
          >
            <option value="">All months</option>
            {EDITION_MONTHS.map((monthName) => (
              <option key={monthName} value={monthName}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-paper border border-border px-3 py-2 text-xs font-medium text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          Apply filters
        </button>
      </div>
    </form>
  );
}
