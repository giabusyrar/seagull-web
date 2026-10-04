import type { Metadata } from 'next';
import './globals.css';
import { BrandProvider } from '@/lib/brand';
import { TopBar } from '@/components/TopBar';

export const metadata: Metadata = { title: 'Seagull Simulator' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-zinc-900">
        <BrandProvider>
          <TopBar />
          <main className="mx-auto max-w-7xl p-4">{children}</main>
        </BrandProvider>
      </body>
    </html>
  );
}
