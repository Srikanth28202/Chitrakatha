export type PublicEditionStatus = 'active' | 'upcoming' | 'sold_out';

export type PublicEditionLanguage = 'kannada' | 'english' | 'bilingual';

export type PublicEditionItemType =
  | 'story_letter'
  | 'art_card'
  | 'sticker_sheet'
  | 'bookmark'
  | 'puzzle'
  | 'colouring_sheet'
  | 'keepsake';

export interface PublicEditionItem {
  id: string;
  itemType: PublicEditionItemType;
  nameEn: string;
  nameKn: string;
  descEn: string;
  descKn: string;
}

export interface PublicEditionImages {
  coverUrl: string;
  bannerUrl: string;
  galleryUrls: string[];
}

export interface PublicEdition {
  id: string;
  slug: string;
  month: string;
  monthNumber: number;
  year: number;
  titleEn: string;
  titleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  themeEn: string;
  themeKn: string;
  seasonEn: string;
  seasonKn: string;
  curatorEn: string;
  curatorKn: string;
  images: PublicEditionImages;
  includedItems: PublicEditionItem[];
  availableLanguages: PublicEditionLanguage[];
  price: number;
  recurringPrice: number;
  stock: number;
  startDate: string;
  endDate: string;
  dispatchDate: string;
  status: PublicEditionStatus;
}
