'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Feather, HeartHandshake, Sparkles, Quote } from 'lucide-react';

export function BrandStory() {
  const { t, isKannada } = useLanguage();

  return (
    <section id="story" className="py-20 md:py-28 bg-canvas-paper/50 border-b border-border">
      <Container width="wide" className="space-y-16">
        {/* Section Heading */}
        <SectionHeading
          eyebrow={t.story.eyebrow}
          title={t.story.title}
          kannadaTitle={isKannada ? undefined : t.story.kannadaTitle}
          align="center"
        />

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Emotional Prose Narrative */}
          <div className="lg:col-span-7 space-y-6 text-espresso-muted text-base sm:text-lg leading-relaxed font-sans">
            <p className="first-letter:font-serif first-letter:text-4xl sm:first-letter:text-5xl first-letter:text-terracotta-700 first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              {t.story.paragraph1}
            </p>

            <p>{t.story.paragraph2}</p>

            <p className="text-sm sm:text-base text-espresso-soft border-l-2 border-terracotta-600/60 pl-4 py-1 italic">
              {t.story.paragraph3}
            </p>
          </div>

          {/* Right Column: Literary Quote Box */}
          <div className="lg:col-span-5">
            <div className="relative p-8 sm:p-10 bg-canvas-card border border-border rounded-warm shadow-subtle space-y-6">
              <div className="w-10 h-10 rounded-paper bg-terracotta-100 flex items-center justify-center text-terracotta-700">
                <Quote className="w-5 h-5" />
              </div>

              <blockquote className="space-y-3">
                <p className="font-serif text-xl sm:text-2xl text-espresso-dark font-normal italic leading-snug">
                  &ldquo;{t.story.quote}&rdquo;
                </p>
                <cite className="block text-xs uppercase tracking-widest text-espresso-soft font-sans not-italic">
                  — {t.story.quoteAuthor}
                </cite>
              </blockquote>

              <div className="pt-4 border-t border-border-subtle flex items-center gap-3 text-xs text-espresso-muted">
                <span className="w-2 h-2 rounded-full bg-sage-600 shrink-0" />
                <span>
                  {isKannada
                    ? 'ಕನ್ನಡ ಸಾಹಿತ್ಯ & ಕಲೆಯ ಪ್ರೀತಿಯಿಂದ ರೂಪಿತ'
                    : 'Crafted with reverence for Kannada literature & arts'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Chitrakatha */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="p-8 rounded-warm bg-canvas-card border border-border space-y-4 hover:border-terracotta-500/40 transition-colors">
            <div className="w-10 h-10 rounded-paper bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-700">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso-dark">
              {t.story.pillar1Title}
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-sans">
              {t.story.pillar1Desc}
            </p>
          </div>

          <div className="p-8 rounded-warm bg-canvas-card border border-border space-y-4 hover:border-sage-500/40 transition-colors">
            <div className="w-10 h-10 rounded-paper bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso-dark">
              {t.story.pillar2Title}
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-sans">
              {t.story.pillar2Desc}
            </p>
          </div>

          <div className="p-8 rounded-warm bg-canvas-card border border-border space-y-4 hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-paper bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-espresso-dark">
              {t.story.pillar3Title}
            </h3>
            <p className="text-sm text-espresso-muted leading-relaxed font-sans">
              {t.story.pillar3Desc}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

