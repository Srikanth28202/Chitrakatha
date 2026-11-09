'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, SiteDictionary } from '@/types/i18n';
import { DEFAULT_LOCALE, STORAGE_KEYS } from '@/config/constants';
import { en } from './locales/en';
import { kn } from './locales/kn';

const dictionaries: Record<Locale, SiteDictionary> = {
  en,
  kn,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: SiteDictionary;
  isKannada: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCALE) as Locale | null;
      if (saved && (saved === 'en' || saved === 'kn')) {
        setLocaleState(saved);
      }
    } catch {
      // Storage access might fail in restricted environments
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'kn' : 'en');
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    toggleLocale,
    t: dictionaries[locale],
    isKannada: locale === 'kn',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

