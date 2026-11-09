import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  kannadaTitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  showOrnament?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  kannadaTitle,
  description,
  align = 'center',
  showOrnament = true,
  className,
  ...props
}: SectionHeadingProps) {
  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[align];

  return (
    <div className={cn('flex flex-col space-y-3 max-w-3xl', alignmentClass, className)} {...props}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-terracotta-600">
            {eyebrow}
          </span>
        </div>
      )}

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-espresso-dark font-medium tracking-tight leading-tight">
          {title}
        </h2>
        {kannadaTitle && (
          <p className="font-kannada text-lg sm:text-xl text-espresso-muted font-normal">
            {kannadaTitle}
          </p>
        )}
      </div>

      {showOrnament && (
        <div className="flex items-center justify-center gap-2 py-1 select-none opacity-40">
          <span className="w-8 h-[1px] bg-terracotta-600"></span>
          <span className="text-xs text-terracotta-600">❖</span>
          <span className="w-8 h-[1px] bg-terracotta-600"></span>
        </div>
      )}

      {description && (
        <p className="text-sm sm:text-base text-espresso-muted leading-relaxed font-sans max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

