'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { siteConfig } from '@/config/site';
import { Container } from '@/components/ui/container';
import { Feather, Instagram, Mail, MapPin, Heart } from 'lucide-react';

interface FooterEdition {
  slug: string;
  titleEn: string;
  titleKn: string;
  month: string;
  year: number;
}

function toFooterEditions(data: unknown): FooterEdition[] {
  if (!Array.isArray(data)) return [];

  const editions: FooterEdition[] = [];

  for (const candidate of data) {
    if (!candidate || typeof candidate !== 'object') continue;
    const record = candidate as Record<string, unknown>;
    const slug = typeof record.slug === 'string' ? record.slug : '';
    const titleEn = typeof record.titleEn === 'string' ? record.titleEn : '';
    const titleKn = typeof record.titleKn === 'string' ? record.titleKn : '';
    const month = typeof record.month === 'string' ? record.month : '';
    const year = typeof record.year === 'number' ? record.year : 0;

    if (slug && (titleEn || titleKn)) {
      editions.push({ slug, titleEn, titleKn, month, year });
    }
  }

  return editions.slice(0, 3);
}

export function Footer() {
  const { t, isKannada } = useLanguage();
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [recentEditions, setRecentEditions] = useState<FooterEdition[]>([]);

  useEffect(() => {
    // Refresh after mount so a long-lived session rolls over to a new year.
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    // Surface the newest published editions in place of hardcoded names.
    // Non-critical: the footer renders a fallback link when unavailable.
    let active = true;

    async function loadRecentEditions() {
      try {
        const response = await fetch('/api/editions?limit=3', { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as
          | { success?: boolean; data?: unknown }
          | null;

        if (!active) return;
        if (!response.ok || payload?.success !== true) return;

        setRecentEditions(toFooterEditions(payload.data));
      } catch {
        // Footer links are decorative; failures keep the fallback link.
      }
    }

    void loadRecentEditions();
    return () => {
      active = false;
    };
  }, []);

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
                {recentEditions.map((edition) => (
                  <li key={edition.slug}>
                    <Link
                      href={`/collections/${edition.slug}`}
                      className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                    >
                      {edition.month ? `${edition.month}: ` : ''}
                      {isKannada
                        ? edition.titleKn || edition.titleEn
                        : edition.titleEn || edition.titleKn}
                    </Link>
                  </li>
                ))}
                {recentEditions.length === 0 && (
                  <li>
                    <Link
                      href="/#collections"
                      className="text-espresso-muted hover:text-terracotta-700 transition-colors"
                    >
                      {isKannada ? 'ಎಲ್ಲಾ ಸಂಗ್ರಹಗಳನ್ನು ನೋಡಿ' : 'Browse all collections'}
                    </Link>
                  </li>
                )}
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
            &copy; {currentYear} {siteConfig.name} ({siteConfig.nameKannada}).{' '}
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
