import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { adminCustomerListQuerySchema } from '@/lib/validations/admin-customer';
import { listAdminCustomers } from '@/services/admin-customer.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const parsed = adminCustomerListQuerySchema.safeParse(
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
    const result = await listAdminCustomers(parsed.data);
    const response = apiSuccess(result.items, 'Customers retrieved', {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to list customers:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load customers',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
