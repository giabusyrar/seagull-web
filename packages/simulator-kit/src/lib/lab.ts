// The colour engine's raw CIELAB readings, from the analysis `debug` block.
//
// Core keeps raw colorimetry out of the response unless the request asks
// (?debug=1) AND core-engine runs with COLOUR_DEBUG_ENABLED=true (core
// colour/service/service.go). Otherwise `debug` is null and there is nothing
// to show: no value here is ever estimated.
//
// Core sends `debug.measurement` under the worker contract's names (skinLab,
// lPerSite, illuminant.method). Core builds before 2026-10-05 sent Go's field
// names (SkinLab, LPerSite, Illuminant.Method); those are still read so an
// older deployment keeps working.

export type Lab = [number, number, number];

export type LabSite = 'skin' | 'lip' | 'iris' | 'hair';
export const LAB_SITES: readonly LabSite[] = ['skin', 'lip', 'iris', 'hair'];

export interface LabReport {
  /** Per site; null when the engine did not measure it (hair is null with a hijab or hair hidden). */
  sites: Record<LabSite, Lab | null>;
  /** L* of each skin patch the engine sampled. */
  lPerSite: [string, number][];
  patchesUsed: string[];
  illuminant?: { method?: string; residual?: number | null };
  /** b* − a* of the skin, which the undertone is read from. */
  bMinusA?: number;
  /** Skin ITA° from core; absent when undefined (b* <= 0) or core predates it. */
  skinITA?: number;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : undefined);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
/** A field under its Go name or its worker (camelCase) name. */
const pick = (o: Obj | undefined, goName: string): unknown => (o ? o[goName] ?? o[goName[0].toLowerCase() + goName.slice(1)] : undefined);
const asLab = (v: unknown): Lab | null => (Array.isArray(v) && v.length === 3 && v.every(finite) ? [v[0], v[1], v[2]] : null);

export function labReport(result: unknown): LabReport | null {
  const debug = obj(obj(result)?.debug);
  const m = obj(debug?.measurement);
  if (!m) return null;
  const sites = {
    skin: asLab(pick(m, 'SkinLab')),
    lip: asLab(pick(m, 'LipLab')),
    iris: asLab(pick(m, 'IrisLab')),
    hair: asLab(pick(m, 'HairLab')),
  };
  if (!LAB_SITES.some((s) => sites[s])) return null;
  const lps = obj(pick(m, 'LPerSite'));
  const ill = obj(pick(m, 'Illuminant'));
  const method = pick(ill, 'Method');
  const residual = pick(ill, 'Residual');
  const patches = pick(m, 'PatchesUsed');
  return {
    sites,
    lPerSite: lps ? Object.entries(lps).filter((e): e is [string, number] => finite(e[1])) : [],
    patchesUsed: Array.isArray(patches) ? patches.map(String) : [],
    ...(ill ? { illuminant: { method: typeof method === 'string' ? method : undefined, residual: finite(residual) ? residual : null } } : {}),
    ...(finite(debug?.bMinusA) ? { bMinusA: debug.bMinusA } : {}),
    ...(finite(debug?.skinITA) ? { skinITA: debug.skinITA } : {}),
  };
}

/** C*ab and h°ab from a* and b* (CIE 15). */
export function chromaHue([, a, b]: Lab): { c: number; h: number } {
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { c: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

// CIELAB → sRGB for a swatch only. Constants are the published standards:
// D65 reference white (CIE 15), the CIE L*a*b* inverse, the sRGB matrix and
// transfer curve (IEC 61966-2-1). The engine's Lab is D65 (worker contract).
const D65 = [0.95047, 1, 1.08883] as const;
const EPS = 216 / 24389;
const KAPPA = 24389 / 27;
const XYZ_TO_SRGB = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
] as const;

/** The nearest displayable sRGB colour, as #rrggbb. Out-of-gamut channels are clipped. */
export function labToHex([L, a, b]: Lab): string {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (f: number) => (f ** 3 > EPS ? f ** 3 : (116 * f - 16) / KAPPA);
  const xyz = [inv(fx) * D65[0], (L > KAPPA * EPS ? fy ** 3 : L / KAPPA) * D65[1], inv(fz) * D65[2]];
  const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  return '#' + XYZ_TO_SRGB.map((row) => {
    const lin = row[0] * xyz[0] + row[1] * xyz[1] + row[2] * xyz[2];
    return Math.round(Math.min(1, Math.max(0, gamma(lin))) * 255).toString(16).padStart(2, '0');
  }).join('');
}
