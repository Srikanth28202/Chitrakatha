import { z } from 'zod';

export const orderNumberSchema = z
  .string()
  .trim()
  .min(5)
  .max(40)
  .regex(/^[A-Za-z0-9-]+$/, 'Invalid order number.');

export const paymentTokenSchema = z.string().trim().min(10).max(200);

const razorpayIdSchema = z.string().trim().min(5).max(100);

export const paymentAccessSchema = z.object({
  orderNumber: orderNumberSchema,
  paymentToken: paymentTokenSchema,
});

export const paymentInitSchema = paymentAccessSchema;

export const paymentVerifySchema = paymentAccessSchema.extend({
  razorpayOrderId: razorpayIdSchema,
  razorpayPaymentId: razorpayIdSchema,
  razorpaySignature: z.string().trim().min(20).max(500),
});

export const paymentStatusQuerySchema = paymentAccessSchema;

export type PaymentAccessPayload = z.infer<typeof paymentAccessSchema>;
export type PaymentInitPayload = z.infer<typeof paymentInitSchema>;
export type PaymentVerifyPayload = z.infer<typeof paymentVerifySchema>;
