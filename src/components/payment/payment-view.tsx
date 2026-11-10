'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { EditionImage } from '@/components/collections/edition-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  PaymentApiError,
  getPaymentStatus,
  loadRazorpayCheckout,
  loadStoredPaymentToken,
  requestPaymentOrder,
  verifyPayment,
} from '@/lib/payment-client';
import { formatINR } from '@/lib/utils';
import type { PublicPaymentStatus } from '@/types/payment';

const COPY = {
  en: {
    eyebrow: 'Secure Razorpay Payment',
    title: 'Complete your payment',
    kannadaTitle: 'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
    description:
      'Review your pending order and pay securely through Razorpay. Prices come from the saved order and are never calculated in the browser.',
    backToCart: 'Back to cart',
    orderSummary: 'Order summary',
    amountDue: 'Amount due',
    orderNumber: 'Order number',
    paymentStatus: 'Payment status',
    deliveryTo: 'Delivering to',
    payNow: 'Pay securely with Razorpay',
    preparing: 'Preparing secure payment…',
    verifying: 'Verifying payment…',
    retryPayment: 'Retry payment',
    secureNote:
      'Razorpay processes your payment. Secret keys stay on our server and are never sent to your browser.',
    providerNote: 'Payments are verified on the server before your order is confirmed.',
    loading: 'Loading order and payment status…',
    loadErrorTitle: 'We could not load this payment',
    loadErrorDescription: 'Please retry. If you were charged, do not pay again.',
    retry: 'Retry',
    missingTokenTitle: 'Payment link is incomplete',
    missingTokenDescription:
      'Open the payment link from your order confirmation, or return to your cart and place the order again.',
    browseCollections: 'Browse collections',
    statusPending: 'Payment pending',
    statusAuthorized: 'Payment authorized',
    statusCaptured: 'Payment successful',
    statusFailed: 'Payment failed',
    statusRefunded: 'Payment refunded',
    alreadyPaid: 'This order is already paid.',
    cancelled: 'Payment cancelled',
    failed: 'Payment failed',
    lastError: 'Last payment error',
    cancelledNote:
      'The Razorpay window closed before payment was completed. Your order is still pending and can be paid again.',
    failedNote:
      'The payment was not completed. You can safely retry with the same pending order.',
    orderCancelled: 'This order has been cancelled and cannot be paid.',
    quantity: 'Quantity',
  },
  kn: {
    eyebrow: 'ಸುರಕ್ಷಿತ ರೇಜರ್‌ಪೇ ಪಾವತಿ',
    title: 'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ',
    kannadaTitle: 'Complete your payment',
    description:
      'ನಿಮ್ಮ ಬಾಕಿ ಆರ್ಡರ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ರೇಜರ್‌ಪೇ ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಿ. ಬೆಲೆಗಳು ಉಳಿಸಿದ ಆರ್ಡರ್‌ನಿಂದ ಬರುತ್ತವೆ ಮತ್ತು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲೆಕ್ಕಹಾಕುವುದಿಲ್ಲ.',
    backToCart: 'ಬುಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
    orderSummary: 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
    amountDue: 'ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ',
    orderNumber: 'ಆರ್ಡರ್ ಸಂಖ್ಯೆ',
    paymentStatus: 'ಪಾವತಿ ಸ್ಥಿತಿ',
    deliveryTo: 'ವಿತರಣೆ',
    payNow: 'ರೇಜರ್‌ಪೇ ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಿ',
    preparing: 'ಸುರಕ್ಷಿತ ಪಾವತಿ ಸಿದ್ಧಗೊಳಿಸಲಾಗುತ್ತಿದೆ…',
    verifying: 'ಪಾವತಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    retryPayment: 'ಪಾವತಿಯನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    secureNote:
      'ರೇಜರ್‌ಪೇ ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ನಿರ್ವಹಿಸುತ್ತದೆ. ರಹಸ್ಯ ಕೀಗಳು ನಮ್ಮ ಸರ್ವರ್‌ನಲ್ಲಿಯೇ ಉಳಿಯುತ್ತವೆ ಮತ್ತು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ಗೆ ಎಂದಿಗೂ ಕಳುಹಿಸುವುದಿಲ್ಲ.',
    providerNote: 'ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸುವ ಮೊದಲು ಪಾವತಿಯನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
    loading: 'ಆರ್ಡರ್ ಮತ್ತು ಪಾವತಿ ಸ್ಥಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
    loadErrorTitle: 'ಈ ಪಾವತಿಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    loadErrorDescription: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. ನಿಮ್ಮಿಂದ ಹಣ ಕಡಿತವಾಗಿದ್ದರೆ ಮತ್ತೆ ಪಾವತಿಸಬೇಡಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    missingTokenTitle: 'ಪಾವತಿ ಲಿಂಕ್ ಅಪೂರ್ಣವಾಗಿದೆ',
    missingTokenDescription:
      'ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಣದಿಂದ ಪಾವತಿ ಲಿಂಕ್ ತೆರೆಯಿರಿ, ಅಥವಾ ಬುಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ ಆರ್ಡರ್ ಮತ್ತೆ ಮಾಡಿ.',
    browseCollections: 'ಸಂಗ್ರಹಗಳನ್ನು ನೋಡಿ',
    statusPending: 'ಪಾವತಿ ಬಾಕಿ',
    statusAuthorized: 'ಪಾವತಿ ಅಧಿಕೃತಗೊಂಡಿದೆ',
    statusCaptured: 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ',
    statusFailed: 'ಪಾವತಿ ವಿಫಲವಾಗಿದೆ',
    statusRefunded: 'ಪಾವತಿ ಮರುಪಾವತಿಯಾಗಿದೆ',
    alreadyPaid: 'ಈ ಆರ್ಡರ್ ಈಗಾಗಲೇ ಪಾವತಿಯಾಗಿದೆ.',
    cancelled: 'ಪಾವತಿ ರದ್ದಾಗಿದೆ',
    failed: 'ಪಾವತಿ ವಿಫಲವಾಗಿದೆ',
    lastError: 'ಕೊನೆಯ ಪಾವತಿ ದೋಷ',
    cancelledNote:
      'ಪಾವತಿ ಪೂರ್ಣಗೊಳ್ಳುವ ಮೊದಲು ರೇಜರ್‌ಪೇ ವಿಂಡೋ ಮುಚ್ಚಲಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ಇನ್ನೂ ಬಾಕಿಯಿದ್ದು ಮತ್ತೆ ಪಾವತಿಸಬಹುದು.',
    failedNote: 'ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ. ಅದೇ ಬಾಕಿ ಆರ್ಡರ್‌ನೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಬಹುದು.',
    orderCancelled: 'ಈ ಆರ್ಡರ್ ರದ್ದಾಗಿದೆ ಮತ್ತು ಪಾವತಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
    quantity: 'ಪ್ರಮಾಣ',
  },
} as const;

function paymentStatusLabel(
  status: PublicPaymentStatus['paymentStatus'],
  copy: (typeof COPY)['en'] | (typeof COPY)['kn']
): string {
  if (status === 'captured') return copy.statusCaptured;
  if (status === 'authorized') return copy.statusAuthorized;
  if (status === 'failed') return copy.statusFailed;
  if (status === 'refunded') return copy.statusRefunded;
  return copy.statusPending;
}

function paymentStatusVariant(
  status: PublicPaymentStatus['paymentStatus']
): 'sage' | 'terracotta' | 'rose' | 'paper' {
  if (status === 'captured') return 'sage';
  if (status === 'authorized') return 'terracotta';
  if (status === 'failed' || status === 'refunded') return 'rose';
  return 'paper';
}

function successUrl(orderNumber: string): string {
  return `/checkout/payment/success?orderNumber=${encodeURIComponent(orderNumber)}`;
}

function failureUrl(
  orderNumber: string,
  reason: 'cancelled' | 'failed' | 'verification',
  message?: string
): string {
  const params = new URLSearchParams({ orderNumber, reason });
  if (message) params.set('message', message.slice(0, 300));
  return `/checkout/payment/failure?${params.toString()}`;
}

function getPaymentErrorMessage(error: unknown): string {
  if (error instanceof PaymentApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function PaymentView({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const { isKannada } = useLanguage();
  const copy = COPY[isKannada ? 'kn' : 'en'];

  const [paymentToken, setPaymentToken] = useState('');
  const [hasResolvedToken, setHasResolvedToken] = useState(false);
  const [status, setStatus] = useState<PublicPaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const navigatedRef = useRef(false);

  // The access token is resolved from session storage only — never from the
  // URL — so it cannot leak through browser history, logs, or shared links.
  // hasResolvedToken keeps the loading state on screen until storage has been
  // read, so visitors never see the missing-token card for an instant.
  useEffect(() => {
    const resolved = loadStoredPaymentToken(orderNumber) || '';
    setPaymentToken(resolved);
    setHasResolvedToken(true);
  }, [orderNumber]);

  useEffect(() => {
    if (!hasResolvedToken) return;

    if (!paymentToken) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadStatus() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextStatus = await getPaymentStatus(
          orderNumber,
          paymentToken,
          controller.signal
        );

        if (!active) return;
        setStatus(nextStatus);

        if (
          !navigatedRef.current &&
          (nextStatus.paymentStatus === 'captured' ||
            nextStatus.paymentStatus === 'authorized')
        ) {
          navigatedRef.current = true;
          router.replace(successUrl(orderNumber));
        }
      } catch (error) {
        if (!active) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError(getPaymentErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadStatus();

    return () => {
      active = false;
      controller.abort();
    };
  }, [orderNumber, paymentToken, hasResolvedToken, reloadToken, router]);

  const handlePay = async () => {
    if (!status || !paymentToken || isPaying || isVerifying) return;

    setIsPaying(true);
    setPaymentMessage(null);

    try {
      const paymentOrder = await requestPaymentOrder({
        orderNumber,
        paymentToken,
      });
      const RazorpayCheckout = await loadRazorpayCheckout();

      const checkout = new RazorpayCheckout({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'Chitrakatha',
        description: paymentOrder.description,
        order_id: paymentOrder.razorpayOrderId,
        prefill: paymentOrder.prefill,
        notes: {
          orderNumber: paymentOrder.orderNumber,
        },
        theme: {
          color: '#C86446',
        },
        retry: {
          enabled: true,
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (navigatedRef.current) return;
            navigatedRef.current = true;
            router.push(failureUrl(orderNumber, 'cancelled'));
          },
        },
        handler: async (response) => {
          if (navigatedRef.current) return;
          navigatedRef.current = true;
          setIsVerifying(true);

          try {
            await verifyPayment({
              orderNumber,
              paymentToken,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            router.replace(successUrl(orderNumber));
          } catch (error) {
            router.replace(
              failureUrl(orderNumber, 'verification', getPaymentErrorMessage(error))
            );
          } finally {
            setIsVerifying(false);
          }
        },
      });

      checkout.on('payment.failed', (...args: unknown[]) => {
        if (navigatedRef.current) return;
        const response = args[0] as
          | { error?: { description?: string; reason?: string } }
          | undefined;

        navigatedRef.current = true;
        router.push(
          failureUrl(
            orderNumber,
            'failed',
            response?.error?.description || response?.error?.reason
          )
        );
      });

      checkout.open();
    } catch (error) {
      setPaymentMessage(getPaymentErrorMessage(error));
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading || !hasResolvedToken) {
    return (
      <div className="bg-canvas">
        <section className="py-12 md:py-20">
          <Container width="default">
            <Card variant="paper" className="p-10 text-center" aria-busy="true">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-terracotta-700" aria-hidden="true" />
              <p className="mt-3 text-sm text-espresso-muted">{copy.loading}</p>
            </Card>
          </Container>
        </section>
      </div>
    );
  }

  if (!paymentToken) {
    return (
      <div className="bg-canvas">
        <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
          <Container width="default">
            <Card variant="elevated" className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-warm border border-border bg-canvas-paper text-terracotta-700">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="mt-5 font-serif text-3xl font-medium text-espresso-dark">
                {copy.missingTokenTitle}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-espresso-muted">
                {copy.missingTokenDescription}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/cart">
                  <Button variant="outline" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                    {copy.backToCart}
                  </Button>
                </Link>
                <Link href="/#collections">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {copy.browseCollections}
                  </Button>
                </Link>
              </div>
            </Card>
          </Container>
        </section>
      </div>
    );
  }

  if (loadError || !status) {
    return (
      <div className="bg-canvas">
        <section className="py-12 md:py-20">
          <Container width="default">
            <Card variant="paper" className="p-8 text-center sm:p-12">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-700" aria-hidden="true" />
              <h1 className="mt-4 font-serif text-2xl font-medium text-espresso-dark">
                {copy.loadErrorTitle}
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-espresso-muted">
                {copy.loadErrorDescription}
              </p>
              {loadError && <p className="mt-3 text-xs text-rose-700">{loadError}</p>}
              <Button
                variant="outline"
                size="md"
                className="mt-6"
                onClick={() => setReloadToken((value) => value + 1)}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                {copy.retry}
              </Button>
            </Card>
          </Container>
        </section>
      </div>
    );
  }

  const canPay =
    status.orderStatus !== 'cancelled' &&
    status.paymentStatus !== 'authorized' &&
    status.paymentStatus !== 'captured' &&
    status.paymentStatus !== 'refunded';

  return (
    <div className="bg-canvas">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="default" className="space-y-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.backToCart}
          </Link>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-700">
              {copy.eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-medium text-espresso-dark sm:text-4xl">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-espresso-muted">
              {copy.description}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-16">
        <Container width="default" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card variant="bordered" className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-medium text-espresso-dark">
                  {copy.orderSummary}
                </h2>
                <Badge variant={paymentStatusVariant(status.paymentStatus)}>
                  {paymentStatusLabel(status.paymentStatus, copy)}
                </Badge>
              </div>

              <div className="space-y-3">
                {status.items.map((line) => {
                  const title =
                    (isKannada ? line.titleKn : line.titleEn) || line.titleEn || line.slug;

                  return (
                    <div
                      key={`${line.slug}::${line.language}`}
                      className="flex items-center gap-3 rounded-paper border border-border-subtle bg-canvas-paper p-3"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-paper border border-border-subtle bg-canvas">
                        <EditionImage src={line.coverUrl} alt={title} className="aspect-square w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-espresso-main">{title}</p>
                        <p className="text-xs text-espresso-soft">
                          {copy.quantity}: {line.quantity} · {formatINR(line.unitPrice)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-espresso-main">
                        {formatINR(line.lineTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 border-t border-border-subtle pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {copy.orderNumber}
                  </p>
                  <p className="mt-1 font-medium text-espresso-main">{status.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {copy.deliveryTo}
                  </p>
                  <p className="mt-1 text-espresso-main">
                    {status.customer.name}
                    <br />
                    {status.address.city}, {status.address.state} {status.address.postalCode}
                  </p>
                </div>
              </div>
            </Card>

            {status.payment.failureReason && (
              <Card variant="paper" className="border-rose-200 bg-rose-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                  {copy.lastError}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-rose-800">
                  {status.payment.failureReason}
                </p>
              </Card>
            )}

            <Card variant="paper" className="space-y-2 p-4">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-espresso-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-700" aria-hidden="true" />
                <span>{copy.secureNote}</span>
              </div>
              <div className="flex items-start gap-2 text-xs leading-relaxed text-espresso-muted">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-sage-700" aria-hidden="true" />
                <span>{copy.providerNote}</span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card variant="elevated" className="space-y-5 p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-terracotta-700" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-wider text-espresso-soft">
                  {copy.amountDue}
                </p>
              </div>

              <p className="font-serif text-4xl font-bold text-espresso-dark">
                {formatINR(status.totals.totalAmount)}
              </p>

              <div className="space-y-2 border-t border-border-subtle pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-espresso-muted">{copy.orderSummary}</span>
                  <span className="font-medium text-espresso-main">
                    {formatINR(status.totals.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-espresso-soft">
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.deliveryTo}: {status.address.city}, {status.address.state}
                </div>
              </div>

              {status.orderStatus === 'cancelled' && (
                <p className="rounded-paper border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {copy.orderCancelled}
                </p>
              )}

              {status.paymentStatus === 'failed' && (
                <p className="rounded-paper border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {copy.failedNote}
                </p>
              )}

              {paymentMessage && (
                <p className="rounded-paper border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {paymentMessage}
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handlePay}
                disabled={!canPay}
                isLoading={isPaying || isVerifying}
                leftIcon={!isPaying && !isVerifying ? <LockKeyhole className="h-4 w-4" /> : undefined}
              >
                {isVerifying
                  ? copy.verifying
                  : isPaying
                    ? copy.preparing
                    : status.paymentStatus === 'failed'
                      ? copy.retryPayment
                      : copy.payNow}
              </Button>

              {status.paymentStatus === 'captured' && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-sage-800">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {copy.alreadyPaid}
                </div>
              )}
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
