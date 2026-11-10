import { apiError, apiSuccess } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { paymentStatusQuerySchema } from '@/lib/validations/payment';
import { PaymentServiceError, getPublicPaymentStatus } from '@/services/payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Payment status is queried with a POST body instead of a GET query string so
 * the access token never lands in URLs, server access logs, or referrer
 * headers.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'payment-status',
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400, undefined, 'INVALID_JSON');
  }

  const parsed = paymentStatusQuerySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Please provide a valid order and payment token.',
      400,
      parsed.error.flatten(),
      'VALIDATION_ERROR'
    );
  }

  try {
    const status = await getPublicPaymentStatus(parsed.data);
    return apiSuccess(status, 'Payment status loaded successfully');
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Failed to load payment status:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Could not load the payment status right now.',
      500,
      undefined,
      'PAYMENT_STATUS_FAILED'
    );
  }
}
