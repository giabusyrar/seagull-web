'use client';
import { useState } from 'react';
import type { Selection, ShadeGroup } from '@/lib/photo';
import { isKept } from '@/lib/types/colour';
import { btnGhost, segItem, segTrack } from '@/components/ui';
import { useLang } from '@/lib/i18n';

/** Shades grouped by category; one pick per category. Kept (suited) shades carry a dot. */
export function ShadeSwatches({ groups, selection, onToggle, onClear, tryOnState }: {
  groups: ShadeGroup[];
  selection: Selection;
  onToggle(category: string, shadeId: string): void;
  onClear(): void;
  tryOnState: { loading: boolean; error?: string };
}) {
  const [groupId, setGroupId] = useState('');
  const { t } = useLang();
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  if (!group) return <p className="text-sm text-zinc-500">{t('The response has no shade catalog or recommendations.', 'Respons tidak memuat katalog atau rekomendasi shade.')}</p>;
  const picked = Object.keys(selection).length;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`${segTrack} flex-wrap`}>
          {groups.map((g) => (
            <button key={g.id} type="button" onClick={() => setGroupId(g.id)} className={segItem(g.id === group.id)}>
              {g.label}{g.categories.some((c) => selection[c.category]) ? <span className="ml-1 text-emerald-600">•</span> : null}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {tryOnState.loading && <span className="animate-pulse">{t('Rendering try-on…', 'Merender try-on…')}</span>}
          {picked > 0 && <button type="button" className={btnGhost} onClick={onClear}>{t('Clear picks', 'Hapus pilihan')} ({picked})</button>}
        </div>
      </div>
      {tryOnState.error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">{t('Try-on failed', 'Try-on gagal')}: {tryOnState.error}</p>}
      {group.categories.map((c) => {
        const sel = c.shades.find((s) => s.shadeId === selection[c.category]);
        return (
          <div key={c.category} className="flex flex-col gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-zinc-800">{c.label}</span>
              <span className={`truncate ${sel ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}>{sel ? `${sel.productName ?? '—'} · ${sel.shadeName ?? sel.shadeId}` : `${c.shades.length} ${t('shades', 'shade')}`}</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {c.shades.map((s) => {
                const on = selection[c.category] === s.shadeId;
                return (
                  <button key={s.shadeId} type="button" onClick={() => onToggle(c.category, s.shadeId)}
                    title={`${s.productName ?? ''} · ${s.shadeName ?? s.shadeId}${isKept(s) ? ` (${t('suits you', 'cocok')})` : ''}`}
                    aria-pressed={on}
                    className={`relative h-9 w-9 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] transition-transform hover:scale-110 ${on ? 'scale-110 ring-2 ring-zinc-900 ring-offset-2' : ''}`}
                    style={{ background: s.hexColor || '#e4e4e7' }}>
                    {isKept(s) && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {t('Shades that suit you per the analysis. One shade per category; click again to remove it.', 'Shade yang cocok menurut analisis. Satu shade per kategori; klik lagi untuk melepas.')}</p>
    </div>
  );
}
