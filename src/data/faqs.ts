export interface FaqItem {
  id: string;
  questionEn: string;
  questionKn: string;
  answerEn: string;
  answerKn: string;
  category: 'subscription' | 'language' | 'shipping' | 'quality';
}

export const faqsData: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'language',
    questionEn: 'How does the bilingual Kannada and English format work?',
    questionKn: 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ದ್ವಿಭಾಷಾ ಸ್ವರೂಪ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
    answerEn:
      'Every Chitrakatha parcel celebrates linguistic harmony. You can choose whether your story letter arrives primarily in authentic literary Kannada, poetic English translation, or as a companion edition featuring both side-by-side. Our translations are crafted by literary scholars to preserve original colloquial metaphors.',
    answerKn:
      'ಚಿತ್ರಕಥಾದ ಪ್ರತಿ ಪೆಟ್ಟಿಗೆಯೂ ಭಾಷಾ ಸಾಮರಸ್ಯವನ್ನು ಸಂಭ್ರಮಿಸುತ್ತದೆ. ನಿಮ್ಮ ಕಥನ ಪತ್ರವು ಶುದ್ಧ ಸಾಹಿತ್ಯಿಕ ಕನ್ನಡದಲ್ಲಿರಬೇಕೆ, ಇಂಗ್ಲಿಷ್ ಅನುವಾದದಲ್ಲಿರಬೇಕೆ ಅಥವಾ ಎರಡೂ ಭಾಷೆಗಳು ಅಕ್ಕಪಕ್ಕದಲ್ಲಿರುವ ಜೋಡಿ ಆವೃತ್ತಿಯಲ್ಲಿರಬೇಕೆ ಎಂದು ನೀವೇ ಆಯ್ಕೆಮಾಡಬಹುದು.',
  },
  {
    id: 'faq-2',
    category: 'quality',
    questionEn: 'What materials and paper grades are used in the stationery?',
    questionKn: 'ಸ್ಟೇಷನರಿ ಮತ್ತು ಕಾಗದಕ್ಕಾಗಿ ಯಾವ ಗುಣಮಟ್ಟದ ಸಾಮಗ್ರಿಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ?',
    answerEn:
      'We use acid-free 120gsm to 300gsm wood-free and cotton rag felt paper sourced from eco-conscious mills in South India. Our art prints use archival fade-resistant mineral inks that retain their vibrant hues for decades. Even the packing materials are 100% plastic-free, recyclable paper and cardboard.',
    answerKn:
      'ನಾವು ದಕ್ಷಿಣ ಭಾರತದ ಪರಿಸರ ಸ್ನೇಹಿ ಗಿರಣಿಗಳಿಂದ ಪಡೆದ ೧೨೦ ರಿಂದ ೩೦೦ ಜಿಎಸ್‌ಎಂ ಹತ್ತಿ ಕಾಗದ ಮತ್ತು ಆಮ್ಲ-ಮುಕ್ತ ಬೋರ್ಡ್‌ಗಳನ್ನು ಬಳಸುತ್ತೇವೆ. ಕಲಾ ಮುದ್ರಣಗಳಿಗೆ ದೀರ್ಘಕಾಲ ಬಾಳಿಕೆ ಬರುವ ಮ್ಯೂಸಿಯಂ ಗುಣಮಟ್ಟದ ಖನಿಜ ಶಾಯಿಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ. ನಮ್ಮ ಪ್ಯಾಕಿಂಗ್ ಸಂಪೂರ್ಣ ಪ್ಲಾಸ್ಟಿಕ್-ರಹಿತವಾಗಿದೆ.',
  },
  {
    id: 'faq-3',
    category: 'subscription',
    questionEn: 'Can I purchase a single box without committing to a subscription?',
    questionKn: 'ಚಂದಾದಾರಿಕೆ ಇಲ್ಲದೆ ಕೇವಲ ಒಂದು ತಿಂಗಳ ಪೆಟ್ಟಿಗೆಯನ್ನು ಮಾತ್ರ ಖರೀದಿಸಬಹುದೇ?',
    answerEn:
      'Yes, absolutely! While our monthly subscribers enjoy a discounted rate (starting from ₹499/month), we offer Single Collector Boxes for ₹599. They are ideal for trying out the experience or gifting to a fellow stationery lover.',
    answerKn:
      'ಖಂಡಿತವಾಗಿಯೂ! ಮಾಸಿಕ ಚಂದಾದಾರರಿಗೆ ವಿಶೇಷ ದರ (ತಿಂಗಳಿಗೆ ₹೪೯೯ ರಿಂದ) ಲಭ್ಯವಿದ್ದರೂ, ನೀವು ₹೫೯೯ ಕ್ಕೆ ಒಂದು ತಿಂಗಳ ಸಿಂಗಲ್ ಕಲೆಕ್ಟರ್ ಬಾಕ್ಸ್ ಪಡೆಯಬಹುದು. ಇದು ಉಡುಗೊರೆ ನೀಡಲು ಅಥವಾ ಮೊದಲ ಬಾರಿ ಅನುಭವಿಸಲು ಸೂಕ್ತವಾಗಿದೆ.',
  },
  {
    id: 'faq-4',
    category: 'shipping',
    questionEn: 'When are monthly boxes dispatched, and how long does delivery take?',
    questionKn: 'ಮಾಸಿಕ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಯಾವಾಗ ಕಳುಹಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ತಲುಪಲು ಎಷ್ಟು ಸಮಯ ಬೇಕು?',
    answerEn:
      'New collections are dispatched in the first week of every month. For addresses across Karnataka and South India, parcels typically arrive within 2 to 3 working days. For the rest of India, delivery takes 4 to 6 working days via tracked speed courier.',
    answerKn:
      'ಪ್ರತಿ ತಿಂಗಳ ಮೊದಲ ವಾರದಲ್ಲಿ ಹೊಸ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ರವಾನಿಸಲಾಗುತ್ತದೆ. ಕರ್ನಾಟಕ ಹಾಗೂ ದಕ್ಷಿಣ ಭಾರತದ ನಗರಗಳಿಗೆ ೨-೩ ದಿನಗಳಲ್ಲಿ ಮತ್ತು ದೇಶದ ಇತರ ಭಾಗಗಳಿಗೆ ೪-೬ ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಟ್ರ್ಯಾಕಿಂಗ್ ಸೌಲಭ್ಯವಿರುವ ಕೊರಿಯರ್ ಮೂಲಕ ತಲುಪುತ್ತವೆ.',
  },
  {
    id: 'faq-5',
    category: 'subscription',
    questionEn: 'Can I pause, change delivery address, or cancel anytime?',
    questionKn: 'ನನ್ನ ಚಂದಾದಾರಿಕೆಯನ್ನು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸಲು ಅಥವಾ ರದ್ದುಮಾಡಲು ಸಾಧ್ಯವೇ?',
    answerEn:
      'Yes. You are never locked into unwanted commitments. You can easily pause your subscription for a month when travelling, update your delivery address, or cancel anytime with one simple click before the next billing cycle.',
    answerKn:
      'ಹೌದು, ನೀವು ಯಾವುದೇ ಕಟ್ಟುಪಾಡುಗಳಿಲ್ಲದೆ ನಿರ್ವಹಿಸಬಹುದು. ನೀವು ಪ್ರವಾಸದಲ್ಲಿರುವಾಗ ಒಂದು ತಿಂಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿ ನಿಲ್ಲಿಸಬಹುದು, ವಿಳಾಸ ಬದಲಾಯಿಸಬಹುದು ಅಥವಾ ಮುಂದಿನ ಬಿಲ್ಲಿಂಗ್ ದಿನಾಂಕಕ್ಕೆ ಮುಂಚಿತವಾಗಿ ಯಾವಾಗ ಬೇಕಾದರೂ ರದ್ದುಮಾಡಬಹುದು.',
  },
  {
    id: 'faq-6',
    category: 'quality',
    questionEn: 'Can I send Chitrakatha as a personalized gift?',
    questionKn: 'ಚಿತ್ರಕಥಾ ಪೆಟ್ಟಿಗೆಯನ್ನು ಇನ್ನೊಬ್ಬರಿಗೆ ಉಡುಗೊರೆಯಾಗಿ ಕಳುಹಿಸಬಹುದೇ?',
    answerEn:
      'Yes! Many of our readers gift Chitrakatha to parents, grandparents, friends living abroad, or book club companions. We include a complimentary handwritten calligraphic note with your personal blessing or message.',
    answerKn:
      'ಹೌದು! ನಮ್ಮ ಅನೇಕ ಓದುಗರು ತಮ್ಮ ಪೋಷಕರಿಗೆ, ದೂರದ ಊರಿನಲ್ಲಿರುವ ಸ್ನೇಹಿತರಿಗೆ ಅಥವಾ ಸಾಹಿತ್ಯ ಪ್ರಿಯರಿಗೆ ಉಡುಗೊರೆಯಾಗಿ ಕಳುಹಿಸುತ್ತಾರೆ. ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ನಾವು ಸುಂದರ ಕೈಬರಹದ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಬರೆದು ಪೆಟ್ಟಿಗೆಯೊಂದಿಗೆ ಸೇರಿಸುತ್ತೇವೆ.',
  },
];

