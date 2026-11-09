import { z } from 'zod';

export const EDITION_STATUSES = [
  'draft',
  'upcoming',
  'active',
  'sold_out',
  'archived',
] as const;

export const EDITION_LANGUAGES = ['kannada', 'english', 'bilingual'] as const;

export const EDITION_ITEM_TYPES = [
  'story_letter',
  'art_card',
  'sticker_sheet',
  'bookmark',
  'puzzle',
  'colouring_sheet',
  'keepsake',
] as const;

export const EDITION_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type EditionStatusValue = (typeof EDITION_STATUSES)[number];
export type EditionLanguageValue = (typeof EDITION_LANGUAGES)[number];
export type EditionItemTypeValue = (typeof EDITION_ITEM_TYPES)[number];

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid edition identifier');

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(''));

const includedItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  nameEn: requiredText(200),
  nameKn: requiredText(200),
  descEn: optionalText(1000),
  descKn: optionalText(1000),
  itemType: z.enum(EDITION_ITEM_TYPES),
});

const imagesSchema = z.object({
  coverUrl: requiredText(2048),
  bannerUrl: optionalText(2048),
  galleryUrls: z.array(z.string().trim().min(1).max(2048)).max(30).default([]),
});

const baseEditionSchema = z.object({
  month: z.string().trim().min(3).max(20),
  monthNumber: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2024).max(2050),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers and single hyphens'
    ),
  titleEn: requiredText(200),
  titleKn: requiredText(200),
  descriptionEn: requiredText(5000),
  descriptionKn: requiredText(5000),
  themeEn: requiredText(200),
  themeKn: requiredText(200),
  seasonEn: optionalText(200),
  seasonKn: optionalText(200),
  curatorEn: optionalText(200),
  curatorKn: optionalText(200),
  images: imagesSchema,
  includedItems: z.array(includedItemSchema).max(50).default([]),
  availableLanguages: z.array(z.enum(EDITION_LANGUAGES)).min(1).max(3),
  price: z.coerce.number().min(0).max(10_000_000),
  recurringPrice: z.coerce.number().min(0).max(10_000_000),
  stock: z.coerce.number().int().min(0).max(10_000_000),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  dispatchDate: z.coerce.date(),
  status: z.enum(EDITION_STATUSES),
});

type EditionBase = z.infer<typeof baseEditionSchema>;

function validateEditionFields(data: EditionBase, ctx: z.RefinementCtx) {
  if (data.endDate.getTime() < data.startDate.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Registration end date must be on or after the start date',
    });
  }

  const expectedMonth = EDITION_MONTHS[data.monthNumber - 1];
  if (expectedMonth.toLowerCase() !== data.month.toLowerCase()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['month'],
      message: `Month must match the month number (expected ${expectedMonth})`,
    });
  }

  if (Number.isNaN(data.startDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startDate'],
      message: 'Invalid start date',
    });
  }
}

export const editionCreateSchema = baseEditionSchema.superRefine(validateEditionFields);
export const editionUpdateSchema = baseEditionSchema.superRefine(validateEditionFields);

export const editionStatusUpdateSchema = z.object({
  status: z.enum(EDITION_STATUSES),
});

export const editionPatchSchema = z.union([
  editionUpdateSchema,
  editionStatusUpdateSchema,
]);

export const editionIdSchema = objectIdSchema;

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminEditionListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum([...EDITION_STATUSES, 'all'] as const).optional().default('all')
  ),
  year: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(2024).max(2050).optional()
  ),
  month: z.preprocess(emptyToUndefined, z.string().trim().max(20).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(50).default(10)
  ),
});

export type AdminEditionListQuery = z.infer<typeof adminEditionListQuerySchema>;
export type EditionCreateInput = z.infer<typeof editionCreateSchema>;
export type EditionUpdateInput = z.infer<typeof editionUpdateSchema>;

export interface AdminEditionFormItem {
  id: string;
  itemType: EditionItemTypeValue;
  nameEn: string;
  nameKn: string;
  descEn: string;
  descKn: string;
}

export interface AdminEditionFormData {
  id?: string;
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
  includedItems: AdminEditionFormItem[];
}
