import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import {
  getMongoErrorMessage,
  isDuplicateKeyError,
  isMongooseValidationError,
} from '@/lib/mongo-errors';
import {
  couponIdSchema,
  couponStatusUpdateSchema,
  couponUpdateSchema,
} from '@/lib/validations/admin-coupon';
import {
  AdminCouponServiceError,
  deleteAdminCoupon,
  getAdminCouponById,
  updateAdminCoupon,
  updateAdminCouponStatus,
} from '@/services/admin-coupon.service';

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
  const parsedId = couponIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid coupon identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const coupon = await getAdminCouponById(parsedId.data);
    if (!coupon) {
      return apiError('Coupon not found', 404, undefined, 'COUPON_NOT_FOUND');
    }
    return apiSuccess(coupon, 'Coupon retrieved');
  } catch (error) {
    console.error(
      'Failed to load coupon:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load coupon',
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
  const parsedId = couponIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid coupon identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  // Only treat the body as a status-only update when it is exactly one
  // `{ isActive }` key. Guard against arrays and primitives so
  // Object.keys cannot throw on unexpected payloads.
  const isStatusOnly =
    Boolean(body) &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.keys(body as Record<string, unknown>).length === 1 &&
    'isActive' in (body as Record<string, unknown>);

  const statusParsed = couponStatusUpdateSchema.safeParse(body);
  if (isStatusOnly && statusParsed.success) {
    try {
      const coupon = await updateAdminCouponStatus(
        parsedId.data,
        statusParsed.data.isActive
      );
      if (!coupon) {
        return apiError('Coupon not found', 404, undefined, 'COUPON_NOT_FOUND');
      }
      return apiSuccess(coupon, 'Coupon status updated');
    } catch (error) {
      console.error(
        'Failed to update coupon status:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return apiError(
        'Unable to update coupon status',
        500,
        undefined,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  const parsed = couponUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid coupon data',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const coupon = await updateAdminCoupon(parsedId.data, parsed.data);
    if (!coupon) {
      return apiError('Coupon not found', 404, undefined, 'COUPON_NOT_FOUND');
    }
    return apiSuccess(coupon, 'Coupon updated');
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError(
        'A coupon with this code already exists',
        409,
        undefined,
        'DUPLICATE_COUPON'
      );
    }

    if (error instanceof AdminCouponServiceError) {
      return apiError(error.message, error.status, undefined, error.code);
    }

    if (isMongooseValidationError(error)) {
      return apiError(
        getMongoErrorMessage(error),
        400,
        undefined,
        'VALIDATION_ERROR'
      );
    }

    console.error(
      'Failed to update coupon:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update coupon',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const { id } = await context.params;
  const parsedId = couponIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid coupon identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const deleted = await deleteAdminCoupon(parsedId.data);
    if (!deleted) {
      return apiError('Coupon not found', 404, undefined, 'COUPON_NOT_FOUND');
    }
    return apiSuccess({ deleted: true }, 'Coupon deleted');
  } catch (error) {
    if (error instanceof AdminCouponServiceError) {
      return apiError(error.message, error.status, undefined, error.code);
    }

    console.error(
      'Failed to delete coupon:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to delete coupon',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
