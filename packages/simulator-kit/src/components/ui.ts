/**
 * Shared class names, so cards, buttons and labels look the same on every
 * screen. Tailwind only; no component library.
 */
export const card = 'rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]';
export const cardPad = `${card} p-5`;

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:cursor-not-allowed';
export const btnPrimary = `${btn} bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400`;
export const btnPrimarySm = `${btn} bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400`;
export const btnSecondary =`${btn} border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50`;
export const btnGhost = `${btn} px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900`;

/** A segmented control: a track holding option buttons. */
export const segTrack = 'inline-flex gap-0.5 rounded-lg bg-zinc-100 p-0.5';
export const segItem = (on: boolean) =>
  `rounded-md px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
    on ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
  }`;

export const eyebrow = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500';
export const field =
  'h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-800 transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:outline-none';
