import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  createHref: (page: number) => string;
}

const linkClass =
  'inline-flex items-center gap-1.5 rounded-paper border border-border bg-white px-3 py-2 text-xs font-medium text-espresso-main transition-colors hover:border-espresso-main/40 hover:bg-canvas-paper';

export function Pagination({ page, totalPages, createHref }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 pt-2"
      aria-label="Edition pagination"
    >
      <p className="text-xs text-espresso-soft">
        Page <span className="font-semibold text-espresso-main">{page}</span> of{' '}
        <span className="font-semibold text-espresso-main">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        {canGoPrevious ? (
          <Link href={createHref(page - 1)} className={linkClass}>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Previous
          </Link>
        ) : (
          <span className={cn(linkClass, 'pointer-events-none opacity-40')}>
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Previous
          </span>
        )}
        {canGoNext ? (
          <Link href={createHref(page + 1)} className={linkClass}>
            Next
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span className={cn(linkClass, 'pointer-events-none opacity-40')}>
            Next
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
