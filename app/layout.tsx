import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter', display: 'swap' });

const description =
  'Menzura is a private house of up to 500 founders and executives. We are now choosing the first people who will look after them, work beside us and back the house.';

export const metadata: Metadata = {
  metadataBase: new URL('https://houseofmenzura.com'),
  title: { default: 'House of Menzura', template: '%s · House of Menzura' },
  description,
  openGraph: { title: 'House of Menzura', description, type: 'website', siteName: 'House of Menzura' },
  twitter: { card: 'summary', title: 'House of Menzura', description },
  icons: { icon: [{ url: '/icons/icon-32.png', sizes: '32x32' }], apple: '/icons/icon-180.png' },
};

export const viewport: Viewport = { themeColor: '#111111', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
