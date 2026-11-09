export interface CollectionItem {
  id: string;
  slug: string;
  month: string;
  monthKn: string;
  year: number;
  nameEn: string;
  nameKn: string;
  descriptionEn: string;
  descriptionKn: string;
  priceInr: number;
  languageAvailability: ('kannada' | 'english' | 'bilingual')[];
  status: 'available' | 'reserve' | 'archived';
  accentColor: string;
  itemsCount: number;
  seasonEn: string;
  seasonKn: string;
  curatorEn: string;
  curatorKn: string;
  storyExcerptEn: string;
  storyExcerptKn: string;
  artistBioEn: string;
  artistBioKn: string;
  inclusions: {
    letterTitleEn: string;
    letterTitleKn: string;
    artCardsTitleEn: string;
    artCardsTitleKn: string;
    stickersTitleEn: string;
    stickersTitleKn: string;
    bookmarkTitleEn: string;
    bookmarkTitleKn: string;
    puzzleTitleEn: string;
    puzzleTitleKn: string;
    colouringTitleEn: string;
    colouringTitleKn: string;
  };
}

/**
 * Mock data representing monthly stationery & story-letter collections.
 * Structured to be seamlessly substituted with a MongoDB / Mongoose collection or API response.
 */
export const monthlyCollectionsData: CollectionItem[] = [
  {
    id: 'col-2026-11',
    slug: 'whispering-sahyadri',
    month: 'November',
    monthKn: 'ನವೆಂಬರ್',
    year: 2026,
    nameEn: 'The Whispering Sahyadri',
    nameKn: 'ಮೌನ ಸಹ್ಯಾದ್ರಿ',
    descriptionEn:
      'A rain-scented story letter of ancient Western Ghats folklore, accompanied by moss-green botanical art cards and tactile fern-embossed stickers.',
    descriptionKn:
      'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಮಳೆಗಾಲದ ಜನಪದ ಕಥನ ಪತ್ರ, ಜಲವರ್ಣದ ಸಸ್ಯ ಕಲಾಕಾರ್ಡ್‌ಗಳು ಮತ್ತು ಜರೀಗಿಡದ ವಿನ್ಯಾಸವುಳ್ಳ ಸುಂದರ ಸ್ಟಿಕ್ಕರ್‌ಗಳು.',
    priceInr: 499,
    languageAvailability: ['kannada', 'english', 'bilingual'],
    status: 'available',
    accentColor: '#5E7160', // Sage
    itemsCount: 6,
    seasonEn: 'Karthika Masa',
    seasonKn: 'ಕಾರ್ತಿಕ ಮಾಸ',
    curatorEn: 'Malnad Heritage Circle & Dr. Shridhar Hegde',
    curatorKn: 'ಮಲೆನಾಡು ಪರಂಪರೆ ಬಳಗ & ಡಾ. ಶ್ರೀಧರ್ ಹೆಗಡೆ',
    storyExcerptEn:
      'When the Karthika dusk settles upon the ridges of Agumbe, the canopy begins an ancient conversation with the monsoon mist. In the sacred Devarakadu groves, the wild myristica swamps hold memories of centuries past...',
    storyExcerptKn:
      'ಆಗುಂಬೆಯ ಶಿಖರಗಳ ಮೇಲೆ ಕಾರ್ತಿಕದ ಮುಸ್ಸಂಜೆ ಇಳಿಯುತ್ತಿದ್ದಂತೆ, ಹಸಿರು ಕಾನನವು ಮಳೆಗಾಲದ ಮಂಜಿನೊಂದಿಗೆ ಪ್ರಾಚೀನ ಸಂವಾದ ಆರಂಭಿಸುತ್ತದೆ. ಪವಿತ್ರ ದೇವರಕಾಡುಗಳಲ್ಲಿ ಶತಮಾನಗಳ ನೆನಪುಗಳು ಹಸಿರಾಗಿ ನಳನಳಿಸುತ್ತವೆ...',
    artistBioEn: 'Botanical gouache illustrations by Revathi Shastri, Kumta',
    artistBioKn: 'ರೇವತಿ ಶಾಸ್ತ್ರಿ, ಕುಮಟಾ ಅವರ ಜಲವರ್ಣ ಸಸ್ಯಚಿತ್ರಗಳು',
    inclusions: {
      letterTitleEn: 'The Whispering Sahyadri Folklore Letter',
      letterTitleKn: 'ಮೌನ ಸಹ್ಯಾದ್ರಿ ಕಥನ ಪತ್ರ (ದ್ವಿಭಾಷಾ)',
      artCardsTitleEn: 'Western Ghats Flora: Myristica & Ferns (2 prints)',
      artCardsTitleKn: 'ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ಸಸ್ಯಲೋಕ: ಎರಡು ಕಲಾಕಾರ್ಡ್‌ಗಳು',
      stickersTitleEn: 'Malnad Rainforest Flora & Fauna Washi Sheet',
      stickersTitleKn: 'ಮಲೆನಾಡಿನ ಪ್ರಕೃತಿ ಕಲಾತ್ಮಕ ಸ್ಟಿಕ್ಕರ್ ಹಾಳೆ',
      bookmarkTitleEn: 'Hand-carved Rosewood Grain Bookmark',
      bookmarkTitleKn: 'ಗುಲಾಬಿ ಮರದ ವಿನ್ಯಾಸದ ಪುಸ್ತಕ ಗುರುತು',
      puzzleTitleEn: 'Agumbe Sunset Rainforest 24-piece Mini Jigsaw',
      puzzleTitleKn: 'ಆಗುಂಬೆ ಸೂರ್ಯಾಸ್ತದ ಪಾಕೆಟ್ ಜಿಗ್ಸಾ ಪಜಲ್',
      colouringTitleEn: 'Sacred Grove Canopy Botanical Linework Sheets (2 sheets)',
      colouringTitleKn: 'ದೇವರಕಾನಿನ ರೇಖಾಚಿತ್ರ ಬಣ್ಣ ತುಂಬುವ ಹಾಳೆಗಳು',
    },
  },
  {
    id: 'col-2026-12',
    slug: 'constellations-of-kaveri',
    month: 'December',
    monthKn: 'ಡಿಸೆಂಬರ್',
    year: 2026,
    nameEn: 'Constellations of Kaveri',
    nameKn: 'ಕಾವೇರಿಯ ನಕ್ಷತ್ರಗಳು',
    descriptionEn:
      'A nocturnal river ballad on textured cream paper, river-pebble puzzle pieces, twilight gouache prints, and a brass boatman bookmark.',
    descriptionKn:
      'ನದಿಯ ತೀರದ ರಾತ್ರಿಯ ಕತೆ, ಜಲವರ್ಣ ನಕ್ಷತ್ರ ಚಿತ್ರಗಳು, ನದಿ ಕಲ್ಲಿನ ವಿನ್ಯಾಸದ ಪಜಲ್ ಮತ್ತು ಹಿತ್ತಾಳೆಯ ದೋಣಿಯ ಪುಸ್ತಕ ಗುರುತು.',
    priceInr: 499,
    languageAvailability: ['kannada', 'english', 'bilingual'],
    status: 'reserve',
    accentColor: '#C86446', // Terracotta
    itemsCount: 6,
    seasonEn: 'Margashirsha',
    seasonKn: 'ಮಾರ್ಗಶಿರ ಮಾಸ',
    curatorEn: 'River Valley Literary Salon, Talakaveri',
    curatorKn: 'ತಲಕಾವೇರಿ ನದಿ ಕಣಿವೆಯ ಸಾಹಿತ್ಯ ಬಳಗ',
    storyExcerptEn:
      'As the boatman dips his oar into the cool Kaveri current, ripples catch the silver light of Orion. The river is not merely water—it is an unbroken oral epic whispered through generations of coracle rowers...',
    storyExcerptKn:
      'ಅಂಬಿಗನು ಕಾವೇರಿಯ ತಣ್ಣನೆಯ ನೀರಿನಲ್ಲಿ ಹುಟ್ಟನ್ನು ಮುಳುಗಿಸುತ್ತಿದ್ದಂತೆ, ನೀರಿನ ತೆರೆಗಳ ಮೇಲೆ ನಕ್ಷತ್ರಗಳ ಬೆಳ್ಳಿ ಬೆಳಕು ಹೊಳೆಯುತ್ತದೆ. ಕಾವೇರಿಯೆಂದರೆ ಕೇವಲ ನದಿಯಲ್ಲ; ತಲೆಮಾರುಗಳ ನಾವಿಕರು ಪಿಸುಗುಟ್ಟಿದ ಜೀವಂತ ಕಾವ್ಯ...',
    artistBioEn: 'Nocturnal riverine gouache series by Praveen Bhat, Srirangapatna',
    artistBioKn: 'ಪ್ರವೀಣ್ ಭಟ್, ಶ್ರೀರಂಗಪಟ್ಟಣ ಅವರ ಜಲವರ್ಣ ರಾತ್ರಿಚಿತ್ರಗಳು',
    inclusions: {
      letterTitleEn: 'Ballad of the Night River Letter',
      letterTitleKn: 'ರಾತ್ರಿ ನದಿಯ ಕಥನ ಪತ್ರ (ದ್ವಿಭಾಷಾ)',
      artCardsTitleEn: 'Twilight Coracles & Starlight Kaveri (2 prints)',
      artCardsTitleKn: 'ಕಾವೇರಿ ನದಿಯ ನಕ್ಷತ್ರ ಚಿತ್ರಗಳು (ಎರಡು ಕಾರ್ಡ್)',
      stickersTitleEn: 'Celestial River Constellations Sticker Sheet',
      stickersTitleKn: 'ನಕ್ಷತ್ರ ಪುಂಜ ಮತ್ತು ನದಿಯ ಸ್ಟಿಕ್ಕರ್ ಶೀಟ್',
      bookmarkTitleEn: 'Brass Coracle Page-mark with Silk Cord',
      bookmarkTitleKn: 'ಹಿತ್ತಾಳೆಯ ಪುಟ್ಟ ದೋಣಿ ಪುಸ್ತಕ ಗುರುತು',
      puzzleTitleEn: 'Kaveri Moonlit Ghats 24-piece Pocket Puzzle',
      puzzleTitleKn: 'ಕಾವೇರಿ ಘಟ್ಟದ ರಾತ್ರಿ ಪಜಲ್',
      colouringTitleEn: 'Heritage Temple Ghats Linework Sheets (2 sheets)',
      colouringTitleKn: 'ನದಿ ತೀರದ ದೇವಸ್ಥಾನಗಳ ರೇಖಾಚಿತ್ರ ಹಾಳೆಗಳು',
    },
  },
  {
    id: 'col-2026-10',
    slug: 'echoes-of-hampi',
    month: 'October',
    monthKn: 'ಅಕ್ಟೋಬರ್',
    year: 2026,
    nameEn: 'Echoes of Hampi',
    nameKn: 'ಹಂಪಿಯ ನೆನಪುಗಳು',
    descriptionEn:
      'Warm sandstone lithographs, a historical letter narrating stone chariot whispers, architectural colouring sheets, and temple pillar bookmark.',
    descriptionKn:
      'ಕೆಂಪು ಕಲ್ಲಿನ ಶಿಲ್ಪಕಲೆಯ ಕಲಾಕಾರ್ಡ್‌ಗಳು, ಕಲ್ಲಿನ ರಥದ ಕಥನ ಪತ್ರ ಮತ್ತು ದೇವಸ್ಥಾನದ ವಾಸ್ತುಶಿಲ್ಪದ ಬಣ್ಣ ತುಂಬುವ ಚಿತ್ರಗಳು.',
    priceInr: 549,
    languageAvailability: ['kannada', 'english', 'bilingual'],
    status: 'archived',
    accentColor: '#B87D7B', // Dusty Rose
    itemsCount: 6,
    seasonEn: 'Ashwayuja',
    seasonKn: 'ಆಶ್ವಯುಜ ಮಾಸ',
    curatorEn: 'Vijayanagara Heritage Trust & Ananth Kumar',
    curatorKn: 'ವಿಜಯನಗರ ಪರಂಪರೆ ಟ್ರಸ್ಟ್ & ಅನಂತ್ ಕುಮಾರ್',
    storyExcerptEn:
      'The morning wind rustles through the granite pillars of the Vittala temple, humming a tune carved five centuries ago. Each monolithic boulder on Matanga Hill has watched empires flourish and dissolve...',
    storyExcerptKn:
      'ವಿಠ್ಠಲ ದೇಗುಲದ ಕಂಬಗಳ ನಡುವೆ ಮುಂಜಾನೆಯ ತಂಗಾಳಿ ಬೀಸುತ್ತಿದ್ದಂತೆ, ಐನೂರು ವರ್ಷಗಳ ಹಿಂದಿನ ಶಿಲೆಯ ನಾದ ಪ್ರತಿಧ್ವನಿಸುತ್ತದೆ. ಮತಂಗ ಪರ್ವತದ ಬಂಡೆಗಳು ಸಾಮ್ರಾಜ್ಯಗಳ ಉದಯ ಮತ್ತು ಅಸ್ತಮವನ್ನು ಮೂಕಸಾಕ್ಷಿಯಾಗಿ ಕಂಡಿವೆ...',
    artistBioEn: 'Terracotta monotypes by Shilpa Gowda, Bellary',
    artistBioKn: 'ಶಿಲ್ಪಾ ಗೌಡ, ಬಳ್ಳಾರಿ ಅವರ ಕೆಂಪು ಶಿಲ್ಪಚಿತ್ರಗಳು',
    inclusions: {
      letterTitleEn: 'Whispers of Stone Chariot Letter',
      letterTitleKn: 'ಕಲ್ಲಿನ ರಥದ ಪಿಸುಮಾತು ಕಥನ ಪತ್ರ',
      artCardsTitleEn: 'Tungabhadra Granite & Vittala Pillars (2 prints)',
      artCardsTitleKn: 'ತುಂಗಭದ್ರಾ ತೀರ ಮತ್ತು ಶಿಲ್ಪಕಲೆ (೨ ಕಾರ್ಡ್)',
      stickersTitleEn: 'Hampi Sculptural Motifs & Inscriptions Sheet',
      stickersTitleKn: 'ಹಂಪಿಯ ಶಿಲ್ಪ ಹಾಗೂ ಶಾಸನಗಳ ಸ್ಟಿಕ್ಕರ್ ಹಾಳೆ',
      bookmarkTitleEn: 'Musical Pillar Letterpress Bookmark',
      bookmarkTitleKn: 'ಸಂಗೀತ ಕಂಬದ ವಿನ್ಯಾಸವುಳ್ಳ ಬುಕ್‌ಮಾರ್ಕ್',
      puzzleTitleEn: 'Stone Chariot at Dusk 24-piece Puzzle',
      puzzleTitleKn: 'ಕಲ್ಲಿನ ರಥದ ಪಾಕೆಟ್ ಜಿಗ್ಸಾ ಪಜಲ್',
      colouringTitleEn: 'Lotus Mahal & Stepped Tank Linework Sheets (2 sheets)',
      colouringTitleKn: 'ಕಮಲ ಮಹಲ್ ವಾಸ್ತುಶಿಲ್ಪದ ಡ್ರಾಯಿಂಗ್ ಹಾಳೆಗಳು',
    },
  },
  {
    id: 'col-2026-09',
    slug: 'blossoms-of-lalbagh',
    month: 'September',
    monthKn: 'ಸೆಪ್ಟೆಂಬರ್',
    year: 2026,
    nameEn: 'Blossoms of the Old Garden',
    nameKn: 'ಹಳೆಯ ತೋಟದ ಹೂವುಗಳು',
    descriptionEn:
      'A nostalgic tribute to Bangalore heritage gardens: hand-pressed flower stickers, botanical letterpress cards, and vintage glasshouse sketches.',
    descriptionKn:
      'ಬೆಂಗಳೂರಿನ ಹಳೆಯ ಉದ್ಯಾನದ ನೆನಪುಗಳು: ಕೈಯಿಂದ ಮುದ್ರಿಸಿದ ಹೂವಿನ ಸ್ಟಿಕ್ಕರ್‌ಗಳು, ಗಾಜಿನ ಮನೆಯ ರೇಖಾಚಿತ್ರಗಳು ಮತ್ತು ಕಥನ ಪತ್ರ.',
    priceInr: 549,
    languageAvailability: ['kannada', 'english', 'bilingual'],
    status: 'archived',
    accentColor: '#5E7160', // Sage
    itemsCount: 6,
    seasonEn: 'Bhadrapada',
    seasonKn: 'ಭಾದ್ರಪದ ಮಾಸ',
    curatorEn: 'Old Bangalore Chroniclers Guild',
    curatorKn: 'ಹಳೆಯ ಬೆಂಗಳೂರಿನ ಇತಿಹಾಸ ಪ್ರೇಮಿಗಳ ಬಳಗ',
    storyExcerptEn:
      'Under the century-old Araucaria pines of Lalbagh, the Bengaluru rain smells of damp red earth and eucalyptus. Old botanists walked these gravel paths, cataloging trees gifted from distant shores...',
    storyExcerptKn:
      'ಲಾಲ್‌ಬಾಗಿನ ಶತಮಾನದಷ್ಟು ಹಳೆಯ ಪೈನ್ ಮರಗಳ ಕೆಳಗೆ, ಬೆಂಗಳೂರಿನ ಮಳೆಯು ಕೆಂಪು ಮಣ್ಣಿನ ಮತ್ತು ನೀಲಗಿರಿಯ ಸುವಾಸನೆಯನ್ನು ಹರಡುತ್ತದೆ. ಹಳೆಯ ಸಸ್ಯಶಾಸ್ತ್ರಜ್ಞರು ಈ ಹಾದಿಗಳಲ್ಲಿ ಹೆಜ್ಜೆ ಹಾಕುತ್ತಾ ಗಿಡಮರಗಳ ಕತೆಗಳನ್ನು ಬರೆದಿದ್ದರು...',
    artistBioEn: 'Vintage botanical watercolours by Meera Nayak, Malleswaram',
    artistBioKn: 'ಮೀರಾ ನಾಯಕ್, ಮಲ್ಲೇಶ್ವರಂ ಅವರ ಸಸ್ಯ ಜಲವರ್ಣ ಚಿತ್ರಗಳು',
    inclusions: {
      letterTitleEn: 'The Garden Botanist’s Diary Letter',
      letterTitleKn: 'ತೋಟದ ಸಸ್ಯಶಾಸ್ತ್ರಜ್ಞನ ದಿನಚರಿ ಪತ್ರ',
      artCardsTitleEn: 'Victorian Glasshouse & Jacaranda Canopies (2 prints)',
      artCardsTitleKn: 'ಗಾಜಿನ ಮನೆ ಮತ್ತು ನೀಲಿ ಹೂವಿನ ಮರಗಳು (೨ ಕಾರ್ಡ್)',
      stickersTitleEn: 'Pressed Heritage Blossoms Sticker Sheet',
      stickersTitleKn: 'ಒಣಗಿಸಿದ ಹೂವುಗಳ ಕಲಾತ್ಮಕ ಸ್ಟಿಕ್ಕರ್ ಹಾಳೆ',
      bookmarkTitleEn: 'Deckle-edge Pressed Botanical Bookmark',
      bookmarkTitleKn: 'ನೈಸರ್ಗಿಕ ಹೂವಿನ ಸ್ಪರ್ಶವುಳ್ಳ ಪುಸ್ತಕ ಗುರುತು',
      puzzleTitleEn: 'Lalbagh Lake at Morning Mist 24-piece Puzzle',
      puzzleTitleKn: 'ಮುಂಜಾನೆಯ ಲಾಲ್‌ಬಾಗ್ ಕೆರೆಯ ಪಜಲ್',
      colouringTitleEn: 'Historic Glasshouse & Heritage Bandstand Sheets (2 sheets)',
      colouringTitleKn: 'ಐತಿಹಾಸಿಕ ಗಾಜಿನ ಮನೆಯ ರೇಖಾಚಿತ್ರ ಹಾಳೆಗಳು',
    },
  },
];
