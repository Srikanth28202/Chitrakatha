import { z } from 'zod';

export const BUSINESS_LANGUAGES = ['kannada', 'english', 'bilingual'] as const;
export const BUSINESS_CURRENCIES = ['INR'] as const;

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const pincodeListSchema = z
  .array(z.string().trim())
  .max(5000)
  .transform((values) =>
    Array.from(
      new Set(
        values
          .map((value) => value.replace(/\D/g, '').slice(0, 6))
          .filter((value) => value.length > 0)
      )
    )
  )
  .superRefine((values, ctx) => {
    const invalid = values.filter((value) => !/^[1-9]\d{5}$/.test(value));
    if (invalid.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid pincode${invalid.length === 1 ? '' : 's'}: ${invalid
          .slice(0, 10)
          .join(', ')}`,
      });
    }
  });

export const businessSettingsUpdateSchema = z.object({
  businessName: z.object({
    en: requiredText(160),
    kn: requiredText(160),
  }),
  supportedLanguages: z
    .array(z.enum(BUSINESS_LANGUAGES))
    .min(1)
    .max(BUSINESS_LANGUAGES.length),
  deliveryRegions: z
    .array(z.string().trim().min(1).max(120))
    .min(1)
    .max(30),
  serviceablePincodes: pincodeListSchema,
  shippingConfiguration: z.object({
    freeShippingThreshold: z.coerce.number().min(0).max(10_000_000),
    standardFee: z.coerce.number().min(0).max(10_000_000),
    expressFee: z.coerce.number().min(0).max(10_000_000),
  }),
  contactInformation: z.object({
    email: z.string().trim().email().max(200),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (value) => value.length === 0 || /^[+0-9()\-\s]{7,30}$/.test(value),
        'Enter a valid phone number.'
      ),
    address: requiredText(500),
  }),
  currency: z.enum(BUSINESS_CURRENCIES),
});

export type BusinessSettingsUpdateInput = z.infer<
  typeof businessSettingsUpdateSchema
>;
