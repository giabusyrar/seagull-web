'use strict';

var shared = require('@gateway-experience/shared');

// src/orchestrator/capability-registry.ts
var cachedConditions = null;
var lastFetchTime = 0;
var CACHE_TTL_MS = 10 * 60 * 1e3;
async function fetchSkinConditionsFromDb(skinConditionsUrl) {
  const now = Date.now();
  if (cachedConditions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConditions;
  }
  try {
    const res = await fetch(skinConditionsUrl, { cache: "no-store" });
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
async function resolveRequiredCapabilitiesFromDb(detectedConditions, skinConditionsUrl) {
  const allDbConditions = await fetchSkinConditionsFromDb(skinConditionsUrl);
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
async function resolveRequiredCapabilities(detectedConditions, skinConditionsUrl) {
  return resolveRequiredCapabilitiesFromDb(detectedConditions, skinConditionsUrl);
}

// src/orchestrator/pipeline-defaults.ts
var DEFAULT_VISION_TIMEOUT_MS = 3e3;
var DEFAULT_SCORE_TIMEOUT_MS = 5e3;
var DEFAULT_MATCH_TIMEOUT_MS = 5e3;
var DEFAULT_PIPELINE_SETTINGS = {
  executionStrategy: "dynamic_capability_dispatch",
  vision: { timeoutMs: DEFAULT_VISION_TIMEOUT_MS },
  scoring: { timeoutMs: DEFAULT_SCORE_TIMEOUT_MS },
  matching: { timeoutMs: DEFAULT_MATCH_TIMEOUT_MS }
};

// src/orchestrator/pytorch-client.ts
var empty = (error, capabilities = []) => ({
  telemetry: {},
  unavailable: {},
  missing: [...capabilities],
  ...error ? { error } : {}
});
async function dispatchPyTorchCapabilities(params) {
  const { serviceUrl, timeoutMs, capabilities, images, apiKey } = params;
  if (!capabilities || capabilities.length === 0) return empty();
  if (!serviceUrl) return empty("No capability dispatch service: the model registry (worker-models) was retired; a configOverride must name one.", capabilities);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_VISION_TIMEOUT_MS);
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
      if (typeof scored[cap] === "number") {
        telemetry[cap] = scored[cap];
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
var DEFAULT_SCORE_ENGINE_PATH = "/core/score-engine/evaluate";
var none = (error, warnings = []) => ({
  dimensionScores: {},
  breakdown: {},
  missingDimensions: [],
  customerConditions: {},
  warnings,
  error
});
async function engineError(res) {
  const body = await res.json().catch(() => null);
  const parts = [];
  if (typeof body?.error === "string" && body.error) parts.push(body.error);
  if (Array.isArray(body?.errors)) parts.push(...body.errors.map((e) => typeof e === "string" ? e : JSON.stringify(e)));
  return `Score engine answered HTTP ${res.status}${parts.length ? `: ${parts.join("; ")}` : "."}`;
}
async function evaluateScore(params) {
  const { url, rulesetCode, brandId, applicationId, answers, customerId, dryRun, sourceSignals, apiKey, timeoutMs } = params;
  if (!url) return none("No score engine configured (SCORE_ENGINE_URL).");
  if (!rulesetCode) return none("No scoring ruleset named.");
  const form = new FormData();
  form.append("brand_id", brandId);
  form.append("application_id", applicationId);
  if (customerId) form.append("customer_id", customerId);
  if (Object.keys(answers).length) form.append("data", JSON.stringify(answers));
  if (sourceSignals && Object.keys(sourceSignals).length) form.append("source_signals", JSON.stringify(sourceSignals));
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_SCORE_TIMEOUT_MS);
    const res = await fetch(`${url}/${encodeURIComponent(rulesetCode)}`, {
      method: "POST",
      headers: {
        ...apiKey ? { "x-api-key": apiKey } : {},
        ...dryRun ? { [shared.DRY_RUN_HEADER]: "true" } : {}
      },
      body: form,
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return none(await engineError(res));
    const data = await res.json();
    if (data?.success === false) return none("Score engine reported a failure.", data.warnings || []);
    const dimensionScores = {};
    for (const [key, dim] of Object.entries(data.dimensions || {})) {
      if (dim?.scored !== false && typeof dim?.final_score === "number") dimensionScores[key] = dim.final_score;
    }
    const breakdown = data.dimension_breakdown || {};
    const missingDimensions = Object.entries(breakdown).filter(([, b]) => !b.scored).map(([key]) => key);
    const anyAxisScored = Object.values(data.dimensions || {}).some(
      (d) => d?.scored !== false && typeof d?.final_score === "number" && !!d.axis
    );
    const profile = data.skin_profile;
    return {
      ...data.code ? { rulesetCode: data.code } : {},
      dimensionScores,
      ...anyAxisScored && typeof data.total_score === "number" ? { totalScore: data.total_score } : {},
      ...profile?.code ? {
        skinProfile: {
          code: profile.code,
          name: profile.name || "",
          ...profile.category ? { category: profile.category } : {},
          ...profile.description ? { description: profile.description } : {},
          complete: profile.complete === true,
          ...profile.axis_values ? { axisValues: profile.axis_values } : {}
        }
      } : {},
      breakdown,
      missingDimensions,
      customerConditions: data.customer_condition || {},
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
      ...Object.keys(dimensionScores).length ? {} : { error: "The score engine scored no dimension for these answers." }
    };
  } catch (err) {
    return none(
      err instanceof Error && err.name === "AbortError" ? "Score engine did not answer in time." : `Score engine could not be reached: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// src/orchestrator/match-client.ts
var DEFAULT_MATCH_ENGINE_PATH = "/core/match-engine/evaluate";
function toRoutine(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.filter((s) => s?.primary_product).map((s) => ({
    step: s.step_name || (s.step_number ? `Step ${s.step_number}` : s.category || "Step"),
    productName: s.primary_product?.name || "",
    // The engine's own score. Absent rather than invented when it sends none.
    ...typeof s.primary_product?.match_score === "number" ? { matchScore: s.primary_product.match_score } : {},
    reason: (s.primary_product?.why_selected || []).join("; ")
  }));
}
async function fetchRegimens(params) {
  const { url, brandId, applicationId, dimensionScores, skinProfile, customerConditions, strategyId, timeoutMs } = params;
  const none2 = (error) => ({
    amRoutine: [],
    pmRoutine: [],
    phases: {},
    warnings: [],
    error
  });
  if (!url) return none2("No match engine configured (MATCH_ENGINE_URL).");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_MATCH_TIMEOUT_MS);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand_id: brandId,
        application_id: applicationId,
        dimension_scores: dimensionScores,
        ...skinProfile ? {
          skin_profile: {
            code: skinProfile.code,
            name: skinProfile.name,
            ...skinProfile.description ? { description: skinProfile.description } : {},
            ...skinProfile.category ? { category: skinProfile.category } : {},
            ...skinProfile.axisValues ? { axis_values: skinProfile.axisValues } : {}
          }
        } : {},
        ...customerConditions ? { customer_conditions: customerConditions } : {},
        ...strategyId ? { strategy_id: strategyId } : {}
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return none2(`Match engine answered HTTP ${res.status}.`);
    const data = await res.json();
    if (data?.success === false) return none2("Match engine reported a failure.");
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
    return none2(
      err instanceof Error && err.name === "AbortError" ? "Match engine did not answer in time." : `Match engine could not be reached: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// src/orchestrator/pipeline-executor.ts
function pipelineEnvFromProcess() {
  return {
    matchEngineUrl: process.env.MATCH_ENGINE_URL,
    scoreEngineUrl: process.env.SCORE_ENGINE_URL,
    visionDispatchUrl: process.env.VISION_DISPATCH_URL,
    gatewayApiKey: process.env.GATEWAY_API_KEY
  };
}
var PipelineInputError = class extends Error {
  constructor(missing) {
    super(`The assessment pipeline needs ${missing.join(", ")}; none was supplied and none is assumed.`);
    this.missing = missing;
    this.name = "PipelineInputError";
  }
};
var defaultClients = () => ({
  resolveRequiredCapabilities: resolveRequiredCapabilitiesFromDb,
  fetchSkinConditions: fetchSkinConditionsFromDb,
  dispatchCapabilities: dispatchPyTorchCapabilities,
  evaluateScore,
  fetchRegimens
});
function resolvePipelineConfig(payload, settings, env) {
  const o = payload.configOverride || {};
  const config = {
    brandId: o.brandId || payload.brandId || "",
    applicationId: o.applicationId || payload.applicationId || "",
    executionStrategy: o.executionStrategy || settings.executionStrategy,
    vision: {
      timeoutMs: settings.vision.timeoutMs,
      ...o.vision,
      // worker-models, which served capability dispatch, was retired with
      // the model registry (Seagull-core, 2026-10-03). A deployment names a
      // dispatch service in its environment; without one the vision stage
      // reports that nothing was dispatched, and why.
      serviceUrl: env.visionDispatchUrl || ""
    },
    scoring: {
      rulesetCode: payload.rulesetCode || "",
      timeoutMs: settings.scoring.timeoutMs,
      // The score engine origin when the pipeline runs on a server; otherwise
      // the app's own path, which the dashboard proxies to the gateway.
      ...o.scoring,
      serviceUrl: `${env.scoreEngineUrl || payload.baseUrl || ""}${DEFAULT_SCORE_ENGINE_PATH}`
    },
    matching: {
      ...settings.matching,
      ...o.matching,
      serviceUrl: `${env.matchEngineUrl || payload.baseUrl || ""}${DEFAULT_MATCH_ENGINE_PATH}`
    }
  };
  const missing = [
    !config.brandId && "brandId",
    !config.applicationId && "applicationId",
    !config.scoring.rulesetCode && "rulesetCode"
  ].filter((m) => !!m);
  if (missing.length) throw new PipelineInputError(missing);
  return config;
}
async function executeAssessmentPipeline(payload, deps) {
  const startTime = Date.now();
  const timings = {};
  const env = deps.env ?? pipelineEnvFromProcess();
  const clients = { ...defaultClients(), ...deps.clients };
  const config = resolvePipelineConfig(payload, deps.defaults ?? DEFAULT_PIPELINE_SETTINGS, env);
  const skinConditionsUrl = `${payload.baseUrl || ""}${deps.routes.skinConditions}`;
  const t0 = Date.now();
  const answers = payload.answers || {};
  const detectedConditions = Array.isArray(payload.concerns) ? [...payload.concerns] : [];
  timings["stage1_form_ms"] = Date.now() - t0;
  const t1 = Date.now();
  let dispatchedCaps = [];
  if (config.executionStrategy === "dynamic_capability_dispatch") {
    dispatchedCaps = await clients.resolveRequiredCapabilities(detectedConditions, skinConditionsUrl);
  } else if (config.executionStrategy === "parallel_late_fusion" || config.executionStrategy === "vision_only") {
    const allConditions = await clients.fetchSkinConditions(skinConditionsUrl);
    const allCaps = /* @__PURE__ */ new Set();
    allConditions.forEach((c) => {
      (c.visionCapabilities || []).forEach((cap) => allCaps.add(cap));
    });
    dispatchedCaps = Array.from(allCaps);
  }
  const visionDispatch = await clients.dispatchCapabilities({
    serviceUrl: config.vision.serviceUrl,
    timeoutMs: config.vision.timeoutMs,
    capabilities: dispatchedCaps,
    images: payload.images,
    apiKey: env.gatewayApiKey
  });
  const visionSignals = visionDispatch.telemetry;
  timings["stage2_vision_ms"] = Date.now() - t1;
  const t2 = Date.now();
  const pipelineNotes = [];
  if (Object.keys(visionSignals).length) {
    pipelineNotes.push(
      "PIPELINE: dispatched vision readings were not sent to the score engine; it reads vision only from a submitted photo."
    );
  }
  const score = await clients.evaluateScore({
    url: config.scoring.serviceUrl,
    rulesetCode: config.scoring.rulesetCode,
    brandId: config.brandId,
    applicationId: config.applicationId,
    // vision_only scores from no form answers; the engine says if that leaves it nothing.
    answers: config.executionStrategy === "vision_only" ? {} : answers,
    customerId: payload.customerId,
    dryRun: payload.dryRun,
    apiKey: env.gatewayApiKey,
    timeoutMs: config.scoring.timeoutMs
  });
  timings["stage3_scoring_ms"] = Date.now() - t2;
  const t3 = Date.now();
  const hasScores = Object.keys(score.dimensionScores).length > 0;
  const regimens = hasScores ? await clients.fetchRegimens({
    url: config.matching.serviceUrl,
    brandId: config.brandId,
    applicationId: config.applicationId,
    dimensionScores: score.dimensionScores,
    skinProfile: score.skinProfile,
    customerConditions: { ...score.customerConditions, ...payload.customerConditions },
    strategyId: config.matching.strategyId,
    timeoutMs: config.matching.timeoutMs
  }) : {
    amRoutine: [],
    pmRoutine: [],
    phases: {},
    warnings: [],
    error: "Not requested: the score engine returned no scores to match on."
  };
  timings["stage4_matching_ms"] = Date.now() - t3;
  timings["total_pipeline_ms"] = Date.now() - startTime;
  return {
    // Scored or not: a run whose scoring failed is not a success, whatever
    // the other stages did (each stage still carries its own error).
    success: !score.error,
    pipelineId: `pipe_run_${Date.now()}`,
    executionStrategy: config.executionStrategy,
    stages: {
      form: {
        answeredQuestions: Object.keys(answers),
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
        ...score.rulesetCode ? { rulesetCode: score.rulesetCode } : {},
        fusedDimensionScores: score.dimensionScores,
        ...score.skinProfile ? { skinProfile: score.skinProfile } : {},
        ...score.totalScore !== void 0 ? { totalScore: score.totalScore } : {},
        ...Object.keys(score.breakdown).length ? { dimensionBreakdown: score.breakdown } : {},
        ...score.missingDimensions.length ? { missingDimensions: score.missingDimensions } : {},
        ...Object.keys(score.customerConditions).length ? { customerConditions: score.customerConditions } : {},
        warnings: [...score.warnings, ...pipelineNotes],
        ...score.error ? { scoreError: score.error } : {}
      },
      matching: {
        amRoutine: regimens.amRoutine,
        pmRoutine: regimens.pmRoutine,
        contraindicationWarnings: regimens.warnings,
        ...Object.keys(regimens.phases).length ? { phases: regimens.phases } : {},
        ...regimens.error ? { regimenError: regimens.error } : {}
      }
    },
    timings
  };
}

exports.DEFAULT_MATCH_ENGINE_PATH = DEFAULT_MATCH_ENGINE_PATH;
exports.DEFAULT_MATCH_TIMEOUT_MS = DEFAULT_MATCH_TIMEOUT_MS;
exports.DEFAULT_PIPELINE_SETTINGS = DEFAULT_PIPELINE_SETTINGS;
exports.DEFAULT_SCORE_ENGINE_PATH = DEFAULT_SCORE_ENGINE_PATH;
exports.DEFAULT_SCORE_TIMEOUT_MS = DEFAULT_SCORE_TIMEOUT_MS;
exports.DEFAULT_VISION_TIMEOUT_MS = DEFAULT_VISION_TIMEOUT_MS;
exports.PipelineInputError = PipelineInputError;
exports.dispatchPyTorchCapabilities = dispatchPyTorchCapabilities;
exports.evaluateScore = evaluateScore;
exports.executeAssessmentPipeline = executeAssessmentPipeline;
exports.fetchRegimens = fetchRegimens;
exports.fetchSkinConditionsFromDb = fetchSkinConditionsFromDb;
exports.invalidateSkinConditionCache = invalidateSkinConditionCache;
exports.pipelineEnvFromProcess = pipelineEnvFromProcess;
exports.resolvePipelineConfig = resolvePipelineConfig;
exports.resolveRequiredCapabilities = resolveRequiredCapabilities;
exports.resolveRequiredCapabilitiesFromDb = resolveRequiredCapabilitiesFromDb;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map