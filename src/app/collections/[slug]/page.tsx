import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EditionDetailView } from '@/components/collections/edition-detail';
import { siteConfig } from '@/config/site';
import { normalizePublicEdition } from '@/lib/public-edition';
import { editionSlugParamSchema } from '@/lib/validations/edition';
import { editionService } from '@/services/edition.service';
import type { PublicEdition } from '@/types/edition';

export const dynamic = 'force-dynamic';

interface EditionPageProps {
  params: Promise<{ slug: string }>;
}

function toAbsoluteUrl(value: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, siteConfig.url).toString();
  } catch {
    return undefined;
  }
}

async function loadPublicEdition(slug: string): Promise<PublicEdition | null> {
  const parsedSlug = editionSlugParamSchema.safeParse({ slug });
  if (!parsedSlug.success) return null;

  try {
    const record = await editionService.getEditionBySlug(parsedSlug.data.slug);
    return record ? normalizePublicEdition(record) : null;
  } catch (error) {
    console.error(
      'Failed to load public edition:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

export async function generateMetadata({ params }: EditionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const edition = await loadPublicEdition(slug);

  if (!edition) {
    return {
      title: 'Edition not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = new URL(`/collections/${edition.slug}`, siteConfig.url).toString();
  const title = `${edition.titleEn} · ${edition.titleKn}`;
  const description =
    [edition.descriptionEn, edition.descriptionKn].filter(Boolean).join(' ').slice(0, 300) ||
    siteConfig.description;
  const coverImage = toAbsoluteUrl(edition.images.coverUrl);

  return {
    title,
    description,
    keywords: [
      'Chitrakatha',
      edition.titleEn,
      edition.titleKn,
      edition.themeEn,
      edition.month,
      `${edition.year} edition`,
      'Kannada story letter',
      'bilingual art parcel',
    ].filter(Boolean),
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: 'en_IN',
      ...(coverImage
        ? {
            images: [
              {
                url: coverImage,
                alt: edition.titleEn,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function EditionPage({ params }: EditionPageProps) {
  const { slug } = await params;
  const edition = await loadPublicEdition(slug);

  if (!edition) {
    notFound();
  }

  return <EditionDetailView edition={edition} />;
}
