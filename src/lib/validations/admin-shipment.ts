import { z } from 'zod';

export const SHIPMENT_STATUSES = [
  'manifested',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'returned',
  'failed',
] as const;

export type ShipmentStatusValue = (typeof SHIPMENT_STATUSES)[number];

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null || value === undefined ? undefined : value;

const trackingUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) =>
      value.length === 0 || /^https?:\/\/[^\s]+$/i.test(value),
    'Enter a valid http(s) tracking URL'
  )
  .optional();

export const shipmentCreateSchema = z.object({
  orderId: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{24}$/i, 'Invalid order identifier'),
  courierName: z.string().trim().min(2).max(120),
  trackingNumber: z.string().trim().min(2).max(120),
  trackingUrl: trackingUrlSchema,
  shippingFee: z.coerce.number().min(0).max(10_000_000).default(0),
  dispatchDate: z.coerce.date().optional(),
  status: z.enum(SHIPMENT_STATUSES).default('manifested'),
  note: z.string().trim().max(500).optional(),
});

export const shipmentUpdateSchema = z
  .object({
    status: z.enum(SHIPMENT_STATUSES).optional(),
    courierName: z.string().trim().min(2).max(120).optional(),
    trackingNumber: z.string().trim().min(2).max(120).optional(),
    trackingUrl: trackingUrlSchema,
    shippingFee: z.coerce.number().min(0).max(10_000_000).optional(),
    dispatchDate: z.coerce.date().optional(),
    deliveryDate: z.coerce.date().optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one update');

export const adminShipmentListQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum([...SHIPMENT_STATUSES, 'all'] as const).optional().default('all')
  ),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(100).default(20)
  ),
});

export const shipmentIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid shipment identifier');

export type ShipmentCreateInput = z.infer<typeof shipmentCreateSchema>;
export type ShipmentUpdateInput = z.infer<typeof shipmentUpdateSchema>;
export type AdminShipmentListQuery = z.infer<
  typeof adminShipmentListQuerySchema
>;
