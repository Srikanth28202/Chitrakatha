'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/i18n/context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  PaymentApiError,
  getPaymentStatus,
  loadStoredPaymentToken,
} from '@/lib/payment-client';
import { formatINR } from '@/lib/utils';
import type { PublicPaymentStatus } from '@/types/payment';

type ResultReason = 'cancelled' | 'failed' | 'verification' | 'missing' | 'unknown';

const COPY = {
  en: {
    checking: 'Checking your payment status…',
    successTitle: 'Payment successful',
    successDescription:
      'Your payment was verified on our server. Your order is confirmed and we will share delivery updates using the contact details you provided.',
    authorizedNote:
      'The payment is authorized. Razorpay is completing the capture; this can take a short while.',
    failedTitle: 'Payment could not be completed',
    failedDescription:
      'Your order is still pending. If money was not debited, you can safely try the payment again.',
    cancelledTitle: 'Payment cancelled',
    cancelledDescription:
      'The Razorpay window was closed before the payment was completed. Your order is still pending.',
    verificationTitle: 'Payment needs verification',
    verificationDescription:
      'We have not confirmed this payment yet. Please check the status again before trying another payment.',
    missingTitle: 'Payment details are missing',
    missingDescription:
      'Open this page from your order confirmation, or return to your cart and place the order again.',
    notConfirmedTitle: 'Payment is not confirmed yet',
    notConfirmedDescription:
      'Your order is still pending. If money was debited, do not pay again immediately. Refresh the status or contact support with your order number.',
    orderNumber: 'Order number',
    amountPaid: 'Amount paid',
    amountDue: 'Amount due',
    paymentStatus: 'Payment status',
    orderStatus: 'Order status',
    payAgain: 'Pay again',
    retryStatus: 'Refresh status',
    browseCollections: 'Browse collections',
    returnHome: 'Return home',
    backToCart: 'Back to cart',
    secureNote:
      'Payments are verified on the server. Razorpay secrets never reach your browser.',
    helpNote:
      'If money was debited but this page does not confirm payment, keep your order number ready and contact support before retrying.',
    itemsCount: 'Items',
    statusPending: 'Pending',
    statusAuthorized: 'Authorized',
    statusCaptured: 'Captured',
    statusFailed: 'Failed',
    statusRefunded: 'Refunded',
    orderPlaced: 'Placed',
    orderConfirmed: 'Confirmed',
    orderCancelled: 'Cancelled',
  },
  kn: {
    checking: 'ನಿಮ್ಮ ಪಾವತಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    successTitle: 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ',
    successDescription:
      'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ನಮ್ಮ ಸರ್ವರ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ನೀಡಿದ ಸಂಪರ್ಕ ವಿವರಗಳಿಗೆ ನಾವು ವಿತರಣಾ ನವೀಕರಣಗಳನ್ನು ಕಳುಹಿಸುತ್ತೇವೆ.',
    authorizedNote:
      'ಪಾವತಿ ಅಧಿಕೃತಗೊಂಡಿದೆ. ರೇಜರ್‌ಪೇ ಸೆರೆಹಿಡಿಯುವಿಕೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸುತ್ತಿದೆ; ಇದಕ್ಕೆ ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಬಹುದು.',
    failedTitle: 'ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ',
    failedDescription:
      'ನಿಮ್ಮ ಆರ್ಡರ್ ಇನ್ನೂ ಬಾಕಿಯಿದೆ. ಹಣ ಕಡಿತವಾಗದಿದ್ದರೆ ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತೆ ಪಾವತಿಸಬಹುದು.',
    cancelledTitle: 'ಪಾವತಿ ರದ್ದಾಗಿದೆ',
    cancelledDescription:
      'ಪಾವತಿ ಪೂರ್ಣಗೊಳ್ಳುವ ಮೊದಲು ರೇಜರ್‌ಪೇ ವಿಂಡೋ ಮುಚ್ಚಲಾಗಿದೆ. ನಿಮ್ಮ ಆರ್ಡರ್ ಇನ್ನೂ ಬಾಕಿಯಿದೆ.',
    verificationTitle: 'ಪಾವತಿಗೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    verificationDescription:
      'ಈ ಪಾವತಿಯನ್ನು ನಾವು ಇನ್ನೂ ದೃಢೀಕರಿಸಿಲ್ಲ. ಇನ್ನೊಂದು ಪಾವತಿ ಮಾಡುವ ಮೊದಲು ದಯವಿಟ್ಟು ಸ್ಥಿತಿಯನ್ನು ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.',
    missingTitle: 'ಪಾವತಿ ವಿವರಗಳು ಕಾಣೆಯಾಗಿವೆ',
    missingDescription:
      'ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಣದಿಂದ ಈ ಪುಟವನ್ನು ತೆರೆಯಿರಿ, ಅಥವಾ ಬುಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ ಆರ್ಡರ್ ಮತ್ತೆ ಮಾಡಿ.',
    notConfirmedTitle: 'ಪಾವತಿ ಇನ್ನೂ ದೃಢೀಕರಣಗೊಂಡಿಲ್ಲ',
    notConfirmedDescription:
      'ನಿಮ್ಮ ಆರ್ಡರ್ ಇನ್ನೂ ಬಾಕಿಯಿದೆ. ಹಣ ಕಡಿತವಾಗಿದ್ದರೆ ತಕ್ಷಣ ಮತ್ತೆ ಪಾವತಿಸಬೇಡಿ. ಸ್ಥಿತಿಯನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ ಅಥವಾ ಆರ್ಡರ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಸಹಾಯಕ್ಕಾಗಿ ಸಂಪರ್ಕಿಸಿ.',
    orderNumber: 'ಆರ್ಡರ್ ಸಂಖ್ಯೆ',
    amountPaid: 'ಪಾವತಿಸಿದ ಮೊತ್ತ',
    amountDue: 'ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ',
    paymentStatus: 'ಪಾವತಿ ಸ್ಥಿತಿ',
    orderStatus: 'ಆರ್ಡರ್ ಸ್ಥಿತಿ',
    payAgain: 'ಮತ್ತೆ ಪಾವತಿಸಿ',
    retryStatus: 'ಸ್ಥಿತಿ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ',
    browseCollections: 'ಸಂಗ್ರಹಗಳನ್ನು ನೋಡಿ',
    returnHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    backToCart: 'ಬುಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
    secureNote:
      'ಪಾವತಿಗಳನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ. ರೇಜರ್‌ಪೇ ರಹಸ್ಯಗಳು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ಗೆ ಎಂದಿಗೂ ಬರುವುದಿಲ್ಲ.',
    helpNote:
      'ಹಣ ಕಡಿತವಾಗಿದ್ದರೂ ಈ ಪುಟವು ಪಾವತಿಯನ್ನು ದೃಢೀಕರಿಸದಿದ್ದರೆ, ಆರ್ಡರ್ ಸಂಖ್ಯೆಯನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಂಡು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುವ ಮೊದಲು ಸಹಾಯಕ್ಕಾಗಿ ಸಂಪರ್ಕಿಸಿ.',
    itemsCount: 'ವಸ್ತುಗಳು',
    statusPending: 'ಬಾಕಿ',
    statusAuthorized: 'ಅಧಿಕೃತ',
    statusCaptured: 'ಯಶಸ್ವಿ',
    statusFailed: 'ವಿಫಲ',
    statusRefunded: 'ಮರುಪಾವತಿ',
    orderPlaced: 'ಇರಿಸಲಾಗಿದೆ',
    orderConfirmed: 'ದೃಢೀಕೃತ',
    orderCancelled: 'ರದ್ದು',
  },
} as const;

function normalizeReason(reason?: string): ResultReason {
  if (
    reason === 'cancelled' ||
    reason === 'failed' ||
    reason === 'verification' ||
    reason === 'missing'
  ) {
    return reason;
  }
  return 'unknown';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof PaymentApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function paymentPageUrl(orderNumber: string): string {
  return `/checkout/payment/${encodeURIComponent(orderNumber)}`;
}

function failureCopy(
  reason: ResultReason,
  copy: (typeof COPY)['en'] | (typeof COPY)['kn']
): { title: string; description: string } {
  if (reason === 'cancelled') {
    return { title: copy.cancelledTitle, description: copy.cancelledDescription };
  }
  if (reason === 'verification') {
    return { title: copy.verificationTitle, description: copy.verificationDescription };
  }
  if (reason === 'missing') {
    return { title: copy.missingTitle, description: copy.missingDescription };
  }
  return { title: copy.failedTitle, description: copy.failedDescription };
}

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

function orderStatusLabel(
  status: PublicPaymentStatus['orderStatus'],
  copy: (typeof COPY)['en'] | (typeof COPY)['kn']
): string {
  if (status === 'confirmed') return copy.orderConfirmed;
  if (status === 'cancelled') return copy.orderCancelled;
  return copy.orderPlaced;
}

export function PaymentResultView({
  kind,
  orderNumber,
  reason,
  message,
}: {
  kind: 'success' | 'failure';
  orderNumber?: string;
  reason?: string;
  message?: string;
}) {
  const { isKannada } = useLanguage();
  const copy = COPY[isKannada ? 'kn' : 'en'];
  const normalizedReason = normalizeReason(reason);

  const [paymentToken, setPaymentToken] = useState('');
  const [status, setStatus] = useState<PublicPaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderNumber));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // The access token is resolved from session storage only — never from the
  // URL — so it cannot leak through browser history, logs, or shared links.
  useEffect(() => {
    if (!orderNumber) {
      setIsLoading(false);
      return;
    }

    const resolved = loadStoredPaymentToken(orderNumber) || '';
    setPaymentToken(resolved);
    if (!resolved) setIsLoading(false);
  }, [orderNumber]);

  useEffect(() => {
    if (!orderNumber || !paymentToken) return;

    const controller = new AbortController();
    const lookupOrderNumber = orderNumber;
    const lookupPaymentToken = paymentToken;
    let active = true;

    async function loadStatus() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const nextStatus = await getPaymentStatus(
          lookupOrderNumber,
          lookupPaymentToken,
          controller.signal
        );
        if (active) setStatus(nextStatus);
      } catch (error) {
        if (!active) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError(getErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadStatus();

    return () => {
      active = false;
      controller.abort();
    };
  }, [orderNumber, paymentToken, reloadToken]);

  if (isLoading) {
    return (
      <div className="bg-canvas">
        <section className="py-12 md:py-20">
          <Container width="default">
            <Card variant="paper" className="p-10 text-center" aria-busy="true">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-terracotta-700" aria-hidden="true" />
              <p className="mt-3 text-sm text-espresso-muted">{copy.checking}</p>
            </Card>
          </Container>
        </section>
      </div>
    );
  }

  const isPaid =
    status?.paymentStatus === 'captured' || status?.paymentStatus === 'authorized';
  const isCaptured = status?.paymentStatus === 'captured';
  const isMissing = !orderNumber || !paymentToken;
  const failure = failureCopy(isMissing ? 'missing' : normalizedReason, copy);

  const showSuccess = Boolean(isPaid);
  const showNotConfirmed = Boolean(
    !isPaid && (kind === 'success' || normalizedReason === 'verification')
  );
  const canRetry = Boolean(
    orderNumber &&
      paymentToken &&
      status &&
      status.orderStatus !== 'cancelled' &&
      status.paymentStatus !== 'captured' &&
      status.paymentStatus !== 'refunded'
  );
  const canPayAgain = canRetry && !showNotConfirmed;
  const canRefreshStatus = Boolean(
    !isPaid &&
      orderNumber &&
      paymentToken &&
      (showNotConfirmed || !status)
  );

  const title = showSuccess
    ? copy.successTitle
    : showNotConfirmed
      ? copy.notConfirmedTitle
      : failure.title;

  const description = showSuccess
    ? isCaptured
      ? copy.successDescription
      : copy.authorizedNote
    : showNotConfirmed
      ? copy.notConfirmedDescription
      : failure.description;

  const Icon = showSuccess ? CheckCircle2 : showNotConfirmed ? Clock3 : AlertCircle;
  const iconClass = showSuccess
    ? 'border-sage-200 bg-sage-50 text-sage-700'
    : showNotConfirmed
      ? 'border-terracotta-200 bg-terracotta-50 text-terracotta-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <div className="bg-canvas">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="default">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.backToCart}
          </Link>

          <Card variant="elevated" className="mt-6 space-y-6 p-6 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full border ${iconClass}`}
              >
                <Icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h1 className="mt-5 font-serif text-3xl font-medium text-espresso-dark sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-espresso-muted">
                {description}
              </p>

              {status && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="terracotta">
                    {copy.orderNumber}: {status.orderNumber}
                  </Badge>
                  <Badge variant={isPaid ? 'sage' : showNotConfirmed ? 'paper' : 'rose'}>
                    {copy.paymentStatus}: {paymentStatusLabel(status.paymentStatus, copy)}
                  </Badge>
                  <Badge variant={status.orderStatus === 'cancelled' ? 'rose' : 'outline'}>
                    {copy.orderStatus}: {orderStatusLabel(status.orderStatus, copy)}
                  </Badge>
                </div>
              )}
            </div>

            {status && (
              <div className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {showSuccess ? copy.amountPaid : copy.amountDue}
                  </p>
                  <p className="mt-1 font-serif text-2xl font-bold text-espresso-dark">
                    {formatINR(status.totals.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {copy.itemsCount}
                  </p>
                  <p className="mt-1 text-sm font-medium text-espresso-main">
                    {status.items.reduce((total, line) => total + line.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {copy.orderNumber}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-espresso-main">
                    {status.orderNumber}
                  </p>
                </div>
              </div>
            )}

            {!isMissing && !isPaid && message && (
              <p className="rounded-paper border border-rose-200 bg-rose-50/70 p-3 text-xs leading-relaxed text-rose-800">
                {message}
              </p>
            )}

            {!isMissing && !isPaid && status?.payment.failureReason && (
              <p className="rounded-paper border border-rose-200 bg-rose-50/70 p-3 text-xs leading-relaxed text-rose-800">
                {status.payment.failureReason}
              </p>
            )}

            {loadError && (
              <p className="rounded-paper border border-terracotta-200 bg-terracotta-50/60 p-3 text-xs leading-relaxed text-terracotta-800">
                {loadError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border-subtle pt-6">
              {canPayAgain && orderNumber && paymentToken && (
                <Link href={paymentPageUrl(orderNumber)}>
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {copy.payAgain}
                  </Button>
                </Link>
              )}

              {canRefreshStatus && orderNumber && paymentToken && (
                <Button
                  variant={showNotConfirmed ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setReloadToken((value) => value + 1)}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  {copy.retryStatus}
                </Button>
              )}

              <Link href="/#collections">
                <Button
                  variant={showSuccess ? 'primary' : 'outline'}
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {copy.browseCollections}
                </Button>
              </Link>

              <Link href="/">
                <Button variant="ghost" size="md">
                  {copy.returnHome}
                </Button>
              </Link>
            </div>

            <div className="flex items-start gap-2 rounded-paper border border-border-subtle bg-canvas-paper p-3 text-xs leading-relaxed text-espresso-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage-700" aria-hidden="true" />
              <div>
                <p>{copy.secureNote}</p>
                {!isPaid && <p className="mt-1 text-espresso-soft">{copy.helpNote}</p>}
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}
