import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'bordered' | 'paper';
}

export function Card({ variant = 'bordered', className, children, ...props }: CardProps) {
  const variantStyles = {
    elevated: 'bg-canvas-card border border-border-subtle shadow-card',
    bordered: 'bg-canvas-card border border-border shadow-subtle',
    paper: 'bg-canvas-paper border border-border/80 shadow-none',
  }[variant];

  return (
    <div
      className={cn('rounded-warm transition-all duration-200 overflow-hidden', variantStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
}

