'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/context';
import { monthlyCollectionsData, CollectionItem } from '@/data/collections';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils';
import { Calendar, Languages, Package, ArrowRight, Check, X } from 'lucide-react';

export function MonthlyCollections() {
  const { t, isKannada } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'archived'>('all');
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  const filteredCollections = monthlyCollectionsData.filter((col) => {
    if (activeFilter === 'available') return col.status === 'available' || col.status === 'reserve';
    if (activeFilter === 'archived') return col.status === 'archived';
    return true;
  });

  const getStatusBadge = (status: CollectionItem['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="terracotta">{t.collections.statusAvailable}</Badge>;
      case 'reserve':
        return <Badge variant="sage">{t.collections.statusReserve}</Badge>;
      case 'archived':
        return <Badge variant="paper">{t.collections.statusArchived}</Badge>;
    }
  };

  return (
    <section id="collections" className="py-20 md:py-28 bg-canvas subtle-paper-grain border-b border-border">
      <Container width="wide" className="space-y-12">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow={t.collections.eyebrow}
            title={t.collections.title}
            kannadaTitle={isKannada ? undefined : t.collections.kannadaTitle}
            description={t.collections.description}
            align="left"
            className="max-w-2xl"
          />

          {/* Filter Pills */}
          <div
            className="inline-flex items-center p-1 rounded-paper border border-border bg-canvas-paper/80 self-start md:self-auto text-xs"
            role="tablist"
            aria-label="Collection filter"
          >
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-canvas-card text-espresso-dark shadow-subtle font-semibold'
                  : 'text-espresso-muted hover:text-espresso-dark'
              }`}
            >
              {t.collections.filterAll}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('available')}
              className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
                activeFilter === 'available'
                  ? 'bg-canvas-card text-espresso-dark shadow-subtle font-semibold'
                  : 'text-espresso-muted hover:text-espresso-dark'
              }`}
            >
              {t.collections.filterAvailable}
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('archived')}
              className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
                activeFilter === 'archived'
                  ? 'bg-canvas-card text-espresso-dark shadow-subtle font-semibold'
                  : 'text-espresso-muted hover:text-espresso-dark'
              }`}
            >
              {t.collections.filterArchive}
            </button>
          </div>
        </div>

        {/* Collections Listing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              variant="bordered"
              className="group hover:border-terracotta-500/50 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="p-7 space-y-5">
                {/* Meta Bar: Month, Year, Season & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-2 text-xs text-espresso-soft font-sans">
                    <Calendar className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>
                      {isKannada ? collection.monthKn : collection.month} {collection.year}
                    </span>
                    <span className="text-border-strong">·</span>
                    <span className="font-serif italic">
                      {isKannada ? collection.seasonKn : collection.seasonEn}
                    </span>
                  </div>
                  {getStatusBadge(collection.status)}
                </div>

                {/* Collection Name & Description */}
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-espresso-dark group-hover:text-terracotta-700 transition-colors">
                    {isKannada ? collection.nameKn : collection.nameEn}
                  </h3>
                  <p className="font-kannada text-sm text-espresso-soft">
                    {isKannada ? collection.nameEn : collection.nameKn}
                  </p>
                  <p className="text-sm text-espresso-muted leading-relaxed font-sans pt-1">
                    {isKannada ? collection.descriptionKn : collection.descriptionEn}
                  </p>
                </div>

                {/* Metadata Tags */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-espresso-muted">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-paper bg-canvas-paper border border-border-subtle">
                    <Languages className="w-3.5 h-3.5 text-sage-600" />
                    <span>{t.collections.languageBadge}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-paper bg-canvas-paper border border-border-subtle">
                    <Package className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>{collection.itemsCount} {isKannada ? 'ಸಾಮಗ್ರಿಗಳು' : 'Items Included'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action & Price */}
              <div className="px-7 py-4 bg-canvas-paper/60 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-espresso-soft block">
                    {t.collections.priceLabel}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-bold text-espresso-dark">
                      {formatINR(collection.priceInr)}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCollection(collection)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {t.collections.viewCollection}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal: View Collection Details (No fake payment, clean inspection dialog) */}
        {selectedCollection && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-dark/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-canvas-card border border-border rounded-warm max-w-lg w-full p-6 sm:p-8 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(selectedCollection.status)}
                    <span className="text-xs text-espresso-soft font-serif">
                      {selectedCollection.seasonEn}
                    </span>
                  </div>
                  <h3 id="modal-title" className="font-serif text-2xl text-espresso-dark font-medium">
                    {isKannada ? selectedCollection.nameKn : selectedCollection.nameEn}
                  </h3>
                  <p className="font-kannada text-sm text-espresso-muted">
                    {isKannada ? selectedCollection.nameEn : selectedCollection.nameKn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCollection(null)}
                  className="p-1 rounded-paper text-espresso-muted hover:text-espresso-main hover:bg-canvas-paper border border-border"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-espresso-muted font-sans">
                <p className="leading-relaxed">
                  {isKannada ? selectedCollection.descriptionKn : selectedCollection.descriptionEn}
                </p>

                <div className="p-4 rounded-paper bg-canvas-paper/70 border border-border space-y-2">
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-espresso-soft">
                    {isKannada ? 'ಪೆಟ್ಟಿಗೆಯ ಸಾಮಗ್ರಿಗಳು:' : 'Included In This Parcel:'}
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>Deckle-edge Illustrated Story Letter (Kannada + English)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>2 Heavyweight 300gsm Archival Art Postcards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>Artisanal Matte Sticker Sheet</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>Letterpress Handcrafted Poetry Bookmark</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>Pocket 24-piece Art Scene Puzzle</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sage-600" />
                      <span>2 Heritage Architectural Colouring Sheets</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                  <div>
                    <span className="text-xs text-espresso-soft block">{t.collections.priceLabel}</span>
                    <span className="font-serif text-2xl font-bold text-espresso-dark">
                      {formatINR(selectedCollection.priceInr)}
                    </span>
                  </div>

                  <a
                    href="#subscription"
                    onClick={() => setSelectedCollection(null)}
                    className="inline-flex"
                  >
                    <Button variant="primary" size="md">
                      {t.subscription.reserveButton}
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

