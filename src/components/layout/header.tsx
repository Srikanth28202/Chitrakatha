'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { Menu, X, Feather } from 'lucide-react';

export function Header() {
  const { t, isKannada } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-canvas/92 backdrop-blur-md transition-colors">
      <Container width="wide" className="flex items-center justify-between h-20">
        {/* Brand Logo & Bilingual Label */}
        <Link
          href="#"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-600 rounded-paper"
        >
          <div className="w-10 h-10 rounded-paper bg-terracotta-100/80 border border-terracotta-200 flex items-center justify-center text-terracotta-700 group-hover:bg-terracotta-200/90 transition-colors shadow-subtle">
            <Feather className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-espresso-dark group-hover:text-terracotta-700 transition-colors">
                {siteConfig.name}
              </span>
              <span className="font-kannada text-base sm:text-lg font-normal text-terracotta-700">
                {siteConfig.nameKannada}
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase text-espresso-soft font-sans hidden sm:block">
              {isKannada ? 'ಮಾಸಿಕ ಸ್ಟೇಷನರಿ & ಕಥನ ಪತ್ರ' : 'Monthly Creative Stationery & Story Letter'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {siteConfig.navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-espresso-muted hover:text-terracotta-700 transition-colors py-1 relative group"
            >
              <span>{isKannada ? item.titleKn : item.titleEn}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-terracotta-600 transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Actions & Switcher */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="#subscription">
            <Button size="sm" variant="primary">
              {t.nav.subscribeCta}
            </Button>
          </Link>
        </div>

        {/* Mobile Actions Button */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-paper text-espresso-muted hover:text-espresso-main hover:bg-canvas-paper border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-600"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-canvas-warm/98 px-6 py-6 shadow-card transition-all">
          <nav className="flex flex-col space-y-3" aria-label="Mobile navigation">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-espresso-main hover:text-terracotta-700 transition-colors py-2 border-b border-border-subtle"
              >
                {isKannada ? item.titleKn : item.titleEn}
              </Link>
            ))}
            <div className="pt-3">
              <Link href="#subscription" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="md" variant="primary" className="w-full">
                  {t.nav.subscribeCta}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
