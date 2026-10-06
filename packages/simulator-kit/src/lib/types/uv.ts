// UV analysis (seagull-core aging worker, POST /api/v1/uv/analyze, reached as
// core-engine /core/vision-engine/uv/analyze). Shapes from
// workers/aging/worker_aging/schemas/uv.py; every field may be missing here.
//
// Everything is a raw measurement in the unit capabilityInfo names, never a
// 0..100 score. A zone that could not be measured is in skippedZones, never 0.

/** zone → capability → metric → raw value. */
export type UvMeasurements = Record<string, Record<string, Record<string, number>>>;

/** How far a capability is calibrated: not at all, ranked within a population, or fitted to a reference. */
export type UvStatus = 'uncalibrated' | 'ranked' | 'calibrated';

export interface UvCapabilityInfo { status?: UvStatus; levels?: string[]; unit?: string; proxy?: string }

export interface UvEstimate { source?: string; scale?: string; value?: number; version?: string; agreement?: { spearman?: number | null; mae?: number; n?: number } }

export interface UvSkipped { zone?: string; capability?: string; reason?: string }

export interface UvResult {
  measurements?: UvMeasurements;
  capabilityInfo?: Record<string, UvCapabilityInfo>;
  /** zone → capability → metric → percentile (0..100) among measured faces on the device; a rank, not accuracy. */
  telemetry?: UvMeasurements;
  estimates?: Record<string, UvEstimate[]>;
  calibrationError?: string | null;
  skippedZones?: UvSkipped[];
  warnings?: { code?: string; value?: number }[];
  landmarkPrep?: string;
  /** An annotated copy of the photo (contours only), an illustration, not a measurement. */
  overlay?: { kind?: string; png?: string; legend?: Record<string, string> } | null;
}

/** One capability's rows: each zone it measured, with its metrics, and the zones it skipped. */
export interface UvCapabilityView {
  capability: string;
  info: UvCapabilityInfo;
  metrics: string[];
  zones: { zone: string; values: Record<string, number>; rank: Record<string, number> }[];
  skipped: { zone: string; reason: string }[];
  estimates: UvEstimate[];
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const nums = (v: unknown): Record<string, number> =>
  Object.fromEntries(Object.entries(obj(v)).filter((e): e is [string, number] => typeof e[1] === 'number' && Number.isFinite(e[1])));

/** The result regrouped capability first (the response is zone first), in capabilityInfo's order. */
export function uvByCapability(r: UvResult | null | undefined): UvCapabilityView[] {
  const info = obj(r?.capabilityInfo) as Record<string, UvCapabilityInfo>;
  const measured = obj(r?.measurements);
  const telemetry = obj(r?.telemetry);
  const caps = new Set<string>(Object.keys(info));
  for (const z of Object.values(measured)) for (const c of Object.keys(obj(z))) caps.add(c);
  const skipped = Array.isArray(r?.skippedZones) ? r.skippedZones : [];
  return [...caps].map((capability) => {
    const zones = Object.entries(measured)
      .map(([zone, byCap]) => ({ zone, values: nums(obj(byCap)[capability]), rank: nums(obj(obj(telemetry[zone])[capability])) }))
      .filter((z) => Object.keys(z.values).length > 0);
    const metrics = [...new Set(zones.flatMap((z) => Object.keys(z.values)))];
    return {
      capability,
      info: obj(info[capability]) as UvCapabilityInfo,
      metrics,
      zones,
      skipped: skipped.filter((s) => s?.capability === capability && s.zone).map((s) => ({ zone: String(s.zone), reason: String(s.reason ?? '') })),
      estimates: Array.isArray(r?.estimates?.[capability]) ? (r.estimates[capability] as UvEstimate[]) : [],
    };
  });
}
