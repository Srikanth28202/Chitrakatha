import { connectToDatabase } from '@/lib/db';
import { Setting, type ISetting } from '@/models/Setting';

if (typeof window !== 'undefined') {
  throw new Error(
    'src/services/business-settings.service.ts is a server-side module and cannot be loaded on the client.'
  );
}

export const GENERAL_SETTINGS_KEY = 'general_settings';

export interface BusinessSettings {
  key: string;
  businessName: {
    en: string;
    kn: string;
  };
  supportedLanguages: Array<'kannada' | 'english' | 'bilingual'>;
  deliveryRegions: string[];
  serviceablePincodes: string[];
  shippingConfiguration: {
    freeShippingThreshold: number;
    standardFee: number;
    expressFee: number;
  };
  contactInformation: {
    email: string;
    phone: string;
    address: string;
  };
  currency: string;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  key: GENERAL_SETTINGS_KEY,
  businessName: {
    en: 'Chitrakatha',
    kn: 'Chitrakatha',
  },
  supportedLanguages: ['bilingual', 'kannada', 'english'],
  deliveryRegions: ['Karnataka', 'Pan-India'],
  serviceablePincodes: [],
  shippingConfiguration: {
    freeShippingThreshold: 499,
    standardFee: 0,
    expressFee: 99,
  },
  contactInformation: {
    email: 'namaskara@chitrakatha.art',
    phone: '',
    address: 'Basavanagudi & Indiranagar, Bengaluru, Karnataka, India',
  },
  currency: 'INR',
};

function toNonNegativeNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizePincodes(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => String(value).replace(/\D/g, '').slice(0, 6))
        .filter((value) => /^[1-9]\d{5}$/.test(value))
    )
  );
}

function serializeSettings(settings: ISetting | null): BusinessSettings {
  if (!settings) return DEFAULT_BUSINESS_SETTINGS;

  return {
    key: settings.key || GENERAL_SETTINGS_KEY,
    businessName: {
      en: settings.businessName?.en?.trim() || DEFAULT_BUSINESS_SETTINGS.businessName.en,
      kn: settings.businessName?.kn?.trim() || DEFAULT_BUSINESS_SETTINGS.businessName.kn,
    },
    supportedLanguages:
      Array.isArray(settings.supportedLanguages) && settings.supportedLanguages.length > 0
        ? settings.supportedLanguages
        : DEFAULT_BUSINESS_SETTINGS.supportedLanguages,
    deliveryRegions:
      Array.isArray(settings.deliveryRegions) && settings.deliveryRegions.length > 0
        ? settings.deliveryRegions.filter((region) => typeof region === 'string')
        : DEFAULT_BUSINESS_SETTINGS.deliveryRegions,
    serviceablePincodes: normalizePincodes(settings.serviceablePincodes),
    shippingConfiguration: {
      freeShippingThreshold: toNonNegativeNumber(
        settings.shippingConfiguration?.freeShippingThreshold,
        DEFAULT_BUSINESS_SETTINGS.shippingConfiguration.freeShippingThreshold
      ),
      standardFee: toNonNegativeNumber(
        settings.shippingConfiguration?.standardFee,
        DEFAULT_BUSINESS_SETTINGS.shippingConfiguration.standardFee
      ),
      expressFee: toNonNegativeNumber(
        settings.shippingConfiguration?.expressFee,
        DEFAULT_BUSINESS_SETTINGS.shippingConfiguration.expressFee
      ),
    },
    contactInformation: {
      email:
        settings.contactInformation?.email?.trim() ||
        DEFAULT_BUSINESS_SETTINGS.contactInformation.email,
      phone: settings.contactInformation?.phone?.trim() || '',
      address:
        settings.contactInformation?.address?.trim() ||
        DEFAULT_BUSINESS_SETTINGS.contactInformation.address,
    },
    currency: (settings.currency || DEFAULT_BUSINESS_SETTINGS.currency).toUpperCase(),
  };
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  await connectToDatabase();
  const settings = await Setting.findOne({ key: GENERAL_SETTINGS_KEY }).lean<ISetting>();
  return serializeSettings(settings);
}

export async function updateBusinessSettings(
  input: Omit<BusinessSettings, 'key'>
): Promise<BusinessSettings> {
  await connectToDatabase();

  const settings = await Setting.findOneAndUpdate(
    { key: GENERAL_SETTINGS_KEY },
    {
      // `key` must only appear in $set. Listing it in $setOnInsert as well
      // makes MongoDB reject the insert path of the upsert with a conflict
      // ("Updating the path 'key' would create a conflict at 'key'").
      $set: {
        key: GENERAL_SETTINGS_KEY,
        businessName: input.businessName,
        supportedLanguages: input.supportedLanguages,
        deliveryRegions: input.deliveryRegions,
        serviceablePincodes: normalizePincodes(input.serviceablePincodes),
        shippingConfiguration: input.shippingConfiguration,
        contactInformation: input.contactInformation,
        currency: input.currency.toUpperCase(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean<ISetting>();

  return serializeSettings(settings);
}
