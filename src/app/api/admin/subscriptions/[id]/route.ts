import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import {
  adminSubscriptionUpdateSchema,
  subscriptionIdSchema,
} from '@/lib/validations/admin-subscription';
import {
  AdminSubscriptionServiceError,
  getAdminSubscriptionById,
  updateAdminSubscriptionStatus,
} from '@/services/admin-subscription.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const { id } = await context.params;
  const parsedId = subscriptionIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError(
      'Invalid subscription identifier',
      400,
      undefined,
      'VALIDATION_ERROR'
    );
  }

  try {
    const subscription = await getAdminSubscriptionById(parsedId.data);
    if (!subscription) {
      return apiError(
        'Subscription not found',
        404,
        undefined,
        'SUBSCRIPTION_NOT_FOUND'
      );
    }
    return apiSuccess(subscription, 'Subscription retrieved');
  } catch (error) {
    console.error(
      'Failed to load subscription:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load subscription',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const { id } = await context.params;
  const parsedId = subscriptionIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError(
      'Invalid subscription identifier',
      400,
      undefined,
      'VALIDATION_ERROR'
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  const parsed = adminSubscriptionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid subscription update',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const subscription = await updateAdminSubscriptionStatus(parsedId.data, parsed.data);
    if (!subscription) {
      return apiError(
        'Subscription not found',
        404,
        undefined,
        'SUBSCRIPTION_NOT_FOUND'
      );
    }
    return apiSuccess(subscription, 'Subscription updated');
  } catch (error) {
    if (error instanceof AdminSubscriptionServiceError) {
      return apiError(error.message, error.status, undefined, error.code);
    }

    console.error(
      'Failed to update subscription:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update subscription',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
