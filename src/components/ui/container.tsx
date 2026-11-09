import React from 'react';
import { cn } from '@/lib/utils';

export type ContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
  width?: ContainerWidth;
}

const widthStyles: Record<ContainerWidth, string> = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({
  as: Component = 'div',
  width = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8', widthStyles[width], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

