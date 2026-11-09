'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/ui/container';
import { Feather, Instagram, Mail, MapPin, Heart } from 'lucide-react';

export function Footer() {
  const { t, isKannada } = useLanguage();

  return (
    <footer className="w-full border-t border-border bg-[#F8F3EC] pt-16 pb-12 transition-colors">
      <Container width="wide">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-border">
          {/* Brand Narrative Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-paper bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-700 shadow-subtle">
                <Feather className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold text-espresso-dark">
                  {siteConfig.name}
                </span>
                <span className="font-kannada text-lg text-terracotta-700">
                  {siteConfig.nameKannada}
                </span>
              </div>
            </div>

            <p className="text-sm text-espresso-muted leading-relaxed font-sans max-w-md">
              {t.footer.description}
            </p>

            {/* Curatorial Postal Desk info */}
            <div className="pt-2 text-xs text-espresso-soft space-y-1 font-sans">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                <span>{t.footer.postalDeskAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                <a
                  href={`mailto:${t.footer.contactEmail}`}
                  className="text-espresso-muted hover:text-terracotta-700 underline"
                >
                  {t.footer.contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-espresso-soft font-sans">
              {t.footer.navigationTitle}
            </h3>
            <ul className="space-y-2 text-sm font-sans">
              {siteConfig.navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                  >
                    {isKannada ? item.titleKn : item.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curated Collections & Social Channels */}
          <div className="md:col-span-4 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-espresso-soft font-sans">
                {t.footer.collectionsTitle}
              </h3>
              <ul className="space-y-1.5 text-sm font-serif">
                <li>
                  <Link
                    href="#collections"
                    className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                  >
                    {isKannada ? 'ನವೆಂಬರ್: ಮೌನ ಸಹ್ಯಾದ್ರಿ' : 'November: The Whispering Sahyadri'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#collections"
                    className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                  >
                    {isKannada ? 'ಡಿಸೆಂಬರ್: ಕಾವೇರಿಯ ನಕ್ಷತ್ರಗಳು' : 'December: Constellations of Kaveri'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#collections"
                    className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                  >
                    {isKannada ? 'ಅಕ್ಟೋಬರ್: ಹಂಪಿಯ ನೆನಪುಗಳು' : 'October: Echoes of Hampi'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Instagram placeholder link */}
            <div className="pt-2">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-paper bg-canvas-card border border-border text-xs text-espresso-muted hover:text-espresso-dark hover:border-terracotta-500/40 transition-colors"
              >
                <Instagram className="w-4 h-4 text-terracotta-600" />
                <span>{t.footer.instagramHandle} · Instagram</span>
              </a>
            </div>

            <p className="text-[11px] text-espresso-soft font-sans">
              {t.footer.privacyNote}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-espresso-soft gap-4 font-sans">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} ({siteConfig.nameKannada}).{' '}
            {t.footer.rightsReserved}
          </p>
          <p className="flex items-center gap-1.5">
            <span>{t.footer.craftedWithLove}</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
          </p>
        </div>
      </Container>
    </footer>
  );
}
