import mongoose, { Schema, Document, Model } from 'mongoose';

export type EditionStatus =
  | 'draft'
  | 'upcoming'
  | 'active'
  | 'sold_out'
  | 'archived';

export interface IEditionIncludedItem {
  id: string;
  nameEn: string;
  nameKn: string;
  descEn?: string;
  descKn?: string;
  itemType:
    | 'story_letter'
    | 'art_card'
    | 'sticker_sheet'
    | 'bookmark'
    | 'puzzle'
    | 'colouring_sheet'
    | 'keepsake';
}

export interface IEditionImages {
  coverUrl: string;
  galleryUrls?: string[];
  bannerUrl?: string;
}

export interface IEdition {
  month: string;
  monthNumber: number; // 1 to 12 for chronological sorting
  year: number;
  slug: string;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  themeEn: string;
  themeKn: string;
  seasonEn?: string;
  seasonKn?: string;
  curatorEn?: string;
  curatorKn?: string;
  images: IEditionImages;
  includedItems: IEditionIncludedItem[];
  availableLanguages: ('kannada' | 'english' | 'bilingual')[];
  price: number;
  recurringPrice: number;
  stock: number;
  startDate: Date;
  endDate: Date;
  dispatchDate: Date;
  status: EditionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEditionDocument extends IEdition, Document {}

const IncludedItemSchema = new Schema<IEditionIncludedItem>(
  {
    id: { type: String, required: true },
    nameEn: { type: String, required: true },
    nameKn: { type: String, required: true },
    descEn: { type: String },
    descKn: { type: String },
    itemType: {
      type: String,
      required: true,
      enum: [
        'story_letter',
        'art_card',
        'sticker_sheet',
        'bookmark',
        'puzzle',
        'colouring_sheet',
        'keepsake',
      ],
    },
  },
  { _id: false }
);

const EditionSchema = new Schema<IEditionDocument>(
  {
    month: {
      type: String,
      required: [true, 'Month name is required'],
      trim: true,
    },
    monthNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2024,
      max: 2050,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    titleEn: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: 200,
    },
    titleKn: {
      type: String,
      required: [true, 'Kannada title is required'],
      trim: true,
      maxlength: 200,
    },
    descriptionEn: {
      type: String,
      required: [true, 'English description is required'],
      trim: true,
    },
    descriptionKn: {
      type: String,
      required: [true, 'Kannada description is required'],
      trim: true,
    },
    themeEn: {
      type: String,
      required: true,
      trim: true,
    },
    themeKn: {
      type: String,
      required: true,
      trim: true,
    },
    seasonEn: {
      type: String,
      trim: true,
    },
    seasonKn: {
      type: String,
      trim: true,
    },
    curatorEn: {
      type: String,
      trim: true,
    },
    curatorKn: {
      type: String,
      trim: true,
    },
    images: {
      coverUrl: { type: String, required: true, default: '/images/editions/default.jpg' },
      galleryUrls: { type: [String], default: [] },
      bannerUrl: { type: String },
    },
    includedItems: {
      type: [IncludedItemSchema],
      default: [],
    },
    availableLanguages: {
      type: [String],
      enum: ['kannada', 'english', 'bilingual'],
      default: ['bilingual', 'kannada', 'english'],
    },
    price: {
      type: Number,
      required: [true, 'One-time price is required'],
      min: [0, 'Price cannot be negative'],
    },
    recurringPrice: {
      type: Number,
      required: [true, 'Recurring price is required'],
      min: [0, 'Recurring price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dispatchDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'active', 'sold_out', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per month and year
EditionSchema.index({ year: 1, month: 1 }, { unique: true });

// Compound index for efficient public catalog queries
EditionSchema.index({ status: 1, year: -1, monthNumber: -1 });

export const Edition: Model<IEditionDocument> =
  mongoose.models.Edition ||
  mongoose.model<IEditionDocument>('Edition', EditionSchema);
