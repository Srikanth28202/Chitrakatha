import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import {
  getMongoErrorMessage,
  isDuplicateKeyError,
  isMongooseValidationError,
} from '@/lib/mongo-errors';
import {
  adminEditionListQuerySchema,
  editionCreateSchema,
} from '@/lib/validations/admin-edition';
import {
  createAdminEdition,
  listAdminEditions,
} from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin) {
    return apiError('Authentication required', 401, undefined, 'UNAUTHORIZED');
  }

  const parsed = adminEditionListQuerySchema.safeParse(
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
    const result = await listAdminEditions(parsed.data);
    const response = apiSuccess(result.items, 'Editions retrieved', {
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
      'Failed to list admin editions:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to load editions',
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

  const parsed = editionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      'Invalid edition data',
      400,
      parsed.error.flatten().fieldErrors,
      'VALIDATION_ERROR'
    );
  }

  try {
    const edition = await createAdminEdition(parsed.data);
    const response = apiSuccess(edition, 'Edition created', undefined, 201);
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
      'Failed to create edition:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return apiError(
      'Unable to create edition',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
