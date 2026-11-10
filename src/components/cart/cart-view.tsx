'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { useCart } from '@/components/cart/cart-provider';
import { EditionImage } from '@/components/collections/edition-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { requestQuote } from '@/lib/checkout-client';
import { formatINR } from '@/lib/utils';
import type { CartLanguage } from '@/types/cart';
import type { CheckoutQuote } from '@/types/checkout';

const LANGUAGE_LABELS: Record<CartLanguage, { en: string; kn: string }> = {
  kannada: { en: 'Kannada', kn: 'ಕನ್ನಡ' },
  english: { en: 'English', kn: 'ಇಂಗ್ಲಿಷ್' },
  bilingual: { en: 'Bilingual', kn: 'ದ್ವಿಭಾಷಾ' },
};

const COPY = {
  en: {
    eyebrow: 'Your Parcel Selection',
    title: 'Shopping Cart',
    kannadaTitle: 'ನಿಮ್ಮ ಖರೀದಿ ಬುಟ್ಟಿ',
    description:
      'Review your selected editions, adjust quantities and proceed to our bilingual checkout.',
    continueShopping: 'Continue exploring collections',
    loading: 'Calculating your cart…',
    updating: 'Updating cart…',
    errorTitle: 'We could not update your cart',
    errorDescription:
      'Your cart is saved on this device. Please retry to recalculate server-verified prices.',
    retry: 'Retry',
    emptyTitle: 'Your cart is waiting for a story',
    emptyDescription:
      'Choose an available edition, select your preferred language and add it to your cart.',
    browseCollections: 'Browse collections',
    remove: 'Remove',
    quantity: 'Quantity',
    max: 'Max',
    each: 'each',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping estimate',
    free: 'Free',
    total: 'Total',
    couponNote: 'Coupons can be applied on the checkout page.',
    priceNote: 'Final prices and shipping are always calculated securely on our server.',
    checkout: 'Proceed to Checkout',
    pendingNote: 'No payment is collected yet. You can review the pending order details first.',
    calculating: 'Calculating totals',
    stockLimited: 'Limited stock',
  },
  kn: {
    eyebrow: 'ನಿಮ್ಮ ಆಯ್ದ ಸಂಪುಟಗಳು',
    title: 'ಖರೀದಿ ಬುಟ್ಟಿ',
    kannadaTitle: 'Shopping Cart',
    description:
      'ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಸಂಚಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಪ್ರಮಾಣ ಬದಲಿಸಿ ಮತ್ತು ದ್ವಿಭಾಷಾ ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ.',
    continueShopping: 'ಸಂಗ್ರಹಗಳನ್ನು ಮತ್ತೆ ನೋಡಿ',
    loading: 'ಬುಟ್ಟಿಯ ಬೆಲೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ…',
    updating: 'ಬುಟ್ಟಿ ನವೀಕರಣವಾಗುತ್ತಿದೆ…',
    errorTitle: 'ಬುಟ್ಟಿಯನ್ನು ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    errorDescription:
      'ನಿಮ್ಮ ಬುಟ್ಟಿ ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಸರ್ವರ್ ದೃಢೀಕೃತ ಬೆಲೆಗಳನ್ನು ಮತ್ತೊಮ್ಮೆ ಲೆಕ್ಕಹಾಕಲು ಪ್ರಯತ್ನಿಸಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    emptyTitle: 'ನಿಮ್ಮ ಬುಟ್ಟಿ ಒಂದು ಕಥೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ',
    emptyDescription:
      'ಲಭ್ಯವಿರುವ ಸಂಚಿಕೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ ಮತ್ತು ಬುಟ್ಟಿಗೆ ಸೇರಿಸಿ.',
    browseCollections: 'ಸಂಗ್ರಹಗಳನ್ನು ನೋಡಿ',
    remove: 'ತೆಗೆದುಹಾಕಿ',
    quantity: 'ಪ್ರಮಾಣ',
    max: 'ಗರಿಷ್ಠ',
    each: 'ಪ್ರತಿ ಪೆಟ್ಟಿಗೆ',
    orderSummary: 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
    subtotal: 'ಒಟ್ಟು ಬೆಲೆ',
    shipping: 'ರವಾನೆ ಅಂದಾಜು',
    free: 'ಉಚಿತ',
    total: 'ಒಟ್ಟು ಮೊತ್ತ',
    couponNote: 'ಕೂಪನ್‌ಗಳನ್ನು ಚೆಕ್‌ಔಟ್ ಪುಟದಲ್ಲಿ ಅನ್ವಯಿಸಬಹುದು.',
    priceNote: 'ಅಂತಿಮ ಬೆಲೆ ಮತ್ತು ರವಾನೆ ಶುಲ್ಕವನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
    checkout: 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ',
    pendingNote: 'ಇನ್ನೂ ಪಾವತಿ ಸಂಗ್ರಹಿಸಲಾಗಿಲ್ಲ. ಮೊದಲು ಬಾಕಿ ಆರ್ಡರ್ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.',
    calculating: 'ಒಟ್ಟು ಮೊತ್ತ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ',
    stockLimited: 'ಸೀಮಿತ ದಾಸ್ತಾನು',
  },
} as const;

function CartSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {[0, 1].map((index) => (
        <Card key={index} variant="bordered" className="p-4 sm:p-5">
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-paper bg-canvas-paper" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded-paper bg-canvas-paper" />
              <div className="h-3 w-1/3 animate-pulse rounded-paper bg-canvas-paper" />
              <div className="h-8 w-40 animate-pulse rounded-paper bg-canvas-paper" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CartView() {
  const { isKannada } = useLanguage();
  const { items, isReady, updateQuantity, removeItem } = useCart();
  const copy = COPY[isKannada ? 'kn' : 'en'];

  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!isReady) return;

    if (items.length === 0) {
      setQuote(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadQuote() {
      setIsLoading(true);
      setError(null);

      try {
        const nextQuote = await requestQuote({ items }, controller.signal);
        if (active) setQuote(nextQuote);
      } catch (loadError) {
        if (!active) return;
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;

        setError(loadError instanceof Error ? loadError.message : copy.errorTitle);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadQuote();

    return () => {
      active = false;
      controller.abort();
    };
  }, [items, isReady, reloadToken, copy.errorTitle]);

  const canCheckout = Boolean(quote && quote.items.length > 0 && !isLoading && !error);
  const totalBoxes = useMemo(
    () => quote?.items.reduce((total, line) => total + line.quantity, 0) ?? 0,
    [quote]
  );

  return (
    <div className="bg-canvas">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="wide" className="space-y-6">
          <Link
            href="/#collections"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.continueShopping}
          </Link>

          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            kannadaTitle={isKannada ? undefined : copy.kannadaTitle}
            description={copy.description}
            align="left"
            className="max-w-3xl"
          />
        </Container>
      </section>

      <section className="py-10 md:py-16">
        <Container width="wide">
          {!isReady ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <Card variant="paper" className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-warm border border-border bg-canvas-paper text-terracotta-700">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-medium text-espresso-dark sm:text-3xl">
                {copy.emptyTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-espresso-muted">
                {copy.emptyDescription}
              </p>
              <Link href="/#collections" className="mt-6 inline-flex">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  {copy.browseCollections}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                {error && (
                  <Card
                    variant="paper"
                    className="flex flex-col gap-3 border-terracotta-200 bg-terracotta-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                    role="alert"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-700"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-espresso-dark">{copy.errorTitle}</p>
                        <p className="mt-0.5 text-xs text-espresso-muted">{copy.errorDescription}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReloadToken((value) => value + 1)}
                      leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    >
                      {copy.retry}
                    </Button>
                  </Card>
                )}

                {!quote && isLoading ? (
                  <CartSkeleton />
                ) : quote ? (
                  <div className={isLoading ? 'space-y-4 opacity-70' : 'space-y-4'}>
                    {quote.items.map((line) => {
                      const title =
                        (isKannada ? line.titleKn : line.titleEn) || line.titleEn || line.slug;
                      const altTitle = isKannada ? line.titleEn : line.titleKn;
                      const languageLabel = isKannada
                        ? LANGUAGE_LABELS[line.language].kn
                        : LANGUAGE_LABELS[line.language].en;

                      return (
                        <Card key={`${line.slug}::${line.language}`} variant="bordered" className="p-4 sm:p-5">
                          <div className="flex gap-4">
                            <Link
                              href={`/collections/${line.slug}`}
                              className="w-24 shrink-0 overflow-hidden rounded-paper border border-border-subtle bg-canvas-paper sm:w-28"
                            >
                              <EditionImage
                                src={line.coverUrl}
                                alt={title}
                                className="aspect-square w-full"
                              />
                            </Link>

                            <div className="min-w-0 flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                  <Link
                                    href={`/collections/${line.slug}`}
                                    className="font-serif text-lg font-medium text-espresso-dark transition-colors hover:text-terracotta-700"
                                  >
                                    {title}
                                  </Link>
                                  {altTitle && (
                                    <p
                                      className={
                                        isKannada
                                          ? 'font-serif text-xs italic text-espresso-soft'
                                          : 'font-kannada text-sm text-espresso-soft'
                                      }
                                    >
                                      {altTitle}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <Badge variant="paper">{languageLabel}</Badge>
                                    <span className="text-xs text-espresso-soft">
                                      {formatINR(line.unitPrice)} {copy.each}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeItem(line.slug, line.language)}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-paper p-1.5 text-xs text-espresso-soft transition-colors hover:bg-rose-50 hover:text-rose-700"
                                  aria-label={`${copy.remove} ${title}`}
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  <span className="hidden sm:inline">{copy.remove}</span>
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] uppercase tracking-wider text-espresso-soft">
                                    {copy.quantity}
                                  </span>
                                  <div className="flex items-center rounded-paper border border-border bg-canvas-paper px-1 py-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(line.slug, line.language, line.quantity - 1)
                                      }
                                      disabled={line.quantity <= 1}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-paper text-espresso-muted transition-colors hover:bg-canvas hover:text-espresso-main disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label={isKannada ? 'ಪ್ರಮಾಣ ಕಡಿಮೆ ಮಾಡಿ' : 'Decrease quantity'}
                                    >
                                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                    <span className="min-w-7 text-center text-sm font-semibold text-espresso-dark">
                                      {line.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(line.slug, line.language, line.quantity + 1)
                                      }
                                      disabled={line.quantity >= line.maxQuantity}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-paper text-espresso-muted transition-colors hover:bg-canvas hover:text-espresso-main disabled:cursor-not-allowed disabled:opacity-40"
                                      aria-label={isKannada ? 'ಪ್ರಮಾಣ ಹೆಚ್ಚಿಸಿ' : 'Increase quantity'}
                                    >
                                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                  </div>
                                  <span className="text-[11px] text-espresso-soft">
                                    {copy.max} {line.maxQuantity}
                                  </span>
                                </div>

                                <span className="font-serif text-lg font-bold text-espresso-dark">
                                  {formatINR(line.lineTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : null}

                {isLoading && quote && (
                  <p className="flex items-center gap-2 text-xs text-espresso-soft" aria-live="polite">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    {copy.updating}
                  </p>
                )}
              </div>

              <aside className="lg:col-span-4">
                <Card variant="elevated" className="space-y-5 p-6 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-serif text-xl font-medium text-espresso-dark">
                      {copy.orderSummary}
                    </h2>
                    {totalBoxes > 0 && (
                      <Badge variant="paper">
                        {totalBoxes} {isKannada ? 'ಪೆಟ್ಟಿಗೆಗಳು' : 'boxes'}
                      </Badge>
                    )}
                  </div>

                  {!quote ? (
                    error ? (
                      <div className="space-y-3">
                        <p className="text-xs leading-relaxed text-espresso-muted">
                          {copy.errorDescription}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReloadToken((value) => value + 1)}
                          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                        >
                          {copy.retry}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3" aria-busy="true">
                        <div className="h-4 w-full animate-pulse rounded-paper bg-canvas-paper" />
                        <div className="h-4 w-2/3 animate-pulse rounded-paper bg-canvas-paper" />
                        <div className="h-8 w-1/2 animate-pulse rounded-paper bg-canvas-paper" />
                        <p className="text-xs text-espresso-soft">{copy.calculating}</p>
                      </div>
                    )
                  ) : (
                    <>
                      <dl className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-espresso-muted">{copy.subtotal}</dt>
                          <dd className="font-medium text-espresso-main">
                            {formatINR(quote.totals.basePrice)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <dt className="flex items-center gap-1.5 text-espresso-muted">
                            <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.shipping}
                          </dt>
                          <dd className="font-medium text-espresso-main">
                            {quote.shipping.freeShippingApplied
                              ? copy.free
                              : formatINR(quote.totals.shippingFee)}
                          </dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-border-subtle pt-3">
                          <dt className="font-semibold text-espresso-dark">{copy.total}</dt>
                          <dd className="font-serif text-2xl font-bold text-espresso-dark">
                            {formatINR(quote.totals.totalAmount)}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex items-start gap-2 rounded-paper border border-border-subtle bg-canvas-paper p-3 text-xs text-espresso-muted">
                        <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta-600" aria-hidden="true" />
                        <span>{copy.couponNote}</span>
                      </div>
                    </>
                  )}

                  {canCheckout ? (
                    <Link href="/checkout" className="block">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        {copy.checkout}
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="primary" size="md" className="w-full" disabled>
                      {copy.checkout}
                    </Button>
                  )}

                  <p className="text-[11px] leading-relaxed text-espresso-soft">{copy.priceNote}</p>
                  <p className="text-[11px] leading-relaxed text-espresso-faint">{copy.pendingNote}</p>
                </Card>
              </aside>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
