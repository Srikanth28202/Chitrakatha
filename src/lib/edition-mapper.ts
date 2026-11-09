import { CollectionItem, monthlyCollectionsData } from '@/data/collections';
import { IEdition } from '@/models/Edition';

const monthNumberMap: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

/**
 * Maps a mock CollectionItem into the Mongoose IEdition schema format.
 * Provides clean migration from static frontend data to MongoDB documents.
 */
export function mapCollectionItemToEditionDocument(item: CollectionItem): Partial<IEdition> {
  const monthNum = monthNumberMap[item.month] || 11;
  const monthIndex = monthNum - 1;

  const startDate = new Date(item.year, monthIndex, 1);
  const endDate = new Date(item.year, monthIndex + 1, 0);
  const dispatchDate = new Date(item.year, monthIndex, 5);

  const statusMap: Record<CollectionItem['status'], IEdition['status']> = {
    available: 'active',
    reserve: 'upcoming',
    archived: 'archived',
  };

  return {
    month: item.month,
    monthNumber: monthNum,
    year: item.year,
    slug: item.slug,
    titleEn: item.nameEn,
    titleKn: item.nameKn,
    descriptionEn: item.descriptionEn,
    descriptionKn: item.descriptionKn,
    themeEn: item.seasonEn,
    themeKn: item.seasonKn,
    seasonEn: item.seasonEn,
    seasonKn: item.seasonKn,
    curatorEn: item.curatorEn,
    curatorKn: item.curatorKn,
    images: {
      coverUrl: `/images/editions/${item.slug}.jpg`,
      galleryUrls: [
        `/images/editions/${item.slug}-letter.jpg`,
        `/images/editions/${item.slug}-cards.jpg`,
      ],
      bannerUrl: `/images/editions/${item.slug}-banner.jpg`,
    },
    includedItems: [
      {
        id: 'inc-letter',
        nameEn: item.inclusions.letterTitleEn,
        nameKn: item.inclusions.letterTitleKn,
        descEn: 'Deckle-edge illustrated story letter on 120gsm cotton felt paper.',
        descKn: '೧೨೦ ಜಿಎಸ್‌ಎಂ ಹತ್ತಿ ಕಾಗದದ ಮೇಲೆ ನೈಸರ್ಗಿಕ ಅಂಚುಗಳೊಂದಿಗೆ ಮುದ್ರಿಸಿದ ಪತ್ರ.',
        itemType: 'story_letter',
      },
      {
        id: 'inc-cards',
        nameEn: item.inclusions.artCardsTitleEn,
        nameKn: item.inclusions.artCardsTitleKn,
        descEn: 'Two 300gsm archival heavyweight collectible miniature prints.',
        descKn: 'ಎರಡು ೩೦೦ ಜಿಎಸ್‌ಎಂ ಮ್ಯೂಸಿಯಂ ಕಲಾಕಾರ್ಡ್‌ಗಳು.',
        itemType: 'art_card',
      },
      {
        id: 'inc-stickers',
        nameEn: item.inclusions.stickersTitleEn,
        nameKn: item.inclusions.stickersTitleKn,
        descEn: 'Matte water-resistant botanical & architectural die-cut stickers.',
        descKn: 'ಕಲಾತ್ಮಕ ಸ್ಟಿಕ್ಕರ್‌ಗಳ ಹಾಳೆ.',
        itemType: 'sticker_sheet',
      },
      {
        id: 'inc-bookmark',
        nameEn: item.inclusions.bookmarkTitleEn,
        nameKn: item.inclusions.bookmarkTitleKn,
        descEn: 'Letterpress handcrafted bookmark with Kannada poetry.',
        descKn: 'ಹಸ್ತನಿರ್ಮಿತ ಕಾವ್ಯದ ಪುಸ್ತಕ ಗುರುತು.',
        itemType: 'bookmark',
      },
      {
        id: 'inc-puzzle',
        nameEn: item.inclusions.puzzleTitleEn,
        nameKn: item.inclusions.puzzleTitleKn,
        descEn: 'Pocket 24-piece linen-textured jigsaw puzzle.',
        descKn: '೨೪ ತುಣುಕುಗಳ ಪಾಕೆಟ್ ಜಿಗ್ಸಾ ಪಜಲ್.',
        itemType: 'puzzle',
      },
      {
        id: 'inc-colouring',
        nameEn: item.inclusions.colouringTitleEn,
        nameKn: item.inclusions.colouringTitleKn,
        descEn: 'Two 200gsm heavy bleed-proof architectural drawing sheets.',
        descKn: 'ಬಣ್ಣ ತುಂಬುವ ರೇಖಾಚಿತ್ರ ಹಾಳೆಗಳು.',
        itemType: 'colouring_sheet',
      },
    ],
    availableLanguages: item.languageAvailability,
    price: item.priceInr,
    recurringPrice: 499,
    stock: item.status === 'archived' ? 0 : 250,
    startDate,
    endDate,
    dispatchDate,
    status: statusMap[item.status],
  };
}

/**
 * Returns all mapped seed records ready for insertion into MongoDB Edition collection.
 */
export function getSeedEditions(): Partial<IEdition>[] {
  return monthlyCollectionsData.map(mapCollectionItemToEditionDocument);
}

