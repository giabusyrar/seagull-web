'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { SeverityBadge, InfoTooltip } from '@gateway-experience/shared';
import type { ScoreRuleset, RulesetSimulationResponse } from '../../types';

interface ScoreSimulatorTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  conditions?: { code: string; name: string; description?: string }[];
}

const card = 'rounded-lg border border-border bg-card p-4';
const sliderCls =
  'w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]';

export const ScoreSimulatorTab: React.FC<ScoreSimulatorTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;

  // Dimensions to expose as sliders — read from the selected ruleset's schema
  // (dimension_weights / concern_labels / axis_codes keys), PLUS any
  // dimension_scores.<key> a custom decisionTableNode reads (e.g. a
  // vision/DOB-only axis like 'wrinkle' or 'age_over_30' that has no form
  // dimension and so never appears in dimension_weights/concern_labels/
  // axis_codes) — otherwise the simulator silently can't show that axis's
  // letter at all, even though the ruleset computes it correctly.
  const rulesetDims = useMemo<string[]>(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = new Set<string>([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {}),
      ]);
      for (const node of s.nodes || []) {
        if (node?.type !== 'decisionTableNode') continue;
        const content = typeof node.content === 'string' ? JSON.parse(node.content) : node.content;
        for (const input of content?.inputs || []) {
          const field = String(input?.field || '');
          if (field.startsWith('dimension_scores.')) {
            keys.add(field.slice('dimension_scores.'.length));
          }
        }
      }
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);

  // field_mapping (registered on the ruleset from the Blending tab) is now
  // the authoritative source for which axes are form-driven, vision-driven,
  // or both — this replaces the older per-slider heuristics.
  const fieldMapping = useMemo<Record<string, { form?: string; vision?: string }>>(() => {
    try {
      return JSON.parse(activeRuleset?.schema || '{}').field_mapping || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);
  const dimensionFusion = useMemo<Record<string, { form: number; vision: number }>>(() => {
    try {
      return JSON.parse(activeRuleset?.schema || '{}').dimension_fusion || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);

  // Age is never a generic 0-100 slider — it's always the dedicated Age
  // input below, converted to a health value (<=30 -> 100, >30 -> 0).
  const ageAxisKeys = useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.form === 'age_over_30'), [rulesetDims, fieldMapping]);
  // Questionnaire result: every axis with a form source, other than the
  // age-driven ones above.
  const formDims = useMemo(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && (fieldMapping[d]?.form || !fieldMapping[d]?.vision)),
    [rulesetDims, fieldMapping, ageAxisKeys],
  );
  // Vision result: every axis with a vision source.
  const visionDims = useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.vision), [rulesetDims, fieldMapping]);
  const formDimsKey = formDims.join(',');
  const visionDimsKey = visionDims.join(',');

  const [questionnaireValues, setQuestionnaireValues] = useState<Record<string, number>>({});
  const [visionValues, setVisionValues] = useState<Record<string, number>>({});
  const [respondentAge, setRespondentAge] = useState(25);

  useEffect(() => {
    setQuestionnaireValues((prev) => {
      const next: Record<string, number> = {};
      for (const d of formDims) next[d] = prev[d] ?? 50;
      return next;
    });
  }, [formDimsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setVisionValues((prev) => {
      const next: Record<string, number> = {};
      for (const d of visionDims) next[d] = prev[d] ?? 50;
      return next;
    });
  }, [visionDimsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dimension scores: the FINAL, health-oriented (100 = optimal) number per
  // axis — questionnaire and vision already normalised and blended by each
  // axis's own form/vision weight (dimension_fusion). This is what actually
  // drives the bands/axis letters below, computed the same way /evaluate
  // does it, just client-side so the preview is accurate even though
  // /simulate itself doesn't run the fusion step.
  const dimensionScores = useMemo<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const d of rulesetDims) {
      const isAgeForm = ageAxisKeys.includes(d);
      const formVal = isAgeForm ? (respondentAge <= 30 ? 100 : 0) : questionnaireValues[d];
      const visionVal = visionValues[d];
      const df = dimensionFusion[d];
      if (df) {
        const fw = typeof df.form === 'number' ? df.form : 0.5;
        const vw = typeof df.vision === 'number' ? df.vision : 0.5;
        out[d] = Math.round(((formVal ?? 50) * fw + (visionVal ?? 50) * vw) * 10) / 10;
      } else if (fieldMapping[d]?.vision && !fieldMapping[d]?.form) {
        out[d] = visionVal ?? 50;
      } else {
        out[d] = formVal ?? 50;
      }
    }
    return out;
  }, [rulesetDims, ageAxisKeys, questionnaireValues, visionValues, dimensionFusion, fieldMapping, respondentAge]);

  // Safety flag keys declared directly on the ruleset schema (safety_flags),
  // same pattern as rulesetDims above.
  const rulesetSafetyFlags = useMemo<string[]>(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      if (Array.isArray(s.safety_flags)) {
        return s.safety_flags.map((f: unknown) =>
          typeof f === 'string' ? f : (f as { key: string }).key,
        );
      }
      return [];
    } catch {
      return [];
    }
  }, [activeRuleset]);

  // form_survey_code / vision_source_code — set once on the ruleset's Setup
  // tab — are this ruleset's own declared source. Same read pattern as
  // fieldMapping/dimensionFusion above.
  const formSurveyCode = useMemo<string>(() => {
    try {
      return JSON.parse(activeRuleset?.schema || '{}').form_survey_code || '';
    } catch {
      return '';
    }
  }, [activeRuleset]);

  // Safety flag keys actually tagged on answer choices ("+ safety flags" in
  // the Questionnaire builder — QuestionnaireModal.tsx, stored as each
  // choice's conditionMap). Scoped to just the survey this ruleset declares
  // as its form_survey_code (its own actual source), falling back to every
  // questionnaire for the same brand/application only when the ruleset
  // hasn't set one yet.
  const [surveySafetyFlags, setSurveySafetyFlags] = useState<string[]>([]);

  useEffect(() => {
    if (!activeRuleset?.brandId || !activeRuleset?.applicationId) {
      setSurveySafetyFlags([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/core/form-engine/survey?brand_id=${encodeURIComponent(activeRuleset.brandId)}&application_id=${encodeURIComponent(activeRuleset.applicationId)}`,
        );
        if (!res.ok) return;
        const allSurveys: { code?: string; schema?: string }[] = await res.json();
        const surveys = formSurveyCode
          ? allSurveys.filter((s) => s.code === formSurveyCode)
          : allSurveys;
        const flags = new Set<string>();
        for (const survey of surveys || []) {
          if (!survey.schema) continue;
          try {
            const parsed = JSON.parse(survey.schema);
            for (const page of parsed.pages || []) {
              for (const el of page.elements || []) {
                for (const choice of el.choices || []) {
                  // Stored as condition_map (snake_case, matching the Go/JSON
                  // survey schema) — conditionMap is also checked in case a
                  // future schema writer uses the camelCase form instead.
                  const conditionMap =
                    typeof choice === 'object' ? choice.condition_map || choice.conditionMap : null;
                  if (conditionMap) Object.keys(conditionMap).forEach((k) => flags.add(k));
                }
              }
            }
          } catch {
            // skip surveys with unparsable schema
          }
        }
        if (!cancelled) setSurveySafetyFlags(Array.from(flags));
      } catch {
        if (!cancelled) setSurveySafetyFlags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRuleset?.brandId, activeRuleset?.applicationId, formSurveyCode]);

  const allSafetyFlags = useMemo(
    () => Array.from(new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags],
  );

  const [selectedConditions, setSelectedConditions] = useState<Record<string, boolean>>({});

  // Re-seed the safety flag toggles whenever the merged flag list changes.
  // Falls back to the previous hardcoded pair only when nothing was found
  // anywhere, so older rulesets/questionnaires without flags still show something.
  useEffect(() => {
    setSelectedConditions((prev) => {
      const keys = allSafetyFlags.length > 0 ? allSafetyFlags : ['is_pregnant', 'uses_retinol'];
      const next: Record<string, boolean> = {};
      for (const k of keys) next[k] = prev[k] ?? false;
      return next;
    });
  }, [allSafetyFlags]);

  const [simResponse, setSimResponse] = useState<RulesetSimulationResponse | null>(null);
  const [copiedReq, setCopiedReq] = useState(false);

  const SIMULATE_PATH = '/core/score-engine/simulate';

  // The exact body this tab POSTs — offered as a copy so the same run can be
  // replayed from the API client / Workbench or shared with the team.
  const requestBody = useMemo(
    () =>
      JSON.stringify(
        {
          schema: activeRuleset?.schema ?? '',
          dimension_scores: dimensionScores,
          customer_condition: selectedConditions,
        },
        null,
        2,
      ),
    [activeRuleset, dimensionScores, selectedConditions],
  );

  const copyRequest = () => {
    navigator.clipboard?.writeText(requestBody);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 1500);
  };

  const runSimulation = useCallback(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const res = await fetch(SIMULATE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema: activeRuleset.schema,
          dimension_scores: dimensionScores,
          customer_condition: selectedConditions,
        }),
      });
      if (res.ok) setSimResponse(await res.json());
    } catch (err) {
      console.error('Simulation request failed', err);
    }
  }, [activeRuleset, dimensionScores, selectedConditions]);

  useEffect(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);

  const axisValues = simResponse?.result?.axis_values || {};
  const traits = simResponse?.result?.traits || {};
  const scoreRange: string = (simResponse?.result?.score_range as string) || '';
  const severityLevel: string = (simResponse?.result?.severity_level as string) || '';
  const skinConcern = simResponse?.result?.skin_concern as
    | { dimension?: string; label?: string; score?: number }
    | undefined;

  // Which axes this ruleset actually PRODUCES a letter for — i.e. keys with
  // an axis_codes entry, or a custom decisionTableNode output field
  // targeting axis_values.<KEY>. Deliberately NOT the same list as
  // rulesetDims (which also includes vision/DOB-only *inputs* like
  // wrinkle/age_over_30 that feed the Aging axis but don't get their own
  // letter) — using rulesetDims here would tack extra garbage characters
  // onto the generated code.
  const axisOutputDims = useMemo<string[]>(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = new Set<string>(Object.keys(s.axis_codes || {}));
      for (const node of s.nodes || []) {
        if (node?.type !== 'decisionTableNode') continue;
        const content = typeof node.content === 'string' ? JSON.parse(node.content) : node.content;
        for (const output of content?.outputs || []) {
          const field = String(output?.field || '');
          if (field.startsWith('axis_values.')) {
            keys.add(field.slice('axis_values.'.length).toLowerCase());
          }
        }
      }
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);

  // Canonical Baumann Skin Type Indicator axis order: Oiliness, Sensitivity,
  // Pigmentation, Wrinkle (e.g. "OSPW", "DRNT"). Known axes are sorted into
  // this order regardless of the order the schema happens to list them in;
  // any other, non-Baumann axis key (e.g. a future axis this ruleset adds)
  // is appended after, in its existing order.
  const BAUMANN_AXIS_ORDER = ['sebum', 'oiliness', 'sensitivity', 'pigmentation', 'aging', 'wrinkle'];
  const orderedDims = useMemo(() => {
    const known = BAUMANN_AXIS_ORDER.filter((k) => axisOutputDims.includes(k));
    const rest = axisOutputDims.filter((k) => !BAUMANN_AXIS_ORDER.includes(k));
    return [...known, ...rest];
  }, [axisOutputDims]);

  // Baumann-style skin profile code, one letter per axis this ruleset
  // actually produces a letter for. An axis with no computed letter (not
  // yet answered) shows "-" instead of silently dropping out of the code.
  const generatedCode = useMemo(() => {
    if (orderedDims.length === 0) return 'CUSTOM';
    return orderedDims.map((k) => axisValues[k.toUpperCase()] || '-').join('');
  }, [axisValues, orderedDims]);

  const traitsList = useMemo(() => Object.values(traits).filter(Boolean), [traits]);

  const profile = simResponse?.result?.skin_profile;

  // Whether the schema's own skin_profile node (if any) is itself
  // axis-based (Combination Matrix strategy) — if so its code/name are
  // already a real Baumann-style profile and are trusted as-is. Otherwise
  // (Total Score strategy, or no profile node at all) that node's code is
  // just a generic score-range bucket (e.g. "MODERATE") that has nothing to
  // do with the Baumann letters — the axis-composed code takes priority
  // whenever this ruleset has axes at all.
  const profileStrategyIsAxisBased = useMemo(() => {
    try {
      const s = JSON.parse(activeRuleset?.schema || '{}');
      const profileNode = (s.nodes || []).find((n: any) => {
        const c = typeof n?.content === 'string' ? JSON.parse(n.content) : n?.content;
        return (c?.outputs || []).some((o: any) => o?.field === 'skin_profile.code');
      });
      if (!profileNode) return false;
      const c = typeof profileNode.content === 'string' ? JSON.parse(profileNode.content) : profileNode.content;
      return (c?.inputs || []).some((i: any) => String(i?.field || '').startsWith('axis_values.'));
    } catch {
      return false;
    }
  }, [activeRuleset]);

  const hasAxes = axisOutputDims.length > 0;
  const useAxisProfile = hasAxes && !profileStrategyIsAxisBased;
  const profileCode = useAxisProfile ? generatedCode : profile?.code || generatedCode;
  const profileName = useAxisProfile
    ? orderedDims.map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(' · ') || 'Baumann Skin Character'
    : profile?.name || traitsList.join(' · ') || 'Answer to see a profile';
  const totalScore = Math.round(simResponse?.result?.total_score || 0);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* Inputs — fixed ~20rem on the left */}
      <div className="w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0">
        <div className={card + ' space-y-2'}>
          <span className="block text-xs font-semibold text-muted-foreground">Grading model</span>
          <select
            value={activeRuleset?.id || ''}
            onChange={(e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            }}
            className="w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring"
            style={{ colorScheme: 'dark' }}
          >
            {rulesets.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.code} v{r.version})
              </option>
            ))}
          </select>
        </div>

        {ageAxisKeys.length > 0 && (
          <div className={card + ' space-y-2'}>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Usia</h3>
              <InfoTooltip
                content="Bukan slider form biasa — dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dipakai axis: aging."
                label="About Usia"
              />
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">Umur (tahun)</span>
              <span className="text-beak font-semibold font-mono">
                {respondentAge} ({respondentAge <= 30 ? 'sehat' : 'faktor W'})
              </span>
            </div>
            <input
              type="range"
              min={13}
              max={70}
              value={respondentAge}
              onChange={(e) => setRespondentAge(Number(e.target.value))}
              className={sliderCls}
            />
          </div>
        )}

        {formDims.length > 0 && (
          <div className={card + ' space-y-3'}>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Questionnaire result</h3>
              <InfoTooltip content="Per-dimensi, hanya yang dihitung dari kuisioner (form_source)." label="About questionnaire result" />
            </div>
            <div className="space-y-3">
              {formDims.map((dimKey) => (
                <div key={dimKey}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{dimKey}</span>
                    <span className="text-beak font-semibold font-mono">{questionnaireValues[dimKey] ?? 50}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={questionnaireValues[dimKey] ?? 50}
                    onChange={(e) => setQuestionnaireValues((p) => ({ ...p, [dimKey]: Number(e.target.value) }))}
                    className={sliderCls}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {visionDims.length > 0 && (
          <div className={card + ' space-y-3'}>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Vision result</h3>
              <InfoTooltip content="Per-dimensi, hanya yang dihitung dari foto vendor (vision_source)." label="About vision result" />
            </div>
            <div className="space-y-3">
              {visionDims.map((dimKey) => (
                <div key={dimKey}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{dimKey}</span>
                    <span className="text-beak font-semibold font-mono">{visionValues[dimKey] ?? 50}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={visionValues[dimKey] ?? 50}
                    onChange={(e) => setVisionValues((p) => ({ ...p, [dimKey]: Number(e.target.value) }))}
                    className={sliderCls}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={card + ' space-y-3'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Dimension scores</h3>
              <InfoTooltip
                content="Hasil FINAL per axis — sudah lewat normalisasi + blend form/vision sesuai bobot di Blending tab. Read-only, ini yang beneran dipakai buat klasifikasi di bawah."
                label="About dimension scores"
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">overall {totalScore}</span>
          </div>
          <div className="space-y-1.5">
            {Object.keys(dimensionScores).map((dimKey) => (
              <div key={dimKey} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{dimKey}</span>
                <span className="text-beak font-semibold font-mono">{dimensionScores[dimKey]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card + ' space-y-2'}>
          <h3 className="text-sm font-bold text-foreground">Safety flags</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(selectedConditions).map(([key, isChecked]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSelectedConditions((p) => ({ ...p, [key]: !p[key] }))
                }
                className={`p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${
                  isChecked
                    ? 'border-beak/50 bg-beak/10 text-beak'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{key}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isChecked ? 'bg-beak' : 'bg-border'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result — fills the rest */}
      <div className="w-full lg:flex-1 space-y-3 min-w-0">
        <div className={card}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">Result</h3>
            <div className="flex items-center gap-2">
              {simResponse?.performance && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  {simResponse.performance}
                </span>
              )}
              <button
                type="button"
                onClick={copyRequest}
                title={`POST ${SIMULATE_PATH}`}
                className="flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50"
              >
                {copiedReq ? (
                  <Check className="h-3 w-3 text-beak" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedReq ? 'Copied' : 'Copy request'}
              </button>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">POST {SIMULATE_PATH}</p>

          <div className="mt-3 rounded-md border border-border bg-muted/20 p-4 text-center">
            {profile?.category && (
              <span className="text-[10px] font-semibold text-muted-foreground">
                {profile.category}
              </span>
            )}
            <div className="text-2xl font-black tracking-tight text-foreground font-mono my-1">
              {profileCode}
            </div>
            <div className="text-xs font-semibold text-foreground">{profileName}</div>
            {profile?.description && (
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {profile.description}
              </p>
            )}
            {traitsList.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border">
                {traitsList.map((t) => (
                  <span
                    key={String(t)}
                    className="text-[11px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border"
                  >
                    {String(t)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {Object.keys(axisValues).length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-semibold text-muted-foreground mb-2">
                Axis codes
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(axisValues).map(([axis, val]) => (
                  <div
                    key={axis}
                    className="min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center"
                  >
                    <div className="text-muted-foreground text-[10px] truncate">{axis}</div>
                    <div className="text-sm font-bold text-beak font-mono mt-0.5">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Overall score</div>
              <div className="text-sm font-bold text-foreground font-mono mt-0.5">{totalScore}</div>
              <div className="text-[10px] text-muted-foreground">100 = optimal</div>
            </div>
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Score Range</div>
              <div className="text-sm font-semibold text-foreground mt-0.5">{scoreRange || '—'}</div>
            </div>
            <div className="min-w-[8rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] text-muted-foreground">Severity Level</div>
              <div className="text-sm font-semibold text-beak mt-0.5">{severityLevel || '—'}</div>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs">
            <div className="text-[10px] text-muted-foreground mb-0.5">Skin Concern</div>
            {skinConcern ? (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{skinConcern.label}</span>
                <span className="text-muted-foreground font-mono">
                  {skinConcern.dimension} · {Math.round(skinConcern.score ?? 0)}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">No dominant concern (optimal)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
