import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getMongoErrorMessage, isMongooseValidationError } from '@/lib/mongo-errors';
import {
  adminShipmentListQuerySchema,
  shipmentCreateSchema,
} from '@/lib/validations/admin-shipment';
import {
  AdminShipmentServiceError,
  createAdminShipment,
  listAdminShipments,
} from '@/services/admin-shipment.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const parsed = adminShipmentListQuerySchema.safeParse(
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
    const result = await listAdminShipments(parsed.data);
    const response = apiSuccess(result.items, 'Shipments retrieved', {
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
      'Failed to list shipments:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load shipments',
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

  const parsed = shipmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid shipment data',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const shipment = await createAdminShipment(parsed.data);
    const response = apiSuccess(shipment, 'Shipment created', undefined, 201);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    if (error instanceof AdminShipmentServiceError) {
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
      'Failed to create shipment:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to create shipment',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
