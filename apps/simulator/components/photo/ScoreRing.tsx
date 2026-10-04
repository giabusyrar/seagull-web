/**
 * A score on a fixed 0..max scale as a ring. Only for scores whose scale
 * the response states (the overall skin score is out of 100); metrics with
 * no stated scale are shown as numbers, not rings.
 */
export function ScoreRing({ value, max, size = 120, label, notScored }: { value: number | null | undefined; max: number; size?: number; label?: string; notScored: string }) {
  const stroke = Math.max(6, Math.round(size / 14));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const has = typeof value === 'number' && Number.isFinite(value);
  const frac = has ? Math.min(1, Math.max(0, (value as number) / max)) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-zinc-100" />
        {has && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * (1 - frac)} className="stroke-zinc-900 transition-[stroke-dashoffset] duration-700" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {has ? (
          <>
            <span className="text-3xl font-bold tracking-tight tabular-nums">{(value as number).toFixed(1)}</span>
            <span className="text-[10px] text-zinc-500">/ {max}</span>
          </>
        ) : <span className="px-3 text-xs font-medium text-zinc-500">{notScored}</span>}
      </div>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
