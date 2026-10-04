import { withTenantScope } from '../core/scope';
import type { RulesetSimulationResponse, ScoreRuleset } from './types';

/**
 * Score-engine (and form-engine survey) calls made by the score studio.
 * Score Engine is reached through the API Gateway "Core Engine API"
 * collection, which forwards `/core/score-engine/*` to the engine host and
 * injects the API key. Routes are registered as bare resources (e.g.
 * `/core/score-engine/rulesets`).
 */

const SCORE = '/core/score-engine';

/**
 * Every tenant's rulesets, scoped explicitly so the gateway cannot narrow
 * the list to one brand. Null when the response carries no list.
 */
export async function listRulesets(): Promise<ScoreRuleset[] | null> {
  const data = await (await fetch(withTenantScope(`${SCORE}/rulesets`))).json();
  return Array.isArray(data.rulesets) ? data.rulesets : null;
}

async function throwFromBody(res: Response, fallback: string): Promise<never> {
  const errData = await res.json();
  throw new Error(errData.error || fallback);
}

/** Creates (no id) or updates a ruleset. Throws the engine's error message. */
export async function saveRuleset(ruleset: Partial<ScoreRuleset>): Promise<void> {
  const isEdit = !!ruleset.id;
  const res = await fetch(isEdit ? `${SCORE}/rulesets/${ruleset.id}` : `${SCORE}/rulesets`, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleset),
  });
  if (!res.ok) await throwFromBody(res, 'Failed to save skin grading framework');
}

/** Throws the engine's error message. */
export async function deleteRuleset(id: string): Promise<void> {
  const res = await fetch(`${SCORE}/rulesets/${id}`, { method: 'DELETE' });
  if (!res.ok) await throwFromBody(res, 'Failed to delete ruleset');
}

export interface SimulationRequest {
  schema: string;
  form_scores: Record<string, number>;
  vision_scores: Record<string, number>;
  age_years?: number;
  customer_condition: Record<string, boolean>;
}

/** Where the simulator posts; also shown in the simulator UI. */
export const SIMULATE_PATH = `${SCORE}/simulate`;

/** POST /simulate. Null when the engine answers with an error status. */
export async function simulateRuleset(body: SimulationRequest): Promise<RulesetSimulationResponse | null> {
  const res = await fetch(SIMULATE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok ? ((await res.json()) as RulesetSimulationResponse) : null;
}

/**
 * The tenant's surveys as form-engine returns them (a list, a `{surveys}`
 * wrapper or a single survey). Null on an error status.
 *
 * form/api.ts lists the same route with different edge cases (no-store
 * cache, `{forms}`, throws on error); the score studio's behaviour is kept
 * as it was rather than merged here.
 */
export async function fetchTenantSurveys(brandId: string, applicationId: string): Promise<unknown | null> {
  const res = await fetch(
    `/core/form-engine/survey?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`,
  );
  return res.ok ? res.json() : null;
}

/** A fetchTenantSurveys response as a list. */
export function surveyList<T = { code?: string; schema?: string }>(data: unknown): T[] {
  const d = data as { surveys?: unknown; code?: unknown } | null;
  return Array.isArray(data) ? data : Array.isArray(d?.surveys) ? (d!.surveys as T[]) : d?.code ? [data as T] : [];
}

export interface SkinConditionOption {
  code: string;
  name: string;
  visionCapabilities?: string[];
}

/**
 * Skin conditions from the host app's /api/skin-conditions route. The path
 * belongs to the dashboard, not this package (audit item 4); moved, not yet
 * injected.
 */
export async function listSkinConditions(): Promise<SkinConditionOption[]> {
  const data = await (await fetch('/api/skin-conditions')).json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}
