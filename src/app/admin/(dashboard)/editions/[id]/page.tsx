import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Image as ImageIcon,
  Layers,
  Pencil,
  Tag,
} from 'lucide-react';
import { EditionActions } from '@/components/admin/edition-actions';
import { EditionStatusBadge } from '@/components/admin/edition-status-badge';
import { ImagePreview } from '@/components/admin/image-preview';
import { Badge } from '@/components/ui/badge';
import { requireAdmin } from '@/lib/auth/guards';
import { formatDate, formatINR } from '@/lib/utils';
import {
  editionIdSchema,
  type EditionItemTypeValue,
} from '@/lib/validations/admin-edition';
import { getAdminEditionById } from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edition details',
  robots: { index: false, follow: false, nocache: true },
};

interface EditionDetailPageProps {
  params: Promise<{ id: string }>;
}

const ITEM_TYPE_LABELS: Record<EditionItemTypeValue, string> = {
  story_letter: 'Story letter',
  art_card: 'Art card',
  sticker_sheet: 'Sticker sheet',
  bookmark: 'Bookmark',
  puzzle: 'Puzzle',
  colouring_sheet: 'Colouring sheet',
  keepsake: 'Keepsake',
};

const LANGUAGE_LABELS: Record<string, string> = {
  kannada: 'Kannada',
  english: 'English',
  bilingual: 'Bilingual',
};

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
        {label}
      </p>
      <div className="mt-1 text-sm text-espresso-main">{value}</div>
    </div>
  );
}

export default async function EditionDetailPage({ params }: EditionDetailPageProps) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/admin/login?next=/admin/editions');
  }

  const { id } = await params;
  const parsedId = editionIdSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const edition = await getAdminEditionById(parsedId.data);

  if (!edition) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/editions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-espresso-soft transition-colors hover:text-terracotta-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to editions
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl font-semibold text-espresso-dark">
              {edition.titleEn}
            </h1>
            <EditionStatusBadge status={edition.status} />
          </div>
          <p className="font-kannada mt-1 text-lg text-espresso-muted">{edition.titleKn}</p>
          <p className="mt-1 text-xs text-espresso-soft">
            {edition.month} {edition.year} · /{edition.slug}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={`/admin/editions/${edition.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-paper bg-terracotta-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-700"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit edition
          </Link>
          <EditionActions id={edition.id} status={edition.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-warm border border-border bg-white p-5 shadow-subtle sm:p-6">
            <h2 className="font-serif text-xl font-semibold text-espresso-dark">
              Bilingual content
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-paper border border-border-subtle bg-canvas-paper/50 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta-700">
                  English
                </p>
                <p className="text-sm font-semibold text-espresso-main">{edition.titleEn}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-espresso-muted">
                  {edition.descriptionEn}
                </p>
                <dl className="mt-3 space-y-1 text-xs text-espresso-muted">
                  <div>
                    <span className="font-semibold text-espresso-main">Theme:</span>{' '}
                    {edition.themeEn}
                  </div>
                  {edition.seasonEn && (
                    <div>
                      <span className="font-semibold text-espresso-main">Season:</span>{' '}
                      {edition.seasonEn}
                    </div>
                  )}
                  {edition.curatorEn && (
                    <div>
                      <span className="font-semibold text-espresso-main">Curator:</span>{' '}
                      {edition.curatorEn}
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-paper border border-border-subtle bg-canvas-paper/50 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta-700">
                  Kannada
                </p>
                <p className="font-kannada text-sm font-semibold text-espresso-main">
                  {edition.titleKn}
                </p>
                <p className="font-kannada mt-2 whitespace-pre-line text-sm leading-relaxed text-espresso-muted">
                  {edition.descriptionKn}
                </p>
                <dl className="font-kannada mt-3 space-y-1 text-xs text-espresso-muted">
                  <div>
                    <span className="font-semibold text-espresso-main">ಥೀಮ್:</span>{' '}
                    {edition.themeKn}
                  </div>
                  {edition.seasonKn && (
                    <div>
                      <span className="font-semibold text-espresso-main">ಋತು:</span>{' '}
                      {edition.seasonKn}
                    </div>
                  )}
                  {edition.curatorKn && (
                    <div>
                      <span className="font-semibold text-espresso-main">ಕ್ಯುರೇಟರ್:</span>{' '}
                      {edition.curatorKn}
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-subtle sm:p-6">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-terracotta-600" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-espresso-dark">
                Included items
              </h2>
              <span className="text-xs text-espresso-soft">
                ({edition.includedItems.length})
              </span>
            </div>

            {edition.includedItems.length === 0 ? (
              <p className="mt-3 text-sm text-espresso-muted">
                No included items have been added to this edition.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {edition.includedItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-paper border border-border-subtle bg-canvas-paper/40 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-espresso-main">
                          {item.nameEn}
                        </span>
                        <span className="font-kannada text-sm text-espresso-muted">
                          {item.nameKn}
                        </span>
                      </div>
                      <Badge variant="paper">{ITEM_TYPE_LABELS[item.itemType]}</Badge>
                    </div>
                    {(item.descEn || item.descKn) && (
                      <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-espresso-muted sm:grid-cols-2">
                        <p>{item.descEn || '—'}</p>
                        <p className="font-kannada">{item.descKn || '—'}</p>
                      </div>
                    )}
                    <p className="mt-2 font-mono text-[10px] text-espresso-faint">
                      id: {item.id}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-subtle sm:p-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-terracotta-600" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-espresso-dark">Images</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
                  Cover
                </p>
                <ImagePreview
                  src={edition.images.coverUrl}
                  alt={`${edition.titleEn} cover`}
                  className="h-44 w-full"
                />
                <p className="mt-1 break-all font-mono text-[10px] text-espresso-faint">
                  {edition.images.coverUrl || '—'}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
                  Banner
                </p>
                <ImagePreview
                  src={edition.images.bannerUrl}
                  alt={`${edition.titleEn} banner`}
                  className="h-44 w-full"
                />
                <p className="mt-1 break-all font-mono text-[10px] text-espresso-faint">
                  {edition.images.bannerUrl || '—'}
                </p>
              </div>
            </div>

            {edition.images.galleryUrls.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-soft">
                  Gallery ({edition.images.galleryUrls.length})
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {edition.images.galleryUrls.map((url) => (
                    <ImagePreview
                      key={url}
                      src={url}
                      alt={`${edition.titleEn} gallery`}
                      className="h-28 w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-warm border border-border bg-white p-5 shadow-subtle">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-terracotta-600" aria-hidden="true" />
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Publication
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <DetailBlock label="Status" value={<EditionStatusBadge status={edition.status} />} />
              <DetailBlock label="Period" value={`${edition.month} ${edition.year}`} />
              <DetailBlock label="Slug" value={<span className="font-mono text-xs">{edition.slug}</span>} />
              <DetailBlock
                label="One-time price"
                value={formatINR(edition.price)}
              />
              <DetailBlock
                label="Recurring price"
                value={formatINR(edition.recurringPrice)}
              />
              <DetailBlock
                label="Stock"
                value={
                  <span className={edition.stock <= 20 ? 'font-semibold text-terracotta-700' : ''}>
                    {edition.stock} units
                  </span>
                }
              />
              <DetailBlock
                label="Available languages"
                value={edition.availableLanguages
                  .map((language) => LANGUAGE_LABELS[language] ?? language)
                  .join(', ')}
              />
            </div>
          </section>

          <section className="rounded-warm border border-border bg-white p-5 shadow-subtle">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-terracotta-600" aria-hidden="true" />
              <h2 className="font-serif text-lg font-semibold text-espresso-dark">
                Schedule
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              <DetailBlock label="Registration start" value={formatDate(edition.startDate)} />
              <DetailBlock label="Registration end" value={formatDate(edition.endDate)} />
              <DetailBlock label="Dispatch date" value={formatDate(edition.dispatchDate)} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
