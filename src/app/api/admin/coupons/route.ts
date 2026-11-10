import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import {
  getMongoErrorMessage,
  isDuplicateKeyError,
  isMongooseValidationError,
} from '@/lib/mongo-errors';
import {
  adminCouponListQuerySchema,
  couponCreateSchema,
} from '@/lib/validations/admin-coupon';
import {
  AdminCouponServiceError,
  createAdminCoupon,
  listAdminCoupons,
} from '@/services/admin-coupon.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const parsed = adminCouponListQuerySchema.safeParse(
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
    const result = await listAdminCoupons(parsed.data);
    const response = apiSuccess(result.items, 'Coupons retrieved', {
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
      'Failed to list coupons:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load coupons',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

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

  const parsed = couponCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid coupon data',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const coupon = await createAdminCoupon(parsed.data);
    const response = apiSuccess(coupon, 'Coupon created', undefined, 201);
    response.headers.set('Cache-Control', 'no-store');
    return response;
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
      'Failed to create coupon:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to create coupon',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
