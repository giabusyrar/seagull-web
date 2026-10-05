import type { AssessmentPayload, UnifiedAssessmentResponse } from '@gateway-experience/studio/orchestrator';
import { STUDIO_HOST_ROUTES } from '@/lib/host-routes';

export type PipelineRunResult =
  | { ok: true; data: UnifiedAssessmentResponse }
  | { ok: false; error: string };

/** Runs the assessment pipeline server-side (/api/orchestrator/pipeline). Carries the route's error on a failure. */
export async function runPipelineSimulation(payload: AssessmentPayload): Promise<PipelineRunResult> {
  const res = await fetch('/api/orchestrator/pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return res.ok && body
    ? { ok: true, data: body as UnifiedAssessmentResponse }
    : { ok: false, error: body?.error || `Pipeline route answered HTTP ${res.status}.` };
}

export interface RulesetOption {
  code: string;
  title: string;
  status?: string;
}

/**
 * The score engine's rulesets for one tenant (GET /core/score-engine/rulesets,
 * proxied to the gateway). Null when the engine answers with an error or no list.
 */
export async function listTenantRulesets(brandId: string, applicationId: string): Promise<RulesetOption[] | null> {
  const res = await fetch(
    `/core/score-engine/rulesets?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`,
  );
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return Array.isArray(data?.rulesets)
    ? data.rulesets.map((r: { code: string; title?: string; status?: string }) => ({
        code: r.code,
        title: r.title || r.code,
        status: r.status,
      }))
    : null;
}

export interface ConcernOption {
  code: string;
  name: string;
}

/** Skin conditions from reference data (ref_skin_conditions). Null when the route answers with an error. */
export async function listConcernOptions(): Promise<ConcernOption[] | null> {
  const res = await fetch(STUDIO_HOST_ROUTES.skinConditions);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const list = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.skinConditions)
        ? data.skinConditions
        : Array.isArray(data)
          ? data
          : null;
  return list
    ? list
        .filter((c: { code?: string }) => !!c?.code)
        .map((c: { code: string; name?: string }) => ({ code: c.code, name: c.name || c.code }))
    : null;
}
