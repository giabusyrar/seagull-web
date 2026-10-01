# Report from Seagull-core: vision analysis reports only measured values (2026-10-01)

Raised from Seagull-core, per its AGENTS.md ("a bug you find there is reported
there, not fixed from here"). Nothing in Seagull-web was changed except this
file.

## What changed in Seagull-core

The vision pipeline (`POST /core/vision-engine/analyze-image`, also under
`/api/vision` and `/api/v1/vision`) used to fill several response fields with
constants that looked like measurements. They are removed or made nullable.

### Already deployed to the VPS (2026-10-01)

- Without a face in an image, the response used to contain template zones and
  scores. It now carries a `NO_FACE_DETECTED` warning, and that image has no
  zones.
- If the skin worker is unavailable, the endpoint answers **503
  `SEGMENTATION_UNAVAILABLE`** instead of template zones.
- `captureContext.processedImages[].landmarkConfidence` is **omitted** (it was
  always 0.95).
- `captureContext.hijabDetected` and `hijabConfidence` are **removed** (they
  were never set).

### In this change (commit pending in Seagull-core, then deploy)

| Field | Before | Now |
|---|---|---|
| `zoneBreakdown[].confidence` | always 0.95 (a stub) | **removed** |
| `zoneBreakdown[].isOccluded` | always `false` (a stub) | **removed** |
| `zoneBreakdown[].isVisible` | — | **new**: `false` when the zone was out of frame in every image |
| `zoneBreakdown[].metrics.*[].confidence`, `globalAggregation.*[].confidence` | copied from the 0.95 | **removed** |
| `globalAggregation.overallSkinHealthScore` | `0.0` when nothing was scored | **`null`** when nothing was scored |
| request `brandId` / `applicationId` | defaulted to `brand_wardah` / `app_diagnostic` | **required**; 400 `BAD_REQUEST` naming the missing field |

Scores (`score`) are unchanged.

## What breaks in Seagull-web

The vision simulator (`apps/web/features/vision/simulator/`) reads the removed
fields:

1. **`ExecutiveSummaryTab.tsx:36`**:
   `globalAggregation.overallSkinHealthScore.toFixed(1)` **throws** when the
   score is `null`. That happens on an analysis that scored nothing: no face,
   or no model uploaded for the requested capabilities, which is the case on
   the VPS today. Render "not measured" (and the warnings) instead.
2. **`CanvasVisualizer.tsx:197`** and **`ZoneDeepDiveTab.tsx:94`**:
   `Math.round(zone.confidence * 100)` renders `NaN%`. Remove the confidence
   display.
3. **`DimensionAnalysisTab.tsx:23`**: `Math.round(metric.confidence * 100)`
   renders `NaN%`. Remove it.
4. **`CanvasVisualizer.tsx:105,131,150,199`** and **`ZoneDeepDiveTab.tsx:43`**:
   `zone.isOccluded` is now always `undefined`, which is falsy, so it doesn't
   crash. Nothing measures occlusion, so drop those branches, or use
   `isVisible === false` for "out of frame".
5. **`types.ts:47,62,74`**: update the types. Remove `isOccluded`,
   `confidence` and `landmarkConfidence`, add `isVisible: boolean`, and make
   `overallSkinHealthScore` `number | null`.
6. **`VisionSimulator.tsx:199`** already sends `brandId`. Make sure
   `applicationId` is sent too, or the request is now a 400.
7. **`VisionSettingModal.tsx:220`**: the example response text shows
   `overallSkinHealthScore`. Note that it can be null.

## Why

Seagull-core's AGENTS.md rule: "A placeholder must be distinguishable from the
real thing." A confidence of 0.95 on every zone, or an overall score of 0.0
when nothing was measured, cannot be told apart from a measurement. Nothing in
the pipeline measures per-zone confidence or occlusion today, so those fields
are absent rather than invented.
