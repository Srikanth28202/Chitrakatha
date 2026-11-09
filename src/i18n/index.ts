import { Locale, SiteDictionary } from '@/types/i18n';
import { en } from './locales/en';
import { kn } from './locales/kn';

export const dictionaries: Record<Locale, SiteDictionary> = {
  en,
  kn,
};

export function getDictionary(locale: Locale): SiteDictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export * from './context';
export { en, kn };

