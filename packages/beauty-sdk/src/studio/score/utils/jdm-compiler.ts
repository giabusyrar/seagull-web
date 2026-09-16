import type {
  VisualAxisConfig,
  VisualBand,
  VisualProfileEntry,
  VisualProfileMappingConfig,
  ProfileStrategyType,
  JDMDecisionModel,
  JDMNode,
  JDMEdge,
} from '../types';
import { DEFAULT_SCORE_RANGE_BANDS, DEFAULT_SEVERITY_BANDS } from '../types';

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
): string {
  const effectiveAxes = axes.length > 0 ? axes : DEFAULT_STARTER_AXES;

  const nodes: JDMNode[] = [
    { id: 'input_node', name: 'Input', type: 'inputNode', position: { x: 40, y: 40 } },
  ];
  const edges: JDMEdge[] = [];

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
  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    concern_labels[key] = a.concernLabel || defaultConcernLabel(key);
    const fw = a.formWeight ?? 100;
    dimension_fusion[key] = { form: fw / 100, vision: (100 - fw) / 100 };
  }

  // Bipolar (Baumann) codes — only for dimensions where both letters are set.
  // Omitted entirely when no dimension uses it, so existing rulesets that rely
  // on the Score-Range initials produce an unchanged schema.
  const axis_codes: Record<string, { threshold: number; low: string; high: string }> = {};
  for (const a of effectiveAxes) {
    const low = (a.axisCodeLow || '').trim();
    const high = (a.axisCodeHigh || '').trim();
    if (low && high) {
      axis_codes[a.dimensionKey.toLowerCase()] = {
        threshold: Math.max(0, Math.min(100, Number(a.axisCodeThreshold ?? 50))),
        low,
        high,
      };
    }
  }

  const model: JDMDecisionModel = {
    nodes,
    edges,
    dimension_weights,
    dimension_fusion,
    concern_labels,
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands),
  };
  if (Object.keys(axis_codes).length > 0) model.axis_codes = axis_codes;
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

  const allNodes: any[] = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const nodeContents = allNodes.map((n) =>
    typeof n?.content === 'string' ? safeParse(n.content) : n?.content,
  );
  const hasProfileNode = nodeContents.some((c) =>
    (c?.outputs || []).some(
      (o: any) => typeof o?.field === 'string' && o.field.startsWith('skin_profile.'),
    ),
  );

  // Salvage dimension keys from an older schema that predates dimension_weights /
  // concern_labels: scan every decision-table column for tiers.<key> /
  // dimension_scores.<key> / axis_values.<KEY> field paths.
  const salvagedKeys = new Set<string>();
  for (const c of nodeContents) {
    for (const col of [...(c?.inputs || []), ...(c?.outputs || [])]) {
      const m = String(col?.field || '').match(
        /^(?:tiers|dimension_scores|axis_values)\.([a-z0-9_]+)/i,
      );
      if (m) salvagedKeys.add(m[1].toLowerCase());
    }
  }

  // Axes: prefer dimension_weights keys, then concern_labels, then axis_codes,
  // then keys salvaged from a legacy schema.
  const dimKeys = Object.keys(weights).length
    ? Object.keys(weights)
    : Object.keys(concernLabels).length
      ? Object.keys(concernLabels)
      : Object.keys(axisCodes).length
        ? Object.keys(axisCodes)
        : Array.from(salvagedKeys);

  const legacy =
    Object.keys(weights).length === 0 &&
    Object.keys(concernLabels).length === 0 &&
    !hasProfileNode;

  const axes: VisualAxisConfig[] = dimKeys.map((key, i) => {
    const df = fusion[key];
    const ac = axisCodes[key.toLowerCase()];
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
      formWeight: df ? Math.round(df.form * 100) : 100,
      visionWeight: df ? Math.round(df.vision * 100) : 0,
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
