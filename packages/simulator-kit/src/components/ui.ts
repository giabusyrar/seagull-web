/**
 * Shared class names, so cards, buttons and labels look the same on every
 * screen. Tailwind only; no component library.
 *
 * The look: white surfaces with soft depth on a lightly tinted page, one
 * accent (Seagull slate, beak amber for highlights) for primary actions and
 * the active step, and roomy, rounded inputs.
 */

/**
 * Seagull's colours, the dashboard's palette (apps/web/app/globals.css):
 * deep slate (--primary, #0f172a = slate-900) for primary actions and "you
 * are here", and the beak amber (--accent-beak, #d97706 = amber-600) for
 * highlights and focus. Tailwind names, because the simulator app does not
 * load the dashboard's CSS variables.
 */
export const accent = 'bg-slate-900';

/** The same two colours as hex, for SVG drawn over the photo. */
export const SEAGULL_HEX = { slate: '#0f172a', beak: '#d97706' } as const;

/**
 * Severity tones as hex for SVG over the photo, the same Tailwind colours the
 * severity pills use (TabShell TONE_CLASSES): emerald, amber, red; slate for
 * a reading with no severity.
 */
export const TONE_HEX = { good: '#10b981', warning: '#f59e0b', bad: '#ef4444', neutral: '#94a3b8' } as const;

export const card =
  'rounded-3xl bg-white ring-1 ring-zinc-900/[0.06] shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-16px_rgba(24,24,27,0.18)]';
export const cardPad = `${card} p-5 sm:p-6`;

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed';
const primary = `${accent} text-white shadow-md shadow-slate-900/20 hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none disabled:active:scale-100`;
export const btnPrimary = `${btn} ${primary} px-5 py-2.5 text-sm`;
export const btnPrimarySm = `${btn} ${primary} px-3.5 py-1.5 text-xs`;
export const btnSecondary = `${btn} bg-white px-3.5 py-1.5 text-xs text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-zinc-50 hover:ring-zinc-900/20`;
export const btnGhost = `${btn} px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900`;

/** A segmented control: a track holding option buttons. */
export const segTrack = 'inline-flex gap-0.5 rounded-full bg-zinc-100 p-1';
export const segItem = (on: boolean) =>
  `rounded-full px-3.5 py-1 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
    on ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/5' : 'text-zinc-500 hover:text-zinc-900'
  }`;

export const eyebrow = 'text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400';
export const field =
  'h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-800 transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100';

/** A step's heading and the line under it. */
export const pageTitle = 'text-2xl font-semibold tracking-tight text-zinc-900 sm:text-[28px]';
export const pageSub = 'mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500';
