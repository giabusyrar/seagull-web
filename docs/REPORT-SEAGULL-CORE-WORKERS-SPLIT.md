# Report from Seagull-core: Python workers split (2026-10-01)

Raised from Seagull-core, per its AGENTS.md ("a bug you find there is reported
there, not fixed from here"). Nothing in Seagull-web was changed except this file.

## What changed in Seagull-core

`apps/ai-worker` (one package, profiles `vision` / `tryon` / `colour`) is now
one app per worker under `apps/workers/` (seagull-core commit `1a384d8`):

| Worker | Port | Was | Serves |
|---|---|---|---|
| `worker-skin` | 8088 | ai-worker `vision` profile | segment-and-pose, model registry, `/api/v1/models/*` dispatch |
| `worker-face` | 8094 (new) | part of the `vision` profile | `/api/v1/face-measure` (face architecture) |
| `worker-colour` | 8092 | ai-worker `colour` profile | WCPA `/pca/*`, `/vto/*` |
| `worker-tryon` | 8090 | ai-worker `tryon` profile | shade extraction (GPU) |

core-engine now reads `SKIN_WORKER_URL` and `FACE_WORKER_URL`; it **refuses to
start** if `VISION_AI_WORKER_URL` is set. Public routes on core-engine
(`/core/vision-engine/...`, including face-architecture) did not change, and
skin kept port 8088 and every route, so nothing in Seagull-web is broken by the
split itself. Deployed to the VPS 2026-10-01.

## Findings for Seagull-web

### 1. `VISION_AI_WORKER_URL` naming (not broken; rename recommended)

Seagull-web still calls the skin worker `VISION_AI_WORKER_URL`:

- `apps/web/.env.example:21`
- `apps/web/lib/config/services.ts:47-48,56,66`
- `apps/web/lib/proxy-handler.ts:69` (comment: "Vision AI Worker (Python, :8088)")
- `packages/beauty-sdk/src/orchestrator/pipeline-executor.ts:21` (and the built `dist/`)
- `docs/PORTS.md:13`, `docs/RUNNING.md:18` (`vision-ai-worker` / `vision ai-worker` on :8088)

It still works (same host/port/routes), but the name no longer matches the
service (`worker-skin`), and a shared `.env` carrying `VISION_AI_WORKER_URL`
will now stop core-engine from starting. Suggest renaming to `SKIN_WORKER_URL`
in Seagull-web and keeping that variable out of any `.env` core-engine reads.

### 2. beauty-sdk calls a dispatch path that does not exist (pre-existing)

`packages/beauty-sdk/src/orchestrator/pipeline-executor.ts:21` posts to
`<worker>/api/v1/dispatch-capabilities`. The worker serves it at
`/api/v1/models/dispatch-capabilities` (`apps/workers/skin/worker_skin/routers/models.py:33,492`
in Seagull-core; same prefix before the split). The call 404s unless a
`configOverride.vision.serviceUrl` supplies the full path.

### 3. Vision engine view lists configs with an endpoint core-engine lacks (pre-existing)

`apps/web/features/vision/VisionEngineView.tsx:48` requests
`getEndpoint('vision', '/api/vision/config?list=true')`. Through the gateway this
becomes `/core/vision-engine/api/vision/config?list=true` (prefix doubled), and
core-engine has no "list configs" endpoint at all — only
`GET /config/:brandId/:applicationId` and `GET /registry`. Observed as a 404 in
the dashboard console on 2026-09-30.

### 4. API keys view fetches brands from a reference endpoint that does not exist (pre-existing)

`apps/web/features/api-keys/ApiClientApiKeysView.tsx:76` requests
`/api/reference/types/brand/items`. reference-service has no
`types/:type/items` route. Observed as a 404 ("Failed to fetch brands") on
2026-09-30. Note also that `apps/web/.env.local` points `REFERENCE_SERVICE_URL`
and `CORE_ENGINE_URL` at `127.0.0.1` while `/core/*` goes to the VPS gateway, so
the dashboard mixes laptop and VPS backends.

### 5. Model registry moved to the model server (port 8096)

The model registry and ONNX capability dispatch no longer run in the skin
worker (:8088); they run in the new `worker-models` service, **port 8096**
(Seagull-core `apps/workers/models`, `docs/MODEL-REGISTRY.md`). The routes
(`/api/v1/models/*`) and their request and response bodies are unchanged, so
only the target host changes. Skin keeps `segment-and-pose` alone.

What needs to point at the model server (`MODEL_SERVER_URL`, default
`http://127.0.0.1:8096`):

- The model-registry pages: `apps/web/lib/proxy-handler.ts:69` forwards
  `api/vision-worker/*` to `getVisionAiWorkerUrl()` (the skin worker). That
  branch (upload, download, activation, history) must resolve to the model
  server instead, through whichever key in `apps/web/lib/config/services.ts`
  currently serves it (`VISION_AI_WORKER_URL`, see finding 1). Name the new
  variable for what it is rather than reusing the skin name.
- `packages/beauty-sdk/src/orchestrator/pipeline-executor.ts:21` posts
  dispatch-capabilities to the worker URL; it must target the model server.
  Finding 2's path bug still applies: the route is
  `/api/v1/models/dispatch-capabilities`, not `/api/v1/dispatch-capabilities`.

Left on the skin worker (`SKIN_WORKER_URL`, :8088): `segment-and-pose` only.

New in the dispatch responses, optional and additive: `unavailableCapabilities`
(`{capability: reason}`), listing capabilities whose model could not be loaded.
On dispatch-zones those capabilities are also in `unsupportedCapabilities`;
dispatch-capabilities has only `unavailableCapabilities`. The rest still score.
Old env names `SKIN_MODEL_STORAGE_DIR` and `SKIN_WORKER_PUBLIC_URL` are refused
at start (now `MODEL_STORAGE_DIR` and `MODEL_SERVER_PUBLIC_URL`); neither is
read by Seagull-web.

### 6. Customer assessments move to core-engine (not deployed yet)

The databases are now separate (`seagull-gateway/docs/REPORT-SEAGULL-CORE-DB-SEPARATION.md`).
`customer_assessments` moves from gateway-engine to core-engine. Each
successful survey evaluate (`/survey/:code/evaluate`, `/evaluate-with-photos`)
is stored there. The response gains `assessment_id`, or a `warnings` entry
`ASSESSMENT_NOT_SAVED` if storing failed. New reads on core-engine:

- `GET /api/assessments/customers/:customerId?brand_id=&application_id=&limit=`
- `GET /api/assessments/history?brand_id=&application_id=&limit=`

Both return `{ "assessments": [...], "limit": n }`. `brand_id` and
`application_id` are required. `limit` is capped by the server's
`ASSESSMENT_LIST_MAX_LIMIT`.

`apps/web/features/assessments/AssessmentRecordsView.tsx:59` fetches
`/api/assessments?brandId=…&type=…`. No Next route serves that path today. It
should call core-engine's `history` route with snake_case `brand_id` and
`application_id`. There is no `type` filter. Seagull-core will say when the
endpoints are deployed.

## Not affected

- Face architecture: `features/colour/face/useFaceArchitecture.ts` calls
  core-engine's `/core/vision-engine/face-architecture/...`, which is unchanged
  (verified end to end on the VPS: HTTP 200, 478 landmarks).
- Colour/WCPA: reached only through core-engine (`COLOUR_WORKER_URL`).
