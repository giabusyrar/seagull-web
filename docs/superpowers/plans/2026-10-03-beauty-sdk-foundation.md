# Beauty SDK — Phase 0 (split) and Phase 1 (foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the admin studio out of `@gateway-experience/beauty-sdk` and give the SDK its foundation — typed client, Next.js proxy, provider/messages/hooks, photo components, compiled stylesheet, example app and publish pipeline — so phases 2–5 only add experiences.

**Architecture:** One operations table (method, SDK path, gateway path, scope placement, customer requirement, timeout) drives both the browser client and the server proxy, so they cannot drift. React-free `/client` and `/server` entries; `"use client"` `/react` and `/photo` entries; components use Tailwind v4 with prefix `bsdk`, compiled to `dist/styles.css` inside `@layer bsdk`. A separate example app installs the packed tarball to prove the package works outside the monorepo.

**Tech Stack:** TypeScript 5, React 19.2, Next.js 16.2 (App Router, route handlers), tsup 8, Tailwind CSS v4 (`@tailwindcss/cli`), vitest 2 + @testing-library/react 16 + jsdom, changesets, GitLab CI.

**Spec:** `docs/superpowers/specs/2026-10-03-beauty-sdk-design.md`

## Global Constraints

- Brand SDK package name `@gateway-experience/beauty-sdk`; admin package `@gateway-experience/studio`, `private: true`, never published.
- The SDK must not depend on `@gateway-experience/shared`.
- `/client` and `/server` import nothing from `react`, `react-dom` or `next`.
- `react`, `react-dom`, `next` are `peerDependencies`; `three` is an optional peer used only by `/head` (phase 3).
- Every component and hook file starts with `"use client"`; the `/react` and `/photo` bundles carry a `"use client"` banner.
- Tailwind prefix `bsdk`; all CSS inside `@layer bsdk`; no preflight or global reset.
- Every element a brand may style carries `data-bsdk-part="<part>"`.
- No browser storage in SDK hooks by default.
- Copy goes through the message dictionary; shipped locales `id` and `en`; a missing key renders as the key itself.
- Values core sends as `null` stay `null`; nothing is filled in.
- Literals that vary by deployment never appear in code. Timeouts are named, defined once, and cite the core-engine constant they derive from.
- Repo rules (AGENTS.md): claim a lane in `docs/LANES.md` before editing; never `git push`.

## Decision flagged for the user

`DEFAULT_PROXY_TIMEOUT_MS = 15_000` (Task 5) is a proxy-side choice for operations with no core-engine timeout to derive from (reference reads, survey evaluate, assessment history). It is overridable per operation via `createBeautyProxy({ timeouts })`. Confirm or replace before executing Task 5.

## File structure

```
packages/studio/                         NEW, private
  package.json, tsconfig.json, tsup.config.ts, vitest.config.ts
  src/index.ts                           (was beauty-sdk/src/studio/index.ts)
  src/form/ match/ reference/ score/     (was beauty-sdk/src/studio/*)
  src/orchestrator/                      (was beauty-sdk/src/orchestrator)
  src/core/collection-resolver.ts        (was beauty-sdk/src/core/collection-resolver.ts)
  src/core/scope.ts, scope.test.ts       (was beauty-sdk/src/core/scope*.ts)
  src/core/index.ts                      NEW: re-exports the two

packages/beauty-sdk/
  src/client/errors.ts                   BeautyApiError, parseApiError
  src/client/operations.ts               OPERATIONS table, matchOperation, toGatewayRequest
  src/client/transport.ts                createBeautyClient
  src/client/reference.ts                reference types + typed methods
  src/client/index.ts                    /client entry
  src/server/timeouts.ts                 named timeout defaults
  src/server/proxy.ts                    createBeautyProxy
  src/server/index.ts                    /server entry
  src/react/messages.ts                  default dictionary + format()
  src/react/BeautyProvider.tsx           provider, useBeauty()
  src/react/useOperation.ts              generic run/abort/tied-to-input hook
  src/react/usePhotoSet.ts               front + ¾ photo set
  src/react/index.ts                     /react entry
  src/photo/cn.ts                        class merge with bsdk prefix
  src/photo/PhotoSet.tsx                 photo slots component
  src/photo/index.ts                     /photo entry
  src/styles/index.css                   Tailwind input
  scripts/check-entries.test.ts          bundle boundary tests
  scripts/css.test.ts                    stylesheet tests
  README.md                              brand-facing usage

examples/next-brand/                     NEW, outside the npm workspaces
.changeset/config.json, .gitlab-ci.yml   NEW
```

---

## Phase 0 — Split

### Task 1: Move the admin studio and orchestrator into `@gateway-experience/studio`

**Files:**
- Create: `packages/studio/package.json`, `packages/studio/tsconfig.json`, `packages/studio/tsup.config.ts`, `packages/studio/vitest.config.ts`, `packages/studio/src/core/index.ts`
- Move (git mv): `packages/beauty-sdk/src/studio/*` → `packages/studio/src/`; `packages/beauty-sdk/src/orchestrator` → `packages/studio/src/orchestrator`; `packages/beauty-sdk/src/core/{collection-resolver.ts,scope.ts,scope.test.ts}` → `packages/studio/src/core/`
- Modify: `packages/beauty-sdk/src/index.ts`, `packages/beauty-sdk/src/core/index.ts`, `packages/beauty-sdk/package.json`, `packages/beauty-sdk/tsup.config.ts`, root `package.json` (`build:packages`), `apps/web/package.json`, and the web files importing the moved code (listed in Step 6)

**Interfaces:**
- Produces: `@gateway-experience/studio` with entries `.`, `./form`, `./score`, `./match`, `./reference`, `./orchestrator`, `./core` (exporting everything `collection-resolver.ts` and `scope.ts` export today: `CoreCollectionKey`, `DynamicCollectionRoute`, `DynamicCollection`, `getActiveCoreCollections`, `getCollectionPrefix`, `resolveDynamicEndpoint`, `ALL_TENANTS`, `tenantScopeQuery`, `withTenantScope`).

- [ ] **Step 1: Claim the lanes**

Add to `docs/LANES.md` under Active claims (replace `<session>` and `<ref>` from `ListAgents`):

```
| `sdk`, `web` (beauty-sdk phase 0) | <session> [<ref>] | `packages/beauty-sdk/`, `packages/studio/`, `apps/web/app/{forms,matching,reference,scoring}/`, `apps/web/app/api/orchestrator/`, `apps/web/features/{orchestrator,api-client}/`, `apps/web/lib/hooks/use-core-collection.ts`, `apps/web/package.json`, `package.json` | <date> |
```

Notify active peers in the `shared` lane rule's spirit: run `ListAgents` and message any session holding a lane under `packages/` that `beauty-sdk` exports are changing.

- [ ] **Step 2: Move the files**

```bash
mkdir -p packages/studio/src/core
git mv packages/beauty-sdk/src/studio/form packages/studio/src/form
git mv packages/beauty-sdk/src/studio/match packages/studio/src/match
git mv packages/beauty-sdk/src/studio/reference packages/studio/src/reference
git mv packages/beauty-sdk/src/studio/score packages/studio/src/score
git mv packages/beauty-sdk/src/studio/index.ts packages/studio/src/index.ts
git mv packages/beauty-sdk/src/orchestrator packages/studio/src/orchestrator
git mv packages/beauty-sdk/src/core/collection-resolver.ts packages/studio/src/core/collection-resolver.ts
git mv packages/beauty-sdk/src/core/scope.ts packages/studio/src/core/scope.ts
git mv packages/beauty-sdk/src/core/scope.test.ts packages/studio/src/core/scope.test.ts
```

- [ ] **Step 3: Fix the relative imports that lost one directory level**

The moved studio files reached `core` through one more `../` than they now need. Rewrite with a placeholder so the two patterns cannot double-apply:

```bash
grep -rl "core/collection-resolver\|core/scope" packages/studio/src | xargs sed -i \
  -e "s#\.\./\.\./\.\./\.\./core/#@@CORE3@@#g" \
  -e "s#\.\./\.\./\.\./core/#../../core/#g" \
  -e "s#@@CORE3@@#../../../core/#g"
```

Create `packages/studio/src/core/index.ts`:

```ts
export * from './collection-resolver';
export * from './scope';
```

- [ ] **Step 4: Package files for studio**

`packages/studio/package.json`:

```json
{
  "name": "@gateway-experience/studio",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
    "./form": { "types": "./dist/form/index.d.ts", "import": "./dist/form/index.mjs", "require": "./dist/form/index.js" },
    "./score": { "types": "./dist/score/index.d.ts", "import": "./dist/score/index.mjs", "require": "./dist/score/index.js" },
    "./match": { "types": "./dist/match/index.d.ts", "import": "./dist/match/index.mjs", "require": "./dist/match/index.js" },
    "./reference": { "types": "./dist/reference/index.d.ts", "import": "./dist/reference/index.mjs", "require": "./dist/reference/index.js" },
    "./orchestrator": { "types": "./dist/orchestrator/index.d.ts", "import": "./dist/orchestrator/index.mjs", "require": "./dist/orchestrator/index.js" },
    "./core": { "types": "./dist/core/index.d.ts", "import": "./dist/core/index.mjs", "require": "./dist/core/index.js" }
  },
  "scripts": { "build": "tsup", "typecheck": "tsc --noEmit", "test": "vitest run" },
  "dependencies": {
    "@gateway-experience/shared": "*",
    "lucide-react": "^1.27.0",
    "survey-core": "^3.0.2",
    "survey-react-ui": "^3.0.2"
  },
  "devDependencies": { "tsup": "^8.5.1", "typescript": "^5.0.0", "vitest": "^2.1.9" },
  "peerDependencies": { "next": "^16.0.0", "react": "^19.0.0", "react-dom": "^19.0.0" }
}
```

Copy `packages/beauty-sdk/tsconfig.json` and `packages/beauty-sdk/vitest.config.ts` to `packages/studio/` unchanged.

`packages/studio/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'form/index': 'src/form/index.ts',
    'score/index': 'src/score/index.ts',
    'match/index': 'src/match/index.ts',
    'reference/index': 'src/reference/index.ts',
    'orchestrator/index': 'src/orchestrator/index.ts',
    'core/index': 'src/core/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'next', 'survey-core', 'survey-react-ui'],
});
```

- [ ] **Step 5: Trim the SDK**

`packages/beauty-sdk/src/core/index.ts` becomes:

```ts
export * from './types';
export * from './client';
```

In `packages/beauty-sdk/src/index.ts` delete the blocks `// 5. Studio Layer`, `// 6. Orchestrator Layer`, and the four `export * as Form/Score/Match/Reference` lines; keep `Vision`.

In `packages/beauty-sdk/tsup.config.ts` remove the entries `studio/index`, `form/index`, `score/index`, `match/index`, `reference/index`; in `package.json` remove the matching `exports` (`./studio`, `./form`, `./score`, `./match`, `./reference`, `./orchestrator`), remove `"@gateway-experience/shared"`, `"survey-core"`, `"survey-react-ui"` from `dependencies` and `'survey-core', 'survey-react-ui'` from tsup `external`.

Root `package.json`:

```json
"build:packages": "npm run build -w @gateway-experience/shared && npm run build -w @gateway-experience/beauty-sdk && npm run build -w @gateway-experience/studio",
```

`apps/web/package.json` dependencies: add `"@gateway-experience/studio": "*"`.

- [ ] **Step 6: Point the dashboard at the new package**

```bash
cd apps/web
sed -i "s#@gateway-experience/beauty-sdk/form#@gateway-experience/studio/form#g; s#@gateway-experience/beauty-sdk/score#@gateway-experience/studio/score#g; s#@gateway-experience/beauty-sdk/match#@gateway-experience/studio/match#g; s#@gateway-experience/beauty-sdk/reference#@gateway-experience/studio/reference#g; s#@gateway-experience/beauty-sdk/orchestrator#@gateway-experience/studio/orchestrator#g" \
  app/forms/page.tsx app/forms/runner/page.tsx app/matching/page.tsx app/reference/page.tsx "app/reference/[entity]/page.tsx" app/scoring/page.tsx app/api/orchestrator/pipeline/route.ts features/api-client/ApiClientApp.tsx
```

In `features/orchestrator/PipelineSimulatorView.tsx` change the import of `PipelineExecutionStrategy, UnifiedAssessmentResponse, AssessmentPayload` from `'@gateway-experience/beauty-sdk'` to `'@gateway-experience/studio/orchestrator'`.

In `lib/hooks/use-core-collection.ts` change the import of `DynamicCollection, getActiveCoreCollections, resolveDynamicEndpoint, CoreCollectionKey` from `'@gateway-experience/beauty-sdk'` to `'@gateway-experience/studio/core'`.

- [ ] **Step 7: Verify nothing else still reaches the moved code**

```bash
cd ../..
grep -rn "@gateway-experience/beauty-sdk/\(form\|score\|match\|reference\|orchestrator\|studio\)" apps packages --include=*.ts --include=*.tsx | grep -v node_modules | grep -v /dist/ | grep -v /.next/
grep -rn "@gateway-experience/shared" packages/beauty-sdk/src
```

Expected: both print nothing.

- [ ] **Step 8: Install, build, test**

```bash
npm install
npm run build -w @gateway-experience/beauty-sdk
npm run build -w @gateway-experience/studio
npm test -w @gateway-experience/beauty-sdk
npm test -w @gateway-experience/studio
cd apps/web && npx tsc --noEmit -p . && npx vitest run && cd ../..
```

Expected: builds succeed; `scope.test.ts`, `capability-registry.test.ts`, `match-client.test.ts`, `pytorch-client.test.ts` pass under studio; web typecheck clean; web tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A packages/studio packages/beauty-sdk apps/web/app apps/web/features/orchestrator apps/web/features/api-client apps/web/lib/hooks/use-core-collection.ts apps/web/package.json package.json
git commit -m "refactor: move the admin studio and orchestrator to @gateway-experience/studio

beauty-sdk becomes brand-facing only and no longer depends on
@gateway-experience/shared. The dashboard imports the studio from its
own private package; behaviour is unchanged."
```

---

## Phase 1 — Foundation

### Task 2: `BeautyApiError` and error parsing

**Files:**
- Create: `packages/beauty-sdk/src/client/errors.ts`
- Test: `packages/beauty-sdk/src/client/errors.test.ts`

**Interfaces:**
- Produces:
  - `class BeautyApiError extends Error { readonly status: number; readonly code: string; readonly details: Record<string, unknown>[] }`
  - `parseApiError(res: Response): Promise<BeautyApiError>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { BeautyApiError, parseApiError } from './errors';

const res = (status: number, body: string) => new Response(body, { status });

describe('parseApiError', () => {
  it('reads core detail objects (face architecture style)', async () => {
    const e = await parseApiError(res(422, JSON.stringify({ detail: { code: 'wrong_side', view: 'left' } })));
    expect(e).toBeInstanceOf(BeautyApiError);
    expect(e.status).toBe(422);
    expect(e.code).toBe('wrong_side');
    expect(e.details).toEqual([{ code: 'wrong_side', view: 'left' }]);
  });

  it('keeps every entry of a detail list (multi-gate rejection)', async () => {
    const e = await parseApiError(res(422, JSON.stringify({ detail: [{ code: 'roll', reason: 'tilted' }, { code: 'yaw' }] })));
    expect(e.code).toBe('roll');
    expect(e.message).toBe('tilted');
    expect(e.details).toHaveLength(2);
  });

  it('reads top-level code/error bodies (colour engine style)', async () => {
    const e = await parseApiError(res(400, JSON.stringify({ code: 'no_face', error: 'Wajah tidak terdeteksi' })));
    expect(e.code).toBe('no_face');
    expect(e.message).toBe('Wajah tidak terdeteksi');
  });

  it('keeps a non-JSON body as the message and claims no code', async () => {
    const e = await parseApiError(res(502, 'Bad Gateway'));
    expect(e.code).toBe('');
    expect(e.message).toBe('Bad Gateway');
    expect(e.details).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/client/errors.test.ts` (in `packages/beauty-sdk`)
Expected: FAIL — `Cannot find module './errors'`.

- [ ] **Step 3: Implement**

```ts
/** Every failed SDK call, whatever the engine. Nothing is invented: a body
 *  that is not JSON stays the message, and no code is claimed for it. */
export class BeautyApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>[];

  constructor(init: { status: number; code: string; message: string; details: Record<string, unknown>[] }) {
    super(init.message || init.code || `HTTP ${init.status}`);
    this.name = 'BeautyApiError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
  }
}

const isEntry = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Core answers errors in two shapes: `{ detail: {...} | [...] }` (vision,
 * face architecture, head) and `{ code, error | message }` (colour). Both
 * become one BeautyApiError; every detail entry is kept.
 */
export async function parseApiError(res: Response): Promise<BeautyApiError> {
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new BeautyApiError({ status: res.status, code: '', message: text, details: [] });
  }
  const b = isEntry(body) ? body : {};
  const detail = b.detail;
  const details = Array.isArray(detail) ? detail.filter(isEntry) : isEntry(detail) ? [detail] : [];
  const first = details[0] ?? {};
  return new BeautyApiError({
    status: res.status,
    code: str(first.code) || str(b.code),
    message: str(first.reason) || str(first.message) || str(b.error) || str(b.message),
    details,
  });
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run src/client/errors.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/beauty-sdk/src/client/errors.ts packages/beauty-sdk/src/client/errors.test.ts
git commit -m "feat(beauty-sdk): BeautyApiError for every engine's error shape"
```

### Task 3: The operations table and gateway request building

**Files:**
- Create: `packages/beauty-sdk/src/client/operations.ts`
- Test: `packages/beauty-sdk/src/client/operations.test.ts`

**Interfaces:**
- Produces:
  - `type OperationId = 'colour.analyze' | 'colour.tryOn' | 'colour.catalog' | 'face.analyze' | 'face.head' | 'skin.analyze' | 'reference.brands' | 'reference.products' | 'forms.evaluate' | 'assessments.history'`
  - `type ScopePlacement = 'none' | 'path' | 'json' | 'multipart'`
  - `interface Operation { id: OperationId; method: 'GET' | 'POST'; sdkPath: string; gatewayPath: string; scope: ScopePlacement; customer: boolean }`
  - `const OPERATIONS: readonly Operation[]`
  - `matchOperation(method: string, path: string): { op: Operation; params: Record<string, string> } | null`
  - `sdkUrl(op: Operation, params: Record<string, string>): string`
  - `interface Scope { brandId: string; applicationId: string; customerId?: string }`
  - `gatewayUrl(op: Operation, params: Record<string, string>, scope: Scope): string`
  - `injectScope(op: Operation, body: FormData | Record<string, unknown> | undefined, scope: Scope): FormData | Record<string, unknown> | undefined`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { OPERATIONS, gatewayUrl, injectScope, matchOperation, sdkUrl } from './operations';

const scope = { brandId: 'brd-1', applicationId: 'app/1', customerId: 'cus 7' };
const op = (id: string) => OPERATIONS.find((o) => o.id === id)!;

describe('operations', () => {
  it('matches only allowlisted method + path pairs', () => {
    expect(matchOperation('POST', '/colour/analyze')?.op.id).toBe('colour.analyze');
    expect(matchOperation('GET', '/colour/analyze')).toBeNull();
    expect(matchOperation('GET', '/core/anything')).toBeNull();
  });

  it('extracts client path params', () => {
    expect(matchOperation('POST', '/forms/skin%20quiz/evaluate')?.params).toEqual({ code: 'skin quiz' });
  });

  it('builds the SDK url with encoded params', () => {
    expect(sdkUrl(op('forms.evaluate'), { code: 'skin quiz' })).toBe('/forms/skin%20quiz/evaluate');
  });

  it('writes brand and application into the gateway path, encoded', () => {
    expect(gatewayUrl(op('face.head'), {}, scope)).toBe('/core/vision-engine/face-architecture/brd-1/app%2F1/head');
  });

  it('writes the customer from the scope, never from the request', () => {
    expect(gatewayUrl(op('assessments.history'), { customerId: 'someone-else' }, scope)).toBe('/core/assessments/customers/cus%207');
  });

  it('injects scope into JSON bodies as brand_id / application_id', () => {
    expect(injectScope(op('forms.evaluate'), { answers: {}, brand_id: 'spoofed' }, scope)).toEqual({
      answers: {},
      brand_id: 'brd-1',
      application_id: 'app/1',
    });
  });

  it('injects scope into multipart bodies as brandId / applicationId', () => {
    const fd = new FormData();
    fd.set('brandId', 'spoofed');
    const out = injectScope(op('skin.analyze'), fd, scope) as FormData;
    expect(out.get('brandId')).toBe('brd-1');
    expect(out.get('applicationId')).toBe('app/1');
  });

  it('leaves bodies alone for operations without body scope', () => {
    const fd = new FormData();
    expect(injectScope(op('colour.analyze'), fd, scope)).toBe(fd);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/client/operations.test.ts`
Expected: FAIL — `Cannot find module './operations'`.

- [ ] **Step 3: Implement**

```ts
// The one list of what the SDK may call. The browser client builds SDK
// urls from it; the proxy matches incoming requests against it and builds
// the gateway request from it; the server-side direct client does the same.
// Gateway paths are the data-plane paths the dashboard uses today
// (apps/web/lib/proxy-handler.ts): core modules under /core/<module>/...,
// reference-service under /reference/....

export type OperationId =
  | 'colour.analyze'
  | 'colour.tryOn'
  | 'colour.catalog'
  | 'face.analyze'
  | 'face.head'
  | 'skin.analyze'
  | 'reference.brands'
  | 'reference.products'
  | 'forms.evaluate'
  | 'assessments.history';

/** Where brand and application go: the gateway path, a JSON body
 *  (brand_id / application_id), a multipart body (brandId / applicationId),
 *  or nowhere. */
export type ScopePlacement = 'none' | 'path' | 'json' | 'multipart';

export interface Operation {
  id: OperationId;
  method: 'GET' | 'POST';
  /** Path under the SDK base url; `:name` segments come from the caller. */
  sdkPath: string;
  /** Gateway path; `{brandId}`, `{applicationId}`, `{customerId}` come from the
   *  scope, `:name` from the caller. */
  gatewayPath: string;
  scope: ScopePlacement;
  /** Needs a signed-in customer (authorize must return a customerId). */
  customer: boolean;
}

export const OPERATIONS: readonly Operation[] = [
  { id: 'colour.analyze', method: 'POST', sdkPath: '/colour/analyze', gatewayPath: '/core/colour-engine/analyze', scope: 'none', customer: false },
  { id: 'colour.tryOn', method: 'POST', sdkPath: '/colour/tryon', gatewayPath: '/core/colour-engine/tryon', scope: 'none', customer: false },
  { id: 'colour.catalog', method: 'GET', sdkPath: '/colour/catalog', gatewayPath: '/core/colour-engine/catalog', scope: 'none', customer: false },
  { id: 'face.analyze', method: 'POST', sdkPath: '/face/analyze', gatewayPath: '/core/vision-engine/face-architecture/{brandId}/{applicationId}', scope: 'path', customer: false },
  { id: 'face.head', method: 'POST', sdkPath: '/face/head', gatewayPath: '/core/vision-engine/face-architecture/{brandId}/{applicationId}/head', scope: 'path', customer: false },
  { id: 'skin.analyze', method: 'POST', sdkPath: '/skin/analyze', gatewayPath: '/core/vision-engine/analyze-image', scope: 'multipart', customer: false },
  { id: 'reference.brands', method: 'GET', sdkPath: '/reference/brands', gatewayPath: '/reference/brands', scope: 'none', customer: false },
  { id: 'reference.products', method: 'GET', sdkPath: '/reference/products', gatewayPath: '/reference/products', scope: 'none', customer: false },
  { id: 'forms.evaluate', method: 'POST', sdkPath: '/forms/:code/evaluate', gatewayPath: '/core/form-engine/survey/:code/evaluate', scope: 'json', customer: false },
  { id: 'assessments.history', method: 'GET', sdkPath: '/assessments/history', gatewayPath: '/core/assessments/customers/{customerId}', scope: 'none', customer: true },
];

export interface Scope {
  brandId: string;
  applicationId: string;
  customerId?: string;
}

const split = (p: string) => p.split('/').filter(Boolean);

export function matchOperation(method: string, path: string): { op: Operation; params: Record<string, string> } | null {
  const segs = split(path);
  for (const op of OPERATIONS) {
    if (op.method !== method.toUpperCase()) continue;
    const pat = split(op.sdkPath);
    if (pat.length !== segs.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < pat.length && ok; i++) {
      if (pat[i].startsWith(':')) params[pat[i].slice(1)] = decodeURIComponent(segs[i]);
      else ok = pat[i] === segs[i];
    }
    if (ok) return { op, params };
  }
  return null;
}

const fillParams = (path: string, params: Record<string, string>) =>
  path.replace(/:([A-Za-z]+)/g, (_, k: string) => {
    if (!(k in params)) throw new Error(`Missing path parameter "${k}"`);
    return encodeURIComponent(params[k]);
  });

export function sdkUrl(op: Operation, params: Record<string, string>): string {
  return fillParams(op.sdkPath, params);
}

export function gatewayUrl(op: Operation, params: Record<string, string>, scope: Scope): string {
  const withScope = op.gatewayPath.replace(/\{(brandId|applicationId|customerId)\}/g, (_, k: keyof Scope) => {
    const v = scope[k];
    if (!v) throw new Error(`Missing scope "${k}" for ${op.id}`);
    return encodeURIComponent(v);
  });
  return fillParams(withScope, params);
}

export function injectScope(
  op: Operation,
  body: FormData | Record<string, unknown> | undefined,
  scope: Scope,
): FormData | Record<string, unknown> | undefined {
  if (op.scope === 'json') return { ...(body as Record<string, unknown>), brand_id: scope.brandId, application_id: scope.applicationId };
  if (op.scope === 'multipart' && body instanceof FormData) {
    body.set('brandId', scope.brandId);
    body.set('applicationId', scope.applicationId);
  }
  return body;
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run src/client/operations.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/beauty-sdk/src/client/operations.ts packages/beauty-sdk/src/client/operations.test.ts
git commit -m "feat(beauty-sdk): one operations table for client and proxy"
```

### Task 4: `createBeautyClient` — browser (via proxy) and server (direct)

**Files:**
- Create: `packages/beauty-sdk/src/client/transport.ts`, `packages/beauty-sdk/src/client/reference.ts`, `packages/beauty-sdk/src/client/index.ts`
- Test: `packages/beauty-sdk/src/client/transport.test.ts`

**Interfaces:**
- Consumes: `OPERATIONS`, `sdkUrl`, `gatewayUrl`, `injectScope`, `Scope` (Task 3); `parseApiError`, `BeautyApiError` (Task 2).
- Produces:
  - `interface BeautyClientOptions { baseUrl: string; apiKey?: string; brandId?: string; applicationId?: string; customerId?: string; fetch?: typeof fetch }`
  - `interface CallInit { params?: Record<string, string>; query?: Record<string, string>; body?: FormData | Record<string, unknown>; signal?: AbortSignal }`
  - `interface BeautyClient { call(id: OperationId, init?: CallInit): Promise<Response>; json<T>(id: OperationId, init?: CallInit): Promise<T>; binary(id: OperationId, init?: CallInit): Promise<ArrayBuffer>; reference: { brands(signal?: AbortSignal): Promise<ReferenceBrand[]>; products(signal?: AbortSignal): Promise<ReferenceProduct[]> } }`
  - `createBeautyClient(opts: BeautyClientOptions): BeautyClient`
  - `interface ReferenceBrand { id: string; code: string; name: string }`, `interface ReferenceProduct { id: string; brandId: string | null; categoryId: string | null; name: string; imageUrl: string; isActive: boolean }`
  - `/client` entry re-exporting all of the above plus `OPERATIONS`, `OperationId`, `BeautyApiError`, `parseApiError`.

- [ ] **Step 1: Write the failing test**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BeautyApiError } from './errors';
import { createBeautyClient } from './transport';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('createBeautyClient', () => {
  it('in the browser, calls the SDK path under the proxy base url without scope or key', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ data: [] }));
    const c = createBeautyClient({ baseUrl: '/api/beauty', fetch });
    await c.call('forms.evaluate', { params: { code: 'quiz' }, body: { answers: {} } });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/beauty/forms/quiz/evaluate');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ answers: {} });
    expect(new Headers(init.headers).get('x-api-key')).toBeNull();
  });

  it('server-side with a key, calls the gateway path with scope and key', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({}));
    const c = createBeautyClient({ baseUrl: 'https://gw.test', apiKey: 'k', brandId: 'b', applicationId: 'a', fetch });
    await c.call('face.head', { body: new FormData() });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://gw.test/core/vision-engine/face-architecture/b/a/head');
    expect(new Headers(init.headers).get('x-api-key')).toBe('k');
  });

  it('refuses an api key in a browser', () => {
    vi.stubGlobal('window', {});
    expect(() => createBeautyClient({ baseUrl: 'https://gw.test', apiKey: 'k', brandId: 'b', applicationId: 'a' })).toThrow(/server/);
  });

  it('appends the query string', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ data: [] }));
    await createBeautyClient({ baseUrl: '/api/beauty', fetch }).call('reference.products', { query: { brandId: 'x' } });
    expect(fetch.mock.calls[0][0]).toBe('/api/beauty/reference/products?brandId=x');
  });

  it('throws BeautyApiError for a failed response', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: { code: 'no_face' } }), { status: 422 }));
    await expect(createBeautyClient({ baseUrl: '/api/beauty', fetch }).json('face.analyze', { body: new FormData() })).rejects.toMatchObject({
      name: 'BeautyApiError',
      code: 'no_face',
      status: 422,
    } satisfies Partial<BeautyApiError>);
  });

  it('returns binary bodies as ArrayBuffer', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    const buf = await createBeautyClient({ baseUrl: '/api/beauty', fetch }).binary('face.head', { body: new FormData() });
    expect(new Uint8Array(buf)).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('unwraps reference lists', async () => {
    const fetch = vi.fn().mockResolvedValue(ok({ success: true, data: [{ id: 'b1', code: 'MO', name: 'Make Over' }] }));
    expect(await createBeautyClient({ baseUrl: '/api/beauty', fetch }).reference.brands()).toEqual([{ id: 'b1', code: 'MO', name: 'Make Over' }]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/client/transport.test.ts`
Expected: FAIL — `Cannot find module './transport'`.

- [ ] **Step 3: Implement `transport.ts`**

```ts
import { parseApiError } from './errors';
import { OPERATIONS, gatewayUrl, injectScope, sdkUrl, type OperationId, type Scope } from './operations';
import { referenceMethods, type ReferenceMethods } from './reference';

export interface BeautyClientOptions {
  /** Browser: the proxy route (e.g. "/api/beauty"). Server: the gateway url. */
  baseUrl: string;
  /** Server only. With a key the client talks to the gateway directly. */
  apiKey?: string;
  brandId?: string;
  applicationId?: string;
  customerId?: string;
  fetch?: typeof fetch;
}

export interface CallInit {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: FormData | Record<string, unknown>;
  signal?: AbortSignal;
}

export interface BeautyClient {
  call(id: OperationId, init?: CallInit): Promise<Response>;
  json<T>(id: OperationId, init?: CallInit): Promise<T>;
  binary(id: OperationId, init?: CallInit): Promise<ArrayBuffer>;
  reference: ReferenceMethods;
}

export function createBeautyClient(opts: BeautyClientOptions): BeautyClient {
  const direct = !!opts.apiKey;
  if (direct && typeof window !== 'undefined') {
    throw new Error('createBeautyClient: an apiKey may only be used on the server. In the browser, pass the proxy route as baseUrl.');
  }
  const base = opts.baseUrl.replace(/\/+$/, '');
  const doFetch = opts.fetch ?? fetch;
  const scope: Scope = { brandId: opts.brandId ?? '', applicationId: opts.applicationId ?? '', customerId: opts.customerId };

  const call = async (id: OperationId, init: CallInit = {}): Promise<Response> => {
    const op = OPERATIONS.find((o) => o.id === id);
    if (!op) throw new Error(`Unknown operation ${id}`);
    const params = init.params ?? {};
    const path = direct ? gatewayUrl(op, params, scope) : sdkUrl(op, params);
    const qs = init.query && Object.keys(init.query).length ? `?${new URLSearchParams(init.query)}` : '';
    const body = direct ? injectScope(op, init.body, scope) : init.body;
    const headers = new Headers();
    if (direct) headers.set('x-api-key', opts.apiKey!);
    let payload: BodyInit | undefined;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers.set('content-type', 'application/json');
      payload = JSON.stringify(body);
    }
    return doFetch(`${base}${path}${qs}`, { method: op.method, headers, body: payload, signal: init.signal });
  };

  const checked = async (id: OperationId, init?: CallInit) => {
    const res = await call(id, init);
    if (!res.ok) throw await parseApiError(res);
    return res;
  };

  const client: BeautyClient = {
    call,
    json: async <T>(id: OperationId, init?: CallInit) => (await (await checked(id, init)).json()) as T,
    binary: async (id: OperationId, init?: CallInit) => (await checked(id, init)).arrayBuffer(),
    reference: undefined as unknown as ReferenceMethods,
  };
  client.reference = referenceMethods(client);
  return client;
}
```

- [ ] **Step 4: Implement `reference.ts`**

```ts
import type { BeautyClient } from './transport';

export interface ReferenceBrand {
  id: string;
  code: string;
  name: string;
}

export interface ReferenceProduct {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export interface ReferenceMethods {
  brands(signal?: AbortSignal): Promise<ReferenceBrand[]>;
  products(signal?: AbortSignal): Promise<ReferenceProduct[]>;
}

// reference-service wraps lists as { success, data }.
export function referenceMethods(client: Pick<BeautyClient, 'json'>): ReferenceMethods {
  return {
    brands: async (signal) => (await client.json<{ data?: ReferenceBrand[] }>('reference.brands', { signal })).data ?? [],
    products: async (signal) => (await client.json<{ data?: ReferenceProduct[] }>('reference.products', { signal })).data ?? [],
  };
}
```

- [ ] **Step 5: Create the `/client` entry `src/client/index.ts`**

```ts
export { createBeautyClient } from './transport';
export type { BeautyClient, BeautyClientOptions, CallInit } from './transport';
export { BeautyApiError, parseApiError } from './errors';
export { OPERATIONS } from './operations';
export type { Operation, OperationId, ScopePlacement } from './operations';
export type { ReferenceBrand, ReferenceProduct } from './reference';
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/client`
Expected: PASS (all client tests).

- [ ] **Step 7: Commit**

```bash
git add packages/beauty-sdk/src/client
git commit -m "feat(beauty-sdk): createBeautyClient for the proxy and for server components"
```

### Task 5: `createBeautyProxy` for Next.js route handlers

**Files:**
- Create: `packages/beauty-sdk/src/server/timeouts.ts`, `packages/beauty-sdk/src/server/proxy.ts`, `packages/beauty-sdk/src/server/index.ts`
- Test: `packages/beauty-sdk/src/server/proxy.test.ts`

**Interfaces:**
- Consumes: `matchOperation`, `gatewayUrl`, `injectScope`, `OperationId` (Task 3).
- Produces:
  - `const OPERATION_TIMEOUT_MS: Record<OperationId, number>`, `const DEFAULT_PROXY_TIMEOUT_MS: number`
  - `interface BeautyProxyOptions { gatewayUrl: string; apiKey: string; brandId: string; applicationId: string; authorize?: (req: Request) => Promise<{ customerId?: string } | Response> | { customerId?: string } | Response; timeouts?: Partial<Record<OperationId, number>>; fetch?: typeof fetch }`
  - `type RouteHandler = (req: Request, ctx: { params: Promise<{ path?: string[] }> }) => Promise<Response>`
  - `createBeautyProxy(opts: BeautyProxyOptions): { GET: RouteHandler; POST: RouteHandler }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest';
import { createBeautyProxy } from './proxy';

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const base = { gatewayUrl: 'https://gw.test', apiKey: 'secret', brandId: 'brd', applicationId: 'app' };

describe('createBeautyProxy', () => {
  it('answers 404 for anything outside the allowlist, without calling the gateway', async () => {
    const fetch = vi.fn();
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/core/admin'), ctx('core', 'admin'));
    expect(res.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('writes scope into the gateway path and adds the key server-side', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Uint8Array([7]), { headers: { 'content-type': 'model/gltf-binary' } }));
    const { POST } = createBeautyProxy({ ...base, fetch });
    const fd = new FormData();
    fd.set('front', new Blob([new Uint8Array([1])], { type: 'image/jpeg' }), 'f.jpg');
    const res = await POST(new Request('https://brand.test/api/beauty/face/head', { method: 'POST', body: fd }), ctx('face', 'head'));
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://gw.test/core/vision-engine/face-architecture/brd/app/head');
    expect(new Headers(init.headers).get('x-api-key')).toBe('secret');
    expect(res.headers.get('content-type')).toBe('model/gltf-binary');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([7]));
  });

  it('overwrites brand/application in JSON bodies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    const { POST } = createBeautyProxy({ ...base, fetch });
    await POST(
      new Request('https://brand.test/api/beauty/forms/quiz/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ answers: { a: 1 }, brand_id: 'spoofed' }),
      }),
      ctx('forms', 'quiz', 'evaluate'),
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ answers: { a: 1 }, brand_id: 'brd', application_id: 'app' });
  });

  it('overwrites brand/application in multipart bodies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'));
    const { POST } = createBeautyProxy({ ...base, fetch });
    const fd = new FormData();
    fd.set('brandId', 'spoofed');
    await POST(new Request('https://brand.test/api/beauty/skin/analyze', { method: 'POST', body: fd }), ctx('skin', 'analyze'));
    const sent = fetch.mock.calls[0][1].body as FormData;
    expect(sent.get('brandId')).toBe('brd');
    expect(sent.get('applicationId')).toBe('app');
  });

  it('refuses customer routes without authorize', async () => {
    const fetch = vi.fn();
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/assessments/history'), ctx('assessments', 'history'));
    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the customer from authorize', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('[]'));
    const { GET } = createBeautyProxy({ ...base, fetch, authorize: () => ({ customerId: 'cus-1' }) });
    await GET(new Request('https://brand.test/api/beauty/assessments/history'), ctx('assessments', 'history'));
    expect(fetch.mock.calls[0][0]).toBe('https://gw.test/core/assessments/customers/cus-1');
  });

  it('returns the Response authorize gives to refuse', async () => {
    const fetch = vi.fn();
    const { POST } = createBeautyProxy({ ...base, fetch, authorize: () => new Response('no', { status: 403 }) });
    const res = await POST(new Request('https://brand.test/api/beauty/colour/analyze', { method: 'POST', body: new FormData() }), ctx('colour', 'analyze'));
    expect(res.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('passes upstream status and error bodies through and never echoes the key', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: { code: 'no_face' } }), { status: 422, headers: { 'content-type': 'application/json', 'set-cookie': 'x=1' } }),
    );
    const { POST } = createBeautyProxy({ ...base, fetch });
    const res = await POST(new Request('https://brand.test/api/beauty/face/analyze', { method: 'POST', body: new FormData() }), ctx('face', 'analyze'));
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ detail: { code: 'no_face' } });
    expect(res.headers.get('set-cookie')).toBeNull();
    expect([...res.headers.values()].join(' ')).not.toContain('secret');
  });

  it('answers 504 with a timeout code when the gateway is too slow', async () => {
    const fetch = vi.fn((_: string, init: RequestInit) => new Promise<Response>((_r, reject) => {
      init.signal!.addEventListener('abort', () => reject(new DOMException('timeout', 'TimeoutError')));
    }));
    const { GET } = createBeautyProxy({ ...base, fetch, timeouts: { 'colour.catalog': 10 } });
    const res = await GET(new Request('https://brand.test/api/beauty/colour/catalog'), ctx('colour', 'catalog'));
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ detail: { code: 'timeout' } });
  });

  it('answers 502 when the gateway is unreachable', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const { GET } = createBeautyProxy({ ...base, fetch });
    const res = await GET(new Request('https://brand.test/api/beauty/colour/catalog'), ctx('colour', 'catalog'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ detail: { code: 'gateway_unreachable' } });
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/server/proxy.test.ts`
Expected: FAIL — `Cannot find module './proxy'`.

- [ ] **Step 3: Implement `timeouts.ts`**

```ts
import type { OperationId } from '../client/operations';

// Each default is the core-engine timeout for the work behind the operation
// (Seagull-core apps/core-engine/internal/config/config.go) plus a margin, so
// core's own error body arrives instead of being cut off by the proxy.
const MARGIN_MS = 5_000;
const CORE_FACE_MEASURE_MS = 20_000; // DefaultFaceMeasureTimeout
const CORE_FACE_HEAD_MS = 30_000; // DefaultFaceHeadTimeout
const CORE_COLOUR_WORKER_MS = 60_000; // DefaultColourWorkerTimeout
const CORE_VISION_DAG_MS = 30_000; // DefaultVisionDAGTimeout

/** For operations with no core-engine timeout to derive from (reference
 *  reads, survey evaluate, assessment history). A proxy-side choice,
 *  overridable per operation. */
export const DEFAULT_PROXY_TIMEOUT_MS = 15_000;

export const OPERATION_TIMEOUT_MS: Record<OperationId, number> = {
  'colour.analyze': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'colour.tryOn': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'colour.catalog': CORE_COLOUR_WORKER_MS + MARGIN_MS,
  'face.analyze': CORE_FACE_MEASURE_MS + MARGIN_MS,
  'face.head': CORE_FACE_HEAD_MS + MARGIN_MS,
  'skin.analyze': CORE_VISION_DAG_MS + MARGIN_MS,
  'reference.brands': DEFAULT_PROXY_TIMEOUT_MS,
  'reference.products': DEFAULT_PROXY_TIMEOUT_MS,
  'forms.evaluate': DEFAULT_PROXY_TIMEOUT_MS,
  'assessments.history': DEFAULT_PROXY_TIMEOUT_MS,
};
```

- [ ] **Step 4: Implement `proxy.ts`**

```ts
import { gatewayUrl, injectScope, matchOperation, type OperationId } from '../client/operations';
import { OPERATION_TIMEOUT_MS } from './timeouts';

export interface BeautyProxyOptions {
  gatewayUrl: string;
  apiKey: string;
  brandId: string;
  applicationId: string;
  /** Return { customerId } from the brand's session, or a Response to refuse.
   *  Without it, customer routes answer 401. */
  authorize?: (req: Request) => Promise<{ customerId?: string } | Response> | { customerId?: string } | Response;
  timeouts?: Partial<Record<OperationId, number>>;
  fetch?: typeof fetch;
}

export type RouteHandler = (req: Request, ctx: { params: Promise<{ path?: string[] }> }) => Promise<Response>;

const problem = (status: number, code: string) =>
  new Response(JSON.stringify({ detail: { code } }), { status, headers: { 'content-type': 'application/json' } });

// Only these response headers reach the browser; nothing from the gateway
// that could carry cookies or credentials.
const PASS_HEADERS = ['content-type', 'content-length', 'content-disposition', 'cache-control'];

/**
 * The brand's server-side door to the gateway, for
 * app/api/beauty/[...path]/route.ts:
 *   export const { GET, POST } = createBeautyProxy({ ... });
 * Forwards only the SDK's operations, writes brand/application (and the
 * signed-in customer) itself, adds the API key, and streams bodies through.
 */
export function createBeautyProxy(opts: BeautyProxyOptions): { GET: RouteHandler; POST: RouteHandler } {
  const base = opts.gatewayUrl.replace(/\/+$/, '');
  const doFetch = opts.fetch ?? fetch;

  const handle: RouteHandler = async (req, ctx) => {
    const segments = (await ctx.params).path ?? [];
    const match = matchOperation(req.method, `/${segments.join('/')}`);
    if (!match) return problem(404, 'not_found');
    const { op, params } = match;

    let customerId: string | undefined;
    if (opts.authorize) {
      const auth = await opts.authorize(req);
      if (auth instanceof Response) return auth;
      customerId = auth.customerId;
    }
    if (op.customer && !customerId) return problem(401, 'customer_required');

    const scope = { brandId: opts.brandId, applicationId: opts.applicationId, customerId };
    const search = new URL(req.url).search;
    const url = `${base}${gatewayUrl(op, params, scope)}${search}`;

    const headers = new Headers({ 'x-api-key': opts.apiKey });
    const accept = req.headers.get('accept');
    if (accept) headers.set('accept', accept);

    let body: BodyInit | undefined;
    if (op.method === 'POST') {
      if (op.scope === 'json') {
        headers.set('content-type', 'application/json');
        body = JSON.stringify(injectScope(op, (await req.json()) as Record<string, unknown>, scope));
      } else if (op.scope === 'multipart') {
        body = injectScope(op, await req.formData(), scope) as FormData;
      } else {
        const type = req.headers.get('content-type');
        if (type) headers.set('content-type', type);
        body = await req.arrayBuffer();
      }
    }

    const timeout = opts.timeouts?.[op.id] ?? OPERATION_TIMEOUT_MS[op.id];
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(timeout)]);
    let upstream: Response;
    try {
      upstream = await doFetch(url, { method: op.method, headers, body, signal });
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError') && !req.signal.aborted) return problem(504, 'timeout');
      return problem(502, 'gateway_unreachable');
    }

    const out = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  };

  return { GET: handle, POST: handle };
}
```

- [ ] **Step 5: Create the `/server` entry `src/server/index.ts`**

```ts
export { createBeautyProxy } from './proxy';
export type { BeautyProxyOptions, RouteHandler } from './proxy';
export { OPERATION_TIMEOUT_MS, DEFAULT_PROXY_TIMEOUT_MS } from './timeouts';
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/server`
Expected: PASS (10 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/beauty-sdk/src/server
git commit -m "feat(beauty-sdk): createBeautyProxy for Next.js route handlers"
```

### Task 6: Messages, `BeautyProvider` and `useBeauty`

**Files:**
- Create: `packages/beauty-sdk/src/react/messages.ts`, `packages/beauty-sdk/src/react/BeautyProvider.tsx`
- Modify: `packages/beauty-sdk/package.json` (devDependencies), `packages/beauty-sdk/vitest.config.ts`
- Test: `packages/beauty-sdk/src/react/BeautyProvider.test.tsx`

**Interfaces:**
- Consumes: `createBeautyClient`, `BeautyClient` (Task 4).
- Produces:
  - `type Locale = 'id' | 'en'`; `type Messages = Record<string, string>`; `const defaultMessages: Record<Locale, Messages>`
  - `format(template: string, vars?: Record<string, string | number>): string`
  - `interface BeautyProviderProps { baseUrl?: string; client?: BeautyClient; locale?: Locale; messages?: Messages; children: React.ReactNode }`
  - `BeautyProvider(props): JSX.Element`
  - `useBeauty(): { client: BeautyClient; locale: Locale; t: (key: string, vars?: Record<string, string | number>) => string }`

- [ ] **Step 1: Add React test tooling**

In `packages/beauty-sdk/package.json` devDependencies add:

```json
"@testing-library/react": "^16.1.0",
"@types/react": "^19",
"@types/react-dom": "^19",
"jsdom": "^25.0.1",
"react": "19.2.4",
"react-dom": "19.2.4"
```

`packages/beauty-sdk/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    environmentMatchGlobs: [['src/{react,photo}/**', 'jsdom']],
  },
});
```

Run: `npm install` (repo root).

- [ ] **Step 2: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BeautyProvider, useBeauty } from './BeautyProvider';
import { format } from './messages';

function Probe({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const { t, client } = useBeauty();
  return <span data-testid="out" data-has-client={String(!!client)}>{t(k, vars)}</span>;
}

describe('BeautyProvider', () => {
  it('serves the locale dictionary', () => {
    render(<BeautyProvider baseUrl="/api/beauty" locale="en"><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('Front');
  });

  it('lets the brand override a key', () => {
    render(<BeautyProvider baseUrl="/api/beauty" messages={{ 'photo.front': 'Wajahmu' }}><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('Wajahmu');
  });

  it('shows an unknown key as itself, so a missing text is visible', () => {
    render(<BeautyProvider baseUrl="/api/beauty"><Probe k="nope.missing" /></BeautyProvider>);
    expect(screen.getByTestId('out').textContent).toBe('nope.missing');
  });

  it('provides a client', () => {
    render(<BeautyProvider baseUrl="/api/beauty"><Probe k="photo.front" /></BeautyProvider>);
    expect(screen.getByTestId('out').dataset.hasClient).toBe('true');
  });

  it('throws a clear error outside the provider', () => {
    expect(() => render(<Probe k="photo.front" />)).toThrow(/BeautyProvider/);
  });
});

describe('format', () => {
  it('fills {name} placeholders and leaves unknown ones', () => {
    expect(format('Hi {name}, {x}', { name: 'Ana' })).toBe('Hi Ana, {x}');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/react/BeautyProvider.test.tsx`
Expected: FAIL — `Cannot find module './BeautyProvider'`.

- [ ] **Step 4: Implement `messages.ts`**

```ts
export type Locale = 'id' | 'en';
export type Messages = Record<string, string>;

// Copy shipped with the SDK. Phases 2–5 add their experience's keys here
// (and engine error codes as errors.<engine>.<code>). Brands override any key
// through <BeautyProvider messages>.
export const defaultMessages: Record<Locale, Messages> = {
  id: {
    'photo.front': 'Depan',
    'photo.left': 'Kiri ¾',
    'photo.right': 'Kanan ¾',
    'photo.left.hint': 'Menoleh ke kirimu',
    'photo.right.hint': 'Menoleh ke kananmu',
    'photo.add': 'Tambah foto {view}',
    'photo.change': 'Ganti foto {view}',
    'photo.remove': 'Hapus foto {view}',
    'photo.optional': 'opsional',
    'photo.sides.title': 'Foto samping (opsional)',
    'photo.sides.why': 'untuk kepala 3D yang lebih akurat',
    'photo.sides.guide': 'Wajah menoleh sebagian (tiga perempat), bukan profil penuh; cahaya dan jarak sama dengan foto depan.',
  },
  en: {
    'photo.front': 'Front',
    'photo.left': 'Left ¾',
    'photo.right': 'Right ¾',
    'photo.left.hint': 'Turn to your left',
    'photo.right.hint': 'Turn to your right',
    'photo.add': 'Add {view} photo',
    'photo.change': 'Replace {view} photo',
    'photo.remove': 'Remove {view} photo',
    'photo.optional': 'optional',
    'photo.sides.title': 'Side photos (optional)',
    'photo.sides.why': 'for a more accurate 3D head',
    'photo.sides.guide': 'Face turned part-way (three-quarter), not full profile; same light and distance as the front photo.',
  },
};

export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
}
```

- [ ] **Step 5: Implement `BeautyProvider.tsx`**

```tsx
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { createBeautyClient, type BeautyClient } from '../client/transport';
import { defaultMessages, format, type Locale, type Messages } from './messages';

interface BeautyContext {
  client: BeautyClient;
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<BeautyContext | null>(null);

export interface BeautyProviderProps {
  /** The brand's proxy route, e.g. "/api/beauty". Ignored when `client` is given. */
  baseUrl?: string;
  client?: BeautyClient;
  locale?: Locale;
  /** Overrides for any message key. */
  messages?: Messages;
  children: React.ReactNode;
}

export function BeautyProvider({ baseUrl = '/api/beauty', client, locale = 'id', messages, children }: BeautyProviderProps) {
  const value = useMemo<BeautyContext>(() => {
    const dict = { ...defaultMessages[locale], ...messages };
    return {
      client: client ?? createBeautyClient({ baseUrl }),
      locale,
      t: (key, vars) => format(dict[key] ?? key, vars),
    };
  }, [baseUrl, client, locale, messages]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBeauty(): BeautyContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBeauty must be used inside <BeautyProvider>.');
  return ctx;
}
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/react/BeautyProvider.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/beauty-sdk/src/react packages/beauty-sdk/package.json packages/beauty-sdk/vitest.config.ts
git commit -m "feat(beauty-sdk): BeautyProvider with an overridable message dictionary"
```

### Task 7: `useOperation` — the shared hook shape

**Files:**
- Create: `packages/beauty-sdk/src/react/useOperation.ts`
- Test: `packages/beauty-sdk/src/react/useOperation.test.tsx`

**Interfaces:**
- Produces:
  - `type OperationStatus = 'idle' | 'loading' | 'success' | 'error'`
  - `interface OperationState<T> { status: OperationStatus; data: T | null; error: unknown; run: () => Promise<void>; reset: () => void }`
  - `useOperation<T>(fn: (signal: AbortSignal) => Promise<T>, inputKey: string): OperationState<T>` — results belong to the `inputKey` they were run for; a different current key reads as idle.

- [ ] **Step 1: Write the failing test**

```tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useOperation } from './useOperation';

describe('useOperation', () => {
  it('goes idle → loading → success', async () => {
    const { result } = renderHook(() => useOperation(async () => 42, 'k1'));
    expect(result.current.status).toBe('idle');
    await act(() => result.current.run());
    expect(result.current).toMatchObject({ status: 'success', data: 42, error: null });
  });

  it('reports an error', async () => {
    const boom = new Error('boom');
    const { result } = renderHook(() => useOperation(async () => { throw boom; }, 'k1'));
    await act(() => result.current.run());
    expect(result.current).toMatchObject({ status: 'error', data: null, error: boom });
  });

  it('hides a result once the input changes', async () => {
    const { result, rerender } = renderHook(({ k }) => useOperation(async () => k, k), { initialProps: { k: 'a' } });
    await act(() => result.current.run());
    expect(result.current.data).toBe('a');
    rerender({ k: 'b' });
    expect(result.current).toMatchObject({ status: 'idle', data: null });
  });

  it('aborts the previous run and never reports the abort', async () => {
    const signals: AbortSignal[] = [];
    const fn = vi.fn((signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<number>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        if (signals.length === 2) resolve(2);
      });
    });
    const { result } = renderHook(() => useOperation(fn, 'k'));
    act(() => { void result.current.run(); });
    await act(() => result.current.run());
    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 2 }));
  });

  it('aborts on unmount', () => {
    let seen: AbortSignal | undefined;
    const { result, unmount } = renderHook(() => useOperation((s) => { seen = s; return new Promise<never>(() => {}); }, 'k'));
    act(() => { void result.current.run(); });
    unmount();
    expect(seen?.aborted).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/react/useOperation.test.tsx`
Expected: FAIL — `Cannot find module './useOperation'`.

- [ ] **Step 3: Implement**

```ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OperationState<T> {
  status: OperationStatus;
  data: T | null;
  error: unknown;
  run: () => Promise<void>;
  reset: () => void;
}

interface Stored<T> {
  key: string | null;
  status: OperationStatus;
  data: T | null;
  error: unknown;
}

const IDLE = { key: null, status: 'idle', data: null, error: null } as const;

/**
 * One call's lifecycle, the shape every SDK hook returns. A result belongs to
 * the input it was run for (`inputKey`, e.g. the photos' identity): once the
 * input changes it reads as idle. A new run aborts the previous one; aborts
 * from supersession or unmount are not errors.
 */
export function useOperation<T>(fn: (signal: AbortSignal) => Promise<T>, inputKey: string): OperationState<T> {
  const [state, setState] = useState<Stored<T>>(IDLE);
  const inflight = useRef<AbortController | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => inflight.current?.abort(), []);

  const run = useCallback(async () => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setState({ key: inputKey, status: 'loading', data: null, error: null });
    try {
      const data = await fnRef.current(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: 'success', data, error: null });
    } catch (error) {
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: 'error', data: null, error });
    } finally {
      if (inflight.current === ctrl) inflight.current = null;
    }
  }, [inputKey]);

  const reset = useCallback(() => {
    inflight.current?.abort();
    setState(IDLE);
  }, []);

  const current = state.key === inputKey ? state : IDLE;
  return { status: current.status, data: current.data, error: current.error, run, reset };
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/react/useOperation.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/beauty-sdk/src/react/useOperation.ts packages/beauty-sdk/src/react/useOperation.test.tsx
git commit -m "feat(beauty-sdk): useOperation, the state shape every hook shares"
```

### Task 8: `usePhotoSet` and the `/react` entry

**Files:**
- Create: `packages/beauty-sdk/src/react/usePhotoSet.ts`, `packages/beauty-sdk/src/react/index.ts`
- Test: `packages/beauty-sdk/src/react/usePhotoSet.test.tsx`

**Interfaces:**
- Produces:
  - `type PhotoView = 'front' | 'left' | 'right'`; `type Photos = Partial<Record<PhotoView, File>>`
  - `interface PhotoSetState { photos: Photos; set(view: PhotoView, file: File | null): void; clear(): void; key: string }`
  - `usePhotoSet(initial?: Photos): PhotoSetState`
  - `photosKey(photos: Photos): string`
  - `/react` entry re-exporting `BeautyProvider`, `useBeauty`, `BeautyProviderProps`, `defaultMessages`, `format`, `Locale`, `Messages`, `useOperation`, `OperationState`, `OperationStatus`, `usePhotoSet`, `photosKey`, `PhotoView`, `Photos`, `PhotoSetState`.

- [ ] **Step 1: Write the failing test**

```tsx
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { photosKey, usePhotoSet } from './usePhotoSet';

const file = (name: string, size = 3) => new File([new Uint8Array(size)], name, { type: 'image/jpeg', lastModified: 1 });

describe('usePhotoSet', () => {
  it('sets and removes views', () => {
    const { result } = renderHook(() => usePhotoSet());
    act(() => result.current.set('front', file('f.jpg')));
    act(() => result.current.set('left', file('l.jpg')));
    expect(Object.keys(result.current.photos).sort()).toEqual(['front', 'left']);
    act(() => result.current.set('left', null));
    expect(Object.keys(result.current.photos)).toEqual(['front']);
  });

  it('changes key when a photo changes, and only then', () => {
    const { result } = renderHook(() => usePhotoSet({ front: file('f.jpg') }));
    const k1 = result.current.key;
    act(() => result.current.set('front', file('f.jpg')));
    expect(result.current.key).toBe(k1);
    act(() => result.current.set('front', file('g.jpg')));
    expect(result.current.key).not.toBe(k1);
  });

  it('clears everything', () => {
    const { result } = renderHook(() => usePhotoSet({ front: file('f.jpg') }));
    act(() => result.current.clear());
    expect(result.current.photos).toEqual({});
  });
});

describe('photosKey', () => {
  it('tells views apart', () => {
    expect(photosKey({ front: file('a.jpg') })).not.toBe(photosKey({ left: file('a.jpg') }));
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/react/usePhotoSet.test.tsx`
Expected: FAIL — `Cannot find module './usePhotoSet'`.

- [ ] **Step 3: Implement `usePhotoSet.ts`**

```ts
'use client';

import { useCallback, useMemo, useState } from 'react';

export type PhotoView = 'front' | 'left' | 'right';
export type Photos = Partial<Record<PhotoView, File>>;

export interface PhotoSetState {
  photos: Photos;
  set(view: PhotoView, file: File | null): void;
  clear(): void;
  /** Identity of the set, for tying results to it (useOperation's inputKey). */
  key: string;
}

const VIEWS: PhotoView[] = ['front', 'left', 'right'];

// Files have no identity beyond the object; name, size and mtime tell a
// replaced photo from the same one.
export function photosKey(photos: Photos): string {
  return VIEWS.map((v) => {
    const f = photos[v];
    return f ? `${v}:${f.name}:${f.size}:${f.lastModified}` : `${v}:-`;
  }).join('|');
}

/** The photos one analysis runs on: a front photo and optional left/right
 *  three-quarter views. Kept in memory only. */
export function usePhotoSet(initial: Photos = {}): PhotoSetState {
  const [photos, setPhotos] = useState<Photos>(initial);
  const set = useCallback((view: PhotoView, file: File | null) => {
    setPhotos((p) => {
      const next = { ...p };
      if (file) next[view] = file;
      else delete next[view];
      return next;
    });
  }, []);
  const clear = useCallback(() => setPhotos({}), []);
  const key = useMemo(() => photosKey(photos), [photos]);
  return { photos, set, clear, key };
}
```

- [ ] **Step 4: Create the `/react` entry `src/react/index.ts`**

```ts
'use client';

export { BeautyProvider, useBeauty } from './BeautyProvider';
export type { BeautyProviderProps } from './BeautyProvider';
export { defaultMessages, format } from './messages';
export type { Locale, Messages } from './messages';
export { useOperation } from './useOperation';
export type { OperationState, OperationStatus } from './useOperation';
export { usePhotoSet, photosKey } from './usePhotoSet';
export type { PhotoView, Photos, PhotoSetState } from './usePhotoSet';
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/react`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/beauty-sdk/src/react
git commit -m "feat(beauty-sdk): usePhotoSet and the /react entry"
```

### Task 9: Stylesheet pipeline (Tailwind v4, prefix `bsdk`, `@layer bsdk`)

**Files:**
- Create: `packages/beauty-sdk/src/styles/index.css`
- Modify: `packages/beauty-sdk/package.json` (devDependency, scripts)
- Test: `packages/beauty-sdk/scripts/css.test.ts`

**Interfaces:**
- Produces: `npm run build:css` writing `dist/styles.css`; theme variables `--bsdk-primary`, `--bsdk-primary-foreground`, `--bsdk-foreground`, `--bsdk-muted`, `--bsdk-muted-foreground`, `--bsdk-border`, `--bsdk-card`, `--bsdk-destructive`, `--bsdk-warning`, `--bsdk-success`, `--bsdk-radius`, `--bsdk-font`; utility names usable in components as `bsdk:bg-primary`, `bsdk:text-muted-foreground`, `bsdk:border-border`, `bsdk:rounded-bsdk`, etc.

- [ ] **Step 1: Add the CLI and scripts**

`packages/beauty-sdk/package.json`:

```json
"scripts": {
  "build": "tsup && npm run build:css",
  "build:css": "tailwindcss -i src/styles/index.css -o dist/styles.css --minify",
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
},
```

devDependencies add `"@tailwindcss/cli": "^4"`, `"tailwindcss": "^4"`. Run `npm install` at the repo root.

- [ ] **Step 2: Write the failing test `scripts/css.test.ts`**

```ts
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
let css = '';

beforeAll(() => {
  execSync('npm run build:css', { cwd: root, stdio: 'pipe' });
  css = readFileSync(path.join(root, 'dist/styles.css'), 'utf8');
}, 60_000);

describe('dist/styles.css', () => {
  it('puts every rule inside the bsdk layer', () => {
    expect(css).toMatch(/@layer bsdk/);
  });

  it('emits prefixed utilities used by components', () => {
    expect(css).toContain('.bsdk\\:bg-primary');
  });

  it('reads colours from the brand-overridable variables', () => {
    expect(css).toContain('var(--bsdk-primary)');
    expect(css).toMatch(/--bsdk-primary:/);
  });

  it('ships no global reset', () => {
    expect(css).not.toMatch(/(^|[},])\s*html\s*[,{]/);
    expect(css).not.toMatch(/\*,\s*:after,\s*:before|\*,::after,::before/);
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run scripts/css.test.ts`
Expected: FAIL — the build cannot find `src/styles/index.css`.

- [ ] **Step 4: Write `src/styles/index.css`**

```css
/* The SDK's stylesheet. Brands import it before their own CSS:
 *   import '@gateway-experience/beauty-sdk/styles.css';
 * Everything sits in the bsdk layer, declared first, so any brand CSS —
 * layered later or unlayered — wins without !important. No preflight. */
@layer bsdk.base, bsdk.theme, bsdk.utilities;

@import 'tailwindcss/theme.css' layer(bsdk.theme) prefix(bsdk);
@import 'tailwindcss/utilities.css' layer(bsdk.utilities);

@source '../';

/* Defaults for the brand-overridable tokens (a styling starting point, not
 * data). Brands set any of these on :root or on a container. */
@layer bsdk.base {
  :where(:root) {
    --bsdk-primary: #0f172a;
    --bsdk-primary-foreground: #ffffff;
    --bsdk-foreground: #0f172a;
    --bsdk-muted: #f1f5f9;
    --bsdk-muted-foreground: #64748b;
    --bsdk-border: #e2e8f0;
    --bsdk-card: #ffffff;
    --bsdk-destructive: #dc2626;
    --bsdk-warning: #d97706;
    --bsdk-success: #059669;
    --bsdk-radius: 0.75rem;
    --bsdk-font: ui-sans-serif, system-ui, sans-serif;
  }
}

@theme inline {
  --color-primary: var(--bsdk-primary);
  --color-primary-foreground: var(--bsdk-primary-foreground);
  --color-foreground: var(--bsdk-foreground);
  --color-muted: var(--bsdk-muted);
  --color-muted-foreground: var(--bsdk-muted-foreground);
  --color-border: var(--bsdk-border);
  --color-card: var(--bsdk-card);
  --color-destructive: var(--bsdk-destructive);
  --color-warning: var(--bsdk-warning);
  --color-success: var(--bsdk-success);
  --radius-bsdk: var(--bsdk-radius);
  --font-bsdk: var(--bsdk-font);
}
```

- [ ] **Step 5: Run the test**

The `bsdk:bg-primary` utility only appears once a component uses it; Task 10's `PhotoSet` uses it. Until then, run:

Run: `npx vitest run scripts/css.test.ts -t "layer|variables|reset"`
Expected: PASS (3 tests). If `@import ... prefix(bsdk)` on `theme.css` is rejected by the installed Tailwind version, move the prefix to a single `@import 'tailwindcss' prefix(bsdk) layer(bsdk.utilities);` line, keep the `bsdk.base` block, and confirm the reset test still passes (Tailwind's preflight lives in the `base` layer import, which this file does not import).

- [ ] **Step 6: Commit**

```bash
git add packages/beauty-sdk/src/styles packages/beauty-sdk/scripts/css.test.ts packages/beauty-sdk/package.json
git commit -m "build(beauty-sdk): compile one prefixed stylesheet inside @layer bsdk"
```

### Task 10: `PhotoSet` component and the `/photo` entry

**Files:**
- Create: `packages/beauty-sdk/src/photo/cn.ts`, `packages/beauty-sdk/src/photo/PhotoSet.tsx`, `packages/beauty-sdk/src/photo/index.ts`
- Modify: `packages/beauty-sdk/package.json` (dependencies `clsx`, `tailwind-merge`)
- Test: `packages/beauty-sdk/src/photo/PhotoSet.test.tsx`

**Interfaces:**
- Consumes: `useBeauty` (Task 6), `PhotoView`, `Photos` (Task 8).
- Produces:
  - `cn(...inputs: ClassValue[]): string` (merges `bsdk:`-prefixed classes; brand classes are kept)
  - `type PhotoSetPart = 'root' | 'header' | 'grid' | 'slot' | 'image' | 'badge' | 'remove' | 'hint'`
  - `interface PhotoSetProps { photos: Photos; onChange(view: PhotoView, file: File | null): void; views?: PhotoView[]; disabled?: boolean; className?: string; classNames?: Partial<Record<PhotoSetPart, string>>; renderSlot?: (slot: { view: PhotoView; file?: File }, Default: React.ReactNode) => React.ReactNode }`
  - `PhotoSet(props): JSX.Element`

- [ ] **Step 1: Add dependencies**

`packages/beauty-sdk/package.json` dependencies add `"clsx": "^2.1.1"`, `"tailwind-merge": "^3.6.0"`. Run `npm install`.

- [ ] **Step 2: Write the failing test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BeautyProvider } from '../react/BeautyProvider';
import { PhotoSet } from './PhotoSet';

const file = new File([new Uint8Array(3)], 'l.jpg', { type: 'image/jpeg' });
const wrap = (ui: React.ReactNode) => render(<BeautyProvider baseUrl="/x" locale="en">{ui}</BeautyProvider>);

describe('PhotoSet', () => {
  it('renders one slot per view with stable parts', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left', 'right']} />);
    expect(container.querySelectorAll('[data-bsdk-part="slot"]')).toHaveLength(2);
    expect(container.querySelector('[data-bsdk-part="root"]')).not.toBeNull();
  });

  it('applies brand classNames per part on top of its own', () => {
    const { container } = wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} className="brand-root" classNames={{ slot: 'brand-slot' }} />);
    expect(container.querySelector('[data-bsdk-part="root"]')!.className).toContain('brand-root');
    expect(container.querySelector('[data-bsdk-part="slot"]')!.className).toMatch(/brand-slot/);
    expect(container.querySelector('[data-bsdk-part="slot"]')!.className).toMatch(/bsdk:/);
  });

  it('reports a chosen file for its view', () => {
    const onChange = vi.fn();
    const { container } = wrap(<PhotoSet photos={{}} onChange={onChange} views={['left']} />);
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith('left', file);
  });

  it('removes a photo', () => {
    const onChange = vi.fn();
    wrap(<PhotoSet photos={{ left: file }} onChange={onChange} views={['left']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Left ¾ photo' }));
    expect(onChange).toHaveBeenCalledWith('left', null);
  });

  it('lets the brand replace a slot and keep the default', () => {
    wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} renderSlot={(s, Default) => <div data-testid="custom">{s.view}{Default}</div>} />);
    expect(screen.getByTestId('custom').textContent).toContain('left');
  });

  it('uses the message dictionary', () => {
    wrap(<PhotoSet photos={{}} onChange={() => {}} views={['left']} />);
    expect(screen.getByText('Turn to your left')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/photo/PhotoSet.test.tsx`
Expected: FAIL — `Cannot find module './PhotoSet'`.

- [ ] **Step 4: Implement `cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The SDK's own classes carry the bsdk prefix; brand classes do not, so the
// two never cancel each other and the brand's always apply.
const twMerge = extendTailwindMerge({ prefix: 'bsdk' });

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Implement `PhotoSet.tsx`**

Ported from the dashboard's `apps/web/features/colour/studio/SideShots.tsx` (same behaviour: preview, remove, phone camera via `capture`), with the side hints matching the face worker's view gate (Seagull-core `worker_face/head/views.py`: a "left" view is the subject turned toward their own left).

```tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useBeauty } from '../react/BeautyProvider';
import type { PhotoView, Photos } from '../react/usePhotoSet';
import { cn } from './cn';

export type PhotoSetPart = 'root' | 'header' | 'grid' | 'slot' | 'image' | 'badge' | 'remove' | 'hint';

export interface PhotoSetProps {
  photos: Photos;
  onChange(view: PhotoView, file: File | null): void;
  /** Which slots to show; by default the two optional side views. */
  views?: PhotoView[];
  disabled?: boolean;
  className?: string;
  classNames?: Partial<Record<PhotoSetPart, string>>;
  renderSlot?: (slot: { view: PhotoView; file?: File }, Default: React.ReactNode) => React.ReactNode;
}

const LABEL_KEY: Record<PhotoView, string> = { front: 'photo.front', left: 'photo.left', right: 'photo.right' };

export function PhotoSet({ photos, onChange, views = ['left', 'right'], disabled, className, classNames = {}, renderSlot }: PhotoSetProps) {
  const { t } = useBeauty();
  const sides = views.some((v) => v !== 'front');
  return (
    <div data-bsdk-part="root" className={cn('bsdk:space-y-1.5 bsdk:font-bsdk', className)}>
      {sides && (
        <div data-bsdk-part="header" className={cn('bsdk:flex bsdk:items-baseline bsdk:justify-between bsdk:gap-2', classNames.header)}>
          <span className="bsdk:text-[10px] bsdk:font-bold bsdk:uppercase bsdk:tracking-wider bsdk:text-muted-foreground">{t('photo.sides.title')}</span>
          <span className="bsdk:text-[11px] bsdk:text-muted-foreground">{t('photo.sides.why')}</span>
        </div>
      )}
      <div data-bsdk-part="grid" className={cn('bsdk:grid bsdk:grid-cols-2 bsdk:gap-2', classNames.grid)}>
        {views.map((view) => {
          const slot = <Slot key={view} view={view} file={photos[view]} onChange={(f) => onChange(view, f)} disabled={disabled} classNames={classNames} />;
          return renderSlot ? <React.Fragment key={view}>{renderSlot({ view, file: photos[view] }, slot)}</React.Fragment> : slot;
        })}
      </div>
      {sides && <p data-bsdk-part="hint" className={cn('bsdk:text-[11px] bsdk:text-muted-foreground', classNames.hint)}>{t('photo.sides.guide')}</p>}
    </div>
  );
}

function Slot({
  view,
  file,
  onChange,
  disabled,
  classNames,
}: {
  view: PhotoView;
  file?: File;
  onChange: (f: File | null) => void;
  disabled?: boolean;
  classNames: Partial<Record<PhotoSetPart, string>>;
}) {
  const { t } = useBeauty();
  const input = useRef<HTMLInputElement>(null);
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  const label = t(LABEL_KEY[view]);

  return (
    <div className="bsdk:relative">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png"
        capture="user"
        className="bsdk:hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        data-bsdk-part="slot"
        disabled={disabled}
        onClick={() => input.current?.click()}
        aria-label={t(file ? 'photo.change' : 'photo.add', { view: label })}
        className={cn(
          'bsdk:flex bsdk:aspect-[3/4] bsdk:w-full bsdk:flex-col bsdk:items-center bsdk:justify-center bsdk:gap-1 bsdk:overflow-hidden bsdk:rounded-bsdk bsdk:border bsdk:border-border bsdk:bg-card bsdk:text-center',
          !file && 'bsdk:border-dashed bsdk:bg-muted',
          disabled && 'bsdk:opacity-50',
          classNames.slot,
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img data-bsdk-part="image" src={url} alt={label} className={cn('bsdk:h-full bsdk:w-full bsdk:object-cover', classNames.image)} />
        ) : (
          <>
            <span className="bsdk:text-xs bsdk:font-semibold bsdk:text-foreground">{label}</span>
            {view !== 'front' && <span className="bsdk:text-[11px] bsdk:text-muted-foreground">{t(`photo.${view}.hint`)}</span>}
            <span className="bsdk:text-[11px] bsdk:text-muted-foreground">{t('photo.optional')}</span>
          </>
        )}
      </button>
      {file && (
        <>
          <span data-bsdk-part="badge" className={cn('bsdk:pointer-events-none bsdk:absolute bsdk:left-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-primary bsdk:text-primary-foreground bsdk:px-2 bsdk:py-0.5 bsdk:text-[10px] bsdk:font-bold', classNames.badge)}>
            {label}
          </span>
          <button
            type="button"
            data-bsdk-part="remove"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label={t('photo.remove', { view: label })}
            className={cn('bsdk:absolute bsdk:right-1.5 bsdk:top-1.5 bsdk:rounded-full bsdk:bg-card bsdk:px-2 bsdk:text-xs bsdk:text-foreground', classNames.remove)}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
```

The filled slot's badge uses `bsdk:bg-primary`, which is also the real use Task 9's stylesheet test checks for. Camera capture with quality checks joins `/photo` in phase 2, with the colour studio that uses it.

- [ ] **Step 6: Create the `/photo` entry `src/photo/index.ts`**

```ts
'use client';

export { PhotoSet } from './PhotoSet';
export type { PhotoSetProps, PhotoSetPart } from './PhotoSet';
export { cn } from './cn';
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/photo scripts/css.test.ts`
Expected: PASS (6 component tests, 4 CSS tests).

- [ ] **Step 8: Commit**

```bash
git add packages/beauty-sdk/src/photo packages/beauty-sdk/package.json
git commit -m "feat(beauty-sdk): PhotoSet component and the /photo entry"
```

### Task 11: Entry points, `"use client"` banners and bundle boundaries

**Files:**
- Modify: `packages/beauty-sdk/tsup.config.ts`, `packages/beauty-sdk/package.json`
- Test: `packages/beauty-sdk/scripts/check-entries.test.ts`

**Interfaces:**
- Produces: built entries `dist/client/index.mjs`, `dist/server/index.mjs`, `dist/react/index.mjs`, `dist/photo/index.mjs` (+ `.d.ts`), `dist/styles.css`; legacy entries `.`, `./core`, `./hooks`, `./ui`, `./vision`, `./types` kept unchanged.

- [ ] **Step 1: Write the failing test**

```ts
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(path.join(root, 'dist', p), 'utf8');

beforeAll(() => {
  execSync('npm run build', { cwd: root, stdio: 'pipe' });
}, 180_000);

describe('entry boundaries', () => {
  it.each(['client/index.mjs', 'server/index.mjs'])('%s imports no React or Next', (f) => {
    expect(read(f)).not.toMatch(/from\s*["'](react|react-dom|next)(\/[^"']*)?["']/);
  });

  it.each(['react/index.mjs', 'photo/index.mjs'])('%s starts with "use client"', (f) => {
    expect(read(f).trimStart().startsWith('"use client"')).toBe(true);
  });

  it.each(['client/index.mjs', 'server/index.mjs'])('%s is not a client module', (f) => {
    expect(read(f).trimStart().startsWith('"use client"')).toBe(false);
  });

  it('ships the stylesheet', () => {
    expect(read('styles.css').length).toBeGreaterThan(0);
  });

  it('pulls in no three.js anywhere yet', () => {
    for (const f of ['client/index.mjs', 'server/index.mjs', 'react/index.mjs', 'photo/index.mjs']) expect(read(f)).not.toMatch(/["']three["']/);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run scripts/check-entries.test.ts`
Expected: FAIL — `dist/server/index.mjs` does not exist.

- [ ] **Step 3: Replace `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

const shared = {
  format: ['esm', 'cjs'] as ('esm' | 'cjs')[],
  dts: true,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  external: ['react', 'react-dom', 'next', 'three'],
};

export default defineConfig([
  {
    // React-free: importable from Server Components and route handlers.
    ...shared,
    clean: true,
    entry: { 'client/index': 'src/client/index.ts', 'server/index': 'src/server/index.ts' },
  },
  {
    // Client modules: hooks and components.
    ...shared,
    clean: false,
    entry: { 'react/index': 'src/react/index.ts', 'photo/index': 'src/photo/index.ts' },
    banner: { js: '"use client";' },
  },
  {
    // Legacy entries, replaced experience by experience in phases 2–5.
    ...shared,
    clean: false,
    entry: {
      index: 'src/index.ts',
      'core/index': 'src/core/index.ts',
      'hooks/index': 'src/hooks/index.ts',
      'ui/index': 'src/ui/index.ts',
      'vision/index': 'src/ui/index.ts',
      'types/index': 'src/core/types.ts',
    },
  },
]);
```

- [ ] **Step 4: Update `package.json`**

Remove `"private": true` and the old `./client` export (it pointed at the legacy `src/core/client.ts`; no workspace imports it). Set:

```json
"files": ["dist", "README.md", "CHANGELOG.md"],
"sideEffects": ["**/*.css"],
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
  "./client": { "types": "./dist/client/index.d.ts", "import": "./dist/client/index.mjs", "require": "./dist/client/index.js" },
  "./server": { "types": "./dist/server/index.d.ts", "import": "./dist/server/index.mjs", "require": "./dist/server/index.js" },
  "./react": { "types": "./dist/react/index.d.ts", "import": "./dist/react/index.mjs", "require": "./dist/react/index.js" },
  "./photo": { "types": "./dist/photo/index.d.ts", "import": "./dist/photo/index.mjs", "require": "./dist/photo/index.js" },
  "./styles.css": "./dist/styles.css",
  "./core": { "types": "./dist/core/index.d.ts", "import": "./dist/core/index.mjs", "require": "./dist/core/index.js" },
  "./hooks": { "types": "./dist/hooks/index.d.ts", "import": "./dist/hooks/index.mjs", "require": "./dist/hooks/index.js" },
  "./ui": { "types": "./dist/ui/index.d.ts", "import": "./dist/ui/index.mjs", "require": "./dist/ui/index.js" },
  "./vision": { "types": "./dist/vision/index.d.ts", "import": "./dist/vision/index.mjs", "require": "./dist/vision/index.js" },
  "./types": { "types": "./dist/types/index.d.ts", "import": "./dist/types/index.mjs", "require": "./dist/types/index.js" }
},
"peerDependencies": {
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "three": ">=0.180.0"
},
"peerDependenciesMeta": { "three": { "optional": true }, "next": { "optional": true } },
```

- [ ] **Step 5: Run the whole SDK test suite**

Run: `npm test -w @gateway-experience/beauty-sdk`
Expected: PASS, including `check-entries.test.ts` and `css.test.ts` (the `bsdk:bg-primary` test now passes because `PhotoSet` uses it).

- [ ] **Step 6: Make sure the dashboard still builds against the SDK**

Run: `cd apps/web && npx tsc --noEmit -p . && cd ../..`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/beauty-sdk/tsup.config.ts packages/beauty-sdk/package.json packages/beauty-sdk/scripts/check-entries.test.ts
git commit -m "build(beauty-sdk): client/server/react/photo entries with enforced boundaries"
```

### Task 12: `examples/next-brand` — the package outside the monorepo

**Files:**
- Create: `examples/next-brand/package.json`, `examples/next-brand/next.config.ts`, `examples/next-brand/tsconfig.json`, `examples/next-brand/.env.example`, `examples/next-brand/scripts/install-sdk.mjs`, `examples/next-brand/app/layout.tsx`, `examples/next-brand/app/globals.css`, `examples/next-brand/app/page.tsx`, `examples/next-brand/app/Demo.tsx`, `examples/next-brand/app/brands/page.tsx`, `examples/next-brand/app/api/beauty/[...path]/route.ts`, `examples/next-brand/README.md`
- Modify: root `.gitignore` (add `examples/next-brand/.sdk/`, `examples/next-brand/.next/`, `examples/next-brand/node_modules/`)

**Interfaces:**
- Consumes: `/server` `createBeautyProxy`; `/client` `createBeautyClient`; `/react` `BeautyProvider`, `usePhotoSet`; `/photo` `PhotoSet`; `/styles.css`.

- [ ] **Step 1: `package.json` (not a workspace member; installs the packed SDK)**

```json
{
  "name": "next-brand-example",
  "private": true,
  "scripts": {
    "sdk": "node scripts/install-sdk.mjs",
    "dev": "next dev --port 3100",
    "build": "next build",
    "verify": "npm run sdk && next build"
  },
  "dependencies": {
    "next": "16.2.12",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

Port `3100`: before using it, check `docs/PORTS.md`; if 3100 is taken, pick a free one, record it there, and update this script.

- [ ] **Step 2: `scripts/install-sdk.mjs`**

```js
// Builds the SDK, packs it like a release, and installs the tarball here —
// so this app sees exactly what a brand installs, not the workspace source.
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const here = path.resolve(import.meta.dirname, '..');
const sdk = path.resolve(here, '../../packages/beauty-sdk');
const out = path.join(here, '.sdk');
mkdirSync(out, { recursive: true });

execSync('npm run build', { cwd: sdk, stdio: 'inherit' });
const [{ filename }] = JSON.parse(execSync(`npm pack --json --pack-destination "${out}"`, { cwd: sdk }).toString());
execSync(`npm install --no-save "${path.join(out, filename)}"`, { cwd: here, stdio: 'inherit' });
console.log(`installed ${filename}`);
```

- [ ] **Step 3: Config files**

`next.config.ts`:

```ts
import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // This app has its own lockfile; keep Turbopack from adopting the monorepo root.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default config;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "isolatedModules": true,
    "skipLibCheck": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

`.env.example`:

```
BEAUTY_GATEWAY_URL=
BEAUTY_API_KEY=
BEAUTY_BRAND_ID=
BEAUTY_APP_ID=
```

- [ ] **Step 4: The proxy route `app/api/beauty/[...path]/route.ts`**

```ts
import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';

const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set (see .env.example)`);
  return v;
};

export const { GET, POST } = createBeautyProxy({
  gatewayUrl: env('BEAUTY_GATEWAY_URL'),
  apiKey: env('BEAUTY_API_KEY'),
  brandId: env('BEAUTY_BRAND_ID'),
  applicationId: env('BEAUTY_APP_ID'),
});
```

Because `env()` throws at import, `next build` needs the variables; the `verify` run sets dummy values (Step 7).

- [ ] **Step 5: Layout, styles and the client demo**

`app/layout.tsx`:

```tsx
import '@gateway-experience/beauty-sdk/styles.css';
import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
```

`app/globals.css` (a brand theming through the SDK's variables, no Tailwind):

```css
:root {
  --bsdk-primary: #b0306a;
  --bsdk-radius: 1rem;
  --bsdk-font: Georgia, serif;
}
body {
  margin: 0;
  padding: 24px;
}
[data-bsdk-part='slot'] {
  border-color: #b0306a;
}
```

`app/Demo.tsx`:

```tsx
'use client';

import { BeautyProvider, usePhotoSet } from '@gateway-experience/beauty-sdk/react';
import { PhotoSet } from '@gateway-experience/beauty-sdk/photo';

function Photos() {
  const set = usePhotoSet();
  return <PhotoSet photos={set.photos} onChange={set.set} views={['front', 'left', 'right']} classNames={{ grid: 'demo-grid' }} />;
}

export function Demo() {
  return (
    <BeautyProvider baseUrl="/api/beauty" locale="en" messages={{ 'photo.front': 'Your face' }}>
      <Photos />
    </BeautyProvider>
  );
}
```

`app/page.tsx`:

```tsx
import { Demo } from './Demo';

export default function Page() {
  return (
    <main>
      <h1>Brand example</h1>
      <Demo />
    </main>
  );
}
```

- [ ] **Step 6: A Server Component using the React-free client `app/brands/page.tsx`**

```tsx
import { createBeautyClient } from '@gateway-experience/beauty-sdk/client';

// Rendered per request: the build never calls the gateway.
export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const client = createBeautyClient({
    baseUrl: process.env.BEAUTY_GATEWAY_URL!,
    apiKey: process.env.BEAUTY_API_KEY!,
    brandId: process.env.BEAUTY_BRAND_ID!,
    applicationId: process.env.BEAUTY_APP_ID!,
  });
  const brands = await client.reference.brands();
  return (
    <ul>
      {brands.map((b) => (
        <li key={b.id}>{b.name}</li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 7: Verify the package works outside the monorepo**

```bash
cd examples/next-brand
npm install
BEAUTY_GATEWAY_URL=https://gateway.invalid BEAUTY_API_KEY=x BEAUTY_BRAND_ID=x BEAUTY_APP_ID=x npm run verify
grep -rl '"three"\|three/examples' .next/static | head -1
```

Expected: `next build` succeeds (the Server Component and route handler import `/client` and `/server` without React errors); the `grep` prints nothing.

- [ ] **Step 8: Check it in a browser**

Start it against a reachable gateway (claim the `runtime` lane and the port per `docs/PORTS.md`), with `.env.local` filled from `.env.example`:

Run: `npm run dev`
Open `http://localhost:3100` and check: three slots render in the brand's magenta and serif font with no Tailwind installed; the front slot says "Your face"; choosing a file shows its preview and a remove button. Open `/brands` and check the brand list loads through the server-side client. Release the `runtime` lane afterwards.

- [ ] **Step 9: `README.md` for the example**

```md
# Next.js brand example

What a brand app looks like on `@gateway-experience/beauty-sdk`:

- `app/api/beauty/[...path]/route.ts` — the proxy; the API key stays on the server.
- `app/layout.tsx` — imports the SDK stylesheet before the app's own CSS.
- `app/globals.css` — theming through `--bsdk-*` variables and `[data-bsdk-part]`.
- `app/Demo.tsx` — provider, a hook and a component, with a message override.
- `app/brands/page.tsx` — a Server Component using the React-free client.

`npm run verify` builds and packs the SDK, installs the tarball and runs `next build`.
```

- [ ] **Step 10: Commit**

```bash
git add examples/next-brand .gitignore
git commit -m "test(beauty-sdk): a Next.js brand example that installs the packed SDK"
```

### Task 13: Release pipeline and brand README

**Files:**
- Create: `.changeset/config.json`, `.changeset/README.md`, `.gitlab-ci.yml`, `packages/beauty-sdk/README.md`, `packages/beauty-sdk/.npmrc.example`
- Modify: root `package.json` (devDependency `@changesets/cli`, scripts)

- [ ] **Step 1: Changesets**

Root `package.json` devDependencies add `"@changesets/cli": "^2.27.0"`; scripts add:

```json
"changeset": "changeset",
"version-packages": "changeset version"
```

`.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "ignore": ["@gateway-experience/studio", "@gateway-experience/shared", "web"]
}
```

`.changeset/README.md`:

```md
Add a changeset for every beauty-sdk change a brand would notice:
`npm run changeset`. `npm run version-packages` turns them into a version
bump and CHANGELOG entry; tag the release `beauty-sdk-v<version>`.
```

Check the web package's name in `apps/web/package.json` and use it in `ignore` if it is not `web`.

Run `npm install`.

- [ ] **Step 2: CI publish on tag `.gitlab-ci.yml`**

```yaml
# Publishes @gateway-experience/beauty-sdk to this project's GitLab npm
# registry when a tag beauty-sdk-v<version> is pushed. The registry url and
# token come from GitLab's own CI variables; nothing project-specific is in
# this file.
stages: [test, publish]

default:
  image: node:24

test-beauty-sdk:
  stage: test
  script:
    - npm install
    - npm test -w @gateway-experience/beauty-sdk
  rules:
    - if: '$CI_COMMIT_TAG =~ /^beauty-sdk-v/'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

publish-beauty-sdk:
  stage: publish
  rules:
    - if: '$CI_COMMIT_TAG =~ /^beauty-sdk-v/'
  script:
    - npm install
    - npm run build -w @gateway-experience/beauty-sdk
    - test "beauty-sdk-v$(node -p "require('./packages/beauty-sdk/package.json').version")" = "$CI_COMMIT_TAG"
    - echo "@gateway-experience:registry=${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/npm/" > packages/beauty-sdk/.npmrc
    # CI_API_V4_URL is https://<host>/api/v4; npm's auth key is the same url without the scheme.
    - echo "${CI_API_V4_URL#https:}/projects/${CI_PROJECT_ID}/packages/npm/:_authToken=${CI_JOB_TOKEN}" >> packages/beauty-sdk/.npmrc
    - cd packages/beauty-sdk && npm publish
```

- [ ] **Step 3: `packages/beauty-sdk/.npmrc.example` (for brands)**

```
# Copy to your app's .npmrc. Ask the platform team for the project id and a
# read-only deploy token; keep the token in an environment variable.
@gateway-experience:registry=https://gitlab.com/api/v4/projects/<PROJECT_ID>/packages/npm/
//gitlab.com/api/v4/projects/<PROJECT_ID>/packages/npm/:_authToken=${GITLAB_NPM_TOKEN}
```

- [ ] **Step 4: `packages/beauty-sdk/README.md`**

```md
# @gateway-experience/beauty-sdk

Beauty experiences for brand Next.js (App Router) apps: a typed client, a
server-side proxy that keeps the gateway API key off the browser, headless
hooks, and ready-made components you can theme, restyle or replace.

## Install

Copy `.npmrc.example` to your app's `.npmrc` (registry + read-only token), then:

    npm install @gateway-experience/beauty-sdk

## Set up (three files)

1. `app/api/beauty/[...path]/route.ts`

       import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';
       export const { GET, POST } = createBeautyProxy({
         gatewayUrl: process.env.BEAUTY_GATEWAY_URL!,
         apiKey: process.env.BEAUTY_API_KEY!,
         brandId: process.env.BEAUTY_BRAND_ID!,
         applicationId: process.env.BEAUTY_APP_ID!,
         // authorize: async (req) => ({ customerId: ... }) — needed for customer history
       });

2. `app/layout.tsx` — import the stylesheet before your own CSS:

       import '@gateway-experience/beauty-sdk/styles.css';

3. Wrap the client part of your page:

       'use client';
       import { BeautyProvider } from '@gateway-experience/beauty-sdk/react';
       <BeautyProvider baseUrl="/api/beauty" locale="id">…</BeautyProvider>

## Customise

1. Theme: set `--bsdk-primary`, `--bsdk-primary-foreground`, `--bsdk-foreground`,
   `--bsdk-muted`, `--bsdk-muted-foreground`, `--bsdk-border`, `--bsdk-card`,
   `--bsdk-destructive`, `--bsdk-warning`, `--bsdk-success`, `--bsdk-radius`,
   `--bsdk-font` on `:root` or a container.
2. Classes: `className` and `classNames={{ part: '…' }}`; every element has a
   stable `data-bsdk-part`.
3. Render props: replace a piece and keep the default (`renderSlot(slot, Default)`).
4. Headless: hooks from `/react`, pure helpers and the client from `/client`.
5. Copy: `<BeautyProvider messages={{ key: 'text' }}>`; Indonesian and English ship.

## Entry points

| Import | Use |
|---|---|
| `/client` | Typed client and helpers (Server Components too) |
| `/server` | `createBeautyProxy` |
| `/react` | Provider, messages, hooks |
| `/photo` | Photo components |
| `/styles.css` | The stylesheet |

The legacy root, `/core`, `/hooks`, `/ui`, `/vision` and `/types` entries remain
until the experience that replaces each one ships.
```

- [ ] **Step 5: Dry-run the publish locally**

Run: `cd packages/beauty-sdk && npm pack --dry-run && cd ../..`
Expected: the file list contains `dist/client/*`, `dist/server/*`, `dist/react/*`, `dist/photo/*`, `dist/styles.css`, `README.md`, and nothing from `src/` or `scripts/`.

- [ ] **Step 6: Add the first changeset**

Run: `npm run changeset` — choose `@gateway-experience/beauty-sdk`, `minor`, summary "Foundation: /client, /server proxy, /react provider and hooks, /photo PhotoSet, compiled stylesheet."

- [ ] **Step 7: Commit and release the lanes**

```bash
git add .changeset .gitlab-ci.yml package.json packages/beauty-sdk/README.md packages/beauty-sdk/.npmrc.example
git commit -m "build(beauty-sdk): changesets and tag-triggered GitLab publish"
```

Delete this plan's rows from `docs/LANES.md`. Do not push or tag; the user tags `beauty-sdk-v0.1.0` after phase 2, per the spec.

---

## Later phases (each gets its own plan when it starts)

- **Phase 2 — Colour & try-on (release 0.1):** move `apps/web/features/colour/{types.ts,AnalysisCard,ProductPicker,BeforeAfter,useTryOn,CameraCapture,capture/*,brands/*}` and the studio layout into `/colour` and `/photo`; typed `client.colour.*`; `useColourAnalysis`, `useColourCatalog`, `useTryOn`, `useBrandFilter`; `<ColourStudio>` and its parts; messages for colour copy and colour error codes.
- **Phase 3 — Face & 3D head (0.2):** move `features/colour/face/*` (types, measurementCopy, physicalScale, MeasurementOverlay, GuidanceOverlay, ResultRows) into `/face` and `/client` helpers, and `HeadViewer`, `headMarkers`, `useFaceHead` into `/head`; `three` stays inside `/head`.
- **Phase 4 — Skin (0.3):** move `features/vision/simulator/*` onto the current vision contract (`isVisible`, nullable `overallSkinHealthScore`, warnings render as "not measured"); replace the legacy `/ui`, `/vision` entries.
- **Phase 5 — Assessment (0.4):** survey, score, regimen, history (`authorize` required); replace the legacy `/hooks` entry.
- **Phase 6 — Dashboard on the SDK:** alongside phases 2–5, the dashboard imports each moved experience from the SDK and imports `styles.css`.
