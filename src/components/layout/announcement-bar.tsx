'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { ArrowRight, Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <aside
      aria-label="Monthly Announcement"
      className="bg-espresso-dark text-canvas-warm py-2 px-4 text-xs font-sans tracking-wide border-b border-espresso-muted/40 transition-colors"
    >
      <Container width="wide" className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-paper bg-terracotta-700/80 text-[10px] font-semibold tracking-wider uppercase text-canvas-card shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            {t.announcement.badge}
          </span>
          <span className="text-canvas-paper/90 truncate">
            {t.announcement.text}
          </span>
        </div>

        <Link
          href="/#collections"
          className="inline-flex items-center gap-1 font-medium text-terracotta-200 hover:text-white transition-colors shrink-0 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta-400 rounded-paper"
        >
          <span>{t.announcement.action}</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </Container>
    </aside>
  );
}

