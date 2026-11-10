import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getMongoErrorMessage, isMongooseValidationError } from '@/lib/mongo-errors';
import {
  shipmentIdSchema,
  shipmentUpdateSchema,
} from '@/lib/validations/admin-shipment';
import {
  AdminShipmentServiceError,
  getAdminShipmentById,
  updateAdminShipment,
} from '@/services/admin-shipment.service';

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
  const parsedId = shipmentIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid shipment identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const shipment = await getAdminShipmentById(parsedId.data);
    if (!shipment) {
      return apiError('Shipment not found', 404, undefined, 'SHIPMENT_NOT_FOUND');
    }
    return apiSuccess(shipment, 'Shipment retrieved');
  } catch (error) {
    console.error(
      'Failed to load shipment:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load shipment',
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
  const parsedId = shipmentIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid shipment identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  const parsed = shipmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid shipment update',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const shipment = await updateAdminShipment(parsedId.data, parsed.data);
    if (!shipment) {
      return apiError('Shipment not found', 404, undefined, 'SHIPMENT_NOT_FOUND');
    }
    return apiSuccess(shipment, 'Shipment updated');
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
      'Failed to update shipment:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update shipment',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
