import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { adminPaymentListQuerySchema } from '@/lib/validations/admin-payment';
import { listAdminPayments } from '@/services/admin-payment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const parsed = adminPaymentListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return apiError(
      'Invalid search parameters',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const result = await listAdminPayments(parsed.data);
    const response = apiSuccess(result.items, 'Payments retrieved', {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to list payments:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load payments',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
