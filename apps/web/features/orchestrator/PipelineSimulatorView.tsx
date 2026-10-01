'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Workflow,
  Sparkles,
  Sliders,
  Play,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Cpu,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  Eye,
  FileText,
  Flame,
  Award,
} from 'lucide-react';
import { PageHeader, StatusBadge, SearchableSelect, InfoTooltip, type SelectOption } from '@gateway-experience/shared';
import type {
  PipelineExecutionStrategy,
  UnifiedAssessmentResponse,
  AssessmentPayload,
} from '@gateway-experience/beauty-sdk';

interface PersonaPreset {
  id: string;
  name: string;
  tagline: string;
  skinType: string;
  concerns: string[];
  qScores: { sebum: number; sensitivity: number; pigmentation: number; aging: number };
  conditions: { is_pregnant: boolean; uses_retinol: boolean };
}

const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'oily_acne',
    name: 'Oily & Acne-Prone (Active Shine)',
    tagline: 'High T-zone sebum, enlarged pores, and active breakout concerns',
    skinType: 'oily',
    concerns: ['concern_oiliness', 'concern_acne', 'pores'],
    qScores: { sebum: 85, sensitivity: 45, pigmentation: 30, aging: 25 },
    conditions: { is_pregnant: false, uses_retinol: false },
  },
  {
    id: 'dry_sensitive_mature',
    name: 'Dry, Sensitive & Wrinkle-Prone',
    tagline: 'Alipidic barrier flakiness, reactive erythema, and fine lines',
    skinType: 'dry',
    concerns: ['concern_dryness', 'concern_redness', 'concern_wrinkles'],
    qScores: { sebum: 25, sensitivity: 75, pigmentation: 40, aging: 65 },
    conditions: { is_pregnant: false, uses_retinol: true },
  },
  {
    id: 'melasma_pregnant',
    name: 'Pigmented & Pregnancy Constraint',
    tagline: 'Localized UV damage & dark spots with strict pregnancy safety',
    skinType: 'combination',
    concerns: ['concern_dark_spots', 'melasma'],
    qScores: { sebum: 55, sensitivity: 40, pigmentation: 80, aging: 35 },
    conditions: { is_pregnant: true, uses_retinol: false },
  },
];

export function PipelineSimulatorView() {
  const [selectedBrand, setSelectedBrand] = useState('brand_wardah');
  const [selectedApp, setSelectedApp] = useState('app_kiosk');
  const [strategy, setStrategy] = useState<PipelineExecutionStrategy>('dynamic_capability_dispatch');
  const [selectedPresetId, setSelectedPresetId] = useState('oily_acne');

  // Input states
  const [skinType, setSkinType] = useState('oily');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'concern_oiliness',
    'concern_acne',
  ]);
  const [qSebum, setQSebum] = useState(85);
  const [qSensitivity, setQSensitivity] = useState(45);
  const [qPigmentation, setQPigmentation] = useState(30);
  const [qAging, setQAging] = useState(25);
  const [isPregnant, setIsPregnant] = useState(false);
  const [usesRetinol, setUsesRetinol] = useState(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<UnifiedAssessmentResponse | null>(null);

  const applyPreset = (preset: PersonaPreset) => {
    setSelectedPresetId(preset.id);
    setSkinType(preset.skinType);
    setSelectedConcerns(preset.concerns);
    setQSebum(preset.qScores.sebum);
    setQSensitivity(preset.qScores.sensitivity);
    setQPigmentation(preset.qScores.pigmentation);
    setQAging(preset.qScores.aging);
    setIsPregnant(preset.conditions.is_pregnant);
    setUsesRetinol(preset.conditions.uses_retinol);
  };

  const handleToggleConcern = (key: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const runPipeline = useCallback(async () => {
    setIsExecuting(true);
    try {
      const payload: AssessmentPayload = {
        brandId: selectedBrand,
        applicationId: selectedApp,
        answers: {
          skin_type: skinType,
          concerns: selectedConcerns,
          q_sebum: qSebum,
          q_sensitivity: qSensitivity,
          q_pigmentation: qPigmentation,
          q_aging: qAging,
        },
        customerConditions: {
          is_pregnant: isPregnant,
          uses_retinol: usesRetinol,
        },
        configOverride: {
          executionStrategy: strategy,
        },
      };

      const res = await fetch('/api/orchestrator/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setPipelineResult(data);
      }
    } catch (err) {
      console.error('Pipeline simulation failed:', err);
    } finally {
      setIsExecuting(false);
    }
  }, [
    selectedBrand,
    selectedApp,
    strategy,
    skinType,
    selectedConcerns,
    qSebum,
    qSensitivity,
    qPigmentation,
    qAging,
    isPregnant,
    usesRetinol,
  ]);

  useEffect(() => {
    runPipeline();
  }, [runPipeline]);

  const brandOptions: SelectOption[] = [
    { value: 'brand_wardah', label: 'Wardah Beauty' },
    { value: 'brand_makeover', label: 'Make Over' },
    { value: 'brand_emina', label: 'Emina Skincare' },
    { value: 'brand_kahf', label: 'Kahf Men Care' },
  ];

  const appOptions: SelectOption[] = [
    { value: 'app_kiosk', label: 'Smart Diagnostic Kiosk (In-Store)' },
    { value: 'app_mobile', label: 'Mobile App Beauty Advisor' },
    { value: 'app_web', label: 'Web E-Commerce Widget' },
  ];

  const allConcernsList = [
    { key: 'concern_oiliness', label: 'Excess Sebum / Shine' },
    { key: 'concern_acne', label: 'Acne & Clogged Pores' },
    { key: 'concern_dark_spots', label: 'Dark Spots & Melasma' },
    { key: 'concern_wrinkles', label: 'Wrinkles & Fine Lines' },
    { key: 'concern_redness', label: 'Erythema & Sensitivity' },
    { key: 'concern_dryness', label: 'Dehydration & Flaking' },
  ];

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
        description="End-to-end clinical pipeline coordinating Form Engine, PyTorch Vision Middleware, Score Engine, and Match Engine."
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* TOP CONFIGURATION & STRATEGY BAR */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Brand Scope
              </span>
              <div className="w-56">
                <SearchableSelect
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={brandOptions}
                  placeholder="Select brand..."
                  searchPlaceholder="Search brand..."
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Channel / App
              </span>
              <div className="w-56">
                <SearchableSelect
                  value={selectedApp}
                  onChange={setSelectedApp}
                  options={appOptions}
                  placeholder="Select channel..."
                  searchPlaceholder="Search channel..."
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
              disabled={isExecuting}
              onClick={runPipeline}
              className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold rounded-md shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {isExecuting ? 'Running Pipeline...' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        {/* PERSONA PRESET SELECTOR CAROUSEL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Diagnostic Persona Presets
              </span>
              <InfoTooltip
                content="Interactive test cases that prefill the pipeline inputs."
                label="About Diagnostic Persona Presets"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PERSONA_PRESETS.map((p) => (
              <div
                key={p.id}
                onClick={() => applyPreset(p)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedPresetId === p.id
                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300 shadow-2xs'
                    : 'bg-card border-border hover:border-sidebar-ring/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedPresetId === p.id ? 'bg-beak' : 'bg-muted-foreground/30'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {p.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-COLUMN PLAYGROUND LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: MULTI-MODAL INPUT CONTROLS */}
          <div className="lg:col-span-4 space-y-4">
            {/* Stage 1 Input: Questionnaire & Concerns */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Stage 1: Form & Clinical Input
                </h3>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">
                    Target Concerns
                  </label>
                  <InfoTooltip
                    content="Selected concerns trigger the corresponding vision model heads."
                    label="About Target Concerns"
                    iconClassName="h-3 w-3"
                  />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {allConcernsList.map((c) => {
                    const isChecked = selectedConcerns.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleToggleConcern(c.key)}
                        className={`px-2.5 py-1.5 rounded-md border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-secondary/40 text-muted-foreground border-border hover:border-sidebar-ring/40'
                        }`}
                      >
                        <span>{c.label}</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isChecked ? 'bg-beak' : 'bg-muted-foreground/30'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-muted-foreground">Sebum Score</span>
                    <span className="font-bold text-foreground">{qSebum}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={qSebum}
                    onChange={(e) => setQSebum(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-[#d97706]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-muted-foreground">Sensitivity Score</span>
                    <span className="font-bold text-foreground">{qSensitivity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={qSensitivity}
                    onChange={(e) => setQSensitivity(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-[#d97706]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-muted-foreground">Pigmentation Score</span>
                    <span className="font-bold text-foreground">{qPigmentation}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={qPigmentation}
                    onChange={(e) => setQPigmentation(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded appearance-none cursor-pointer accent-[#d97706]"
                  />
                </div>
              </div>

              {/* Contraindications */}
              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Safety Contraindications
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPregnant(!isPregnant)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs flex-1 text-center font-medium transition cursor-pointer ${
                      isPregnant
                        ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    Pregnant / Lactating
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsesRetinol(!usesRetinol)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs flex-1 text-center font-medium transition cursor-pointer ${
                      usesRetinol
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                        : 'bg-secondary/40 text-muted-foreground border-border'
                    }`}
                  >
                    Uses Retinoid
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: 4-STAGE LIVE EXECUTION TRACER */}
          <div className="lg:col-span-8 space-y-4">
            {/* STAGE 1 & 2 DUAL CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage 1 Tracer */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-foreground">Form Extraction Stage</h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {pipelineResult?.timings?.stage1_form_ms || 0}ms
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Captured Clinical Conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pipelineResult?.stages?.form?.detectedConditions?.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-semibold"
                      >
                        #{c}
                      </span>
                    )) || <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Extracted Dimension Base
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {Object.entries(pipelineResult?.stages?.form?.extractedDimensions || {}).map(
                      ([dim, val]) => (
                        <div
                          key={dim}
                          className="bg-secondary/40 p-1.5 rounded border border-border flex justify-between"
                        >
                          <span className="text-muted-foreground uppercase">{dim}:</span>
                          <span className="font-bold text-foreground">{val}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 2 Tracer: Dynamic PyTorch Dispatch */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                      2
                    </span>
                    <h4 className="text-xs font-bold text-foreground">PyTorch Vision Dispatch</h4>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {pipelineResult?.timings?.stage2_vision_ms || 0}ms
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Targeted PyTorch Model Heads
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pipelineResult?.stages?.vision?.dispatchedCapabilities?.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-bold flex items-center gap-1"
                      >
                        <Cpu className="h-3 w-3" />
                        {cap}
                      </span>
                    )) || <span className="text-xs text-muted-foreground">Idle</span>}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Vision Telemetry Output
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {Object.entries(pipelineResult?.stages?.vision?.telemetrySignals || {}).map(
                      ([sig, val]) => (
                        <div
                          key={sig}
                          className="bg-secondary/40 p-1.5 rounded border border-border flex justify-between"
                        >
                          <span className="text-muted-foreground uppercase">{sig}:</span>
                          <span className="font-bold text-purple-700">{val}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* STAGE 3: SCORE FUSION & GORULES JDM DIAGNOSIS */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary text-primary font-mono text-xs flex items-center justify-center font-bold border border-border">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Stage 3: Score Fusion & GoRules JDM Diagnosis
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {pipelineResult?.timings?.stage3_scoring_ms || 0}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Profile Badge */}
                <div className="md:col-span-4 bg-secondary/40 p-4 rounded-xl border border-border text-center">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {pipelineResult?.stages?.scoring?.skinProfile?.category || 'Clinical Profile'}
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-foreground my-1.5">
                    {pipelineResult?.stages?.scoring?.skinProfile?.code || 'OSNW'}
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {pipelineResult?.stages?.scoring?.skinProfile?.name ||
                      'Oily Sensitive Non-Pigmented Wrinkle-Prone'}
                  </div>
                </div>

                {/* Fused Dimensions & Tiers */}
                <div className="md:col-span-8 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(
                      pipelineResult?.stages?.scoring?.fusedDimensionScores || {}
                    ).map(([dim, score]) => (
                      <div
                        key={dim}
                        className="bg-secondary/50 p-2 rounded-lg border border-border text-center"
                      >
                        <div className="text-[10px] text-muted-foreground uppercase">{dim}</div>
                        <div className="text-base font-bold text-foreground mt-0.5">{score}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    {pipelineResult?.stages?.scoring?.skinProfile?.description}
                  </p>
                </div>
              </div>
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
                  {pipelineResult?.timings?.stage4_matching_ms || 0}ms
                </span>
              </div>

              {/* Contraindication alerts */}
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
                  or could not be reached. Say which — the panel used to be
                  filled with placeholder products either way. */}
              {pipelineResult?.stages?.matching?.regimenError && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-foreground">
                  No regimen: {pipelineResult.stages.matching.regimenError}
                </div>
              )}

              {/* Routine Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AM Routine */}
                <div className="bg-secondary/30 p-3.5 rounded-xl border border-border space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-600" />
                    Morning (AM) Regimen
                  </div>
                  <div className="space-y-2 text-xs">
                    {pipelineResult?.stages?.matching?.amRoutine?.map((item, idx) => (
                      <div key={idx} className="bg-card p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {item.step}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                            {item.matchScore}% Match
                          </span>
                        </div>
                        <div className="font-bold text-foreground mt-0.5">{item.productName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PM Routine */}
                <div className="bg-secondary/30 p-3.5 rounded-xl border border-border space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-1.5">
                    <Moon className="h-3.5 w-3.5 text-purple-700" />
                    Evening (PM) Regimen
                  </div>
                  <div className="space-y-2 text-xs">
                    {pipelineResult?.stages?.matching?.pmRoutine?.map((item, idx) => (
                      <div key={idx} className="bg-card p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {item.step}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                            {item.matchScore}% Match
                          </span>
                        </div>
                        <div className="font-bold text-foreground mt-0.5">{item.productName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
