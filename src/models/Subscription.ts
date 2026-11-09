import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ICustomerDetails } from './Order';

export type BillingFrequency = 'monthly' | 'quarterly' | 'annual';
export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'past_due'
  | 'pending';

export interface ISubscriptionConsent {
  termsAccepted: boolean;
  acceptedAt: Date;
  ipAddress?: string;
}

export interface ISubscription extends Document {
  userId?: Types.ObjectId;
  customerDetails: ICustomerDetails;
  subscriptionPlan: 'monthly-letterbox' | 'quarterly-season-pass' | 'annual-patron';
  currentEditionId?: Types.ObjectId;
  preferredLanguage: 'kannada' | 'english' | 'bilingual';
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  billingFrequency: BillingFrequency;
  pricePerCycle: number;
  startDate: Date;
  nextBillingDate: Date;
  cancelledAt?: Date;
  pausedAt?: Date;
  status: SubscriptionStatus;
  consent: ISubscriptionConsent;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ConsentSchema = new Schema<ISubscriptionConsent>(
  {
    termsAccepted: { type: Boolean, required: true, default: true },
    acceptedAt: { type: Date, required: true, default: Date.now },
    ipAddress: { type: String },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerDetails: {
      type: CustomerDetailsSchema,
      required: true,
    },
    subscriptionPlan: {
      type: String,
      required: true,
      enum: ['monthly-letterbox', 'quarterly-season-pass', 'annual-patron'],
      default: 'monthly-letterbox',
    },
    currentEditionId: {
      type: Schema.Types.ObjectId,
      ref: 'Edition',
    },
    preferredLanguage: {
      type: String,
      enum: ['kannada', 'english', 'bilingual'],
      default: 'bilingual',
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayCustomerId: {
      type: String,
      sparse: true,
    },
    billingFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual'],
      default: 'monthly',
      index: true,
    },
    pricePerCycle: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
      required: true,
      index: true,
    },
    cancelledAt: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'past_due', 'pending'],
      default: 'pending',
      index: true,
    },
    consent: {
      type: ConsentSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ 'customerDetails.email': 1, status: 1 });

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

