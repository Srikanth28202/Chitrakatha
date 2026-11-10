import { z } from 'zod';

export const SUBSCRIPTION_STATUSES = [
  'pending',
  'active',
  'paused',
  'past_due',
  'cancelled',
] as const;

export const SUBSCRIPTION_PLANS = [
  'monthly-letterbox',
  'quarterly-season-pass',
  'annual-patron',
] as const;

export const SUBSCRIPTION_FREQUENCIES = ['monthly', 'quarterly', 'annual'] as const;

export type SubscriptionStatusValue = (typeof SUBSCRIPTION_STATUSES)[number];
export type SubscriptionPlanValue = (typeof SUBSCRIPTION_PLANS)[number];

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminSubscriptionListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum([...SUBSCRIPTION_STATUSES, 'all'] as const).optional().default('all')
  ),
  plan: z.preprocess(
    emptyToUndefined,
    z.enum([...SUBSCRIPTION_PLANS, 'all'] as const).optional().default('all')
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(20)
  ),
});

export const subscriptionIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid subscription identifier');

export const adminSubscriptionUpdateSchema = z.object({
  status: z.enum(SUBSCRIPTION_STATUSES),
});

export type AdminSubscriptionListQuery = z.infer<
  typeof adminSubscriptionListQuerySchema
>;
export type AdminSubscriptionUpdateInput = z.infer<
  typeof adminSubscriptionUpdateSchema
>;
