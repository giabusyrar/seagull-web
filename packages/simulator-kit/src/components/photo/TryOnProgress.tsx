'use client';
import { useEffect, useState } from 'react';
import { useLang } from '../../lib/i18n';

/** How often the running time is redrawn; one tenth of a second is what it shows. */
const TICK_MS = 100;

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

/** Seconds since `startedAt`, counting while it is set. */
export function Elapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [startedAt]);
  return <span className="tabular-nums">{seconds(Math.max(0, now - startedAt))}</span>;
}

/** Laid over the photo while a try-on renders: a scan line, a spinner and the running time. */
export function TryOnOverlay({ startedAt }: { startedAt: number }) {
  const { t } = useLang();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-white/25 backdrop-blur-[1.5px]" role="status" aria-live="polite">
      <div className="absolute inset-x-0 h-16 animate-[tryon-scan_1.6s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-amber-300/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-3 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-amber-400" />
          {t('Applying try-on…', 'Menerapkan try-on…')} <Elapsed startedAt={startedAt} />
        </span>
      </div>
      <style>{'@keyframes tryon-scan{0%{top:-4rem}100%{top:100%}}'}</style>
    </div>
  );
}

/** "Rendered in 2.8 s", shown on the try-on once it is there. */
export function RenderedIn({ ms }: { ms: number }) {
  const { t } = useLang();
  return (
    <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white">
      {t('Rendered in', 'Dirender dalam')} {seconds(ms)}
    </span>
  );
}
