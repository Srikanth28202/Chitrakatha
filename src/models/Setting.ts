import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShippingConfiguration {
  freeShippingThreshold: number;
  standardFee: number;
  expressFee?: number;
}

export interface IContactInformation {
  email: string;
  phone?: string;
  address: string;
}

export interface ISetting extends Document {
  key: string; // Identifier key, e.g. 'general_settings'
  businessName: {
    en: string;
    kn: string;
  };
  supportedLanguages: ('kannada' | 'english' | 'bilingual')[];
  deliveryRegions: string[];
  serviceablePincodes: string[];
  shippingConfiguration: IShippingConfiguration;
  contactInformation: IContactInformation;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'general_settings',
      index: true,
    },
    businessName: {
      en: { type: String, default: 'Chitrakatha' },
      kn: { type: String, default: 'ಚಿತ್ರಕಥಾ' },
    },
    supportedLanguages: {
      type: [String],
      enum: ['kannada', 'english', 'bilingual'],
      default: ['bilingual', 'kannada', 'english'],
    },
    deliveryRegions: {
      type: [String],
      default: ['Karnataka', 'Pan-India'],
    },
    serviceablePincodes: {
      type: [String],
      default: [], // Empty means all regions are eligible under standard courier
    },
    shippingConfiguration: {
      freeShippingThreshold: { type: Number, default: 499 },
      standardFee: { type: Number, default: 0 }, // Free doorstep shipping
      expressFee: { type: Number, default: 99 },
    },
    contactInformation: {
      email: { type: String, default: 'namaskara@chitrakatha.art' },
      phone: { type: String },
      address: {
        type: String,
        default: 'Basavanagudi & Indiranagar, Bengaluru, Karnataka, India',
      },
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

