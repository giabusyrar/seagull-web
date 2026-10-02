import type {
  VisualAxisConfig,
  VisualBand,
  VisualProfileEntry,
  VisualProfileMappingConfig,
  ProfileStrategyType,
  JDMDecisionModel,
  JDMNode,
  JDMEdge,
  InputSource,
  ThresholdBand,
} from '../types';
import { DEFAULT_SCORE_RANGE_BANDS, DEFAULT_SEVERITY_BANDS, KNOWN_VISION_FIELDS } from '../types';

const visionFieldLabel = (code: string) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;

const makeSource = (fieldCode: string | undefined, origin: 'form' | 'vision'): InputSource | undefined =>
  fieldCode
    ? {
        origin,
        fieldCode,
        label: origin === 'vision' ? visionFieldLabel(fieldCode) : fieldCode,
      }
    : undefined;

// Health-oriented model: the 0-100 score climbs from 0 (critical) to 100
// (optimal) — a higher number always means healthier skin. Score Range,
// Severity Level and Skin Concern are derived from total_score by the engine;
// the JDM only maps total_score -> Skin Profile.

const DEFAULT_CONCERN_LABELS: Record<string, string> = {
  sebum: 'Minyak Berlebih',
  oiliness: 'Minyak Berlebih',
  sensitivity: 'Kulit Sensitif',
  pigmentation: 'Noda Gelap',
  dark_spot: 'Noda Gelap',
  aging: 'Garis Halus & Kerutan',
  hydration: 'Kulit Kering',
  acne: 'Jerawat',
  pores: 'Pori Besar',
  barrier: 'Barier Kulit Rusak',
};

export function defaultConcernLabel(dimKey: string): string {
  const k = (dimKey || '').toLowerCase();
  if (DEFAULT_CONCERN_LABELS[k]) return DEFAULT_CONCERN_LABELS[k];
  return k
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const DEFAULT_STARTER_AXES: VisualAxisConfig[] = [
  {
    id: 'axis_sebum',
    axisCode: 'SEBUM',
    name: 'Sebum Secretion',
    dimensionKey: 'sebum',
    weight: 1,
    concernLabel: 'Minyak Berlebih',
  },
];

export const DEFAULT_STARTER_PROFILES: VisualProfileMappingConfig = {
  strategy: 'total_score',
  profiles: [
    {
      id: 'prof_1',
      minScore: 61,
      maxScore: 100,
      code: 'OPTIMAL',
      title: 'Kulit Optimal',
      category: 'Optimal',
      summary: 'Kondisi kulit seimbang, tidak ada keluhan menonjol.',
    },
    {
      id: 'prof_2',
      minScore: 41,
      maxScore: 60,
      code: 'MODERATE',
      title: 'Perlu Perawatan Aktif',
      category: 'Sedang',
      summary: 'Ada keluhan sedang yang perlu perawatan aktif.',
    },
    {
      id: 'prof_3',
      minScore: 0,
      maxScore: 40,
      code: 'CONCERN',
      title: 'Perlu Perhatian Khusus',
      category: 'Perlu Perhatian Khusus',
      summary: 'Keluhan menonjol, perlu perhatian dan rutinitas terarah.',
    },
  ],
};

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
  profileConfig: VisualProfileMappingConfig = DEFAULT_STARTER_PROFILES,
  scoreRangeBands: VisualBand[] = DEFAULT_SCORE_RANGE_BANDS,
  severityBands: VisualBand[] = DEFAULT_SEVERITY_BANDS,
  /** The schema being edited, if any. Any node in it that this function
   *  doesn't itself own (not 'input_node'/'profile', not `<axisKey>-band`
   *  for a key in `axes`) is carried over untouched — e.g. a hand-authored
   *  node with no axis_values output (Pore Severity writes to
   *  sub_classification, not a 4-letter code) that this editor has no way
   *  to represent yet. Without this, saving silently deletes it. */
  existingSchema?: string,
): string {
  const effectiveAxes = axes.length > 0 ? axes : DEFAULT_STARTER_AXES;

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
  const dimension_fusion: Record<string, { form: number; vision: number }> = {};
  const concern_labels: Record<string, string> = {};
  const axis_codes: Record<string, { threshold: number; low: string; high: string }> = {};
  const field_mapping: Record<string, { form?: string; vision?: string }> = {};

  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    concern_labels[key] = a.concernLabel || defaultConcernLabel(key);

    if (a.inputComposition === 'weighted_blend') {
      const fw = a.formWeight ?? 50;
      dimension_fusion[key] = { form: fw / 100, vision: (100 - fw) / 100 };
      const mapping: { form?: string; vision?: string } = {};
      if (a.formSource?.fieldCode) mapping.form = a.formSource.fieldCode;
      if (a.visionSource?.fieldCode) mapping.vision = a.visionSource.fieldCode;
      if (Object.keys(mapping).length > 0) field_mapping[key] = mapping;
    } else if (a.source?.fieldCode) {
      // single_source: no dimension_fusion entry needed — 100% one side is
      // already the engine's default when the other side is never sent.
      field_mapping[key] = a.source.origin === 'form' ? { form: a.source.fieldCode } : { vision: a.source.fieldCode };
    }

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

  const model: JDMDecisionModel = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights: mergeOwned(base.dimension_weights, dimension_weights),
    dimension_fusion: mergeOwned(base.dimension_fusion, dimension_fusion),
    concern_labels: mergeOwned(base.concern_labels, concern_labels),
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands),
  };
  const mergedAxisCodes = mergeOwned(base.axis_codes, axis_codes);
  if (Object.keys(mergedAxisCodes).length > 0) model.axis_codes = mergedAxisCodes;
  else delete model.axis_codes;
  const mergedFieldMapping = mergeOwned(base.field_mapping, field_mapping);
  if (Object.keys(mergedFieldMapping).length > 0) model.field_mapping = mergedFieldMapping;
  else delete model.field_mapping;
  return JSON.stringify(model, null, 2);
}

export interface DecompiledGrading {
  axes: VisualAxisConfig[];
  profileConfig: VisualProfileMappingConfig;
  scoreRangeBands: VisualBand[];
  severityBands: VisualBand[];
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
    axes: DEFAULT_STARTER_AXES.map((a) => ({ ...a })),
    profileConfig: DEFAULT_STARTER_PROFILES,
    scoreRangeBands: DEFAULT_SCORE_RANGE_BANDS.map((b) => ({ ...b })),
    severityBands: DEFAULT_SEVERITY_BANDS.map((b) => ({ ...b })),
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
  const fusion: Record<string, { form: number; vision: number }> = parsed.dimension_fusion || {};
  const concernLabels: Record<string, string> = parsed.concern_labels || {};
  const axisCodes: Record<string, { threshold?: number; low?: string; high?: string }> =
    parsed.axis_codes || {};
  const fieldMapping: Record<string, { form?: string; vision?: string }> = parsed.field_mapping || {};

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
      ...Object.keys(fieldMapping),
      ...salvagedKeys,
    ]),
  );

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
    const df = fusion[key];
    const ac = axisCodes[key.toLowerCase()];
    const fm = fieldMapping[key];
    const bandNode = bandNodeFor(key);

    let bands: ThresholdBand[] | undefined;
    if (bandNode) {
      bands = (bandNode.rules || [])
        .map((r: Record<string, string>, ri: number) => {
          const range = parseRange(r.in);
          if (!range) return null;
          return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r.out) };
        })
        .filter(Boolean) as ThresholdBand[];
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === 'number' ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || '' },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || '' },
      ];
    }

    const inputComposition: 'single_source' | 'weighted_blend' | undefined = df
      ? 'weighted_blend'
      : fm
        ? 'single_source'
        : undefined;

    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      dimensionKey: key,
      weight: typeof weights[key] === 'number' ? weights[key] : 1,
      concernLabel: concernLabels[key] || defaultConcernLabel(key),
      inputComposition,
      source: !df ? makeSource(fm?.form, 'form') || makeSource(fm?.vision, 'vision') : undefined,
      formSource: df ? makeSource(fm?.form, 'form') : undefined,
      visionSource: df ? makeSource(fm?.vision, 'vision') : undefined,
      formWeight: df ? Math.round(df.form * 100) : 100,
      visionWeight: df ? Math.round(df.vision * 100) : 0,
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

  let profileConfig: VisualProfileMappingConfig = DEFAULT_STARTER_PROFILES;
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

    profileConfig = { strategy, profiles: profiles.length ? profiles : DEFAULT_STARTER_PROFILES.profiles };
  }

  return {
    axes: axes.length ? axes : fallback.axes,
    profileConfig,
    scoreRangeBands: bandsFromSchema(parsed.score_range_bands, DEFAULT_SCORE_RANGE_BANDS, 'sr'),
    severityBands: bandsFromSchema(parsed.severity_bands, DEFAULT_SEVERITY_BANDS, 'sv'),
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
