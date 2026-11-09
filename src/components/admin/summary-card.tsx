import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'terracotta' | 'sage' | 'rose' | 'espresso';

interface SummaryCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  accent: Accent;
  href?: string;
}

const accentStyles: Record<Accent, { icon: string; value: string }> = {
  terracotta: {
    icon: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
    value: 'text-terracotta-700',
  },
  sage: {
    icon: 'bg-sage-50 text-sage-700 border-sage-200',
    value: 'text-sage-700',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-700 border-rose-200',
    value: 'text-rose-700',
  },
  espresso: {
    icon: 'bg-canvas-paper text-espresso-main border-border',
    value: 'text-espresso-dark',
  },
};

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  href,
}: SummaryCardProps) {
  const styles = accentStyles[accent];

  const content = (
    <div className="flex h-full items-start justify-between gap-4 rounded-warm border border-border bg-white p-5 shadow-subtle transition-all duration-200 hover:shadow-card">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-soft">
          {label}
        </p>
        <p className={cn('mt-2 font-serif text-3xl font-semibold leading-none', styles.value)}>
          {value.toLocaleString('en-IN')}
        </p>
        {hint && <p className="mt-2 text-xs text-espresso-muted">{hint}</p>}
      </div>
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-paper border',
          styles.icon
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-600/40 focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
