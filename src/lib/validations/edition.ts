import { z } from 'zod';

export const PUBLIC_EDITION_STATUS_FILTERS = [
  'active',
  'upcoming',
  'sold_out',
  'all',
] as const;

export const editionQuerySchema = z.object({
  status: z.enum(PUBLIC_EDITION_STATUS_FILTERS).optional(),
  month: z.string().trim().optional(),
  year: z.coerce.number().int().min(2024).max(2050).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const editionSlugParamSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format. Use lowercase alphanumeric characters and hyphens.'),
});

export type EditionQueryParams = z.infer<typeof editionQuerySchema>;

