import { DEFAULT_VISION_TIMEOUT_MS } from './pipeline-defaults';

// Readings are keyed by the capability that produced them, exactly as the
// model server returned them. This file used to rename them onto dimension
// keys through its own capability -> dimension table (sebum_shine_detector
// -> sebum ...), a mapping no data source backed; ref_skin_conditions is
// where a capability's dimension lives (capability-registry.ts), and scoring
// is core-engine's, which reads vision through the ruleset's own mapping.

export interface CapabilityDispatchResult {
  /**
   * Measured values only, keyed by capability. A capability the model
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
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_VISION_TIMEOUT_MS);

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
      if (typeof scored[cap] === 'number') {
        telemetry[cap] = scored[cap];
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
