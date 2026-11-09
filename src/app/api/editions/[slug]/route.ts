import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Edition } from '@/models/Edition';
import { editionSlugParamSchema } from '@/lib/validations/edition';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSeedEditions } from '@/lib/edition-mapper';

export const dynamic = 'force-dynamic';

const PUBLIC_PROJECTION = {
  _id: 1,
  slug: 1,
  titleEn: 1,
  titleKn: 1,
  descriptionEn: 1,
  descriptionKn: 1,
  month: 1,
  year: 1,
  seasonEn: 1,
  seasonKn: 1,
  themeEn: 1,
  themeKn: 1,
  curatorEn: 1,
  curatorKn: 1,
  images: 1,
  includedItems: 1,
  availableLanguages: 1,
  price: 1,
  recurringPrice: 1,
  stock: 1,
  dispatchDate: 1,
  status: 1,
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const rawParams = await context.params;
    const parsedParams = editionSlugParamSchema.safeParse(rawParams);

    if (!parsedParams.success) {
      return apiError(
        'Invalid edition identifier',
        400,
        parsedParams.error.flatten().fieldErrors,
        'INVALID_SLUG'
      );
    }

    const { slug } = parsedParams.data;

    let isConnected = false;
    try {
      await connectToDatabase();
      isConnected = true;
    } catch (dbErr) {
      console.warn('MongoDB connection unavailable, checking fallback store:', dbErr);
    }

    if (isConnected) {
      const edition = await Edition.findOne(
        { slug, status: { $ne: 'draft' } },
        PUBLIC_PROJECTION
      ).lean();

      if (edition) {
        return apiSuccess(edition, 'Edition details retrieved successfully');
      }
    }

    // Check fallback seed store
    const fallbackSeed = getSeedEditions().find((ed) => ed.slug === slug);

    if (fallbackSeed && fallbackSeed.status !== 'draft') {
      return apiSuccess(
        fallbackSeed,
        'Edition details retrieved from backup store',
        { source: 'static_fallback' }
      );
    }

    return apiError(
      `Edition with slug '${slug}' was not found.`,
      404,
      undefined,
      'EDITION_NOT_FOUND'
    );
  } catch (error) {
    console.error('Error handling GET /api/editions/[slug]:', error);
    return apiError(
      'An unexpected error occurred while fetching edition details',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}

