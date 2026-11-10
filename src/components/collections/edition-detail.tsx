'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  Languages,
  Layers,
  Minus,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useCart } from '@/components/cart/cart-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { EditionImage } from './edition-image';
import { CART_LIMITS } from '@/config/constants';
import { getEditionMonthLabel } from '@/lib/public-edition';
import { formatDate, formatINR } from '@/lib/utils';
import type { CartLanguage } from '@/types/cart';
import type {
  PublicEdition,
  PublicEditionItemType,
  PublicEditionLanguage,
} from '@/types/edition';

const ITEM_TYPE_LABELS: Record<PublicEditionItemType, { en: string; kn: string }> = {
  story_letter: { en: 'Story Letter', kn: 'ಕಥನ ಪತ್ರ' },
  art_card: { en: 'Art Card', kn: 'ಕಲಾ ಕಾರ್ಡ್' },
  sticker_sheet: { en: 'Sticker Sheet', kn: 'ಸ್ಟಿಕ್ಕರ್ ಹಾಳೆ' },
  bookmark: { en: 'Bookmark', kn: 'ಪುಸ್ತಕ ಗುರುತು' },
  puzzle: { en: 'Puzzle', kn: 'ಪಜಲ್' },
  colouring_sheet: { en: 'Colouring Sheet', kn: 'ಬಣ್ಣ ತುಂಬುವ ಹಾಳೆ' },
  keepsake: { en: 'Keepsake', kn: 'ನೆನಪಿನ ವಸ್ತು' },
};

const LANGUAGE_LABELS: Record<PublicEditionLanguage, { en: string; kn: string }> = {
  kannada: { en: 'Kannada', kn: 'ಕನ್ನಡ' },
  english: { en: 'English', kn: 'ಇಂಗ್ಲಿಷ್' },
  bilingual: { en: 'Bilingual', kn: 'ದ್ವಿಭಾಷಾ' },
};

interface EditionDetailProps {
  edition: PublicEdition;
}

export function EditionDetailView({ edition }: EditionDetailProps) {
  const { t, isKannada } = useLanguage();
  const { addItem } = useCart();

  const monthLabel = getEditionMonthLabel(edition.month, isKannada);
  const primaryTitle = (isKannada ? edition.titleKn : edition.titleEn) || edition.titleEn;
  const secondaryTitle = isKannada ? edition.titleEn : edition.titleKn;
  const description = (isKannada ? edition.descriptionKn : edition.descriptionEn) || edition.descriptionEn;
  const theme = (isKannada ? edition.themeKn : edition.themeEn) || edition.themeEn;
  const season = (isKannada ? edition.seasonKn : edition.seasonEn) || edition.seasonEn;
  const curator = (isKannada ? edition.curatorKn : edition.curatorEn) || edition.curatorEn;
  const isSoldOut = edition.status === 'sold_out';

  const availableLanguages: CartLanguage[] =
    edition.availableLanguages.length > 0 ? edition.availableLanguages : ['bilingual'];
  const defaultLanguage: CartLanguage = availableLanguages.includes('bilingual')
    ? 'bilingual'
    : (availableLanguages[0] ?? 'bilingual');
  const maxQuantity = Math.min(
    CART_LIMITS.MAX_QUANTITY_PER_ITEM,
    Math.max(0, edition.stock)
  );
  const isPurchasable = !isSoldOut && maxQuantity > 0;

  const [selectedLanguage, setSelectedLanguage] = useState<CartLanguage>(defaultLanguage);
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState<
    'added' | 'quantity_limit' | 'cart_limit' | 'invalid' | null
  >(null);

  const handleAddToCart = () => {
    const result = addItem({
      slug: edition.slug,
      language: selectedLanguage,
      quantity,
    });

    setCartFeedback(result.ok ? 'added' : result.reason);
  };

  const statusBadge = (
    <Badge
      variant={
        edition.status === 'active' ? 'terracotta' : edition.status === 'upcoming' ? 'sage' : 'paper'
      }
    >
      {edition.status === 'active'
        ? t.collections.statusAvailable
        : edition.status === 'upcoming'
          ? t.collections.statusReserve
          : t.collections.statusSoldOut}
    </Badge>
  );

  const languageLabel = edition.availableLanguages.length
    ? edition.availableLanguages
        .map((language) =>
          isKannada ? LANGUAGE_LABELS[language].kn : LANGUAGE_LABELS[language].en
        )
        .join(' · ')
    : isKannada
      ? 'ದ್ವಿಭಾಷಾ'
      : 'Bilingual';

  const galleryUrls = edition.images.galleryUrls.filter(Boolean);

  return (
    <div className="bg-canvas">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="wide" className="space-y-8">
          <Link
            href="/#collections"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {isKannada ? 'ಸಂಗ್ರಹಗಳಿಗೆ ಹಿಂತಿರುಗಿ' : 'Back to collections'}
          </Link>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="overflow-hidden rounded-warm border border-border bg-canvas-paper shadow-card">
                <EditionImage
                  src={edition.images.coverUrl}
                  alt={primaryTitle}
                  className="aspect-[4/5] max-h-[640px] w-full"
                />
              </div>

              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryUrls.slice(0, 6).map((url) => (
                    <div
                      key={url}
                      className="overflow-hidden rounded-paper border border-border bg-canvas-paper"
                    >
                      <EditionImage
                        src={url}
                        alt={primaryTitle}
                        className="aspect-square w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                {statusBadge}
                <span className="flex items-center gap-1.5 text-xs text-espresso-soft">
                  <Calendar className="h-3.5 w-3.5 text-terracotta-600" aria-hidden="true" />
                  {monthLabel} {edition.year}
                </span>
                {season && (
                  <>
                    <span className="text-border-strong" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-serif text-xs italic text-espresso-soft">{season}</span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta-600">
                  {isKannada ? 'ಮಾಸಿಕ ಸಂಚಿಕೆ' : 'Monthly Edition'}
                </span>
                <h1 className="font-serif text-3xl font-medium leading-tight tracking-tight text-espresso-dark sm:text-4xl md:text-5xl">
                  {primaryTitle}
                </h1>
                {secondaryTitle && (
                  <p
                    className={
                      isKannada
                        ? 'font-serif text-lg italic text-terracotta-700'
                        : 'font-kannada text-xl text-terracotta-700'
                    }
                  >
                    {secondaryTitle}
                  </p>
                )}
              </div>

              <p className="max-w-2xl font-sans text-base leading-relaxed text-espresso-muted">
                {description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-espresso-muted">
                {theme && (
                  <span className="inline-flex items-center gap-1.5 rounded-paper border border-border-subtle bg-canvas-paper px-2.5 py-1">
                    <Palette className="h-3.5 w-3.5 text-terracotta-600" aria-hidden="true" />
                    {theme}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-paper border border-border-subtle bg-canvas-paper px-2.5 py-1">
                  <Languages className="h-3.5 w-3.5 text-sage-600" aria-hidden="true" />
                  {languageLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-paper border border-border-subtle bg-canvas-paper px-2.5 py-1">
                  <Package className="h-3.5 w-3.5 text-terracotta-600" aria-hidden="true" />
                  {edition.includedItems.length}{' '}
                  {isKannada ? 'ಸಾಮಗ್ರಿಗಳು' : 'items included'}
                </span>
              </div>

              {curator && (
                <p className="text-sm text-espresso-muted">
                  <span className="font-semibold text-espresso-main">
                    {isKannada ? 'ಕ್ಯುರೇಟರ್:' : 'Curated by:'}
                  </span>{' '}
                  {curator}
                </p>
              )}

              <Card variant="paper" className="p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="space-y-3">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider text-espresso-soft">
                        {t.collections.priceLabel}
                      </span>
                      <span className="font-serif text-3xl font-bold text-espresso-dark">
                        {formatINR(edition.price)}
                      </span>
                    </div>
                    {edition.recurringPrice > 0 && (
                      <p className="text-xs text-espresso-soft">
                        {isKannada ? 'ಚಂದಾದಾರಿಕೆ ಬೆಲೆ:' : 'Subscription price:'}{' '}
                        <span className="font-semibold text-espresso-main">
                          {formatINR(edition.recurringPrice)}
                        </span>
                      </p>
                    )}
                  </div>

                  {!isPurchasable && (
                    <span className="inline-flex items-center rounded-paper border border-border bg-canvas-paper px-4 py-2.5 text-sm font-semibold text-espresso-soft">
                      {isSoldOut
                        ? t.collections.statusSoldOut
                        : isKannada
                          ? 'ದಾಸ್ತಾನು ಖಾಲಿಯಾಗಿದೆ'
                          : 'Out of stock'}
                    </span>
                  )}
                </div>

                {isPurchasable && (
                  <div className="mt-5 space-y-3 border-t border-border-subtle pt-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-espresso-soft">
                          {isKannada ? 'ಭಾಷೆ' : 'Language'}
                        </span>
                        <select
                          value={selectedLanguage}
                          onChange={(event) => {
                            setSelectedLanguage(event.target.value as CartLanguage);
                            setCartFeedback(null);
                          }}
                          className="w-full rounded-paper border border-border bg-canvas px-3 py-2 text-sm text-espresso-main focus:border-terracotta-600 focus:outline-none focus:ring-1 focus:ring-terracotta-600"
                        >
                          {availableLanguages.map((language) => (
                            <option key={language} value={language}>
                              {isKannada
                                ? LANGUAGE_LABELS[language].kn
                                : LANGUAGE_LABELS[language].en}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-espresso-soft">
                          {isKannada ? 'ಪ್ರಮಾಣ' : 'Quantity'}
                        </span>
                        <div className="flex items-center justify-between rounded-paper border border-border bg-canvas px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setQuantity((value) => Math.max(1, value - 1));
                              setCartFeedback(null);
                            }}
                            disabled={quantity <= 1}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-paper text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={isKannada ? 'ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ' : 'Decrease quantity'}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span
                            className="min-w-8 text-center text-sm font-semibold text-espresso-dark"
                            aria-live="polite"
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuantity((value) => Math.min(maxQuantity, value + 1));
                              setCartFeedback(null);
                            }}
                            disabled={quantity >= maxQuantity}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-paper text-espresso-muted transition-colors hover:bg-canvas-paper hover:text-espresso-main disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={isKannada ? 'ಪ್ರಮಾಣ ಹೆಚ್ಚಿಸಿ' : 'Increase quantity'}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      onClick={handleAddToCart}
                      leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
                    >
                      {isKannada ? 'ಬುಟ್ಟಿಗೆ ಸೇರಿಸಿ' : 'Add to Cart'}
                    </Button>

                    <div className="min-h-5 text-xs" aria-live="polite">
                      {cartFeedback === 'added' && (
                        <p className="text-sage-700">
                          {isKannada
                            ? 'ಬುಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ.'
                            : 'Added to your cart.'}{' '}
                          <Link
                            href="/cart"
                            className="font-semibold underline underline-offset-2 hover:text-sage-800"
                          >
                            {isKannada ? 'ಬುಟ್ಟಿ ನೋಡಿ' : 'View cart'}
                          </Link>
                        </p>
                      )}
                      {cartFeedback === 'quantity_limit' && (
                        <p className="text-terracotta-700">
                          {isKannada
                            ? `ಒಂದೇ ಸಂಚಿಕೆಗೆ ಗರಿಷ್ಠ ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} ಪೆಟ್ಟಿಗೆಗಳು.`
                            : `Maximum ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} boxes per edition line.`}
                        </p>
                      )}
                      {cartFeedback === 'cart_limit' && (
                        <p className="text-terracotta-700">
                          {isKannada
                            ? 'ಬುಟ್ಟಿಯಲ್ಲಿ ಇನ್ನಷ್ಟು ವಿವಿಧ ಸಂಚಿಕೆಗಳನ್ನು ಸೇರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
                            : 'Your cart has reached the maximum number of different editions.'}
                        </p>
                      )}
                      {cartFeedback === 'invalid' && (
                        <p className="text-terracotta-700">
                          {isKannada
                            ? 'ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
                            : 'Please try adding the edition again.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border-subtle pt-3 text-xs text-espresso-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                    {isKannada ? 'ರವಾನೆ:' : 'Dispatch:'} {formatDate(edition.dispatchDate)}
                  </span>
                  <span>
                    {isKannada ? 'ದಾಸ್ತಾನು:' : 'Stock:'} {edition.stock}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-canvas-paper/60 py-12 md:py-16">
        <Container width="wide" className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
                <Layers className="h-4 w-4" aria-hidden="true" />
                {isKannada ? 'ಸಂಪುಟದ ಒಳಗೆ' : 'Inside this parcel'}
              </div>
              <h2 className="font-serif text-2xl font-medium text-espresso-dark sm:text-3xl">
                {isKannada ? 'ಏನೆಲ್ಲಾ ಇದೆ?' : 'Everything included'}
              </h2>
              <p className="text-sm text-espresso-muted">
                {edition.includedItems.length}{' '}
                {isKannada ? 'ಆಯ್ದ ಸಾಮಗ್ರಿಗಳು' : 'thoughtfully curated keepsakes'}
              </p>
            </div>

            {edition.includedItems.length === 0 ? (
              <Card variant="paper" className="p-6 text-sm text-espresso-muted">
                {isKannada
                  ? 'ಈ ಸಂಚಿಕೆಯ ಸಾಮಗ್ರಿಗಳ ವಿವರ ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟವಾಗಲಿದೆ.'
                  : 'The contents of this edition will be published soon.'}
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {edition.includedItems.map((item) => {
                  const name = (isKannada ? item.nameKn : item.nameEn) || item.nameEn;
                  const altName = isKannada ? item.nameEn : item.nameKn;
                  const itemDescription = isKannada ? item.descKn : item.descEn;
                  const typeLabel = isKannada
                    ? ITEM_TYPE_LABELS[item.itemType].kn
                    : ITEM_TYPE_LABELS[item.itemType].en;

                  return (
                    <Card key={item.id} variant="bordered" className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sage-200 bg-sage-50 text-sage-700">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 space-y-1">
                            <h3 className="font-serif text-lg font-medium text-espresso-dark">
                              {name}
                            </h3>
                            {altName && (
                              <p
                                className={
                                  isKannada
                                    ? 'font-serif text-xs text-espresso-soft'
                                    : 'font-kannada text-sm text-espresso-soft'
                                }
                              >
                                {altName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="paper" className="shrink-0">
                          {typeLabel}
                        </Badge>
                      </div>

                      {itemDescription && (
                        <p className="mt-3 text-xs leading-relaxed text-espresso-muted">
                          {itemDescription}
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <Card variant="bordered" className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-espresso-main">
                <BookOpen className="h-4 w-4 text-terracotta-600" aria-hidden="true" />
                {isKannada ? 'ಸಂಚಿಕೆಯ ವಿವರ' : 'Edition details'}
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-3">
                  <dt className="text-espresso-soft">{isKannada ? 'ಅವಧಿ' : 'Period'}</dt>
                  <dd className="text-right font-medium text-espresso-main">
                    {monthLabel} {edition.year}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-3">
                  <dt className="text-espresso-soft">{isKannada ? 'ಥೀಮ್' : 'Theme'}</dt>
                  <dd className="text-right font-medium text-espresso-main">{theme || '—'}</dd>
                </div>
                {season && (
                  <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-3">
                    <dt className="text-espresso-soft">{isKannada ? 'ಋತು' : 'Season'}</dt>
                    <dd className="text-right font-medium text-espresso-main">{season}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-3">
                  <dt className="text-espresso-soft">
                    {isKannada ? 'ಲಭ್ಯವಿರುವ ಭಾಷೆಗಳು' : 'Languages'}
                  </dt>
                  <dd className="text-right font-medium text-espresso-main">{languageLabel}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-espresso-soft">{isKannada ? 'ರವಾನೆ ದಿನಾಂಕ' : 'Dispatch'}</dt>
                  <dd className="text-right font-medium text-espresso-main">
                    {formatDate(edition.dispatchDate)}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card variant="paper" className="p-6">
              <p className="text-xs leading-relaxed text-espresso-muted">
                {isKannada
                  ? 'ಇದು ದ್ವಿಭಾಷಾ ಸಂಚಿಕೆ. ಮೇಲಿನ ಭಾಷೆ ಬದಲಾವಣೆಯ ಮೂಲಕ ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡ ವಿಷಯವನ್ನು ಓದಬಹುದು.'
                  : 'This is a bilingual edition. Use the language switcher in the header to read the English and Kannada content.'}
              </p>
            </Card>
          </aside>
        </Container>
      </section>
    </div>
  );
}
