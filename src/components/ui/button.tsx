'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'rose';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta-600 text-white hover:bg-terracotta-700 active:bg-terracotta-800 shadow-sm border border-transparent',
  secondary:
    'bg-canvas-paper text-espresso-main hover:bg-[#EFE7DE] active:bg-[#E6DDD4] border border-border',
  outline:
    'bg-transparent text-espresso-main border border-espresso-main/40 hover:border-espresso-main hover:bg-espresso-main/[0.03]',
  ghost:
    'bg-transparent text-espresso-muted hover:text-espresso-main hover:bg-espresso-main/[0.04] border border-transparent',
  sage:
    'bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-800 shadow-sm border border-transparent',
  rose:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium tracking-wide',
  md: 'text-sm px-5 py-2.5 gap-2 font-medium tracking-wide',
  lg: 'text-base px-7 py-3.5 gap-2.5 font-medium tracking-wider',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 ease-out select-none',
          'rounded-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-600/40 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

