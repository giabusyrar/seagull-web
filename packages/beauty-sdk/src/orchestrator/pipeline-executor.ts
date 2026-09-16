import { AssessmentPayload, UnifiedAssessmentResponse, OrchestratorPipelineConfig } from './types';
import { resolveRequiredCapabilitiesFromDb, fetchSkinConditionsFromDb } from './capability-registry';
import { dispatchPyTorchCapabilities } from './pytorch-client';
import { fuseDimensionScores } from './score-fusion';

export async function executeAssessmentPipeline(
  payload: AssessmentPayload
): Promise<UnifiedAssessmentResponse> {
  const startTime = Date.now();
  const timings: Record<string, number> = {};

  const config: OrchestratorPipelineConfig = {
    id: 'pipe-default',
    brandId: payload.brandId || 'brand_wardah',
    applicationId: payload.applicationId || 'app_kiosk',
    channel: 'kiosk',
    executionStrategy: payload.configOverride?.executionStrategy || 'dynamic_capability_dispatch',
    vision: {
      serviceUrl:
        payload.configOverride?.vision?.serviceUrl ||
        `${process.env.VISION_AI_WORKER_URL || 'http://127.0.0.1:8088'}/api/v1/dispatch-capabilities`,
      timeoutMs: 3000,
      inputMode: 'single_image',
      confidenceThreshold: 0.6,
      enabledCapabilities: [],
    },
    form: {
      questionnaireCode: 'q_default_diagnostic',
      dimensionMappingRules: {
        q_sebum: 'sebum',
        q_sensitivity: 'sensitivity',
        q_pigmentation: 'pigmentation',
        q_aging: 'aging',
        q_barrier: 'barrier',
      },
    },
    scoring: {
      rulesetCode: 'ruleset_default_jdm',
      dimensionFusionWeights: {
        sebum: { formWeight: 0.4, visionWeight: 0.6 },
        acne: { formWeight: 0.3, visionWeight: 0.7 },
        pigmentation: { formWeight: 0.4, visionWeight: 0.6 },
        aging: { formWeight: 0.5, visionWeight: 0.5 },
        sensitivity: { formWeight: 0.6, visionWeight: 0.4 },
        barrier: { formWeight: 0.5, visionWeight: 0.5 },
      },
    },
    matching: {
      minEfficacyScore: 40,
      strictContraindications: true,
      maxAmRoutineSteps: 4,
      maxPmRoutineSteps: 4,
    },
    ...(payload.configOverride || {}),
  };

  // -------------------------------------------------------------
  // STAGE 1: FORM PARSING & CONCERN EXTRACTION
  // -------------------------------------------------------------
  const t0 = Date.now();
  const extractedDimensions: Record<string, number> = {};
  const detectedConditions: string[] = [];

  const answers = payload.answers || {};
  if (Array.isArray(answers.concerns)) {
    detectedConditions.push(...answers.concerns);
  }
  if (answers.skin_type) {
    if (answers.skin_type === 'oily') {
      detectedConditions.push('concern_oiliness');
      extractedDimensions['sebum'] = 75;
    } else if (answers.skin_type === 'dry') {
      detectedConditions.push('concern_dryness');
      extractedDimensions['hydration'] = 35;
    } else if (answers.skin_type === 'sensitive') {
      detectedConditions.push('concern_redness');
      extractedDimensions['sensitivity'] = 75;
    } else if (answers.skin_type === 'combination') {
      detectedConditions.push('concern_oiliness');
      extractedDimensions['sebum'] = 60;
      extractedDimensions['hydration'] = 50;
    }
  }

  for (const [ansKey, dimKey] of Object.entries(config.form.dimensionMappingRules)) {
    if (typeof answers[ansKey] === 'number') {
      extractedDimensions[dimKey] = answers[ansKey];
    }
  }

  timings['stage1_form_ms'] = Date.now() - t0;

  // -------------------------------------------------------------
  // STAGE 2: DYNAMIC PYTORCH CAPABILITY DISPATCH
  // -------------------------------------------------------------
  const t1 = Date.now();
  let dispatchedCaps: string[] = [];

  if (config.executionStrategy === 'dynamic_capability_dispatch') {
    dispatchedCaps = await resolveRequiredCapabilitiesFromDb(detectedConditions);
  } else if (
    config.executionStrategy === 'parallel_late_fusion' ||
    config.executionStrategy === 'vision_only'
  ) {
    const allConditions = await fetchSkinConditionsFromDb();
    const allCaps = new Set<string>();
    allConditions.forEach((c) => {
      (c.visionCapabilities || []).forEach((cap) => allCaps.add(cap));
    });
    dispatchedCaps = Array.from(allCaps);
  }

  const visionSignals = await dispatchPyTorchCapabilities({
    serviceUrl: config.vision.serviceUrl,
    timeoutMs: config.vision.timeoutMs,
    capabilities: dispatchedCaps,
    images: payload.images,
  });

  timings['stage2_vision_ms'] = Date.now() - t1;

  // -------------------------------------------------------------
  // STAGE 3: SCORE FUSION & DECISION MODEL
  // -------------------------------------------------------------
  const t2 = Date.now();
  const fusedScores = fuseDimensionScores(
    config.executionStrategy === 'vision_only' ? {} : extractedDimensions,
    config.executionStrategy === 'form_only' ? {} : visionSignals,
    config.scoring.dimensionFusionWeights
  );

  const sebumScore = fusedScores.sebum ?? 50;
  const sensScore = fusedScores.sensitivity ?? 40;
  const pigScore = fusedScores.pigmentation ?? 35;
  const agingScore = fusedScores.aging ?? 30;

  // Determine Baumann 4-letter Code: [O/D]-[S/R]-[P/N]-[W/T]
  const o_d = sebumScore >= 55 ? 'O' : 'D';
  const s_r = sensScore >= 50 ? 'S' : 'R';
  const p_n = pigScore >= 50 ? 'P' : 'N';
  const w_t = agingScore >= 45 ? 'W' : 'T';
  const profileCode = `${o_d}${s_r}${p_n}${w_t}`;

  const profileNames: Record<string, string> = {
    OSNW: 'Oily Sensitive Non-Pigmented Wrinkle-Prone',
    OSNT: 'Oily Sensitive Non-Pigmented Tight',
    OSPW: 'Oily Sensitive Pigmented Wrinkle-Prone',
    OSPT: 'Oily Sensitive Pigmented Tight',
    ORNW: 'Oily Resistant Non-Pigmented Wrinkle-Prone',
    ORNT: 'Oily Resistant Non-Pigmented Tight',
    DSNW: 'Dry Sensitive Non-Pigmented Wrinkle-Prone',
    DSNT: 'Dry Sensitive Non-Pigmented Tight',
    DSPW: 'Dry Sensitive Pigmented Wrinkle-Prone',
    DSPT: 'Dry Sensitive Pigmented Tight',
    DRNW: 'Dry Resistant Non-Pigmented Wrinkle-Prone',
    DRNT: 'Dry Resistant Non-Pigmented Tight',
  };

  const skinProfile = {
    code: profileCode,
    name: profileNames[profileCode] || `Diagnostic Profile ${profileCode}`,
    category: o_d === 'O' ? 'Lipid Imbalanced' : 'Alipidic / Barrier Compromised',
    description: `Clinical diagnosis reflects ${o_d === 'O' ? 'elevated sebum shine' : 'reduced barrier moisture'} blended with ${s_r === 'S' ? 'reactive sensitivity' : 'resilient resistance'}.`,
  };

  const severityTiers: Record<string, { gradeName: string; severity: string }> = {
    sebum: {
      gradeName: sebumScore >= 70 ? 'High Shine / Hyper-Seborrhea' : sebumScore >= 40 ? 'Balanced Lipid' : 'Dry / Alipidic',
      severity: sebumScore >= 70 ? 'severe' : sebumScore >= 50 ? 'moderate' : 'optimal',
    },
    sensitivity: {
      gradeName: sensScore >= 65 ? 'Reactive Erythema' : 'Tolerant Resilient',
      severity: sensScore >= 65 ? 'severe' : 'optimal',
    },
    pigmentation: {
      gradeName: pigScore >= 60 ? 'Localized Melasma' : 'Uniform Tone',
      severity: pigScore >= 60 ? 'moderate' : 'optimal',
    },
  };

  const totalScore = Math.round(
    ((fusedScores.sebum || 50) + (fusedScores.sensitivity || 50) + (fusedScores.pigmentation || 50) + (fusedScores.aging || 50)) / 4
  );

  timings['stage3_scoring_ms'] = Date.now() - t2;

  // -------------------------------------------------------------
  // STAGE 4: MATCH ENGINE & ROUTINE GENERATION
  // -------------------------------------------------------------
  const t3 = Date.now();
  const isPregnant = payload.customerConditions?.is_pregnant ?? false;
  const usesRetinol = payload.customerConditions?.uses_retinol ?? false;
  const contraindicationWarnings: string[] = [];

  if (isPregnant) {
    contraindicationWarnings.push('Pregnancy safety constraint active: Retinoids, Salicylic Acid (>2%), and Hydroquinone excluded.');
  }
  if (usesRetinol) {
    contraindicationWarnings.push('Active retinoid user: High-concentration AHA/BHA exfoliants slotted exclusively for alternate night PM use.');
  }

  const isOily = o_d === 'O';
  const isSensitive = s_r === 'S';

  const amRoutine = [
    {
      step: 'Step 1: Cleanse',
      productName: isOily ? 'Gentle Purifying Gel Cleanser' : 'Hydrating Barrier Foam Wash',
      matchScore: 96,
      reason: isOily ? 'Balances excess sebum without stripping acid mantle' : 'Restores ceramides and moisture during morning cleanse',
    },
    {
      step: 'Step 2: Treatment Serum',
      productName: isSensitive ? '5% Niacinamide + Centella Soothing Serum' : '10% Vitamin C + Ferulic Radiance Serum',
      matchScore: 92,
      reason: isSensitive ? 'Reduces vascular redness and strengthens epidermal barrier' : 'Antioxidant defense against daytime free radicals',
    },
    {
      step: 'Step 3: Moisturizer',
      productName: isOily ? 'Oil-Free Matte Hydro-Gel' : 'Ceramide Deep Barrier Cream',
      matchScore: 90,
      reason: isOily ? 'Weightless hydration with micro-sponge oil control' : 'Locks in trans-epidermal hydration',
    },
    {
      step: 'Step 4: Sunscreen',
      productName: 'Physical Mineral UV Shield SPF 50+ PA++++',
      matchScore: 98,
      reason: 'Broad spectrum non-comedogenic physical protection',
    },
  ];

  const pmRoutine = [
    {
      step: 'Step 1: First Cleanse',
      productName: 'Micellar Calming Cleansing Water',
      matchScore: 94,
      reason: 'Gently dissolves sunscreen and urban particulate matter',
    },
    {
      step: 'Step 2: Active Treatment',
      productName: isPregnant ? 'Bakuchiol 2% Restorative Ampoule' : isSensitive ? 'Azelaic Acid 10% Clarifying Fluid' : 'Retinol 0.2% Micro-Encapsulated Serum',
      matchScore: 95,
      reason: isPregnant ? 'Pregnancy-safe phyto-retinol cellular renewal' : 'Nightly targeted recovery aligned with clinical profile',
    },
    {
      step: 'Step 3: Barrier Recovery',
      productName: 'Ceramide Peptide Overnight Recovery Balm',
      matchScore: 91,
      reason: 'Intensive nocturnal epidermal lipid repair',
    },
  ];

  timings['stage4_matching_ms'] = Date.now() - t3;
  timings['total_pipeline_ms'] = Date.now() - startTime;

  return {
    success: true,
    pipelineId: `pipe_run_${Date.now()}`,
    executionStrategy: config.executionStrategy,
    stages: {
      form: {
        extractedDimensions,
        detectedConditions,
      },
      vision: {
        dispatchedCapabilities: dispatchedCaps,
        telemetrySignals: visionSignals,
      },
      scoring: {
        fusedDimensionScores: fusedScores,
        skinProfile,
        severityTiers,
        totalScore,
      },
      matching: {
        amRoutine,
        pmRoutine,
        contraindicationWarnings,
      },
    },
    timings,
  };
}
