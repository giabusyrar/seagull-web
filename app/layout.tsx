import type { Metadata } from 'next';
import './globals.css';
import { BrandProvider } from '@/lib/brand';
import { TopBar } from '@/components/TopBar';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = { title: 'Seagull Simulator' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900">
        <BrandProvider>
          <TopBar />
          <div className="flex">
            <Nav />
            <main className="min-w-0 flex-1 p-4">{children}</main>
          </div>
        </BrandProvider>
      </body>
    </html>
  );
}
