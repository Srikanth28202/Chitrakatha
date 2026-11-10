import { z } from 'zod';

export const COUPON_DISCOUNT_TYPES = ['percentage', 'flat'] as const;
export const COUPON_PURCHASE_TYPES = ['one_time', 'recurring', 'season_pass'] as const;
export const COUPON_FILTER_STATUSES = [
  'all',
  'active',
  'scheduled',
  'expired',
  'inactive',
  'exhausted',
] as const;

export type CouponDiscountTypeValue = (typeof COUPON_DISCOUNT_TYPES)[number];
export type CouponPurchaseTypeValue = (typeof COUPON_PURCHASE_TYPES)[number];
export type CouponFilterStatus = (typeof COUPON_FILTER_STATUSES)[number];

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid edition identifier');

export const couponIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid coupon identifier');

const couponBaseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(30)
      .regex(/^[A-Z0-9_-]+$/, 'Use letters, numbers, underscores or hyphens only'),
    discountType: z.enum(COUPON_DISCOUNT_TYPES),
    discountValue: z.coerce.number().positive().max(10_000_000),
    maximumDiscount: z.coerce.number().min(0).max(10_000_000).optional(),
    minimumOrderValue: z.coerce.number().min(0).max(10_000_000).default(0),
    usageLimit: z.coerce.number().int().min(1).max(10_000_000).optional(),
    perCustomerLimit: z.coerce.number().int().min(1).max(1000).default(1),
    applicableEditions: z.array(objectIdSchema).max(500).default([]),
    applicablePurchaseTypes: z
      .array(z.enum(COUPON_PURCHASE_TYPES))
      .min(1)
      .max(COUPON_PURCHASE_TYPES.length),
    startDate: z.coerce.date(),
    expiryDate: z.coerce.date(),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'percentage' && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Percentage discounts cannot exceed 100%',
      });
    }

    if (data.expiryDate.getTime() <= data.startDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiryDate'],
        message: 'Expiry must be after the start date',
      });
    }

    if (
      data.maximumDiscount !== undefined &&
      data.discountType === 'flat' &&
      data.maximumDiscount > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maximumDiscount'],
        message: 'Maximum discount is only used for percentage coupons',
      });
    }
  });

export const couponCreateSchema = couponBaseSchema;
export const couponUpdateSchema = couponBaseSchema;

export const couponStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

export const couponPatchSchema = z.union([
  couponUpdateSchema,
  couponStatusUpdateSchema,
]);

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

export const adminCouponListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(COUPON_FILTER_STATUSES).optional().default('all')
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(20)
  ),
});

export type CouponCreateInput = z.infer<typeof couponCreateSchema>;
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;
export type AdminCouponListQuery = z.infer<typeof adminCouponListQuerySchema>;
export type CouponPatchInput = z.infer<typeof couponPatchSchema>;
