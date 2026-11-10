import { Locale } from '@/types/i18n';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'kn'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, { label: string; native: string }> = {
  en: {
    label: 'English',
    native: 'English',
  },
  kn: {
    label: 'Kannada',
    native: 'ಕನ್ನಡ',
  },
};

export const STORAGE_KEYS = {
  LOCALE: 'chitrakatha_locale_pref',
  THEME: 'chitrakatha_theme_pref',
  CART: 'chitrakatha_cart_v1',
} as const;

/**
 * Cookie mirror of the locale preference. The server reads it before render
 * so Kannada visitors get Kannada server-rendered HTML instead of an
 * English-first flash that swaps after hydration.
 */
export const LOCALE_COOKIE = 'chitrakatha_locale';

export const CART_LIMITS = {
  MAX_QUANTITY_PER_ITEM: 10,
  MAX_ITEMS: 20,
} as const;

export const DUPLICATE_ORDER_WINDOW_MS = 5 * 60 * 1000;

export const EDITORIAL_COLORS = {
  canvas: '#FDFBF7',
  paperCream: '#FAF6F0',
  parchment: '#F4EFEA',
  sageGreen: '#5E7160',
  dustyRose: '#B87D7B',
  terracotta: '#C86446',
  darkBrownTypography: '#231B15',
} as const;

