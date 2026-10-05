'use client';
import { BrandProvider } from './lib/brand';
import { LangProvider } from './lib/i18n';
import { PhotosProvider } from './lib/photos';
import { TopBar } from './components/TopBar';
import { Simulator } from './components/Simulator';

/**
 * The whole simulator — top bar (brand, application, language, service
 * health) and the customer → questionnaire → photo → results flow — exactly
 * as both hosts show it: the simulator app and the dashboard's Simulator
 * Studio. Call configureSimulator() first to say where the services are.
 */
export function SimulatorApp() {
  return (
    <div className="min-h-full bg-zinc-50 bg-[radial-gradient(900px_420px_at_8%_-8%,rgba(251,207,232,0.55),transparent),radial-gradient(800px_420px_at_100%_0%,rgba(233,213,255,0.45),transparent)] font-sans text-zinc-900 antialiased">
      <LangProvider>
        <BrandProvider>
          <PhotosProvider>
            <TopBar />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
              <Simulator />
            </main>
          </PhotosProvider>
        </BrandProvider>
      </LangProvider>
    </div>
  );
}
