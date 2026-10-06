'use client';
import { BrandProvider } from './lib/brand';
import { LangProvider } from './lib/i18n';
import { PhotosProvider } from './lib/photos';
import { TopBar } from './components/TopBar';
import { Simulator } from './components/Simulator';
import { LayoutProvider, type SimulatorLayout } from './lib/layout';

/**
 * The whole simulator — top bar (brand, application, language, service
 * health) and the customer → questionnaire → photo → results flow — exactly
 * as both hosts show it: the simulator app and the dashboard's Simulator
 * Studio. Call configureSimulator() first to say where the services are.
 * `layout="embedded"` fits it into a host page that has its own header.
 */
export function SimulatorApp({ layout = 'standalone' }: { layout?: SimulatorLayout }) {
  const embedded = layout === 'embedded';
  return (
    <div className="min-h-full bg-slate-50 font-sans text-zinc-900 antialiased">
      <LayoutProvider value={layout}>
        <LangProvider>
          <BrandProvider>
            <PhotosProvider>
              <TopBar />
              <main className={embedded ? 'px-4 py-5 sm:px-6' : 'mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8'}>
                <Simulator />
              </main>
            </PhotosProvider>
          </BrandProvider>
        </LangProvider>
      </LayoutProvider>
    </div>
  );
}
