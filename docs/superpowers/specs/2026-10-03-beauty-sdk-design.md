# Beauty SDK for brand frontends — design

Date: 2026-10-03
Status: approved in conversation, pending written-spec review
Requested by: Seagull-core (Core session) on the user's behalf; confirmed by the user.

## Goal

Brand frontends (Next.js, App Router) build their beauty experiences on
`@gateway-experience/beauty-sdk` instead of rebuilding the visuals: skin
analysis, face architecture, the 3D head, colour analysis with try-on, and
survey/score/regimen. They can use ready-made components, restyle them, replace
parts, or drop to headless hooks and build their own UI — without the gateway
API key ever reaching the browser.

Success means a brand can, in a fresh Next.js app with no Tailwind:

1. install the package from the GitLab registry,
2. add one route handler and one provider,
3. render `<ColourStudio />` (or any other experience) styled with their own
   colours, and
4. replace any single part of it without forking the SDK.

## Decisions taken

| Question | Decision |
|---|---|
| Scope | All five experiences, delivered in phases on one foundation. |
| Styling | Precompiled stylesheet + CSS variables; Tailwind is internal to the SDK, never required of the brand. |
| Package split | Brand SDK published on its own; admin studio and orchestrator move to a private package. |
| Server access | A route-handler factory, `createBeautyProxy()`. No server actions. |
| Copy | One overridable message dictionary, Indonesian and English shipped. |
| Release | GitLab Package Registry, semver, changesets, tag-triggered CI. |
| Component architecture | Approach 1: existing Tailwind components moved into the SDK with a `bsdk` prefix and compiled to one CSS file. The dashboard consumes the same components. |

## 1. Packages and entry points

Two packages replace today's one:

- **`@gateway-experience/beauty-sdk`** — published. Brand-facing only. No
  dependency on `@gateway-experience/shared`; the few utilities it needs
  (`cn`, persistence adapters) live in the SDK.
- **`@gateway-experience/studio`** — new, `private: true`, never published.
  Receives today's `src/studio/*` (form, score, match, reference) and
  `src/orchestrator/*`. Dashboard pages that import them today
  (`app/forms`, `app/matching`, `app/reference`, `app/scoring`,
  `app/api/orchestrator/pipeline`, `features/orchestrator/PipelineSimulatorView`,
  `features/api-client/ApiClientApp`, `lib/hooks/use-core-collection`) switch
  imports; behaviour does not change.

SDK entry points:

| Entry | Contents | Usable from a Server Component |
|---|---|---|
| `/client` | Typed client per engine, all response types, pure helpers | yes |
| `/server` | `createBeautyProxy()` | server only |
| `/react` | `BeautyProvider`, message dictionary, all headless hooks | client (`"use client"`) |
| `/photo` | Photo components shared by every experience (photo set with front and ¾ slots; camera capture with quality checks from phase 2) | client |
| `/colour` | Colour studio and try-on components | client |
| `/face` | Face architecture components (measurements, 2D overlay, panel) | client |
| `/skin` | Skin analysis components (visualizer, zones, dimensions, summary) | client |
| `/assessment` | Survey, score, regimen, history components | client |
| `/head` | 3D head viewer and its controls | client |
| `/styles.css` | The compiled stylesheet | — |

Rules:

- `three` is imported only under `/head` and is an optional
  `peerDependency`; an app that never imports `/head` never downloads it.
- `/client` and `/server` import nothing from React. A build test enforces it.
- `react`, `react-dom` and `next` are `peerDependencies`.
- ESM output with per-entry `.d.ts`.

The dashboard's own copies move into the SDK as each phase lands
(`apps/web/features/colour/*`, the face and head code under
`features/colour/face`, the vision simulator under `features/vision`), and the
dashboard imports them back from the SDK, so there is one implementation.

## 2. Data flow

### Proxy — `/server`

```ts
// app/api/beauty/[...path]/route.ts in the brand's app
import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';

export const { GET, POST } = createBeautyProxy({
  gatewayUrl: process.env.BEAUTY_GATEWAY_URL!,
  apiKey: process.env.BEAUTY_API_KEY!,
  brandId: process.env.BEAUTY_BRAND_ID!,
  applicationId: process.env.BEAUTY_APP_ID!,
  authorize: async (req) => ({ customerId: await sessionCustomerId(req) }), // optional
});
```

- **Allowlist.** Only the operations the SDK uses are forwarded; anything else
  is a 404 from the proxy. The table of operations (method, SDK path, gateway
  path) is one module, shared with the client so the two cannot drift:
  colour analyze / catalog / tryon; face-architecture and `/head`; vision
  analyze-image; reference brands and products (GET only); survey evaluate;
  assessment history.
- **Scope injection.** `brandId` and `applicationId` come from the proxy's
  config and are written into the gateway path server-side. The browser never
  sends them.
- **Customer data off by default.** Per-customer routes (assessment history)
  are enabled only when `authorize` returns a `customerId`; that id replaces
  any id in the request. `authorize` may also return a `Response` to refuse.
- **Passthrough.** Multipart uploads and binary responses (GLB, try-on images)
  stream through untouched; status codes and error bodies from core are
  returned as they are.
- **Timeouts.** Per operation, defaulting to the matching core-engine timeout
  plus a margin, each default named and sourced in code (as `useFaceHead`
  does today); overridable per operation.
- The API key is added only here and never echoed back.

### Client — `/client`

- `createBeautyClient({ baseUrl: '/api/beauty' })` in the browser.
- Typed methods: `colour.analyze`, `colour.catalog`, `colour.tryOn`,
  `face.analyze`, `face.head` (returns `ArrayBuffer`), `skin.analyze`,
  `reference.brands`, `reference.products`, `forms.evaluate`,
  `assessments.history`. Every method takes an `AbortSignal`.
- In a Server Component the same client can talk to the gateway directly
  (`{ baseUrl: gatewayUrl, apiKey, brandId, applicationId }`); constructing it
  with an `apiKey` in a browser throws.
- Errors are one type, `BeautyApiError { status, code, message, details }`,
  parsed from core's `{ detail }` bodies (single or list).
- Types follow the deployed contracts. Nothing is filled in: a field core
  sends as `null` is `null` in the type (e.g. `overallSkinHealthScore`), and
  vision zones carry `isVisible` with no confidence or occlusion fields
  (docs/REPORT-SEAGULL-CORE-VISION-MEASURED-FIELDS.md). The GLB report type
  includes `parts`, `segmenter` and `landmarkPoints`.

## 3. Headless layer — `/react`

`BeautyProvider` is mounted once:

```tsx
<BeautyProvider baseUrl="/api/beauty" locale="id" messages={{ 'colour.analyze': 'Cek warnaku' }}>
```

It holds the client, the locale and the message overrides. Theming is not a
provider concern (section 4).

Hooks share one result shape:
`{ status: 'idle' | 'loading' | 'success' | 'error', data, error, run, reset }`.

| Experience | Hooks |
|---|---|
| Photos | `useCameraCapture()`, `usePhotoSet()` (front, optional left/right ¾) |
| Colour | `useColourAnalysis(photo)`, `useColourCatalog()`, `useTryOn(photo)`, `useBrandFilter(catalog)` |
| Face | `useFaceArchitecture(photo)`, `usePhysicalScale(result, pd)` |
| 3D head | `useFaceHead(photoSet)` |
| Skin | `useSkinAnalysis(photo)` |
| Assessment | `useSurvey(code)`, `useAssessmentHistory()` |

Rules carried over from the dashboard:

- A result is tied to the photos it was made from; changing a photo hides the
  old result. A new run aborts the previous one; an abort from unmounting or
  supersession is not reported as an error.
- No browser storage by default. Customer photos are personal data, so a
  brand that wants a session to survive a reload passes a `persist` adapter.
- Pure helpers are exported from `/client`, React-free:
  `measurementGeometry`, `measurementName`, `friendlyValue`, `physicalScale`,
  `headMarkers`, `filterCatalog`, `brandsInCatalog`, `catalogOf`. A brand
  writing its own UI gets the same rules (no guessed marker positions,
  iris-based mm marked as an estimate).

## 4. Components and customisation

Each experience ships:

- **One complete component** — e.g. `<ColourStudio />`, the dashboard's
  studio flow (photo → questions → results → try-on).
- **Compound parts** — e.g. `<ColourStudio.Photo/>`, `<ColourStudio.Questions/>`,
  `<ColourStudio.Result/>`, `<ColourStudio.ProductPicker/>`,
  `<FaceMeasurements/>`, `<FaceOverlay/>`, `<HeadViewer/>`,
  `<SkinVisualizer/>`, `<ZoneDetail/>`. Parts read state from the same hooks,
  so a brand can lay them out freely.

Four levels of customisation:

1. **Theme** — CSS variables (`--bsdk-primary`, `--bsdk-radius`,
   `--bsdk-font`, status colours, …) on `:root` or any container; dark mode
   through the same variables.
2. **Classes** — `className` and `classNames={{ slot: '…' }}` per part; every
   element carries a stable `data-bsdk-part` attribute.
3. **Render props** — replace one piece. Every part accepts `renderEmpty` and
   `renderError`; parts that render a repeated item also accept a renderer for
   it that receives the default as a second argument, e.g.
   `renderProductCard(product, DefaultCard)`, `renderMeasurement(m, DefaultRow)`,
   `renderZone(zone, DefaultZone)`.
4. **Headless** — hooks and pure helpers only.

Copy goes through the message dictionary (Indonesian and English shipped),
including engine error codes (`errors.face.yaw_out_of_range`, …).

Honesty rules hold in every component and cannot be switched off by props:

- A value that was not measured (null, listed in `warnings`, or a zone with
  `isVisible: false`) renders as "not measured" with its reason, never as a
  number.
- "Provisional" and "uncalibrated profile" labels always show.
- Estimated regions of the 3D head can always be shown grey.

## 5. Build, styles and release

- **CSS.** Components use Tailwind v4 with `prefix(bsdk)` (`bsdk:flex`). A
  separate build step scans the SDK's `src/` and writes `dist/styles.css`
  with only the classes used. `@theme` tokens map to `var(--bsdk-*)` with
  defaults. All rules sit in `@layer bsdk`, so brand CSS wins without
  `!important`. No preflight or global reset is emitted.
- **JS.** tsup per entry, ESM + `.d.ts`, a `"use client"` banner on component
  and hook entries.
- **Release.** GitLab Package Registry; semver, 0.x until one brand runs it in
  production; changesets for `CHANGELOG.md`; CI publishes on a
  `beauty-sdk-v*` tag. Brands install with a read-only token in `.npmrc`. The
  project id and token setup go in `.npmrc` / CI variables, never in code;
  they are needed from the user at implementation time.
- **Example app.** `examples/next-brand`: a minimal Next.js App Router app with
  no Tailwind that installs the SDK from the packed tarball and uses the
  proxy, the provider and every experience. It is both the integration test
  and the brand's starting point.

## 6. Testing

- **Unit (vitest):** client (request shape, error mapping, abort); proxy
  (allowlist, scope injection, `authorize`, multipart and binary passthrough,
  timeouts, key never echoed); pure helpers (existing tests move with them);
  hooks (result tied to photos, supersession).
- **Components (Testing Library):** every `classNames` slot,
  `data-bsdk-part`, render prop; "not measured" and provisional labels always
  render.
- **Package:** build → `npm pack` → install into `examples/next-brand` →
  `next build` passes; a Server Component imports `/client` and `/server`
  without React; a page without `/head` has no `three` in its bundle.
- **Contract fixtures:** recorded real responses per endpoint (colour, face,
  GLB, skin) drive type and component tests, so a contract change fails a
  test instead of a brand's page.

## 7. Phases

Each phase is releasable.

| Phase | Content | Release |
|---|---|---|
| 0. Split | Studio and orchestrator to `@gateway-experience/studio`; dashboard imports switched; SDK free of `shared`. | — |
| 1. Foundation | `/client`, `/server`, `/react` (provider, messages, photo hooks), CSS pipeline, `examples/next-brand`, CI publish. | — |
| 2. Colour & try-on | Moved from the dashboard studio, brand filter included. | 0.1 |
| 3. Face & 3D head | `/face` and `/head`, realism A, `landmarkPoints` markers. | 0.2 |
| 4. Skin | Vision simulator on the current contract (`isVisible`, nullable score). | 0.3 |
| 5. Assessment | Survey, score, regimen, history (needs `authorize`). | 0.4 |
| 6. Dashboard on the SDK | `apps/web/features` copies replaced by SDK imports, alongside phases 2–5. | — |

## Out of scope

- Non-Next.js frameworks. The client and hooks are framework-light, but only
  Next.js App Router is tested and documented.
- Changes to core-engine contracts. Where the SDK would be cleaner with a core
  change, it is raised with Seagull-core, not worked around here.
- The admin studio's own features; it only moves package.

## Open items for implementation

- GitLab project id and token for the registry and CI (from the user).
- Per-operation timeout defaults: read from core-engine config when each phase
  starts, named and sourced in the proxy.
