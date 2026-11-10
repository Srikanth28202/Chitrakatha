import { z } from 'zod';
import { CART_LIMITS } from '@/config/constants';

export const cartLanguageSchema = z.enum(['kannada', 'english', 'bilingual']);

export const cartItemSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid edition slug.'),
  language: cartLanguageSchema,
  quantity: z.coerce
    .number()
    .int()
    .min(1)
    .max(CART_LIMITS.MAX_QUANTITY_PER_ITEM),
});

export const cartItemsSchema = z
  .array(cartItemSchema)
  .min(1)
  .max(CART_LIMITS.MAX_ITEMS);

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode.');

export const couponCodeSchema = z.string().trim().min(3).max(30);

export const quoteRequestSchema = z.object({
  items: cartItemsSchema,
  pincode: pincodeSchema.optional(),
  couponCode: couponCodeSchema.optional(),
  email: z.string().trim().email().max(200).optional(),
});

export const customerDetailsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91[\s-]?)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number.'),
});

export const deliveryAddressSchema = z.object({
  line1: z.string().trim().min(5).max(200),
  line2: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || undefined),
  city: z.string().trim().min(2).max(100),
  state: z
    .string()
    .trim()
    .refine((value) => value.toLowerCase() === 'karnataka', {
      message: 'Delivery is currently available only within Karnataka.',
    }),
  postalCode: pincodeSchema,
  country: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || 'India')
    .refine((value) => value.toLowerCase() === 'india', {
      message: 'Delivery is currently available only within India.',
    }),
});

export const pendingOrderSchema = z.object({
  items: cartItemsSchema,
  customer: customerDetailsSchema,
  address: deliveryAddressSchema,
  couponCode: couponCodeSchema.optional(),
  idempotencyKey: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid checkout token.'),
});

export type QuoteRequestPayload = z.infer<typeof quoteRequestSchema>;
export type PendingOrderPayload = z.infer<typeof pendingOrderSchema>;
