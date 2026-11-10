import type {
  PaymentInitRequest,
  PaymentInitResponse,
  PaymentVerificationResult,
  PaymentVerifyRequest,
  PublicPaymentStatus,
} from '@/types/payment';

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorEnvelope {
  success: false;
  error: {
    message?: string;
    code?: string;
    details?: unknown;
  };
}

export class PaymentApiError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'PaymentApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessEnvelope<T>
    | ApiErrorEnvelope
    | null;

  if (!response.ok || !payload || payload.success !== true) {
    const errorPayload = payload && payload.success === false ? payload.error : undefined;
    throw new PaymentApiError(
      errorPayload?.message || 'Something went wrong. Please try again.',
      response.status,
      errorPayload?.code,
      errorPayload?.details
    );
  }

  return payload.data;
}

export async function requestPaymentOrder(
  input: PaymentInitRequest
): Promise<PaymentInitResponse> {
  const response = await fetch('/api/payments/razorpay/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  return parseResponse<PaymentInitResponse>(response);
}

export async function verifyPayment(
  input: PaymentVerifyRequest
): Promise<PaymentVerificationResult> {
  const response = await fetch('/api/payments/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  return parseResponse<PaymentVerificationResult>(response);
}

export async function getPaymentStatus(
  orderNumber: string,
  paymentToken: string,
  signal?: AbortSignal
): Promise<PublicPaymentStatus> {
  // Sent as a POST body (not a query string) so the access token stays out
  // of URLs, access logs, and referrer headers.
  const response = await fetch('/api/payments/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber, paymentToken }),
    cache: 'no-store',
    signal,
  });

  return parseResponse<PublicPaymentStatus>(response);
}

function paymentTokenKey(orderNumber: string): string {
  return `chitrakatha_payment_token_${orderNumber}`;
}

export function storePaymentToken(orderNumber: string, paymentToken: string): void {
  try {
    sessionStorage.setItem(paymentTokenKey(orderNumber), paymentToken);
  } catch {
    // Session storage may be unavailable in restricted browsers.
  }
}

export function loadStoredPaymentToken(orderNumber: string): string | null {
  try {
    return sessionStorage.getItem(paymentTokenKey(orderNumber));
  } catch {
    return null;
  }
}

export interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayHandlerResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
  retry?: {
    enabled: boolean;
  };
}

export interface RazorpayCheckoutInstance {
  open: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

type RazorpayCheckoutConstructor = new (
  options: RazorpayCheckoutOptions
) => RazorpayCheckoutInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCheckoutConstructor;
  }
}

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';
const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<RazorpayCheckoutConstructor> | null = null;

export function loadRazorpayCheckout(): Promise<RazorpayCheckoutConstructor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout can only load in the browser.'));
  }

  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<RazorpayCheckoutConstructor>((resolve, reject) => {
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;

    const removeExisting = () => {
      existing?.remove();
    };

    const handleLoad = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        removeExisting();
        scriptPromise = null;
        reject(new Error('Razorpay Checkout did not initialise.'));
      }
    };

    const handleError = () => {
      removeExisting();
      scriptPromise = null;
      reject(new Error('Could not load Razorpay Checkout.'));
    };

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true });
      existing.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.body.appendChild(script);
  });

  return scriptPromise;
}
