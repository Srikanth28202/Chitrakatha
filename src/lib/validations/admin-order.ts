import { z } from 'zod';

export const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'packed',
  'dispatched',
  'delivered',
  'cancelled',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'authorized',
  'captured',
  'failed',
  'refunded',
] as const;

export const ADMIN_ORDER_SORTS = ['newest', 'oldest', 'highest_value'] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminOrderListQuerySchema = z
  .object({
    q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
    orderStatus: z.preprocess(
      emptyToUndefined,
      z.enum([...ORDER_STATUSES, 'all'] as const).optional().default('all')
    ),
    paymentStatus: z.preprocess(
      emptyToUndefined,
      z.enum([...PAYMENT_STATUSES, 'all'] as const).optional().default('all')
    ),
    from: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
    to: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
    sort: z.preprocess(
      emptyToUndefined,
      z.enum(ADMIN_ORDER_SORTS).optional().default('newest')
    ),
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).max(100).default(20)
    ),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.to.getTime() < data.from.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: 'End date must be on or after the start date',
      });
    }
  });

export const orderIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid order identifier');

export const adminOrderUpdateSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => data.orderStatus !== undefined || data.notes !== undefined,
    'Provide an order status or notes to update'
  );

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
