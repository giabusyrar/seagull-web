'use client';
import { useEffect, useState } from 'react';
import { glbExtras } from '../../lib/glb';
import type { HeadReport } from '../../lib/types/head';
import type { Bilingual } from '../../lib/i18n';
import { useLang } from '../../lib/i18n';
import { eyebrow } from '../ui';
import { Pill, dash, num } from './TabShell';

/** Why no hair template was used, in the worker's codes (headreport.go HeadHair.TemplateReason). */
const TEMPLATE_REASON: Bilingual = {
  en: { below_min_iou: 'no template matched the photos closely enough', templates_unavailable: 'no templates available', template_build_failed: 'the template could not be built', too_much_under_skin: 'the best template sat too far under the skin', no_hair_region: 'no hair found in the photos' },
  id: { below_min_iou: 'tidak ada template yang cukup cocok dengan foto', templates_unavailable: 'template tidak tersedia', template_build_failed: 'template gagal dibuat', too_much_under_skin: 'template terbaik terlalu banyak di bawah kulit', no_hair_region: 'tidak ada rambut di foto' },
};

const pct = (v: number | undefined) => (typeof v === 'number' ? `${Math.round(v * 100)}%` : '—');

/** The head report (GLB asset.extras): how the hair was made and what it owes, and which photos skin the head. */
export function HeadReportPanel({ glbUrl }: { glbUrl: string }) {
  const { lang, t } = useLang();
  const [report, setReport] = useState<{ url: string; r: HeadReport | null } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(glbUrl).then((res) => res.arrayBuffer()).then((buf) => { if (alive) setReport({ url: glbUrl, r: glbExtras(buf) as HeadReport | null }); })
      .catch(() => { if (alive) setReport({ url: glbUrl, r: null }); });
    return () => { alive = false; };
  }, [glbUrl]);
  const r = report?.url === glbUrl ? report.r : null;
  if (!r) return null;
  const hair = r.hair;
  const tpl = hair?.template;
  const credits = Array.isArray(hair?.attribution) ? hair.attribution : [];
  const views = Array.isArray(r.photoSkin) ? r.photoSkin : [];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3 text-[11px] text-zinc-600">
      {hair && (
        <div className="flex flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className={eyebrow}>{t('Hair', 'Rambut')}</span>
            {hair.mode && (
              <Pill className="bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200">
                {hair.mode === 'template' ? t('Fitted template', 'Template dicocokkan') : hair.mode === 'shell' ? t('Built from the photos', 'Dibuat dari foto') : hair.mode}
              </Pill>
            )}
            {hair.colour?.toneSrgbHex && (
              <span className="inline-flex items-center gap-1" title={hair.colour.method}>
                <span className="h-3 w-3 rounded-full ring-1 ring-zinc-900/10" style={{ background: hair.colour.toneSrgbHex }} />{hair.colour.toneSrgbHex}
              </span>
            )}
          </span>
          {tpl && hair.mode === 'template' && (
            <span>
              {t('Template', 'Template')} <span className="font-mono text-zinc-800">{dash(tpl.id)}</span> · IoU {num(tpl.iou, 2)} · {t('seen in the photos', 'terlihat di foto')} {pct(tpl.confirmedFraction)}
              {(tpl.author || tpl.license) && <> · {dash(tpl.author)}{tpl.license ? `, ${tpl.license}` : ''}</>}
              {tpl.source && <> · <a className="underline decoration-zinc-300 hover:text-zinc-900" href={tpl.source} target="_blank" rel="noreferrer">{t('source', 'sumber')}</a></>}
            </span>
          )}
          {hair.templateReason && hair.mode !== 'template' && (
            <span>{t('No template', 'Tanpa template')}: {TEMPLATE_REASON[lang][hair.templateReason] ?? hair.templateReason}{tpl?.id ? ` (${tpl.id}, IoU ${num(tpl.iou, 2)})` : ''}</span>
          )}
          {credits.length > 0 && (
            <span>{t('Credits', 'Kredit')}: {credits.map((c) => Object.values(c).filter((v) => typeof v === 'string').join(', ')).join(' · ')}</span>
          )}
        </div>
      )}
      {views.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className={eyebrow}>{t('Photo skin', 'Kulit dari foto')}</span>
          <span>
            {views.map((v) => `${dash(v.view)}: ${dash(v.triangles)} ${t('triangles', 'segitiga')}${Array.isArray(v.textureSize) ? `, ${v.textureSize[0]}×${v.textureSize[1]} px` : ''}${Array.isArray(v.exposureGain) ? `, gain ${v.exposureGain.map((g) => num(g, 2)).join('/')}` : ''}`).join(' · ')}
          </span>
          <span className="text-zinc-400">{t('The photos laid on the head for display; not a measurement.', 'Foto ditempel ke kepala untuk tampilan; bukan pengukuran.')}</span>
        </div>
      )}
      {r.notice && <p className="leading-relaxed text-zinc-500">{r.notice}</p>}
    </div>
  );
}
