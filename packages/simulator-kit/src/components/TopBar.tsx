import { HealthPills } from './HealthPills';
import { accent } from './ui';
import { BrandPicker } from './BrandPicker';
import { LangSwitch } from './LangSwitch';
import { useLayout } from '../lib/layout';

export function TopBar() {
  // Embedded, the host's header names the page: this bar is only the run's settings.
  if (useLayout() === 'embedded') {
    return (
      <div className="z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl sm:sticky sm:top-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <HealthPills />
          <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
            <BrandPicker />
            <LangSwitch />
          </div>
        </div>
      </div>
    );
  }
  return (
    <header className="z-20 sm:sticky sm:top-0 border-b border-white/60 bg-white/70 shadow-[0_1px_0_rgba(24,24,27,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent} text-sm font-black text-white shadow-md shadow-slate-900/20`}>S</span>
          <span className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight">
            Seagull
            <span className="rounded-full bg-zinc-900/[0.04] px-2 py-0.5 text-[11px] font-medium text-zinc-500">Simulator</span>
          </span>
          <span className="hidden h-4 w-px bg-zinc-200 sm:block" />
          <HealthPills />
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <BrandPicker />
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
