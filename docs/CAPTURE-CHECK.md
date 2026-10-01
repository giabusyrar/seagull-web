# Camera check for the colour analysis

While the camera is open on `/colour-analysis` (and the Core Engines →
Try-On Engine tab), each frame is checked before the photo is taken. Code:
`apps/web/features/colour/capture/`.

| Chip | Engine quality codes it covers |
|---|---|
| Pencahayaan | `terlalu_gelap`, `terlalu_terang`, `cahaya_campuran` |
| Posisi wajah | `tidak_ada_wajah`, `wajah_ganda`, `wajah_kecil`, `wajah_besar`, `tidak_di_tengah` |
| Hadap lurus | `menoleh`, `mendongak_menunduk`, `miring` |
| Ekspresi netral | `ekspresi` |

- Ekspresi netral has two separate thresholds under the one `ekspresi` code:
  `EXPR_MAX` for the other mouth/jaw/cheek/nose blendshapes, and a looser
  `PUCKER_MAX` for `mouthPucker`/`mouthFunnel`. MediaPipe reads relaxed full
  lips as 0.4-0.64 on those two, which crossed the shared 0.5 threshold and
  failed a neutral face; a real pucker reads well above that.
- The message under the video gives the advice for the first failing code,
  with the same text as the advice after analysis (`QC_ADVICE`).
- **Ambil foto** is enabled once every chip has passed for
  `LIVE.READY_HOLD_MS`. The capture then waits for a frame with the eyes open
  (`mata_tertutup`), at most `LIVE.CAPTURE_WAIT_MS`.
- **Ambil foto tanpa cek** takes the photo without waiting.
- Two meters under the buttons show the brightness on the face and the colour
  of the light.
- The check and the photo use the part of the camera frame the 3:4 box shows.
  A laptop's 16:9 frame is cropped at the sides, so someone standing beside
  the user, outside the box, is not in the photo and does not count as a
  second face.
- Uploaded photos are not checked here. The engine checks them, as before.

## Same check as the engine

The measurements and thresholds are the WCPA engine's quality check, in
seagull-core `apps/ai-worker/ai_worker/colour/wcpa/cells/`:

- `qc_measure` in `pca_base_c.py` measures;
- `QC_RULES` in `pipeline_03.py` sets the thresholds.

The browser runs the same MediaPipe Face Landmarker model. The thresholds
are copied into `capture/config.ts` with the notebook's tags (`[KARANGAN]`
and so on). To change one, change the notebook first, then `config.ts`.

Not checked live:

- `tertutup` and `blur`. They need the full-resolution photo. The engine
  still returns them in `qualityFailed` after the analysis.
- The light colour, in kelvin, is web only. The engine corrects a colour
  cast (Shades-of-Gray, then Bradford to D65), so a warm or cool light only
  warns. Its bands (`LIGHT_COLOUR`) are provisional.

Before merging, the check was run on 20 test frames: normal, dark,
over-exposed, warm, cool and mixed light, off-centre, small, too close,
tilted, two faces and no face. On each frame it raised the same codes as
the engine's `qc_rules`.

## Setup

The check needs two variables. They are read at build time. Without them the
camera works as before, unchecked.

| Variable | What it points to |
|---|---|
| `NEXT_PUBLIC_MEDIAPIPE_WASM_URL` | The `wasm` folder of the installed `@mediapipe/tasks-vision` |
| `NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL` | `face_landmarker.task`, the model the engine uses |

### Local files, works offline

From the repository root, in Git Bash (or any POSIX shell):

```bash
mkdir -p apps/web/public/models apps/web/public/mediapipe-wasm
cp ../seagull-core/apps/ai-worker/data/colour/face_landmarker.task apps/web/public/models/
cp node_modules/@mediapipe/tasks-vision/wasm/* apps/web/public/mediapipe-wasm/
```

In `apps/web/.env`:

```
NEXT_PUBLIC_MEDIAPIPE_WASM_URL=/mediapipe-wasm
NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL=/models/face_landmarker.task
```

- Both folders are git-ignored.
- After upgrading `@mediapipe/tasks-vision`, copy the wasm folder again.
- Restart `npm run dev` after changing `.env`.

### Hosted files

```
NEXT_PUBLIC_MEDIAPIPE_WASM_URL=https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@<installed version>/wasm
NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL=https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
```

The version in the wasm URL must be the installed one.

In Docker, both variables are build arguments (`apps/web/Dockerfile`).
