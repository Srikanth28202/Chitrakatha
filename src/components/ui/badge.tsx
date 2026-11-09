import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'terracotta' | 'sage' | 'rose' | 'paper' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  terracotta: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200',
  sage: 'bg-sage-50 text-sage-700 border-sage-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  paper: 'bg-canvas-paper text-espresso-muted border-border',
  outline: 'bg-transparent text-espresso-main border-border-strong',
};

export function Badge({ variant = 'terracotta', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase rounded-paper border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

