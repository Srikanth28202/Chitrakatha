import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Edition } from '@/models/Edition';
import { editionQuerySchema } from '@/lib/validations/edition';
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsedQuery = editionQuerySchema.safeParse(searchParams);

    if (!parsedQuery.success) {
      return apiError(
        'Invalid query parameters',
        400,
        parsedQuery.error.flatten().fieldErrors,
        'VALIDATION_ERROR'
      );
    }

    const { status, month, year, page, limit } = parsedQuery.data;

    // Attempt database connection
    let isConnected = false;
    try {
      await connectToDatabase();
      isConnected = true;
    } catch (dbErr) {
      console.warn('MongoDB connection unavailable, serving fallback data:', dbErr);
    }

    if (isConnected) {
      // Build MongoDB query filter
      const filter: Record<string, unknown> = {};

      if (status === 'all') {
        filter.status = { $ne: 'draft' };
      } else if (status) {
        filter.status = status;
      } else {
        // Default: return active and upcoming editions
        filter.status = { $in: ['active', 'upcoming'] };
      }

      if (month) {
        filter.month = new RegExp(`^${month}$`, 'i');
      }

      if (year) {
        filter.year = year;
      }

      // Check if editions collection needs initial population
      const totalCount = await Edition.countDocuments(filter);

      if (totalCount === 0 && (await Edition.countDocuments({})) === 0) {
        // Initial auto-seed from clean mock data mapping
        const seedData = getSeedEditions();
        await Edition.insertMany(seedData);
      }

      const total = await Edition.countDocuments(filter);
      const skip = (page - 1) * limit;

      const editions = await Edition.find(filter, PUBLIC_PROJECTION)
        .sort({ year: -1, monthNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return apiSuccess(
        editions,
        'Editions retrieved successfully',
        {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          source: 'database',
        }
      );
    }

    // Graceful fallback to static seed data when database is offline
    const seedRecords = getSeedEditions();
    let filtered = seedRecords.filter((ed) => ed.status !== 'draft');

    if (status === 'all') {
      // Keep all non-draft editions
    } else if (status === 'active') {
      filtered = filtered.filter((ed) => ed.status === 'active' || ed.status === 'upcoming');
    } else if (status) {
      filtered = filtered.filter((ed) => ed.status === status);
    }

    if (month) {
      filtered = filtered.filter((ed) => ed.month?.toLowerCase() === month.toLowerCase());
    }

    if (year) {
      filtered = filtered.filter((ed) => ed.year === year);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return apiSuccess(
      paginated,
      'Editions retrieved from backup store',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        source: 'static_fallback',
      }
    );
  } catch (error) {
    console.error('Error handling GET /api/editions:', error);
    return apiError(
      'An unexpected error occurred while fetching editions',
      500,
      undefined,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
