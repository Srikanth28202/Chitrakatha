import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { adminOrderUpdateSchema, orderIdSchema } from '@/lib/validations/admin-order';
import {
  AdminOrderServiceError,
  getAdminOrderById,
  updateAdminOrder,
} from '@/services/admin-order.service';

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
  const parsedId = orderIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid order identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const order = await getAdminOrderById(parsedId.data);
    if (!order) {
      return apiError('Order not found', 404, undefined, 'ORDER_NOT_FOUND');
    }
    return apiSuccess(order, 'Order retrieved');
  } catch (error) {
    console.error(
      'Failed to load order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load order',
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
  const parsedId = orderIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid order identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  const parsed = adminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      'Invalid order update',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const order = await updateAdminOrder(parsedId.data, parsed.data);
    if (!order) {
      return apiError('Order not found', 404, undefined, 'ORDER_NOT_FOUND');
    }
    return apiSuccess(order, 'Order updated');
  } catch (error) {
    if (error instanceof AdminOrderServiceError) {
      return apiError(error.message, error.status, undefined, error.code);
    }

    console.error(
      'Failed to update order:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update order',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
