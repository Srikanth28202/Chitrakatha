export type SubscriptionCadence = 'monthly' | 'quarterly' | 'annual';

export interface PlanFeature {
  id: string;
  textEn: string;
  textKn: string;
  highlighted?: boolean;
}

export interface SubscriptionTier {
  id: string;
  slug: string;
  titleEn: string;
  titleKn: string;
  subtitleEn: string;
  subtitleKn: string;
  priceInr: number;
  cadence: SubscriptionCadence;
  badgeEn?: string;
  badgeKn?: string;
  isPopular?: boolean;
  features: PlanFeature[];
}

export interface MonthlyTheme {
  id: string;
  month: string;
  year: number;
  titleEn: string;
  titleKn: string;
  curatorEn: string;
  curatorKn: string;
  descriptionEn: string;
  descriptionKn: string;
  heroImageUrl: string;
  status: 'active' | 'upcoming' | 'archived';
}

