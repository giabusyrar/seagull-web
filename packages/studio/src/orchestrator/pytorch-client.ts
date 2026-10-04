// Maps a capability (backed by an uploaded ONNX model, one score 0-100 per
// capability) to the display metric key(s) it feeds.
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

export interface CapabilityDispatchResult {
  /**
   * Measured values only, keyed by display metric. A capability the model
   * server did not score is absent — never filled in with a stand-in, so a
   * caller cannot mistake a guess for a measurement.
   */
  telemetry: Record<string, number>;
  /** Capabilities the server could not run, with its reason. */
  unavailable: Record<string, string>;
  /** Capabilities asked for that the response said nothing about. */
  missing: string[];
  /** Why nothing was dispatched at all; absent when the call succeeded. */
  error?: string;
}

const empty = (error?: string, capabilities: string[] = []): CapabilityDispatchResult => ({
  telemetry: {},
  unavailable: {},
  missing: [...capabilities],
  ...(error ? { error } : {}),
});

/**
 * Dispatch capabilities to the model server
 * (POST <serviceUrl>, /api/v1/models/dispatch-capabilities).
 *
 * This used to return a table of invented scores — sebum 72, acne 65 and so
 * on — whenever a capability had no model, the endpoint was unreachable or
 * the URL looked like a mock. Those numbers were shaped exactly like measured
 * ones, so nothing downstream could tell them apart. They are gone: what was
 * not measured is simply absent, and the reason travels with the result.
 */
export async function dispatchPyTorchCapabilities(params: {
  serviceUrl: string;
  timeoutMs: number;
  capabilities: string[];
  images?: { view: string; data: string }[];
  /**
   * Data-plane key, when the model server is reached through the gateway
   * (it answers 401 without one). Supplied by the caller rather than read
   * here, so a browser bundle never carries it.
   */
  apiKey?: string;
}): Promise<CapabilityDispatchResult> {
  const { serviceUrl, timeoutMs, capabilities, images, apiKey } = params;

  if (!capabilities || capabilities.length === 0) return empty();
  if (!serviceUrl) return empty('No capability dispatch service: the model registry (worker-models) was retired; a configOverride must name one.', capabilities);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 3000);

    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
      body: JSON.stringify({ capabilities, images }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) {
      return empty(`Model server answered HTTP ${res.status}.`, capabilities);
    }

    const data = await res.json();
    const scored: Record<string, number> = data.telemetry || {};
    // Additive field from the model server: capabilities whose model could
    // not be loaded, as {capability: reason}.
    const unavailable: Record<string, string> = data.unavailableCapabilities || {};

    const telemetry: Record<string, number> = {};
    const missing: string[] = [];
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
      err instanceof Error && err.name === 'AbortError'
        ? 'Model server did not answer in time.'
        : `Model server could not be reached: ${err instanceof Error ? err.message : String(err)}`,
      capabilities,
    );
  }
}
