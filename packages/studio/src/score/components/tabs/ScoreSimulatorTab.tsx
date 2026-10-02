'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { InfoTooltip, usePersistentState } from '@gateway-experience/shared';
import type { ScoreRuleset, RulesetSimulationResponse } from '../../types';
import { getSafetyFlags } from '../../../form/api';

interface ScoreSimulatorTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  conditions?: { code: string; name: string; description?: string }[];
}

const card = 'rounded-lg border border-border bg-card p-4';
const sliderCls =
  'w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]';

const sourceLabel: Record<string, string> = {
  form: 'Form',
  vision: 'Vision',
  blend: 'Blend',
  none: 'No data',
};

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
        ...Object.keys(s.field_mapping || {}),
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

  // field_mapping (registered on the ruleset from the Blending tab) is the
  // authoritative source for which axes are form-driven, vision-driven, or
  // both — the backend's stage2Score reads it the same way for /evaluate and
  // /simulate.
  const fieldMapping = useMemo<Record<string, { form?: string; vision?: string }>>(() => {
    try {
      return JSON.parse(activeRuleset?.schema || '{}').field_mapping || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);

  // Age is never a generic 0-100 slider — it's always the dedicated Age
  // input below, sent as age_years and resolved server-side via the same
  // AgeOverThirty check /evaluate uses.
  const ageAxisKeys = useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.form === 'age_over_30'), [rulesetDims, fieldMapping]);
  // Questionnaire result: every axis with a form source, other than the
  // age-driven ones above.
  const formDims = useMemo(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && (fieldMapping[d]?.form || !fieldMapping[d]?.vision)),
    [rulesetDims, fieldMapping, ageAxisKeys],
  );
  // Vision result: every axis with a vision source.
  const visionDims = useMemo(() => rulesetDims.filter((d) => fieldMapping[d]?.vision), [rulesetDims, fieldMapping]);

  // Slider values survive a reload. Keyed by dimension and never pruned:
  // every read goes through formDims/visionDims with a 50 default, so a
  // value for an axis the current ruleset lacks is simply not used — and is
  // still there when a ruleset that has it is selected again.
  const [questionnaireValues, setQuestionnaireValues] = usePersistentState<Record<string, number>>(
    'xg.scoreEngine.simulator.questionnaireValues',
    {},
  );
  const [visionValues, setVisionValues] = usePersistentState<Record<string, number>>(
    'xg.scoreEngine.simulator.visionValues',
    {},
  );
  const [respondentAge, setRespondentAge] = usePersistentState('xg.scoreEngine.simulator.respondentAge', 25);

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

  // form_survey_code — set once on the ruleset's Setup tab — is this
  // ruleset's own declared source. Same read pattern as fieldMapping above.
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

  // Last-resort source, only when neither the ruleset nor its linked survey
  // declares any flag at all — the full registered catalog (Reference Data ->
  // Customer Conditions), never a hardcoded pair, so a brand-new ruleset
  // still shows every flag someone could conceivably pick, not just two.
  const [catalogSafetyFlags, setCatalogSafetyFlags] = useState<string[]>([]);
  useEffect(() => {
    getSafetyFlags()
      .then((rows) => setCatalogSafetyFlags(rows.map((r) => r.code)))
      .catch(() => setCatalogSafetyFlags([]));
  }, []);

  const allSafetyFlags = useMemo(
    () => Array.from(new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags],
  );

  // Every toggle ever set (persisted, never pruned); what is shown and sent
  // is only the flags the current ruleset/survey/catalog actually offers.
  const [conditionChoices, setConditionChoices] = usePersistentState<Record<string, boolean>>(
    'xg.scoreEngine.simulator.conditions',
    {},
  );
  const selectedConditions = useMemo(() => {
    const keys = allSafetyFlags.length > 0 ? allSafetyFlags : catalogSafetyFlags;
    const out: Record<string, boolean> = {};
    for (const k of keys) out[k] = conditionChoices[k] ?? false;
    return out;
  }, [allSafetyFlags, catalogSafetyFlags, conditionChoices]);

  const [simResponse, setSimResponse] = useState<RulesetSimulationResponse | null>(null);
  const [copiedReq, setCopiedReq] = useState(false);

  const SIMULATE_PATH = '/core/score-engine/simulate';

  // form_scores / vision_scores are HEALTH-space (100 = optimal), exactly
  // what the sliders below are labelled — the backend does the concern-space
  // conversion and the real fusion via the same stage2Score /evaluate uses,
  // so this tab no longer computes a blended value itself.
  const formScores = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of formDims) out[d] = questionnaireValues[d] ?? 50;
    return out;
  }, [formDims, questionnaireValues]);

  const visionScores = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of visionDims) out[d] = visionValues[d] ?? 50;
    return out;
  }, [visionDims, visionValues]);

  const ageYears = ageAxisKeys.length > 0 ? respondentAge : undefined;

  // The exact body this tab POSTs — offered as a copy so the same run can be
  // replayed from the API client / Workbench or shared with the team.
  const requestBody = useMemo(
    () =>
      JSON.stringify(
        {
          schema: activeRuleset?.schema ?? '',
          form_scores: formScores,
          vision_scores: visionScores,
          age_years: ageYears,
          customer_condition: selectedConditions,
        },
        null,
        2,
      ),
    [activeRuleset, formScores, visionScores, ageYears, selectedConditions],
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
          form_scores: formScores,
          vision_scores: visionScores,
          age_years: ageYears,
          customer_condition: selectedConditions,
        }),
      });
      if (res.ok) setSimResponse(await res.json());
    } catch (err) {
      console.error('Simulation request failed', err);
    }
  }, [activeRuleset, formScores, visionScores, ageYears, selectedConditions]);

  useEffect(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);

  const result = simResponse?.result;
  const dimensions = result?.dimensions || {};
  const skinProfile = result?.skin_profile;
  const subClassification = result?.sub_classification || {};
  const warnings = result?.warnings || [];
  const totalScore = Math.round(result?.total_score || 0);
  const profileCode = skinProfile?.code || 'CUSTOM';
  const profileName = skinProfile?.name || 'Answer to see a profile';

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
                content="Bukan slider form biasa — dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dikirim sebagai age_years, dipakai axis: aging."
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
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>≤30 = sehat</span>
              <span>&gt;30 = faktor W</span>
            </div>
          </div>
        )}

        {formDims.length > 0 && (
          <div className={card + ' space-y-3'}>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Questionnaire result</h3>
              <InfoTooltip content="Per-dimensi, hanya yang dihitung dari kuisioner (form_source). 0 = parah, 100 = sehat." label="About questionnaire result" />
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
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>0 = parah</span>
                    <span>100 = sehat</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {visionDims.length > 0 && (
          <div className={card + ' space-y-3'}>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">Vision result</h3>
              <InfoTooltip content="Per-dimensi, hanya yang dihitung dari foto vendor (vision_source). 0 = parah, 100 = sehat." label="About vision result" />
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
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>0 = parah</span>
                    <span>100 = sehat</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={card + ' space-y-2'}>
          <h3 className="text-sm font-bold text-foreground">Safety flags</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(selectedConditions).map(([key, isChecked]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setConditionChoices((p) => ({ ...p, [key]: !isChecked }))
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
            <div className="flex items-center justify-center gap-1.5">
              {skinProfile?.category && (
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {skinProfile.category}
                </span>
              )}
              {skinProfile && !skinProfile.complete && (
                <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5">
                  Incomplete
                </span>
              )}
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground font-mono my-1">
              {profileCode}
            </div>
            <div className="text-xs font-semibold text-foreground">{profileName}</div>
            {skinProfile?.description && (
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {skinProfile.description}
              </p>
            )}
          </div>

          {skinProfile?.axis_values && Object.keys(skinProfile.axis_values).length > 0 && (
            <div className="mt-4">
              <h4 className="text-[11px] font-semibold text-muted-foreground mb-2">
                Axis codes
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(skinProfile.axis_values).map(([axis, val]) => (
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

          <div className="mt-4 rounded-md border border-border bg-muted/20 p-2.5">
            <div className="text-[10px] text-muted-foreground">Overall score</div>
            <div className="text-sm font-bold text-foreground font-mono mt-0.5">{totalScore}</div>
            <div className="text-[10px] text-muted-foreground">100 = sehat</div>
          </div>

          {warnings.length > 0 && (
            <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs space-y-1">
              <div className="text-[10px] font-semibold text-amber-500">Warnings</div>
              {warnings.map((w) => (
                <div key={w} className="text-amber-500/90 font-mono text-[11px]">
                  {w}
                </div>
              ))}
            </div>
          )}

          {Object.keys(subClassification).length > 0 && (
            <div className="mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1">
              <div className="text-[10px] text-muted-foreground mb-0.5">Sub-classification</div>
              {Object.entries(subClassification).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-foreground">{k}</span>
                  <span className="text-muted-foreground font-mono">{v === null ? '—' : String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {Object.keys(dimensions).length > 0 && (
          <div className={card}>
            <h3 className="text-sm font-bold text-foreground mb-3">Dimension breakdown</h3>
            <div className="space-y-2">
              {Object.entries(dimensions).map(([dimKey, d]) => (
                <div
                  key={dimKey}
                  className="rounded-md border border-border bg-muted/20 p-2.5 flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-foreground font-semibold truncate">{dimKey}</div>
                    <div className="text-muted-foreground text-[10px]">
                      {sourceLabel[d.source] || d.source}
                      {d.source === 'blend' && d.weight
                        ? ` (form ${Math.round(d.weight.form * 100)}% / vision ${Math.round(d.weight.vision * 100)}%)`
                        : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-muted-foreground text-[10px]" title="form_score">
                      F {d.form_score ?? '—'}
                    </span>
                    <span className="text-muted-foreground text-[10px]" title="vision_score">
                      V {d.vision_score ?? '—'}
                    </span>
                    <span className="text-beak font-semibold" title="final_score">
                      {d.final_score ?? '—'}
                    </span>
                    {d.axis && (
                      <span className="text-foreground font-semibold bg-card border border-border rounded px-1.5 py-0.5">
                        {d.axis}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
