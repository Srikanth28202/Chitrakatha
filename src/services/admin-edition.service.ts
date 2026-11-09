import { connectToDatabase } from '@/lib/db';
import {
  EDITION_STATUSES,
  type AdminEditionListQuery,
  type EditionCreateInput,
  type EditionLanguageValue,
  type EditionItemTypeValue,
  type EditionStatusValue,
  type EditionUpdateInput,
} from '@/lib/validations/admin-edition';
import { Edition, type IEdition } from '@/models/Edition';
import { Order } from '@/models/Order';
import { Subscription } from '@/models/Subscription';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-edition.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanEdition = IEdition & { _id: unknown };

export interface AdminEditionRecord {
  id: string;
  month: string;
  monthNumber: number;
  year: number;
  slug: string;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  themeEn: string;
  themeKn: string;
  seasonEn: string;
  seasonKn: string;
  curatorEn: string;
  curatorKn: string;
  status: EditionStatusValue;
  price: number;
  recurringPrice: number;
  stock: number;
  startDate: string;
  endDate: string;
  dispatchDate: string;
  availableLanguages: EditionLanguageValue[];
  images: {
    coverUrl: string;
    bannerUrl: string;
    galleryUrls: string[];
  };
  includedItems: {
    id: string;
    itemType: EditionItemTypeValue;
    nameEn: string;
    nameKn: string;
    descEn: string;
    descKn: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminEditionListResult {
  items: AdminEditionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<EditionStatusValue | 'all', number>;
}

export interface AdminDashboardSummary {
  editions: {
    total: number;
    active: number;
    draft: number;
    upcoming: number;
    soldOut: number;
    archived: number;
    lowStock: number;
  };
  orders: {
    total: number;
  };
  subscriptions: {
    total: number;
    active: number;
  };
  recentEditions: AdminEditionRecord[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIsoString(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function serializeEdition(doc: LeanEdition): AdminEditionRecord {
  return {
    id: String(doc._id),
    month: doc.month,
    monthNumber: doc.monthNumber,
    year: doc.year,
    slug: doc.slug,
    titleEn: doc.titleEn,
    titleKn: doc.titleKn,
    descriptionEn: doc.descriptionEn,
    descriptionKn: doc.descriptionKn,
    themeEn: doc.themeEn,
    themeKn: doc.themeKn,
    seasonEn: doc.seasonEn ?? '',
    seasonKn: doc.seasonKn ?? '',
    curatorEn: doc.curatorEn ?? '',
    curatorKn: doc.curatorKn ?? '',
    status: doc.status,
    price: doc.price,
    recurringPrice: doc.recurringPrice,
    stock: doc.stock,
    startDate: toIsoString(doc.startDate) ?? '',
    endDate: toIsoString(doc.endDate) ?? '',
    dispatchDate: toIsoString(doc.dispatchDate) ?? '',
    availableLanguages: doc.availableLanguages ?? [],
    images: {
      coverUrl: doc.images?.coverUrl ?? '',
      bannerUrl: doc.images?.bannerUrl ?? '',
      galleryUrls: doc.images?.galleryUrls ?? [],
    },
    includedItems: (doc.includedItems ?? []).map((item) => ({
      id: item.id,
      itemType: item.itemType,
      nameEn: item.nameEn,
      nameKn: item.nameKn,
      descEn: item.descEn ?? '',
      descKn: item.descKn ?? '',
    })),
    ...(toIsoString(doc.createdAt) ? { createdAt: toIsoString(doc.createdAt) } : {}),
    ...(toIsoString(doc.updatedAt) ? { updatedAt: toIsoString(doc.updatedAt) } : {}),
  };
}

export async function listAdminEditions(
  query: AdminEditionListQuery
): Promise<AdminEditionListResult> {
  await connectToDatabase();

  const { q, status, year, month, page, limit } = query;
  const filter: Record<string, unknown> = {};

  if (status !== 'all') {
    filter.status = status;
  }

  if (year) {
    filter.year = year;
  }

  if (month) {
    filter.month = new RegExp(`^${escapeRegExp(month)}$`, 'i');
  }

  if (q) {
    const pattern = new RegExp(escapeRegExp(q), 'i');
    filter.$or = [
      { titleEn: pattern },
      { titleKn: pattern },
      { slug: pattern },
      { themeEn: pattern },
      { themeKn: pattern },
      { month: pattern },
    ];
  }

  const skip = (page - 1) * limit;

  const [docs, total, statusAgg] = await Promise.all([
    Edition.find(filter)
      .sort({ year: -1, monthNumber: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanEdition[]>(),
    Edition.countDocuments(filter),
    Edition.aggregate<{ _id: EditionStatusValue; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = EDITION_STATUSES.reduce(
    (acc, statusValue) => {
      acc[statusValue] = 0;
      return acc;
    },
    { all: 0 } as Record<EditionStatusValue | 'all', number>
  );

  for (const row of statusAgg) {
    if (row && row._id in statusCounts) {
      statusCounts[row._id] = row.count;
    }
    statusCounts.all += row.count;
  }

  return {
    items: docs.map(serializeEdition),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    statusCounts,
  };
}

export async function getAdminEditionById(id: string): Promise<AdminEditionRecord | null> {
  await connectToDatabase();
  const doc = await Edition.findById(id).lean<LeanEdition | null>();
  return doc ? serializeEdition(doc) : null;
}

export async function createAdminEdition(
  input: EditionCreateInput
): Promise<AdminEditionRecord> {
  await connectToDatabase();
  const doc = await Edition.create(input);
  return serializeEdition(doc.toObject() as LeanEdition);
}

export async function updateAdminEdition(
  id: string,
  input: EditionUpdateInput
): Promise<AdminEditionRecord | null> {
  await connectToDatabase();
  const doc = await Edition.findByIdAndUpdate(
    id,
    { $set: input },
    { new: true, runValidators: true }
  ).lean<LeanEdition | null>();

  return doc ? serializeEdition(doc) : null;
}

export async function updateAdminEditionStatus(
  id: string,
  status: EditionStatusValue
): Promise<AdminEditionRecord | null> {
  await connectToDatabase();
  const doc = await Edition.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean<LeanEdition | null>();

  return doc ? serializeEdition(doc) : null;
}

export async function deleteAdminEdition(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Edition.findByIdAndDelete(id);
  return Boolean(result);
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  await connectToDatabase();

  const [
    total,
    active,
    draft,
    upcoming,
    soldOut,
    archived,
    lowStock,
    ordersTotal,
    subscriptionsTotal,
    activeSubscriptions,
    recent,
  ] = await Promise.all([
    Edition.countDocuments({}),
    Edition.countDocuments({ status: 'active' }),
    Edition.countDocuments({ status: 'draft' }),
    Edition.countDocuments({ status: 'upcoming' }),
    Edition.countDocuments({ status: 'sold_out' }),
    Edition.countDocuments({ status: 'archived' }),
    Edition.countDocuments({ status: { $in: ['active', 'upcoming'] }, stock: { $lte: 20 } }),
    Order.countDocuments({}),
    Subscription.countDocuments({}),
    Subscription.countDocuments({ status: 'active' }),
    Edition.find({}).sort({ year: -1, monthNumber: -1, createdAt: -1 }).limit(5).lean<LeanEdition[]>(),
  ]);

  return {
    editions: {
      total,
      active,
      draft,
      upcoming,
      soldOut,
      archived,
      lowStock,
    },
    orders: { total: ordersTotal },
    subscriptions: { total: subscriptionsTotal, active: activeSubscriptions },
    recentEditions: recent.map(serializeEdition),
  };
}
