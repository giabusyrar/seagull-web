'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { FaceLandmarker as Landmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { ENGINE, LIVE, MEDIAPIPE_ASSETS, QC_THRESHOLDS } from './config';
import {
  GATING_CODES,
  measureFrame,
  qcFailures,
  smoothMetrics,
  type DetectedFace,
  type LiveMetrics,
  type LiveQcCode,
  type Point,
  type RgbaPixels,
} from './qc';

export type CheckStatus = 'loading' | 'running' | 'unavailable';

export interface MeshLine {
  start: number;
  end: number;
}

/** Called with the frame to save, or null when the caller has to grab one itself. */
export type TakePhoto = (frame: HTMLCanvasElement | null) => void;

export interface CaptureCheck {
  status: CheckStatus;
  metrics: LiveMetrics | null;
  failed: LiveQcCode[];
  /** No check holds the capture back in the latest frame. */
  passing: boolean;
  /** Passing for LIVE.READY_HOLD_MS: the photo can be taken. */
  ready: boolean;
  /** Landmarks of the checked face in the latest frame, 0-1 of the visible frame, for the mesh. */
  face: Point[] | null;
  /** MediaPipe's face tesselation, once the model has loaded. */
  mesh: MeshLine[] | null;
  /**
   * Takes the photo. While the check runs, `take` gets the next checked frame
   * with a face and the eyes open, so the photo is exactly a frame that was
   * checked. After LIVE.CAPTURE_WAIT_MS, or when the check is not running, it
   * gets null at once.
   */
  capture: (take: TakePhoto) => void;
}

type LiveState = Omit<CaptureCheck, 'capture'>;

const LOADING: LiveState = { status: 'loading', metrics: null, failed: [], passing: false, ready: false, face: null, mesh: null };

/**
 * Draws the part of the video the person sees (the video box crops it like
 * object-cover) into `canvas`, at the camera's resolution. The check and the
 * photo both use this frame, so what is checked and saved is what was shown.
 */
export function drawVisibleFrame(v: HTMLVideoElement, canvas: HTMLCanvasElement): boolean {
  const vw = v.videoWidth;
  const vh = v.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!vw || !vh || !ctx) return false;
  const bw = v.clientWidth || vw;
  const bh = v.clientHeight || vh;
  const s = Math.max(bw / vw, bh / vh);
  const sw = Math.min(vw, Math.round(bw / s));
  const sh = Math.min(vh, Math.round(bh / s));
  if (canvas.width !== sw || canvas.height !== sh) {
    canvas.width = sw;
    canvas.height = sh;
  }
  ctx.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, sw, sh);
  return true;
}

// One Face Landmarker per page: the model loads once and camera sessions reuse it.
let landmarker: Promise<{ detector: Landmarker; mesh: MeshLine[] }> | null = null;

function loadLandmarker() {
  if (!landmarker) {
    landmarker = (async () => {
      const { wasmUrl, modelUrl } = MEDIAPIPE_ASSETS;
      if (!wasmUrl || !modelUrl) {
        throw new Error('NEXT_PUBLIC_MEDIAPIPE_WASM_URL and NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL must both be set');
      }
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(wasmUrl);
      const create = (delegate: 'GPU' | 'CPU') =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: modelUrl, delegate },
          runningMode: 'VIDEO',
          numFaces: ENGINE.NUM_FACES,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
      const detector = await create('GPU').catch(() => create('CPU'));
      return { detector, mesh: FaceLandmarker.FACE_LANDMARKS_TESSELATION };
    })();
    // A failed load is retried by the next camera session.
    landmarker.catch(() => {
      landmarker = null;
    });
  }
  return landmarker;
}

function toFaces(res: FaceLandmarkerResult): DetectedFace[] {
  return res.faceLandmarks.map((landmarks, i) => {
    const categories = res.faceBlendshapes?.[i]?.categories;
    return {
      landmarks,
      blendshapes: categories ? Object.fromEntries(categories.map((c) => [c.categoryName, c.score])) : null,
      matrix: res.facialTransformationMatrixes?.[i]?.data ?? null,
    };
  });
}

/**
 * Runs the engine's quality check on the camera video while the calling
 * component is mounted. Mount it only while the camera is on.
 */
export function useCaptureCheck(video: RefObject<HTMLVideoElement | null>): CaptureCheck {
  const [live, setLive] = useState<LiveState>(LOADING);
  const running = useRef(false);
  const pending = useRef<{ take: TakePhoto; since: number } | null>(null);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    const frame = document.createElement('canvas');
    const small = document.createElement('canvas');
    const smallCtx = small.getContext('2d', { willReadFrequently: true });
    let lastRun = -Infinity;
    let lastFrame = -1;
    let errors = 0;
    let smooth: LiveMetrics | null = null;
    let passSince: number | null = null;

    // Hands a waiting capture over without a checked frame.
    const release = () => {
      const p = pending.current;
      pending.current = null;
      p?.take(null);
    };

    loadLandmarker()
      .then(({ detector, mesh }) => {
        if (stopped) return;
        running.current = true;
        const tick = (now: number) => {
          if (stopped) return;
          raf = requestAnimationFrame(tick);
          // A capture never waits longer than this, even when frames stop.
          if (pending.current && now - pending.current.since >= LIVE.CAPTURE_WAIT_MS) release();

          const v = video.current;
          if (!v || v.readyState < 2) return;
          if (!pending.current && now - lastRun < LIVE.DETECT_INTERVAL_MS) return;
          if (v.currentTime === lastFrame) return;
          if (!drawVisibleFrame(v, frame)) return;
          lastRun = now;
          lastFrame = v.currentTime;

          let faces: DetectedFace[];
          try {
            faces = toFaces(detector.detectForVideo(frame, now));
            errors = 0;
          } catch (e) {
            if (++errors < LIVE.MAX_DETECT_ERRORS) return;
            // The detector keeps failing (e.g. the GPU context was lost): stop
            // checking so the camera still works.
            console.warn('[capture check] stopped:', e instanceof Error ? e.message : e);
            stopped = true;
            running.current = false;
            cancelAnimationFrame(raf);
            release();
            setLive({ ...LOADING, status: 'unavailable' });
            return;
          }

          // The light is measured on a small copy of the same frame, sampled
          // without smoothing so highlights keep their values.
          let pixels: RgbaPixels | null = null;
          if (smallCtx) {
            const w = LIVE.ANALYSIS_WIDTH;
            const h = Math.round((w * frame.height) / frame.width);
            if (small.width !== w || small.height !== h) {
              small.width = w;
              small.height = h;
            }
            smallCtx.imageSmoothingEnabled = false;
            smallCtx.drawImage(frame, 0, 0, w, h);
            try {
              pixels = smallCtx.getImageData(0, 0, w, h);
            } catch {
              pixels = null;
            }
          }
          const { metrics, subject } = measureFrame({ faces, frameWidth: frame.width, frameHeight: frame.height, pixels });
          smooth = smoothMetrics(smooth, metrics, LIVE.SMOOTHING);
          const failed = qcFailures(smooth);
          const passing = !failed.some((c) => GATING_CODES.includes(c));
          passSince = passing ? (passSince ?? now) : null;
          const ready = passSince !== null && now - passSince >= LIVE.READY_HOLD_MS;

          // A blink is too short for the smoothed checks, so the capture waits
          // for a frame of its own that has a face with the eyes open.
          const p = pending.current;
          if (p && metrics.face_found && !(metrics.blink_max > QC_THRESHOLDS.BLINK_MAX)) {
            pending.current = null;
            p.take(frame);
          }
          setLive({ status: 'running', metrics: smooth, failed, passing, ready, face: subject?.landmarks ?? null, mesh });
        };
        raf = requestAnimationFrame(tick);
      })
      .catch((e: unknown) => {
        if (stopped) return;
        console.warn('[capture check] not running:', e instanceof Error ? e.message : e);
        setLive({ ...LOADING, status: 'unavailable' });
      });

    return () => {
      stopped = true;
      running.current = false;
      pending.current = null;
      cancelAnimationFrame(raf);
    };
  }, [video]);

  const capture = useCallback((take: TakePhoto) => {
    if (running.current) pending.current = { take, since: performance.now() };
    else take(null);
  }, []);

  return { ...live, capture };
}
