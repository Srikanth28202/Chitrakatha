'use client';

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!src || hasFailed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-paper border border-dashed border-border bg-canvas-paper text-espresso-faint',
          className
        )}
        aria-label={`${alt} unavailable`}
      >
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHasFailed(true)}
      className={cn('rounded-paper border border-border object-cover', className)}
      loading="lazy"
    />
  );
}
