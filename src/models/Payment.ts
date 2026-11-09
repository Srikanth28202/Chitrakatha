import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PaymentProvider = 'razorpay' | 'manual' | 'other';
export type PaymentRecordStatus =
  | 'created'
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  provider: PaymentProvider;
  providerPaymentId?: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  rawResponse?: Record<string, unknown>;
  verifiedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay', 'manual', 'other'],
      default: 'razorpay',
    },
    providerPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    providerOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'success', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    rawResponse: {
      type: Schema.Types.Mixed,
    },
    verifiedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
