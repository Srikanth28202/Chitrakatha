import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getAdminDashboardSummary } from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    const response = apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  try {
    const summary = await getAdminDashboardSummary();
    const response = apiSuccess(summary, 'Dashboard summary retrieved');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to load admin dashboard summary:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    const response = apiError(
      'Unable to load dashboard summary',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}
