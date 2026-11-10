export interface SubscriptionOption {
  id: string;
  type: 'recurring' | 'one_time';
  nameEn: string;
  nameKn: string;
  cadenceEn: string;
  cadenceKn: string;
  priceInr: number;
  originalPriceInr?: number;
  /** Length of one billing cycle for recurring plans (1 = monthly, 3 = quarterly). */
  billingPeriodMonths?: number;
  savingsBadgeEn?: string;
  savingsBadgeKn?: string;
  badgeEn?: string;
  badgeKn?: string;
  isPopular?: boolean;
  summaryEn: string;
  summaryKn: string;
  featuresEn: string[];
  featuresKn: string[];
}

export const subscriptionOptionsData: SubscriptionOption[] = [
  {
    id: 'monthly-recurring',
    type: 'recurring',
    nameEn: 'Monthly Letterbox',
    nameKn: 'ಮಾಸಿಕ ಕಥಾ ಪೆಟ್ಟಿಗೆ',
    cadenceEn: 'Billed monthly · Cancel anytime',
    cadenceKn: 'ಪ್ರತಿ ತಿಂಗಳ ಪಾವತಿ · ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಲ್ಲಿಸಿ',
    priceInr: 499,
    originalPriceInr: 599,
    billingPeriodMonths: 1,
    savingsBadgeEn: 'Save ₹100/box',
    savingsBadgeKn: '₹೧೦೦ ಉಳಿತಾಯ',
    badgeEn: 'Most Loved',
    badgeKn: 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ',
    isPopular: true,
    summaryEn: 'Continuous slow literary surprise arriving on the 1st of every month.',
    summaryKn: 'ಪ್ರತಿ ತಿಂಗಳ ೧ನೇ ತಾರೀಖಿಗೆ ಮನೆಬಾಗಿಲಿಗೆ ತಲುಪುವ ಸೃಜನಶೀಲ ಸಂತಸ.',
    featuresEn: [
      'Illustrated bilingual story letter on 120gsm cotton paper',
      '2 Collectible archival art cards (300gsm)',
      '1 Thematic artisanal sticker sheet',
      '1 Handcrafted literary bookmark',
      '1 Pocket 24-piece art puzzle',
      '2 Heritage architectural colouring sheets',
      'Doorstep shipping across India included',
    ],
    featuresKn: [
      '೧೨೦ ಜಿಎಸ್‌ಎಂ ಹತ್ತಿ ಕಾಗದದ ಮೇಲೆ ದ್ವಿಭಾಷಾ ಕಥನ ಪತ್ರ',
      '೨ ಸಂಗ್ರಹಯೋಗ್ಯ ಕಲಾ ಕಾರ್ಡ್‌ಗಳು (೩೦೦ ಜಿಎಸ್‌ಎಂ)',
      '೧ ಕಲಾತ್ಮಕ ಸ್ಟಿಕ್ಕರ್ ಶೀಟ್',
      '೧ ಹಸ್ತನಿರ್ಮಿತ ಪುಸ್ತಕ ಗುರುತು',
      '೧ ಪಾಕೆಟ್ ಕಲಾ ಪಜಲ್',
      '೨ ಸಾಂಸ್ಕೃತಿಕ ಬಣ್ಣ ತುಂಬುವ ಚಿತ್ರ ಹಾಳೆಗಳು',
      'ಭಾರತದಾದ್ಯಂತ ಉಚಿತ ಮನೆಬಾಗಿಲಿಗೆ ರವಾನೆ',
    ],
  },
  {
    id: 'single-box',
    type: 'one_time',
    nameEn: 'Single Collector Box',
    nameKn: 'ಒಂದು ಬಾರಿಯ ಸಂಚಿಕೆ',
    cadenceEn: 'One-time purchase · No subscription',
    cadenceKn: 'ಏಕಕಾಲದ ಖರೀದಿ · ಚಂದಾದಾರಿಕೆ ಇಲ್ಲ',
    priceInr: 599,
    badgeEn: 'Perfect for Gifting',
    badgeKn: 'ಉಡುಗೊರೆಗೆ ಸೂಕ್ತ',
    isPopular: false,
    summaryEn: 'Experience a single monthly theme as a personal keepsake or a thoughtful gift.',
    summaryKn: 'ಒಂದು ತಿಂಗಳ ಕಲಾಪೆಟ್ಟಿಗೆಯನ್ನು ಸ್ವಂತಕ್ಕೆ ಅಥವಾ ಪ್ರೀತಿಪಾತ್ರರಿಗೆ ಉಡುಗೊರೆಯಾಗಿ ಪಡೆಯಿರಿ.',
    featuresEn: [
      'Complete current month creative parcel',
      'All 6 items: letter, cards, stickers, bookmark, puzzle & colouring',
      'Choice of Kannada, English, or Bilingual text',
      'Gift card with your personalized handwritten message',
      'Doorstep shipping across India included',
    ],
    featuresKn: [
      'ಪ್ರಸ್ತುತ ತಿಂಗಳ ಸಂಪೂರ್ಣ ಕಲಾಪೆಟ್ಟಿಗೆ',
      'ಎಲ್ಲಾ ೬ ಸಾಮಗ್ರಿಗಳು: ಪತ್ರ, ಕಾರ್ಡ್, ಸ್ಟಿಕ್ಕರ್, ಬುಕ್‌ಮಾರ್ಕ್, ಪಜಲ್ & ಡ್ರಾಯಿಂಗ್',
      'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಭಾಷೆಯ ಆಯ್ಕೆ',
      'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಂದೇಶವಿರುವ ಉಡುಗೊರೆ ಕಾರ್ಡ್',
      'ಭಾರತದಾದ್ಯಂತ ಉಚಿತ ಮನೆಬಾಗಿಲಿಗೆ ರವಾನೆ',
    ],
  },
  {
    id: 'seasonal-trio',
    type: 'recurring',
    nameEn: 'Quarterly Season Pass',
    nameKn: 'ತ್ರೈಮಾಸಿಕ ಋತು ಯೋಜನೆ',
    cadenceEn: 'Billed every 3 months (3 boxes)',
    cadenceKn: 'ಪ್ರತಿ ೩ ತಿಂಗಳಿಗೊಮ್ಮೆ (೩ ಪೆಟ್ಟಿಗೆಗಳು)',
    priceInr: 1399,
    originalPriceInr: 1797,
    billingPeriodMonths: 3,
    savingsBadgeEn: 'Save 22%',
    savingsBadgeKn: '೨೨% ಉಳಿತಾಯ',
    badgeEn: 'Seasonal Special',
    badgeKn: 'ಋತುಮಾನದ ವಿಶೇಷ',
    isPopular: false,
    summaryEn: 'Follow an entire literary season across three consecutive moon cycles.',
    summaryKn: 'ಮೂರು ತಿಂಗಳ ಋತುಚಕ್ರದ ಉದ್ದಕ್ಕೂ ಸಾಹಿತ್ಯ-ಕಲೆಯ ಪಯಣದಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳಿ.',
    featuresEn: [
      '3 Consecutive monthly creative boxes',
      'Curator seasonal letterpress gift print included',
      'Priority dispatch on the release week',
      'Flexible delivery address switching (for travel/gifting)',
      'Free pan-India courier tracking',
    ],
    featuresKn: [
      'ಸತತ ೩ ತಿಂಗಳ ಮಾಸಿಕ ಕಲಾಪೆಟ್ಟಿಗೆಗಳು',
      'ಸಂಪಾದಕರ ವಿಶೇಷ ಲೆಟರ್‌ಪ್ರೆಸ್ ಕಲಾ ಮುದ್ರಣ ಉಚಿತ',
      'ಬಿಡುಗಡೆಯ ವಾರದಲ್ಲೇ ಆದ್ಯತೆಯ ಮೇರೆಗೆ ರವಾನೆ',
      'ವಿಳಾಸವನ್ನು ಬದಲಾಯಿಸುವ ಅನುಕೂಲತೆ',
      'ಉಚಿತ ಕೊರಿಯರ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಸೌಲಭ್ಯ',
    ],
  },
];

