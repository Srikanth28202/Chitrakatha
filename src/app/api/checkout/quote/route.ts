import { apiError, apiSuccess } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { quoteRequestSchema } from '@/lib/validations/checkout';
import { CheckoutServiceError, quoteCheckout } from '@/services/checkout.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'quote',
    limit: 20,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400, undefined, 'INVALID_JSON');
  }

  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Please review your cart and delivery details.',
      400,
      parsed.error.flatten(),
      'VALIDATION_ERROR'
    );
  }

  try {
    const quote = await quoteCheckout(parsed.data);
    return apiSuccess(quote, 'Checkout quote calculated successfully');
  } catch (error) {
    if (error instanceof CheckoutServiceError) {
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Failed to calculate checkout quote:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Checkout is temporarily unavailable. Please try again shortly.',
      500,
      undefined,
      'CHECKOUT_ERROR'
    );
  }
}
