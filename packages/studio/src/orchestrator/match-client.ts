// Regimen recommendations come from core-engine's match engine
// (POST /core/match-engine/evaluate — seagull-core internal/match).
//
// The pipeline used to build routines from literals in this package: fixed
// product names ("Ceramide Deep Barrier Cream"), fixed match scores (96, 92,
// 90) and fixed reasons, shaped exactly like engine output. Nothing matched
// anything. They are gone; when the engine cannot be reached, the pipeline
// returns no routine and says why.

export interface RoutineStep {
  step: string;
  productName: string;
  matchScore: number;
  reason: string;
}

export interface RegimenResult {
  amRoutine: RoutineStep[];
  pmRoutine: RoutineStep[];
  /**
   * Brand-defined phases, when the engine answers with those instead of the
   * AM/PM pair (its response carries either shape).
   */
  phases: Record<string, RoutineStep[]>;
  /** Warnings the engine raised about ingredient interactions. */
  warnings: string[];
  /** Why there is no regimen — unreachable, refused, or simply none returned. */
  error?: string;
}

interface EngineProduct {
  name?: string;
  brand?: string;
  match_score?: number;
  why_selected?: string[];
}

interface EngineStep {
  step_number?: number;
  step_name?: string;
  category?: string;
  primary_product?: EngineProduct | null;
}

/** Where the match engine is, for a caller that cannot use a relative path. */
export const DEFAULT_MATCH_ENGINE_PATH = '/core/match-engine/evaluate';

function toRoutine(steps: EngineStep[] | undefined): RoutineStep[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .filter((s) => s?.primary_product)
    .map((s) => ({
      step: s.step_name || (s.step_number ? `Step ${s.step_number}` : s.category || 'Step'),
      productName: s.primary_product?.name || '',
      // The engine's own score. Absent rather than invented when it sends none.
      matchScore: typeof s.primary_product?.match_score === 'number' ? s.primary_product.match_score : 0,
      reason: (s.primary_product?.why_selected || []).join('; '),
    }));
}

export async function fetchRegimens(params: {
  url: string;
  brandId: string;
  applicationId: string;
  dimensionScores: Record<string, number>;
  customerConditions?: Record<string, boolean>;
  strategyId?: string;
  timeoutMs?: number;
}): Promise<RegimenResult> {
  const { url, brandId, applicationId, dimensionScores, customerConditions, strategyId, timeoutMs } = params;
  const none = (error: string): RegimenResult => ({
    amRoutine: [],
    pmRoutine: [],
    phases: {},
    warnings: [],
    error,
  });

  if (!url) return none('No match engine configured (MATCH_ENGINE_URL).');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 5000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_id: brandId,
        application_id: applicationId,
        dimension_scores: dimensionScores,
        ...(customerConditions ? { customer_conditions: customerConditions } : {}),
        ...(strategyId ? { strategy_id: strategyId } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return none(`Match engine answered HTTP ${res.status}.`);

    const data = await res.json();
    if (data?.success === false) return none('Match engine reported a failure.');

    const amRoutine = toRoutine(data?.regimens?.am_routine);
    const pmRoutine = toRoutine(data?.regimens?.pm_routine);

    // A brand may define its own phases instead of an AM/PM pair; the engine
    // then answers with `phases`, whose values can be null.
    const phases: Record<string, RoutineStep[]> = {};
    const rawPhases = data?.regimens?.phases;
    if (rawPhases && typeof rawPhases === 'object') {
      for (const [name, steps] of Object.entries(rawPhases as Record<string, EngineStep[] | null>)) {
        const mapped = toRoutine(steps || undefined);
        if (mapped.length) phases[name] = mapped;
      }
    }

    const warnings = Array.isArray(data?.clinical_conflict_matrix?.warnings)
      ? data.clinical_conflict_matrix.warnings
      : [];

    const nothing = !amRoutine.length && !pmRoutine.length && !Object.keys(phases).length;
    return {
      amRoutine,
      pmRoutine,
      phases,
      warnings,
      // Answered, but with no step carrying a product: say so rather than
      // leaving an empty panel to be read as "nothing suits you".
      ...(nothing
        ? { error: 'The match engine returned no regimen for this brand and application.' }
        : {}),
    };
  } catch (err) {
    return none(
      err instanceof Error && err.name === 'AbortError'
        ? 'Match engine did not answer in time.'
        : `Match engine could not be reached: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
