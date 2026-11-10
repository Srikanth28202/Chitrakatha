'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/context';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditionImage } from '@/components/collections/edition-image';
import { getEditionMonthLabel, normalizePublicEdition } from '@/lib/public-edition';
import { formatINR } from '@/lib/utils';
import type { PublicEdition } from '@/types/edition';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Languages,
  Package,
  Palette,
  RefreshCw,
} from 'lucide-react';

type CollectionFilter = 'all' | 'available' | 'upcoming';

interface EditionsApiResponse {
  success?: boolean;
  data?: unknown;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
  error?: { message?: string };
}

const EDITIONS_PAGE_SIZE = 12;

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
        active
          ? 'bg-canvas-card text-espresso-dark shadow-subtle font-semibold'
          : 'text-espresso-muted hover:text-espresso-dark'
      }`}
    >
      {children}
    </button>
  );
}

function CollectionSkeleton() {
  return (
    <Card variant="bordered" className="flex flex-col">
      <div className="aspect-[16/10] w-full animate-pulse bg-canvas-paper" />
      <div className="space-y-4 p-7">
        <div className="h-3 w-1/3 animate-pulse rounded-paper bg-canvas-paper" />
        <div className="h-7 w-3/4 animate-pulse rounded-paper bg-canvas-paper" />
        <div className="h-4 w-1/2 animate-pulse rounded-paper bg-canvas-paper" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full animate-pulse rounded-paper bg-canvas-paper" />
          <div className="h-3 w-11/12 animate-pulse rounded-paper bg-canvas-paper" />
        </div>
        <div className="h-9 w-full animate-pulse rounded-paper bg-canvas-paper" />
      </div>
    </Card>
  );
}

export function MonthlyCollections() {
  const { t, isKannada } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>('all');
  const [editions, setEditions] = useState<PublicEdition[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadEditions() {
      const isInitialLoad = page === 1;
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      // Filtering happens server-side so pagination stays correct for each
      // tab instead of only paginating the unfiltered list.
      const statusParam =
        activeFilter === 'available'
          ? 'active'
          : activeFilter === 'upcoming'
            ? 'upcoming'
            : '';
      const query = `limit=${EDITIONS_PAGE_SIZE}&page=${page}` +
        (statusParam ? `&status=${statusParam}` : '');

      try {
        const response = await fetch(`/api/editions?${query}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = (await response.json().catch(() => null)) as EditionsApiResponse | null;

        if (!response.ok || payload?.success !== true || !Array.isArray(payload.data)) {
          throw new Error(payload?.error?.message || 'Unable to load editions');
        }

        if (!isActive) return;

        const normalized = payload.data
          .map(normalizePublicEdition)
          .filter((edition): edition is PublicEdition => edition !== null);

        const totalPages = Math.max(1, payload.meta?.totalPages ?? 1);
        setEditions((previous) => (page === 1 ? normalized : [...previous, ...normalized]));
        setHasMore(page < totalPages);
      } catch (loadError) {
        if (!isActive) return;
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;

        setEditions([]);
        setHasMore(false);
        setError(loadError instanceof Error ? loadError.message : 'Unable to load editions');
      } finally {
        if (isActive) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    void loadEditions();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [activeFilter, page, reloadToken]);

  function handleFilterChange(filter: CollectionFilter) {
    setActiveFilter(filter);
    setPage(1);
  }

  const filteredCollections = editions;

  const getStatusBadge = (status: PublicEdition['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="terracotta">{t.collections.statusAvailable}</Badge>;
      case 'upcoming':
        return <Badge variant="sage">{t.collections.statusReserve}</Badge>;
      default:
        return <Badge variant="paper">{t.collections.statusSoldOut}</Badge>;
    }
  };

  const getLanguageLabel = (edition: PublicEdition) => {
    if (edition.availableLanguages.length === 0) {
      return t.collections.languageBadge;
    }

    if (edition.availableLanguages.includes('bilingual')) {
      return t.collections.languageBadge;
    }

    return edition.availableLanguages
      .map((language) => {
        if (language === 'kannada') return isKannada ? 'ಕನ್ನಡ' : 'Kannada';
        return isKannada ? 'ಇಂಗ್ಲಿಷ್' : 'English';
      })
      .join(' · ');
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
            role="group"
            aria-label={isKannada ? 'ಸಂಗ್ರಹಗಳ ಶೋಧನೆ' : 'Collection filter'}
          >
            <FilterPill active={activeFilter === 'all'} onClick={() => handleFilterChange('all')}>
              {t.collections.filterAll}
            </FilterPill>
            <FilterPill
              active={activeFilter === 'available'}
              onClick={() => handleFilterChange('available')}
            >
              {t.collections.filterAvailable}
            </FilterPill>
            <FilterPill
              active={activeFilter === 'upcoming'}
              onClick={() => handleFilterChange('upcoming')}
            >
              {t.collections.filterUpcoming}
            </FilterPill>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            aria-busy="true"
            aria-live="polite"
          >
            <CollectionSkeleton />
            <CollectionSkeleton />
          </div>
        ) : error ? (
          <Card variant="paper" className="p-10 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-terracotta-700">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-medium text-espresso-dark">
              {isKannada ? 'ಸಂಪುಟಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Unable to load collections'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-espresso-muted">
              {isKannada
                ? 'ಸಂಪರ್ಕದಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ತೊಂದರೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
                : 'There was a temporary problem reaching the catalogue. Please try again.'}
            </p>
            <p className="mx-auto mt-1 max-w-md text-[11px] text-espresso-faint">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => setReloadToken((value) => value + 1)}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              {isKannada ? 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' : 'Try again'}
            </Button>
          </Card>
        ) : filteredCollections.length === 0 ? (
          <Card variant="paper" className="p-10 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-medium text-espresso-dark">
              {isKannada ? 'ಯಾವುದೇ ಸಂಪುಟಗಳು ಲಭ್ಯವಿಲ್ಲ' : 'No collections available yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-espresso-muted">
              {isKannada
                ? 'ಹೊಸ ಸಂಚಿಕೆಗಳು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟವಾಗಲಿವೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಭೇಟಿ ನೀಡಿ.'
                : 'New editions will be published soon. Please check back shortly.'}
            </p>
            {activeFilter !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => handleFilterChange('all')}
              >
                {t.collections.filterAll}
              </Button>
            )}
          </Card>
        ) : (
          /* Collections Listing Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCollections.map((collection) => {
              const title = (isKannada ? collection.titleKn : collection.titleEn) || collection.titleEn;
              const altTitle = isKannada ? collection.titleEn : collection.titleKn;
              const description =
                (isKannada ? collection.descriptionKn : collection.descriptionEn) ||
                collection.descriptionEn;
              const theme = (isKannada ? collection.themeKn : collection.themeEn) || collection.themeEn;
              const season =
                (isKannada ? collection.seasonKn : collection.seasonEn) || collection.seasonEn;
              const monthLabel = getEditionMonthLabel(collection.month, isKannada);

              return (
                <Card
                  key={collection.id}
                  variant="bordered"
                  className="group hover:border-terracotta-500/50 hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="overflow-hidden border-b border-border-subtle bg-canvas-paper">
                      <EditionImage
                        src={collection.images.coverUrl}
                        alt={title}
                        className="aspect-[16/10] w-full transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="p-7 space-y-5">
                      {/* Meta Bar: Month, Year, Season/Theme & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
                        <div className="flex items-center gap-2 text-xs text-espresso-soft font-sans">
                          <Calendar className="w-3.5 h-3.5 text-terracotta-600" aria-hidden="true" />
                          <span>
                            {monthLabel} {collection.year}
                          </span>
                          {(season || theme) && (
                            <>
                              <span className="text-border-strong">·</span>
                              <span className="font-serif italic">{season || theme}</span>
                            </>
                          )}
                        </div>
                        {getStatusBadge(collection.status)}
                      </div>

                      {/* Collection Name & Description */}
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-espresso-dark group-hover:text-terracotta-700 transition-colors">
                          {title}
                        </h3>
                        {altTitle && (
                          <p
                            className={
                              isKannada
                                ? 'font-serif text-sm italic text-espresso-soft'
                                : 'font-kannada text-sm text-espresso-soft'
                            }
                          >
                            {altTitle}
                          </p>
                        )}
                        <p className="text-sm text-espresso-muted leading-relaxed font-sans pt-1">
                          {description}
                        </p>
                      </div>

                      {/* Metadata Tags */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-espresso-muted">
                        {theme && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-paper bg-canvas-paper border border-border-subtle">
                            <Palette className="w-3.5 h-3.5 text-terracotta-600" aria-hidden="true" />
                            <span>{theme}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-paper bg-canvas-paper border border-border-subtle">
                          <Languages className="w-3.5 h-3.5 text-sage-600" aria-hidden="true" />
                          <span>{getLanguageLabel(collection)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-paper bg-canvas-paper border border-border-subtle">
                          <Package className="w-3.5 h-3.5 text-terracotta-600" aria-hidden="true" />
                          <span>
                            {collection.includedItems.length}{' '}
                            {isKannada ? 'ಸಾಮಗ್ರಿಗಳು' : 'Items Included'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card Action & Price */}
                  <div className="px-7 py-4 bg-canvas-paper/60 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-espresso-soft block">
                        {t.collections.priceLabel}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-2xl font-bold text-espresso-dark">
                          {formatINR(collection.price)}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/collections/${collection.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-paper border border-espresso-main/40 px-3.5 py-1.5 text-xs font-medium text-espresso-main transition-colors hover:border-espresso-main hover:bg-espresso-main/[0.03]"
                    >
                      {t.collections.viewCollection}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!isLoading && !error && filteredCollections.length > 0 && hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setPage((value) => value + 1)}
              isLoading={isLoadingMore}
              leftIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {isKannada ? 'ಹೆಚ್ಚಿನ ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ' : 'Load more editions'}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
