import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ShipmentStatus =
  | 'manifested'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'failed';

export interface IShipment extends Document {
  orderId: Types.ObjectId;
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingFee: number;
  dispatchDate?: Date;
  deliveryDate?: Date;
  status: ShipmentStatus;
  statusHistory: {
    status: ShipmentStatus;
    note?: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentStatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'manifested',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'returned',
        'failed',
      ],
    },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    courierName: {
      type: String,
      required: true,
      trim: true,
      default: 'India Post Speed Post',
    },
    trackingNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    trackingUrl: {
      type: String,
      trim: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    dispatchDate: {
      type: Date,
      index: true,
    },
    deliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        'manifested',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'returned',
        'failed',
      ],
      default: 'manifested',
      index: true,
    },
    statusHistory: {
      type: [ShipmentStatusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Shipment: Model<IShipment> =
  mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

