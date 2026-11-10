import type {
  PublicEdition,
  PublicEditionItem,
  PublicEditionItemType,
  PublicEditionLanguage,
  PublicEditionStatus,
} from '@/types/edition';

export const PUBLIC_EDITION_STATUSES: readonly PublicEditionStatus[] = [
  'active',
  'upcoming',
  'sold_out',
];

const PUBLIC_EDITION_STATUS_SET = new Set<string>(PUBLIC_EDITION_STATUSES);

const PUBLIC_EDITION_LANGUAGES: readonly PublicEditionLanguage[] = [
  'kannada',
  'english',
  'bilingual',
];

const PUBLIC_EDITION_LANGUAGE_SET = new Set<string>(PUBLIC_EDITION_LANGUAGES);

const PUBLIC_EDITION_ITEM_TYPES: readonly PublicEditionItemType[] = [
  'story_letter',
  'art_card',
  'sticker_sheet',
  'bookmark',
  'puzzle',
  'colouring_sheet',
  'keepsake',
];

const PUBLIC_EDITION_ITEM_TYPE_SET = new Set<string>(PUBLIC_EDITION_ITEM_TYPES);

export const KANNADA_MONTH_NAMES: Record<string, string> = {
  January: 'ಜನವರಿ',
  February: 'ಫೆಬ್ರವರಿ',
  March: 'ಮಾರ್ಚ್',
  April: 'ಏಪ್ರಿಲ್',
  May: 'ಮೇ',
  June: 'ಜೂನ್',
  July: 'ಜುಲೈ',
  August: 'ಆಗಸ್ಟ್',
  September: 'ಸೆಪ್ಟೆಂಬರ್',
  October: 'ಅಕ್ಟೋಬರ್',
  November: 'ನವೆಂಬರ್',
  December: 'ಡಿಸೆಂಬರ್',
};

const MONTH_NUMBERS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function asId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toHexString' in value) {
    const toHexString = (value as { toHexString?: unknown }).toHexString;
    if (typeof toHexString === 'function') {
      return String(toHexString.call(value));
    }
  }
  return '';
}

function toIsoString(value: unknown): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function normalizeItem(value: unknown, index: number): PublicEditionItem | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const itemType = asString(record.itemType);

  return {
    id: asString(record.id) || `item-${index + 1}`,
    itemType: PUBLIC_EDITION_ITEM_TYPE_SET.has(itemType)
      ? (itemType as PublicEditionItemType)
      : 'keepsake',
    nameEn: asString(record.nameEn),
    nameKn: asString(record.nameKn),
    descEn: asString(record.descEn),
    descKn: asString(record.descKn),
  };
}

/**
 * Converts a raw database/API edition payload into a safe public shape.
 *
 * Returns null for drafts, archived editions, malformed records or anything
 * that is not part of the public catalogue. This is the last line of defence
 * for requirement: archived and draft editions must never be public.
 */
export function normalizePublicEdition(value: unknown): PublicEdition | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const status = asString(record.status);

  if (!PUBLIC_EDITION_STATUS_SET.has(status)) {
    return null;
  }

  const slug = asString(record.slug);
  if (!slug) return null;

  const month = asString(record.month);
  const monthNumber = asNumber(record.monthNumber) || MONTH_NUMBERS[month.toLowerCase()] || 0;
  const images =
    record.images && typeof record.images === 'object'
      ? (record.images as Record<string, unknown>)
      : {};

  const includedItems = Array.isArray(record.includedItems)
    ? record.includedItems
        .map((item, index) => normalizeItem(item, index))
        .filter((item): item is PublicEditionItem => item !== null)
    : [];

  const availableLanguages = asStringArray(record.availableLanguages)
    .filter((language): language is PublicEditionLanguage =>
      PUBLIC_EDITION_LANGUAGE_SET.has(language)
    );

  return {
    id: asId(record.id) || asId(record._id) || slug,
    slug,
    month,
    monthNumber,
    year: asNumber(record.year),
    titleEn: asString(record.titleEn),
    titleKn: asString(record.titleKn),
    descriptionEn: asString(record.descriptionEn),
    descriptionKn: asString(record.descriptionKn),
    themeEn: asString(record.themeEn),
    themeKn: asString(record.themeKn),
    seasonEn: asString(record.seasonEn),
    seasonKn: asString(record.seasonKn),
    curatorEn: asString(record.curatorEn),
    curatorKn: asString(record.curatorKn),
    images: {
      coverUrl: asString(images.coverUrl),
      bannerUrl: asString(images.bannerUrl),
      galleryUrls: asStringArray(images.galleryUrls),
    },
    includedItems,
    availableLanguages,
    price: asNumber(record.price),
    recurringPrice: asNumber(record.recurringPrice),
    stock: asNumber(record.stock),
    startDate: toIsoString(record.startDate),
    endDate: toIsoString(record.endDate),
    dispatchDate: toIsoString(record.dispatchDate),
    status: status as PublicEditionStatus,
  };
}

export function getEditionMonthLabel(month: string, isKannada: boolean): string {
  if (!isKannada) return month;
  return KANNADA_MONTH_NAMES[month] ?? month;
}
