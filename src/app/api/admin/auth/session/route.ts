import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    const response = apiError(
      'Authentication required',
      401,
      undefined,
      'UNAUTHORIZED'
    );
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const response = apiSuccess({ admin }, 'Authenticated');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
