import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type CouponDiscountType = 'percentage' | 'flat';
export type ApplicablePurchaseType = 'one_time' | 'recurring' | 'season_pass';

export interface ICoupon extends Document {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderValue?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  usedCount: number;
  applicableEditions: Types.ObjectId[];
  applicablePurchaseTypes: ApplicablePurchaseType[];
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    perCustomerLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableEditions: {
      type: [Schema.Types.ObjectId],
      ref: 'Edition',
      default: [],
    },
    applicablePurchaseTypes: {
      type: [String],
      enum: ['one_time', 'recurring', 'season_pass'],
      default: ['one_time', 'recurring', 'season_pass'],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
