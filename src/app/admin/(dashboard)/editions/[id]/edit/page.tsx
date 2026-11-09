import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { EditionForm } from '@/components/admin/edition-form';
import { requireAdmin } from '@/lib/auth/guards';
import { toDateInputValue } from '@/lib/utils';
import {
  editionIdSchema,
  type AdminEditionFormData,
} from '@/lib/validations/admin-edition';
import { getAdminEditionById } from '@/services/admin-edition.service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit edition',
  robots: { index: false, follow: false, nocache: true },
};

interface EditEditionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEditionPage({ params }: EditEditionPageProps) {
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

  const initialData: AdminEditionFormData = {
    id: edition.id,
    month: edition.month,
    monthNumber: edition.monthNumber,
    year: edition.year,
    slug: edition.slug,
    titleEn: edition.titleEn,
    titleKn: edition.titleKn,
    descriptionEn: edition.descriptionEn,
    descriptionKn: edition.descriptionKn,
    themeEn: edition.themeEn,
    themeKn: edition.themeKn,
    seasonEn: edition.seasonEn,
    seasonKn: edition.seasonKn,
    curatorEn: edition.curatorEn,
    curatorKn: edition.curatorKn,
    status: edition.status,
    price: edition.price,
    recurringPrice: edition.recurringPrice,
    stock: edition.stock,
    startDate: toDateInputValue(edition.startDate),
    endDate: toDateInputValue(edition.endDate),
    dispatchDate: toDateInputValue(edition.dispatchDate),
    availableLanguages: edition.availableLanguages,
    images: {
      coverUrl: edition.images.coverUrl,
      bannerUrl: edition.images.bannerUrl,
      galleryUrls: edition.images.galleryUrls,
    },
    includedItems: edition.includedItems.map((item) => ({ ...item })),
  };

  return <EditionForm mode="edit" initialData={initialData} />;
}
