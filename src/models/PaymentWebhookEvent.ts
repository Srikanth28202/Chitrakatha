import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentWebhookStatus = 'processing' | 'processed' | 'failed';

export interface IPaymentWebhookEvent extends Document {
  eventId: string;
  provider: 'razorpay';
  eventType: string;
  status: PaymentWebhookStatus;
  /** Number of processing attempts. Capped to end provider retry loops. */
  attempts: number;
  providerOrderId?: string;
  providerPaymentId?: string;
  error?: string;
  payload?: Record<string, unknown>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['razorpay'],
      default: 'razorpay',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['processing', 'processed', 'failed'],
      default: 'processing',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    providerOrderId: {
      type: String,
      trim: true,
    },
    providerPaymentId: {
      type: String,
      trim: true,
    },
    error: {
      type: String,
      maxlength: 1000,
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentWebhookEventSchema.index({ provider: 1, providerOrderId: 1, createdAt: -1 });

export const PaymentWebhookEvent: Model<IPaymentWebhookEvent> =
  mongoose.models.PaymentWebhookEvent ||
  mongoose.model<IPaymentWebhookEvent>('PaymentWebhookEvent', PaymentWebhookEventSchema);
