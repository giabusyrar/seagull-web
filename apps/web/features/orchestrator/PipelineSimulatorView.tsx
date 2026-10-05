'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Workflow, Play, Zap, ShieldAlert, Cpu, Sun, Moon, FileText } from 'lucide-react';
import {
  PageHeader,
  SearchableSelect,
  InfoTooltip,
  BrandSelect,
  ApplicationSelect,
  type SelectOption,
} from '@gateway-experience/shared';
import type {
  PipelineExecutionStrategy,
  UnifiedAssessmentResponse,
  AssessmentPayload,
} from '@gateway-experience/studio/orchestrator';
import {
  runPipelineSimulation,
  listTenantRulesets,
  listConcernOptions,
  type RulesetOption,
  type ConcernOption,
} from './api';

type RoutineItem = UnifiedAssessmentResponse['stages']['matching']['amRoutine'][number];

function RoutineList({ items }: { items: RoutineItem[] | undefined }) {
  return (
    <div className="space-y-2 text-xs">
      {items?.map((item, idx) => (
        <div key={idx} className="bg-card p-2 rounded-lg border border-border">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-[10px] text-muted-foreground uppercase">{item.step}</span>
            {/* The engine's own score; nothing is shown when it sent none. */}
            {typeof item.matchScore === 'number' && (
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                {item.matchScore}% Match
              </span>
            )}
          </div>
          <div className="font-bold text-foreground mt-0.5">{item.productName}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.reason}</div>
        </div>
      ))}
    </div>
  );
}

export function PipelineSimulatorView() {
  // No tenant or ruleset is preselected: the pipeline refuses to guess one,
  // and so does this screen.
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [rulesetCode, setRulesetCode] = useState('');
  const [strategy, setStrategy] = useState<PipelineExecutionStrategy>('dynamic_capability_dispatch');

  // Reference data
  const [rulesets, setRulesets] = useState<RulesetOption[] | null>([]);
  const [concernOptions, setConcernOptions] = useState<ConcernOption[] | null>([]);

  // Input states
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [answersText, setAnswersText] = useState('{}');
  const [customerId, setCustomerId] = useState('');
  // A simulator run should not need a customer record; core's X-Dry-Run scores without one.
  const [dryRun, setDryRun] = useState(true);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<UnifiedAssessmentResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    listConcernOptions()
      .then(setConcernOptions)
      .catch(() => setConcernOptions(null));
  }, []);

  // A ruleset belongs to a tenant: changing either scope clears the choice.
  const changeBrand = (brandId: string) => {
    setSelectedBrand(brandId);
    setRulesetCode('');
  };
  const changeApp = (applicationId: string) => {
    setSelectedApp(applicationId);
    setRulesetCode('');
  };

  useEffect(() => {
    if (!selectedBrand || !selectedApp) return;
    let current = true;
    listTenantRulesets(selectedBrand, selectedApp)
      .then((list) => current && setRulesets(list))
      .catch(() => current && setRulesets(null));
    return () => {
      current = false;
    };
  }, [selectedBrand, selectedApp]);

  const rulesetOptions: SelectOption[] = useMemo(
    () =>
      (selectedBrand && selectedApp ? rulesets || [] : []).map((r) => ({
        value: r.code,
        label: `${r.title} (${r.code})`,
        ...(r.status ? { description: r.status } : {}),
      })),
    [rulesets, selectedBrand, selectedApp],
  );

  const parsedAnswers = useMemo((): { value?: Record<string, unknown>; error?: string } => {
    try {
      const v = JSON.parse(answersText || '{}');
      return v && typeof v === 'object' && !Array.isArray(v)
        ? { value: v as Record<string, unknown> }
        : { error: 'Answers must be a JSON object keyed by question.' };
    } catch (e) {
      return { error: `Answers are not valid JSON: ${e instanceof Error ? e.message : String(e)}` };
    }
  }, [answersText]);

  const missingInputs = [
    !selectedBrand && 'brand',
    !selectedApp && 'application',
    !rulesetCode && 'ruleset',
  ].filter(Boolean) as string[];
  const canRun = missingInputs.length === 0 && !parsedAnswers.error;

  const handleToggleConcern = (key: string) => {
    setSelectedConcerns((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));
  };

  const runPipeline = useCallback(async () => {
    if (!canRun || !parsedAnswers.value) return;
    setIsExecuting(true);
    setRunError(null);
    try {
      const payload: AssessmentPayload = {
        brandId: selectedBrand,
        applicationId: selectedApp,
        rulesetCode,
        answers: parsedAnswers.value,
        concerns: selectedConcerns,
        ...(customerId ? { customerId } : {}),
        dryRun,
        configOverride: { executionStrategy: strategy },
      };
      const result = await runPipelineSimulation(payload);
      if (result.ok) {
        setPipelineResult(result.data);
      } else {
        setPipelineResult(null);
        setRunError(result.error);
      }
    } catch (err) {
      setPipelineResult(null);
      setRunError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExecuting(false);
    }
  }, [canRun, parsedAnswers, selectedBrand, selectedApp, rulesetCode, selectedConcerns, customerId, dryRun, strategy]);

  const scoring = pipelineResult?.stages?.scoring;
  const vision = pipelineResult?.stages?.vision;

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none">
      {/* Studio Header */}
      <PageHeader
        icon={<Workflow className="h-5 w-5 text-primary" />}
        breadcrumbs={[
          { label: 'Workbench', href: '/' },
          { label: 'Core Engines' },
          { label: 'Unified Journey Pipeline' },
        ]}
        title="Unified Journey Pipeline Orchestrator"
        description="End-to-end pipeline coordinating capability dispatch, the core-engine Score Engine, and the Match Engine."
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* TOP CONFIGURATION & STRATEGY BAR */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <BrandSelect
                value={selectedBrand}
                onChange={changeBrand}
                includeUniversal={false}
                label="Brand (required)"
              />
            </div>
            <div className="w-56">
              <ApplicationSelect
                value={selectedApp}
                onChange={changeApp}
                includeUniversal={false}
                label="Application (required)"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Scoring Ruleset (required)
              </span>
              <div className="w-56">
                <SearchableSelect
                  value={rulesetCode}
                  onChange={setRulesetCode}
                  options={rulesetOptions}
                  disabled={!selectedBrand || !selectedApp}
                  placeholder={
                    !selectedBrand || !selectedApp
                      ? 'Pick brand and application first'
                      : rulesets === null
                        ? 'Rulesets could not be loaded'
                        : rulesetOptions.length
                          ? 'Select ruleset...'
                          : 'No ruleset for this tenant'
                  }
                  searchPlaceholder="Search ruleset..."
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Execution Strategy
              </span>
              <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setStrategy('dynamic_capability_dispatch')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    strategy === 'dynamic_capability_dispatch'
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dynamic Capability Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setStrategy('parallel_late_fusion')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    strategy === 'parallel_late_fusion'
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Parallel Late Fusion
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pipelineResult?.timings?.total_pipeline_ms !== undefined && (
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5 font-bold">
                <Zap className="h-3.5 w-3.5 text-emerald-600" />
                {pipelineResult.timings.total_pipeline_ms}ms Pipeline Latency
              </span>
            )}
            <button
              type="button"
              disabled={isExecuting || !canRun}
              onClick={runPipeline}
              title={missingInputs.length ? `Pick ${missingInputs.join(', ')} first` : parsedAnswers.error}
              className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {isExecuting ? 'Running Pipeline...' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        {missingInputs.length > 0 && (
          <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
            Pick a {missingInputs.join(', ')} to run the pipeline. Nothing is assumed: the pipeline scores against the
            tenant and ruleset you choose, or not at all.
          </div>
        )}
        {runError && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-foreground">
            Pipeline did not run: {runError}
          </div>
        )}

        {/* 2-COLUMN PLAYGROUND LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: INPUT CONTROLS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Stage 1: Form & Clinical Input
                </h3>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Concerns</label>
                  <InfoTooltip
                    content="Skin conditions from reference data. Selected ones pick the vision capabilities to dispatch."
                    label="About Target Concerns"
                    iconClassName="h-3 w-3"
                  />
                </div>
                {concernOptions === null ? (
                  <p className="text-[11px] text-muted-foreground">Skin conditions could not be loaded.</p>
                ) : concernOptions.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No skin conditions in reference data.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto">
                    {concernOptions.map((c) => {
                      const isChecked = selectedConcerns.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleToggleConcern(c.code)}
                          className={`px-2.5 py-1.5 rounded-md border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                              : 'bg-secondary/40 text-muted-foreground border-border hover:border-sidebar-ring/40'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-beak' : 'bg-muted-foreground/30'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Questionnaire Answers</label>
                  <InfoTooltip
                    content="Raw answers as JSON, keyed by the question names of the questionnaire the ruleset links (form_survey_code). The Score Engine interprets them; the pipeline does not."
                    label="About Questionnaire Answers"
                    iconClassName="h-3 w-3"
                  />
                </div>
                <textarea
                  value={answersText}
                  onChange={(e) => setAnswersText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full rounded-md border border-border bg-secondary/40 p-2 font-mono text-[11px] text-foreground select-text"
                />
                {parsedAnswers.error && <p className="text-[11px] text-rose-600">{parsedAnswers.error}</p>}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Customer ID</label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder={dryRun ? 'Optional on a dry run' : 'Required by the Score Engine'}
                  className="w-full rounded-md border border-border bg-secondary/40 px-2 py-1.5 text-xs text-foreground select-text"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                  Dry run (X-Dry-Run: no customer record needed)
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: 4-STAGE LIVE EXECUTION TRACER */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage 1 Tracer */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-foreground">Form Input Stage</h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {pipelineResult?.timings?.stage1_form_ms ?? 0}ms
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Named Concerns
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pipelineResult?.stages?.form?.detectedConditions?.length ? (
                      pipelineResult.stages.form.detectedConditions.map((c) => (
                        <span
                          key={c}
                          className="text-[11px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-semibold"
                        >
                          #{c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Answers Sent to the Score Engine
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                    {pipelineResult?.stages?.form?.answeredQuestions?.length ? (
                      pipelineResult.stages.form.answeredQuestions.map((q) => (
                        <span key={q} className="bg-secondary/40 px-1.5 py-0.5 rounded border border-border">
                          {q}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 2 Tracer: Capability Dispatch */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-foreground">Vision Capability Dispatch</h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {pipelineResult?.timings?.stage2_vision_ms ?? 0}ms
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Dispatched Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {vision?.dispatchedCapabilities?.length ? (
                      vision.dispatchedCapabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-bold flex items-center gap-1"
                        >
                          <Cpu className="h-3 w-3" />
                          {cap}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Idle</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Readings by Capability
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {Object.entries(vision?.telemetrySignals || {}).map(([sig, val]) => (
                      <div key={sig} className="bg-secondary/40 p-1.5 rounded border border-border flex justify-between">
                        <span className="text-muted-foreground">{sig}:</span>
                        <span className="font-bold text-purple-700">{val}</span>
                      </div>
                    ))}
                  </div>
                  {vision?.dispatchError && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">No readings: {vision.dispatchError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* STAGE 3: CORE-ENGINE SCORE ENGINE */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Stage 3: Score Engine{scoring?.rulesetCode ? ` · ${scoring.rulesetCode}` : ''}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {pipelineResult?.timings?.stage3_scoring_ms ?? 0}ms
                </span>
              </div>

              {scoring?.scoreError && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground">
                  No scores: {scoring.scoreError}
                </div>
              )}

              {pipelineResult && !scoring?.scoreError && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Profile Badge: the engine's, or a statement that there is none */}
                  <div className="md:col-span-4 bg-secondary/40 p-4 rounded-xl border border-border text-center">
                    {scoring?.skinProfile ? (
                      <>
                        {scoring.skinProfile.category && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {scoring.skinProfile.category}
                          </span>
                        )}
                        <div className="text-3xl font-extrabold font-mono text-foreground my-1.5">
                          {scoring.skinProfile.code}
                        </div>
                        <div className="text-xs font-semibold text-foreground">{scoring.skinProfile.name}</div>
                        {!scoring.skinProfile.complete && (
                          <div className="text-[10px] text-amber-700 mt-1">
                            Partial: an axis of this ruleset had no data.
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">The engine returned no skin profile.</div>
                    )}
                    {typeof scoring?.totalScore === 'number' && (
                      <div className="text-[11px] font-mono text-muted-foreground mt-2">
                        Total {scoring.totalScore} / 100
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-2 text-xs font-mono">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Dimension health (100 = healthy)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(scoring?.fusedDimensionScores || {}).map(([dim, score]) => (
                        <div key={dim} className="bg-secondary/50 p-2 rounded-lg border border-border text-center">
                          <div className="text-[10px] text-muted-foreground uppercase">{dim}</div>
                          <div className="text-base font-bold text-foreground mt-0.5">{score}</div>
                        </div>
                      ))}
                      {scoring?.missingDimensions?.map((dim) => (
                        <div
                          key={dim}
                          className="bg-secondary/20 p-2 rounded-lg border border-dashed border-border text-center"
                        >
                          <div className="text-[10px] text-muted-foreground uppercase">{dim}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">not scored</div>
                        </div>
                      ))}
                    </div>

                    {scoring?.skinProfile?.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 font-sans">
                        {scoring.skinProfile.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(scoring?.warnings?.length ?? 0) > 0 && (
                <ul className="space-y-0.5 text-[11px] text-muted-foreground list-disc pl-4">
                  {scoring?.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* STAGE 4: MATCH ENGINE & ROUTINE GENERATOR */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                    4
                  </span>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Stage 4: Match Engine & Personalized Regimen
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {pipelineResult?.timings?.stage4_matching_ms ?? 0}ms
                </span>
              </div>

              {(pipelineResult?.stages?.matching?.contraindicationWarnings?.length ?? 0) > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {pipelineResult?.stages?.matching?.contraindicationWarnings?.map((w, idx) => (
                      <p key={idx} className="font-medium">
                        {w}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* An empty routine means the match engine recommended nothing,
                  could not be reached, or was not asked. Say which. */}
              {pipelineResult?.stages?.matching?.regimenError && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground">
                  No regimen: {pipelineResult.stages.matching.regimenError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-3.5 rounded-xl border border-border space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-600" />
                    Morning (AM) Regimen
                  </div>
                  <RoutineList items={pipelineResult?.stages?.matching?.amRoutine} />
                </div>

                <div className="bg-secondary/30 p-3.5 rounded-xl border border-border space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                    <Moon className="h-3.5 w-3.5 text-purple-700" />
                    Evening (PM) Regimen
                  </div>
                  <RoutineList items={pipelineResult?.stages?.matching?.pmRoutine} />
                </div>
              </div>

              {Object.entries(pipelineResult?.stages?.matching?.phases || {}).map(([phase, items]) => (
                <div key={phase} className="bg-secondary/30 p-3.5 rounded-xl border border-border space-y-2.5">
                  <div className="text-xs font-bold text-foreground border-b border-border pb-1.5">{phase}</div>
                  <RoutineList items={items} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
