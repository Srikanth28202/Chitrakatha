import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/context';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { siteConfig } from '@/config/site';

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
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="subtle-paper-grain selection:bg-terracotta-100 selection:text-terracotta-800">
        <LanguageProvider initialLocale="en">
          <div className="flex flex-col min-h-screen">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
