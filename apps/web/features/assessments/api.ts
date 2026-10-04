/**
 * Assessment reads from core-engine through the gateway data plane
 * (/core/assessments/*). Both scopes are required; without them the API
 * answers 400.
 */

export interface AssessmentQuery {
  brandId: string;
  applicationId: string;
  /** One customer's history when set; otherwise the scope's history. */
  customerId?: string;
  limit?: number;
}

/** Throws with the API's error, or the HTTP status, when the read fails. */
export async function listAssessments<T>({ brandId, applicationId, customerId, limit = 100 }: AssessmentQuery): Promise<T[]> {
  const params = new URLSearchParams({ brand_id: brandId, application_id: applicationId, limit: String(limit) });
  const customer = customerId?.trim();
  const path = customer ? `/core/assessments/customers/${encodeURIComponent(customer)}` : '/core/assessments/history';
  const res = await fetch(`${path}?${params}`, { cache: 'no-store' });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Could not read assessments (HTTP ${res.status}).`);
  return Array.isArray(body?.assessments) ? body.assessments : [];
}
