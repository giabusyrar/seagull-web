'use client';
import type { Turn } from '../../lib/conversation';
import { useLang } from '../../lib/i18n';
import { eyebrow } from '../ui';
import { Pill, humanize } from '../photo/TabShell';

export function Bubble({ t }: { t: Turn }) {
  const me = t.speaker === 'Customer';
  return (
    <div className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${me ? 'rounded-br-md bg-zinc-900 text-white' : 'rounded-bl-md bg-zinc-100 text-zinc-900'} ${t.final ? '' : 'opacity-60'}`}>
        {t.text}{!t.final && ' …'}
      </div>
    </div>
  );
}

/** Where a paused or dropped session picked up again. The advisor keeps the earlier turns. */
export function ResumeDivider({ waiting }: { waiting?: boolean }) {
  const { t } = useLang();
  return (
    <div className="my-1 flex items-center gap-3 text-[11px] text-zinc-400">
      <span className="h-px flex-1 bg-zinc-200" />
      <span className="text-center">
        {t('Resumed · the advisor remembers the earlier conversation', 'Dilanjutkan · advisor mengingat percakapan sebelumnya')}
        {waiting ? ` — ${t('speak or type to continue', 'bicara atau ketik untuk lanjut')}` : ''}
      </span>
      <span className="h-px flex-1 bg-zinc-200" />
    </div>
  );
}

export function ProgressBar({ answered, total }: { answered?: number; total?: number }) {
  const { t } = useLang();
  if (typeof answered !== 'number' || typeof total !== 'number' || total <= 0) return null;
  const pct = Math.min(100, Math.round((answered / total) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-zinc-900 transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
      <span className="shrink-0 text-[11px] text-zinc-500">{answered}/{total} {t('answered', 'terjawab')}</span>
    </div>
  );
}

interface UnfilledSlot { slot_id?: string; category?: string; required?: boolean; reason?: string }

export interface MatchOutput {
  profile_summary?: { skin_type?: string; primary_concerns?: string[] };
  regimens?: { phases?: Record<string, unknown[] | null>; unfilled_slots?: Record<string, UnfilledSlot[]> };
}

/** The match engine's answer: the profile it matched on and the routine per phase, if any. */
export function MatchResult({ r }: { r: MatchOutput }) {
  const { t } = useLang();
  const p = r.profile_summary ?? {};
  const phases = Object.entries(r.regimens?.phases && typeof r.regimens.phases === 'object' ? r.regimens.phases : {});
  const unfilled = r.regimens?.unfilled_slots && typeof r.regimens.unfilled_slots === 'object' ? r.regimens.unfilled_slots : {};
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={eyebrow}>{t('Profile used for matching', 'Profil untuk pencocokan')}</span>
        <span className="text-lg font-semibold">{p.skin_type || '—'}</span>
        <div className="flex flex-wrap gap-1.5">{(p.primary_concerns ?? []).map((c) => <Pill key={c} className="bg-zinc-100 text-zinc-600">{c}</Pill>)}</div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {phases.map(([phase, steps]) => (
          <div key={phase} className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5">
            <span className="text-xs font-semibold text-zinc-700">{humanize(phase)}</span>
            {Array.isArray(steps) && steps.length
              ? <ol className="mt-1.5 list-decimal pl-4 text-xs text-zinc-600">{steps.map((st, i) => <li key={i}>{String((st as { product_name?: string; name?: string })?.product_name ?? (st as { name?: string })?.name ?? JSON.stringify(st))}</li>)}</ol>
              : <p className="mt-1 text-xs text-zinc-400">{t('No matching product in the catalogue yet.', 'Belum ada produk yang cocok di katalog.')}</p>}
            {Array.isArray(unfilled[phase]) && unfilled[phase].length > 0 && (
              <ul className="mt-2 flex flex-col gap-1 text-[11px] text-zinc-500">
                {unfilled[phase].map((u, i) => (
                  <li key={`${u.slot_id}-${i}`}>
                    <span className="font-medium text-zinc-700">{u.category || u.slot_id}</span>{u.required ? ' *' : ''}{u.reason ? ` — ${u.reason}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
