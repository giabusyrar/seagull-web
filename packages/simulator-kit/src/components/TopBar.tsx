import { HealthPills } from './HealthPills';
import { BrandPicker } from './BrandPicker';
import { LangSwitch } from './LangSwitch';

export function TopBar() {
  return (
    <header className="z-20 sm:sticky sm:top-0 border-b border-zinc-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-[13px] font-black text-white">S</span>
          <span className="text-sm font-semibold tracking-tight">Seagull <span className="font-normal text-zinc-500">Simulator</span></span>
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
