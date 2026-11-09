export interface WhatsInsideItem {
  id: string;
  icon: string;
  titleEn: string;
  titleKn: string;
  subtitleEn: string;
  subtitleKn: string;
  descriptionEn: string;
  descriptionKn: string;
  paperSpecEn: string;
  paperSpecKn: string;
  tag: string;
  accent: 'terracotta' | 'sage' | 'rose';
}

export const whatsInsideItems: WhatsInsideItem[] = [
  {
    id: 'story-letter',
    icon: 'MailOpen',
    titleEn: 'Illustrated Story Letter',
    titleKn: 'ಚಿತ್ರ ಸಹಿತ ಕಥನ ಪತ್ರ',
    subtitleEn: 'The Heart of Every Parcel',
    subtitleKn: 'ಪ್ರತಿ ಪೆಟ್ಟಿಗೆಯ ಮುಖ್ಯ ಕಥನ',
    descriptionEn:
      'A personal, narrative letter weaving classic folklore and contemporary vignettes, available in Kannada, English, or companion bilingual edition.',
    descriptionKn:
      'ಪ್ರಾಚೀನ ಜಾನಪದ ಹಾಗೂ ನವ್ಯ ಸಾಹಿತ್ಯದ ಸಂಯೋಜನೆಯ ವೈಯಕ್ತಿಕ ಪತ್ರ; ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಎರಡರಲ್ಲೂ ಲಭ್ಯ.',
    paperSpecEn: '120gsm Textured Cotton Felt Paper · Deckle Edges',
    paperSpecKn: '೧೨೦ ಜಿಎಸ್‌ಎಂ ಹತ್ತಿ ಕಾಗದ · ನೈಸರ್ಗಿಕ ಅಂಚುಗಳು',
    tag: 'Core Piece',
    accent: 'terracotta',
  },
  {
    id: 'art-cards',
    icon: 'Image',
    titleEn: 'Archival Art Cards',
    titleKn: 'ಸಂಗ್ರಹಯೋಗ್ಯ ಕಲಾ ಕಾರ್ಡ್‌ಗಳು',
    subtitleEn: 'Two Collectible Miniature Prints',
    subtitleKn: 'ಎರಡು ಸೀಮಿತ ಮುದ್ರಣದ ಕಲಾಚಿತ್ರಗಳು',
    descriptionEn:
      'Commissioned miniature paintings and woodcut reproductions from traditional and emerging regional artists, ready to frame or send.',
    descriptionKn:
      'ಸ್ಥಳೀಯ ಕಲಾವಿದರ ಮೂಲ ಕಲಾಕೃತಿಗಳ ಸೀಮಿತ ಮುದ್ರಣಗಳು; ಫ್ರೇಮ್ ಮಾಡಿಸಲು ಅಥವಾ ಪ್ರೀತಿಪಾತ್ರರಿಗೆ ಕಳುಹಿಸಲು ಸೂಕ್ತ.',
    paperSpecEn: '300gsm Heavyweight Archival Matt Cardstock',
    paperSpecKn: '೩೦೦ ಜಿಎಸ್‌ಎಂ ಮ್ಯೂಸಿಯಂ ಗುಣಮಟ್ಟದ ದಪ್ಪ ಕಾರ್ಡ್',
    tag: 'Frameable',
    accent: 'sage',
  },
  {
    id: 'stickers',
    icon: 'Sparkles',
    titleEn: 'Artisanal Sticker Sheet',
    titleKn: 'ಚಿತ್ರ ಕಲಾತ್ಮಕ ಸ್ಟಿಕ್ಕರ್ ಶೀಟ್',
    subtitleEn: 'Thematic Flora, Fauna & Motifs',
    subtitleKn: 'ಪ್ರಕೃತಿ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಮುದ್ದಾದ ವಿನ್ಯಾಸಗಳು',
    descriptionEn:
      'Matte die-cut botanical, architectural, and literary stickers to adorn your journals, letters, reading journals, and sketchbooks.',
    descriptionKn:
      'ನಿಮ್ಮ ದಿನಚರಿ, ಪುಸ್ತಕಗಳು ಮತ್ತು ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳನ್ನು ಅಲಂಕರಿಸಲು ಮೃದುವಾದ ಮ್ಯಾಟ್ ಮುಕ್ತಾಯದ ಸ್ಟಿಕ್ಕರ್‌ಗಳು.',
    paperSpecEn: 'Water-resistant Premium Washi/Vinyl Matte Finish',
    paperSpecKn: 'ನೀರು-ನಿರೋಧಕ ಪ್ರೀಮಿಯಂ ಮ್ಯಾಟ್ ಫಿನಿಶ್',
    tag: 'Keepsake',
    accent: 'rose',
  },
  {
    id: 'bookmark',
    icon: 'Bookmark',
    titleEn: 'Handcrafted Bookmark',
    titleKn: 'ಹಸ್ತನಿರ್ಮಿತ ಪುಸ್ತಕ ಗುರುತು',
    subtitleEn: 'Tactile Literary Companion',
    subtitleKn: 'ಓದಿಗೆ ಜೊತೆಯಾಗುವ ಸುಂದರ ಗೆಳೆಯ',
    descriptionEn:
      'Letterpress printed or engraved bookmark with a poetic Kannada vachana / quote, finished with natural jute cord or silk tassel.',
    descriptionKn:
      'ಕಾವ್ಯದ ಸಾಲುಗಳ ಮುದ್ರೆಯುಳ್ಳ, ನೈಸರ್ಗಿಕ ನೂಲಿನ ಗೊಂಡೆಯೊಂದಿಗೆ ರೂಪಿಸಿದ ವಿಶಿಷ್ಟ ಪುಸ್ತಕ ಗುರುತು.',
    paperSpecEn: 'Letterpress Heavy Board / Sustainable Wood Veneer',
    paperSpecKn: 'ಲೆಟರ್‌ಪ್ರೆಸ್ ಮುದ್ರಿತ ದಪ್ಪ ಬೋರ್ಡ್ / ನೈಸರ್ಗಿಕ ಮರ',
    tag: 'Companion',
    accent: 'terracotta',
  },
  {
    id: 'puzzle',
    icon: 'Puzzle',
    titleEn: 'Mini Creative Puzzle',
    titleKn: 'ಚಿಕ್ಕ ಸೃಜನಶೀಲ ಪಜಲ್',
    subtitleEn: 'Slow Mindful Leisure',
    subtitleKn: 'ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ನೀಡುವ ಪುಟ್ಟ ಆಟ',
    descriptionEn:
      'A delightful 24-piece pocket jigsaw puzzle recreating one of the month’s story scenes, designed for a quiet afternoon cup of tea.',
    descriptionKn:
      'ತಿಂಗಳ ಕತೆಯ ಒಂದು ರಮಣೀಯ ದೃಶ್ಯವನ್ನು ಜೋಡಿಸುವ ೨೪ ತುಣುಕುಗಳ ಪಾಕೆಟ್ ಜಿಗ್ಸಾ ಪಜಲ್.',
    paperSpecEn: 'Durable 2mm Recycled Greyboard · Linen Texture',
    paperSpecKn: '೨ ಮಿಮೀ ಮರುಬಳಕೆಯ ಗಟ್ಟಿ ಬೋರ್ಡ್ · ಲಿನಿನ್ ಸ್ಪರ್ಶ',
    tag: 'Mindful',
    accent: 'sage',
  },
  {
    id: 'colouring-sheets',
    icon: 'Palette',
    titleEn: 'Mindful Colouring Sheets',
    titleKn: 'ಬಣ್ಣ ತುಂಬುವ ರೇಖಾಚಿತ್ರ ಹಾಳೆಗಳು',
    subtitleEn: 'Unwind with Pigments & Line Art',
    subtitleKn: 'ಬಣ್ಣಗಳೊಂದಿಗೆ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ',
    descriptionEn:
      'Intricate linework drawings derived from heritage architecture, Karnataka temples, and native flora for watercolour or pencil colouring.',
    descriptionKn:
      'ಕರ್ನಾಟಕದ ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ಅಪರೂಪದ ಗಿಡಮರಗಳ ಆಕರ್ಷಕ ರೇಖಾಚಿತ್ರಗಳು; ಜಲವರ್ಣ ಅಥವಾ ಪೆನ್ಸಿಲ್ ಬಣ್ಣ ತುಂಬಲು ಸೂಕ್ತ.',
    paperSpecEn: '200gsm Heavy Bleed-proof Drawing Paper',
    paperSpecKn: '೨೦೦ ಜಿಎಸ್‌ಎಂ ಬಣ್ಣ ಹರಡದ ಡ್ರಾಯಿಂಗ್ ಕಾಗದ',
    tag: 'Interactive',
    accent: 'rose',
  },
];

