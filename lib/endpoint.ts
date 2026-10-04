import { svcPath, type ServiceId } from './services';

export type FieldKind = 'text' | 'number' | 'bool' | 'json' | 'file' | 'files' | 'select';
export interface Field { name: string; kind: FieldKind; label?: string; default?: string | number | boolean; options?: string[]; required?: boolean; help?: string; repeat?: boolean }
export type BrandStyle = 'snake' | 'camel' | 'path' | 'none';
export type BodyKind = 'none' | 'json' | 'multipart' | 'raw';
export interface EndpointDef { id: string; title: string; service: ServiceId; method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string; body: BodyKind; brand: BrandStyle; fields: Field[]; note?: string; headers?: Record<string, string> }
export type FieldValue = string | number | boolean | File | File[] | undefined;
export interface Brand { brandId: string; applicationId: string }
export interface BuiltRequest { url: string; init: RequestInit }

const isEmpty = (v: FieldValue) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

function brandKeys(style: BrandStyle, b: Brand): Record<string, string> {
  if (style === 'snake') return { brand_id: b.brandId, application_id: b.applicationId };
  if (style === 'camel') return { brandId: b.brandId, applicationId: b.applicationId };
  return {};
}

function convert(field: Field, v: FieldValue): unknown {
  if (field.kind === 'number') return Number(v);
  if (field.kind === 'bool') return v === true || v === 'true';
  if (field.kind === 'json') {
    try { return JSON.parse(String(v)); } catch { throw new Error(`${field.name}: invalid JSON`); }
  }
  return v;
}

export function buildRequest(def: EndpointDef, values: Record<string, FieldValue>, brand: Brand): BuiltRequest {
  const used = new Set<string>();
  const path = def.path.replace(/:([A-Za-z_]+)/g, (_, key: string) => {
    used.add(key);
    const v = values[key] ?? (key === 'brandId' ? brand.brandId : key === 'applicationId' ? brand.applicationId : undefined);
    if (isEmpty(v as FieldValue)) throw new Error(`${key}: required path parameter`);
    return encodeURIComponent(String(v));
  });

  const fields = def.fields.filter((f) => !used.has(f.name) && !isEmpty(values[f.name]));
  const extra = Object.fromEntries(
    Object.entries(brandKeys(def.brand, brand))
      .filter(([k]) => !used.has(k) && !(def.fields.some((f) => f.name === k) && !isEmpty(values[k])))
      .map(([k, v]) => [k, !isEmpty(values[k]) ? String(values[k]) : v])
  );
  const headers: Record<string, string> = { ...(def.headers ?? {}) };
  const init: RequestInit = { method: def.method };
  let url = svcPath(def.service, path);

  if (def.method === 'GET' || def.method === 'DELETE' || def.body === 'none') {
    const q = new URLSearchParams();
    for (const f of fields) q.append(f.name, String(values[f.name]));
    for (const [k, v] of Object.entries(extra)) q.append(k, v);
    const qs = q.toString();
    if (qs) url += `?${qs}`;
  } else if (def.body === 'json') {
    const obj: Record<string, unknown> = {};
    for (const f of fields) obj[f.name] = convert(f, values[f.name]);
    Object.assign(obj, extra);
    init.body = JSON.stringify(obj);
    headers['Content-Type'] = 'application/json';
  } else if (def.body === 'multipart') {
    const fd = new FormData();
    for (const f of fields) {
      const v = values[f.name];
      if (Array.isArray(v)) v.forEach((file) => fd.append(f.name, file));
      else if (v instanceof File) fd.append(f.name, v);
      else if (f.kind === 'bool') fd.append(f.name, v === true || v === 'true' ? 'true' : 'false');
      else if (f.repeat) String(v).split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => fd.append(f.name, s));
      else fd.append(f.name, String(v));
    }
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
    init.body = fd;
  } else if (def.body === 'raw') {
    const file = fields.map((f) => values[f.name]).find((v): v is File => v instanceof File);
    if (!file) throw new Error('a file is required');
    init.body = file;
    headers['Content-Type'] = file.type || 'application/octet-stream';
  }

  if (Object.keys(headers).length) init.headers = headers;
  return { url, init };
}
