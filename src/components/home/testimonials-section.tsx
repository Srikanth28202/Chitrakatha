'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { testimonialsData, TestimonialItem } from '@/data/testimonials';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { Quote, MapPin, Heart } from 'lucide-react';

export function TestimonialsSection() {
  const { t, isKannada } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-canvas subtle-paper-grain border-b border-border">
      <Container width="wide" className="space-y-16">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          kannadaTitle={isKannada ? undefined : t.testimonials.kannadaTitle}
          description={t.testimonials.description}
          align="center"
        />

        {/* Clear Placeholder Identification Notice */}
        <div className="max-w-2xl mx-auto -mt-6 text-center">
          <Badge variant="paper" className="text-[11px] font-sans normal-case tracking-normal py-1 px-3">
            <span className="font-semibold mr-1">
              {isKannada ? 'ಗಮನಿಸಿ:' : 'Transparency Note:'}
            </span>
            {t.testimonials.placeholderNote}
          </Badge>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {testimonialsData.map((item: TestimonialItem) => (
            <div
              key={item.id}
              className="bg-canvas-card border border-border rounded-warm p-8 flex flex-col justify-between space-y-6 shadow-subtle hover:border-terracotta-500/40 transition-colors"
            >
              <div className="space-y-4">
                {/* Quotation Icon & Reader Type */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-paper bg-terracotta-50 text-terracotta-700 flex items-center justify-center border border-terracotta-200">
                    <Quote className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-espresso-soft font-sans font-medium">
                    {isKannada ? item.readerTypeKn : item.readerTypeEn}
                  </span>
                </div>

                {/* Quote Note */}
                <p className="font-serif text-base sm:text-lg text-espresso-dark italic leading-relaxed">
                  &ldquo;{isKannada ? item.noteKn : item.noteEn}&rdquo;
                </p>
              </div>

              {/* Reader Meta Details */}
              <div className="pt-4 border-t border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-espresso-dark">
                      {isKannada ? item.readerNameKn : item.readerNameEn}
                    </h4>
                    <p className="text-xs text-espresso-soft flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-terracotta-600" />
                      <span>{isKannada ? item.locationKn : item.locationEn}</span>
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-espresso-soft bg-canvas-paper/70 px-2.5 py-1 rounded-paper border border-border-subtle flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
                  <span>
                    {isKannada ? 'ಮೆಚ್ಚಿನ ಸಾಮಗ್ರಿ: ' : 'Cherished Piece: '}
                    <strong className="text-espresso-main font-medium">
                      {isKannada ? item.favoriteItemKn : item.favoriteItemEn}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

