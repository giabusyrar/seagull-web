import type { EndpointResolver } from '@/features/colour/api';
import type { VisionAnalysisResult } from './simulator/types';
import type { VisionSettingItem } from './VisionSettingsTab';

/**
 * Calls the vision views make: reference brands and applications for the
 * setting modal, vision config list/save and image analysis on core-engine
 * (resolved through the dashboard's collections). The hooks in this folder
 * (useVisionModels, useVisionRegistry, useModelAssets) own their own calls.
 */

export interface ReferenceBrand {
  id: string;
  name: string;
  description?: string;
}

export interface ReferenceApplication extends ReferenceBrand {
  key: string;
}

async function referenceList<T>(path: string, key: string): Promise<T[] | null> {
  const data = await (await fetch(path)).json();
  const list = data?.[key] || data?.items || data?.data;
  return list && Array.isArray(list) ? list : null;
}

/** Null when the response holds no list. */
export const listReferenceBrands = () => referenceList<ReferenceBrand>('/api/reference/brands', 'brands');
/** Null when the response holds no list. */
export const listReferenceApplications = () =>
  referenceList<ReferenceApplication>('/api/reference/applications', 'applications');

// The vision config backend route (list/save) doesn't exist yet — guard
// against parsing a non-JSON response (e.g. a plain-text 404) as JSON,
// which throws a confusing SyntaxError instead of a clean "not available" state.
async function safeJson<T>(res: Response): Promise<T | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface VisionConfigResponse {
  success?: boolean;
  items?: VisionSettingItem[];
  error?: string;
}

/** GET the config list; `json` is null when the answer is not JSON. */
export async function listVisionConfigs(endpoint: EndpointResolver): Promise<{ status: number; json: VisionConfigResponse | null }> {
  const res = await fetch(endpoint('vision', '/api/vision/config?list=true'));
  return { status: res.status, json: await safeJson<VisionConfigResponse>(res) };
}

/** POST one scope's config; null when the answer is not JSON. */
export async function saveVisionConfig(endpoint: EndpointResolver, payload: unknown): Promise<VisionConfigResponse | null> {
  const res = await fetch(endpoint('vision', '/api/vision/config'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return safeJson<VisionConfigResponse>(res);
}

export interface AnalysisErrorBody {
  invalidParameters?: { field: string; value: unknown; reason: string }[];
  message?: string;
}

// Turns a failed analyze response into a message the operator can act on.
export function describeAnalysisError(status: number, json: AnalysisErrorBody | undefined): string {
  if (status === 400) {
    const reasons = (json?.invalidParameters || [])
      .map((p) => `${p.field} "${p.value}": ${p.reason}`)
      .join('; ');
    return reasons || json?.message || 'Invalid analysis request';
  }
  if (status === 503) {
    return 'Reference Data is unavailable. Check that reference-service is running, then try again.';
  }
  if (status === 502) {
    return 'The vision AI worker is unavailable. Check that vision-ai-worker is running, then try again.';
  }
  return json?.message || 'Vision pipeline analysis failed';
}

/** POST the captures to /analyze-image. Throws an operator-readable Error on failure. */
export async function analyzeImages(endpoint: EndpointResolver, form: FormData): Promise<VisionAnalysisResult> {
  const res = await fetch(endpoint('vision', '/analyze-image'), { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(describeAnalysisError(res.status, json));
  return json as VisionAnalysisResult;
}
