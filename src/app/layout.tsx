import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { LanguageProvider } from '@/i18n/context';
import { CartProvider } from '@/components/cart/cart-provider';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { siteConfig } from '@/config/site';
import { DEFAULT_LOCALE, LOCALE_COOKIE } from '@/config/constants';
import type { Locale } from '@/types/i18n';

export const viewport: Viewport = {
  themeColor: '#FAF6F0',
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} (${siteConfig.nameKannada}) · Monthly Creative Subscription`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Chitrakatha',
    'ಚಿತ್ರಕಥಾ',
    'Kannada literature',
    'Indian art prints',
    'monthly creative subscription',
    'archival art box',
    'Bangalore cultural imprint',
    'bilingual storytelling',
  ],
  authors: [{ name: 'Chitrakatha Curatorial Desk' }],
  creator: 'Chitrakatha',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading the locale cookie before render lets the server emit Kannada
  // HTML for Kannada visitors (no post-hydration language flash). Pages are
  // therefore rendered per request instead of pre-rendered.
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale: Locale =
    cookieLocale === 'kn' || cookieLocale === 'en' ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className="subtle-paper-grain selection:bg-terracotta-100 selection:text-terracotta-800">
        <LanguageProvider initialLocale={initialLocale}>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <AnnouncementBar />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
