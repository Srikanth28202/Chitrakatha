import { apiError, apiSuccess } from '@/lib/api-response';
import { PaymentServiceError, processRazorpayWebhook } from '@/services/payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_WEBHOOK_BYTES = 1_000_000;

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_WEBHOOK_BYTES) {
    return apiError('Webhook payload is too large.', 413, undefined, 'WEBHOOK_TOO_LARGE');
  }

  try {
    const result = await processRazorpayWebhook({
      rawBody,
      signature: request.headers.get('x-razorpay-signature'),
      eventIdHeader: request.headers.get('x-razorpay-event-id'),
    });

    return apiSuccess(result, result.duplicate ? 'Webhook already processed' : 'Webhook received');
  } catch (error) {
    if (error instanceof PaymentServiceError) {
      console.error(
        'Razorpay webhook rejected:',
        error.code,
        error.message
      );
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Razorpay webhook processing failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Webhook processing failed. Please retry.',
      500,
      undefined,
      'WEBHOOK_PROCESSING_FAILED'
    );
  }
}
