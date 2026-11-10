import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso-soft">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl font-semibold text-espresso-dark">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-espresso-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
