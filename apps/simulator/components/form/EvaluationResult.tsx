'use client';
import type { EvaluationOutput, GradingTier } from '@/lib/types/form';
import { dimensionRows } from '@/lib/breakdown';
import { card, eyebrow } from '@/components/ui';
import { useLang } from '@/lib/i18n';
import { Pill, Section, dash, humanize, list, num, severityTone } from '@/components/photo/TabShell';

/**
 * A form evaluation: profile, total, per-dimension scores with their grade,
 * the main concern, conditions and the answers it was scored from. Numbers
 * are shown as the engine sent them; no scale is assumed for them.
 */
export function EvaluationResult({ r }: { r: EvaluationOutput }) {
  const { t } = useLang();
  const dims = dimensionRows(r);
  const tiers = new Map(list<GradingTier>(r.skin_grading_tiers).filter((t) => typeof t === 'object').map((t) => [t.dimension_key ?? '', t]));
  const conditions = Object.entries(r.customer_condition && typeof r.customer_condition === 'object' ? r.customer_condition : {}).filter(([, v]) => v === true);
  const subs = Object.entries(r.sub_classification && typeof r.sub_classification === 'object' ? r.sub_classification : {});
  const vision = Object.entries(r.vision_signals_used && typeof r.vision_signals_used === 'object' ? r.vision_signals_used : {});
  const answers = list<{ question?: string; answer?: unknown; score?: number }>(r.answer_list).filter((a) => typeof a === 'object');
  const profile = r.skin_profile ?? {};
  const axes = Object.entries(profile.axis_values && typeof profile.axis_values === 'object' ? profile.axis_values : {});

  const warnings = list<{ code?: string; message?: string }>(r.warnings).filter((w) => typeof w === 'object');
  // Each unscored dimension already says so on its card; the rest are listed above the scores.
  const shown = warnings.filter((w) => w.code !== 'DIMENSION_NOT_SCORED');
  const partialProfile = warnings.some((w) => w.code === 'PROFILE_INCOMPLETE');

  if (r.error) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">{r.error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className={`${card} flex flex-col gap-4 bg-gradient-to-br from-white to-zinc-50 p-5 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex flex-col gap-1.5">
          <span className={eyebrow}>{t('Skin profile', 'Profil kulit')}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">{profile.code || '—'}</span>
            {partialProfile && <Pill className="bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">{t('Partial — some axes not scored', 'Sebagian — beberapa sumbu tidak dinilai')}</Pill>}
            {profile.name && <span className="text-sm text-zinc-500">{profile.name}</span>}
          </div>
          {axes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {axes.map(([axis, v]) => <Pill key={axis} className="bg-zinc-100 text-zinc-600">{humanize(axis.toLowerCase())}: <b className="ml-1">{String(v)}</b></Pill>)}
            </div>
          )}
          {profile.description && <p className="max-w-prose text-xs leading-relaxed text-zinc-500">{profile.description}</p>}
          {(r.ruleset_code || r.dry_run) && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
              {r.ruleset_code && <span>{t('Scored by ruleset', 'Dinilai dengan ruleset')} <code className="font-mono text-zinc-700">{r.ruleset_code}</code></span>}
              {r.dry_run && <Pill className="bg-emerald-50 text-emerald-700">{t('Dry run · not saved', 'Dry run · tidak disimpan')}</Pill>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-start rounded-xl bg-white px-4 py-3 ring-1 ring-zinc-200 sm:items-end">
          <span className={eyebrow}>{t('Total score', 'Skor total')}</span>
          <span className="text-3xl font-semibold tabular-nums tracking-tight">{num(r.total_score)}</span>
        </div>
      </div>

      {shown.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
          {shown.map((w, i) => <li key={`${w.code}-${i}`}><span className="font-mono">{w.code}</span>{w.message ? ` — ${w.message}` : ''}</li>)}
        </ul>
      )}

      <Section title={t('Dimensions', 'Dimensi')} aside={<span className="text-[11px] text-zinc-400">{dims.length}</span>}>
        {dims.length === 0 ? <p className="text-xs text-zinc-500">—</p> : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {dims.map((d) => {
              const tier = tiers.get(d.key);
              return (
                <div key={d.key} className={`${card} flex flex-col gap-2 p-3.5 ${d.scored ? '' : 'bg-zinc-50'}`}>
                  <span className="truncate text-xs font-medium text-zinc-600">{humanize(d.key)}</span>
                  {d.scored
                    ? <span className="text-2xl font-semibold tabular-nums tracking-tight">{num(d.score)}</span>
                    : <span className="text-sm font-medium text-zinc-500">{t('Not scored', 'Tidak dinilai')}</span>}
                  {d.scored && tier?.grade_name && <Pill className={`self-start ${severityTone(tier.severity)}`}>{tier.grade_name}</Pill>}
                  {d.contributions.length > 0 && (
                    <ul className="flex flex-col gap-1 border-t border-zinc-100 pt-2 text-[11px]">
                      {d.contributions.map(([src, c]) => (
                        <li key={src} className="flex items-center gap-2">
                          <span className="w-14 truncate text-zinc-500">{humanize(src)}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                            <span className="block h-full rounded-full bg-zinc-700" style={{ width: `${Math.max(0, Math.min(1, c.weight ?? 0)) * 100}%` }} />
                          </span>
                          <span className="w-9 text-right tabular-nums text-zinc-500">{typeof c.weight === 'number' ? `${Math.round(c.weight * 100)}%` : '—'}</span>
                          <span className="w-9 text-right font-medium tabular-nums">{num(c.score)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {d.missing.length > 0 && (
                    <span className="text-[11px] text-amber-700">{t('Missing', 'Tidak ada')}: {d.missing.map(humanize).join(', ')}</span>
                  )}
                  {!d.scored && d.reason && <span className="text-[11px] text-zinc-500">{d.reason}</span>}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {(r.skin_concern?.label || subs.length > 0 || conditions.length > 0) && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {r.skin_concern?.label && (
            <div className={`${card} flex flex-col gap-1 p-4`}>
              <span className={eyebrow}>{t('Main concern', 'Fokus utama')}</span>
              <span className="text-lg font-semibold">{r.skin_concern.label}</span>
              <span className="text-xs text-zinc-500">{humanize(dash(r.skin_concern.dimension))} · {t('score', 'skor')} {num(r.skin_concern.score)}</span>
            </div>
          )}
          {(subs.length > 0 || conditions.length > 0) && (
            <div className={`${card} flex flex-col gap-2 p-4`}>
              <span className={eyebrow}>{t('Classification & conditions', 'Klasifikasi & kondisi')}</span>
              <div className="flex flex-wrap gap-1.5">
                {subs.map(([k, v]) => <Pill key={k} className="bg-zinc-900 text-white">{String(v)}</Pill>)}
                {conditions.map(([k]) => <Pill key={k} className="bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200">{humanize(k)}</Pill>)}
              </div>
            </div>
          )}
        </div>
      )}

      {vision.length > 0 && (
        <Section title={t('Vision signals used', 'Sinyal visi yang dipakai')} aside={<span className="text-[11px] text-zinc-400">{vision.length}</span>}>
          <div className="flex flex-wrap gap-2">
            {vision.map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs">
                {humanize(k)} <b className="tabular-nums">{num(v)}</b>
              </span>
            ))}
          </div>
        </Section>
      )}

      {answers.length > 0 && (
        <Section title={t('Answers', 'Jawaban')} aside={<span className="text-[11px] text-zinc-400">{answers.length}</span>}>
          <div className="overflow-hidden rounded-xl border border-zinc-100">
            <table className="w-full text-xs">
              <tbody>
                {answers.map((a, i) => (
                  <tr key={`${a.question}-${i}`} className="border-t border-zinc-100 first:border-t-0">
                    <td className="w-24 px-3 py-2 font-mono text-zinc-500">{dash(a.question)}</td>
                    <td className="px-3 py-2">{Array.isArray(a.answer) ? a.answer.join(', ') : dash(a.answer)}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{num(a.score, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
      {r.assessment_id && <p className="text-[11px] text-zinc-400">Assessment <span className="font-mono">{r.assessment_id}</span>{r.evaluated_at ? ` · ${r.evaluated_at}` : ''}</p>}
    </div>
  );
}
