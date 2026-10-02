// src/orchestrator/capability-registry.ts
var cachedConditions = null;
var lastFetchTime = 0;
var CACHE_TTL_MS = 10 * 60 * 1e3;
async function fetchSkinConditionsFromDb(baseUrl = "") {
  const now = Date.now();
  if (cachedConditions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConditions;
  }
  try {
    const endpoint = baseUrl ? `${baseUrl}/api/skin-conditions` : "/api/skin-conditions";
    const res = await fetch(endpoint, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const records = Array.isArray(data.items) ? data.items : Array.isArray(data.skinConditions) ? data.skinConditions : Array.isArray(data) ? data : [];
      cachedConditions = records;
      lastFetchTime = now;
      return cachedConditions;
    }
  } catch (err) {
    console.warn("Unable to query skin_conditions from database endpoint:", err);
  }
  return cachedConditions || [];
}
function invalidateSkinConditionCache() {
  cachedConditions = null;
  lastFetchTime = 0;
}
async function resolveRequiredCapabilitiesFromDb(detectedConditions, baseUrl = "") {
  const allDbConditions = await fetchSkinConditionsFromDb(baseUrl);
  const matchedCapabilities = /* @__PURE__ */ new Set();
  const normalizedUserConditions = detectedConditions.map((c) => c.toLowerCase().trim());
  for (const condition of allDbConditions) {
    const triggerKeys = (condition.triggerKeys || []).map((k) => k.toLowerCase().trim());
    const conditionCode = (condition.code || "").toLowerCase().trim();
    const isMatched = normalizedUserConditions.includes(conditionCode) || triggerKeys.some(
      (tKey) => normalizedUserConditions.some((uKey) => uKey.includes(tKey) || tKey.includes(uKey))
    );
    if (isMatched && Array.isArray(condition.visionCapabilities)) {
      condition.visionCapabilities.forEach((cap) => {
        if (cap && typeof cap === "string") {
          matchedCapabilities.add(cap.trim());
        }
      });
    }
  }
  return Array.from(matchedCapabilities);
}
async function resolveRequiredCapabilities(detectedConditions, baseUrl = "") {
  return resolveRequiredCapabilitiesFromDb(detectedConditions, baseUrl);
}

// src/orchestrator/pytorch-client.ts
var CAPABILITY_METRIC_MAP = {
  sebum_shine_detector: ["sebum"],
  comedone_pore_detector: ["acne", "pores"],
  acne_lesion_classifier: ["acne"],
  hyperpigmentation_net: ["pigmentation"],
  hypopigmentation_net: ["hypopigmentation"],
  wrinkle_depth_estimator: ["aging"],
  erythema_vascular_net: ["sensitivity", "barrier"],
  texture_desquamation_net: ["hydration", "barrier"]
};
var empty = (error, capabilities = []) => ({
  telemetry: {},
  unavailable: {},
  missing: [...capabilities],
  ...error ? { error } : {}
});
async function dispatchPyTorchCapabilities(params) {
  const { serviceUrl, timeoutMs, capabilities, images, apiKey } = params;
  if (!capabilities || capabilities.length === 0) return empty();
  if (!serviceUrl) return empty("No model server configured (MODEL_SERVER_URL).", capabilities);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 3e3);
    const res = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...apiKey ? { "x-api-key": apiKey } : {}
      },
      body: JSON.stringify({ capabilities, images }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return empty(`Model server answered HTTP ${res.status}.`, capabilities);
    }
    const data = await res.json();
    const scored = data.telemetry || {};
    const unavailable = data.unavailableCapabilities || {};
    const telemetry = {};
    const missing = [];
    for (const cap of capabilities) {
      if (cap in scored) {
        for (const metricKey of CAPABILITY_METRIC_MAP[cap] || []) {
          telemetry[metricKey] = scored[cap];
        }
      } else if (!(cap in unavailable)) {
        missing.push(cap);
      }
    }
    return { telemetry, unavailable, missing };
  } catch (err) {
    return empty(
      err instanceof Error && err.name === "AbortError" ? "Model server did not answer in time." : `Model server could not be reached: ${err instanceof Error ? err.message : String(err)}`,
      capabilities
    );
  }
}

// src/orchestrator/score-fusion.ts
function fuseDimensionScores(formScores, visionScores, weights = {}) {
  const allKeys = Array.from(/* @__PURE__ */ new Set([...Object.keys(formScores), ...Object.keys(visionScores)]));
  const fused = {};
  for (const key of allKeys) {
    const formVal = formScores[key];
    const visionVal = visionScores[key];
    const weightConfig = weights[key] || { formWeight: 0.5, visionWeight: 0.5 };
    if (formVal !== void 0 && visionVal !== void 0) {
      const totalWeight = weightConfig.formWeight + weightConfig.visionWeight || 1;
      const normalizedFormWeight = weightConfig.formWeight / totalWeight;
      const normalizedVisionWeight = weightConfig.visionWeight / totalWeight;
      fused[key] = Math.round(formVal * normalizedFormWeight + visionVal * normalizedVisionWeight);
    } else if (formVal !== void 0) {
      fused[key] = Math.round(formVal);
    } else if (visionVal !== void 0) {
      fused[key] = Math.round(visionVal);
    }
  }
  return fused;
}

// src/orchestrator/match-client.ts
var DEFAULT_MATCH_ENGINE_PATH = "/core/match-engine/evaluate";
function toRoutine(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.filter((s) => s?.primary_product).map((s) => ({
    step: s.step_name || (s.step_number ? `Step ${s.step_number}` : s.category || "Step"),
    productName: s.primary_product?.name || "",
    // The engine's own score. Absent rather than invented when it sends none.
    matchScore: typeof s.primary_product?.match_score === "number" ? s.primary_product.match_score : 0,
    reason: (s.primary_product?.why_selected || []).join("; ")
  }));
}
async function fetchRegimens(params) {
  const { url, brandId, applicationId, dimensionScores, customerConditions, strategyId, timeoutMs } = params;
  const none = (error) => ({
    amRoutine: [],
    pmRoutine: [],
    phases: {},
    warnings: [],
    error
  });
  if (!url) return none("No match engine configured (MATCH_ENGINE_URL).");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 5e3);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: brandId,
        application_id: applicationId,
        dimension_scores: dimensionScores,
        ...customerConditions ? { customer_conditions: customerConditions } : {},
        ...strategyId ? { strategy_id: strategyId } : {}
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return none(`Match engine answered HTTP ${res.status}.`);
    const data = await res.json();
    if (data?.success === false) return none("Match engine reported a failure.");
    const amRoutine = toRoutine(data?.regimens?.am_routine);
    const pmRoutine = toRoutine(data?.regimens?.pm_routine);
    const phases = {};
    const rawPhases = data?.regimens?.phases;
    if (rawPhases && typeof rawPhases === "object") {
      for (const [name, steps] of Object.entries(rawPhases)) {
        const mapped = toRoutine(steps || void 0);
        if (mapped.length) phases[name] = mapped;
      }
    }
    const warnings = Array.isArray(data?.clinical_conflict_matrix?.warnings) ? data.clinical_conflict_matrix.warnings : [];
    const nothing = !amRoutine.length && !pmRoutine.length && !Object.keys(phases).length;
    return {
      amRoutine,
      pmRoutine,
      phases,
      warnings,
      // Answered, but with no step carrying a product: say so rather than
      // leaving an empty panel to be read as "nothing suits you".
      ...nothing ? { error: "The match engine returned no regimen for this brand and application." } : {}
    };
  } catch (err) {
    return none(
      err instanceof Error && err.name === "AbortError" ? "Match engine did not answer in time." : `Match engine could not be reached: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// src/orchestrator/pipeline-executor.ts
var DEFAULT_MODEL_SERVER_URL = "http://127.0.0.1:8096";
async function executeAssessmentPipeline(payload) {
  const startTime = Date.now();
  const timings = {};
  const config = {
    brandId: payload.brandId || "brand_wardah",
    applicationId: payload.applicationId || "app_kiosk",
    executionStrategy: payload.configOverride?.executionStrategy || "dynamic_capability_dispatch",
    vision: {
      // Capability dispatch lives on worker-models (the model server), at
      // /api/v1/models/dispatch-capabilities. It was addressed here as
      // /api/v1/dispatch-capabilities on the skin worker, which that worker
      // has never served — the call 404'd unless a configOverride supplied
      // the whole URL.
      serviceUrl: payload.configOverride?.vision?.serviceUrl || `${process.env.MODEL_SERVER_URL || DEFAULT_MODEL_SERVER_URL}/api/v1/models/dispatch-capabilities`,
      timeoutMs: 3e3},
    form: {
      dimensionMappingRules: {
        q_sebum: "sebum",
        q_sensitivity: "sensitivity",
        q_pigmentation: "pigmentation",
        q_aging: "aging",
        q_barrier: "barrier"
      }
    },
    scoring: {
      dimensionFusionWeights: {
        sebum: { formWeight: 0.4, visionWeight: 0.6 },
        acne: { formWeight: 0.3, visionWeight: 0.7 },
        pigmentation: { formWeight: 0.4, visionWeight: 0.6 },
        aging: { formWeight: 0.5, visionWeight: 0.5 },
        sensitivity: { formWeight: 0.6, visionWeight: 0.4 },
        barrier: { formWeight: 0.5, visionWeight: 0.5 }
      }
    },
    matching: {
      // MATCH_ENGINE_URL when the pipeline runs on a server; otherwise the
      // app's own path, which the dashboard proxies to the gateway.
      serviceUrl: process.env.MATCH_ENGINE_URL ? `${process.env.MATCH_ENGINE_URL}${DEFAULT_MATCH_ENGINE_PATH}` : `${payload.baseUrl || ""}${DEFAULT_MATCH_ENGINE_PATH}`,
      timeoutMs: 5e3
    },
    ...payload.configOverride || {}
  };
  const t0 = Date.now();
  const extractedDimensions = {};
  const detectedConditions = [];
  const answers = payload.answers || {};
  if (Array.isArray(answers.concerns)) {
    detectedConditions.push(...answers.concerns);
  }
  if (answers.skin_type) {
    if (answers.skin_type === "oily") {
      detectedConditions.push("concern_oiliness");
      extractedDimensions["sebum"] = 75;
    } else if (answers.skin_type === "dry") {
      detectedConditions.push("concern_dryness");
      extractedDimensions["hydration"] = 35;
    } else if (answers.skin_type === "sensitive") {
      detectedConditions.push("concern_redness");
      extractedDimensions["sensitivity"] = 75;
    } else if (answers.skin_type === "combination") {
      detectedConditions.push("concern_oiliness");
      extractedDimensions["sebum"] = 60;
      extractedDimensions["hydration"] = 50;
    }
  }
  for (const [ansKey, dimKey] of Object.entries(config.form.dimensionMappingRules)) {
    if (typeof answers[ansKey] === "number") {
      extractedDimensions[dimKey] = answers[ansKey];
    }
  }
  timings["stage1_form_ms"] = Date.now() - t0;
  const t1 = Date.now();
  let dispatchedCaps = [];
  if (config.executionStrategy === "dynamic_capability_dispatch") {
    dispatchedCaps = await resolveRequiredCapabilitiesFromDb(detectedConditions, payload.baseUrl || "");
  } else if (config.executionStrategy === "parallel_late_fusion" || config.executionStrategy === "vision_only") {
    const allConditions = await fetchSkinConditionsFromDb(payload.baseUrl || "");
    const allCaps = /* @__PURE__ */ new Set();
    allConditions.forEach((c) => {
      (c.visionCapabilities || []).forEach((cap) => allCaps.add(cap));
    });
    dispatchedCaps = Array.from(allCaps);
  }
  const visionDispatch = await dispatchPyTorchCapabilities({
    serviceUrl: config.vision.serviceUrl,
    timeoutMs: config.vision.timeoutMs,
    capabilities: dispatchedCaps,
    images: payload.images,
    // Server-side only: process.env is empty in a browser bundle, so the key
    // is simply absent there rather than shipped to one.
    apiKey: process.env.GATEWAY_API_KEY
  });
  const visionSignals = visionDispatch.telemetry;
  timings["stage2_vision_ms"] = Date.now() - t1;
  const t2 = Date.now();
  const fusedScores = fuseDimensionScores(
    config.executionStrategy === "vision_only" ? {} : extractedDimensions,
    config.executionStrategy === "form_only" ? {} : visionSignals,
    config.scoring.dimensionFusionWeights
  );
  const CODE_DIMENSIONS = ["sebum", "sensitivity", "pigmentation", "aging"];
  const missingDimensions = CODE_DIMENSIONS.filter((d) => typeof fusedScores[d] !== "number");
  const indeterminate = missingDimensions.length > 0;
  const sebumScore = fusedScores.sebum;
  const sensScore = fusedScores.sensitivity;
  const pigScore = fusedScores.pigmentation;
  const agingScore = fusedScores.aging;
  const o_d = sebumScore !== void 0 && sebumScore >= 55 ? "O" : "D";
  const s_r = sensScore !== void 0 && sensScore >= 50 ? "S" : "R";
  const p_n = pigScore !== void 0 && pigScore >= 50 ? "P" : "N";
  const w_t = agingScore !== void 0 && agingScore >= 45 ? "W" : "T";
  const profileCode = indeterminate ? "" : `${o_d}${s_r}${p_n}${w_t}`;
  const profileNames = {
    OSNW: "Oily Sensitive Non-Pigmented Wrinkle-Prone",
    OSNT: "Oily Sensitive Non-Pigmented Tight",
    OSPW: "Oily Sensitive Pigmented Wrinkle-Prone",
    OSPT: "Oily Sensitive Pigmented Tight",
    ORNW: "Oily Resistant Non-Pigmented Wrinkle-Prone",
    ORNT: "Oily Resistant Non-Pigmented Tight",
    DSNW: "Dry Sensitive Non-Pigmented Wrinkle-Prone",
    DSNT: "Dry Sensitive Non-Pigmented Tight",
    DSPW: "Dry Sensitive Pigmented Wrinkle-Prone",
    DSPT: "Dry Sensitive Pigmented Tight",
    DRNW: "Dry Resistant Non-Pigmented Wrinkle-Prone",
    DRNT: "Dry Resistant Non-Pigmented Tight"
  };
  const skinProfile = indeterminate ? {
    code: "",
    name: "Indeterminate",
    indeterminate: true,
    description: `No profile: ${missingDimensions.join(", ")} ${missingDimensions.length === 1 ? "was" : "were"} not scored by the form or the model server.`
  } : {
    code: profileCode,
    name: profileNames[profileCode] || `Diagnostic Profile ${profileCode}`,
    category: o_d === "O" ? "Lipid Imbalanced" : "Alipidic / Barrier Compromised",
    description: `Clinical diagnosis reflects ${o_d === "O" ? "elevated sebum shine" : "reduced barrier moisture"} blended with ${s_r === "S" ? "reactive sensitivity" : "resilient resistance"}.`
  };
  const severityTiers = {};
  if (sebumScore !== void 0) {
    severityTiers.sebum = {
      gradeName: sebumScore >= 70 ? "High Shine / Hyper-Seborrhea" : sebumScore >= 40 ? "Balanced Lipid" : "Dry / Alipidic",
      severity: sebumScore >= 70 ? "severe" : sebumScore >= 50 ? "moderate" : "optimal"
    };
  }
  if (sensScore !== void 0) {
    severityTiers.sensitivity = {
      gradeName: sensScore >= 65 ? "Reactive Erythema" : "Tolerant Resilient",
      severity: sensScore >= 65 ? "severe" : "optimal"
    };
  }
  if (pigScore !== void 0) {
    severityTiers.pigmentation = {
      gradeName: pigScore >= 60 ? "Localized Melasma" : "Uniform Tone",
      severity: pigScore >= 60 ? "moderate" : "optimal"
    };
  }
  const scoredValues = CODE_DIMENSIONS.map((d) => fusedScores[d]).filter(
    (v) => typeof v === "number"
  );
  const totalScore = scoredValues.length ? Math.round(scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length) : 0;
  timings["stage3_scoring_ms"] = Date.now() - t2;
  const t3 = Date.now();
  const isPregnant = payload.customerConditions?.is_pregnant ?? false;
  const usesRetinol = payload.customerConditions?.uses_retinol ?? false;
  const contraindicationWarnings = [];
  if (isPregnant) {
    contraindicationWarnings.push("Pregnancy safety constraint active: Retinoids, Salicylic Acid (>2%), and Hydroquinone excluded.");
  }
  if (usesRetinol) {
    contraindicationWarnings.push("Active retinoid user: High-concentration AHA/BHA exfoliants slotted exclusively for alternate night PM use.");
  }
  const regimens = await fetchRegimens({
    url: config.matching.serviceUrl,
    brandId: config.brandId,
    applicationId: config.applicationId,
    dimensionScores: fusedScores,
    customerConditions: payload.customerConditions,
    timeoutMs: config.matching.timeoutMs
  });
  const amRoutine = regimens.amRoutine;
  const pmRoutine = regimens.pmRoutine;
  contraindicationWarnings.push(...regimens.warnings);
  timings["stage4_matching_ms"] = Date.now() - t3;
  timings["total_pipeline_ms"] = Date.now() - startTime;
  return {
    success: true,
    pipelineId: `pipe_run_${Date.now()}`,
    executionStrategy: config.executionStrategy,
    stages: {
      form: {
        extractedDimensions,
        detectedConditions
      },
      vision: {
        dispatchedCapabilities: dispatchedCaps,
        telemetrySignals: visionSignals,
        ...Object.keys(visionDispatch.unavailable).length ? { unavailableCapabilities: visionDispatch.unavailable } : {},
        ...visionDispatch.missing.length ? { missingCapabilities: visionDispatch.missing } : {},
        ...visionDispatch.error ? { dispatchError: visionDispatch.error } : {}
      },
      scoring: {
        fusedDimensionScores: fusedScores,
        skinProfile,
        severityTiers,
        totalScore,
        ...missingDimensions.length ? { missingDimensions: [...missingDimensions] } : {}
      },
      matching: {
        amRoutine,
        pmRoutine,
        contraindicationWarnings,
        ...Object.keys(regimens.phases).length ? { phases: regimens.phases } : {},
        ...regimens.error ? { regimenError: regimens.error } : {}
      }
    },
    timings
  };
}

export { dispatchPyTorchCapabilities, executeAssessmentPipeline, fetchSkinConditionsFromDb, fuseDimensionScores, invalidateSkinConditionCache, resolveRequiredCapabilities, resolveRequiredCapabilitiesFromDb };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map