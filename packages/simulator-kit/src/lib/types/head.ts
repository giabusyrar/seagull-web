// The parts of the head report (GLB asset.extras; seagull-core
// core-engine/internal/facearch/headreport.go) the simulator shows. Every
// field may be missing: older builds send less.

export interface HeadHairTemplate {
  id?: string;
  author?: string;
  license?: string;
  source?: string;
  /** Mean silhouette IoU against the photos' hair regions, 0..1. */
  iou?: number;
  /** Share of the template the photos saw, 0..1; the rest is stock hair no photo confirms. */
  confirmedFraction?: number;
  /** iou × confirmedFraction: a ranking, not a measurement. */
  score?: number;
  /** Share of the template under the head skin after fitting, 0..1. */
  underSkin?: number;
}

export interface HeadHair {
  built?: boolean;
  /** "shell" (built from the photos) or "template" (a stock hairstyle fitted to them). */
  mode?: string;
  reason?: string;
  template?: HeadHairTemplate;
  /** Why no template was used (or why the named one was rejected). */
  templateReason?: string;
  colour?: { method?: string; toneSrgbHex?: string };
  /** Credits the hair needs; always present, empty while only CC0 templates are loaded. */
  attribution?: Record<string, unknown>[];
}

export interface HeadPhotoSkin {
  view?: string;
  triangles?: number;
  overlapTriangles?: number;
  vertices?: number;
  textureSize?: [number, number];
  /** Linear RGB gain applied to match the views' exposure. */
  exposureGain?: number[];
}

export interface HeadReport {
  hair?: HeadHair;
  /** The photos projected onto the head's skin, one entry per view; visualisation only. */
  photoSkin?: HeadPhotoSkin[];
  notice?: string;
}
