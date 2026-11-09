'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { faqsData, FaqItem } from '@/data/faqs';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Accordion } from '@/components/ui/accordion';

export function FaqSection() {
  const { t, isKannada } = useLanguage();

  const accordionItems = faqsData.map((faq: FaqItem) => ({
    id: faq.id,
    title: isKannada ? faq.questionKn : faq.questionEn,
    kannadaTitle: isKannada ? faq.questionEn : faq.questionKn,
    content: (
      <div className="pt-2 text-espresso-muted leading-relaxed font-sans text-sm sm:text-base space-y-2">
        <p>{isKannada ? faq.answerKn : faq.answerEn}</p>
        <p className="text-xs text-espresso-soft italic border-t border-border-subtle pt-2">
          {isKannada ? faq.answerEn : faq.answerKn}
        </p>
      </div>
    ),
  }));

  return (
    <section id="faq" className="py-20 md:py-28 bg-canvas-paper/40 border-b border-border">
      <Container width="narrow" className="space-y-16">
        <SectionHeading
          eyebrow={t.faq.eyebrow}
          title={t.faq.title}
          kannadaTitle={isKannada ? undefined : t.faq.kannadaTitle}
          description={t.faq.description}
          align="center"
        />

        <div className="bg-canvas-card border border-border rounded-warm p-6 sm:p-10 shadow-subtle">
          <Accordion items={accordionItems} allowMultiple={false} />
        </div>

        {/* Support Help Desk note */}
        <div className="text-center text-xs text-espresso-soft space-y-1">
          <p>
            {isKannada
              ? 'ಇನ್ನೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ? ನಮ್ಮ ಅಂಚೆ ಮೇಜಿಗೆ ಬರೆಯಿರಿ:'
              : 'Have a specific question not covered here? Write to our postal desk:'}
          </p>
          <a
            href="mailto:namaskara@chitrakatha.art"
            className="text-terracotta-700 hover:text-terracotta-800 underline font-medium"
          >
            namaskara@chitrakatha.art
          </a>
        </div>
      </Container>
    </section>
  );
}

