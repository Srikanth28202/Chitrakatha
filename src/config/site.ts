export interface NavItem {
  titleEn: string;
  titleKn: string;
  href: string;
  badge?: string;
}

export const siteConfig = {
  name: 'Chitrakatha',
  nameKannada: 'ಚಿತ್ರಕಥಾ',
  tagline: 'A Little Story, Delivered to Your Doorstep',
  taglineKannada: 'ಒಂದು ಪುಟ್ಟ ಕಥೆ, ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ',
  description:
    'Chitrakatha is a premium bilingual monthly creative stationery and story-letter subscription brand celebrating Kannada literature, authentic art, and slow tangible correspondence.',
  url: 'https://chitrakatha.art',
  navItems: [
    {
      titleEn: 'Home',
      titleKn: 'ಮುಖಪುಟ',
      href: '/',
    },
    {
      titleEn: 'Our Story',
      titleKn: 'ನಮ್ಮ ಕಥನ',
      href: '/#story',
    },
    {
      titleEn: 'Collections',
      titleKn: 'ಸಂಗ್ರಹಗಳು',
      href: '/#collections',
    },
    {
      titleEn: "What's Inside",
      titleKn: 'ಒಳಗಿರುವುದು ಏನು?',
      href: '/#whats-inside',
    },
    {
      titleEn: 'How It Works',
      titleKn: 'ಕಾರ್ಯವಿಧಾನ',
      href: '/#how-it-works',
    },
    {
      titleEn: 'FAQ',
      titleKn: 'ಪ್ರಶ್ನೋತ್ತರ',
      href: '/#faq',
    },
  ] satisfies NavItem[],
  socials: {
    instagram: 'https://instagram.com/chitrakatha.art',
    twitter: 'https://x.com/chitrakatha',
    substack: 'https://chitrakatha.substack.com',
  },
  contact: {
    email: 'namaskara@chitrakatha.art',
    curatorDesk: 'Basavanagudi & Indiranagar, Bengaluru, Karnataka, India',
  },
} as const;
