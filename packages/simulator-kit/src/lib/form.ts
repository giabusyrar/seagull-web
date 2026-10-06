// Pure request builders for the form mode: core-engine's form engine through
// the /svc/core rewrite, as the photo builders in ./photo do.
import { svcPath } from './services';
import type { Brand, BuiltRequest } from './photo';

const FORM = '/core/form-engine/survey';

/** A survey row as the form engine lists it; `schema` is a SurveyJS JSON string. */
export interface SurveyRow {
  code: string;
  title?: string;
  status?: string;
  version?: number;
  brandId?: string;
  applicationId?: string;
  schema?: string;
}

/**
 * The simulated customer: personal details and consent only. There is no
 * customer id: every simulator call is a dry run (see lib/http), and core
 * needs an id only for what it stores.
 */
export interface Respondent {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  /** ISO 3166-1 alpha-2, e.g. "ID". */
  country?: string;
  /** Province and city by name, as stored; provinceCode only fetches the province's cities. */
  province?: string;
  provinceCode?: string;
  city?: string;
  consentDataProcessing: boolean;
  consentMarketing: boolean;
}

/** The customer's personal details in the engines' field names; empty ones are left out. */
export function piiFields(who: Respondent): Record<string, string> {
  const f: Record<string, string | undefined> = {
    full_name: who.fullName?.trim(),
    email: who.email?.trim(),
    phone_number: who.phoneNumber?.trim(),
    date_of_birth: who.dateOfBirth,
  };
  return Object.fromEntries(Object.entries(f).filter((e): e is [string, string] => !!e[1]));
}

/**
 * Where the customer lives, in the conversation engine's field names. Only the
 * advisor session takes it (it remembers it and the advisor may use it); the
 * form and score endpoints have no use for it, so piiFields leaves it out.
 */
export function locationFields(who: Respondent): Record<string, string> {
  const f = { country: who.country, province: who.province?.trim(), city: who.city?.trim() };
  return Object.fromEntries(Object.entries(f).filter((e): e is [string, string] => !!e[1]));
}

const scope = (b: Brand) => `brand_id=${encodeURIComponent(b.brandId)}&application_id=${encodeURIComponent(b.applicationId)}`;

export function listSurveys(brand: Brand): BuiltRequest {
  return { url: svcPath('core', `${FORM}?${scope(brand)}`), init: { method: 'GET', cache: 'no-store' } };
}

/** The rows a picker should offer: archived surveys are left out. */
export function selectableSurveys(json: unknown): SurveyRow[] {
  const rows = Array.isArray(json) ? json : Array.isArray((json as { surveys?: unknown })?.surveys) ? (json as { surveys: unknown[] }).surveys : [];
  return rows.filter((r): r is SurveyRow => !!r && typeof (r as SurveyRow).code === 'string' && (r as SurveyRow).status !== 'archived');
}

/** The SurveyJS JSON of a row, or null when it is missing or does not parse. */
export function surveySchema(row: SurveyRow | undefined): Record<string, unknown> | null {
  if (!row?.schema) return null;
  try {
    const s = JSON.parse(row.schema);
    return s && typeof s === 'object' ? s : null;
  } catch {
    return null;
  }
}

/** Answers only (POST /evaluate, JSON). */
export function evaluateSurvey(code: string, brand: Brand, data: Record<string, unknown>, who: Respondent): BuiltRequest {
  return {
    url: svcPath('core', `${FORM}/${encodeURIComponent(code)}/evaluate`),
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_id: brand.brandId, application_id: brand.applicationId, ...piiFields(who), data }),
    },
  };
}

/** Answers plus the front photo (POST /evaluate-with-photos, multipart): the form scored with vision signals. */
export function evaluateSurveyWithPhoto(code: string, brand: Brand, data: Record<string, unknown>, photo: File, who: Respondent): BuiltRequest {
  const fd = new FormData();
  fd.append('brand_id', brand.brandId);
  fd.append('application_id', brand.applicationId);
  for (const [k, v] of Object.entries(piiFields(who))) fd.append(k, v);
  fd.append('consent_data_processing', who.consentDataProcessing ? 'true' : 'false');
  fd.append('consent_marketing', who.consentMarketing ? 'true' : 'false');
  fd.append('data', JSON.stringify(data));
  fd.append('photo', photo);
  return { url: svcPath('core', `${FORM}/${encodeURIComponent(code)}/evaluate-with-photos`), init: { method: 'POST', body: fd } };
}
