import { apiError, apiSuccess } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { paymentInitSchema } from '@/lib/validations/payment';
import { PaymentServiceError, createPaymentOrder } from '@/services/payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'payment-init',
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400, undefined, 'INVALID_JSON');
  }

  const parsed = paymentInitSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Please provide a valid order and payment token.',
      400,
      parsed.error.flatten(),
      'VALIDATION_ERROR'
    );
  }

  try {
    const payment = await createPaymentOrder(parsed.data);
    return apiSuccess(payment, 'Razorpay order prepared successfully');
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Failed to create Razorpay order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Could not start the payment right now. Please try again shortly.',
      500,
      undefined,
      'PAYMENT_ORDER_FAILED'
    );
  }
}
