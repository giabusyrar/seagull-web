import type {
  VisualAxisConfig,
  VisualBand,
  VisualProfileEntry,
  VisualProfileMappingConfig,
  ProfileStrategyType,
  JDMDecisionModel,
  JDMNode,
  JDMEdge,
  ThresholdBand,
  SourceSpec,
  DimensionInputs,
} from '../types';
import { DEFAULT_SCORE_RANGE_BANDS, DEFAULT_SEVERITY_BANDS, KNOWN_VISION_FIELDS, VISION_SOURCE } from '../types';
import { readBlend, toDimensionInputs } from './blend';

const visionFieldLabel = (code: string) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;

// Health-oriented model: the 0-100 score climbs from 0 (critical) to 100
// (optimal) — a higher number always means healthier skin. Score Range,
// Severity Level and Skin Concern are derived from total_score by the engine;
// the JDM only maps total_score -> Skin Profile.

/** The profile configuration a ruleset with no profile table starts from:
 *  nothing. Profiles, their score ranges and their names are the ruleset
 *  author's to set; none is filled in for them. */
export const EMPTY_PROFILE_CONFIG: VisualProfileMappingConfig = { strategy: 'total_score', profiles: [] };

/** The per-dimension letters core falls back to when an axis has none of its
 *  own: the upper-cased initial of each Score Range band label, in band order
 *  (core's axisValuesFromScores). Read from the ruleset being edited, so a
 *  ruleset with different bands gets its own letters. */
export function scoreRangeLetters(bands: VisualBand[]): string[] {
  const letters = bands
    .slice()
    .sort((x, y) => x.max - y.max)
    .map((b) => b.label.trim().charAt(0).toUpperCase())
    .filter(Boolean);
  return Array.from(new Set(letters));
}

const bandsToSchema = (bands: VisualBand[]) =>
  bands.map((b) => ({ max: Math.max(0, Math.min(100, Number(b.max) || 0)), label: b.label || '' }));

const cleanVal = (v?: string) => `"${(v || '').replace(/"/g, '')}"`;
const rangeCell = (min?: number, max?: number) =>
  `[${Math.max(0, Math.min(100, min ?? 0))}..${Math.max(0, Math.min(100, max ?? 100))}]`;

/**
 * Compiles the visual Skin Grading configuration into a JDM Decision Model.
 * The graph is intentionally minimal: one Skin Profile decision table. Score
 * Range / Severity Level / Skin Concern are computed by the engine from the
 * bands and concern labels carried alongside the graph.
 */
export function compileVisualToJDM(
  axes: VisualAxisConfig[],
  profileConfig: VisualProfileMappingConfig = EMPTY_PROFILE_CONFIG,
  scoreRangeBands: VisualBand[] = DEFAULT_SCORE_RANGE_BANDS,
  severityBands: VisualBand[] = DEFAULT_SEVERITY_BANDS,
  /** The schema being edited, if any. Any node in it that this function
   *  doesn't itself own (not 'input_node'/'profile', not `<axisKey>-band`
   *  for a key in `axes`) is carried over untouched — e.g. a hand-authored
   *  node with no axis_values output (Pore Severity writes to
   *  sub_classification, not a 4-letter code) that this editor has no way
   *  to represent yet. Without this, saving silently deletes it. */
  existingSchema?: string,
  /** The ruleset's sources. Omitted (e.g. the Skin Grading editor, which does
   *  not edit them): the existing schema's, or its legacy pair when it is
   *  being converted. */
  sources?: Record<string, SourceSpec>,
): string {
  // An axis whose dimension has not been picked yet is not compiled: it has
  // no key to write under. The editor refuses to save until every axis has one.
  const effectiveAxes = axes.filter((a) => (a.dimensionKey || '').trim());

  const nodes: JDMNode[] = [
    { id: 'input_node', name: 'Input', type: 'inputNode', position: { x: 40, y: 40 } },
  ];
  const edges: JDMEdge[] = [];

  const ownedNodeIds = new Set<string>(['input_node', 'profile', ...effectiveAxes.map((a) => `${a.dimensionKey.toLowerCase()}-band`)]);
  const preservedNodes: JDMNode[] = [];
  if (existingSchema) {
    try {
      const prev = JSON.parse(existingSchema);
      for (const n of prev?.nodes || []) {
        if (!ownedNodeIds.has(n?.id)) preservedNodes.push(n);
      }
    } catch {
      // not valid JSON yet (e.g. brand new ruleset) — nothing to preserve
    }
  }

  // --- Skin Profile decision table ---
  const profileOutputs = [
    { id: 'code', field: 'skin_profile.code', label: 'Code' },
    { id: 'name', field: 'skin_profile.name', label: 'Name' },
    { id: 'cat', field: 'skin_profile.category', label: 'Category' },
    { id: 'desc', field: 'skin_profile.description', label: 'Summary' },
  ];
  const profileInputs: Array<{ id: string; field: string; label: string }> = [];
  const profileRules: Record<string, string>[] = [];
  const strategy = profileConfig.strategy;

  if (strategy === 'total_score') {
    profileInputs.push({ id: 'in', field: 'total_score', label: 'Overall score (0-100, 100 = optimal)' });
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        in: rangeCell(p.minScore, p.maxScore),
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary),
      });
    }
  } else if (strategy === 'combination_matrix') {
    effectiveAxes.forEach((a) => {
      const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
      profileInputs.push({ id: `c_${axisCode.toLowerCase()}`, field: `axis_values.${axisCode}`, label: `${a.name || axisCode} code` });
    });
    for (const p of profileConfig.profiles || []) {
      const rule: Record<string, string> = {
        _id: p.id,
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary),
      };
      effectiveAxes.forEach((a) => {
        const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
        const v = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[axisCode] || '';
        rule[`c_${axisCode.toLowerCase()}`] = v ? cleanVal(v) : '-';
      });
      profileRules.push(rule);
    }
  } else {
    // primary_concern
    profileInputs.push(
      { id: 'pc_dim', field: 'primary_concern.dimension', label: 'Dominant dimension' },
      { id: 'pc_sev', field: 'primary_concern.severity', label: 'Severity Level' },
    );
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        pc_dim: p.primaryDimension ? cleanVal(p.primaryDimension) : '-',
        pc_sev: p.severityLevel ? cleanVal(p.severityLevel) : '-',
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary),
      });
    }
  }

  nodes.push({
    id: 'profile',
    name: 'Skin Profile',
    type: 'decisionTableNode',
    position: { x: 360, y: 40 },
    content: { hitPolicy: 'first', inputs: profileInputs, outputs: profileOutputs, rules: profileRules },
  });
  edges.push({ id: 'e_profile', sourceId: 'input_node', targetId: 'profile' });

  // --- schema-level config the engine reads ---
  const dimension_weights: Record<string, number> = {};
  const dimension_inputs: Record<string, DimensionInputs> = {};
  const concern_labels: Record<string, string> = {};
  const axis_codes: Record<string, { threshold: number; low: string; high: string }> = {};

  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    // Only a label the author set is written. Without one, core applies its
    // own default concern name (score_service.go concernLabel), so this
    // editor keeps no second copy of those names.
    const concern = (a.concernLabel || '').trim();
    if (concern) concern_labels[key] = concern;

    const di = toDimensionInputs(a);
    if (di) dimension_inputs[key] = di;

    // Bands -> axis_codes (exactly 2 bands) or a decisionTableNode (3+).
    const bands = (a.bands || []).slice().sort((x, y) => x.min - y.min);
    if (bands.length === 2) {
      const [lo, hi] = bands;
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, hi.min)),
        low: lo.letter || '',
        high: hi.letter || '',
      };
    } else if (bands.length >= 3) {
      nodes.push({
        id: `${key}-band`,
        name: `${a.name || key} bands`,
        type: 'decisionTableNode',
        content: {
          hitPolicy: 'first',
          inputs: [{ id: 'in', field: `dimension_scores.${key}`, label: `${a.name || key} Health Score` }],
          outputs: [{ id: 'out', field: `axis_values.${key.toUpperCase()}`, label: `${a.name || key} Axis` }],
          rules: bands
            .slice()
            .reverse() // highest band first — hitPolicy 'first' needs the narrowest/highest range checked before wider ones
            .map((b) => ({ in: rangeCell(b.min, b.max), out: cleanVal(b.letter) })),
        },
      });
    } else if ((a.axisCodeLow || '').trim() && (a.axisCodeHigh || '').trim()) {
      // Legacy fallback: old axisCodeLow/High fields, no `bands` set yet.
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, Number(a.axisCodeThreshold ?? 50))),
        low: (a.axisCodeLow || '').trim(),
        high: (a.axisCodeHigh || '').trim(),
      };
    }
  }

  // Start from the previous schema so any top-level key this function
  // doesn't itself manage (e.g. `notes`) survives, same as preservedNodes
  // above for unrecognized nodes.
  let base: Record<string, any> = {};
  if (existingSchema) {
    try {
      base = JSON.parse(existingSchema) || {};
    } catch {
      base = {};
    }
  }

  // Merge each editor-managed map onto the previous schema's version instead
  // of replacing it outright. A dimension this editor doesn't represent as a
  // visual axis (e.g. pore_severity, which only feeds a custom
  // sub_classification node — never an axis_values letter, so it's never
  // salvaged into `effectiveAxes`) must survive a Blending tab save exactly
  // like an unrecognized node already does via preservedNodes — confirmed
  // this was silently dropping field_mapping.pore_severity on every save.
  // Only keys this editor actually owns (effectiveAxes) are added, changed,
  // or removed by a save; everything else carries over untouched.
  const ownedDimKeys = new Set(effectiveAxes.map((a) => a.dimensionKey.toLowerCase()));
  const mergeOwned = <T>(baseMap: Record<string, T> | undefined, fresh: Record<string, T>): Record<string, T> => {
    const merged: Record<string, T> = { ...(baseMap || {}) };
    for (const k of ownedDimKeys) delete merged[k];
    return { ...merged, ...fresh };
  };

  // The blend is saved only in the new shape. Core reads a ruleset as all-new
  // or all-legacy, so the legacy keys go, and any dimension this editor does
  // not own keeps its blend, converted from the legacy keys if need be.
  const prevBlend = readBlend(base, [...Object.keys(base.dimension_weights || {}), ...Object.keys(base.concern_labels || {})]);
  const carried: Record<string, DimensionInputs> = {};
  for (const [k, d] of Object.entries(prevBlend.dims)) {
    if (ownedDimKeys.has(k)) continue;
    const di = toDimensionInputs(d);
    if (di) carried[k] = di;
  }
  const mergedInputs = mergeOwned(carried, dimension_inputs);
  const usedSources = new Set(Object.values(mergedInputs).flatMap((d) => Object.keys(d.inputs)));
  const declared = sources ?? prevBlend.sources;

  const model: JDMDecisionModel = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights: mergeOwned(base.dimension_weights, dimension_weights),
    concern_labels: mergeOwned(base.concern_labels, concern_labels),
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands),
  };
  const mergedAxisCodes = mergeOwned(base.axis_codes, axis_codes);
  if (Object.keys(mergedAxisCodes).length > 0) model.axis_codes = mergedAxisCodes;
  else delete model.axis_codes;
  delete model.field_mapping;
  delete model.dimension_fusion;
  // Sources the editor was given are all kept, even unused ones; carried-over ones only when used.
  const sourcesOut = sources ? { ...declared } : Object.fromEntries(Object.entries(declared).filter(([n]) => usedSources.has(n)));
  if (Object.keys(sourcesOut).length > 0 || Object.keys(mergedInputs).length > 0) {
    model.sources = sourcesOut;
    model.dimension_inputs = mergedInputs;
  } else {
    delete model.sources;
    delete model.dimension_inputs;
  }
  return JSON.stringify(model, null, 2);
}

export interface DecompiledGrading {
  axes: VisualAxisConfig[];
  profileConfig: VisualProfileMappingConfig;
  scoreRangeBands: VisualBand[];
  severityBands: VisualBand[];
  /** The ruleset's input sources (the legacy pair for a ruleset being converted). */
  sources: Record<string, SourceSpec>;
  /** true: the blend was read from legacy keys; saving rewrites it in the new shape. */
  convertedBlend: boolean;
  /** True when the schema had content but carried none of the Phase-2 markers
   *  (dimension_weights / concern_labels / a skin_profile.* node). The editor
   *  shows best-effort defaults and a warning: saving rewrites it to the new
   *  format. */
  legacy: boolean;
}

const bandsFromSchema = (raw: any, fallback: VisualBand[], prefix: string): VisualBand[] => {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((b) => ({ ...b }));
  return raw.map((b: any, i: number) => ({
    id: `${prefix}${i + 1}`,
    max: Number(b?.max) || 0,
    label: String(b?.label ?? ''),
  }));
};

/**
 * Decompiles a JDM schema back into the visual Skin Grading configuration.
 */
export function decompileJDMToVisualComponents(schemaStr: string): DecompiledGrading {
  const fallback: DecompiledGrading = {
    axes: [],
    profileConfig: { ...EMPTY_PROFILE_CONFIG, profiles: [] },
    scoreRangeBands: DEFAULT_SCORE_RANGE_BANDS.map((b) => ({ ...b })),
    severityBands: DEFAULT_SEVERITY_BANDS.map((b) => ({ ...b })),
    sources: {},
    convertedBlend: false,
    legacy: false,
  };
  if (!schemaStr || !schemaStr.trim()) return fallback;

  let parsed: any;
  try {
    parsed = JSON.parse(schemaStr);
  } catch {
    return fallback;
  }

  const clean = (v: any) => (typeof v === 'string' ? v.replace(/["']/g, '').trim() : '');
  const parseRange = (s: any): { min: number; max: number } | null => {
    const m = String(s ?? '').match(/(-?\d+)\s*\.\.\s*(-?\d+)/);
    return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
  };

  const weights: Record<string, number> = parsed.dimension_weights || {};
  const concernLabels: Record<string, string> = parsed.concern_labels || {};
  const axisCodes: Record<string, { threshold?: number; low?: string; high?: string }> =
    parsed.axis_codes || {};

  const allNodes: any[] = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const nodeContents = allNodes.map((n) =>
    typeof n?.content === 'string' ? safeParse(n.content) : n?.content,
  );
  const hasProfileNode = nodeContents.some((c) =>
    (c?.outputs || []).some(
      (o: any) => typeof o?.field === 'string' && o.field.startsWith('skin_profile.'),
    ),
  );

  // Salvage axis keys this schema computes a letter for but that have no
  // dimension_weights/concern_labels/axis_codes entry — a vision/DOB-only
  // axis like Aging has no form question, so it was deliberately left out of
  // those (they're about the OVERALL score's weighted mean, which an
  // input-only axis shouldn't dilute). OUTPUTS only (axis_values.<KEY> or the
  // legacy tiers.<key>) — never inputs, or a multi-input axis like Aging
  // would also salvage its own inputs (wrinkle, age_over_30) as if they were
  // separate axes.
  const salvagedKeys = new Set<string>();
  for (const c of nodeContents) {
    for (const col of c?.outputs || []) {
      const m = String(col?.field || '').match(/^(?:tiers|axis_values)\.([a-z0-9_]+)/i);
      if (m) salvagedKeys.add(m[1].toLowerCase());
    }
  }

  // Axes: the UNION of every source, not a priority fallback — an axis
  // salvaged only from a decisionTableNode output (no dimension_weights
  // entry) must still show up, or opening and saving this editor silently
  // deletes its node (confirmed to happen for real once already). This also
  // includes every field_mapping key, even one with no axis letter at all
  // (e.g. pore_severity, which only feeds a sub_classification node) — any
  // dimension that actually participates in scoring/dimension_scores must
  // be editable here, not just the ones that happen to produce a Baumann
  // letter. It naturally decompiles as a single_source (vision- or
  // form-only) axis with no bands, since there's no axis_codes/band node
  // for it to read.
  const dimKeys = Array.from(
    new Set([
      ...Object.keys(weights),
      ...Object.keys(concernLabels),
      ...Object.keys(axisCodes),
      ...salvagedKeys,
    ]),
  );
  const blend = readBlend(parsed, dimKeys);
  for (const k of Object.keys(blend.dims)) if (!dimKeys.includes(k)) dimKeys.push(k);

  const legacy =
    Object.keys(weights).length === 0 &&
    Object.keys(concernLabels).length === 0 &&
    !hasProfileNode;

  // Find a per-axis N-way band node: exactly one input reading
  // dimension_scores.<key>, one output writing axis_values.<KEY>. Anything
  // else (2+ inputs, a different field) is a hand-authored rule this editor
  // doesn't understand yet and is left alone — it survives decompile/compile
  // round-trips untouched because it's simply not in `nodes` this function
  // regenerates from `axes`.
  const bandNodeFor = (key: string) =>
    nodeContents.find((c) => {
      const ins = c?.inputs || [];
      const outs = c?.outputs || [];
      return (
        ins.length === 1 &&
        ins[0]?.field === `dimension_scores.${key}` &&
        outs.length === 1 &&
        outs[0]?.field === `axis_values.${key.toUpperCase()}`
      );
    });

  const axes: VisualAxisConfig[] = dimKeys.map((key, i) => {
    const ac = axisCodes[key.toLowerCase()];
    const bd = blend.dims[key];
    const bandNode = bandNodeFor(key);

    let bands: ThresholdBand[] | undefined;
    if (bandNode) {
      // Read the node's own column ids: this editor writes 'in'/'out', but a
      // hand-authored node names them freely (baumann_16_types' sebum-band
      // uses 'sebum'/'sebum_axis'), and reading only 'in'/'out' found no
      // bands, so a save dropped the node and the axis lost its letter.
      const inId = bandNode.inputs?.[0]?.id ?? 'in';
      const outId = bandNode.outputs?.[0]?.id ?? 'out';
      bands = (bandNode.rules || [])
        .map((r: Record<string, string>, ri: number) => {
          const range = parseRange(r[inId]);
          if (!range) return null;
          return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r[outId]) };
        })
        .filter(Boolean) as ThresholdBand[];
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === 'number' ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || '' },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || '' },
      ];
    }

    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      dimensionKey: key,
      weight: typeof weights[key] === 'number' ? weights[key] : 1,
      concernLabel: concernLabels[key] || undefined,
      inputs: (bd?.inputs || []).map((i) => ({ ...i, label: i.source === VISION_SOURCE ? visionFieldLabel(i.field) : i.field })),
      required: bd?.required || [],
      bands,
      ...(ac && (ac.low || ac.high)
        ? {
            axisCodeLow: ac.low || '',
            axisCodeHigh: ac.high || '',
            axisCodeThreshold: typeof ac.threshold === 'number' ? ac.threshold : 50,
          }
        : {}),
    };
  });

  // Profile table
  const profileNode = allNodes.find((n, idx) => {
    if (n?.type !== 'decisionTableNode') return false;
    const c = nodeContents[idx];
    return (c?.outputs || []).some((o: any) => typeof o?.field === 'string' && o.field.startsWith('skin_profile.'));
  });

  let profileConfig: VisualProfileMappingConfig = { ...EMPTY_PROFILE_CONFIG, profiles: [] };
  if (profileNode) {
    const c = typeof profileNode.content === 'string' ? safeParse(profileNode.content) : profileNode.content;
    const inputs: any[] = c?.inputs || [];
    const outputs: any[] = c?.outputs || [];
    const rules: any[] = (c?.rules || []).filter((r: any) => r._id !== 'p_rule_fallback');

    const outId = (test: (f: string) => boolean) =>
      outputs.find((o) => typeof o?.field === 'string' && test(o.field))?.id;
    const codeId = outId((f) => f === 'skin_profile.code') ?? 'code';
    const nameId = outId((f) => f === 'skin_profile.name') ?? 'name';
    const catId = outId((f) => f === 'skin_profile.category') ?? 'cat';
    const descId = outId((f) => f === 'skin_profile.description') ?? 'desc';

    let strategy: ProfileStrategyType = 'total_score';
    if (inputs.some((i) => i.field === 'total_score')) strategy = 'total_score';
    else if (inputs.some((i) => String(i.field || '').startsWith('axis_values.'))) strategy = 'combination_matrix';
    else if (inputs.some((i) => String(i.field || '').startsWith('primary_concern.'))) strategy = 'primary_concern';

    const totalInId = inputs.find((i) => i.field === 'total_score')?.id ?? 'in';
    const pcDimId = inputs.find((i) => i.field === 'primary_concern.dimension')?.id ?? 'pc_dim';
    const pcSevId = inputs.find((i) => i.field === 'primary_concern.severity')?.id ?? 'pc_sev';

    const profiles: VisualProfileEntry[] = rules.map((r, i) => {
      const entry: VisualProfileEntry = {
        id: r._id || `prof_${i + 1}`,
        code: clean(r[codeId]) || `PROFILE_${i + 1}`,
        title: clean(r[nameId]) || `Profile ${i + 1}`,
        category: clean(r[catId]) || 'General',
        summary: clean(r[descId]) || '',
      };
      if (strategy === 'total_score') {
        const rng = parseRange(r[totalInId]) ?? { min: 0, max: 100 };
        entry.minScore = rng.min;
        entry.maxScore = rng.max;
      } else if (strategy === 'combination_matrix') {
        const dimCodes: Record<string, string> = {};
        inputs.forEach((inp) => {
          const axisCode = String(inp.field || '').replace('axis_values.', '').trim();
          const v = clean(r[inp.id]);
          if (v && v !== '-') dimCodes[axisCode.toLowerCase()] = v;
        });
        entry.dimensionCodes = dimCodes;
      } else {
        entry.primaryDimension = clean(r[pcDimId]);
        entry.severityLevel = clean(r[pcSevId]);
      }
      return entry;
    });

    profileConfig = { strategy, profiles };
  }

  return {
    axes,
    profileConfig,
    scoreRangeBands: bandsFromSchema(parsed.score_range_bands, DEFAULT_SCORE_RANGE_BANDS, 'sr'),
    severityBands: bandsFromSchema(parsed.severity_bands, DEFAULT_SEVERITY_BANDS, 'sv'),
    sources: blend.sources,
    convertedBlend: blend.converted,
    legacy,
  };
}

function safeParse(s: any) {
  try {
    return typeof s === 'string' ? JSON.parse(s) : s;
  } catch {
    return null;
  }
}

/** Backwards-compatibility helper for existing callers. */
export function decompileJDMToVisual(schemaStr: string): VisualAxisConfig[] {
  return decompileJDMToVisualComponents(schemaStr).axes;
}
