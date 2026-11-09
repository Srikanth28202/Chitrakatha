import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import {
  getMongoErrorMessage,
  isDuplicateKeyError,
  isMongooseValidationError,
} from '@/lib/mongo-errors';
import {
  editionCreateSchema,
  editionIdSchema,
  editionStatusUpdateSchema,
} from '@/lib/validations/admin-edition';
import {
  deleteAdminEdition,
  getAdminEditionById,
  updateAdminEdition,
  updateAdminEditionStatus,
} from '@/services/admin-edition.service';

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
  const parsedId = editionIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid edition identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const edition = await getAdminEditionById(parsedId.data);

    if (!edition) {
      return apiError('Edition not found', 404, undefined, 'NOT_FOUND');
    }

    const response = apiSuccess(edition, 'Edition retrieved');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to load edition:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError('Unable to load edition', 500, undefined, 'INTERNAL_SERVER_ERROR');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const { id } = await context.params;
  const parsedId = editionIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid edition identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400, undefined, 'INVALID_BODY');
  }

  const isStatusOnly =
    Boolean(body) &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Object.keys(body as Record<string, unknown>).length === 1 &&
    'status' in (body as Record<string, unknown>);

  try {
    if (isStatusOnly) {
      const parsedStatus = editionStatusUpdateSchema.safeParse(body);

      if (!parsedStatus.success) {
        return apiError(
          'Invalid edition status',
          400,
          parsedStatus.error.flatten().fieldErrors,
          'VALIDATION_ERROR'
        );
      }

      const edition = await updateAdminEditionStatus(
        parsedId.data,
        parsedStatus.data.status
      );

      if (!edition) {
        return apiError('Edition not found', 404, undefined, 'NOT_FOUND');
      }

      const response = apiSuccess(edition, 'Edition status updated');
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    const parsedEdition = editionCreateSchema.safeParse(body);

    if (!parsedEdition.success) {
      return apiError(
        'Invalid edition data',
        400,
        parsedEdition.error.flatten().fieldErrors,
        'VALIDATION_ERROR'
      );
    }

    const edition = await updateAdminEdition(parsedId.data, parsedEdition.data);

    if (!edition) {
      return apiError('Edition not found', 404, undefined, 'NOT_FOUND');
    }

    const response = apiSuccess(edition, 'Edition updated');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return apiError(
        'An edition with this slug or month/year already exists',
        409,
        undefined,
        'DUPLICATE_EDITION'
      );
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
      'Failed to update edition:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to update edition',
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
  const parsedId = editionIdSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('Invalid edition identifier', 400, undefined, 'VALIDATION_ERROR');
  }

  try {
    const deleted = await deleteAdminEdition(parsedId.data);

    if (!deleted) {
      return apiError('Edition not found', 404, undefined, 'NOT_FOUND');
    }

    const response = apiSuccess({ id: parsedId.data }, 'Edition deleted');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error(
      'Failed to delete edition:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to delete edition',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
