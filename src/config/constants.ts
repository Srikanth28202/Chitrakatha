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
} as const;

export const EDITORIAL_COLORS = {
  canvas: '#FDFBF7',
  paperCream: '#FAF6F0',
  parchment: '#F4EFEA',
  sageGreen: '#5E7160',
  dustyRose: '#B87D7B',
  terracotta: '#C86446',
  darkBrownTypography: '#231B15',
} as const;

