export type Locale = 'en' | 'kn';

export interface SiteDictionary {
  announcement: {
    text: string;
    action: string;
    badge: string;
  };
  brand: {
    name: string;
    kannadaName: string;
    tagline: string;
    subTagline: string;
  };
  nav: {
    home: string;
    story: string;
    collections: string;
    whatsInside: string;
    howItWorks: string;
    subscription: string;
    faq: string;
    subscribeCta: string;
  };
  hero: {
    eyebrow: string;
    titleEn: string;
    titleKn: string;
    description: string;
    exploreCta: string;
    storyCta: string;
    stationeryBadge: string;
    editionStamp: string;
    waxSealLabel: string;
    letterLabel: string;
    artCardLabel: string;
    envelopeNote: string;
  };
  story: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    quote: string;
    quoteAuthor: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
  };
  collections: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
    filterAll: string;
    filterAvailable: string;
    filterArchive: string;
    viewCollection: string;
    languageBadge: string;
    priceLabel: string;
    statusAvailable: string;
    statusReserve: string;
    statusArchived: string;
  };
  whatsInside: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
    badge: string;
    items: {
      storyLetter: { title: string; subtitle: string; desc: string };
      artCards: { title: string; subtitle: string; desc: string };
      stickers: { title: string; subtitle: string; desc: string };
      bookmark: { title: string; subtitle: string; desc: string };
      puzzle: { title: string; subtitle: string; desc: string };
      colouringSheets: { title: string; subtitle: string; desc: string };
    };
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
    step1Number: string;
    step1Title: string;
    step1Desc: string;
    step2Number: string;
    step2Title: string;
    step2Desc: string;
    step3Number: string;
    step3Title: string;
    step3Desc: string;
  };
  subscription: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
    startingFrom: string;
    perMonth: string;
    toggleOneTime: string;
    toggleRecurring: string;
    recurringSavings: string;
    reserveButton: string;
    inquiryButton: string;
    noCommitmentNote: string;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
    placeholderNote: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    kannadaTitle: string;
    description: string;
  };
  footer: {
    description: string;
    navigationTitle: string;
    collectionsTitle: string;
    postalDeskTitle: string;
    postalDeskAddress: string;
    contactEmail: string;
    instagramHandle: string;
    rightsReserved: string;
    craftedWithLove: string;
    privacyNote: string;
  };
  common: {
    switchLanguage: string;
    learnMore: string;
    comingSoon: string;
    limitedStock: string;
    bilingual: string;
  };
}
