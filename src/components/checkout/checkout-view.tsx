'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Tag,
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
import {
  CheckoutApiError,
  requestQuote,
  submitPendingOrder,
} from '@/lib/checkout-client';
import { storePaymentToken } from '@/lib/payment-client';
import { formatINR } from '@/lib/utils';
import type { CheckoutQuote, PendingOrderSummary } from '@/types/checkout';

interface CheckoutFormState {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
}

type FieldErrors = Partial<Record<keyof CheckoutFormState, string>>;

const EMPTY_FORM: CheckoutFormState = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  pincode: '',
};

const COPY = {
  en: {
    eyebrow: 'Secure Checkout',
    title: 'Complete Your Order',
    kannadaTitle: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಿ',
    description:
      'Share your contact details and Karnataka delivery address. No payment is collected in this phase.',
    backToCart: 'Back to cart',
    contactTitle: 'Contact details',
    contactDescription: 'We use these details only for order updates and delivery coordination.',
    name: 'Full name',
    namePlaceholder: 'e.g. Kavya Hegde',
    email: 'Email address',
    emailPlaceholder: 'kavya@example.com',
    phone: 'Mobile number',
    phonePlaceholder: '98450 12345',
    addressTitle: 'Delivery address',
    addressDescription: 'We currently deliver within Karnataka only.',
    line1: 'Address line 1',
    line1Placeholder: 'House / building, street',
    line2: 'Address line 2 (optional)',
    line2Placeholder: 'Area, landmark',
    city: 'City or town',
    cityPlaceholder: 'e.g. Bengaluru',
    state: 'State',
    stateValue: 'Karnataka',
    pincode: 'Pincode',
    pincodePlaceholder: '560001',
    guestTitle: 'Guest checkout',
    guestDescription:
      'No account is required. Your order is created in a pending state so you can review it before payment is introduced.',
    orderSummary: 'Order summary',
    loadingQuote: 'Calculating server-verified totals…',
    quoteErrorTitle: 'We could not calculate your order',
    quoteErrorDescription: 'Please retry to recalculate prices, shipping and coupon details.',
    retry: 'Retry',
    subtotal: 'Subtotal',
    discount: 'Coupon discount',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    coupon: 'Coupon code',
    couponPlaceholder: 'Enter code',
    applyCoupon: 'Apply',
    removeCoupon: 'Remove',
    couponApplied: 'Coupon applied successfully.',
    couponInvalid: 'This coupon is invalid or does not apply to your cart.',
    couponChecking: 'Checking coupon…',
    serviceable: 'Deliverable to',
    notServiceable: 'This pincode is not serviceable yet.',
    invalidPincode: 'Enter a valid 6-digit pincode.',
    checkingPincode: 'Checking pincode…',
    placeOrder: 'Place Pending Order',
    placingOrder: 'Creating order…',
    pendingNotice:
      'This creates a pending order only. No payment will be collected and the order will not be marked paid.',
    secureNote: 'Prices, shipping and discounts are recalculated securely on our server.',
    requiredNote: 'All fields except address line 2 are required.',
    emptyTitle: 'Your cart is empty',
    emptyDescription: 'Add an edition before proceeding to checkout.',
    browseCollections: 'Browse collections',
    errorTitle: 'We could not place your order',
    errorDefault: 'Please review your details and try again.',
    nameError: 'Please enter your full name.',
    emailError: 'Please enter a valid email address.',
    phoneError: 'Please enter a valid 10-digit Indian mobile number.',
    line1Error: 'Please enter your street address.',
    cityError: 'Please enter your city or town.',
    pincodeError: 'Please enter a valid 6-digit pincode.',
    requiredCouponError: 'Enter a coupon code first.',
    orderNumber: 'Order number',
    paymentStatus: 'Payment status',
    orderStatus: 'Order status',
    deliveryTo: 'Delivering to',
    orderedItems: 'Ordered editions',
    totalAmount: 'Total amount',
    returnHome: 'Return home',
    continueBrowsing: 'Browse more editions',
  },
  kn: {
    eyebrow: 'ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್',
    title: 'ನಿಮ್ಮ ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಿ',
    kannadaTitle: 'Complete Your Order',
    description:
      'ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳು ಮತ್ತು ಕರ್ನಾಟಕದ ವಿತರಣಾ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ. ಈ ಹಂತದಲ್ಲಿ ಪಾವತಿ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.',
    backToCart: 'ಬುಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
    contactTitle: 'ಸಂಪರ್ಕ ವಿವರಗಳು',
    contactDescription: 'ಆರ್ಡರ್ ನವೀಕರಣ ಮತ್ತು ವಿತರಣೆಗಾಗಿ ಮಾತ್ರ ಈ ವಿವರಗಳನ್ನು ಬಳಸುತ್ತೇವೆ.',
    name: 'ಪೂರ್ಣ ಹೆಸರು',
    namePlaceholder: 'ಉದಾ: ಕಾವ್ಯ ಹೆಗಡೆ',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    emailPlaceholder: 'kavya@example.com',
    phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    phonePlaceholder: '98450 12345',
    addressTitle: 'ವಿತರಣಾ ವಿಳಾಸ',
    addressDescription: 'ಸದ್ಯಕ್ಕೆ ಕರ್ನಾಟಕದೊಳಗೆ ಮಾತ್ರ ವಿತರಿಸಲಾಗುತ್ತದೆ.',
    line1: 'ವಿಳಾಸ ಸಾಲು 1',
    line1Placeholder: 'ಮನೆ / ಕಟ್ಟಡ, ರಸ್ತೆ',
    line2: 'ವಿಳಾಸ ಸಾಲು 2 (ಐಚ್ಛಿಕ)',
    line2Placeholder: 'ಪ್ರದೇಶ, ಗುರುತು',
    city: 'ನಗರ ಅಥವಾ ಪಟ್ಟಣ',
    cityPlaceholder: 'ಉದಾ: ಬೆಂಗಳೂರು',
    state: 'ರಾಜ್ಯ',
    stateValue: 'ಕರ್ನಾಟಕ',
    pincode: 'ಪಿನ್‌ಕೋಡ್',
    pincodePlaceholder: '560001',
    guestTitle: 'ಅತಿಥಿ ಚೆಕ್‌ಔಟ್',
    guestDescription:
      'ಖಾತೆ ಅಗತ್ಯವಿಲ್ಲ. ಪಾವತಿ ಸೇರಿಸುವ ಮೊದಲು ಪರಿಶೀಲಿಸಲು ನಿಮ್ಮ ಆರ್ಡರ್ ಬಾಕಿ ಸ್ಥಿತಿಯಲ್ಲಿ ರಚಿಸಲಾಗುತ್ತದೆ.',
    orderSummary: 'ಆರ್ಡರ್ ಸಾರಾಂಶ',
    loadingQuote: 'ಸರ್ವರ್ ದೃಢೀಕೃತ ಒಟ್ಟು ಮೊತ್ತ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ…',
    quoteErrorTitle: 'ಆರ್ಡರ್ ಮೊತ್ತವನ್ನು ಲೆಕ್ಕಹಾಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    quoteErrorDescription: 'ಬೆಲೆ, ರವಾನೆ ಮತ್ತು ಕೂಪನ್ ವಿವರಗಳನ್ನು ಮತ್ತೊಮ್ಮೆ ಲೆಕ್ಕಹಾಕಲು ಪ್ರಯತ್ನಿಸಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    subtotal: 'ಒಟ್ಟು ಬೆಲೆ',
    discount: 'ಕೂಪನ್ ರಿಯಾಯಿತಿ',
    shipping: 'ರವಾನೆ',
    free: 'ಉಚಿತ',
    total: 'ಒಟ್ಟು ಮೊತ್ತ',
    coupon: 'ಕೂಪನ್ ಕೋಡ್',
    couponPlaceholder: 'ಕೋಡ್ ನಮೂದಿಸಿ',
    applyCoupon: 'ಅನ್ವಯಿಸಿ',
    removeCoupon: 'ತೆಗೆದುಹಾಕಿ',
    couponApplied: 'ಕೂಪನ್ ಯಶಸ್ವಿಯಾಗಿ ಅನ್ವಯವಾಗಿದೆ.',
    couponInvalid: 'ಈ ಕೂಪನ್ ಅಮಾನ್ಯವಾಗಿದೆ ಅಥವಾ ನಿಮ್ಮ ಬುಟ್ಟಿಗೆ ಅನ್ವಯವಾಗುವುದಿಲ್ಲ.',
    couponChecking: 'ಕೂಪನ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    serviceable: 'ಈ ಪಿನ್‌ಕೋಡ್‌ಗೆ ವಿತರಣೆ ಲಭ್ಯವಿದೆ:',
    notServiceable: 'ಈ ಪಿನ್‌ಕೋಡ್‌ಗೆ ಇನ್ನೂ ವಿತರಣೆ ಲಭ್ಯವಿಲ್ಲ.',
    invalidPincode: 'ಸರಿಯಾದ 6 ಅಂಕಿಗಳ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.',
    checkingPincode: 'ಪಿನ್‌ಕೋಡ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    placeOrder: 'ಬಾಕಿ ಆರ್ಡರ್ ಮಾಡಿ',
    placingOrder: 'ಆರ್ಡರ್ ರಚಿಸಲಾಗುತ್ತಿದೆ…',
    pendingNotice:
      'ಇದು ಬಾಕಿ ಆರ್ಡರ್ ಮಾತ್ರ. ಯಾವುದೇ ಪಾವತಿ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ ಮತ್ತು ಆರ್ಡರ್ ಪಾವತಿಯಾಗಿದೆ ಎಂದು ಗುರುತಿಸುವುದಿಲ್ಲ.',
    secureNote: 'ಬೆಲೆ, ರವಾನೆ ಮತ್ತು ರಿಯಾಯಿತಿಗಳನ್ನು ಸರ್ವರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಮರುಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
    requiredNote: 'ವಿಳಾಸ ಸಾಲು 2 ಹೊರತುಪಡಿಸಿ ಎಲ್ಲಾ ವಿವರಗಳು ಅಗತ್ಯ.',
    emptyTitle: 'ನಿಮ್ಮ ಬುಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ',
    emptyDescription: 'ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುನ್ನ ಒಂದು ಸಂಚಿಕೆಯನ್ನು ಸೇರಿಸಿ.',
    browseCollections: 'ಸಂಗ್ರಹಗಳನ್ನು ನೋಡಿ',
    errorTitle: 'ಆರ್ಡರ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    errorDefault: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.',
    nameError: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ.',
    emailError: 'ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.',
    phoneError: 'ಸರಿಯಾದ 10 ಅಂಕಿಗಳ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ.',
    line1Error: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಸ್ತೆ ವಿಳಾಸ ನಮೂದಿಸಿ.',
    cityError: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ನಗರ ಅಥವಾ ಪಟ್ಟಣ ನಮೂದಿಸಿ.',
    pincodeError: 'ಸರಿಯಾದ 6 ಅಂಕಿಗಳ ಪಿನ್‌ಕೋಡ್ ನಮೂದಿಸಿ.',
    requiredCouponError: 'ಮೊದಲು ಕೂಪನ್ ಕೋಡ್ ನಮೂದಿಸಿ.',
    orderNumber: 'ಆರ್ಡರ್ ಸಂಖ್ಯೆ',
    paymentStatus: 'ಪಾವತಿ ಸ್ಥಿತಿ',
    orderStatus: 'ಆರ್ಡರ್ ಸ್ಥಿತಿ',
    deliveryTo: 'ವಿತರಣಾ ವಿಳಾಸ',
    orderedItems: 'ಆರ್ಡರ್ ಮಾಡಿದ ಸಂಚಿಕೆಗಳು',
    totalAmount: 'ಒಟ್ಟು ಮೊತ್ತ',
    returnHome: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    continueBrowsing: 'ಇನ್ನಷ್ಟು ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ',
  },
} as const;

const PAYMENT_CTA = {
  en: {
    checkoutDescription:
      'Share your contact details and Karnataka delivery address. After placing the pending order, you will continue to Razorpay to complete payment securely.',
    pendingNotice:
      'This first creates a pending order. You will then pay through Razorpay; the order is confirmed only after server-side payment verification.',
    successTitle: 'Pending order created',
    successDescription:
      'Your order has been saved. Complete the Razorpay payment now to confirm it. Your cart has already been cleared.',
    amountDue: 'Amount due',
    payNow: 'Pay now with Razorpay',
    pendingNote:
      'This order is awaiting payment. The amount is fixed from the server-saved order, and payment is verified before confirmation.',
  },
  kn: {
    checkoutDescription:
      'ನಿಮ್ಮ ಸಂಪರ್ಕ ವಿವರಗಳು ಮತ್ತು ಕರ್ನಾಟಕ ವಿತರಣಾ ವಿಳಾಸವನ್ನು ನೀಡಿ. ಬಾಕಿ ಆರ್ಡರ್ ಮಾಡಿದ ನಂತರ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ರೇಜರ್‌ಪೇಗೆ ಮುಂದುವರಿಯುತ್ತೀರಿ.',
    pendingNotice:
      'ಇದು ಮೊದಲು ಬಾಕಿ ಆರ್ಡರ್ ರಚಿಸುತ್ತದೆ. ನಂತರ ನೀವು ರೇಜರ್‌ಪೇ ಮೂಲಕ ಪಾವತಿಸುತ್ತೀರಿ; ಸರ್ವರ್‌ನಲ್ಲಿ ಪಾವತಿ ಪರಿಶೀಲನೆಯಾದ ನಂತರವೇ ಆರ್ಡರ್ ದೃಢೀಕರಣಗೊಳ್ಳುತ್ತದೆ.',
    successTitle: 'ಬಾಕಿ ಆರ್ಡರ್ ರಚಿಸಲಾಗಿದೆ',
    successDescription:
      'ನಿಮ್ಮ ಆರ್ಡರ್ ಉಳಿಸಲಾಗಿದೆ. ಅದನ್ನು ದೃಢೀಕರಿಸಲು ಈಗ ರೇಜರ್‌ಪೇ ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ. ನಿಮ್ಮ ಬುಟ್ಟಿ ಈಗಾಗಲೇ ಖಾಲಿಯಾಗಿದೆ.',
    amountDue: 'ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ',
    payNow: 'ರೇಜರ್‌ಪೇ ಮೂಲಕ ಈಗ ಪಾವತಿಸಿ',
    pendingNote:
      'ಈ ಆರ್ಡರ್ ಪಾವತಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ. ಮೊತ್ತವು ಸರ್ವರ್‌ನಲ್ಲಿ ಉಳಿಸಿದ ಆರ್ಡರ್‌ನಿಂದ ನಿಗದಿಯಾಗಿದೆ ಮತ್ತು ದೃಢೀಕರಣಕ್ಕೆ ಮೊದಲು ಪಾವತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
  },
} as const;

const FIELD_CLASS =
  'w-full rounded-paper border border-border bg-canvas px-3.5 py-2.5 text-sm text-espresso-main placeholder:text-espresso-faint focus:border-terracotta-600 focus:outline-none focus:ring-1 focus:ring-terracotta-600';

const PAYMENT_STATUS_LABELS: Record<string, { en: string; kn: string }> = {
  pending: { en: 'Pending', kn: 'ಬಾಕಿ' },
  authorized: { en: 'Authorized', kn: 'ಅಧಿಕೃತಗೊಂಡಿದೆ' },
  captured: { en: 'Paid', kn: 'ಪಾವತಿಯಾಗಿದೆ' },
  failed: { en: 'Failed', kn: 'ವಿಫಲವಾಗಿದೆ' },
  refunded: { en: 'Refunded', kn: 'ಮರುಪಾವತಿಯಾಗಿದೆ' },
};

const ORDER_STATUS_LABELS: Record<string, { en: string; kn: string }> = {
  placed: { en: 'Placed', kn: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
  confirmed: { en: 'Confirmed', kn: 'ದೃಢೀಕೃತವಾಗಿದೆ' },
  packed: { en: 'Packed', kn: 'ಪ್ಯಾಕ್ ಮಾಡಲಾಗಿದೆ' },
  dispatched: { en: 'Dispatched', kn: 'ರವಾನೆಯಾಗಿದೆ' },
  delivered: { en: 'Delivered', kn: 'ವಿತರಿಸಲಾಗಿದೆ' },
  cancelled: { en: 'Cancelled', kn: 'ರದ್ದುಮಾಡಲಾಗಿದೆ' },
};

function localizedStatusLabel(
  labels: Record<string, { en: string; kn: string }>,
  status: string,
  fallback: string,
  isKannada: boolean
): string {
  const label = labels[status] ?? labels[fallback];
  return isKannada ? label.kn : label.en;
}

const PHONE_PATTERN = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PINCODE_PATTERN = /^[1-9]\d{5}$/;

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `ck_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getLocalizedSubmitError(error: unknown, isKannada: boolean): string {
  if (error instanceof CheckoutApiError) {
    const messages: Record<string, { en: string; kn: string }> = {
      PINCODE_NOT_SERVICEABLE: {
        en: 'This pincode is not serviceable yet. Please try another Karnataka pincode.',
        kn: 'ಈ ಪಿನ್‌ಕೋಡ್‌ಗೆ ಇನ್ನೂ ವಿತರಣೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಕರ್ನಾಟಕ ಪಿನ್‌ಕೋಡ್ ಪ್ರಯತ್ನಿಸಿ.',
      },
      COUPON_INVALID: {
        en: 'This coupon is invalid or no longer applies to your order.',
        kn: 'ಈ ಕೂಪನ್ ಅಮಾನ್ಯವಾಗಿದೆ ಅಥವಾ ನಿಮ್ಮ ಆರ್ಡರ್‌ಗೆ ಅನ್ವಯವಾಗುವುದಿಲ್ಲ.',
      },
      INSUFFICIENT_STOCK: {
        en: 'One or more editions do not have enough stock. Please update your quantities.',
        kn: 'ಒಂದು ಅಥವಾ ಹೆಚ್ಚು ಸಂಚಿಕೆಗಳಲ್ಲಿ ಸಾಕಷ್ಟು ದಾಸ್ತಾನು ಇಲ್ಲ. ಪ್ರಮಾಣವನ್ನು ಬದಲಿಸಿ.',
      },
      ORDER_AMOUNT_TOO_LOW: {
        en: 'This order has no payable amount after discounts. Please remove the coupon or contact us to finish this order.',
        kn: 'ರಿಯಾಯಿತಿಯ ನಂತರ ಈ ಆರ್ಡರ್‌ಗೆ ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ ಇಲ್ಲ. ಕೂಪನ್ ತೆಗೆದುಹಾಕಿ ಅಥವಾ ಈ ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಲು ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      },
      EDITION_UNAVAILABLE: {
        en: 'One or more editions are no longer available. Please review your cart.',
        kn: 'ಒಂದು ಅಥವಾ ಹೆಚ್ಚು ಸಂಚಿಕೆಗಳು ಈಗ ಲಭ್ಯವಿಲ್ಲ. ಬುಟ್ಟಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
      },
      CHECKOUT_UNAVAILABLE: {
        en: 'Checkout is temporarily unavailable. Please try again shortly.',
        kn: 'ಚೆಕ್‌ಔಟ್ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
      },
      VALIDATION_ERROR: {
        en: 'Please check all customer and delivery details again.',
        kn: 'ಗ್ರಾಹಕ ಮತ್ತು ವಿತರಣಾ ವಿವರಗಳನ್ನು ಮತ್ತೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ.',
      },
    };

    const localized = error.code ? messages[error.code] : undefined;
    if (localized) return isKannada ? localized.kn : localized.en;

    return isKannada
      ? 'ಆರ್ಡರ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
      : error.message;
  }

  return isKannada
    ? 'ಆರ್ಡರ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
    : 'We could not place your order. Please try again.';
}

function SummarySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="h-4 w-3/4 animate-pulse rounded-paper bg-canvas-paper" />
      <div className="h-4 w-1/2 animate-pulse rounded-paper bg-canvas-paper" />
      <div className="h-4 w-2/3 animate-pulse rounded-paper bg-canvas-paper" />
      <div className="h-9 w-1/2 animate-pulse rounded-paper bg-canvas-paper" />
    </div>
  );
}

export function CheckoutView() {
  const { isKannada } = useLanguage();
  const { items, isReady, clearCart } = useCart();
  const copy = COPY[isKannada ? 'kn' : 'en'];
  const paymentCta = PAYMENT_CTA[isKannada ? 'kn' : 'en'];

  const [form, setForm] = useState<CheckoutFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [debouncedPincode, setDebouncedPincode] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteReloadToken, setQuoteReloadToken] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<PendingOrderSummary | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = form.pincode.trim();
      setDebouncedPincode(PINCODE_PATTERN.test(trimmed) ? trimmed : '');
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [form.pincode]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = form.email.trim();
      setDebouncedEmail(EMAIL_PATTERN.test(trimmed) ? trimmed : '');
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [form.email]);

  useEffect(() => {
    if (!isReady || items.length === 0) {
      setQuote(null);
      setQuoteError(null);
      setIsLoadingQuote(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function loadQuote() {
      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        const nextQuote = await requestQuote(
          {
            items,
            ...(debouncedPincode ? { pincode: debouncedPincode } : {}),
            ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
            ...(debouncedEmail ? { email: debouncedEmail } : {}),
          },
          controller.signal
        );

        if (active) setQuote(nextQuote);
      } catch (loadError) {
        if (!active) return;
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;

        setQuoteError(loadError instanceof Error ? loadError.message : copy.quoteErrorTitle);
      } finally {
        if (active) setIsLoadingQuote(false);
      }
    }

    void loadQuote();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    items,
    isReady,
    appliedCoupon,
    debouncedPincode,
    debouncedEmail,
    quoteReloadToken,
    copy.quoteErrorTitle,
  ]);

  const totalBoxes = useMemo(
    () => quote?.items.reduce((total, line) => total + line.quantity, 0) ?? 0,
    [quote]
  );

  const currentServiceability =
    quote?.serviceability && quote.serviceability.pincode === form.pincode.trim()
      ? quote.serviceability
      : null;

  const couponIsInvalid = Boolean(appliedCoupon && quote?.coupon && !quote.coupon.valid);
  const canSubmit = Boolean(
    quote &&
      quote.items.length > 0 &&
      !isLoadingQuote &&
      !quoteError &&
      !isSubmitting &&
      !couponIsInvalid
  );

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    setSubmitError(null);
    setAppliedCoupon(code);
    setQuoteReloadToken((value) => value + 1);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setSubmitError(null);
    setQuoteReloadToken((value) => value + 1);
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const normalizedPhone = form.phone.replace(/[\s-]/g, '');

    if (form.name.trim().length < 2) errors.name = copy.nameError;
    if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = copy.emailError;
    if (!PHONE_PATTERN.test(normalizedPhone)) errors.phone = copy.phoneError;
    if (form.line1.trim().length < 5) errors.line1 = copy.line1Error;
    if (form.city.trim().length < 2) errors.city = copy.cityError;
    if (!PINCODE_PATTERN.test(form.pincode.trim())) errors.pincode = copy.pincodeError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    if (!quote || isLoadingQuote || quoteError) {
      setSubmitError(copy.quoteErrorTitle);
      return;
    }

    if (currentServiceability && !currentServiceability.serviceable) {
      setSubmitError(copy.notServiceable);
      return;
    }

    if (couponIsInvalid) {
      setSubmitError(copy.couponInvalid);
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = createIdempotencyKey();
    }

    setIsSubmitting(true);

    try {
      const order = await submitPendingOrder({
        items,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.replace(/[\s-]/g, ''),
        },
        address: {
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          state: 'Karnataka',
          postalCode: form.pincode.trim(),
          country: 'India',
        },
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
        idempotencyKey: idempotencyKeyRef.current,
      });

      storePaymentToken(order.orderNumber, order.paymentToken);
      setCompletedOrder(order);
      clearCart();
    } catch (error) {
      setSubmitError(getLocalizedSubmitError(error, isKannada));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="bg-canvas">
        <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
          <Container width="default">
            <Card variant="elevated" className="space-y-6 p-6 sm:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sage-200 bg-sage-50 text-sage-700">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </div>
                <h1 className="mt-5 font-serif text-3xl font-medium text-espresso-dark sm:text-4xl">
                  {paymentCta.successTitle}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-espresso-muted">
                  {paymentCta.successDescription}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="terracotta">
                    {copy.orderNumber}: {completedOrder.orderNumber}
                  </Badge>
                  <Badge variant="paper">
                    {copy.paymentStatus}:{' '}
                    {localizedStatusLabel(
                      PAYMENT_STATUS_LABELS,
                      completedOrder.paymentStatus,
                      'pending',
                      isKannada
                    )}
                  </Badge>
                  <Badge variant="sage">
                    {copy.orderStatus}:{' '}
                    {localizedStatusLabel(
                      ORDER_STATUS_LABELS,
                      completedOrder.orderStatus,
                      'placed',
                      isKannada
                    )}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 border-t border-border-subtle pt-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso-soft">
                    {copy.deliveryTo}
                  </h2>
                  <p className="text-sm font-medium text-espresso-main">
                    {completedOrder.customer.name}
                  </p>
                  <p className="text-sm leading-relaxed text-espresso-muted">
                    {completedOrder.address.line1}
                    {completedOrder.address.line2 ? `, ${completedOrder.address.line2}` : ''}
                    <br />
                    {completedOrder.address.city}, {completedOrder.address.state}{' '}
                    {completedOrder.address.postalCode}
                    <br />
                    {completedOrder.address.country}
                  </p>
                  <p className="text-xs text-espresso-soft">
                    {completedOrder.customer.email} · {completedOrder.customer.phone}
                  </p>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso-soft">
                    {copy.orderedItems}
                  </h2>
                  <div className="space-y-3">
                    {completedOrder.items.map((line) => {
                      const title =
                        (isKannada ? line.titleKn : line.titleEn) || line.titleEn || line.slug;

                      return (
                        <div
                          key={`${line.slug}::${line.language}`}
                          className="flex items-center gap-3 rounded-paper border border-border-subtle bg-canvas-paper p-2.5"
                        >
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-paper border border-border-subtle bg-canvas">
                            <EditionImage
                              src={line.coverUrl}
                              alt={title}
                              className="aspect-square w-full"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-espresso-main">{title}</p>
                            <p className="text-xs text-espresso-soft">
                              {line.quantity} × {formatINR(line.unitPrice)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-espresso-main">
                            {formatINR(line.lineTotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-espresso-soft">
                    {paymentCta.amountDue}
                  </p>
                  <p className="font-serif text-2xl font-bold text-espresso-dark">
                    {formatINR(completedOrder.totals.totalAmount)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/checkout/payment/${encodeURIComponent(completedOrder.orderNumber)}`}
                  >
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<CreditCard className="h-4 w-4" />}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {paymentCta.payNow}
                    </Button>
                  </Link>
                  <Link href="/#collections">
                    <Button variant="outline" size="md">
                      {copy.continueBrowsing}
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" size="md">
                      {copy.returnHome}
                    </Button>
                  </Link>
                </div>
              </div>

              <p className="rounded-paper border border-border-subtle bg-canvas-paper p-3 text-xs leading-relaxed text-espresso-muted">
                {paymentCta.pendingNote}
              </p>
            </Card>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-canvas">
      <section className="subtle-paper-grain border-b border-border py-10 md:py-16">
        <Container width="wide" className="space-y-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.backToCart}
          </Link>

          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            kannadaTitle={isKannada ? undefined : copy.kannadaTitle}
            description={paymentCta.checkoutDescription}
            align="left"
            className="max-w-3xl"
          />
        </Container>
      </section>

      <section className="py-10 md:py-16">
        <Container width="wide">
          {!isReady ? (
            <Card variant="paper" className="p-8">
              <SummarySkeleton />
            </Card>
          ) : items.length === 0 ? (
            <Card variant="paper" className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-warm border border-border bg-canvas-paper text-terracotta-700">
                <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
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
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <Card variant="bordered" className="space-y-5 p-6">
                  <div className="space-y-1">
                    <h2 className="font-serif text-xl font-medium text-espresso-dark">
                      {copy.contactTitle}
                    </h2>
                    <p className="text-xs text-espresso-muted">{copy.contactDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold text-espresso-main">{copy.name}</span>
                      <input
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        placeholder={copy.namePlaceholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.name)}
                      />
                      {fieldErrors.name && (
                        <span className="block text-xs text-rose-700">{fieldErrors.name}</span>
                      )}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-espresso-main">{copy.email}</span>
                      <input
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        placeholder={copy.emailPlaceholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.email)}
                      />
                      {fieldErrors.email && (
                        <span className="block text-xs text-rose-700">{fieldErrors.email}</span>
                      )}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-espresso-main">{copy.phone}</span>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder={copy.phonePlaceholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.phone)}
                      />
                      {fieldErrors.phone && (
                        <span className="block text-xs text-rose-700">{fieldErrors.phone}</span>
                      )}
                    </label>
                  </div>
                </Card>

                <Card variant="bordered" className="space-y-5 p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-paper border border-sage-200 bg-sage-50 text-sage-700">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                      <h2 className="font-serif text-xl font-medium text-espresso-dark">
                        {copy.addressTitle}
                      </h2>
                      <p className="text-xs text-espresso-muted">{copy.addressDescription}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold text-espresso-main">{copy.line1}</span>
                      <input
                        type="text"
                        autoComplete="address-line1"
                        value={form.line1}
                        onChange={(event) => updateField('line1', event.target.value)}
                        placeholder={copy.line1Placeholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.line1)}
                      />
                      {fieldErrors.line1 && (
                        <span className="block text-xs text-rose-700">{fieldErrors.line1}</span>
                      )}
                    </label>

                    <label className="block space-y-1 sm:col-span-2">
                      <span className="text-xs font-semibold text-espresso-main">{copy.line2}</span>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        value={form.line2}
                        onChange={(event) => updateField('line2', event.target.value)}
                        placeholder={copy.line2Placeholder}
                        className={FIELD_CLASS}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-espresso-main">{copy.city}</span>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(event) => updateField('city', event.target.value)}
                        placeholder={copy.cityPlaceholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.city)}
                      />
                      {fieldErrors.city && (
                        <span className="block text-xs text-rose-700">{fieldErrors.city}</span>
                      )}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-espresso-main">{copy.state}</span>
                      <input
                        type="text"
                        value={copy.stateValue}
                        readOnly
                        className={`${FIELD_CLASS} cursor-not-allowed bg-canvas-paper text-espresso-soft`}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-espresso-main">{copy.pincode}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(event) =>
                          updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        placeholder={copy.pincodePlaceholder}
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(fieldErrors.pincode)}
                      />
                      {fieldErrors.pincode && (
                        <span className="block text-xs text-rose-700">{fieldErrors.pincode}</span>
                      )}
                    </label>
                  </div>

                  {form.pincode.length > 0 && (
                    <div className="text-xs" aria-live="polite">
                      {!PINCODE_PATTERN.test(form.pincode) ? (
                        form.pincode.length === 6 ? (
                          <p className="text-rose-700">{copy.invalidPincode}</p>
                        ) : null
                      ) : currentServiceability ? (
                        currentServiceability.serviceable ? (
                          <p className="flex items-center gap-1.5 text-sage-700">
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.serviceable} {currentServiceability.pincode}
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-rose-700">
                            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {copy.notServiceable}
                          </p>
                        )
                      ) : (
                        <p className="flex items-center gap-1.5 text-espresso-soft">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          {copy.checkingPincode}
                        </p>
                      )}
                    </div>
                  )}
                </Card>

                <Card variant="paper" className="flex items-start gap-3 p-5">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-700" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-espresso-main">{copy.guestTitle}</p>
                    <p className="text-xs leading-relaxed text-espresso-muted">
                      {copy.guestDescription}
                    </p>
                  </div>
                </Card>
              </div>

              <aside className="lg:col-span-5">
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

                  {quoteError && (
                    <div
                      className="flex flex-col gap-3 rounded-paper border border-terracotta-200 bg-terracotta-50/40 p-3 text-xs"
                      role="alert"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta-700"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-semibold text-espresso-dark">
                            {copy.quoteErrorTitle}
                          </p>
                          <p className="mt-0.5 text-espresso-muted">{copy.quoteErrorDescription}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuoteReloadToken((value) => value + 1)}
                        leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                      >
                        {copy.retry}
                      </Button>
                    </div>
                  )}

                  {!quote ? (
                    quoteError ? null : (
                      <div className="space-y-3">
                        <SummarySkeleton />
                        <p className="text-xs text-espresso-soft">{copy.loadingQuote}</p>
                      </div>
                    )
                  ) : (
                    <>
                      <div className={isLoadingQuote ? 'max-h-64 space-y-2 overflow-y-auto pr-1 opacity-70' : 'max-h-64 space-y-2 overflow-y-auto pr-1'}>
                        {quote.items.map((line) => {
                          const title =
                            (isKannada ? line.titleKn : line.titleEn) || line.titleEn || line.slug;

                          return (
                            <div
                              key={`${line.slug}::${line.language}`}
                              className="flex items-center gap-2.5"
                            >
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-paper border border-border-subtle bg-canvas-paper">
                                <EditionImage
                                  src={line.coverUrl}
                                  alt={title}
                                  className="aspect-square w-full"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-espresso-main">
                                  {title}
                                </p>
                                <p className="text-[11px] text-espresso-soft">
                                  {line.quantity} × {formatINR(line.unitPrice)}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-espresso-main">
                                {formatINR(line.lineTotal)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <dl className="space-y-2.5 border-t border-border-subtle pt-4 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <dt className="text-espresso-muted">{copy.subtotal}</dt>
                          <dd className="font-medium text-espresso-main">
                            {formatINR(quote.totals.basePrice)}
                          </dd>
                        </div>
                        {quote.totals.discountAmount > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <dt className="text-espresso-muted">{copy.discount}</dt>
                            <dd className="font-medium text-sage-700">
                              −{formatINR(quote.totals.discountAmount)}
                            </dd>
                          </div>
                        )}
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

                      <div className="space-y-2">
                        <div className="block space-y-1">
                          <label
                            htmlFor="coupon-code"
                            className="flex items-center gap-1.5 text-xs font-semibold text-espresso-main"
                          >
                            <Tag className="h-3.5 w-3.5 text-terracotta-600" aria-hidden="true" />
                            {copy.coupon}
                          </label>
                          <div className="flex gap-2">
                            <input
                              id="coupon-code"
                              type="text"
                              value={couponInput}
                              onChange={(event) => {
                                setCouponInput(event.target.value.toUpperCase());
                                setSubmitError(null);
                              }}
                              placeholder={copy.couponPlaceholder}
                              className={`${FIELD_CLASS} flex-1 uppercase`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleApplyCoupon}
                              disabled={isLoadingQuote}
                            >
                              {copy.applyCoupon}
                            </Button>
                          </div>
                        </div>

                        {appliedCoupon && (
                          <div
                            className={`flex items-center justify-between gap-2 rounded-paper border p-2.5 text-xs ${
                              quote.coupon?.valid
                                ? 'border-sage-200 bg-sage-50/60 text-sage-800'
                                : 'border-rose-200 bg-rose-50/60 text-rose-800'
                            }`}
                            aria-live="polite"
                          >
                            <span>
                              {isLoadingQuote && !quote.coupon
                                ? copy.couponChecking
                                : quote.coupon?.valid
                                  ? `${copy.couponApplied} (${appliedCoupon})`
                                  : copy.couponInvalid}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="shrink-0 font-semibold underline underline-offset-2"
                            >
                              {copy.removeCoupon}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {submitError && (
                    <div
                      className="flex items-start gap-2 rounded-paper border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800"
                      role="alert"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">{copy.errorTitle}</p>
                        <p className="mt-0.5">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={!canSubmit}
                    isLoading={isSubmitting}
                    rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
                  >
                    {isSubmitting ? copy.placingOrder : copy.placeOrder}
                  </Button>

                  <div className="space-y-2 text-[11px] leading-relaxed text-espresso-soft">
                    <p className="flex items-start gap-1.5">
                      <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-sage-700" aria-hidden="true" />
                      {copy.secureNote}
                    </p>
                    <p>{paymentCta.pendingNotice}</p>
                    <p className="text-espresso-faint">{copy.requiredNote}</p>
                  </div>
                </Card>
              </aside>
            </form>
          )}
        </Container>
      </section>
    </div>
  );
}
