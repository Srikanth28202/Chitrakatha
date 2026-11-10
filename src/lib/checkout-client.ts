import type {
  CheckoutQuote,
  PendingOrderRequest,
  PendingOrderSummary,
  QuoteRequestInput,
} from '@/types/checkout';

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

interface ApiErrorEnvelope {
  success: false;
  error: {
    message?: string;
    code?: string;
    details?: unknown;
  };
}

export class CheckoutApiError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'CheckoutApiError';
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
    throw new CheckoutApiError(
      errorPayload?.message || 'Something went wrong. Please try again.',
      response.status,
      errorPayload?.code,
      errorPayload?.details
    );
  }

  return payload.data;
}

export async function requestQuote(
  input: QuoteRequestInput,
  signal?: AbortSignal
): Promise<CheckoutQuote> {
  const response = await fetch('/api/checkout/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
    signal,
  });

  return parseResponse<CheckoutQuote>(response);
}

export async function submitPendingOrder(
  input: PendingOrderRequest
): Promise<PendingOrderSummary> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  return parseResponse<PendingOrderSummary>(response);
}
