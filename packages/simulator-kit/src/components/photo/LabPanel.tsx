'use client';
import { LAB_SITES, chromaHue, labReport, labToHex, type LabSite } from '../../lib/lab';
import { useLang } from '../../lib/i18n';
import { humanize, num, Section } from './TabShell';

const SITE_LABEL: Record<'en' | 'id', Record<LabSite, string>> = {
  en: { skin: 'Skin', lip: 'Lip', iris: 'Iris', hair: 'Hair' },
  id: { skin: 'Kulit', lip: 'Bibir', iris: 'Iris', hair: 'Rambut' },
};

/** The engine's measured CIELAB (D65) per site, or why there is none. */
export function LabPanel({ result }: { result: unknown }) {
  const { lang, t } = useLang();
  const lab = labReport(result);
  return (
    <Section title="CIELAB (D65)">
      {!lab ? (
        <p className="rounded-xl border border-dashed border-zinc-200 px-3.5 py-3 text-xs leading-relaxed text-zinc-500">
          {t('Core did not return the Lab readings. It only does when core-engine runs with COLOUR_DEBUG_ENABLED=true; the simulator already asks for them (debug=1).',
            'Core tidak mengirim nilai Lab. Nilai itu hanya dikirim bila core-engine berjalan dengan COLOUR_DEBUG_ENABLED=true; simulator sudah memintanya (debug=1).')}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-xs tabular-nums">
              <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">{t('Site', 'Area')}</th>
                  <th className="px-3 py-2 text-right font-semibold">L*</th>
                  <th className="px-3 py-2 text-right font-semibold">a*</th>
                  <th className="px-3 py-2 text-right font-semibold">b*</th>
                  <th className="px-3 py-2 text-right font-semibold">C*</th>
                  <th className="px-3 py-2 text-right font-semibold">h°</th>
                </tr>
              </thead>
              <tbody>
                {LAB_SITES.map((s) => {
                  const v = lab.sites[s];
                  const ch = v && chromaHue(v);
                  return (
                    <tr key={s} className="border-t border-zinc-100">
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2 font-medium text-zinc-700">
                          {v
                            ? <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-zinc-900/10" style={{ background: labToHex(v) }} title={t('Approximate on screen (sRGB)', 'Perkiraan di layar (sRGB)')} />
                            : <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-zinc-300" />}
                          {SITE_LABEL[lang][s]}
                        </span>
                      </td>
                      {v && ch
                        ? [v[0], v[1], v[2], ch.c, ch.h].map((x, i) => <td key={i} className="px-3 py-2 text-right font-semibold text-zinc-900">{num(x, i === 4 ? 0 : 1)}</td>)
                        : <td colSpan={5} className="px-3 py-2 text-right text-zinc-400">{t('not measured', 'tidak diukur')}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {lab.lPerSite.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lab.lPerSite.map(([site, l]) => (
                <span key={site} className={`rounded-full px-2.5 py-1 text-[11px] ${lab.patchesUsed.length && !lab.patchesUsed.includes(site) ? 'bg-zinc-50 text-zinc-400 line-through' : 'bg-zinc-100 text-zinc-700'}`}
                  title={lab.patchesUsed.length && !lab.patchesUsed.includes(site) ? t('Patch not used for the skin value', 'Patch tidak dipakai untuk nilai kulit') : undefined}>
                  {humanize(site)} <span className="font-semibold tabular-nums">L* {num(l, 1)}</span>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {lab.skinITA !== undefined && <>{t('Skin', 'Kulit')} ITA° {num(lab.skinITA, 1)} · </>}
            {lab.bMinusA !== undefined && <>b* − a* {num(lab.bMinusA, 2)} · </>}
            {lab.illuminant?.method && <>{t('White balance', 'White balance')}: <span className="font-mono">{lab.illuminant.method}</span>{lab.illuminant.residual != null && ` (${num(lab.illuminant.residual, 2)})`} · </>}
            {t('Swatches are the nearest sRGB colour, for orientation only.', 'Swatch adalah warna sRGB terdekat, hanya sebagai gambaran.')}
          </p>
        </>
      )}
    </Section>
  );
}
