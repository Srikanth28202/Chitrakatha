'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Mail, Sparkles, Feather, Compass, Stamp } from 'lucide-react';

export function HeroSection() {
  const { t, isKannada } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 subtle-paper-grain border-b border-border">
      {/* Delicate vintage paper background accents */}
      <div
        className="absolute top-12 left-1/3 w-80 h-80 bg-terracotta-100/30 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-6 right-1/4 w-96 h-96 bg-sage-100/40 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container width="wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Emotional Storytelling & Headlines */}
          <div className="lg:col-span-7 space-y-6">
            {/* Small Editorial Label / Stamp */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="terracotta" className="tracking-widest">
                {t.hero.eyebrow}
              </Badge>
              <span className="text-xs text-espresso-soft font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                {t.hero.stationeryBadge}
              </span>
            </div>

            {/* Exact Required Headlines */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-espresso-dark font-medium leading-[1.15] tracking-tight">
                {isKannada ? (
                  <>
                    <span className="font-kannada block text-espresso-dark">
                      {t.hero.titleKn}
                    </span>
                    <span className="text-lg sm:text-2xl font-serif italic text-terracotta-700 font-normal block pt-1">
                      {t.hero.titleEn}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-espresso-dark">
                      {t.hero.titleEn}
                    </span>
                    <span className="font-kannada text-xl sm:text-3xl text-terracotta-700 font-normal block pt-1">
                      {t.hero.titleKn}
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Exact Required Supporting Copy */}
            <p className="text-base sm:text-lg text-espresso-muted leading-relaxed font-sans max-w-xl">
              {t.hero.description}
            </p>

            {/* Action Buttons: Primary & Secondary */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="#collections">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t.hero.exploreCta}
                </Button>
              </Link>
              <Link href="#story">
                <Button size="lg" variant="secondary" leftIcon={<BookOpen className="w-4 h-4" />}>
                  {t.hero.storyCta}
                </Button>
              </Link>
            </div>

            {/* Editorial Features Strip */}
            <div className="pt-6 border-t border-border-subtle grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-espresso-dark font-serif text-sm sm:text-base font-semibold">
                  <Mail className="w-4 h-4 text-terracotta-600 shrink-0" />
                  <span>Real Mail</span>
                </div>
                <p className="text-[11px] sm:text-xs text-espresso-soft font-sans">
                  {isKannada ? 'ನೇರ ಅಂಚೆ ಪೆಟ್ಟಿಗೆ' : 'Delivered by post'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-espresso-dark font-serif text-sm sm:text-base font-semibold">
                  <Feather className="w-4 h-4 text-sage-600 shrink-0" />
                  <span>Bilingual</span>
                </div>
                <p className="text-[11px] sm:text-xs text-espresso-soft font-sans">
                  {isKannada ? 'ಕನ್ನಡ & ಇಂಗ್ಲಿಷ್' : 'Kannada & English'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-espresso-dark font-serif text-sm sm:text-base font-semibold">
                  <Compass className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Artisanal</span>
                </div>
                <p className="text-[11px] sm:text-xs text-espresso-soft font-sans">
                  {isKannada ? 'ಹಸ್ತಕಾಗದ ಸಾಮಗ್ರಿಗಳು' : 'Handcrafted paper'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Beautiful Stationery Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Postal envelope outer sleeve */}
              <div className="relative bg-[#FAF5EE] border border-border p-6 sm:p-8 rounded-warm shadow-card">
                {/* Vintage Postmark Stamp Badge */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border border-dashed border-espresso-soft/60 flex items-center justify-center text-espresso-muted">
                      <Stamp className="w-4 h-4 text-terracotta-700" />
                    </div>
                    <div>
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-espresso-soft block">
                        {t.hero.editionStamp}
                      </span>
                      <span className="font-serif text-xs text-espresso-dark">
                        Registered Parcel · Speed Post
                      </span>
                    </div>
                  </div>
                  {/* Wax seal simulation */}
                  <div
                    title={t.hero.waxSealLabel}
                    className="w-9 h-9 rounded-full bg-terracotta-700 text-canvas-card flex items-center justify-center shadow-subtle border border-terracotta-800 font-serif text-xs font-bold tracking-tighter"
                  >
                    ಚಿ
                  </div>
                </div>

                {/* Overlapping Stationery Cards Showcase */}
                <div className="py-6 space-y-4">
                  {/* Story Letter Preview Paper */}
                  <div className="bg-canvas-card border border-border rounded-paper p-5 shadow-subtle space-y-2.5 relative">
                    <div className="flex items-center justify-between text-[11px] text-espresso-soft">
                      <span className="font-mono uppercase tracking-wider">
                        Folklore Fragment · ಪತ್ರ
                      </span>
                      <span className="text-terracotta-600 font-medium">120gsm Cotton</span>
                    </div>
                    <p className="font-serif text-base sm:text-lg text-espresso-dark italic leading-snug">
                      &ldquo;When the Karthika dusk settles upon Agumbe, the misty canopy whispers stories older than stone...&rdquo;
                    </p>
                    <p className="font-kannada text-xs sm:text-sm text-espresso-muted leading-relaxed">
                      &ldquo;ಆಗುಂಬೆಯ ಮೇಲೆ ಕಾರ್ತಿಕದ ಮುಸ್ಸಂಜೆ ಇಳಿಯುತ್ತಿದ್ದಂತೆ, ಹಸಿರು ತೋರಣವು ಮಂಜಿನೊಂದಿಗೆ ಪ್ರಾಚೀನ ಕತೆಗಳನ್ನು ಪಿಸುಗುಡಲಾರಂಭಿಸುತ್ತದೆ...&rdquo;
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-espresso-soft border-t border-border-subtle">
                      <span>{t.hero.letterLabel}</span>
                      <span className="font-serif italic">— Malnad Storyteller</span>
                    </div>
                  </div>

                  {/* Art Card & Keepsake Overlapping Row */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Art Card Mini */}
                    <div className="bg-[#F6EFE6] border border-[#E3D6C6] rounded-paper p-3.5 space-y-2">
                      <div className="w-full h-20 bg-sage-100/70 border border-sage-200/60 rounded-paper flex flex-col items-center justify-center p-2 text-center">
                        <Feather className="w-5 h-5 text-sage-700 mb-1" />
                        <span className="text-[10px] font-serif text-sage-800 font-medium">
                          Western Ghats Ferns
                        </span>
                        <span className="text-[9px] text-sage-600">300gsm Matt</span>
                      </div>
                      <span className="text-[10px] text-espresso-soft block leading-tight">
                        {t.hero.artCardLabel}
                      </span>
                    </div>

                    {/* Bookmark & Stickers Mini */}
                    <div className="bg-[#FAF4EC] border border-[#E3D6C6] rounded-paper p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="w-full h-20 bg-rose-50 border border-rose-200/60 rounded-paper flex flex-col items-center justify-center p-2 text-center">
                        <span className="font-serif text-xs font-semibold text-rose-800">
                          ಕಾವ್ಯದ ಪುಸ್ತಕ ಗುರುತು
                        </span>
                        <span className="text-[10px] text-rose-700 mt-0.5">
                          Brass / Jute Tassel
                        </span>
                        <span className="text-[9px] text-rose-600 mt-1">+ Sticker Sheet</span>
                      </div>
                      <span className="text-[10px] text-espresso-soft block leading-tight">
                        Stickers & Bookmark
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer of the envelope */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-espresso-soft font-sans text-[11px]">
                    {t.hero.envelopeNote}
                  </span>
                  <Badge variant="sage">November Edition</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

