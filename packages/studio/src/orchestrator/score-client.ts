// Scores come from core-engine's score engine
// (POST /core/score-engine/evaluate/:code — seagull-core internal/score,
// EvaluateV2). :code is a ruleset code; the ruleset's linked questionnaire
// (form_survey_code) interprets the raw answers, its blend config fuses the
// sources, and its JDM model decides the skin profile.
//
// The pipeline used to do all of that itself: it invented form scores from a
// skin_type answer (oily -> sebum 75), blended form and vision with its own
// weights, and decided a Baumann code with its own cut-offs and profile
// names. None of it came from a ruleset. When the engine cannot be reached
// or refuses, this returns no scores and says why.

import type { ScoreDimensionBreakdown } from './types';
import { DEFAULT_SCORE_TIMEOUT_MS } from './pipeline-defaults';

/** Where the score engine's evaluate endpoint is; the ruleset code is appended. */
export const DEFAULT_SCORE_ENGINE_PATH = '/core/score-engine/evaluate';

/** core-engine's dry-run header (internal/dryrun): score without storing or requiring a customer. */
const DRY_RUN_HEADER = 'X-Dry-Run';

export interface ScoreResult {
  rulesetCode?: string;
  /** HEALTH scores (100 = healthy), scored dimensions only. */
  dimensionScores: Record<string, number>;
  totalScore?: number;
  skinProfile?: {
    code: string;
    name: string;
    category?: string;
    description?: string;
    complete: boolean;
    axisValues?: Record<string, string>;
  };
  breakdown: Record<string, ScoreDimensionBreakdown>;
  missingDimensions: string[];
  customerConditions: Record<string, boolean>;
  warnings: string[];
  /** Why there are no scores; absent when the engine scored. */
  error?: string;
}

interface EngineDimension {
  scored?: boolean;
  final_score?: number | null;
  axis?: string | null;
}

interface EngineResponse {
  success?: boolean;
  code?: string;
  total_score?: number;
  dimensions?: Record<string, EngineDimension>;
  dimension_breakdown?: Record<string, ScoreDimensionBreakdown>;
  skin_profile?: {
    code?: string;
    name?: string;
    category?: string;
    description?: string;
    complete?: boolean;
    axis_values?: Record<string, string>;
  };
  customer_condition?: Record<string, boolean>;
  warnings?: string[];
}

const none = (error: string, warnings: string[] = []): ScoreResult => ({
  dimensionScores: {},
  breakdown: {},
  missingDimensions: [],
  customerConditions: {},
  warnings,
  error,
});

/** The engine's own explanation: `{error}`, `{errors: [...]}` or both. */
async function engineError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: unknown; errors?: unknown } | null;
  const parts: string[] = [];
  if (typeof body?.error === 'string' && body.error) parts.push(body.error);
  if (Array.isArray(body?.errors)) parts.push(...body.errors.map((e) => (typeof e === 'string' ? e : JSON.stringify(e))));
  return `Score engine answered HTTP ${res.status}${parts.length ? `: ${parts.join('; ')}` : '.'}`;
}

export async function evaluateScore(params: {
  /** The evaluate endpoint without the ruleset code. */
  url: string;
  rulesetCode: string;
  brandId: string;
  applicationId: string;
  answers: Record<string, unknown>;
  customerId?: string;
  dryRun?: boolean;
  /** Sources other than form and vision, as the ruleset declares them. */
  sourceSignals?: Record<string, Record<string, number>>;
  /** Data-plane key when the engine is reached through the gateway directly. Server-side only. */
  apiKey?: string;
  timeoutMs?: number;
}): Promise<ScoreResult> {
  const { url, rulesetCode, brandId, applicationId, answers, customerId, dryRun, sourceSignals, apiKey, timeoutMs } =
    params;

  if (!url) return none('No score engine configured (SCORE_ENGINE_URL).');
  if (!rulesetCode) return none('No scoring ruleset named.');

  const form = new FormData();
  form.append('brand_id', brandId);
  form.append('application_id', applicationId);
  if (customerId) form.append('customer_id', customerId);
  if (Object.keys(answers).length) form.append('data', JSON.stringify(answers));
  if (sourceSignals && Object.keys(sourceSignals).length) form.append('source_signals', JSON.stringify(sourceSignals));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_SCORE_TIMEOUT_MS);

    // No Content-Type: fetch sets the multipart boundary itself.
    const res = await fetch(`${url}/${encodeURIComponent(rulesetCode)}`, {
      method: 'POST',
      headers: {
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
        ...(dryRun ? { [DRY_RUN_HEADER]: 'true' } : {}),
      },
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return none(await engineError(res));

    const data = (await res.json()) as EngineResponse;
    if (data?.success === false) return none('Score engine reported a failure.', data.warnings || []);

    const dimensionScores: Record<string, number> = {};
    for (const [key, dim] of Object.entries(data.dimensions || {})) {
      if (dim?.scored !== false && typeof dim?.final_score === 'number') dimensionScores[key] = dim.final_score;
    }
    const breakdown = data.dimension_breakdown || {};
    const missingDimensions = Object.entries(breakdown)
      .filter(([, b]) => !b.scored)
      .map(([key]) => key);

    // core computes total_score over axis dimensions only and reports 0 when
    // none had data. A 0 with no scored axis is "no total", not "critical".
    const anyAxisScored = Object.values(data.dimensions || {}).some(
      (d) => d?.scored !== false && typeof d?.final_score === 'number' && !!d.axis,
    );

    const profile = data.skin_profile;
    return {
      ...(data.code ? { rulesetCode: data.code } : {}),
      dimensionScores,
      ...(anyAxisScored && typeof data.total_score === 'number' ? { totalScore: data.total_score } : {}),
      ...(profile?.code
        ? {
            skinProfile: {
              code: profile.code,
              name: profile.name || '',
              ...(profile.category ? { category: profile.category } : {}),
              ...(profile.description ? { description: profile.description } : {}),
              complete: profile.complete === true,
              ...(profile.axis_values ? { axisValues: profile.axis_values } : {}),
            },
          }
        : {}),
      breakdown,
      missingDimensions,
      customerConditions: data.customer_condition || {},
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
      ...(Object.keys(dimensionScores).length ? {} : { error: 'The score engine scored no dimension for these answers.' }),
    };
  } catch (err) {
    return none(
      err instanceof Error && err.name === 'AbortError'
        ? 'Score engine did not answer in time.'
        : `Score engine could not be reached: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
