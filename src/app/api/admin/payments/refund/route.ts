import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { adminRefundSchema } from '@/lib/validations/admin-payment';
import {
  AdminPaymentServiceError,
  refundAdminOrder,
} from '@/services/admin-payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  const parsed = adminRefundSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid refund request',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const payment = await refundAdminOrder(parsed.data);
    return apiSuccess(payment, 'Refund processed');
  } catch (error) {
    if (error instanceof AdminPaymentServiceError) {
      return apiError(error.message, error.status, undefined, error.code);
    }

    console.error(
      'Failed to refund order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to process refund',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
