import { connectToDatabase } from '@/lib/db';
import { Edition, IEdition } from '@/models/Edition';
import { getSeedEditions } from '@/lib/edition-mapper';
import { PUBLIC_EDITION_STATUSES } from '@/lib/public-edition';

export interface GetEditionsOptions {
  status?: 'active' | 'upcoming' | 'sold_out' | 'all';
  month?: string;
  year?: number;
  page?: number;
  limit?: number;
}

/**
 * Edition Service definition.
 * Encapsulates database operations for editions with fallback support.
 */
export const editionService = {
  /**
   * Retrieves paginated public editions from MongoDB, with graceful offline fallback.
   */
  async getEditions(options: GetEditionsOptions = {}) {
    const { status = 'active', month, year, page = 1, limit = 10 } = options;

    let isConnected = false;
    try {
      await connectToDatabase();
      isConnected = true;
    } catch {
      // Offline fallback
    }

    if (isConnected) {
      const filter: Record<string, unknown> = {};

      if (status === 'all') {
        filter.status = { $in: PUBLIC_EDITION_STATUSES };
      } else if (status) {
        filter.status = status;
      } else {
        filter.status = { $in: ['active', 'upcoming'] };
      }

      if (month) filter.month = new RegExp(`^${month}$`, 'i');
      if (year) filter.year = year;

      const total = await Edition.countDocuments(filter);
      const skip = (page - 1) * limit;

      const editions = await Edition.find(filter)
        .sort({ year: -1, monthNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IEdition[]>();

      return {
        editions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        source: 'database' as const,
      };
    }

    // Static fallback — never expose draft or archived editions.
    const publicStatuses = new Set<string>(PUBLIC_EDITION_STATUSES);
    const seedRecords = getSeedEditions();
    let filtered = seedRecords.filter(
      (ed) => typeof ed.status === 'string' && publicStatuses.has(ed.status)
    );

    if (!status) {
      filtered = filtered.filter((ed) => ed.status === 'active' || ed.status === 'upcoming');
    } else if (status !== 'all') {
      filtered = filtered.filter((ed) => ed.status === status);
    }

    if (month) filtered = filtered.filter((ed) => ed.month?.toLowerCase() === month.toLowerCase());
    if (year) filtered = filtered.filter((ed) => ed.year === year);

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      editions: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      source: 'static_fallback' as const,
    };
  },

  /**
   * Retrieves a single public edition by slug.
   */
  async getEditionBySlug(slug: string): Promise<Partial<IEdition> | null> {
    try {
      await connectToDatabase();
      const edition = await Edition.findOne({
        slug,
        status: { $in: PUBLIC_EDITION_STATUSES },
      }).lean<IEdition>();

      // When the database is reachable, trust its answer: drafts and archived
      // editions must never be served from the fallback store.
      return edition ?? null;
    } catch {
      // Fall through to fallback only when the database is unavailable.
    }

    const publicStatuses = new Set<string>(PUBLIC_EDITION_STATUSES);
    const fallback = getSeedEditions().find(
      (ed) => ed.slug === slug && typeof ed.status === 'string' && publicStatuses.has(ed.status)
    );
    return fallback ?? null;
  },

  /**
   * Seeds initial editions if the database is currently empty.
   */
  async seedInitialEditionsIfEmpty(): Promise<{ seeded: boolean; count: number }> {
    try {
      await connectToDatabase();
      const count = await Edition.countDocuments({});

      if (count === 0) {
        const seedData = getSeedEditions();
        await Edition.insertMany(seedData);
        return { seeded: true, count: seedData.length };
      }

      return { seeded: false, count };
    } catch (error) {
      console.error('Failed to seed editions:', error);
      return { seeded: false, count: 0 };
    }
  },
};
