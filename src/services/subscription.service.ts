import { SubscriptionTier } from '@/types/subscription';

/**
 * Subscription Service definition.
 * Encapsulates plan pricing, feature tiers, and subscription domain logic.
 * Ready for future backend / MongoDB / Razorpay integration.
 */
export const subscriptionService = {
  /**
   * Retrieves all available subscription tiers.
   */
  async getPlans(): Promise<SubscriptionTier[]> {
    return [
      {
        id: 'tier_monthly',
        slug: 'monthly-explorer',
        titleEn: 'Monthly Explorer',
        titleKn: 'ಮಾಸಿಕ ಪರಿಶೋಧಕ',
        subtitleEn: 'Curated monthly box with museum print & chapbook',
        subtitleKn: 'ಪ್ರತಿ ತಿಂಗಳ ಕಲಾಮುದ್ರಣ ಮತ್ತು ಸಾಹಿತ್ಯ ಪುಸ್ತಿಕೆ',
        priceInr: 1499,
        cadence: 'monthly',
        features: [
          { id: 'f1', textEn: '1 Curated Archival Art Print (A4)', textKn: 'ಆಯ್ದ ಸಂಗ್ರಹಯೋಗ್ಯ ಕಲಾ ಮುದ್ರಣ (A4)' },
          { id: 'f2', textEn: 'Bilingual Literary Keepsake Chapbook', textKn: 'ದ್ವಿಭಾಷಾ ಸಾಹಿತ್ಯಿಕ ಕಿರುಹೊತ್ತಿಗೆ' },
          { id: 'f3', textEn: 'Collector certificate with edition number', textKn: 'ಆವೃತ್ತಿ ಸಂಖ್ಯೆಯುಳ್ಳ ದೃಢೀಕರಣ ಪತ್ರ' },
          { id: 'f4', textEn: 'Doorstep shipping across India', textKn: 'ಭಾರತದಾದ್ಯಂತ ಉಚಿತ ಮನೆಬಾಗಿಲಿಗೆ ರವಾನೆ' },
        ],
      },
      {
        id: 'tier_quarterly',
        slug: 'quarterly-patron',
        titleEn: 'Quarterly Patron',
        titleKn: 'ತ್ರೈಮಾಸಿಕ ಪೋಷಕ',
        subtitleEn: 'Seasonal voyage with artisanal mementos',
        subtitleKn: 'ಕಲಾತ್ಮಕ ಸ್ಮರಣಿಕೆಗಳೊಂದಿಗೆ ತ್ರೈಮಾಸಿಕ ಪಯಣ',
        priceInr: 3999,
        cadence: 'quarterly',
        badgeEn: 'Most Cherished',
        badgeKn: 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ',
        isPopular: true,
        features: [
          { id: 'f1', textEn: 'All Monthly Explorer inclusions', textKn: 'ಮಾಸಿಕ ಯೋಜನೆಯ ಎಲ್ಲಾ ಅಂಶಗಳು' },
          { id: 'f2', textEn: 'Handcrafted brass bookmark or artisanal artifact', textKn: 'ಹಸ್ತನಿರ್ಮಿತ ಹಿತ್ತಾಳೆಯ ಪುಸ್ತಕ ಗುರುತು ಅಥವಾ ಕಲಾ ಸ್ಮರಣಿಕೆ' },
          { id: 'f3', textEn: 'Curator commentary audio access', textKn: 'ವಿಶೇಷ ಧ್ವನಿ ವಿವರಣೆಯ ಸೌಲಭ್ಯ' },
          { id: 'f4', textEn: 'Priority dispatch on full-moon release day', textKn: 'ಹುಣ್ಣಿಮೆಯ ದಿನವೇ ಆದ್ಯತೆಯ ಮೇರೆಗೆ ರವಾನೆ' },
        ],
      },
      {
        id: 'tier_annual',
        slug: 'annual-connoisseur',
        titleEn: 'Annual Connoisseur',
        titleKn: 'ವಾರ್ಷಿಕ ಅಭಿಜ್ಞ',
        subtitleEn: 'Complete 12-edition collection with teak archive box',
        subtitleKn: 'ಸಾಗವಾನಿ ಮರದ ಪೆಟ್ಟಿಗೆಯೊಂದಿಗೆ ೧೨ ಸಂಪುಟಗಳು',
        priceInr: 14999,
        cadence: 'annual',
        features: [
          { id: 'f1', textEn: '12 Monthly Collector editions', textKn: '೧೨ ತಿಂಗಳ ಪೂರ್ಣ ಸಂಪುಟಗಳು' },
          { id: 'f2', textEn: 'Custom engraved solid teak wood archive box', textKn: 'ಕೆತ್ತನೆ ಮಾಡಿದ ಗಟ್ಟಿ ಸಾಗವಾನಿ ಮರದ ಪೆಟ್ಟಿಗೆ' },
          { id: 'f3', textEn: 'Signed artist prints & private salon access', textKn: 'ಕಲಾವಿದರ ಸಹಿಯುಳ್ಳ ಮುದ್ರಣಗಳು & ವಿಶೇಷ ಆಹ್ವಾನ' },
          { id: 'f4', textEn: 'Bespoke personalization on bookplates', textKn: 'ವೈಯಕ್ತಿಕ ಹೆಸರಿನ ಮುದ್ರೆಯೊಂದಿಗೆ' },
        ],
      },
    ];
  },
};

