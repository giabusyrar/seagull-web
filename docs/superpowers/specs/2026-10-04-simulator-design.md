# Seagull Simulator — design

Date: 2026-10-04
Status: draft for review

## Purpose

A developer tool, separate from `seagull-web`, for exercising every Seagull
backend service directly — no gateway, no APISIX, no API key. One screen per
service (and per core-engine engine) to send a real request and see the real
response: status, timing, headers, body.

## Non-goals

- Admin CRUD (surveys, rulesets, products, reference entities). `seagull-web` has it.
- Gateway / APISIX routing, auth, API keys.
- Voice in the conversation simulator (text only for now).
- Production deployment. Local tool; may point at the VPS by env.
- Fabricated or fallback results. A failed call shows the real error.

## Stack

- Next.js (App Router) + TypeScript, in `seagull/seagull-simulator` (its own git repo).
- Tailwind for styling. No component library beyond what is needed.
- `@google/model-viewer` for GLB responses.
- Vitest for unit tests.
- Port 3100 (3000 is seagull-web). Register it in each repo's `docs/PORTS.md` only when the user asks — those repos are being refactored by other sessions.

## Service access

`next.config.ts` rewrites, each target from an env var with a localhost default:

| Prefix | Env | Default |
|---|---|---|
| `/svc/core/*` | `SIM_CORE_URL` | `http://localhost:8082` |
| `/svc/ref/*` | `SIM_REFERENCE_URL` | `http://localhost:8086` |
| `/svc/conv/*` | `SIM_CONVERSATION_URL` | `http://localhost:8098` |
| `/svc/colour/*` | `SIM_COLOUR_URL` | `http://localhost:8092` |
| `/svc/face/*` | `SIM_FACE_URL` | `http://localhost:8094` |
| `/svc/skin/*` | `SIM_SKIN_URL` | `http://localhost:8088` |
| `/svc/tryon/*` | `SIM_TRYON_URL` | `http://localhost:8090` |

Calls are same-origin, so CORS (conversation-engine has none) and
unexposed response headers (`X-Render-Log`) are not a problem. The conversation
WebSocket connects directly to `NEXT_PUBLIC_SIM_CONVERSATION_WS`
(default `ws://localhost:8098`); WebSockets are not CORS-restricted.
Changing a target means editing `.env.local` and restarting.

## Layout

- Top bar: health pill per service (polls `/health` every 10 s; green / red with
  status code), brand and application pickers filled from reference
  `GET /api/reference/brands` and `/applications`; selection kept in localStorage.
- Left nav:
  - **Core** — Form, Score, Match, Vision, Colour, Face architecture, Assessments, Conversation flows
  - **Reference** — browse
  - **Conversation** — session + text chat
  - **Workers** — Colour, Face, Skin, Try-on

## Units

| Unit | Purpose |
|---|---|
| `lib/services.ts` | Registry: id, label, proxy prefix, health path. |
| `lib/http.ts` | `call(req) → {status, ok, ms, headers, body, kind}`; body kind json / image (PNG blob URL) / glb (blob URL) / text. Builds JSON, multipart, raw-body and query requests. Never throws on HTTP errors; throws only on network failure, surfaced as "service unreachable". |
| `lib/brand.ts` | Brand/app context; helpers that emit the id in the shape each endpoint wants (`brand_id`, `brandId`, path segment). |
| `components/RequestForm` | Renders fields from a field spec (text, number, bool, json, file, multi-file, select). |
| `components/ImageInput` | File upload or webcam snapshot. |
| `components/ResponseView` | Tabs: pretty JSON tree, image, 3D (model-viewer), raw, headers; status + ms badge. |
| `app/(sim)/<screen>/page.tsx` | One per screen; composes the above. No fetch logic in components — screens call `lib/http`. |

## Screens and endpoints

Core (`/svc/core` + `/core/<engine>` paths):

- **Form** — list surveys (`GET form-engine/survey`), pick one, evaluate
  (`POST survey/:code/evaluate`, JSON `data` editor prefilled from the survey
  schema questions) and evaluate-with-photos (multipart).
- **Score** — `POST score-engine/evaluate` (JSON), `POST evaluate/:code` (V2
  multipart, optional photo), `POST simulate` (ruleset from `GET rulesets/active`,
  form/vision score sliders).
- **Match** — `POST match-engine/evaluate` with `dimension_scores` editor;
  "use last score result" button copies dimension scores from the Score screen.
- **Vision** — `POST vision-engine/analyze-image` (front/left/right, dimensions
  and skin conditions picked from `GET registry`).
- **Colour** — `POST colour-engine/analyze` (hijab, hairVisible), catalog,
  `POST tryon` with shade checkboxes → PNG.
- **Face architecture** — `POST face-architecture/:brand/:app` (JSON) and
  `/head` (front/left/right → GLB in model-viewer).
- **Assessments** — customer and history lookups.
- **Conversation flows** — list and active flow.

Reference: tabs for brands, applications, dimensions, skin-conditions,
products (`?brandId=`), and `/all`; read-only tables + JSON.

Conversation: create session (brand/app/survey/customer) → keep `owner_token`;
get state; upload photo (raw body); ws-ticket → WebSocket; send text frames,
show transcript / tool / state events in a timeline; close/delete.

Workers:

- **Colour** — `/pca/analyze`, `/vto/render` (layer builder → PNG + `X-Render-Log`), `/vto/render-params`, `/colour/munsell`.
- **Face** — `/api/v1/face-measure/catalogue`, `/api/v1/face-measure` (optional landmarks overlay), `/api/v1/face-head` → GLB.
- **Skin** — `/api/v1/segment-and-pose` (declaredAngle), zones drawn over the image.
- **Try-on** — `/extract`; labelled "async: result goes to core-engine callback, not here".

## Errors

Every response shows its real status and body. Unreachable service → red
health pill and an inline "service at <url> unreachable" on its screen. Known
error codes (409 no active profile, 422 no face, 503 unavailable) are shown as
returned, not reinterpreted.

## Testing

- Vitest: `lib/http` (request building per kind, body-kind detection, error
  shape), `lib/brand` (id shapes), field-spec → FormData.
- Manual end-to-end against core (:8082) and reference (:8086), which are
  running locally; workers and conversation are verified when started.
- `npm run build` and lint clean.
