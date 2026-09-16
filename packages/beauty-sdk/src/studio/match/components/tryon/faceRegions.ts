import type { Shade } from './ShadeAssetTypes';

/** A single (x, y, z) normalized landmark, as emitted by @mediapipe/face_mesh. */
export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

// Landmark index loops from MediaPipe FaceMesh's canonical face topology
// (FACEMESH_LIPS / FACEMESH_LEFT_EYE / FACEMESH_RIGHT_EYE / FACEMESH_FACE_OVAL
// connection sets), ordered to trace a closed outer contour per region.
const LIP_OUTER_LOOP = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146,
];
const LEFT_EYE_LOOP = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
const RIGHT_EYE_LOOP = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
const LEFT_CHEEK_LOOP = [50, 187, 205, 36, 101, 118, 117];
const RIGHT_CHEEK_LOOP = [280, 411, 425, 266, 330, 347, 346];
const FACE_OVAL_LOOP = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const REGION_LOOPS: Record<Shade['region'], number[][]> = {
  lip: [LIP_OUTER_LOOP],
  eye: [LEFT_EYE_LOOP, RIGHT_EYE_LOOP],
  cheek: [LEFT_CHEEK_LOOP, RIGHT_CHEEK_LOOP],
  skin: [FACE_OVAL_LOOP],
};

/** Builds a canvas Path2D per contiguous region (e.g. one loop per eye) from live landmarks. */
export function buildRegionPaths(
  landmarks: FaceLandmark[],
  region: Shade['region'],
  canvasWidth: number,
  canvasHeight: number,
): Path2D[] {
  const loops = REGION_LOOPS[region];
  return loops.map((loop) => {
    const path = new Path2D();
    loop.forEach((idx, i) => {
      const lm = landmarks[idx];
      if (!lm) return;
      const x = lm.x * canvasWidth;
      const y = lm.y * canvasHeight;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
    return path;
  });
}

// How strongly the shade tints the tracked region. Lips read best fairly
// opaque; eyeshadow/blush/foundation should stay closer to a natural wash.
export const REGION_TINT_ALPHA: Record<Shade['region'], number> = {
  lip: 0.55,
  eye: 0.35,
  cheek: 0.3,
  skin: 0.22,
};
