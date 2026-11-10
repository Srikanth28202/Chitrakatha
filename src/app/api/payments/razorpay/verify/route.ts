import { apiError, apiSuccess } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { paymentVerifySchema } from '@/lib/validations/payment';
import { PaymentServiceError, verifyRazorpayPayment } from '@/services/payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'payment-verify',
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

  const parsed = paymentVerifySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Please provide valid Razorpay payment details.',
      400,
      parsed.error.flatten(),
      'VALIDATION_ERROR'
    );
  }

  try {
    const result = await verifyRazorpayPayment(parsed.data);

    return apiSuccess(
      result,
      result.alreadyProcessed
        ? 'This payment was already verified.'
        : 'Payment verified successfully'
    );
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Failed to verify Razorpay payment:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Could not verify the payment right now. Please contact support if you were charged.',
      500,
      undefined,
      'PAYMENT_VERIFICATION_FAILED'
    );
  }
}
