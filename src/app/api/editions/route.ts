import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Edition } from '@/models/Edition';
import { editionQuerySchema } from '@/lib/validations/edition';
import { apiSuccess, apiError } from '@/lib/api-response';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getSeedEditions } from '@/lib/edition-mapper';
import {
  PUBLIC_EDITION_STATUSES,
  normalizePublicEdition,
} from '@/lib/public-edition';
import type { PublicEdition } from '@/types/edition';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PUBLIC_PROJECTION = {
  _id: 1,
  slug: 1,
  titleEn: 1,
  titleKn: 1,
  descriptionEn: 1,
  descriptionKn: 1,
  month: 1,
  monthNumber: 1,
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
  startDate: 1,
  endDate: 1,
  dispatchDate: 1,
  status: 1,
};

const DEFAULT_PUBLIC_STATUSES = ['active', 'upcoming'] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPublicEditions(values: unknown[]): PublicEdition[] {
  return values
    .map(normalizePublicEdition)
    .filter((edition): edition is PublicEdition => edition !== null);
}

function sortByPublicationDate<T extends { year?: number; monthNumber?: number }>(
  editions: T[]
): T[] {
  return [...editions].sort((a, b) => {
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return (b.monthNumber ?? 0) - (a.monthNumber ?? 0);
  });
}

export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, {
    bucket: 'editions',
    limit: 120,
    windowMs: 60_000,
  });
  if (limited) return limited;

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

    let isConnected = false;
    try {
      await connectToDatabase();
      isConnected = true;
    } catch (dbErr) {
      console.warn('MongoDB connection unavailable, serving fallback data:', dbErr);
    }

    if (isConnected) {
      const filter: Record<string, unknown> = {};

      if (status === 'all') {
        filter.status = { $in: PUBLIC_EDITION_STATUSES };
      } else if (status) {
        filter.status = status;
      } else {
        filter.status = { $in: DEFAULT_PUBLIC_STATUSES };
      }

      if (month) {
        filter.month = new RegExp(`^${escapeRegExp(month)}$`, 'i');
      }

      if (year) {
        filter.year = year;
      }

      const totalCount = await Edition.countDocuments(filter);

      if (totalCount === 0 && (await Edition.countDocuments({})) === 0) {
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

      return apiSuccess(toPublicEditions(editions), 'Editions retrieved successfully', {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        source: 'database',
      });
    }

    const publicSeeds = getSeedEditions().filter(
      (edition) =>
        edition.status === 'active' ||
        edition.status === 'upcoming' ||
        edition.status === 'sold_out'
    );

    let filtered = publicSeeds;

    if (!status) {
      filtered = publicSeeds.filter(
        (edition) => edition.status === 'active' || edition.status === 'upcoming'
      );
    } else if (status !== 'all') {
      filtered = publicSeeds.filter((edition) => edition.status === status);
    }

    if (month) {
      filtered = filtered.filter(
        (edition) => edition.month?.toLowerCase() === month.toLowerCase()
      );
    }

    if (year) {
      filtered = filtered.filter((edition) => edition.year === year);
    }

    const sorted = sortByPublicationDate(filtered);
    const total = sorted.length;
    const paginated = sorted.slice((page - 1) * limit, page * limit);

    return apiSuccess(
      toPublicEditions(paginated),
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
