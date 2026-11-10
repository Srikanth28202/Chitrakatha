import { z } from 'zod';

export const PAYMENT_RECORD_STATUSES = [
  'created',
  'pending',
  'authorized',
  'success',
  'failed',
  'refunded',
] as const;

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminPaymentListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum([...PAYMENT_RECORD_STATUSES, 'all'] as const).optional().default('all')
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(20)
  ),
});

export const adminRefundSchema = z.object({
  orderId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i, 'Invalid order identifier'),
  reason: z.string().trim().min(3).max(300),
});

export type AdminPaymentListQuery = z.infer<typeof adminPaymentListQuerySchema>;
export type AdminRefundInput = z.infer<typeof adminRefundSchema>;
