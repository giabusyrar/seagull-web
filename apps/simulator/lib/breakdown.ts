// The per-dimension view of a form evaluation: the score core sent, and, where
// core reports it, how the score was blended from its sources.
import type { Contribution, DimensionBreakdown, EvaluationOutput } from './types/form';

export interface DimensionRow {
  key: string;
  /** The score in dimension_scores; absent for a dimension core did not score. */
  score?: number;
  scored: boolean;
  /** Sources that made the score, largest weight first. */
  contributions: [string, Contribution][];
  missing: string[];
  reason?: string;
  /** false: this core sends no breakdown, so how the score was made is unknown here. */
  hasBreakdown: boolean;
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Every dimension in dimension_scores, plus any the breakdown lists as not
 * scored (they have no score and take no part in the total). Ordered as core
 * sent dimension_scores, the unscored ones after.
 */
export function dimensionRows(r: EvaluationOutput): DimensionRow[] {
  const scores = isObj(r.dimension_scores) ? r.dimension_scores : {};
  const bd: Record<string, DimensionBreakdown> = isObj(r.dimension_breakdown) ? r.dimension_breakdown : {};
  const keys = [...Object.keys(scores), ...Object.keys(bd).filter((k) => !(k in scores))];
  return keys.map((key) => {
    const b = isObj(bd[key]) ? bd[key] : undefined;
    const score = typeof scores[key] === 'number' ? scores[key] : undefined;
    const contributions = Object.entries(isObj(b?.contributions) ? b.contributions : {})
      .filter((e): e is [string, Contribution] => isObj(e[1]))
      .sort((a, c) => (c[1].weight ?? 0) - (a[1].weight ?? 0));
    return {
      key,
      score,
      scored: b ? b.scored !== false : score !== undefined,
      contributions,
      missing: Array.isArray(b?.missing) ? b.missing.map(String) : [],
      reason: typeof b?.reason === 'string' ? b.reason : undefined,
      hasBreakdown: !!b,
    };
  });
}
