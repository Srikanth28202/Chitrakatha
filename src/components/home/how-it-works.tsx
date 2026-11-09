'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Compass, Languages, PackageCheck, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const { t, isKannada } = useLanguage();

  const steps = [
    {
      number: t.howItWorks.step1Number,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
      icon: <Compass className="w-6 h-6 text-terracotta-700" />,
      tag: isKannada ? 'ಹಂತ ೧' : 'Step 1',
    },
    {
      number: t.howItWorks.step2Number,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
      icon: <Languages className="w-6 h-6 text-sage-700" />,
      tag: isKannada ? 'ಹಂತ ೨' : 'Step 2',
    },
    {
      number: t.howItWorks.step3Number,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
      icon: <PackageCheck className="w-6 h-6 text-rose-700" />,
      tag: isKannada ? 'ಹಂತ ೩' : 'Step 3',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-canvas subtle-paper-grain border-b border-border">
      <Container width="wide" className="space-y-16">
        <SectionHeading
          eyebrow={t.howItWorks.eyebrow}
          title={t.howItWorks.title}
          kannadaTitle={isKannada ? undefined : t.howItWorks.kannadaTitle}
          description={t.howItWorks.description}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-warm bg-canvas-card border border-border shadow-subtle flex flex-col justify-between space-y-6 group hover:border-terracotta-500/50 transition-colors"
            >
              <div className="space-y-4">
                {/* Step Header: Large Serif Numeral & Icon */}
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl font-light text-espresso-soft/40 group-hover:text-terracotta-600 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-paper bg-canvas-paper border border-border flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-terracotta-600 font-sans">
                    {step.tag}
                  </span>
                  <h3 className="font-serif text-2xl font-medium text-espresso-dark">
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm text-espresso-muted leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-border-strong">
                  <ArrowRight className="w-5 h-5 text-espresso-soft" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

