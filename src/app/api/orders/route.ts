import { apiError, apiSuccess } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { pendingOrderSchema } from '@/lib/validations/checkout';
import { CheckoutServiceError, createPendingOrder } from '@/services/checkout.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'orders',
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

  const parsed = pendingOrderSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Please check the customer and delivery details.',
      400,
      parsed.error.flatten(),
      'VALIDATION_ERROR'
    );
  }

  try {
    const order = await createPendingOrder(parsed.data);

    return apiSuccess(
      order,
      order.duplicate
        ? 'This order was already received. Showing the existing pending order.'
        : 'Pending order created successfully',
      undefined,
      order.duplicate ? 200 : 201
    );
  } catch (error) {
    if (error instanceof CheckoutServiceError) {
      return apiError(error.message, error.status, error.details, error.code);
    }

    console.error(
      'Failed to create pending order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'We could not place your order right now. Please try again shortly.',
      500,
      undefined,
      'ORDER_CREATE_FAILED'
    );
  }
}
