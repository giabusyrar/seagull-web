import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BrandProvider } from '@/lib/brand';
import { LangProvider } from '@/lib/i18n';
import { PhotosProvider } from '@/lib/photos';
import { TopBar } from '@/components/TopBar';

export const metadata: Metadata = { title: 'Seagull Simulator' };

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <LangProvider>
          <BrandProvider>
            <PhotosProvider>
              <TopBar />
              <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
            </PhotosProvider>
          </BrandProvider>
        </LangProvider>
      </body>
    </html>
  );
}
