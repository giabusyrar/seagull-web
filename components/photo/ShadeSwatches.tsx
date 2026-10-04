'use client';
import { useState } from 'react';
import type { Selection, ShadeGroup } from '@/lib/photo';
import { isKept } from '@/lib/types/colour';

/** Shades grouped by category; one pick per category. Kept (suited) shades carry a dot. */
export function ShadeSwatches({ groups, selection, onToggle, onClear, tryOnState }: {
  groups: ShadeGroup[];
  selection: Selection;
  onToggle(category: string, shadeId: string): void;
  onClear(): void;
  tryOnState: { loading: boolean; error?: string };
}) {
  const [groupId, setGroupId] = useState('');
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  if (!group) return <p className="text-sm text-zinc-500">Respons tidak memuat katalog atau rekomendasi shade.</p>;
  const picked = Object.keys(selection).length;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {groups.map((g) => (
            <button key={g.id} type="button" onClick={() => setGroupId(g.id)}
              className={`rounded px-3 py-1 text-xs font-semibold ${g.id === group.id ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}>
              {g.label}{g.categories.some((c) => selection[c.category]) ? ' •' : ''}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {tryOnState.loading && <span className="animate-pulse">Merender try-on…</span>}
          {picked > 0 && <button type="button" className="underline" onClick={onClear}>Hapus pilihan ({picked})</button>}
        </div>
      </div>
      {tryOnState.error && <p className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-900">Try-on gagal: {tryOnState.error}</p>}
      {group.categories.map((c) => {
        const sel = c.shades.find((s) => s.shadeId === selection[c.category]);
        return (
          <div key={c.category} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-zinc-500">{c.label}</span>
              <span className="truncate text-zinc-600">{sel ? `${sel.productName ?? '—'} · ${sel.shadeName ?? sel.shadeId}` : `${c.shades.length} shade`}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.shades.map((s) => {
                const on = selection[c.category] === s.shadeId;
                return (
                  <button key={s.shadeId} type="button" onClick={() => onToggle(c.category, s.shadeId)}
                    title={`${s.productName ?? ''} · ${s.shadeName ?? s.shadeId}${isKept(s) ? ' (cocok)' : ''}`}
                    className={`relative h-8 w-8 rounded-full border ${on ? 'ring-2 ring-zinc-900 ring-offset-2' : 'border-zinc-300'}`}
                    style={{ background: s.hexColor || '#e4e4e7' }}>
                    {isKept(s) && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-zinc-500">Titik hijau = shade yang cocok menurut analisis. Satu shade per kategori; klik lagi untuk melepas.</p>
    </div>
  );
}
