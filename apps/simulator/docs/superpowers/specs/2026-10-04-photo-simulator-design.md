# Seagull Simulator — photo simulator redesign

Date: 2026-10-04
Status: approved by the user in chat (replaces the endpoint-panel UI of
`2026-10-04-simulator-design.md`)

## Why

The user does not want to configure endpoints. The simulator becomes one
page that works like seagull-web's Colour Studio + Vision Simulator: upload a
face photo, press Analisis, see the results.

## Page

Single route `/`.

- **Top bar:** title, health pills for core and reference only, brand and
  application pickers (reference `brands[].code`, `applications[].key`).
- **Step 1 — Foto:**
  - front photo: file upload (jpeg/png) or a camera snapshot (no MediaPipe quality check);
  - optional left and right ¾ photos;
  - two required yes/no questions: "Memakai hijab atau penutup kepala?" (`hijab`)
    and "Rambut terlihat di foto?" (`hairVisible`);
  - **Analisis** button, enabled when a front photo exists, both questions are
    answered and a brand and app are picked.
- **Step 2 — Hasil:** two columns.
  - Left: the photo with a 2D/3D toggle. 2D shows the original photo, or the
    latest try-on render once a shade is picked. 3D shows the head GLB in
    model-viewer once it arrives. There is also a "Foto ulang" button that
    resets to step 1.
  - Right: three tabs, each showing its own loading state, its own error (real
    status and body), and a "lihat JSON" toggle (status, ms, raw body via the
    existing ResponseView).
    - **Warna:** quadrant (displayName or technicalName, "Hasil sementara" if
      provisional), tiles for labels.value / labels.chroma / labels.undertone /
      foundationBand, seasonEquivalents, flags, qualityFailed (retake advice).
      Then shade swatches grouped by category (Complexion, Lip, Eye, Blush,
      Lainnya) from the analyze response's catalog/recommendations. At most one
      shade per category. Each pick re-renders the try-on.
    - **Wajah:** classifications (primary, secondary), traits, a measurements
      list (key, value, unit, band), and photo quality (roll/yaw/pitch,
      warnings). Rejections (4xx) list the failed gates from the body.
    - **Kulit:** overall skin health score (or "tidak dinilai" if null),
      dimensions and skin conditions (label, score, severity), zones (name,
      visible, metrics count), warnings.

## Backend calls (direct to core-engine via `/svc/core`, no gateway)

On Analisis, four requests run in parallel. Each sets only its own tab's state.

| Tab | Request |
|---|---|
| Warna | `POST /core/colour-engine/analyze` — multipart `image`, `hijab`, `hairVisible` ("true"/"false") |
| Wajah | `POST /core/vision-engine/face-architecture/{brandId}/{applicationId}` — multipart `image` |
| Wajah (3D) | `POST /core/vision-engine/face-architecture/{brandId}/{applicationId}/head` — multipart `front`, optional `left`, `right` → GLB |
| Kulit | `POST /core/vision-engine/analyze-image` — multipart `image_front`, optional `image_left`, `image_right`, `brandId`, `applicationId` |

Try-on: `POST /core/colour-engine/tryon` — multipart `image` + one `shadeIds`
field per selected shade → PNG. Debounced 250 ms; a newer pick aborts or
ignores an older in-flight render. No shades selected shows the original photo.

## Removed

Endpoint panels, the left nav, `app/[group]`, `app/conversation`, `app/sdk`,
`app/api/beauty`, `vendor/` tarball and the beauty-sdk dependency,
`scripts/pack-sdk.sh`, `lib/endpoints/*`, `lib/groups.ts`, `lib/endpoint.ts`
(unless still needed), `lib/sdk.ts`, `lib/conversation.ts`, `EndpointPanel`,
`SdkPanel`, `Nav`, and their tests. The `/svc/sdkgw` rewrites go too.

## Kept

`/svc/*` rewrites for core and reference, `lib/http.ts` (`call`, `readResponse`,
the unreachable hint), `lib/services.ts`, `BrandProvider`/`BrandPicker`,
`HealthPills` (filtered to core + ref), the webcam capture, `GlbViewer`,
`ResponseView`, the 127.0.0.1 bind.

## Rules

- No fabricated results. Every failure shows its real status and body.
- No fetch inside components except via `call()`. Request building lives in
  pure functions (`lib/photo.ts`) with unit tests.
- No gateway, no API keys.

## Testing

- Vitest: request builders (the four analysis requests + try-on FormData,
  including optional side photos and bool encoding), shade grouping and
  one-per-category selection, the brand path in the face URLs.
- `npm test`, `tsc`, `lint`, `build` clean.
- Live: with core :8082 running, press Analisis through the dev server (curl the
  same requests via `/svc/core`), and record the statuses.
