// A ruleset's input sources and per-dimension blend, as the editor holds them
// (percentage weights) and as core reads them (`sources` + `dimension_inputs`,
// fractional weights). Legacy rulesets (field_mapping + dimension_fusion) are
// read by converting them exactly as core specified, so a save never changes
// a score; they are never written.
import type { AxisInput, DimensionInputs, SourceDirection, SourceSpec, VisualAxisConfig } from '../types';
import { AGE_FIELD, LEGACY_SOURCES } from '../types';

/** Core's tolerance on a dimension's weights summing to 1 (n-source blend spec, "Validation on save"). */
export const WEIGHT_SUM_TOLERANCE = 1e-6;

export interface BlendConfig {
  sources: Record<string, SourceSpec>;
  /** Per dimension key: its inputs (percentage weights) and required sources. */
  dims: Record<string, { inputs: AxisInput[]; required: string[] }>;
  /** true: read from legacy keys; saving converts the ruleset. */
  converted: boolean;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const pct = (w: unknown) => (typeof w === 'number' && Number.isFinite(w) ? Math.round(w * 100 * 1e6) / 1e6 : undefined);

/**
 * One legacy dimension, converted (Core session, 2026-10-04):
 * - form's field is the dimension key itself (core never read
 *   field_mapping.form), except AGE_FIELD, which date of birth feeds;
 * - vision's field is field_mapping.vision;
 * - weights come from dimension_fusion, and a source weighted 0 there was
 *   "not an input", so it is dropped with its input;
 * - with no dimension_fusion entry, the one mapped source takes it all; a
 *   dimension mapping nothing was form-only from its own key. Two mapped
 *   sources and no weights is left without weights, for validation to show.
 */
export function convertLegacyDimension(
  key: string,
  fusion: { form?: number; vision?: number } | undefined,
  mapping: { form?: string; vision?: string } | undefined,
): AxisInput[] {
  const formField = mapping?.form === AGE_FIELD ? AGE_FIELD : key;
  const visionField = mapping?.vision;
  if (fusion) {
    const out: AxisInput[] = [];
    if ((fusion.form ?? 0) > 0) out.push({ source: 'form', field: formField, weight: pct(fusion.form) });
    if ((fusion.vision ?? 0) > 0 && visionField) out.push({ source: 'vision', field: visionField, weight: pct(fusion.vision) });
    // A lone survivor (e.g. vision weighted but never mapped, so it never
    // arrived and core re-shared its weight) takes it all.
    return out.length === 1 ? [{ ...out[0], weight: 100 }] : out;
  }
  const mapped: AxisInput[] = [];
  if (mapping?.form) mapped.push({ source: 'form', field: formField, weight: undefined });
  if (visionField) mapped.push({ source: 'vision', field: visionField, weight: undefined });
  if (mapped.length === 0) return [{ source: 'form', field: key, weight: 100 }];
  if (mapped.length === 1) return [{ ...mapped[0], weight: 100 }];
  return mapped;
}

/**
 * The blend of a parsed ruleset schema: the new keys if present (core then
 * ignores the legacy ones entirely), else the legacy keys converted.
 * `legacyKeys`: the legacy ruleset's other dimension keys (weights, labels),
 * which it scored from the form under their own key.
 */
export function readBlend(schema: Obj, legacyKeys: Iterable<string> = []): BlendConfig {
  if (isObj(schema.sources) || isObj(schema.dimension_inputs)) {
    const sources: Record<string, SourceSpec> = {};
    for (const [name, s] of Object.entries(isObj(schema.sources) ? schema.sources : {})) {
      if (!isObj(s)) continue;
      const scale = Array.isArray(s.scale) && s.scale.length === 2 ? [Number(s.scale[0]), Number(s.scale[1])] as [number, number] : [NaN, NaN] as [number, number];
      sources[name] = { scale, direction: s.direction as SourceDirection }; // as stored; validateBlend reports a bad one;
    }
    const dims: BlendConfig['dims'] = {};
    for (const [key, d] of Object.entries(isObj(schema.dimension_inputs) ? schema.dimension_inputs : {})) {
      if (!isObj(d)) continue;
      const inputs = isObj(d.inputs) ? d.inputs : {};
      const weights = isObj(d.weights) ? d.weights : {};
      dims[key] = {
        inputs: Object.entries(inputs).map(([source, field]) => ({ source, field: String(field), weight: pct(weights[source]) })),
        required: Array.isArray(d.required) ? d.required.map(String) : [],
      };
    }
    return { sources, dims, converted: false };
  }
  const fusion = (isObj(schema.dimension_fusion) ? schema.dimension_fusion : {}) as Record<string, { form?: number; vision?: number } | undefined>;
  const mapping = (isObj(schema.field_mapping) ? schema.field_mapping : {}) as Record<string, { form?: string; vision?: string } | undefined>;
  // Every dimension the legacy ruleset scores, including ones it never mapped (form-only from their own key).
  const keys = new Set([...Object.keys(fusion), ...Object.keys(mapping), ...legacyKeys]);
  const dims: BlendConfig['dims'] = {};
  for (const key of keys) dims[key] = { inputs: convertLegacyDimension(key, fusion[key], mapping[key]), required: [] };
  const used = new Set(Object.values(dims).flatMap((d) => d.inputs.map((i) => i.source)));
  const sources: Record<string, SourceSpec> = {};
  for (const name of ['form', 'vision'] as const) if (used.has(name)) sources[name] = { ...LEGACY_SOURCES[name], scale: [...LEGACY_SOURCES[name].scale] as [number, number] };
  return { sources, dims, converted: keys.size > 0 };
}

/** An axis's inputs as core reads them, or undefined when it has none. */
export function toDimensionInputs(axis: Pick<VisualAxisConfig, 'inputs' | 'required'>): DimensionInputs | undefined {
  const rows = (axis.inputs || []).filter((i) => i.source && i.field);
  if (rows.length === 0) return undefined;
  const out: DimensionInputs = {
    inputs: Object.fromEntries(rows.map((i) => [i.source, i.field])),
    weights: Object.fromEntries(rows.map((i) => [i.source, typeof i.weight === 'number' ? i.weight / 100 : NaN])),
  };
  const required = (axis.required || []).filter((r) => rows.some((i) => i.source === r));
  if (required.length > 0) out.required = required;
  return out;
}

/**
 * Everything core would refuse on save, checked the same way, so the editor
 * can say so before a round trip. Messages name the dimension and source.
 */
export function validateBlend(sources: Record<string, SourceSpec>, axes: VisualAxisConfig[]): string[] {
  const problems: string[] = [];
  for (const [name, s] of Object.entries(sources)) {
    const [min, max] = s.scale || [];
    if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) problems.push(`Source "${name}": scale needs two numbers, min below max.`);
    if (s.direction !== 'concern' && s.direction !== 'health') problems.push(`Source "${name}": direction must be concern or health.`);
  }
  for (const a of axes) {
    const label = a.name || a.dimensionKey;
    const rows = a.inputs || [];
    if (rows.length === 0) continue;
    const seen = new Set<string>();
    let sum = 0;
    for (const i of rows) {
      if (!i.source) { problems.push(`${label}: a row has no source.`); continue; }
      if (seen.has(i.source)) problems.push(`${label}: source "${i.source}" is used twice.`);
      seen.add(i.source);
      if (!sources[i.source]) problems.push(`${label}: source "${i.source}" is not declared.`);
      if (!i.field) problems.push(`${label}: source "${i.source}" has no field.`);
      if (typeof i.weight !== 'number' || !Number.isFinite(i.weight)) problems.push(`${label}: source "${i.source}" has no weight.`);
      else if (i.weight <= 0) problems.push(`${label}: source "${i.source}" weight must be above 0.`);
      else sum += i.weight;
    }
    if (Math.abs(sum / 100 - 1) > WEIGHT_SUM_TOLERANCE && rows.every((i) => typeof i.weight === 'number')) {
      problems.push(`${label}: weights add up to ${Math.round(sum * 100) / 100}%, not 100%.`);
    }
    for (const r of a.required || []) if (!seen.has(r)) problems.push(`${label}: required source "${r}" is not one of its inputs.`);
  }
  return problems;
}
