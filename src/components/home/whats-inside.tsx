'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { whatsInsideItems, WhatsInsideItem } from '@/data/whats-inside';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { MailOpen, Image as ImageIcon, Sparkles, Bookmark as BookmarkIcon, Puzzle, Palette } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  MailOpen: <MailOpen className="w-5 h-5" />,
  Image: <ImageIcon className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Bookmark: <BookmarkIcon className="w-5 h-5" />,
  Puzzle: <Puzzle className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
};

export function WhatsInside() {
  const { t, isKannada } = useLanguage();

  return (
    <section id="whats-inside" className="py-20 md:py-28 bg-canvas-paper/40 border-b border-border">
      <Container width="wide" className="space-y-16">
        <SectionHeading
          eyebrow={t.whatsInside.eyebrow}
          title={t.whatsInside.title}
          kannadaTitle={isKannada ? undefined : t.whatsInside.kannadaTitle}
          description={t.whatsInside.description}
          align="center"
        />

        {/* 6 Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {whatsInsideItems.map((item: WhatsInsideItem) => {
            const accentBadgeVariant = item.accent === 'terracotta' ? 'terracotta' : item.accent === 'sage' ? 'sage' : 'rose';

            return (
              <div
                key={item.id}
                className="bg-canvas-card border border-border rounded-warm p-7 flex flex-col justify-between hover:border-terracotta-500/40 hover:shadow-subtle transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-paper flex items-center justify-center border ${
                        item.accent === 'terracotta'
                          ? 'bg-terracotta-50 text-terracotta-700 border-terracotta-200'
                          : item.accent === 'sage'
                          ? 'bg-sage-50 text-sage-700 border-sage-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {iconMap[item.icon]}
                    </div>
                    <Badge variant={accentBadgeVariant}>{item.tag}</Badge>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-espresso-dark">
                      {isKannada ? item.titleKn : item.titleEn}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-espresso-soft font-sans">
                      {isKannada ? item.subtitleKn : item.subtitleEn}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-espresso-muted leading-relaxed font-sans">
                    {isKannada ? item.descriptionKn : item.descriptionEn}
                  </p>
                </div>

                {/* Paper & Material Specification Stamp */}
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <span className="text-[10px] uppercase tracking-wider text-espresso-soft block mb-1 font-semibold">
                    {isKannada ? 'ಕಾಗದದ ವಿವರಣೆ:' : 'Paper & Material Spec:'}
                  </span>
                  <span className="font-serif text-xs italic text-espresso-muted block">
                    {isKannada ? item.paperSpecKn : item.paperSpecEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Note */}
        <div className="p-6 rounded-warm bg-canvas-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso-muted">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta-600 shrink-0" />
            <span>
              {isKannada
                ? 'ಪ್ರತಿ ಸಂಚಿಕೆಯೂ ನೈಸರ್ಗಿಕ ಕ್ರಾಫ್ಟ್ ಲಕೋಟೆಯಲ್ಲಿ ಪ್ಲಾಸ್ಟಿಕ್-ರಹಿತವಾಗಿ ನಿಮ್ಮ ಕೈಸೇರುತ್ತದೆ.'
                : 'All six stationery items are thoughtfully hand-packed in plastic-free archival kraft sleeves.'}
            </span>
          </div>
          <Badge variant="paper">100% Plastic-Free Parcel</Badge>
        </div>
      </Container>
    </section>
  );
}

