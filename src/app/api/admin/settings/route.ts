import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { businessSettingsUpdateSchema } from '@/lib/validations/admin-settings';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from '@/services/business-settings.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  try {
    const settings = await getBusinessSettings();
    const response = apiSuccess(settings, 'Settings retrieved');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to load business settings:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load settings',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export async function PATCH(request: NextRequest) {
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

  const parsed = businessSettingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid settings data',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const settings = await updateBusinessSettings(parsed.data);
    const response = apiSuccess(settings, 'Settings updated');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to update business settings:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update settings',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
