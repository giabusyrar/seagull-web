# Seagull Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone Next.js app that sends real requests straight to every Seagull service (no gateway) and shows the real responses.

**Architecture:** Next.js rewrites map `/svc/<service>/*` to each service's base URL (env, localhost defaults), so every browser call is same-origin. Endpoints are declared as data (`EndpointDef`); one generic `EndpointPanel` renders a form from the def, builds the request with a pure `buildRequest`, calls it with `call`, and shows the result in `ResponseView`. Only the conversation screen (session + WebSocket) is hand-written.

**Tech Stack:** Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, `@google/model-viewer`. Node 24.

**Spec:** `docs/superpowers/specs/2026-10-04-simulator-design.md`

## Global Constraints

- Location: `C:\Users\GiaBusyraRabbani\Documents\Paragon\seagull\seagull-simulator` (own git repo, branch `main`, never pushed — no remote).
- Dev port 3100 (`next dev -p 3100`). 3000 belongs to seagull-web.
- No gateway, no API keys, no auth headers.
- No fabricated or fallback results: show real status and body for every response; network failure shows "service at <url> unreachable".
- No fetch calls inside React components except via `lib/http.ts` `call()` — components never call `fetch` directly.
- Brand id sent to core = brand `code` from reference (`GET /api/reference/brands` → `data[].code`); application id = application `key` (`GET /api/reference/applications` → `data[].key`).
- Do not modify any other seagull repo.
- Commit after every task; message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```
seagull-simulator/
  package.json, next.config.ts, tsconfig.json, vitest.config.ts, .env.example, README.md
  app/
    layout.tsx            shell: TopBar + Nav + main
    globals.css           tailwind import
    page.tsx              landing: links to groups
    [group]/page.tsx      renders all EndpointPanels for a group
    conversation/page.tsx hand-written session + WS screen
  lib/
    services.ts           service registry
    endpoint.ts           EndpointDef/Field types + buildRequest (pure)
    http.ts               call(): fetch + response classification
    brand.tsx             BrandProvider + useBrand (localStorage)
    groups.ts             group registry: id → {title, endpoints}
    endpoints/core.ts     core-engine EndpointDefs, grouped
    endpoints/reference.ts
    endpoints/workers.ts
  components/
    TopBar.tsx            HealthPills + BrandPicker
    HealthPills.tsx
    BrandPicker.tsx
    Nav.tsx
    EndpointPanel.tsx     form → buildRequest → call → ResponseView
    FieldInput.tsx        one input per Field kind (incl. webcam)
    ResponseView.tsx      status/ms badge + tabs json/image/3d/raw/headers
    GlbViewer.tsx         model-viewer wrapper (client-only)
  tests/
    endpoint.test.ts
    http.test.ts
    groups.test.ts
```

---

### Task 1: Scaffold Next.js app with service rewrites

**Files:**
- Create: whole Next.js scaffold, `next.config.ts`, `lib/services.ts`, `.env.example`, `vitest.config.ts`, `tests/services.test.ts`

**Interfaces:**
- Produces: `type ServiceId = 'core'|'ref'|'conv'|'colour'|'face'|'skin'|'tryon'`; `SERVICES: Record<ServiceId, {id, label, envVar, defaultUrl, healthPath}>`; `serviceRewrites(env): {source, destination}[]`.

- [ ] **Step 1: Scaffold** (from `seagull/`, the folder already has `docs/` and a git repo)

```bash
cd /c/Users/GiaBusyraRabbani/Documents/Paragon/seagull
npx create-next-app@latest sim-tmp --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes
rm -rf sim-tmp/.git
cp -r sim-tmp/. seagull-simulator/ && rm -rf sim-tmp
cd seagull-simulator && npm i @google/model-viewer && npm i -D vitest
```
(seagull-simulator keeps its own `.git` and `docs/`; create-next-app's `.git` is deleted before copying so it cannot overwrite ours.)

- [ ] **Step 2: Write failing test** `tests/services.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { SERVICES, serviceRewrites } from '@/lib/services';

describe('serviceRewrites', () => {
  it('uses localhost defaults', () => {
    const r = serviceRewrites({});
    expect(r).toContainEqual({ source: '/svc/core/:path*', destination: 'http://localhost:8082/:path*' });
    expect(r).toHaveLength(Object.keys(SERVICES).length);
  });
  it('honours env overrides and strips trailing slash', () => {
    const r = serviceRewrites({ SIM_FACE_URL: 'http://vps:9000/' });
    expect(r).toContainEqual({ source: '/svc/face/:path*', destination: 'http://vps:9000/:path*' });
  });
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({ resolve: { alias: { '@': path.resolve(__dirname) } }, test: { environment: 'node' } });
```
Add to package.json scripts: `"dev": "next dev --turbopack -p 3100"`, `"start": "next start -p 3100"`, `"test": "vitest run"`.

- [ ] **Step 3: Run** `npm test` — Expected: FAIL, cannot find `@/lib/services`.

- [ ] **Step 4: Implement** `lib/services.ts`

```ts
export type ServiceId = 'core' | 'ref' | 'conv' | 'colour' | 'face' | 'skin' | 'tryon';

export interface ServiceInfo { id: ServiceId; label: string; envVar: string; defaultUrl: string; healthPath: string }

export const SERVICES: Record<ServiceId, ServiceInfo> = {
  core:   { id: 'core',   label: 'Core',         envVar: 'SIM_CORE_URL',         defaultUrl: 'http://localhost:8082', healthPath: '/health' },
  ref:    { id: 'ref',    label: 'Reference',    envVar: 'SIM_REFERENCE_URL',    defaultUrl: 'http://localhost:8086', healthPath: '/health' },
  conv:   { id: 'conv',   label: 'Conversation', envVar: 'SIM_CONVERSATION_URL', defaultUrl: 'http://localhost:8098', healthPath: '/health' },
  colour: { id: 'colour', label: 'Colour',       envVar: 'SIM_COLOUR_URL',       defaultUrl: 'http://localhost:8092', healthPath: '/health' },
  face:   { id: 'face',   label: 'Face',         envVar: 'SIM_FACE_URL',         defaultUrl: 'http://localhost:8094', healthPath: '/health' },
  skin:   { id: 'skin',   label: 'Skin',         envVar: 'SIM_SKIN_URL',         defaultUrl: 'http://localhost:8088', healthPath: '/health' },
  tryon:  { id: 'tryon',  label: 'Try-on',       envVar: 'SIM_TRYON_URL',        defaultUrl: 'http://localhost:8090', healthPath: '/health' },
};

export const svcPath = (id: ServiceId, path: string) => `/svc/${id}${path.startsWith('/') ? path : `/${path}`}`;

export function serviceRewrites(env: Record<string, string | undefined>) {
  return Object.values(SERVICES).map((s) => ({
    source: `/svc/${s.id}/:path*`,
    destination: `${(env[s.envVar] || s.defaultUrl).replace(/\/+$/, '')}/:path*`,
  }));
}
```

`next.config.ts`:
```ts
import type { NextConfig } from 'next';
import { serviceRewrites } from './lib/services';
const nextConfig: NextConfig = { async rewrites() { return serviceRewrites(process.env); } };
export default nextConfig;
```

`.env.example`:
```
# Base URLs for each service (defaults shown). Restart `npm run dev` after changing.
# SIM_CORE_URL=http://localhost:8082
# SIM_REFERENCE_URL=http://localhost:8086
# SIM_CONVERSATION_URL=http://localhost:8098
# SIM_COLOUR_URL=http://localhost:8092
# SIM_FACE_URL=http://localhost:8094
# SIM_SKIN_URL=http://localhost:8088
# SIM_TRYON_URL=http://localhost:8090
# Conversation WebSocket goes direct (not proxied):
# NEXT_PUBLIC_SIM_CONVERSATION_WS=ws://localhost:8098
```

- [ ] **Step 5: Run** `npm test` — PASS. Run `npm run dev` then `curl -s localhost:3100/svc/core/health` — Expected: core-engine health JSON (`"service":"core-engine"`). Stop dev.

- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: Next.js scaffold with per-service rewrites"`

---

### Task 2: EndpointDef + buildRequest

**Files:**
- Create: `lib/endpoint.ts`, `tests/endpoint.test.ts`

**Interfaces:**
- Consumes: `ServiceId`, `svcPath` from Task 1.
- Produces:
```ts
type FieldKind = 'text' | 'number' | 'bool' | 'json' | 'file' | 'files' | 'select';
interface Field { name: string; kind: FieldKind; label?: string; default?: string | number | boolean; options?: string[]; required?: boolean; help?: string; repeat?: boolean }
type BrandStyle = 'snake' | 'camel' | 'path' | 'none';
type BodyKind = 'none' | 'json' | 'multipart' | 'raw';
interface EndpointDef { id: string; title: string; service: ServiceId; method: 'GET'|'POST'|'PUT'|'DELETE'; path: string; body: BodyKind; brand: BrandStyle; fields: Field[]; note?: string; headers?: Record<string,string> }
type FieldValue = string | number | boolean | File | File[] | undefined;
interface Brand { brandId: string; applicationId: string }
interface BuiltRequest { url: string; init: RequestInit }
function buildRequest(def: EndpointDef, values: Record<string, FieldValue>, brand: Brand): BuiltRequest
```
Rules: `:param` in path is replaced from values (or `brandId`/`applicationId` from brand); GET/DELETE and `body:'none'` put remaining non-empty fields in the query string; `json` builds an object (kind `json` parsed with `JSON.parse`, `number` → Number, `bool` → boolean, empty strings skipped); `multipart` builds FormData (bool → "true"/"false", `files` appended once per file, `text` with `repeat:true` split on commas and appended per item); `raw` sends the single file field as body with `Content-Type: file.type`. Brand style `snake` adds `brand_id`/`application_id`, `camel` adds `brandId`/`applicationId` (to query for GET, else body/form), `path` only substitutes, `none` adds nothing. A value already set for a brand key wins over the context.

- [ ] **Step 1: Failing tests** `tests/endpoint.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { buildRequest, type EndpointDef } from '@/lib/endpoint';

const brand = { brandId: 'wardah', applicationId: 'skinverse' };
const def = (d: Partial<EndpointDef>): EndpointDef => ({ id: 'x', title: 'x', service: 'core', method: 'GET', path: '/p', body: 'none', brand: 'none', fields: [], ...d });

describe('buildRequest', () => {
  it('GET puts fields and snake brand in query', () => {
    const r = buildRequest(def({ path: '/core/form-engine/survey', brand: 'snake', fields: [{ name: 'limit', kind: 'number' }] }), { limit: 5 }, brand);
    expect(r.url).toBe('/svc/core/core/form-engine/survey?limit=5&brand_id=wardah&application_id=skinverse');
    expect(r.init.method).toBe('GET');
  });
  it('substitutes path params and brand path style', () => {
    const r = buildRequest(def({ method: 'POST', body: 'multipart', path: '/core/vision-engine/face-architecture/:brandId/:applicationId', brand: 'path', fields: [] }), {}, brand);
    expect(r.url).toBe('/svc/core/core/vision-engine/face-architecture/wardah/skinverse');
  });
  it('JSON body converts kinds and skips empty', () => {
    const r = buildRequest(def({ method: 'POST', body: 'json', brand: 'snake', fields: [
      { name: 'code', kind: 'text' }, { name: 'n', kind: 'number' }, { name: 'b', kind: 'bool' }, { name: 'data', kind: 'json' }, { name: 'empty', kind: 'text' },
    ] }), { code: 'q1', n: '3', b: true, data: '{"a":1}', empty: '' }, brand);
    expect(JSON.parse(r.init.body as string)).toEqual({ code: 'q1', n: 3, b: true, data: { a: 1 }, brand_id: 'wardah', application_id: 'skinverse' });
    expect((r.init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
  it('invalid JSON field throws a readable error', () => {
    expect(() => buildRequest(def({ method: 'POST', body: 'json', fields: [{ name: 'data', kind: 'json' }] }), { data: '{bad' }, brand)).toThrow(/data: invalid JSON/);
  });
  it('multipart: bools, files, repeat, camel brand', () => {
    const f1 = new File(['a'], 'a.jpg', { type: 'image/jpeg' });
    const f2 = new File(['b'], 'b.jpg', { type: 'image/jpeg' });
    const r = buildRequest(def({ method: 'POST', body: 'multipart', brand: 'camel', fields: [
      { name: 'image', kind: 'file' }, { name: 'hijab', kind: 'bool' }, { name: 'shadeIds', kind: 'text', repeat: true }, { name: 'more', kind: 'files' },
    ] }), { image: f1, hijab: false, shadeIds: 's1, s2', more: [f1, f2] }, brand);
    const fd = r.init.body as FormData;
    expect(fd.get('hijab')).toBe('false');
    expect(fd.getAll('shadeIds')).toEqual(['s1', 's2']);
    expect(fd.getAll('more')).toHaveLength(2);
    expect(fd.get('brandId')).toBe('wardah');
    expect(r.init.headers).toBeUndefined();
  });
  it('raw body sends the file with its type', () => {
    const f = new File(['x'], 'p.png', { type: 'image/png' });
    const r = buildRequest(def({ method: 'POST', body: 'raw', service: 'conv', path: '/conversation/sessions/:id/photo', fields: [{ name: 'id', kind: 'text' }, { name: 'photo', kind: 'file' }], headers: { 'X-Session-Owner': 't' } }), { id: 's1', photo: f }, brand);
    expect(r.url).toBe('/svc/conv/conversation/sessions/s1/photo');
    expect(r.init.body).toBe(f);
    expect(r.init.headers).toEqual({ 'X-Session-Owner': 't', 'Content-Type': 'image/png' });
  });
  it('explicit value beats brand context', () => {
    const r = buildRequest(def({ brand: 'snake', fields: [{ name: 'brand_id', kind: 'text' }] }), { brand_id: 'makeover' }, brand);
    expect(r.url).toContain('brand_id=makeover');
    expect(r.url).not.toContain('brand_id=wardah');
  });
});
```

- [ ] **Step 2: Run** `npm test` — FAIL (module missing).

- [ ] **Step 3: Implement** `lib/endpoint.ts`

```ts
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
  const extra = Object.fromEntries(Object.entries(brandKeys(def.brand, brand)).filter(([k]) => isEmpty(values[k])));
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
```
Note: bool fields with value `false` are not "empty", so they are sent; this is required by colour `hijab`/`hairVisible`.

- [ ] **Step 4: Run** `npm test` — PASS (all 7).

- [ ] **Step 5: Commit** `git commit -am "feat: EndpointDef and pure buildRequest"` (add new files first).

---

### Task 3: call() and response classification

**Files:**
- Create: `lib/http.ts`, `tests/http.test.ts`

**Interfaces:**
- Consumes: `BuiltRequest` from Task 2.
- Produces:
```ts
type BodyKindOut = 'json' | 'image' | 'glb' | 'text' | 'empty';
interface CallResult { ok: boolean; status: number; ms: number; url: string; headers: [string, string][]; kind: BodyKindOut; json?: unknown; text?: string; blobUrl?: string; size?: number; networkError?: string }
function classify(contentType: string | null): BodyKindOut
async function call(req: BuiltRequest, fetchImpl?: typeof fetch): Promise<CallResult>
```
`call` never throws: network failure → `{ok:false, status:0, networkError:'service at <url> unreachable: <message>'}`. Proxy-level failures from Next rewrites (500 with HTML when the target is down) are returned as-is with kind `text`.

- [ ] **Step 1: Failing tests** `tests/http.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { call, classify } from '@/lib/http';

const res = (body: BodyInit | null, status: number, type?: string) =>
  new Response(body, { status, headers: type ? { 'content-type': type } : {} });

describe('classify', () => {
  it.each([
    ['application/json; charset=utf-8', 'json'], ['image/png', 'image'], ['model/gltf-binary', 'glb'],
    ['text/plain', 'text'], [null, 'text'],
  ])('%s → %s', (ct, kind) => expect(classify(ct as string | null)).toBe(kind));
});

describe('call', () => {
  const req = { url: '/svc/core/health', init: { method: 'GET' } };
  it('parses JSON and keeps status', async () => {
    const r = await call(req, async () => res('{"status":"ok"}', 200, 'application/json'));
    expect(r).toMatchObject({ ok: true, status: 200, kind: 'json', json: { status: 'ok' } });
    expect(r.ms).toBeGreaterThanOrEqual(0);
  });
  it('returns error bodies without throwing', async () => {
    const r = await call(req, async () => res('{"error":"no_face_detected"}', 422, 'application/json'));
    expect(r).toMatchObject({ ok: false, status: 422, json: { error: 'no_face_detected' } });
  });
  it('falls back to text when JSON is malformed', async () => {
    const r = await call(req, async () => res('{oops', 200, 'application/json'));
    expect(r).toMatchObject({ kind: 'text', text: '{oops' });
  });
  it('204 is empty', async () => {
    const r = await call(req, async () => res(null, 204));
    expect(r.kind).toBe('empty');
  });
  it('network failure becomes networkError', async () => {
    const r = await call(req, async () => { throw new TypeError('fetch failed'); });
    expect(r).toMatchObject({ ok: false, status: 0, networkError: 'service at /svc/core/health unreachable: fetch failed' });
  });
});
```

- [ ] **Step 2: Run** `npm test` — FAIL.

- [ ] **Step 3: Implement** `lib/http.ts`

```ts
import type { BuiltRequest } from './endpoint';

export type BodyKindOut = 'json' | 'image' | 'glb' | 'text' | 'empty';
export interface CallResult { ok: boolean; status: number; ms: number; url: string; headers: [string, string][]; kind: BodyKindOut; json?: unknown; text?: string; blobUrl?: string; size?: number; networkError?: string }

export function classify(ct: string | null): BodyKindOut {
  const t = (ct ?? '').toLowerCase();
  if (t.includes('json')) return 'json';
  if (t.startsWith('image/')) return 'image';
  if (t.includes('gltf') || t.includes('glb')) return 'glb';
  return 'text';
}

const blobUrl = (b: Blob) => (typeof URL.createObjectURL === 'function' ? URL.createObjectURL(b) : undefined);

export async function call(req: BuiltRequest, fetchImpl: typeof fetch = fetch): Promise<CallResult> {
  const t0 = performance.now();
  let r: Response;
  try {
    r = await fetchImpl(req.url, req.init);
  } catch (e) {
    return { ok: false, status: 0, ms: Math.round(performance.now() - t0), url: req.url, headers: [], kind: 'empty', networkError: `service at ${req.url} unreachable: ${(e as Error).message}` };
  }
  const base = { ok: r.ok, status: r.status, url: req.url, headers: [...r.headers.entries()] as [string, string][] };
  const kind = r.status === 204 ? 'empty' : classify(r.headers.get('content-type'));
  if (kind === 'empty') return { ...base, ms: Math.round(performance.now() - t0), kind };
  if (kind === 'image' || kind === 'glb') {
    const b = await r.blob();
    return { ...base, ms: Math.round(performance.now() - t0), kind, blobUrl: blobUrl(b), size: b.size };
  }
  const text = await r.text();
  const ms = Math.round(performance.now() - t0);
  if (kind === 'json') {
    try { return { ...base, ms, kind, json: JSON.parse(text) }; } catch { return { ...base, ms, kind: 'text', text }; }
  }
  return { ...base, ms, kind, text };
}
```

- [ ] **Step 4: Run** `npm test` — PASS.

- [ ] **Step 5: Commit** `git add lib/http.ts tests/http.test.ts && git commit -m "feat: call() with response classification"`

---

### Task 4: Endpoint catalogue and groups

**Files:**
- Create: `lib/endpoints/core.ts`, `lib/endpoints/reference.ts`, `lib/endpoints/workers.ts`, `lib/groups.ts`, `tests/groups.test.ts`

**Interfaces:**
- Consumes: `EndpointDef` (Task 2).
- Produces: `GROUPS: Group[]` where `interface Group { id: string; title: string; section: 'Core' | 'Reference' | 'Workers'; endpoints: EndpointDef[] }`; `getGroup(id): Group | undefined`.

- [ ] **Step 1: Failing test** `tests/groups.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { GROUPS, getGroup } from '@/lib/groups';
import { buildRequest } from '@/lib/endpoint';

describe('groups', () => {
  it('has unique group and endpoint ids', () => {
    expect(new Set(GROUPS.map((g) => g.id)).size).toBe(GROUPS.length);
    const ids = GROUPS.flatMap((g) => g.endpoints.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('covers every spec group', () => {
    for (const id of ['form', 'score', 'match', 'vision', 'colour', 'face-arch', 'assessments', 'flows', 'reference', 'w-colour', 'w-face', 'w-skin', 'w-tryon']) {
      expect(getGroup(id), id).toBeDefined();
    }
  });
  it('every endpoint builds with defaults (files and path params supplied)', () => {
    const f = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    for (const g of GROUPS) for (const e of g.endpoints) {
      const values: Record<string, unknown> = {};
      for (const fl of e.fields) values[fl.name] = fl.kind === 'file' ? f : fl.kind === 'files' ? [f] : fl.default ?? (e.path.includes(`:${fl.name}`) ? 'x' : undefined);
      expect(() => buildRequest(e, values as never, { brandId: 'wardah', applicationId: 'skinverse' }), e.id).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run** `npm test` — FAIL.

- [ ] **Step 3: Implement catalogue.** `lib/endpoints/core.ts`:

```ts
import type { EndpointDef } from '../endpoint';

const P = '/core';
const PERSONAL = [
  { name: 'customer_id', kind: 'text', default: 'sim-customer' },
  { name: 'full_name', kind: 'text' }, { name: 'email', kind: 'text' }, { name: 'phone_number', kind: 'text' },
  { name: 'date_of_birth', kind: 'text', help: 'YYYY-MM-DD' },
  { name: 'consent_data_processing', kind: 'bool', default: true }, { name: 'consent_marketing', kind: 'bool', default: false },
] as const satisfies EndpointDef['fields'];

export const form: EndpointDef[] = [
  { id: 'form-list', title: 'List surveys', service: 'core', method: 'GET', path: `${P}/form-engine/survey`, body: 'none', brand: 'snake', fields: [] },
  { id: 'form-get', title: 'Get survey', service: 'core', method: 'GET', path: `${P}/form-engine/survey/:code`, body: 'none', brand: 'snake', fields: [{ name: 'code', kind: 'text', required: true }] },
  { id: 'form-evaluate', title: 'Evaluate survey', service: 'core', method: 'POST', path: `${P}/form-engine/survey/:code/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'customer_id', kind: 'text', default: 'sim-customer' },
    { name: 'data', kind: 'json', default: '{}', help: '{ "question": answer }' },
    { name: 'customer_conditions', kind: 'json', default: '{}' }, { name: 'vision_signals', kind: 'json', default: '{}' },
  ] },
  { id: 'form-evaluate-photos', title: 'Evaluate with photo', service: 'core', method: 'POST', path: `${P}/form-engine/survey/:code/evaluate-with-photos`, body: 'multipart', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'photo', kind: 'file', required: true }, ...PERSONAL,
    { name: 'data', kind: 'text', default: '{}', help: 'JSON string' }, { name: 'customer_conditions', kind: 'text', default: '{}', help: 'JSON string' },
  ] },
];

export const score: EndpointDef[] = [
  { id: 'score-evaluate', title: 'Evaluate (JSON)', service: 'core', method: 'POST', path: `${P}/score-engine/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'code', kind: 'text' }, { name: 'answer_list', kind: 'json', default: '[]' }, { name: 'customer_condition', kind: 'json', default: '{}' },
    { name: 'dimensions', kind: 'json', default: '[]' }, { name: 'vision_signals', kind: 'json', default: '{}' },
  ] },
  { id: 'score-evaluate-v2', title: 'Evaluate V2 (multipart, optional photo)', service: 'core', method: 'POST', path: `${P}/score-engine/evaluate/:code`, body: 'multipart', brand: 'snake', fields: [
    { name: 'code', kind: 'text', required: true }, { name: 'photo', kind: 'file' }, ...PERSONAL, { name: 'data', kind: 'text', default: '{}', help: 'JSON string' },
  ] },
  { id: 'score-rulesets', title: 'List rulesets', service: 'core', method: 'GET', path: `${P}/score-engine/rulesets`, body: 'none', brand: 'snake', fields: [] },
  { id: 'score-ruleset-active', title: 'Active ruleset', service: 'core', method: 'GET', path: `${P}/score-engine/rulesets/active`, body: 'none', brand: 'snake', fields: [] },
  { id: 'score-simulate', title: 'Simulate ruleset', service: 'core', method: 'POST', path: `${P}/score-engine/simulate`, body: 'json', brand: 'none', fields: [
    { name: 'schema', kind: 'text', required: true, help: 'ruleset JSON as a string (copy from Active ruleset)' },
    { name: 'form_scores', kind: 'json', default: '{}' }, { name: 'vision_scores', kind: 'json', default: '{}', help: 'health space, 100 = optimal' },
    { name: 'age_years', kind: 'number' }, { name: 'customer_condition', kind: 'json', default: '{}' },
  ] },
];

export const match: EndpointDef[] = [
  { id: 'match-evaluate', title: 'Evaluate match', service: 'core', method: 'POST', path: `${P}/match-engine/evaluate`, body: 'json', brand: 'snake', fields: [
    { name: 'dimension_scores', kind: 'json', default: '{}', required: true, help: 'paste dimension_scores from a score result' },
    { name: 'strategy_id', kind: 'text' }, { name: 'customer_conditions', kind: 'json', default: '{}' }, { name: 'preferences', kind: 'json', default: '{}' },
  ] },
  { id: 'match-products', title: 'Products', service: 'core', method: 'GET', path: `${P}/match-engine/products`, body: 'none', brand: 'snake', fields: [] },
  { id: 'match-shades', title: 'Shades of a product', service: 'core', method: 'GET', path: `${P}/match-engine/shades`, body: 'none', brand: 'none', fields: [{ name: 'product_id', kind: 'text', required: true }] },
];

export const vision: EndpointDef[] = [
  { id: 'vision-registry', title: 'Registry (dimensions, conditions)', service: 'core', method: 'GET', path: `${P}/vision-engine/registry`, body: 'none', brand: 'none', fields: [] },
  { id: 'vision-analyze', title: 'Analyze image', service: 'core', method: 'POST', path: `${P}/vision-engine/analyze-image`, body: 'multipart', brand: 'camel', fields: [
    { name: 'image_front', kind: 'file', required: true }, { name: 'image_left', kind: 'file' }, { name: 'image_right', kind: 'file' },
    { name: 'dimensions', kind: 'text', help: 'comma list of dimension codes' }, { name: 'skinConditions', kind: 'text', help: 'comma list' },
  ] },
];

export const colour: EndpointDef[] = [
  { id: 'colour-analyze', title: 'Analyze', service: 'core', method: 'POST', path: `${P}/colour-engine/analyze`, body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'hijab', kind: 'bool', default: false }, { name: 'hairVisible', kind: 'bool', default: true },
  ] },
  { id: 'colour-catalog', title: 'Catalog', service: 'core', method: 'GET', path: `${P}/colour-engine/catalog`, body: 'none', brand: 'none', fields: [] },
  { id: 'colour-quadrants', title: 'Quadrants', service: 'core', method: 'GET', path: `${P}/colour-engine/quadrants`, body: 'none', brand: 'none', fields: [] },
  { id: 'colour-tryon', title: 'Try-on (PNG)', service: 'core', method: 'POST', path: `${P}/colour-engine/tryon`, body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'shadeIds', kind: 'text', repeat: true, required: true, help: 'comma list of shade ids from Catalog' },
  ] },
];

export const faceArch: EndpointDef[] = [
  { id: 'facearch-measure', title: 'Face architecture', service: 'core', method: 'POST', path: `${P}/vision-engine/face-architecture/:brandId/:applicationId`, body: 'multipart', brand: 'path', fields: [{ name: 'image', kind: 'file', required: true }] },
  { id: 'facearch-head', title: '3D head (GLB)', service: 'core', method: 'POST', path: `${P}/vision-engine/face-architecture/:brandId/:applicationId/head`, body: 'multipart', brand: 'path', fields: [
    { name: 'front', kind: 'file', required: true }, { name: 'left', kind: 'file' }, { name: 'right', kind: 'file' },
  ] },
];

export const assessments: EndpointDef[] = [
  { id: 'assess-history', title: 'Brand history', service: 'core', method: 'GET', path: `${P}/assessments/history`, body: 'none', brand: 'snake', fields: [{ name: 'limit', kind: 'number', default: 20 }] },
  { id: 'assess-customer', title: 'Customer assessments', service: 'core', method: 'GET', path: `${P}/assessments/customers/:customerId`, body: 'none', brand: 'snake', fields: [{ name: 'customerId', kind: 'text', required: true }, { name: 'limit', kind: 'number', default: 20 }] },
];

export const flows: EndpointDef[] = [
  { id: 'flows-list', title: 'Conversation flows', service: 'core', method: 'GET', path: `${P}/conversation-flows`, body: 'none', brand: 'snake', fields: [] },
  { id: 'flows-active', title: 'Active flow', service: 'core', method: 'GET', path: `${P}/conversation-flows/active`, body: 'none', brand: 'snake', fields: [{ name: 'survey_code', kind: 'text', required: true }] },
];
```

`lib/endpoints/reference.ts`:
```ts
import type { EndpointDef } from '../endpoint';
const R = '/api/reference';
const list = (res: string, title: string): EndpointDef => ({ id: `ref-${res}`, title, service: 'ref', method: 'GET', path: `${R}/${res}`, body: 'none', brand: 'none', fields: [] });
export const reference: EndpointDef[] = [
  list('brands', 'Brands'), list('applications', 'Applications'), list('dimensions', 'Dimensions'), list('skin-conditions', 'Skin conditions'),
  { id: 'ref-products', title: 'Products', service: 'ref', method: 'GET', path: `${R}/products`, body: 'none', brand: 'none', fields: [{ name: 'brandId', kind: 'text', help: 'ref brand id (brd-…)' }] },
  list('all', 'Everything (/all)'),
];
```

`lib/endpoints/workers.ts`:
```ts
import type { EndpointDef } from '../endpoint';
export const wColour: EndpointDef[] = [
  { id: 'wc-analyze', title: 'PCA analyze (raw measurement)', service: 'colour', method: 'POST', path: '/pca/analyze', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'hijab', kind: 'bool', default: false }, { name: 'hairVisible', kind: 'bool', default: true },
  ] },
  { id: 'wc-render', title: 'VTO render (PNG)', service: 'colour', method: 'POST', path: '/vto/render', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true },
    { name: 'request', kind: 'text', default: '{"layers":[{"category":"lip","hexColor":"#B5485D","alpha":0.6}]}', help: 'JSON string {layers:[{category, hexColor, alpha, specular?, mode?}]}' },
  ] },
  { id: 'wc-params', title: 'Render params', service: 'colour', method: 'GET', path: '/vto/render-params', body: 'none', brand: 'none', fields: [] },
  { id: 'wc-munsell', title: 'Munsell', service: 'colour', method: 'POST', path: '/colour/munsell', body: 'json', brand: 'none', fields: [{ name: 'hexes', kind: 'json', default: '["#C68642"]' }] },
];
export const wFace: EndpointDef[] = [
  { id: 'wf-catalogue', title: 'Measurement catalogue', service: 'face', method: 'GET', path: '/api/v1/face-measure/catalogue', body: 'none', brand: 'none', fields: [] },
  { id: 'wf-measure', title: 'Face measure', service: 'face', method: 'POST', path: '/api/v1/face-measure', body: 'multipart', brand: 'none', fields: [{ name: 'image', kind: 'file', required: true }, { name: 'landmarks', kind: 'bool', default: false }] },
  { id: 'wf-head', title: 'Face head (GLB)', service: 'face', method: 'POST', path: '/api/v1/face-head', body: 'multipart', brand: 'none', fields: [
    { name: 'front', kind: 'file', required: true }, { name: 'left', kind: 'file' }, { name: 'right', kind: 'file' },
  ] },
];
export const wSkin: EndpointDef[] = [
  { id: 'ws-segment', title: 'Segment and pose', service: 'skin', method: 'POST', path: '/api/v1/segment-and-pose', body: 'multipart', brand: 'none', fields: [
    { name: 'image', kind: 'file', required: true }, { name: 'declaredAngle', kind: 'select', options: ['', 'front', 'left', 'right'] },
  ] },
  { id: 'ws-healthz', title: 'Features (/healthz)', service: 'skin', method: 'GET', path: '/healthz', body: 'none', brand: 'none', fields: [] },
];
export const wTryon: EndpointDef[] = [
  { id: 'wt-extract', title: 'Extract shade', service: 'tryon', method: 'POST', path: '/extract', body: 'json', brand: 'none',
    note: 'Async: returns 202 only. The result is posted to core-engine /shades/{id}/extraction-callback, not back here.',
    fields: [
      { name: 'shade_id', kind: 'text', required: true }, { name: 'reference_photo_url', kind: 'text', required: true },
      { name: 'hex_color', kind: 'text', default: '#B5485D' }, { name: 'region', kind: 'select', options: ['lip', 'eye', 'cheek', 'skin'], default: 'lip' },
    ] },
];
```

`lib/groups.ts`:
```ts
import type { EndpointDef } from './endpoint';
import { form, score, match, vision, colour, faceArch, assessments, flows } from './endpoints/core';
import { reference } from './endpoints/reference';
import { wColour, wFace, wSkin, wTryon } from './endpoints/workers';

export interface Group { id: string; title: string; section: 'Core' | 'Reference' | 'Workers'; endpoints: EndpointDef[] }

export const GROUPS: Group[] = [
  { id: 'form', title: 'Form', section: 'Core', endpoints: form },
  { id: 'score', title: 'Score', section: 'Core', endpoints: score },
  { id: 'match', title: 'Match', section: 'Core', endpoints: match },
  { id: 'vision', title: 'Vision', section: 'Core', endpoints: vision },
  { id: 'colour', title: 'Colour', section: 'Core', endpoints: colour },
  { id: 'face-arch', title: 'Face architecture', section: 'Core', endpoints: faceArch },
  { id: 'assessments', title: 'Assessments', section: 'Core', endpoints: assessments },
  { id: 'flows', title: 'Conversation flows', section: 'Core', endpoints: flows },
  { id: 'reference', title: 'Reference', section: 'Reference', endpoints: reference },
  { id: 'w-colour', title: 'Colour worker', section: 'Workers', endpoints: wColour },
  { id: 'w-face', title: 'Face worker', section: 'Workers', endpoints: wFace },
  { id: 'w-skin', title: 'Skin worker', section: 'Workers', endpoints: wSkin },
  { id: 'w-tryon', title: 'Try-on worker', section: 'Workers', endpoints: wTryon },
];

export const getGroup = (id: string) => GROUPS.find((g) => g.id === id);
```

- [ ] **Step 4: Run** `npm test` — PASS.

- [ ] **Step 5: Commit** `git add lib tests && git commit -m "feat: endpoint catalogue for core, reference and workers"`

---

### Task 5: Brand context, shell, health pills

**Files:**
- Create: `lib/brand.tsx`, `components/TopBar.tsx`, `components/HealthPills.tsx`, `components/BrandPicker.tsx`, `components/Nav.tsx`
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `SERVICES`, `svcPath` (T1); `call`, `CallResult` (T3); `GROUPS` (T4).
- Produces: `BrandProvider` (wraps app), `useBrand(): Brand & { setBrandId(v: string): void; setApplicationId(v: string): void }`.

- [ ] **Step 1: Implement** `lib/brand.tsx`

```tsx
'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Brand } from './endpoint';

type Ctx = Brand & { setBrandId(v: string): void; setApplicationId(v: string): void };
const BrandCtx = createContext<Ctx | null>(null);
const KEY = 'sim.brand';

function load(): Brand {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? ''); if (v && typeof v.brandId === 'string') return v; } catch {}
  return { brandId: '', applicationId: '' };
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [b, setB] = useState<Brand>({ brandId: '', applicationId: '' });
  useEffect(() => setB(load()), []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {} }, [b]);
  return (
    <BrandCtx.Provider value={{ ...b, setBrandId: (brandId) => setB((p) => ({ ...p, brandId })), setApplicationId: (applicationId) => setB((p) => ({ ...p, applicationId })) }}>
      {children}
    </BrandCtx.Provider>
  );
}

export function useBrand() {
  const c = useContext(BrandCtx);
  if (!c) throw new Error('useBrand outside BrandProvider');
  return c;
}
```

`components/HealthPills.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { SERVICES, svcPath, type ServiceId } from '@/lib/services';
import { call } from '@/lib/http';

export function HealthPills() {
  const [state, setState] = useState<Partial<Record<ServiceId, number>>>({});
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const entries = await Promise.all(Object.values(SERVICES).map(async (s) => {
        const r = await call({ url: svcPath(s.id, s.healthPath), init: { method: 'GET', cache: 'no-store' } });
        return [s.id, r.status] as const;
      }));
      if (alive) setState(Object.fromEntries(entries));
    };
    poll();
    const t = setInterval(poll, 10_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.values(SERVICES).map((s) => {
        const st = state[s.id];
        const ok = st !== undefined && st >= 200 && st < 300;
        const cls = st === undefined ? 'bg-zinc-200 text-zinc-600' : ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';
        return <span key={s.id} title={`${s.label}: ${st === undefined ? 'checking' : st === 0 ? 'unreachable' : `HTTP ${st}`}`} className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{s.label} {st === undefined ? '…' : ok ? '●' : st || '✕'}</span>;
      })}
    </div>
  );
}
```

`components/BrandPicker.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { call } from '@/lib/http';
import { svcPath } from '@/lib/services';
import { useBrand } from '@/lib/brand';

type Opt = { value: string; label: string };
const load = async (res: string, value: string): Promise<Opt[] | string> => {
  const r = await call({ url: svcPath('ref', `/api/reference/${res}`), init: { method: 'GET' } });
  if (!r.ok) return r.networkError ?? `reference ${res}: HTTP ${r.status}`;
  const data = (r.json as { data?: Record<string, string>[] })?.data ?? [];
  return data.map((d) => ({ value: d[value], label: `${d.name} (${d[value]})` }));
};

export function BrandPicker() {
  const b = useBrand();
  const [brands, setBrands] = useState<Opt[] | string>([]);
  const [apps, setApps] = useState<Opt[] | string>([]);
  useEffect(() => { load('brands', 'code').then(setBrands); load('applications', 'key').then(setApps); }, []);
  const sel = (opts: Opt[] | string, v: string, set: (v: string) => void, ph: string) =>
    typeof opts === 'string'
      ? <input className="rounded border px-2 py-1 text-sm" placeholder={ph} value={v} onChange={(e) => set(e.target.value)} title={opts} />
      : <select className="rounded border px-2 py-1 text-sm" value={v} onChange={(e) => set(e.target.value)}>
          <option value="">{ph}</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>;
  return (
    <div className="flex gap-2">
      {sel(brands, b.brandId, b.setBrandId, 'brand')}
      {sel(apps, b.applicationId, b.setApplicationId, 'application')}
    </div>
  );
}
```
(When reference is down the pickers become free-text inputs with the error as tooltip — no invented options.)

`components/Nav.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GROUPS } from '@/lib/groups';

export function Nav() {
  const path = usePathname();
  const sections = ['Core', 'Reference', 'Workers'] as const;
  const item = (href: string, label: string) => (
    <Link key={href} href={href} className={`block rounded px-2 py-1 text-sm ${path === href ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>{label}</Link>
  );
  return (
    <nav className="w-52 shrink-0 space-y-4 border-r p-3">
      {sections.map((s) => (
        <div key={s}>
          <div className="mb-1 text-xs font-semibold uppercase text-zinc-500">{s}</div>
          {GROUPS.filter((g) => g.section === s).map((g) => item(`/${g.id}`, g.title))}
          {s === 'Reference' && null}
        </div>
      ))}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase text-zinc-500">Conversation</div>
        {item('/conversation', 'Session + chat')}
      </div>
    </nav>
  );
}
```

`components/TopBar.tsx`:
```tsx
import { HealthPills } from './HealthPills';
import { BrandPicker } from './BrandPicker';
export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
      <span className="font-semibold">Seagull Simulator</span>
      <HealthPills />
      <BrandPicker />
    </header>
  );
}
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { BrandProvider } from '@/lib/brand';
import { TopBar } from '@/components/TopBar';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = { title: 'Seagull Simulator' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-zinc-900">
        <BrandProvider>
          <TopBar />
          <div className="flex">
            <Nav />
            <main className="min-w-0 flex-1 p-4">{children}</main>
          </div>
        </BrandProvider>
      </body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div className="max-w-2xl space-y-2 text-sm text-zinc-700">
      <h1 className="text-lg font-semibold text-zinc-900">Seagull Simulator</h1>
      <p>Calls every Seagull service directly (no gateway). Pick a brand and application above, then a screen on the left.</p>
      <p>Service URLs come from <code>.env.local</code> (see <code>.env.example</code>); restart after changing them.</p>
    </div>
  );
}
```
`app/globals.css`: keep only `@import "tailwindcss";`.

- [ ] **Step 2: Verify** `npm run build` — succeeds. `npm run dev`, open http://localhost:3100: Core and Reference pills green, the others red "✕"; brand dropdown lists Make Over / Wardah; application lists skinverse; refresh keeps the selection.

- [ ] **Step 3: Commit** `git add -A && git commit -m "feat: shell with health pills and brand picker"`

---

### Task 6: EndpointPanel, FieldInput, ResponseView, group page

**Files:**
- Create: `components/FieldInput.tsx`, `components/ResponseView.tsx`, `components/GlbViewer.tsx`, `components/EndpointPanel.tsx`, `app/[group]/page.tsx`

**Interfaces:**
- Consumes: `EndpointDef`, `Field`, `FieldValue`, `buildRequest` (T2); `call`, `CallResult` (T3); `getGroup` (T4); `useBrand` (T5).
- Produces: `<EndpointPanel def={EndpointDef} />`, `<ResponseView result={CallResult} />` (reused by T7).

- [ ] **Step 1: Implement** `components/FieldInput.tsx`

```tsx
'use client';
import { useRef, useState } from 'react';
import type { Field, FieldValue } from '@/lib/endpoint';

function Webcam({ onShot }: { onShot: (f: File) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const [err, setErr] = useState('');
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setOn(true); setErr('');
    } catch (e) { setErr((e as Error).message); }
  };
  const shoot = () => {
    const v = video.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    c.toBlob((b) => b && onShot(new File([b], 'webcam.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.92);
    (v.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop()); setOn(false);
  };
  return (
    <span className="inline-flex items-center gap-1">
      <video ref={video} className={on ? 'h-24 rounded' : 'hidden'} muted playsInline />
      <button type="button" className="rounded border px-2 text-xs" onClick={on ? shoot : start}>{on ? 'Capture' : 'Webcam'}</button>
      {err && <span className="text-xs text-red-700">{err}</span>}
    </span>
  );
}

export function FieldInput({ field, value, onChange }: { field: Field; value: FieldValue; onChange: (v: FieldValue) => void }) {
  const base = 'w-full rounded border px-2 py-1 text-sm font-mono';
  switch (field.kind) {
    case 'bool':
      return <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />;
    case 'number':
      return <input className={base} type="number" value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value)} />;
    case 'json':
      return <textarea className={`${base} h-24`} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return <select className={base} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>{field.options?.map((o) => <option key={o} value={o}>{o || '—'}</option>)}</select>;
    case 'file':
      return (
        <span className="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} className="text-xs" />
          <Webcam onShot={onChange} />
          {value instanceof File && <span className="text-xs text-zinc-500">{value.name} · {Math.round(value.size / 1024)} KB</span>}
        </span>
      );
    case 'files':
      return <input type="file" accept="image/*" multiple onChange={(e) => onChange(Array.from(e.target.files ?? []))} className="text-xs" />;
    default:
      return <input className={base} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
  }
}
```

`components/GlbViewer.tsx`:
```tsx
'use client';
import { useEffect } from 'react';
import { createElement } from 'react';

export function GlbViewer({ src }: { src: string }) {
  useEffect(() => { import('@google/model-viewer'); }, []);
  return createElement('model-viewer', { src, 'camera-controls': true, 'auto-rotate': true, style: { width: '100%', height: 420, background: '#f4f4f5' } });
}
```

`components/ResponseView.tsx`:
```tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { CallResult } from '@/lib/http';

const GlbViewer = dynamic(() => import('./GlbViewer').then((m) => m.GlbViewer), { ssr: false });

export function ResponseView({ result }: { result: CallResult }) {
  const tabs = [
    result.kind === 'json' && 'json', result.kind === 'image' && 'image', result.kind === 'glb' && '3d',
    result.kind === 'text' && 'text', 'headers',
  ].filter(Boolean) as string[];
  const [tab, setTab] = useState(tabs[0]);
  const colour = result.status === 0 ? 'bg-red-600' : result.ok ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <div className="mt-3 rounded border">
      <div className="flex items-center gap-2 border-b px-2 py-1 text-xs">
        <span className={`rounded px-1.5 py-0.5 font-semibold text-white ${colour}`}>{result.status || 'ERR'}</span>
        <span>{result.ms} ms</span>
        {result.size !== undefined && <span>{Math.round(result.size / 1024)} KB</span>}
        <span className="truncate text-zinc-500">{result.url}</span>
        <span className="ml-auto flex gap-1">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded px-1.5 ${tab === t ? 'bg-zinc-200' : ''}`}>{t}</button>)}</span>
      </div>
      <div className="max-h-[32rem] overflow-auto p-2 text-xs">
        {result.networkError && <p className="text-red-700">{result.networkError}</p>}
        {tab === 'json' && <pre>{JSON.stringify(result.json, null, 2)}</pre>}
        {tab === 'text' && <pre className="whitespace-pre-wrap">{result.text}</pre>}
        {tab === 'image' && result.blobUrl && <img src={result.blobUrl} alt="response" className="max-h-[30rem]" />}
        {tab === '3d' && result.blobUrl && (
          <div><GlbViewer src={result.blobUrl} /><a className="underline" href={result.blobUrl} download="head.glb">download .glb</a></div>
        )}
        {tab === 'headers' && <table><tbody>{result.headers.map(([k, v]) => <tr key={k}><td className="pr-3 font-mono text-zinc-500">{k}</td><td className="font-mono break-all">{v}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
```

`components/EndpointPanel.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { buildRequest, type EndpointDef, type FieldValue } from '@/lib/endpoint';
import { call, type CallResult } from '@/lib/http';
import { useBrand } from '@/lib/brand';
import { FieldInput } from './FieldInput';
import { ResponseView } from './ResponseView';

export function EndpointPanel({ def }: { def: EndpointDef }) {
  const brand = useBrand();
  const [values, setValues] = useState<Record<string, FieldValue>>(() => Object.fromEntries(def.fields.map((f) => [f.name, f.default])));
  const [result, setResult] = useState<CallResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const needsBrand = def.brand !== 'none' && (!brand.brandId || !brand.applicationId);

  const send = async () => {
    setError('');
    let req;
    try { req = buildRequest(def, values, brand); } catch (e) { setError((e as Error).message); return; }
    setBusy(true);
    setResult(await call(req));
    setBusy(false);
  };

  return (
    <section className="rounded-lg border p-3">
      <div className="flex items-baseline gap-2">
        <span className="rounded bg-zinc-100 px-1.5 font-mono text-xs">{def.method}</span>
        <h2 className="font-medium">{def.title}</h2>
        <code className="truncate text-xs text-zinc-500">{def.path}</code>
      </div>
      {def.note && <p className="mt-1 text-xs text-amber-700">{def.note}</p>}
      {def.fields.length > 0 && (
        <div className="mt-2 grid grid-cols-[10rem_1fr] items-center gap-x-3 gap-y-1.5">
          {def.fields.map((f) => [
            <label key={`${f.name}-l`} className="text-xs font-mono">{f.label ?? f.name}{f.required && <span className="text-red-600">*</span>}</label>,
            <div key={`${f.name}-i`}>
              <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
              {f.help && <div className="text-[11px] text-zinc-500">{f.help}</div>}
            </div>,
          ])}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button onClick={send} disabled={busy} className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send'}</button>
        {needsBrand && <span className="text-xs text-amber-700">pick a brand and application in the top bar</span>}
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
      {result && <ResponseView key={`${result.url}-${result.ms}`} result={result} />}
    </section>
  );
}
```

`app/[group]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { GROUPS, getGroup } from '@/lib/groups';
import { EndpointPanel } from '@/components/EndpointPanel';

export function generateStaticParams() { return GROUPS.map((g) => ({ group: g.id })); }

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const g = getGroup(group);
  if (!g) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{g.title}</h1>
      {g.endpoints.map((e) => <EndpointPanel key={e.id} def={e} />)}
    </div>
  );
}
```

- [ ] **Step 2: Verify** `npm test && npm run lint && npm run build` — all pass. Then `npm run dev` and in the browser:
  - `/reference` → Brands → Send: 200, JSON with Make Over / Wardah.
  - `/form` → List surveys (brand Wardah, app skinverse) → real status shown (200 list, or the real 4xx body).
  - `/colour` → Catalog → real response (200, or 503 with reason if WCPA config is absent).
  - `/w-skin` → Segment and pose → status ERR / 500 from the proxy with "unreachable" text, since the worker isn't running.
  - `/nope` → 404.

- [ ] **Step 3: Commit** `git add -A && git commit -m "feat: generic endpoint panel, response viewer and group pages"`

---

### Task 7: Conversation screen

**Files:**
- Create: `lib/conversation.ts`, `tests/conversation.test.ts`, `app/conversation/page.tsx`

**Interfaces:**
- Consumes: `call` (T3), `svcPath` (T1), `useBrand` (T5), `ResponseView` (T6).
- Produces: `wsUrl(base: string, sessionId: string, ticket: string): string`; `type WsEvent = { at: number; dir: 'in' | 'out'; type: string; payload: unknown }`; `summarize(e: WsEvent): string`.

- [ ] **Step 1: Failing test** `tests/conversation.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { wsUrl, summarize } from '@/lib/conversation';

describe('conversation helpers', () => {
  it('builds the ws url', () => {
    expect(wsUrl('ws://localhost:8098/', 's 1', 't&k')).toBe('ws://localhost:8098/conversation/ws?session_id=s+1&ticket=t%26k');
  });
  it('summarizes transcript, tool, error and audio', () => {
    expect(summarize({ at: 0, dir: 'in', type: 'transcript', payload: { type: 'transcript', speaker: 'agent', text: 'hi', final: true } })).toBe('agent: hi');
    expect(summarize({ at: 0, dir: 'in', type: 'tool', payload: { type: 'tool', name: 'submit', phase: 'end', duration_ms: 12 } })).toBe('tool submit end (12 ms)');
    expect(summarize({ at: 0, dir: 'in', type: 'error', payload: { type: 'error', message: 'boom', fatal: true } })).toBe('error (fatal): boom');
    expect(summarize({ at: 0, dir: 'in', type: 'audio', payload: { type: 'audio', data: 'xxxx' } })).toBe('audio chunk (4 b64 chars)');
  });
});
```

- [ ] **Step 2: Run** `npm test` — FAIL.

- [ ] **Step 3: Implement** `lib/conversation.ts`

```ts
export type WsEvent = { at: number; dir: 'in' | 'out'; type: string; payload: unknown };

export const WS_BASE = process.env.NEXT_PUBLIC_SIM_CONVERSATION_WS || 'ws://localhost:8098';

export function wsUrl(base: string, sessionId: string, ticket: string) {
  const q = new URLSearchParams({ session_id: sessionId, ticket });
  return `${base.replace(/\/+$/, '')}/conversation/ws?${q}`;
}

export function summarize(e: WsEvent): string {
  const p = (e.payload ?? {}) as Record<string, unknown>;
  switch (e.type) {
    case 'transcript': return `${p.speaker}: ${p.text}${p.final === false ? ' …' : ''}`;
    case 'tool': return `tool ${p.name} ${p.phase}${p.duration_ms !== undefined ? ` (${p.duration_ms} ms)` : ''}`;
    case 'error': return `error${p.fatal ? ' (fatal)' : ''}: ${p.message}`;
    case 'audio': return `audio chunk (${String(p.data ?? '').length} b64 chars)`;
    case 'text': return `you: ${p.text}`;
    default: return JSON.stringify(p);
  }
}
```

`app/conversation/page.tsx`:
```tsx
'use client';
import { useRef, useState } from 'react';
import { call, type CallResult } from '@/lib/http';
import { svcPath } from '@/lib/services';
import { useBrand } from '@/lib/brand';
import { ResponseView } from '@/components/ResponseView';
import { WS_BASE, wsUrl, summarize, type WsEvent } from '@/lib/conversation';

export default function ConversationPage() {
  const brand = useBrand();
  const [surveyCode, setSurveyCode] = useState('');
  const [customerId, setCustomerId] = useState('sim-customer');
  const [session, setSession] = useState<{ id: string; owner: string } | null>(null);
  const [last, setLast] = useState<CallResult | null>(null);
  const [events, setEvents] = useState<WsEvent[]>([]);
  const [text, setText] = useState('');
  const [wsState, setWsState] = useState<'closed' | 'connecting' | 'open'>('closed');
  const ws = useRef<WebSocket | null>(null);

  const owner = () => ({ 'X-Session-Owner': session?.owner ?? '' });
  const push = (e: WsEvent) => setEvents((p) => [...p, e]);

  const create = async () => {
    const r = await call({ url: svcPath('conv', '/conversation/sessions'), init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand_id: brand.brandId, application_id: brand.applicationId, survey_code: surveyCode, customer_id: customerId }) } });
    setLast(r);
    const j = r.json as { session_id?: string; owner_token?: string } | undefined;
    if (r.ok && j?.session_id && j.owner_token) { setSession({ id: j.session_id, owner: j.owner_token }); setEvents([]); }
  };
  const get = async () => session && setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}`), init: { method: 'GET', headers: owner() } }));
  const del = async () => {
    if (!session) return;
    ws.current?.close();
    setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}`), init: { method: 'DELETE', headers: owner() } }));
    setSession(null);
  };
  const photo = async (f: File | undefined) => {
    if (!session || !f) return;
    setLast(await call({ url: svcPath('conv', `/conversation/sessions/${session.id}/photo`), init: { method: 'POST', headers: { ...owner(), 'Content-Type': f.type, 'X-Photo-Filename': f.name }, body: f } }));
  };
  const connect = async () => {
    if (!session) return;
    const r = await call({ url: svcPath('conv', `/conversation/sessions/${session.id}/ws-ticket`), init: { method: 'POST', headers: owner() } });
    setLast(r);
    const ticket = (r.json as { ticket?: string } | undefined)?.ticket;
    if (!r.ok || !ticket) return;
    setWsState('connecting');
    const sock = new WebSocket(wsUrl(WS_BASE, session.id, ticket));
    ws.current = sock;
    sock.onopen = () => setWsState('open');
    sock.onclose = (e) => { setWsState('closed'); push({ at: Date.now(), dir: 'in', type: 'close', payload: { code: e.code, reason: e.reason } }); };
    sock.onmessage = (m) => {
      let payload: unknown = m.data;
      try { payload = JSON.parse(String(m.data)); } catch {}
      push({ at: Date.now(), dir: 'in', type: (payload as { type?: string })?.type ?? 'raw', payload });
    };
  };
  const send = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !text.trim()) return;
    const msg = { type: 'text', text };
    ws.current.send(JSON.stringify(msg));
    push({ at: Date.now(), dir: 'out', type: 'text', payload: msg });
    setText('');
  };

  const input = 'rounded border px-2 py-1 text-sm';
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Conversation</h1>
      <section className="space-y-2 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input className={input} placeholder="survey_code" value={surveyCode} onChange={(e) => setSurveyCode(e.target.value)} />
          <input className={input} placeholder="customer_id" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <button className="rounded bg-zinc-900 px-3 py-1 text-sm text-white" onClick={create}>Create session</button>
          {(!brand.brandId || !brand.applicationId) && <span className="text-xs text-amber-700">pick a brand and application in the top bar</span>}
        </div>
        {session && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <code className="text-xs">{session.id}</code>
            <button className="rounded border px-2" onClick={get}>Get state</button>
            <label className="rounded border px-2">Upload photo<input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => photo(e.target.files?.[0])} /></label>
            <button className="rounded border px-2" onClick={connect} disabled={wsState !== 'closed'}>Connect WS ({wsState})</button>
            <button className="rounded border px-2" onClick={() => ws.current?.send(JSON.stringify({ type: 'close' }))} disabled={wsState !== 'open'}>Close WS</button>
            <button className="rounded border px-2 text-red-700" onClick={del}>Delete session</button>
          </div>
        )}
        {last && <ResponseView key={`${last.url}-${last.ms}`} result={last} />}
      </section>
      {session && (
        <section className="rounded-lg border p-3">
          <div className="max-h-96 space-y-0.5 overflow-auto font-mono text-xs">
            {events.map((e, i) => (
              <div key={i} className={e.dir === 'out' ? 'text-blue-700' : e.type === 'error' ? 'text-red-700' : ''}>
                <span className="text-zinc-400">{new Date(e.at).toLocaleTimeString()} </span>{summarize(e)}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className={`${input} flex-1`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="type a message (WS must be open)" />
            <button className="rounded bg-zinc-900 px-3 py-1 text-sm text-white" onClick={send} disabled={wsState !== 'open'}>Send</button>
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify** `npm test && npm run lint && npm run build` — pass. In the browser `/conversation` → Create session with conversation-engine down → ResponseView shows the real proxy error (not a fake session).

- [ ] **Step 5: Commit** `git add -A && git commit -m "feat: conversation session and WebSocket text screen"`

---

### Task 8: README and end-to-end check

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write** `README.md`

````markdown
# seagull-simulator

Standalone tool that calls every Seagull service directly — no gateway, no API key.

```bash
npm install
cp .env.example .env.local   # only if a service is not on its default localhost port
npm run dev                  # http://localhost:3100
```

Each `/svc/<service>/*` path is rewritten server-side to that service's URL
(`SIM_*_URL`, defaults in `.env.example`), so the browser never hits CORS.
The conversation WebSocket goes straight to `NEXT_PUBLIC_SIM_CONVERSATION_WS`.

Screens: Core (form, score, match, vision, colour, face architecture,
assessments, conversation flows), Reference, Conversation (session + text chat),
and the colour, face, skin and try-on workers.

Every response is shown as returned — status, timing, headers, body. Nothing is
mocked; a service that is down shows red in the top bar.

Adding an endpoint: append an `EndpointDef` to `lib/endpoints/*.ts`; the group
page renders it. `npm test` checks every definition builds.
````

- [ ] **Step 2: End-to-end** with core (:8082) and reference (:8086) running: `npm run dev`, then exercise `/reference` (all six), `/form` list, `/score` rulesets + active, `/vision` registry, `/colour` catalog, `/assessments` history, `/flows` list. Record each status. Any non-2xx must be a real backend response (check the body), not a simulator bug.

- [ ] **Step 3: Final checks** `npm test && npm run lint && npm run build` — all pass.

- [ ] **Step 4: Commit** `git add -A && git commit -m "docs: README"`
