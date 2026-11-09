import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Plus } from 'lucide-react';
import { EditionFilters } from '@/components/admin/edition-filters';
import { EditionStatusBadge } from '@/components/admin/edition-status-badge';
import { ImagePreview } from '@/components/admin/image-preview';
import { Pagination } from '@/components/admin/pagination';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import {
  adminEditionListQuerySchema,
  type AdminEditionListQuery,
  type EditionStatusValue,
} from '@/lib/validations/admin-edition';
import {
  listAdminEditions,
  type AdminEditionListResult,
} from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editions',
  robots: { index: false, follow: false, nocache: true },
};

const EMPTY_COUNTS: Record<EditionStatusValue | 'all', number> = {
  all: 0,
  draft: 0,
  upcoming: 0,
  active: 0,
  sold_out: 0,
  archived: 0,
};

const FALLBACK_QUERY: AdminEditionListQuery = {
  q: undefined,
  status: 'all',
  year: undefined,
  month: undefined,
  page: 1,
  limit: 10,
};

interface EditionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function flattenParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      result[key] = value[0] ?? '';
    } else if (typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}

export default async function AdminEditionsPage({ searchParams }: EditionsPageProps) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login?next=/admin/editions');
  }

  const params = await searchParams;
  const parsedQuery = adminEditionListQuerySchema.safeParse(flattenParams(params));
  const query = parsedQuery.success ? parsedQuery.data : FALLBACK_QUERY;

  let result: AdminEditionListResult = {
    items: [],
    total: 0,
    page: query.page,
    limit: query.limit,
    totalPages: 1,
    statusCounts: EMPTY_COUNTS,
  };
  let loadError: string | null = null;

  try {
    result = await listAdminEditions(query);
  } catch (error) {
    console.error(
      'Failed to load admin editions:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    loadError = 'Unable to load editions from the database. Please try again.';
  }

  const baseParams = new URLSearchParams();
  if (query.q) baseParams.set('q', query.q);
  if (query.status !== 'all') baseParams.set('status', query.status);
  if (query.year) baseParams.set('year', String(query.year));
  if (query.month) baseParams.set('month', query.month);

  function createPageHref(page: number): string {
    const nextParams = new URLSearchParams(baseParams);
    if (page > 1) nextParams.set('page', String(page));
    const queryString = nextParams.toString();
    return queryString ? `/admin/editions?${queryString}` : '/admin/editions';
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-espresso-soft">
            Catalogue
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold text-espresso-dark">
            Editions
          </h1>
          <p className="mt-1 text-sm text-espresso-muted">
            Create, edit, publish and archive monthly editions.
          </p>
        </div>
        <Link
          href="/admin/editions/new"
          className="inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New edition
        </Link>
      </div>

      <EditionFilters
        initial={{
          q: query.q ?? '',
          status: query.status,
          year: query.year ? String(query.year) : '',
          month: query.month ?? '',
        }}
        statusCounts={result.statusCounts}
      />

      {loadError && (
        <div className="rounded-paper border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {loadError}
        </div>
      )}

      <section className="rounded-warm border border-border bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-espresso-dark">
            {result.total} {result.total === 1 ? 'edition' : 'editions'}
          </h2>
          <p className="text-xs text-espresso-soft">
            Page {result.page} of {result.totalPages}
          </p>
        </div>

        {result.items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-warm border border-border bg-canvas-paper text-espresso-soft">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-espresso-main">
              No editions found
            </p>
            <p className="mt-1 text-sm text-espresso-muted">
              Adjust your filters or create a new edition in MongoDB.
            </p>
            <Link
              href="/admin/editions/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create edition
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.14em] text-espresso-soft">
                  <th className="px-5 py-3 font-semibold">Edition</th>
                  <th className="px-5 py-3 font-semibold">Period</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Registration</th>
                  <th className="px-5 py-3 font-semibold">Dispatch</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {result.items.map((edition) => (
                  <tr key={edition.id} className="hover:bg-canvas-paper/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ImagePreview
                          src={edition.images.coverUrl}
                          alt={edition.titleEn}
                          className="h-11 w-11 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/editions/${edition.id}`}
                            className="block truncate font-medium text-espresso-main transition-colors hover:text-terracotta-700"
                          >
                            {edition.titleEn}
                          </Link>
                          <p className="truncate font-kannada text-xs text-espresso-soft">
                            {edition.titleKn}
                          </p>
                          <p className="truncate text-[10px] text-espresso-faint">
                            /{edition.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {edition.month} {edition.year}
                    </td>
                    <td className="px-5 py-3">
                      <EditionStatusBadge status={edition.status} />
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {formatINR(edition.price)}
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">{edition.stock}</td>
                    <td className="px-5 py-3 text-xs text-espresso-muted">
                      {formatDate(edition.startDate)} – {formatDate(edition.endDate)}
                    </td>
                    <td className="px-5 py-3 text-espresso-muted">
                      {formatDate(edition.dispatchDate)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs font-semibold">
                        <Link
                          href={`/admin/editions/${edition.id}`}
                          className="text-espresso-muted transition-colors hover:text-espresso-main"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/editions/${edition.id}/edit`}
                          className="text-terracotta-700 transition-colors hover:text-terracotta-800"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        createHref={createPageHref}
      />
    </div>
  );
}
