import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { customerEmailSchema } from '@/lib/validations/admin-customer';
import { getAdminCustomerByEmail } from '@/services/admin-customer.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ email: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const { email } = await context.params;
  const parsed = customerEmailSchema.safeParse(decodeURIComponent(email));
  if (!parsed.success) {
    return apiError('Invalid customer email', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const customer = await getAdminCustomerByEmail(parsed.data);
    if (!customer) {
      return apiError('Customer not found', 404, undefined, 'CUSTOMER_NOT_FOUND');
    }
    return apiSuccess(customer, 'Customer retrieved');
  } catch (error) {
    console.error(
      'Failed to load customer:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load customer',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
