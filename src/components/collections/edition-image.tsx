'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface EditionImageProps {
  src?: string;
  alt: string;
  className?: string;
}

function monogramFromAlt(alt: string): string {
  const trimmed = alt.trim();
  if (!trimmed) return 'ಚಿ';
  // Use the first character of the title as an editorial monogram. Works for
  // both Latin and Kannada titles.
  return Array.from(trimmed)[0] ?? 'ಚಿ';
}

export function EditionImage({ src, alt, className }: EditionImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!src || hasFailed) {
    // Artwork is supplied separately from the catalogue data, so a missing
    // image is expected during content entry. Render an on-brand placeholder
    // (paper gradient + monogram) instead of a broken-image glyph.
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden',
          'bg-[linear-gradient(135deg,#F3EBDF_0%,#E9DCC9_45%,#DFCDB4_100%)]',
          'text-espresso-dark/25',
          className
        )}
        role="img"
        aria-label={`${alt} — artwork coming soon`}
      >
        <span
          aria-hidden="true"
          className="select-none font-serif text-6xl leading-none tracking-tight"
        >
          {monogramFromAlt(alt)}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-0 right-0 text-center font-sans text-[10px] uppercase tracking-[0.3em] text-espresso-dark/35"
        >
          Chitrakatha
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
