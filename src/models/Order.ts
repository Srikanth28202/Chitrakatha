import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PurchaseType = 'one_time' | 'recurring' | 'season_pass';
export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface IOrderPricing {
  basePrice: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface ICustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface IDeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderLanguage = 'kannada' | 'english' | 'bilingual';

export interface IOrderItem {
  editionId: Types.ObjectId;
  slug: string;
  titleEn: string;
  titleKn: string;
  coverUrl: string;
  selectedLanguage: OrderLanguage;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: Types.ObjectId;
  customerDetails: ICustomerDetails;
  deliveryAddress: IDeliveryAddress;
  items: IOrderItem[];
  /**
   * Legacy single-edition reference retained for older orders. New orders
   * always populate `items`.
   */
  editionId?: Types.ObjectId;
  selectedLanguage?: OrderLanguage;
  purchaseType: PurchaseType;
  quantity?: number;
  couponId?: Types.ObjectId;
  couponCode?: string;
  idempotencyKey?: string;
  fingerprint?: string;
  paymentAccessToken?: string;
  pricing: IOrderPricing;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    basePrice: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    editionId: {
      type: Schema.Types.ObjectId,
      ref: 'Edition',
      required: true,
    },
    slug: { type: String, required: true, trim: true },
    titleEn: { type: String, required: true, trim: true },
    titleKn: { type: String, required: true, trim: true },
    coverUrl: { type: String, default: '', trim: true },
    selectedLanguage: {
      type: String,
      enum: ['kannada', 'english', 'bilingual'],
      required: true,
      default: 'bilingual',
    },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerDetails: {
      type: CustomerDetailsSchema,
      required: true,
    },
    deliveryAddress: {
      type: DeliveryAddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    editionId: {
      type: Schema.Types.ObjectId,
      ref: 'Edition',
      index: true,
    },
    selectedLanguage: {
      type: String,
      enum: ['kannada', 'english', 'bilingual'],
      default: 'bilingual',
    },
    purchaseType: {
      type: String,
      enum: ['one_time', 'recurring', 'season_pass'],
      default: 'one_time',
      index: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
    },
    fingerprint: {
      type: String,
      trim: true,
    },
    paymentAccessToken: {
      type: String,
      trim: true,
    },
    pricing: {
      type: OrderPricingSchema,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ 'customerDetails.email': 1, createdAt: -1 });
OrderSchema.index({ 'items.editionId': 1 });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
OrderSchema.index({ fingerprint: 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

