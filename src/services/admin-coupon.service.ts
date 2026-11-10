import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Coupon, type ICoupon } from '@/models/Coupon';
import { Order } from '@/models/Order';
import {
  COUPON_FILTER_STATUSES,
  type AdminCouponListQuery,
  type CouponCreateInput,
  type CouponFilterStatus,
  type CouponUpdateInput,
} from '@/lib/validations/admin-coupon';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/admin-coupon.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

type LeanCoupon = ICoupon & { _id: unknown };

export interface AdminCouponRecord {
  id: string;
  code: string;
  discountType: ICoupon['discountType'];
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue: number;
  usageLimit?: number;
  perCustomerLimit: number;
  usedCount: number;
  remainingUses?: number;
  applicableEditions: string[];
  applicablePurchaseTypes: ICoupon['applicablePurchaseTypes'];
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  status: Exclude<CouponFilterStatus, 'all'>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponListResult {
  items: AdminCouponRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: Record<CouponFilterStatus, number>;
}

export class AdminCouponServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = 'COUPON_ERROR', status = 400) {
    super(message);
    this.name = 'AdminCouponServiceError';
    this.code = code;
    this.status = status;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function deriveStatus(coupon: LeanCoupon, now = new Date()): AdminCouponRecord['status'] {
  const start = new Date(coupon.startDate);
  const expiry = new Date(coupon.expiryDate);

  if (!coupon.isActive) return 'inactive';
  if (Number.isNaN(expiry.getTime()) || now > expiry) return 'expired';
  if (!Number.isNaN(start.getTime()) && now < start) return 'scheduled';

  if (
    coupon.usageLimit !== undefined &&
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return 'exhausted';
  }

  return 'active';
}

function serializeCoupon(coupon: LeanCoupon): AdminCouponRecord {
  const remainingUses =
    coupon.usageLimit !== undefined && coupon.usageLimit !== null
      ? Math.max(0, coupon.usageLimit - coupon.usedCount)
      : undefined;

  return {
    id: String(coupon._id),
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    ...(coupon.maximumDiscount !== undefined && coupon.maximumDiscount !== null
      ? { maximumDiscount: coupon.maximumDiscount }
      : {}),
    minimumOrderValue: coupon.minimumOrderValue ?? 0,
    ...(coupon.usageLimit !== undefined && coupon.usageLimit !== null
      ? { usageLimit: coupon.usageLimit }
      : {}),
    perCustomerLimit: coupon.perCustomerLimit ?? 1,
    usedCount: coupon.usedCount ?? 0,
    ...(remainingUses !== undefined ? { remainingUses } : {}),
    applicableEditions: (coupon.applicableEditions ?? []).map(String),
    applicablePurchaseTypes: coupon.applicablePurchaseTypes ?? [],
    startDate: toIso(coupon.startDate),
    expiryDate: toIso(coupon.expiryDate),
    isActive: coupon.isActive,
    status: deriveStatus(coupon),
    createdAt: toIso(coupon.createdAt),
    updatedAt: toIso(coupon.updatedAt),
  };
}

function exhaustedExpression() {
  return {
    $expr: {
      $and: [
        { $gt: [{ $ifNull: ['$usageLimit', 0] }, 0] },
        { $gte: ['$usedCount', { $ifNull: ['$usageLimit', 0] }] },
      ],
    },
  };
}

function buildStatusFilter(status: CouponFilterStatus, now: Date) {
  switch (status) {
    case 'active':
      return {
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
        $nor: [exhaustedExpression()],
      };
    case 'scheduled':
      return { isActive: true, startDate: { $gt: now } };
    case 'expired':
      return { isActive: true, expiryDate: { $lt: now } };
    case 'inactive':
      return { isActive: false };
    case 'exhausted':
      return {
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
        ...exhaustedExpression(),
      };
    default:
      return {};
  }
}

async function countStatus(status: CouponFilterStatus, now: Date): Promise<number> {
  if (status === 'all') return Coupon.countDocuments({});
  return Coupon.countDocuments(buildStatusFilter(status, now));
}

export async function listAdminCoupons(
  query: AdminCouponListQuery
): Promise<AdminCouponListResult> {
  await connectToDatabase();

  const now = new Date();
  const filter: Record<string, unknown> = {
    ...buildStatusFilter(query.status, now),
  };

  if (query.q) {
    const pattern = new RegExp(escapeRegExp(query.q), 'i');
    filter.$and = [
      ...((filter.$and as unknown[]) ?? []),
      { $or: [{ code: pattern }] },
    ];
  }

  const [docs, total, ...statusCountValues] = await Promise.all([
    Coupon.find(filter)
      .sort({ isActive: -1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<LeanCoupon[]>(),
    Coupon.countDocuments(filter),
    ...COUPON_FILTER_STATUSES.map((status) => countStatus(status, now)),
  ]);

  const statusCounts = COUPON_FILTER_STATUSES.reduce(
    (counts, status, index) => {
      counts[status] = statusCountValues[index] ?? 0;
      return counts;
    },
    {} as Record<CouponFilterStatus, number>
  );

  return {
    items: docs.map(serializeCoupon),
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
    statusCounts,
  };
}

export async function getAdminCouponById(
  id: string
): Promise<AdminCouponRecord | null> {
  await connectToDatabase();
  const coupon = await Coupon.findById(id).lean<LeanCoupon | null>();
  return coupon ? serializeCoupon(coupon) : null;
}

function toDocumentInput(input: CouponCreateInput) {
  return {
    code: input.code,
    discountType: input.discountType,
    discountValue: input.discountValue,
    maximumDiscount: input.maximumDiscount,
    minimumOrderValue: input.minimumOrderValue,
    usageLimit: input.usageLimit,
    perCustomerLimit: input.perCustomerLimit,
    applicableEditions: input.applicableEditions.map((id) => new Types.ObjectId(id)),
    applicablePurchaseTypes: input.applicablePurchaseTypes,
    startDate: input.startDate,
    expiryDate: input.expiryDate,
    isActive: input.isActive,
  };
}

export async function createAdminCoupon(
  input: CouponCreateInput
): Promise<AdminCouponRecord> {
  await connectToDatabase();
  const coupon = await Coupon.create(toDocumentInput(input));
  return serializeCoupon(coupon.toObject() as LeanCoupon);
}

export async function updateAdminCoupon(
  id: string,
  input: CouponUpdateInput
): Promise<AdminCouponRecord | null> {
  await connectToDatabase();

  const existing = await Coupon.findById(id).lean<LeanCoupon | null>();
  if (!existing) return null;

  if (input.usageLimit !== undefined && input.usageLimit < existing.usedCount) {
    throw new AdminCouponServiceError(
      'Usage limit cannot be less than the number of coupons already used.',
      'COUPON_USAGE_LIMIT_TOO_LOW',
      400
    );
  }

  const update: Record<string, unknown> = {
    code: input.code,
    discountType: input.discountType,
    discountValue: input.discountValue,
    minimumOrderValue: input.minimumOrderValue,
    perCustomerLimit: input.perCustomerLimit,
    applicableEditions: input.applicableEditions.map((editionId) => new Types.ObjectId(editionId)),
    applicablePurchaseTypes: input.applicablePurchaseTypes,
    startDate: input.startDate,
    expiryDate: input.expiryDate,
    isActive: input.isActive,
  };

  const unset: Record<string, 1> = {};
  if (input.maximumDiscount === undefined) unset.maximumDiscount = 1;
  else update.maximumDiscount = input.maximumDiscount;

  if (input.usageLimit === undefined) unset.usageLimit = 1;
  else update.usageLimit = input.usageLimit;

  const coupon = await Coupon.findByIdAndUpdate(
    id,
    {
      $set: update,
      ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
    },
    { new: true, runValidators: true }
  ).lean<LeanCoupon | null>();

  return coupon ? serializeCoupon(coupon) : null;
}

export async function updateAdminCouponStatus(
  id: string,
  isActive: boolean
): Promise<AdminCouponRecord | null> {
  await connectToDatabase();
  const coupon = await Coupon.findByIdAndUpdate(
    id,
    { $set: { isActive } },
    { new: true, runValidators: true }
  ).lean<LeanCoupon | null>();

  return coupon ? serializeCoupon(coupon) : null;
}

export async function deleteAdminCoupon(id: string): Promise<boolean> {
  await connectToDatabase();

  const usedInOrders = await Order.countDocuments({ couponId: id });
  if (usedInOrders > 0) {
    throw new AdminCouponServiceError(
      'This coupon has been used on orders. Deactivate it instead of deleting it.',
      'COUPON_IN_USE',
      409
    );
  }

  const result = await Coupon.findByIdAndDelete(id);
  return Boolean(result);
}
