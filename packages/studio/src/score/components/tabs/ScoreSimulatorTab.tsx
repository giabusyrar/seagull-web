'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { InfoTooltip, usePersistentState, useHostRoutes } from '@gateway-experience/shared';
import type { ScoreRuleset, RulesetSimulationResponse, DimensionBlend } from '../../types';
import { AGE_FIELD, AGE_FIELD_CUTOFF_YEARS, FORM_SOURCE, VISION_SOURCE } from '../../types';
import { readBlend } from '../../utils/blend';
import { getSafetyFlags } from '../../../form/api';
import { SIMULATE_PATH, fetchTenantSurveys, simulateRuleset } from '../../api';
import { safetyFlagsFromSurveys } from '../../utils/safety-flags';

interface ScoreSimulatorTabProps {
  rulesets: ScoreRuleset[];
  selectedRuleset: ScoreRuleset | null;
  onSelectRuleset: (ruleset: ScoreRuleset) => void;
  conditions?: { code: string; name: string; description?: string }[];
}

const card = 'rounded-lg border border-border bg-card p-4';
const sliderCls =
  'w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]';
/** An input the operator has not set: drawn faded, its thumb parked mid-track
 *  only because a range input must sit somewhere. The value is not sent. */
const unsetSliderCls = sliderCls + ' opacity-40';

/** Health-score slider bounds: the 0-100 health scale /simulate takes. */
const SCORE_MIN = 0;
const SCORE_MAX = 100;
/** Where an unset slider's thumb rests. Display only — never sent. */
const UNSET_THUMB = (SCORE_MIN + SCORE_MAX) / 2;
/** Age slider bounds: only the span the control can be dragged across. Core
 *  applies its own check to whatever age is sent. */
const AGE_SLIDER_MIN = 13;
const AGE_SLIDER_MAX = 70;
/** Where the unset age slider's thumb rests. Display only — never sent. */
const AGE_UNSET_THUMB = AGE_FIELD_CUTOFF_YEARS;

/** Sets `key` to `v`, or removes it when `v` is undefined (unset). */
function withValue(prev: Record<string, number>, key: string, v: number | undefined): Record<string, number> {
  const next = { ...prev };
  if (v === undefined) delete next[key];
  else next[key] = v;
  return next;
}

/**
 * One health-score input that can be "not set". Untouched, it shows "not set"
 * and is left out of the request, so /simulate scores the dimension the way
 * /evaluate scores a missing answer (its weight re-shared, or not scored)
 * instead of as if the respondent had answered a made-up value. Clicking or
 * dragging the track sets it; "clear" unsets it again.
 */
const ScoreInput: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}> = ({ label, value, onChange }) => {
  const set = value !== undefined;
  const commit = (e: React.SyntheticEvent<HTMLInputElement>) => onChange(Number(e.currentTarget.value));
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-foreground">{label}</span>
        {set ? (
          <span className="flex items-center gap-1.5">
            <span className="text-beak font-semibold font-mono">{value}</span>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[10px] text-muted-foreground underline hover:text-foreground"
              title="Unset: send this dimension as not answered"
            >
              clear
            </button>
          </span>
        ) : (
          <span className="text-[10px] italic text-muted-foreground" title="Not sent to /simulate">
            not set
          </span>
        )}
      </div>
      <input
        type="range"
        min={SCORE_MIN}
        max={SCORE_MAX}
        value={value ?? UNSET_THUMB}
        onChange={commit}
        onPointerUp={commit}
        aria-label={set ? `${label}: ${value}` : `${label}: not set`}
        className={set ? sliderCls : unsetSliderCls}
      />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>{SCORE_MIN} = parah</span>
        <span>{SCORE_MAX} = sehat</span>
      </div>
    </div>
  );
};


export const ScoreSimulatorTab: React.FC<ScoreSimulatorTabProps> = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
}) => {
  const hostRoutes = useHostRoutes();
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
        ...Object.keys(readBlend(s).dims),
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

  // The ruleset's blend (the Blending tab's sources + dimension_inputs, or a
  // legacy ruleset read the way core reads it) says which axes take which
  // sources — the backend's stage2Score reads it the same way for /evaluate
  // and /simulate.
  const blend = useMemo(() => {
    try {
      return readBlend(JSON.parse(activeRuleset?.schema || '{}'), rulesetDims);
    } catch {
      return readBlend({});
    }
  }, [activeRuleset, rulesetDims]);
  const fieldOf = useCallback(
    (d: string, source: string) => blend.dims[d]?.inputs.find((i) => i.source === source)?.field,
    [blend],
  );

  // Age is never a generic 0-100 slider — it's always the dedicated Age
  // input below, sent as age_years and resolved server-side via the same
  // AgeOverThirty check /evaluate uses.
  const ageAxisKeys = useMemo(() => rulesetDims.filter((d) => fieldOf(d, FORM_SOURCE) === AGE_FIELD), [rulesetDims, fieldOf]);
  // Questionnaire result: every axis with a form input, other than the
  // age-driven ones above.
  const formDims = useMemo(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && !!fieldOf(d, FORM_SOURCE)),
    [rulesetDims, fieldOf, ageAxisKeys],
  );
  // Vision result: every axis with a vision input.
  const visionDims = useMemo(() => rulesetDims.filter((d) => !!fieldOf(d, VISION_SOURCE)), [rulesetDims, fieldOf]);
  // Other sources (a device, a lab): /simulate takes no signals for them yet,
  // so they always count as missing here.
  const otherSources = useMemo(
    () => Array.from(new Set(Object.values(blend.dims).flatMap((d) => d.inputs.map((i) => i.source)))).filter((s) => s !== FORM_SOURCE && s !== VISION_SOURCE),
    [blend],
  );

  // Slider values survive a reload. Keyed by dimension and never pruned:
  // every read goes through formDims/visionDims, so a value for an axis the
  // current ruleset lacks is simply not used — and is still there when a
  // ruleset that has it is selected again. A dimension with no entry is "not
  // set" and is not sent.
  const [questionnaireValues, setQuestionnaireValues] = usePersistentState<Record<string, number>>(
    'xg.scoreEngine.simulator.questionnaireValues',
    {},
  );
  const [visionValues, setVisionValues] = usePersistentState<Record<string, number>>(
    'xg.scoreEngine.simulator.visionValues',
    {},
  );
  // null = not set: no age_years is sent, so the age-driven axes are scored
  // as missing input, as /evaluate does without a date of birth. (New key:
  // the old one held a default of 25 nobody chose.)
  const [respondentAge, setRespondentAge] = usePersistentState<number | null>(
    'xg.scoreEngine.simulator.respondentAgeYears',
    null,
  );

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
        const surveys = await fetchTenantSurveys(activeRuleset.brandId, activeRuleset.applicationId);
        if (surveys === null) return;
        const flags = safetyFlagsFromSurveys(surveys, formSurveyCode);
        if (!cancelled) setSurveySafetyFlags(flags);
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
    getSafetyFlags(hostRoutes)
      .then((rows) => setCatalogSafetyFlags(rows.map((r) => r.code)))
      .catch(() => setCatalogSafetyFlags([]));
  }, [hostRoutes]);

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


  // form_scores / vision_scores are HEALTH-space (100 = optimal), exactly
  // what the sliders below are labelled — the backend does the concern-space
  // conversion and the real fusion via the same stage2Score /evaluate uses,
  // so this tab no longer computes a blended value itself.
  const formScores = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of formDims) if (questionnaireValues[d] !== undefined) out[d] = questionnaireValues[d];
    return out;
  }, [formDims, questionnaireValues]);

  const visionScores = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of visionDims) if (visionValues[d] !== undefined) out[d] = visionValues[d];
    return out;
  }, [visionDims, visionValues]);

  const ageYears = ageAxisKeys.length > 0 && respondentAge !== null ? respondentAge : undefined;

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
      const response = await simulateRuleset({
        schema: activeRuleset.schema,
        form_scores: formScores,
        vision_scores: visionScores,
        age_years: ageYears,
        customer_condition: selectedConditions,
      });
      if (response) setSimResponse(response);
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
  const breakdown: Record<string, DimensionBlend> = result?.dimension_breakdown || {};
  const breakdownKeys = Array.from(new Set([...Object.keys(dimensions), ...Object.keys(breakdown)]));
  const skinProfile = result?.skin_profile;
  const subClassification = result?.sub_classification || {};
  const warnings = result?.warnings || [];
  const totalScore = typeof result?.total_score === 'number' ? Math.round(result.total_score) : null;
  const profileCode = skinProfile?.code || '—';
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
                content={`Bukan slider form biasa — dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dikirim sebagai age_years dan dinilai oleh cek AgeOverThirty di core, dipakai axis: ${ageAxisKeys.join(', ')}.`}
                label="About Usia"
              />
            </div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">Umur (tahun)</span>
              {respondentAge !== null ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-beak font-semibold font-mono">
                    {respondentAge} ({respondentAge <= AGE_FIELD_CUTOFF_YEARS ? 'sehat' : 'faktor W'})
                  </span>
                  <button
                    type="button"
                    onClick={() => setRespondentAge(null)}
                    className="text-[10px] text-muted-foreground underline hover:text-foreground"
                    title="Unset: send no age_years"
                  >
                    clear
                  </button>
                </span>
              ) : (
                <span className="text-[10px] italic text-muted-foreground" title="No age_years is sent">
                  not set
                </span>
              )}
            </div>
            <input
              type="range"
              min={AGE_SLIDER_MIN}
              max={AGE_SLIDER_MAX}
              value={respondentAge ?? AGE_UNSET_THUMB}
              onChange={(e) => setRespondentAge(Number(e.currentTarget.value))}
              onPointerUp={(e) => setRespondentAge(Number(e.currentTarget.value))}
              aria-label={respondentAge !== null ? `Umur: ${respondentAge}` : 'Umur: not set'}
              className={respondentAge !== null ? sliderCls : unsetSliderCls}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
              <span>≤{AGE_FIELD_CUTOFF_YEARS} = sehat</span>
              <span>&gt;{AGE_FIELD_CUTOFF_YEARS} = faktor W</span>
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
                <ScoreInput
                  key={dimKey}
                  label={dimKey}
                  value={questionnaireValues[dimKey]}
                  onChange={(v) => setQuestionnaireValues((p) => withValue(p, dimKey, v))}
                />
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
                <ScoreInput
                  key={dimKey}
                  label={dimKey}
                  value={visionValues[dimKey]}
                  onChange={(v) => setVisionValues((p) => withValue(p, dimKey, v))}
                />
              ))}
            </div>
          </div>
        )}

        {otherSources.length > 0 && (
          <div className={card + ' text-[11px] text-muted-foreground'}>
            The simulator cannot send <span className="font-mono">{otherSources.join(', ')}</span> yet, so those
            inputs count as missing and their weight is shared among the sources above.
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
            <div className="text-sm font-bold text-foreground font-mono mt-0.5">{totalScore ?? '—'}</div>
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

        {breakdownKeys.length > 0 && (
          <div className={card}>
            <h3 className="text-sm font-bold text-foreground mb-3">Dimension breakdown</h3>
            <div className="space-y-2">
              {breakdownKeys.map((dimKey) => {
                const d = dimensions[dimKey];
                const b = breakdown[dimKey];
                const contributions = Object.entries(b?.contributions || d?.contributions || {}).sort((x, y) => y[1].weight - x[1].weight);
                const missing = b?.missing || d?.missing || [];
                const scored = b ? b.scored : d?.scored !== false && d?.final_score !== null;
                const finalScore = d?.final_score ?? b?.score;
                return (
                  <div key={dimKey} className="rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-foreground font-semibold truncate">{dimKey}</div>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        {scored ? (
                          <span className="text-beak font-semibold" title="final score (100 = healthy)">
                            {typeof finalScore === 'number' ? Math.round(finalScore * 10) / 10 : '—'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px] font-sans">Not scored</span>
                        )}
                        {d?.axis && (
                          <span className="text-foreground font-semibold bg-card border border-border rounded px-1.5 py-0.5">
                            {d.axis}
                          </span>
                        )}
                      </div>
                    </div>
                    {contributions.map(([src, c]) => (
                      <div key={src} className="flex items-center gap-2 text-[10px]">
                        <span className="w-16 truncate font-mono text-muted-foreground">{src}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full bg-beak" style={{ width: `${Math.max(0, Math.min(1, c.weight)) * 100}%` }} />
                        </span>
                        <span className="w-10 text-right font-mono text-muted-foreground">{Math.round(c.weight * 1000) / 10}%</span>
                        <span className="w-10 text-right font-mono text-foreground">{Math.round(c.score * 10) / 10}</span>
                      </div>
                    ))}
                    {missing.length > 0 && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400">Missing: {missing.join(', ')}</div>
                    )}
                    {!scored && (b?.reason || d?.reason) && (
                      <div className="text-[10px] text-muted-foreground">{b?.reason || d?.reason}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
