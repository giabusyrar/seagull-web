'use client';
/* eslint-disable @next/next/no-img-element -- a blob: URL of the rendered try-on */
import { useEffect, useState } from 'react';
import { call } from '../../lib/http';
import type { Brand } from '../../lib/photo';
import { listLooks, notRenderedHeader, resolveLook, tryOnLook, type LookSummary, type ResolvedLook, type ResolvedRole } from '../../lib/looks';
import { useLang } from '../../lib/i18n';
import { btnPrimarySm, card, eyebrow, field } from '../ui';
import { ErrorBox, Pill, Section, dash, humanize, num, type TabState } from './TabShell';
import { Elapsed } from './TryOnProgress';

const IDLE: TabState = { loading: false };
/** Wall-clock ms, read on click (not during render) to time a render. */
const clock = () => Date.now();

/** core's perceptibility bands for a shade against the skin (colour domain/perceptibility.go). */
const BAND_LABEL: Record<string, [string, string]> = {
  not_perceptible: ['indistinguishable from the skin', 'tak terbedakan dari kulit'],
  close_inspection: ['visible on close inspection', 'terlihat bila diamati dekat'],
  noticeable: ['noticeable', 'terlihat'],
  at_a_glance: ['clear at a glance', 'jelas sekilas'],
};

function RoleRow({ role, r }: { role: string; r: ResolvedRole }) {
  const { lang, t } = useLang();
  const band = r.why?.skinBand ? BAND_LABEL[r.why.skinBand]?.[lang === 'id' ? 1 : 0] ?? r.why.skinBand : null;
  return (
    <tr className="border-t border-zinc-100 align-top">
      <td className="px-3 py-2 font-medium text-zinc-700">{humanize(role.replace('.', ' · '))}</td>
      <td className="px-3 py-2">
        {r.unresolved ? (
          <span className="text-zinc-500">{t('No shade', 'Tanpa shade')}: <span className="font-mono text-[11px]">{r.unresolved}</span></span>
        ) : (
          <span className="flex items-start gap-2">
            {r.hexColor && <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full ring-1 ring-zinc-900/10" style={{ background: r.hexColor }} title={`${r.hexColor} (${dash(r.colourSource)})`} />}
            <span className="flex min-w-0 flex-col">
              <span className="text-zinc-900">{r.product ? `${r.product}${r.shade ? ` — ${r.shade}` : ''}` : r.colourSource === 'skin_derived' ? t('From the skin tone (no product)', 'Dari warna kulit (tanpa produk)') : '—'}</span>
              {r.why && (
                <span className="text-[11px] text-zinc-500">
                  {r.why.rule === 'fixed' ? t("The look's own shade", 'Shade dari look') : r.why.rule === 'skin_match' ? t('Matched to the skin', 'Dicocokkan ke kulit') : r.why.rule === 'harmony' ? t('In harmony with the skin', 'Selaras dengan kulit') : dash(r.why.rule)}
                  {r.why.rating ? ` · ${humanize(r.why.rating)}` : ''}{r.why.temperature ? ` · ${r.why.temperature}` : ''}
                  {typeof r.why.skinDeltaE00 === 'number' ? ` · ΔE00 ${num(r.why.skinDeltaE00, 1)}${band ? ` (${band})` : ''}` : ''}
                </span>
              )}
            </span>
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-[11px] text-zinc-500">
        {[r.technique?.style, typeof r.technique?.amount === 'number' ? `${t('amount', 'jumlah')} ${num(r.technique.amount, 2)}` : null, r.technique?.finish].filter(Boolean).join(' · ') || '—'}
        {r.placement && (
          <span className="mt-1 block">
            {r.placement.neutral
              ? <>{t('Placement unchanged', 'Penempatan tidak diubah')}: {r.placement.neutral}</>
              : <>{t('Placed for', 'Ditempatkan untuk')} {dash(r.placement.faceShape)}{r.placement.adjust ? `: ${Object.entries(r.placement.adjust).map(([k, v]) => `${k} ${num(v, 2)}`).join(', ')}` : ''}</>}
            {r.placement.placeholder && <Pill className="ml-1 bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">{t('prototype rule', 'aturan prototipe')}</Pill>}
            {r.placement.textKeys && r.placement.textKeys.length > 0 && (
              <span className="mt-0.5 block font-mono text-[10px] text-zinc-400" title={t('Text keys, not yet translated in the simulator', 'Kunci teks, belum diterjemahkan di simulator')}>{r.placement.textKeys.join(' · ')}</span>
            )}
          </span>
        )}
      </td>
    </tr>
  );
}

/**
 * The brand's looks for this customer: pick one (and a colourway), see the
 * shade core chose for each makeup slot and why, then render it on the photo.
 * Everything shown is core's; a slot core could not fill says why.
 */
export function LooksTab({ brand, photo, hijab, hairVisible }: { brand: Brand; photo: File; hijab: boolean; hairVisible: boolean }) {
  const { t } = useLang();
  const [list, setList] = useState<TabState>({ loading: true });
  const [code, setCode] = useState('');
  const [colourway, setColourway] = useState('');
  const [resolved, setResolved] = useState<TabState>(IDLE);
  const [render, setRender] = useState<TabState & { startedAt?: number; ms?: number }>(IDLE);

  useEffect(() => {
    const ac = new AbortController();
    const req = listLooks(brand);
    call({ url: req.url, init: { ...req.init, signal: ac.signal } }).then((result) => { if (!ac.signal.aborted) setList({ loading: false, result }); });
    return () => ac.abort();
  }, [brand]);
  // A new render replaces the old one's blob URL.
  useEffect(() => () => { if (render.result?.blobUrl) URL.revokeObjectURL(render.result.blobUrl); }, [render.result?.blobUrl]);

  const looks: LookSummary[] = list.result?.ok ? ((list.result.json as { looks?: LookSummary[] })?.looks ?? []) : [];
  const look = looks.find((l) => l.code === code);
  const opts = { colourway: colourway || undefined, hijab, hairVisible };

  const pick = (c: string) => { setCode(c); setColourway(''); setResolved(IDLE); setRender(IDLE); };
  const resolve = async () => {
    if (!look) return;
    setResolved({ loading: true }); setRender(IDLE);
    const req = resolveLook(brand, look.code, photo, opts);
    setResolved({ loading: false, result: await call(req) });
  };
  const tryOn = async () => {
    if (!look) return;
    const startedAt = clock();
    setRender({ loading: true, startedAt });
    const req = tryOnLook(brand, look.code, photo, opts);
    const result = await call(req);
    setRender({ loading: false, result, ms: clock() - startedAt });
  };

  const r = resolved.result?.ok ? (resolved.result.json as ResolvedLook) : null;
  const notRendered = (render.result?.ok && notRenderedHeader(render.result.headers)) || r?.notRendered || {};
  const nrEntries = Object.entries(notRendered);

  if (list.loading) return <p className="text-sm text-zinc-500">{t('Loading looks…', 'Memuat look…')}</p>;
  if (list.result && !list.result.ok) return <ErrorBox result={list.result} />;
  if (!looks.length) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
        {t('This brand has no active looks yet. Looks are authored in Reference Data; none are invented here.', 'Brand ini belum punya look aktif. Look dibuat di Reference Data; tidak ada yang dikarang di sini.')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {looks.map((l) => (
          <button key={l.code} type="button" aria-pressed={code === l.code} onClick={() => pick(l.code)}
            className={`${card} flex flex-col gap-1.5 p-4 text-left transition-all hover:ring-zinc-900/15 ${code === l.code ? 'ring-2 ring-amber-400' : ''}`}>
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">{l.name || l.code}</span>
              <span className="font-mono text-[10px] text-zinc-400">{l.code}{l.version ? ` v${l.version}` : ''}</span>
            </span>
            {l.story && <span className="text-[11px] leading-relaxed text-zinc-500">{l.story}</span>}
            {l.roles && l.roles.length > 0 && (
              <span className="flex flex-wrap gap-1">{l.roles.map((ro) => <Pill key={ro} className="bg-zinc-100 text-zinc-600">{humanize(ro.replace('.', ' · '))}</Pill>)}</span>
            )}
          </button>
        ))}
      </div>

      {look && (
        <div className="flex flex-wrap items-end gap-3">
          {look.colourways && look.colourways.length > 0 && (
            <label className="flex flex-col gap-1.5">
              <span className={eyebrow}>{t('Colourway', 'Varian warna')}</span>
              <select className={field} value={colourway} onChange={(e) => { setColourway(e.target.value); setResolved(IDLE); setRender(IDLE); }}>
                <option value="">{t('As authored', 'Sesuai resep')}</option>
                {look.colourways.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          )}
          <button type="button" className={btnPrimarySm} disabled={resolved.loading} onClick={resolve}>
            {resolved.loading ? t('Resolving…', 'Menghitung…') : t('Resolve for this customer', 'Hitung untuk pelanggan ini')}
          </button>
          <button type="button" className={btnPrimarySm} disabled={render.loading} onClick={tryOn}>
            {render.loading ? <>{t('Rendering…', 'Merender…')} {render.startedAt && <Elapsed startedAt={render.startedAt} />}</> : t('Try it on', 'Coba pakai')}
          </button>
        </div>
      )}

      {resolved.result && !resolved.result.ok && <ErrorBox result={resolved.result} />}
      {resolved.error && <p className="text-xs text-red-700">{resolved.error}</p>}

      {r && (
        <Section title={t('Shades for this customer', 'Shade untuk pelanggan ini')}>
          <p className="text-[11px] text-zinc-500">{t("A slot marked \"The look's own shade\" always shows the shade the look names. The others are picked for this customer's skin from the look's product, so a shade named in the description may differ from the one shown.", 'Slot bertanda "Shade dari look" selalu memakai shade yang ditentukan look. Slot lain dipilih untuk kulit pelanggan ini dari produk look, jadi shade di deskripsi bisa berbeda dengan yang tampil.')}</p>
          {r.faceShape && (
            <p className="text-[11px] text-zinc-500">{t('Face shape', 'Bentuk wajah')}: {dash(r.faceShape.class)} ({dash(r.faceShape.status)}{r.faceShape.calibration ? `, ${r.faceShape.calibration}` : ''})</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <tr><th className="px-3 py-2 font-semibold">{t('Slot', 'Slot')}</th><th className="px-3 py-2 font-semibold">{t('Shade', 'Shade')}</th><th className="px-3 py-2 font-semibold">{t('How', 'Cara')}</th></tr>
              </thead>
              <tbody>{Object.entries(r.roles ?? {}).map(([role, rr]) => <RoleRow key={role} role={role} r={rr} />)}</tbody>
            </table>
          </div>
          {r.elements && r.elements.length > 0 && (
            <p className="text-[11px] text-zinc-500">{t('Face art', 'Seni wajah')}: {r.elements.map((e) => `${dash(e.element)} @ ${dash(e.zone)}${typeof e.density === 'number' ? ` (${num(e.density, 2)})` : ''}`).join(' · ')}</p>
          )}
        </Section>
      )}

      {render.result && !render.result.ok && <ErrorBox result={render.result} />}
      {render.result?.ok && render.result.blobUrl && (
        <Section title={t('On the photo', 'Di foto')} aside={render.ms !== undefined ? <span className="text-[11px] tabular-nums text-zinc-400">{t('Rendered in', 'Dirender dalam')} {(render.ms / 1000).toFixed(1)} s</span> : undefined}>
          <img src={render.result.blobUrl} alt={t('The look rendered on the photo', 'Look dirender di foto')} className="mx-auto max-h-[60vh] w-auto rounded-xl" />
        </Section>
      )}

      {nrEntries.length > 0 && (
        <Section title={t('Not drawn', 'Tidak digambar')}>
          <ul className="flex flex-col gap-1 text-[11px] text-zinc-600">
            {nrEntries.map(([k, why]) => <li key={k}><span className="font-mono text-zinc-800">{k}</span>: {why}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}
