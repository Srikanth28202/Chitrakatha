import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminCustomerListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(20)
  ),
});

export const customerEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(200);

export type AdminCustomerListQuery = z.infer<typeof adminCustomerListQuerySchema>;
