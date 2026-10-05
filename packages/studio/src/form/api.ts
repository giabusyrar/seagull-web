'use client';

import type { HostRoutes } from '@gateway-experience/shared';
import type { QuestionnaireItem } from './types';
import { type SurveyJSModel, toSurveyModel, fromSurveyModel } from './surveyjs';

/**
 * Form Engine + Reference Service data access (browser side).
 *
 * Routes through the API Gateway "Core Engine API" collection, whose routes are
 * registered as bare resources under the engine prefix:
 *   /core/form-engine/survey*   -> gateway-proxy -> core-engine (form) :8082
 * (`apps/web/proxy.ts` rewrites `/core/*` onto `/backend-api`, which attaches the
 * gateway API key and forwards to the data plane.) Reference lookups go to the
 * host app's reference routes, which the caller passes in (`HostRoutes`).
 *
 * The stored form structure is always a SurveyJS schema; this module converts to
 * and from the builder's QuestionnaireItem and exposes the raw model for runners.
 */

const FORM = '/core/form-engine';

/**
 * Thrown when a questionnaire call is made without a brand / application.
 * There is no default tenant: a call without one would otherwise read or write
 * some real tenant's questionnaires. Callers show the message and ask the user
 * to pick a tenant.
 */
export class MissingTenantError extends Error {
  constructor() {
    super('Choose a brand and an application first — questionnaires are stored per tenant.');
    this.name = 'MissingTenantError';
  }
}

function requireTenant(brandId: string | undefined, applicationId: string | undefined): {
  brandId: string;
  applicationId: string;
} {
  const b = (brandId ?? '').trim();
  const a = (applicationId ?? '').trim();
  if (!b || !a) throw new MissingTenantError();
  return { brandId: b, applicationId: a };
}

const tenantQuery = (brandId: string, applicationId: string) =>
  `brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`;

interface SurveyRow {
  code?: string;
  title?: string;
  status?: string;
  brandId?: string;
  applicationId?: string;
  brand_id?: string;
  application_id?: string;
  schema?: SurveyJSModel | string | null;
}

function parseSchema(row: SurveyRow): SurveyJSModel {
  const s = row?.schema;
  if (s && typeof s === 'object') return s as SurveyJSModel;
  if (typeof s === 'string') {
    try {
      return JSON.parse(s) as SurveyJSModel;
    } catch {
      /* fall through */
    }
  }
  return {} as SurveyJSModel;
}

// Form Engine column: draft | active | archived. Builder: draft | published | archived.
function fromColumnStatus(s?: string): string {
  if (s === 'active') return 'published';
  return s || '';
}
function toColumnStatus(s?: string): string {
  if (s === 'published' || s === 'active') return 'active';
  if (s === 'archived') return 'archived';
  return 'draft';
}

function rowToItem(row: SurveyRow): QuestionnaireItem {
  const item = fromSurveyModel(parseSchema(row));
  return {
    ...item,
    // The DB row owns identity — the unique key is (brand, app, code, version).
    // A code/title embedded in the schema is only a copy and can go stale
    // (e.g. a questionnaire cloned from another one), so the row wins.
    code: row?.code || item.code || '',
    name: row?.title || item.name || row?.code || '',
    status: fromColumnStatus(row?.status) || item.status || 'draft',
    brandId: row?.brandId || row?.brand_id || item.brandId,
    applicationId: row?.applicationId || row?.application_id || item.applicationId,
  };
}

async function listRows(brandId: string, applicationId: string): Promise<SurveyRow[]> {
  const t = requireTenant(brandId, applicationId);
  const res = await fetch(`${FORM}/survey?${tenantQuery(t.brandId, t.applicationId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`form-engine list failed (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.surveys)) return data.surveys;
  if (Array.isArray(data?.forms)) return data.forms;
  return [];
}

const isArchived = (r: SurveyRow) => (r?.status ?? '') === 'archived';

export async function listQuestionnaires(
  brandId: string,
  applicationId: string
): Promise<QuestionnaireItem[]> {
  return (await listRows(brandId, applicationId))
    .filter((r) => !isArchived(r))
    .map(rowToItem);
}

export async function getQuestionnaire(
  code: string,
  brandId: string,
  applicationId: string
): Promise<QuestionnaireItem | null> {
  return (
    (await listQuestionnaires(brandId, applicationId)).find((q) => q.code === code) ?? null
  );
}

/** Raw SurveyJS model for a questionnaire — used by QuestionnaireRunner. */
export async function getQuestionnaireModel(
  code: string,
  brandId: string,
  applicationId: string
): Promise<SurveyJSModel | null> {
  const row = (await listRows(brandId, applicationId)).find(
    (r) => r.code === code && !isArchived(r)
  );
  if (!row) return null;
  const model = parseSchema(row);
  if (!Array.isArray(model.pages) && !Array.isArray(model.elements)) {
    return toSurveyModel(rowToItem(row));
  }
  return { ...model, code: row.code || model.code, title: row.title || model.title };
}

export async function saveQuestionnaire(
  item: QuestionnaireItem,
  brandId?: string,
  applicationId?: string
): Promise<void> {
  // The questionnaire's own tenant wins; the argument is the selector's.
  const t = requireTenant(item.brandId || brandId, item.applicationId || applicationId);
  const code = item.code || `form_${Date.now()}`;
  const res = await fetch(`${FORM}/survey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: t.brandId,
      application_id: t.applicationId,
      code,
      title: item.name || code,
      status: toColumnStatus(item.status),
      schema: toSurveyModel({ ...item, code }),
    }),
  });
  if (!res.ok) throw new Error(`form-engine save failed (${res.status})`);
}

export async function deleteQuestionnaire(
  code: string,
  brandId: string,
  applicationId: string
): Promise<void> {
  // Form Engine has no delete route — soft-delete by archiving. Keep the existing
  // schema so the questionnaire can be restored later.
  const t = requireTenant(brandId, applicationId);
  const existing = (await listRows(t.brandId, t.applicationId)).find((r) => r.code === code);
  const schema = existing ? parseSchema(existing) : { code };
  const res = await fetch(`${FORM}/survey/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: existing?.brandId || existing?.brand_id || t.brandId,
      application_id: existing?.applicationId || existing?.application_id || t.applicationId,
      code,
      title: existing?.title || code,
      status: 'archived',
      schema,
    }),
  });
  if (!res.ok) throw new Error(`form-engine archive failed (${res.status})`);
}

export interface DimensionRow {
  code: string;
  name?: string;
  description?: string;
  parentCode?: string;
}

/** Dimension catalog from reference-service. Empty on failure (caller falls back). */
export async function getDimensions(routes: Pick<HostRoutes, 'reference'>): Promise<DimensionRow[]> {
  try {
    const res = await fetch(routes.reference('dimensions'), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.dimensions)
      ? data.dimensions
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return arr as DimensionRow[];
  } catch {
    return [];
  }
}

export interface SafetyFlagRow {
  code: string;
  name?: string;
  description?: string;
}

/**
 * Safety flag catalog (ref_conditions in reference-service) — the same
 * registered "customer condition" entity the Customer Conditions admin page
 * manages. Empty on failure (caller falls back to whatever's already used in
 * the questionnaire being edited, never a hardcoded list).
 */
export async function getSafetyFlags(routes: Pick<HostRoutes, 'reference'>): Promise<SafetyFlagRow[]> {
  try {
    const res = await fetch(routes.reference('conditions'), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return arr as SafetyFlagRow[];
  } catch {
    return [];
  }
}

/**
 * Registers a new safety flag in the catalog (ref_conditions) — used when a
 * questionnaire builder picks "+ Custom..." on a choice's flag picker. The
 * flag becomes a real, named catalog entry from that point on (visible on
 * the Customer Conditions admin page, reusable on other questionnaires),
 * not just a bare code with no name anywhere. Returns null on failure —
 * caller still uses the flag locally on this questionnaire either way.
 */
export async function createSafetyFlag(
  routes: Pick<HostRoutes, 'reference'>,
  code: string,
  name: string,
): Promise<SafetyFlagRow | null> {
  try {
    const res = await fetch(routes.reference('conditions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name }),
    });
    if (!res.ok) return null;
    return { code, name };
  } catch {
    return null;
  }
}
