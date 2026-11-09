'use client';

import React from 'react';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Palette } from 'lucide-react';

export function CollectionPreview() {
  const { isKannada } = useLanguage();

  const editions = [
    {
      id: 'ed-06',
      number: 'Edition No. 06',
      numberKn: 'ಸಂಚಿಕೆ ೦೬',
      month: 'Ashwayuja Masa / October',
      titleEn: 'Echoes of Hampi',
      titleKn: 'ಹಂಪಿಯ ನೆನಪುಗಳು',
      descriptionEn:
        'A lyrical exploration of stone architecture, forgotten temple sculptures, and medieval Kannada inscriptions.',
      descriptionKn:
        'ಶಿಲಾ ಸೌಂದರ್ಯ, ಗತ ವೈಭವ ಮತ್ತು ಮಧ್ಯಕಾಲೀನ ಶಾಸನಗಳ ಕಾವ್ಯಾತ್ಮಕ ಆಯ್ದ ಸಂಕಲನ.',
      curator: 'Prof. Ananth Murthy & Shilpa Gowda',
      tag: 'Archived',
      variant: 'rose' as const,
    },
    {
      id: 'ed-07',
      number: 'Edition No. 07',
      numberKn: 'ಸಂಚಿಕೆ ೦೭',
      month: 'Karthika Masa / November',
      titleEn: 'The Whispering Sahyadri',
      titleKn: 'ಮೌನ ಸಹ್ಯಾದ್ರಿ',
      descriptionEn:
        'Rain-drenched Western Ghats folklore, rare botanical sketches, and classic environmental essays.',
      descriptionKn:
        'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಳೆಗಾಲದ ಜನಪದ ಕತೆಗಳು, ಅಪರೂಪದ ಸಸ್ಯಚಿತ್ರಗಳು ಮತ್ತು ಕಾವ್ಯದ ಒಡನಾಟ.',
      curator: 'Malnad Heritage Circle',
      tag: 'Current Edition',
      variant: 'terracotta' as const,
    },
    {
      id: 'ed-08',
      number: 'Edition No. 08',
      numberKn: 'ಸಂಚಿಕೆ ೦೮',
      month: 'Margashirsha / December',
      titleEn: 'Constellations of Kaveri',
      titleKn: 'ಕಾವೇರಿಯ ನಕ್ಷತ್ರಗಳು',
      descriptionEn:
        'Riverine mythologies, nocturnal gouache paintings, and intimate boatman ballads translated anew.',
      descriptionKn:
        'ನದಿಯ ಪೌರಾಣಿಕ ಕತೆಗಳು, ರಾತ್ರಿಯ ಜಲವರ್ಣ ಚಿತ್ರಗಳು ಹಾಗೂ ಅಂಬಿಗರ ಗೀತೆಗಳ ಹೊಸ ಅನುಭವ.',
      curator: 'Studio Chitrakatha Collective',
      tag: 'Upcoming',
      variant: 'sage' as const,
    },
  ];

  return (
    <section id="archive" className="py-20 bg-canvas subtle-paper-grain">
      <Container width="wide" className="space-y-16">
        <SectionHeading
          eyebrow={isKannada ? 'ಕಲಾ ಸಂಗ್ರಹಾಲಯ' : 'The Curatorial Archive'}
          title={isKannada ? 'ಕಳೆದ ಹಾಗೂ ಮುಂದಿನ ಸಂಚಿಕೆಗಳು' : 'The Creative Anthology'}
          kannadaTitle={isKannada ? undefined : 'ಕನ್ನಡದ ಕಲಾ ಪರಂಪರೆ ಮತ್ತು ಸಾಹಿತ್ಯ ಸಂಪುಟ'}
          description={
            isKannada
              ? 'ಪ್ರತಿ ತಿಂಗಳೂ ಹೊಸ ಆಲೋಚನೆ, ಹೊಸ ಚಿತ್ರಕಲೆಯೊಂದಿಗೆ ಸೀಮಿತ ಸಂಖ್ಯೆಯಲ್ಲಿ ಬಿಡುಗಡೆಗೊಳ್ಳುವ ವಿಶಿಷ್ಟ ಆವೃತ್ತಿಗಳು.'
              : 'Every month unveils an entirely distinct aesthetic universe, bound into an archival tangible parcel.'
          }
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {editions.map((edition) => (
            <Card
              key={edition.id}
              variant="bordered"
              className="group hover:border-terracotta-500/50 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="p-7 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant={edition.variant}>
                    {edition.tag}
                  </Badge>
                  <span className="text-xs text-espresso-soft font-sans flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {edition.month}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-terracotta-600 uppercase tracking-widest">
                    {isKannada ? edition.numberKn : edition.number}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-espresso-dark group-hover:text-terracotta-700 transition-colors">
                    {isKannada ? edition.titleKn : edition.titleEn}
                  </h3>
                  <p className="font-kannada text-sm text-espresso-soft">
                    {isKannada ? edition.titleEn : edition.titleKn}
                  </p>
                </div>

                <p className="text-sm text-espresso-muted leading-relaxed font-sans">
                  {isKannada ? edition.descriptionKn : edition.descriptionEn}
                </p>
              </div>

              <div className="px-7 py-4 bg-canvas-paper/50 border-t border-border-subtle flex items-center justify-between text-xs text-espresso-soft">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-terracotta-600" />
                  <span>{edition.curator}</span>
                </span>
                <span className="flex items-center gap-1 text-espresso-muted group-hover:text-terracotta-700 font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isKannada ? 'ವಿವರ' : 'Details'}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

