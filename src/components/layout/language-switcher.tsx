'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { Languages } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center p-0.5 rounded-paper border border-border bg-canvas-paper/70 backdrop-blur-sm text-xs select-none',
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <div className="flex items-center px-1.5 text-espresso-soft" aria-hidden="true">
        <Languages className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          'px-2.5 py-1 rounded-[3px] font-medium transition-colors duration-150',
          locale === 'en'
            ? 'bg-canvas-card text-espresso-main shadow-subtle font-semibold'
            : 'text-espresso-muted hover:text-espresso-main'
        )}
        aria-pressed={locale === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLocale('kn')}
        className={cn(
          'px-2.5 py-1 rounded-[3px] font-medium font-kannada transition-colors duration-150',
          locale === 'kn'
            ? 'bg-canvas-card text-espresso-main shadow-subtle font-semibold'
            : 'text-espresso-muted hover:text-espresso-main'
        )}
        aria-pressed={locale === 'kn'}
      >
        ಕನ್ನಡ
      </button>
    </div>
  );
}

