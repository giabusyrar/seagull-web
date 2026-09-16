// Maps a capability (backed by an uploaded ONNX model, one score 0-100 per
// capability) to the display metric key(s) it feeds. A capability with no
// uploaded model yet keeps using its simulated value below.
const CAPABILITY_METRIC_MAP: Record<string, string[]> = {
  sebum_shine_detector: ['sebum'],
  comedone_pore_detector: ['acne', 'pores'],
  acne_lesion_classifier: ['acne'],
  hyperpigmentation_net: ['pigmentation'],
  hypopigmentation_net: ['hypopigmentation'],
  wrinkle_depth_estimator: ['aging'],
  erythema_vascular_net: ['sensitivity', 'barrier'],
  texture_desquamation_net: ['hydration', 'barrier'],
};

const SIMULATED_METRIC_VALUES: Record<string, number> = {
  sebum: 72,
  acne: 65,
  pores: 58,
  pigmentation: 54,
  hypopigmentation: 40,
  aging: 42,
  sensitivity: 68,
  barrier: 70,
  hydration: 48,
};

export async function dispatchPyTorchCapabilities(params: {
  serviceUrl: string;
  timeoutMs: number;
  capabilities: string[];
  images?: { view: string; data: string }[];
}): Promise<Record<string, number>> {
  const { serviceUrl, timeoutMs, capabilities, images } = params;

  if (!capabilities || capabilities.length === 0) {
    return {};
  }

  // Simulated fallback, keyed by display metric name — used for any
  // capability with no uploaded model (or when the real endpoint is
  // unreachable / not configured).
  const simulatedTelemetry: Record<string, number> = {};
  for (const cap of capabilities) {
    for (const metricKey of CAPABILITY_METRIC_MAP[cap] || []) {
      simulatedTelemetry[metricKey] = SIMULATED_METRIC_VALUES[metricKey];
    }
  }

  if (!serviceUrl || serviceUrl.includes('mock') || serviceUrl.includes('localhost:0')) {
    return simulatedTelemetry;
  }

  // Real endpoint returns telemetry keyed by CAPABILITY code (one score per
  // uploaded model), e.g. { "sebum_shine_detector": 81.2 }. Remap into
  // display metric keys, filling in only the capabilities it actually has a
  // model for and leaving everything else on the simulated fallback.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 3000);

    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capabilities, images }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const realByCapability: Record<string, number> = data.telemetry || {};
      const telemetry = { ...simulatedTelemetry };
      for (const cap of capabilities) {
        if (!(cap in realByCapability)) continue;
        for (const metricKey of CAPABILITY_METRIC_MAP[cap] || []) {
          telemetry[metricKey] = realByCapability[cap];
        }
      }
      return telemetry;
    }
  } catch (err) {
    console.warn('PyTorch inference fallback to telemetry model simulation:', err);
  }

  return simulatedTelemetry;
}
