'use client';

// src/score/components/ScoreManager.tsx
import { useState as useState6, useEffect as useEffect5, useCallback as useCallback2 } from "react";
import { Sliders as Sliders3, SlidersHorizontal, Play as Play2, FileText } from "lucide-react";
import { PageHeader, TabNav, ConfirmDialog, usePersistentState as usePersistentState2 } from "@gateway-experience/shared";

// src/core/scope.ts
var ALL_TENANTS = "*";
function tenantScopeQuery(brandId = ALL_TENANTS, applicationId = ALL_TENANTS) {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}
function withTenantScope(path, brandId, applicationId) {
  return `${path}${path.includes("?") ? "&" : "?"}${tenantScopeQuery(brandId, applicationId)}`;
}

// src/score/components/tabs/RulesetsTab.tsx
import React from "react";
import { Sliders, Pencil, Trash2, Play, Plus, Copy, Check } from "lucide-react";
import { StatusBadge, EmptyState, SearchFilterBar, Button } from "@gateway-experience/shared";
import { jsx, jsxs } from "react/jsx-runtime";
var filterSelect = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring";
var RulesetsTab = ({
  rulesets,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenEditModal,
  onSelectSimulatorRuleset,
  onDeleteRuleset
}) => {
  const [filterBrand, setFilterBrand] = React.useState("ALL");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [copiedId, setCopiedId] = React.useState(null);
  const copyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const filteredRulesets = rulesets.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
    const matchesBrand = filterBrand === "ALL" || r.brandId === filterBrand;
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });
  const uniqueBrands = Array.from(new Set(rulesets.map((r) => r.brandId).filter(Boolean)));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(
      SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search grading models by title, code, or brand\u2026",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        customFilterContent: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filterBrand,
              onChange: (e) => setFilterBrand(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ jsx("option", { value: "ALL", children: "All brands" }),
                /* @__PURE__ */ jsx("option", { value: "*", children: "* (universal)" }),
                uniqueBrands.filter((b) => b !== "*").map((b) => /* @__PURE__ */ jsx("option", { value: b, children: b }, b))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ jsx("option", { value: "ALL", children: "All statuses" }),
                /* @__PURE__ */ jsx("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "DRAFT", children: "Draft" }),
                /* @__PURE__ */ jsx("option", { value: "INACTIVE", children: "Inactive" }),
                /* @__PURE__ */ jsx("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          )
        ] })
      }
    ),
    filteredRulesets.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsx(Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading models yet",
        description: "A grading model turns 0\u2013100 dimension scores into Level 1\u20135 severity and a skin profile.",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        className: "py-12 rounded-lg border border-border bg-card"
      }
    ) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredRulesets.map((ruleset) => {
      let dimCount = 0;
      try {
        const parsed = JSON.parse(ruleset.schema);
        const dimKeys = parsed.dimension_weights || parsed.concern_labels || parsed.axis_codes || {};
        dimCount = Object.keys(dimKeys).length;
      } catch {
      }
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-lg border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-beak/50",
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-beak bg-beak/10 px-2 py-0.5 rounded border border-beak/30", children: ruleset.code }),
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                  "v",
                  ruleset.version
                ] }),
                /* @__PURE__ */ jsx(StatusBadge, { status: ruleset.status })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground mt-1.5", children: ruleset.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed", children: ruleset.description || "Severity bands and skin-profile mapping for this brand." }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-[11px] text-muted-foreground mt-3", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "Brand ",
                  /* @__PURE__ */ jsx("span", { className: "text-foreground", children: ruleset.brandId })
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "App ",
                  /* @__PURE__ */ jsx("span", { className: "text-foreground", children: ruleset.applicationId })
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-foreground", children: dimCount }),
                  " dimensions"
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => copyId(ruleset.id),
                  title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                  className: "mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                  children: [
                    copiedId === ruleset.id ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate max-w-[16rem]", children: copiedId === ruleset.id ? "ID copied" : `ID ${ruleset.id}` })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 mt-3 border-t border-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onOpenEditModal(ruleset),
                    leftIcon: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onSelectSimulatorRuleset(ruleset),
                    leftIcon: /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5" }),
                    children: "Simulate"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => onDeleteRuleset(ruleset.id, ruleset.code),
                  className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors",
                  title: "Delete grading model",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ]
        },
        ruleset.id
      );
    }) })
  ] });
};

// src/score/components/tabs/BlendingTab.tsx
import { useState as useState2, useEffect as useEffect2 } from "react";
import { Sliders as Sliders2, Check as Check2, AlertTriangle, Trash2 as Trash23, Plus as Plus3 } from "lucide-react";
import { EmptyState as EmptyState2, Button as Button2, InfoTooltip as InfoTooltip2 } from "@gateway-experience/shared";

// src/score/types.ts
var DEFAULT_SCORE_RANGE_BANDS = [
  { id: "sr1", max: 40, label: "Perlu Perhatian Khusus" },
  { id: "sr2", max: 60, label: "Sedang" },
  { id: "sr3", max: 100, label: "Optimal" }
];
var DEFAULT_SEVERITY_BANDS = [
  { id: "sv1", max: 20, label: "Sangat Parah" },
  { id: "sv2", max: 40, label: "Parah" },
  { id: "sv3", max: 60, label: "Sedang" },
  { id: "sv4", max: 80, label: "Ringan" },
  { id: "sv5", max: 100, label: "Sehat" }
];
var KNOWN_VISION_FIELDS = [
  { code: "data.inference_result.results.skin_scoring.Darkspot", label: "Darkspot", description: "results.skin_scoring.Darkspot \u2014 feeds Pigmentation." },
  { code: "data.inference_result.results.skin_scoring.Wrinkle", label: "Wrinkle", description: "results.skin_scoring.Wrinkle \u2014 feeds Aging." },
  { code: "data.inference_result.results.skin_scoring.Pores", label: "Pores", description: "results.skin_scoring.Pores \u2014 feeds Pore Severity." },
  { code: "age_over_30", label: "Age > 30 (from DOB)", description: "Derived from date_of_birth on the identity questionnaire, not a Q1-Q6 question. 0 if <=30, 100 if >30." }
];

// src/score/utils/jdm-compiler.ts
var visionFieldLabel = (code) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;
var makeSource = (fieldCode, origin) => fieldCode ? {
  origin,
  fieldCode,
  label: origin === "vision" ? visionFieldLabel(fieldCode) : fieldCode
} : void 0;
var DEFAULT_CONCERN_LABELS = {
  sebum: "Minyak Berlebih",
  oiliness: "Minyak Berlebih",
  sensitivity: "Kulit Sensitif",
  pigmentation: "Noda Gelap",
  dark_spot: "Noda Gelap",
  aging: "Garis Halus & Kerutan",
  hydration: "Kulit Kering",
  acne: "Jerawat",
  pores: "Pori Besar",
  barrier: "Barier Kulit Rusak"
};
function defaultConcernLabel(dimKey) {
  const k = (dimKey || "").toLowerCase();
  if (DEFAULT_CONCERN_LABELS[k]) return DEFAULT_CONCERN_LABELS[k];
  return k.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
var DEFAULT_STARTER_AXES = [
  {
    id: "axis_sebum",
    axisCode: "SEBUM",
    name: "Sebum Secretion",
    dimensionKey: "sebum",
    weight: 1,
    concernLabel: "Minyak Berlebih"
  }
];
var DEFAULT_STARTER_PROFILES = {
  strategy: "total_score",
  profiles: [
    {
      id: "prof_1",
      minScore: 61,
      maxScore: 100,
      code: "OPTIMAL",
      title: "Kulit Optimal",
      category: "Optimal",
      summary: "Kondisi kulit seimbang, tidak ada keluhan menonjol."
    },
    {
      id: "prof_2",
      minScore: 41,
      maxScore: 60,
      code: "MODERATE",
      title: "Perlu Perawatan Aktif",
      category: "Sedang",
      summary: "Ada keluhan sedang yang perlu perawatan aktif."
    },
    {
      id: "prof_3",
      minScore: 0,
      maxScore: 40,
      code: "CONCERN",
      title: "Perlu Perhatian Khusus",
      category: "Perlu Perhatian Khusus",
      summary: "Keluhan menonjol, perlu perhatian dan rutinitas terarah."
    }
  ]
};
var bandsToSchema = (bands) => bands.map((b) => ({ max: Math.max(0, Math.min(100, Number(b.max) || 0)), label: b.label || "" }));
var cleanVal = (v) => `"${(v || "").replace(/"/g, "")}"`;
var rangeCell = (min, max) => `[${Math.max(0, Math.min(100, min ?? 0))}..${Math.max(0, Math.min(100, max ?? 100))}]`;
function compileVisualToJDM(axes, profileConfig = DEFAULT_STARTER_PROFILES, scoreRangeBands = DEFAULT_SCORE_RANGE_BANDS, severityBands = DEFAULT_SEVERITY_BANDS, existingSchema) {
  const effectiveAxes = axes.length > 0 ? axes : DEFAULT_STARTER_AXES;
  const nodes = [
    { id: "input_node", name: "Input", type: "inputNode", position: { x: 40, y: 40 } }
  ];
  const edges = [];
  const ownedNodeIds = /* @__PURE__ */ new Set(["input_node", "profile", ...effectiveAxes.map((a) => `${a.dimensionKey.toLowerCase()}-band`)]);
  const preservedNodes = [];
  if (existingSchema) {
    try {
      const prev = JSON.parse(existingSchema);
      for (const n of prev?.nodes || []) {
        if (!ownedNodeIds.has(n?.id)) preservedNodes.push(n);
      }
    } catch {
    }
  }
  const profileOutputs = [
    { id: "code", field: "skin_profile.code", label: "Code" },
    { id: "name", field: "skin_profile.name", label: "Name" },
    { id: "cat", field: "skin_profile.category", label: "Category" },
    { id: "desc", field: "skin_profile.description", label: "Summary" }
  ];
  const profileInputs = [];
  const profileRules = [];
  const strategy = profileConfig.strategy;
  if (strategy === "total_score") {
    profileInputs.push({ id: "in", field: "total_score", label: "Overall score (0-100, 100 = optimal)" });
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        in: rangeCell(p.minScore, p.maxScore),
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      });
    }
  } else if (strategy === "combination_matrix") {
    effectiveAxes.forEach((a) => {
      const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
      profileInputs.push({ id: `c_${axisCode.toLowerCase()}`, field: `axis_values.${axisCode}`, label: `${a.name || axisCode} code` });
    });
    for (const p of profileConfig.profiles || []) {
      const rule = {
        _id: p.id,
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      };
      effectiveAxes.forEach((a) => {
        const axisCode = (a.axisCode || a.dimensionKey).toUpperCase();
        const v = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[axisCode] || "";
        rule[`c_${axisCode.toLowerCase()}`] = v ? cleanVal(v) : "-";
      });
      profileRules.push(rule);
    }
  } else {
    profileInputs.push(
      { id: "pc_dim", field: "primary_concern.dimension", label: "Dominant dimension" },
      { id: "pc_sev", field: "primary_concern.severity", label: "Severity Level" }
    );
    for (const p of profileConfig.profiles || []) {
      profileRules.push({
        _id: p.id,
        pc_dim: p.primaryDimension ? cleanVal(p.primaryDimension) : "-",
        pc_sev: p.severityLevel ? cleanVal(p.severityLevel) : "-",
        code: cleanVal(p.code),
        name: cleanVal(p.title),
        cat: cleanVal(p.category),
        desc: cleanVal(p.summary)
      });
    }
  }
  nodes.push({
    id: "profile",
    name: "Skin Profile",
    type: "decisionTableNode",
    position: { x: 360, y: 40 },
    content: { hitPolicy: "first", inputs: profileInputs, outputs: profileOutputs, rules: profileRules }
  });
  edges.push({ id: "e_profile", sourceId: "input_node", targetId: "profile" });
  const dimension_weights = {};
  const dimension_fusion = {};
  const concern_labels = {};
  const axis_codes = {};
  const field_mapping = {};
  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    concern_labels[key] = a.concernLabel || defaultConcernLabel(key);
    if (a.inputComposition === "weighted_blend") {
      const fw = a.formWeight ?? 50;
      dimension_fusion[key] = { form: fw / 100, vision: (100 - fw) / 100 };
      const mapping = {};
      if (a.formSource?.fieldCode) mapping.form = a.formSource.fieldCode;
      if (a.visionSource?.fieldCode) mapping.vision = a.visionSource.fieldCode;
      if (Object.keys(mapping).length > 0) field_mapping[key] = mapping;
    } else if (a.source?.fieldCode) {
      field_mapping[key] = a.source.origin === "form" ? { form: a.source.fieldCode } : { vision: a.source.fieldCode };
    }
    const bands = (a.bands || []).slice().sort((x, y) => x.min - y.min);
    if (bands.length === 2) {
      const [lo, hi] = bands;
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, hi.min)),
        low: lo.letter || "",
        high: hi.letter || ""
      };
    } else if (bands.length >= 3) {
      nodes.push({
        id: `${key}-band`,
        name: `${a.name || key} bands`,
        type: "decisionTableNode",
        content: {
          hitPolicy: "first",
          inputs: [{ id: "in", field: `dimension_scores.${key}`, label: `${a.name || key} Health Score` }],
          outputs: [{ id: "out", field: `axis_values.${key.toUpperCase()}`, label: `${a.name || key} Axis` }],
          rules: bands.slice().reverse().map((b) => ({ in: rangeCell(b.min, b.max), out: cleanVal(b.letter) }))
        }
      });
    } else if ((a.axisCodeLow || "").trim() && (a.axisCodeHigh || "").trim()) {
      axis_codes[key] = {
        threshold: Math.max(0, Math.min(100, Number(a.axisCodeThreshold ?? 50))),
        low: (a.axisCodeLow || "").trim(),
        high: (a.axisCodeHigh || "").trim()
      };
    }
  }
  let base = {};
  if (existingSchema) {
    try {
      base = JSON.parse(existingSchema) || {};
    } catch {
      base = {};
    }
  }
  const ownedDimKeys = new Set(effectiveAxes.map((a) => a.dimensionKey.toLowerCase()));
  const mergeOwned = (baseMap, fresh) => {
    const merged = { ...baseMap || {} };
    for (const k of ownedDimKeys) delete merged[k];
    return { ...merged, ...fresh };
  };
  const model = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights: mergeOwned(base.dimension_weights, dimension_weights),
    dimension_fusion: mergeOwned(base.dimension_fusion, dimension_fusion),
    concern_labels: mergeOwned(base.concern_labels, concern_labels),
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands)
  };
  const mergedAxisCodes = mergeOwned(base.axis_codes, axis_codes);
  if (Object.keys(mergedAxisCodes).length > 0) model.axis_codes = mergedAxisCodes;
  else delete model.axis_codes;
  const mergedFieldMapping = mergeOwned(base.field_mapping, field_mapping);
  if (Object.keys(mergedFieldMapping).length > 0) model.field_mapping = mergedFieldMapping;
  else delete model.field_mapping;
  return JSON.stringify(model, null, 2);
}
var bandsFromSchema = (raw, fallback, prefix) => {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((b) => ({ ...b }));
  return raw.map((b, i) => ({
    id: `${prefix}${i + 1}`,
    max: Number(b?.max) || 0,
    label: String(b?.label ?? "")
  }));
};
function decompileJDMToVisualComponents(schemaStr) {
  const fallback = {
    axes: DEFAULT_STARTER_AXES.map((a) => ({ ...a })),
    profileConfig: DEFAULT_STARTER_PROFILES,
    scoreRangeBands: DEFAULT_SCORE_RANGE_BANDS.map((b) => ({ ...b })),
    severityBands: DEFAULT_SEVERITY_BANDS.map((b) => ({ ...b })),
    legacy: false
  };
  if (!schemaStr || !schemaStr.trim()) return fallback;
  let parsed;
  try {
    parsed = JSON.parse(schemaStr);
  } catch {
    return fallback;
  }
  const clean = (v) => typeof v === "string" ? v.replace(/["']/g, "").trim() : "";
  const parseRange = (s) => {
    const m = String(s ?? "").match(/(-?\d+)\s*\.\.\s*(-?\d+)/);
    return m ? { min: Number(m[1]), max: Number(m[2]) } : null;
  };
  const weights = parsed.dimension_weights || {};
  const fusion = parsed.dimension_fusion || {};
  const concernLabels = parsed.concern_labels || {};
  const axisCodes = parsed.axis_codes || {};
  const fieldMapping = parsed.field_mapping || {};
  const allNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
  const nodeContents = allNodes.map(
    (n) => typeof n?.content === "string" ? safeParse(n.content) : n?.content
  );
  const hasProfileNode = nodeContents.some(
    (c) => (c?.outputs || []).some(
      (o) => typeof o?.field === "string" && o.field.startsWith("skin_profile.")
    )
  );
  const salvagedKeys = /* @__PURE__ */ new Set();
  for (const c of nodeContents) {
    for (const col of c?.outputs || []) {
      const m = String(col?.field || "").match(/^(?:tiers|axis_values)\.([a-z0-9_]+)/i);
      if (m) salvagedKeys.add(m[1].toLowerCase());
    }
  }
  const dimKeys = Array.from(
    /* @__PURE__ */ new Set([
      ...Object.keys(weights),
      ...Object.keys(concernLabels),
      ...Object.keys(axisCodes),
      ...Object.keys(fieldMapping),
      ...salvagedKeys
    ])
  );
  const legacy = Object.keys(weights).length === 0 && Object.keys(concernLabels).length === 0 && !hasProfileNode;
  const bandNodeFor = (key) => nodeContents.find((c) => {
    const ins = c?.inputs || [];
    const outs = c?.outputs || [];
    return ins.length === 1 && ins[0]?.field === `dimension_scores.${key}` && outs.length === 1 && outs[0]?.field === `axis_values.${key.toUpperCase()}`;
  });
  const axes = dimKeys.map((key, i) => {
    const df = fusion[key];
    const ac = axisCodes[key.toLowerCase()];
    const fm = fieldMapping[key];
    const bandNode = bandNodeFor(key);
    let bands;
    if (bandNode) {
      bands = (bandNode.rules || []).map((r, ri) => {
        const range = parseRange(r.in);
        if (!range) return null;
        return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r.out) };
      }).filter(Boolean);
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === "number" ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || "" },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || "" }
      ];
    }
    const inputComposition = df ? "weighted_blend" : fm ? "single_source" : void 0;
    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      dimensionKey: key,
      weight: typeof weights[key] === "number" ? weights[key] : 1,
      concernLabel: concernLabels[key] || defaultConcernLabel(key),
      inputComposition,
      source: !df ? makeSource(fm?.form, "form") || makeSource(fm?.vision, "vision") : void 0,
      formSource: df ? makeSource(fm?.form, "form") : void 0,
      visionSource: df ? makeSource(fm?.vision, "vision") : void 0,
      formWeight: df ? Math.round(df.form * 100) : 100,
      visionWeight: df ? Math.round(df.vision * 100) : 0,
      bands,
      ...ac && (ac.low || ac.high) ? {
        axisCodeLow: ac.low || "",
        axisCodeHigh: ac.high || "",
        axisCodeThreshold: typeof ac.threshold === "number" ? ac.threshold : 50
      } : {}
    };
  });
  const profileNode = allNodes.find((n, idx) => {
    if (n?.type !== "decisionTableNode") return false;
    const c = nodeContents[idx];
    return (c?.outputs || []).some((o) => typeof o?.field === "string" && o.field.startsWith("skin_profile."));
  });
  let profileConfig = DEFAULT_STARTER_PROFILES;
  if (profileNode) {
    const c = typeof profileNode.content === "string" ? safeParse(profileNode.content) : profileNode.content;
    const inputs = c?.inputs || [];
    const outputs = c?.outputs || [];
    const rules = (c?.rules || []).filter((r) => r._id !== "p_rule_fallback");
    const outId = (test) => outputs.find((o) => typeof o?.field === "string" && test(o.field))?.id;
    const codeId = outId((f) => f === "skin_profile.code") ?? "code";
    const nameId = outId((f) => f === "skin_profile.name") ?? "name";
    const catId = outId((f) => f === "skin_profile.category") ?? "cat";
    const descId = outId((f) => f === "skin_profile.description") ?? "desc";
    let strategy = "total_score";
    if (inputs.some((i) => i.field === "total_score")) strategy = "total_score";
    else if (inputs.some((i) => String(i.field || "").startsWith("axis_values."))) strategy = "combination_matrix";
    else if (inputs.some((i) => String(i.field || "").startsWith("primary_concern."))) strategy = "primary_concern";
    const totalInId = inputs.find((i) => i.field === "total_score")?.id ?? "in";
    const pcDimId = inputs.find((i) => i.field === "primary_concern.dimension")?.id ?? "pc_dim";
    const pcSevId = inputs.find((i) => i.field === "primary_concern.severity")?.id ?? "pc_sev";
    const profiles = rules.map((r, i) => {
      const entry = {
        id: r._id || `prof_${i + 1}`,
        code: clean(r[codeId]) || `PROFILE_${i + 1}`,
        title: clean(r[nameId]) || `Profile ${i + 1}`,
        category: clean(r[catId]) || "General",
        summary: clean(r[descId]) || ""
      };
      if (strategy === "total_score") {
        const rng = parseRange(r[totalInId]) ?? { min: 0, max: 100 };
        entry.minScore = rng.min;
        entry.maxScore = rng.max;
      } else if (strategy === "combination_matrix") {
        const dimCodes = {};
        inputs.forEach((inp) => {
          const axisCode = String(inp.field || "").replace("axis_values.", "").trim();
          const v = clean(r[inp.id]);
          if (v && v !== "-") dimCodes[axisCode.toLowerCase()] = v;
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
    scoreRangeBands: bandsFromSchema(parsed.score_range_bands, DEFAULT_SCORE_RANGE_BANDS, "sr"),
    severityBands: bandsFromSchema(parsed.severity_bands, DEFAULT_SEVERITY_BANDS, "sv"),
    legacy
  };
}
function safeParse(s) {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return null;
  }
}
function decompileJDMToVisual(schemaStr) {
  return decompileJDMToVisualComponents(schemaStr).axes;
}

// src/score/components/reusable/ClinicalAxisCard.tsx
import { useState, useEffect, useMemo } from "react";
import { Trash2 as Trash22, ChevronRight, ChevronDown } from "lucide-react";
import { DimensionSelect, InfoTooltip } from "@gateway-experience/shared";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function useVisionFields() {
  const [conditions, setConditions] = useState([]);
  useEffect(() => {
    fetch("/api/skin-conditions").then((res) => res.json()).then((data) => {
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setConditions(list);
    }).catch(() => {
    });
  }, []);
  return useMemo(
    () => conditions.flatMap(
      (c) => (c.visionCapabilities || []).map((cap) => ({ code: cap, label: `${c.name} (${cap})` }))
    ),
    [conditions]
  );
}
var fieldCls = "w-full h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var SourcePicker = ({ label, origin, onOriginChange, value, onChange, disabled }) => {
  const visionFields = useVisionFields();
  return /* @__PURE__ */ jsxs2("div", { children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between mb-1", children: [
      /* @__PURE__ */ jsx2("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: label }),
      onOriginChange && /* @__PURE__ */ jsx2("div", { className: "flex gap-1", children: ["form", "vision"].map((o) => /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          disabled,
          onClick: () => onOriginChange(o),
          className: `px-1.5 py-0.5 rounded text-[9px] font-semibold border ${origin === o ? "border-beak bg-beak/10 text-beak" : "border-border text-muted-foreground"}`,
          children: o
        },
        o
      )) })
    ] }),
    origin === "form" ? /* @__PURE__ */ jsx2(
      DimensionSelect,
      {
        value: value?.fieldCode || "",
        disabled,
        onChange: (code, meta) => onChange(code ? { origin: "form", fieldCode: code, label: meta?.name || code } : void 0),
        label: ""
      }
    ) : /* @__PURE__ */ jsxs2(
      "select",
      {
        disabled,
        value: value?.fieldCode || "",
        onChange: (e) => {
          const code = e.target.value;
          const meta = visionFields.find((f) => f.code === code);
          onChange(code ? { origin: "vision", fieldCode: code, label: meta?.label || code } : void 0);
        },
        className: fieldCls,
        children: [
          /* @__PURE__ */ jsx2("option", { value: "", children: "\u2014 pilih field CV (dari ref_skin_conditions) \u2014" }),
          visionFields.map((f) => /* @__PURE__ */ jsx2("option", { value: f.code, children: f.label }, f.code))
        ]
      }
    )
  ] });
};
var ClinicalDimensionCard = ({
  axis,
  index,
  onUpdate,
  onDelete,
  canDelete = true,
  disabled = false,
  defaultOpen = false,
  siblingWeightTotal
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const share = typeof siblingWeightTotal === "number" && siblingWeightTotal > 0 ? Math.round(axis.weight / siblingWeightTotal * 100) : null;
  const concern = axis.concernLabel || defaultConcernLabel(axis.dimensionKey);
  const handleDimensionChange = (dimKey, dimMeta) => {
    const wasDefault = !axis.concernLabel || axis.concernLabel === defaultConcernLabel(axis.dimensionKey);
    onUpdate({
      ...axis,
      dimensionKey: dimKey,
      axisCode: dimKey.toUpperCase(),
      name: dimMeta?.name || dimKey.toUpperCase(),
      concernLabel: wasDefault ? defaultConcernLabel(dimKey) : axis.concernLabel
    });
  };
  return /* @__PURE__ */ jsxs2("div", { className: "rounded-lg border border-border bg-card", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ jsxs2(
        "button",
        {
          type: "button",
          onClick: () => setOpen((v) => !v),
          className: "flex flex-1 items-center gap-2 text-left",
          children: [
            open ? /* @__PURE__ */ jsx2(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsx2(ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsx2("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            /* @__PURE__ */ jsx2("span", { className: "text-[11px] text-muted-foreground", children: share !== null ? `\u2248${share}% of overall` : `weight ${axis.weight}` }),
            /* @__PURE__ */ jsxs2("span", { className: "text-[11px] text-muted-foreground", children: [
              "\xB7 ",
              concern
            ] })
          ]
        }
      ),
      canDelete && /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          disabled,
          onClick: onDelete,
          className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors disabled:opacity-30",
          title: "Remove dimension",
          children: /* @__PURE__ */ jsx2(Trash22, { className: "h-4 w-4" })
        }
      )
    ] }),
    open && /* @__PURE__ */ jsxs2("div", { className: "border-t border-border p-3 space-y-3", children: [
      /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx2(
          DimensionSelect,
          {
            value: axis.dimensionKey,
            disabled,
            onChange: handleDimensionChange,
            label: "Dimension"
          }
        ),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ jsx2("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Weight" }),
            /* @__PURE__ */ jsx2(
              InfoTooltip,
              {
                content: share !== null ? `Relative to the other dimensions \u2014 counts as \u2248${share}% of the overall score.` : "Relative to the other dimensions.",
                label: "About weight",
                iconClassName: "h-3 w-3"
              }
            )
          ] }),
          /* @__PURE__ */ jsx2(
            "input",
            {
              type: "number",
              min: 0,
              step: 1,
              disabled,
              value: axis.weight,
              onChange: (e) => onUpdate({ ...axis, weight: Number(e.target.value) }),
              className: fieldCls
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsx2("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Concern label" }),
          /* @__PURE__ */ jsx2(
            InfoTooltip,
            {
              content: "Shown when this dimension is the customer\u2019s dominant concern.",
              label: "About concern label",
              iconClassName: "h-3 w-3"
            }
          )
        ] }),
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "text",
            disabled,
            value: axis.concernLabel ?? concern,
            onChange: (e) => onUpdate({ ...axis, concernLabel: e.target.value }),
            placeholder: defaultConcernLabel(axis.dimensionKey),
            className: fieldCls
          }
        )
      ] }),
      /* @__PURE__ */ jsx2("p", { className: "text-[10px] text-muted-foreground italic", children: "How this axis's number is computed (form/vision source, blend %) and turned into a letter (bands) is set in the Blending tab, not here." })
    ] })
  ] });
};
var ClinicalAxisCard = ClinicalDimensionCard;

// src/score/components/tabs/BlendingTab.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var fieldCls2 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var BlendingTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const [axes, setAxes] = useState2([]);
  const [profileConfig, setProfileConfig] = useState2(null);
  const [scoreRangeBands, setScoreRangeBands] = useState2(null);
  const [severityBands, setSeverityBands] = useState2(null);
  const [isSaving, setIsSaving] = useState2(false);
  const [saveSuccess, setSaveSuccess] = useState2(false);
  const [saveError, setSaveError] = useState2(null);
  useEffect2(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setAxes(decompiled.axes);
        setProfileConfig(decompiled.profileConfig);
        setScoreRangeBands(decompiled.scoreRangeBands);
        setSeverityBands(decompiled.severityBands);
        setSaveError(null);
      } catch (err) {
        setSaveError("Could not read this ruleset: " + (err instanceof Error ? err.message : "invalid schema"));
      }
    }
  }, [activeRuleset]);
  const updateAxis = (id, patch) => setAxes((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  const handleSave = async () => {
    if (!activeRuleset || !profileConfig || !scoreRangeBands || !severityBands) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, activeRuleset.schema);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        schema: updatedSchema
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3e3);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save blending weights");
    } finally {
      setIsSaving(false);
    }
  };
  if (!activeRuleset) {
    return /* @__PURE__ */ jsx3(
      EmptyState2,
      {
        icon: /* @__PURE__ */ jsx3(Sliders2, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading model selected",
        description: "Create or pick a grading model to set its blending weights.",
        className: "py-16 rounded-lg border border-border bg-card"
      }
    );
  }
  return /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs3("div", { className: "rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx3("span", { className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: "Grading model" }),
        /* @__PURE__ */ jsx3(
          "select",
          {
            value: activeRuleset.id,
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ jsxs3("option", { value: r.id, children: [
              r.title,
              " (",
              r.code,
              " v",
              r.version,
              ")"
            ] }, r.id))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 shrink-0", children: [
        saveSuccess && /* @__PURE__ */ jsxs3("span", { className: "text-xs text-beak flex items-center gap-1", children: [
          /* @__PURE__ */ jsx3(Check2, { className: "h-3.5 w-3.5" }),
          "Saved"
        ] }),
        /* @__PURE__ */ jsx3(Button2, { variant: "primary", size: "sm", onClick: handleSave, isLoading: isSaving, children: isSaving ? "Saving\u2026" : "Save blending" })
      ] })
    ] }),
    saveError && /* @__PURE__ */ jsxs3("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
      /* @__PURE__ */ jsx3(AlertTriangle, { className: "h-4 w-4 shrink-0" }),
      /* @__PURE__ */ jsx3("span", { children: saveError })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "rounded-lg border border-border bg-card p-4 space-y-1", children: [
      /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx3("h3", { className: "text-sm font-bold text-foreground", children: "Per-dimension blend" }),
        /* @__PURE__ */ jsx3(
          InfoTooltip2,
          {
            content: "For each dimension, how much of its score comes from the questionnaire (form) vs. vision (camera analysis). Only applies once vision_signals is sent for that dimension \u2014 a form-only dimension with no matching vision_signals key ignores this and stays 100% form regardless of the slider.",
            label: "About blending"
          }
        )
      ] }),
      /* @__PURE__ */ jsx3("p", { className: "text-[11px] text-muted-foreground", children: "e.g. set Sebum to 0% form / 100% vision to trust vision fully for that dimension." })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "rounded-lg border border-border bg-card divide-y divide-border", children: [
      axes.length === 0 && /* @__PURE__ */ jsx3("div", { className: "p-6 text-center text-xs text-muted-foreground italic", children: "This ruleset has no dimensions yet \u2014 add some in Skin Grading first." }),
      axes.map((axis) => {
        const formW = axis.formWeight ?? 50;
        const composition = axis.inputComposition || (axis.source ? "single_source" : axis.formSource || axis.visionSource ? "weighted_blend" : "single_source");
        const singleOrigin = axis.source?.origin || "form";
        const bands = axis.bands || [];
        const updateBand = (id, patch) => updateAxis(axis.id, { bands: bands.map((b) => b.id === id ? { ...b, ...patch } : b) });
        const addBand = () => updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: "" }] });
        const removeBand = (id) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });
        return /* @__PURE__ */ jsxs3("div", { className: "p-3.5 space-y-3", children: [
          /* @__PURE__ */ jsx3("span", { className: "text-sm font-semibold text-foreground block", children: axis.name || axis.dimensionKey.toUpperCase() }),
          /* @__PURE__ */ jsx3("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border w-fit", children: ["single_source", "weighted_blend"].map((c) => /* @__PURE__ */ jsx3(
            "button",
            {
              type: "button",
              onClick: () => updateAxis(axis.id, { inputComposition: c }),
              className: `px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${composition === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: c === "single_source" ? "Single source" : "Weighted blend"
            },
            c
          )) }),
          composition === "single_source" ? /* @__PURE__ */ jsx3(
            SourcePicker,
            {
              label: "Sumber",
              origin: singleOrigin,
              onOriginChange: (o) => updateAxis(axis.id, { source: axis.source ? { ...axis.source, origin: o, fieldCode: "" } : { origin: o, fieldCode: "", label: "" } }),
              value: axis.source,
              onChange: (source) => updateAxis(axis.id, { source })
            }
          ) : /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between text-[11px]", children: [
              /* @__PURE__ */ jsxs3("span", { className: "text-foreground", children: [
                "Form ",
                formW,
                "%"
              ] }),
              /* @__PURE__ */ jsxs3("span", { className: "text-muted-foreground", children: [
                "Vision ",
                100 - formW,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx3(
              "input",
              {
                type: "range",
                min: 0,
                max: 100,
                step: 5,
                value: formW,
                onChange: (e) => updateAxis(axis.id, { formWeight: Number(e.target.value) }),
                className: "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]"
              }
            ),
            /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsx3(SourcePicker, { label: "Form source", origin: "form", value: axis.formSource, onChange: (source) => updateAxis(axis.id, { formSource: source }) }),
              /* @__PURE__ */ jsx3(SourcePicker, { label: "Vision source", origin: "vision", value: axis.visionSource, onChange: (source) => updateAxis(axis.id, { visionSource: source }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "pt-2 border-t border-border space-y-1.5", children: [
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx3("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: "Bands (axis & threshold)" }),
              /* @__PURE__ */ jsx3(
                InfoTooltip2,
                {
                  content: "Health-oriented (100 = optimal). Exactly 2 bands compiles to a simple threshold; 3+ compiles to a small rule table (e.g. Pore Severity's Smooth/Visible/Enlarged). Bands should be ordered and cover 0-100 with no gaps.",
                  label: "About bands"
                }
              )
            ] }),
            bands.map((b) => /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx3("input", { type: "number", min: 0, max: 100, value: b.min, onChange: (e) => updateBand(b.id, { min: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ jsx3("span", { className: "text-muted-foreground text-[10px]", children: "\u2013" }),
              /* @__PURE__ */ jsx3("input", { type: "number", min: 0, max: 100, value: b.max, onChange: (e) => updateBand(b.id, { max: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ jsx3("span", { className: "text-muted-foreground text-[10px]", children: "\u2192" }),
              /* @__PURE__ */ jsx3("input", { type: "text", maxLength: 12, value: b.letter, onChange: (e) => updateBand(b.id, { letter: e.target.value.toUpperCase() }), placeholder: "D", className: fieldCls2 + " flex-1 min-w-0 text-center font-bold text-beak" }),
              /* @__PURE__ */ jsx3("button", { type: "button", onClick: () => removeBand(b.id), className: "p-1 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsx3(Trash23, { className: "h-3.5 w-3.5" }) })
            ] }, b.id)),
            /* @__PURE__ */ jsxs3("button", { type: "button", onClick: addBand, className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded", children: [
              /* @__PURE__ */ jsx3(Plus3, { className: "h-3 w-3" }),
              "Add band"
            ] })
          ] })
        ] }, axis.id);
      })
    ] })
  ] });
};

// src/score/components/tabs/ScoreSimulatorTab.tsx
import { useState as useState3, useEffect as useEffect3, useMemo as useMemo2, useCallback } from "react";
import { Copy as Copy2, Check as Check3 } from "lucide-react";
import { InfoTooltip as InfoTooltip3, usePersistentState } from "@gateway-experience/shared";

// src/form/api.ts
async function getSafetyFlags() {
  try {
    const res = await fetch(`/api/reference/conditions`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}

// src/score/components/tabs/ScoreSimulatorTab.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var card = "rounded-lg border border-border bg-card p-4";
var sliderCls = "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]";
var sourceLabel = {
  form: "Form",
  vision: "Vision",
  blend: "Blend",
  none: "No data"
};
var ScoreSimulatorTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const rulesetDims = useMemo2(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = /* @__PURE__ */ new Set([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {}),
        ...Object.keys(s.field_mapping || {})
      ]);
      for (const node of s.nodes || []) {
        if (node?.type !== "decisionTableNode") continue;
        const content = typeof node.content === "string" ? JSON.parse(node.content) : node.content;
        for (const input of content?.inputs || []) {
          const field = String(input?.field || "");
          if (field.startsWith("dimension_scores.")) {
            keys.add(field.slice("dimension_scores.".length));
          }
        }
      }
      return Array.from(keys);
    } catch {
      return [];
    }
  }, [activeRuleset]);
  const fieldMapping = useMemo2(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").field_mapping || {};
    } catch {
      return {};
    }
  }, [activeRuleset]);
  const ageAxisKeys = useMemo2(() => rulesetDims.filter((d) => fieldMapping[d]?.form === "age_over_30"), [rulesetDims, fieldMapping]);
  const formDims = useMemo2(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && (fieldMapping[d]?.form || !fieldMapping[d]?.vision)),
    [rulesetDims, fieldMapping, ageAxisKeys]
  );
  const visionDims = useMemo2(() => rulesetDims.filter((d) => fieldMapping[d]?.vision), [rulesetDims, fieldMapping]);
  const [questionnaireValues, setQuestionnaireValues] = usePersistentState(
    "xg.scoreEngine.simulator.questionnaireValues",
    {}
  );
  const [visionValues, setVisionValues] = usePersistentState(
    "xg.scoreEngine.simulator.visionValues",
    {}
  );
  const [respondentAge, setRespondentAge] = usePersistentState("xg.scoreEngine.simulator.respondentAge", 25);
  const rulesetSafetyFlags = useMemo2(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      if (Array.isArray(s.safety_flags)) {
        return s.safety_flags.map(
          (f) => typeof f === "string" ? f : f.key
        );
      }
      return [];
    } catch {
      return [];
    }
  }, [activeRuleset]);
  const formSurveyCode = useMemo2(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").form_survey_code || "";
    } catch {
      return "";
    }
  }, [activeRuleset]);
  const [surveySafetyFlags, setSurveySafetyFlags] = useState3([]);
  useEffect3(() => {
    if (!activeRuleset?.brandId || !activeRuleset?.applicationId) {
      setSurveySafetyFlags([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/core/form-engine/survey?brand_id=${encodeURIComponent(activeRuleset.brandId)}&application_id=${encodeURIComponent(activeRuleset.applicationId)}`
        );
        if (!res.ok) return;
        const allSurveys = await res.json();
        const surveys = formSurveyCode ? allSurveys.filter((s) => s.code === formSurveyCode) : allSurveys;
        const flags = /* @__PURE__ */ new Set();
        for (const survey of surveys || []) {
          if (!survey.schema) continue;
          try {
            const parsed = JSON.parse(survey.schema);
            for (const page of parsed.pages || []) {
              for (const el of page.elements || []) {
                for (const choice of el.choices || []) {
                  const conditionMap = typeof choice === "object" ? choice.condition_map || choice.conditionMap : null;
                  if (conditionMap) Object.keys(conditionMap).forEach((k) => flags.add(k));
                }
              }
            }
          } catch {
          }
        }
        if (!cancelled) setSurveySafetyFlags(Array.from(flags));
      } catch {
        if (!cancelled) setSurveySafetyFlags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRuleset?.brandId, activeRuleset?.applicationId, formSurveyCode]);
  const [catalogSafetyFlags, setCatalogSafetyFlags] = useState3([]);
  useEffect3(() => {
    getSafetyFlags().then((rows) => setCatalogSafetyFlags(rows.map((r) => r.code))).catch(() => setCatalogSafetyFlags([]));
  }, []);
  const allSafetyFlags = useMemo2(
    () => Array.from(/* @__PURE__ */ new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags]
  );
  const [conditionChoices, setConditionChoices] = usePersistentState(
    "xg.scoreEngine.simulator.conditions",
    {}
  );
  const selectedConditions = useMemo2(() => {
    const keys = allSafetyFlags.length > 0 ? allSafetyFlags : catalogSafetyFlags;
    const out = {};
    for (const k of keys) out[k] = conditionChoices[k] ?? false;
    return out;
  }, [allSafetyFlags, catalogSafetyFlags, conditionChoices]);
  const [simResponse, setSimResponse] = useState3(null);
  const [copiedReq, setCopiedReq] = useState3(false);
  const SIMULATE_PATH = "/core/score-engine/simulate";
  const formScores = useMemo2(() => {
    const out = {};
    for (const d of formDims) out[d] = questionnaireValues[d] ?? 50;
    return out;
  }, [formDims, questionnaireValues]);
  const visionScores = useMemo2(() => {
    const out = {};
    for (const d of visionDims) out[d] = visionValues[d] ?? 50;
    return out;
  }, [visionDims, visionValues]);
  const ageYears = ageAxisKeys.length > 0 ? respondentAge : void 0;
  const requestBody = useMemo2(
    () => JSON.stringify(
      {
        schema: activeRuleset?.schema ?? "",
        form_scores: formScores,
        vision_scores: visionScores,
        age_years: ageYears,
        customer_condition: selectedConditions
      },
      null,
      2
    ),
    [activeRuleset, formScores, visionScores, ageYears, selectedConditions]
  );
  const copyRequest = () => {
    navigator.clipboard?.writeText(requestBody);
    setCopiedReq(true);
    setTimeout(() => setCopiedReq(false), 1500);
  };
  const runSimulation = useCallback(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const res = await fetch(SIMULATE_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: activeRuleset.schema,
          form_scores: formScores,
          vision_scores: visionScores,
          age_years: ageYears,
          customer_condition: selectedConditions
        })
      });
      if (res.ok) setSimResponse(await res.json());
    } catch (err) {
      console.error("Simulation request failed", err);
    }
  }, [activeRuleset, formScores, visionScores, ageYears, selectedConditions]);
  useEffect3(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);
  const result = simResponse?.result;
  const dimensions = result?.dimensions || {};
  const skinProfile = result?.skin_profile;
  const subClassification = result?.sub_classification || {};
  const warnings = result?.warnings || [];
  const totalScore = Math.round(result?.total_score || 0);
  const profileCode = skinProfile?.code || "CUSTOM";
  const profileName = skinProfile?.name || "Answer to see a profile";
  return /* @__PURE__ */ jsxs4("div", { className: "flex flex-col lg:flex-row gap-5 items-start", children: [
    /* @__PURE__ */ jsxs4("div", { className: "w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0", children: [
      /* @__PURE__ */ jsxs4("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsx4("span", { className: "block text-xs font-semibold text-muted-foreground", children: "Grading model" }),
        /* @__PURE__ */ jsx4(
          "select",
          {
            value: activeRuleset?.id || "",
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ jsxs4("option", { value: r.id, children: [
              r.title,
              " (",
              r.code,
              " v",
              r.version,
              ")"
            ] }, r.id))
          }
        )
      ] }),
      ageAxisKeys.length > 0 && /* @__PURE__ */ jsxs4("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground", children: "Usia" }),
          /* @__PURE__ */ jsx4(
            InfoTooltip3,
            {
              content: "Bukan slider form biasa \u2014 dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dikirim sebagai age_years, dipakai axis: aging.",
              label: "About Usia"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-xs mb-1", children: [
          /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: "Umur (tahun)" }),
          /* @__PURE__ */ jsxs4("span", { className: "text-beak font-semibold font-mono", children: [
            respondentAge,
            " (",
            respondentAge <= 30 ? "sehat" : "faktor W",
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "range",
            min: 13,
            max: 70,
            value: respondentAge,
            onChange: (e) => setRespondentAge(Number(e.target.value)),
            className: sliderCls
          }
        ),
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
          /* @__PURE__ */ jsx4("span", { children: "\u226430 = sehat" }),
          /* @__PURE__ */ jsx4("span", { children: ">30 = faktor W" })
        ] })
      ] }),
      formDims.length > 0 && /* @__PURE__ */ jsxs4("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground", children: "Questionnaire result" }),
          /* @__PURE__ */ jsx4(InfoTooltip3, { content: "Per-dimensi, hanya yang dihitung dari kuisioner (form_source). 0 = parah, 100 = sehat.", label: "About questionnaire result" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "space-y-3", children: formDims.map((dimKey) => /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ jsx4("span", { className: "text-beak font-semibold font-mono", children: questionnaireValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: questionnaireValues[dimKey] ?? 50,
              onChange: (e) => setQuestionnaireValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          ),
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
            /* @__PURE__ */ jsx4("span", { children: "0 = parah" }),
            /* @__PURE__ */ jsx4("span", { children: "100 = sehat" })
          ] })
        ] }, dimKey)) })
      ] }),
      visionDims.length > 0 && /* @__PURE__ */ jsxs4("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground", children: "Vision result" }),
          /* @__PURE__ */ jsx4(InfoTooltip3, { content: "Per-dimensi, hanya yang dihitung dari foto vendor (vision_source). 0 = parah, 100 = sehat.", label: "About vision result" })
        ] }),
        /* @__PURE__ */ jsx4("div", { className: "space-y-3", children: visionDims.map((dimKey) => /* @__PURE__ */ jsxs4("div", { children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-xs mb-1", children: [
            /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: dimKey }),
            /* @__PURE__ */ jsx4("span", { className: "text-beak font-semibold font-mono", children: visionValues[dimKey] ?? 50 })
          ] }),
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: visionValues[dimKey] ?? 50,
              onChange: (e) => setVisionValues((p) => ({ ...p, [dimKey]: Number(e.target.value) })),
              className: sliderCls
            }
          ),
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
            /* @__PURE__ */ jsx4("span", { children: "0 = parah" }),
            /* @__PURE__ */ jsx4("span", { children: "100 = sehat" })
          ] })
        ] }, dimKey)) })
      ] }),
      /* @__PURE__ */ jsxs4("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground", children: "Safety flags" }),
        /* @__PURE__ */ jsx4("div", { className: "grid grid-cols-2 gap-2 text-xs", children: Object.entries(selectedConditions).map(([key, isChecked]) => /* @__PURE__ */ jsxs4(
          "button",
          {
            type: "button",
            onClick: () => setConditionChoices((p) => ({ ...p, [key]: !isChecked })),
            className: `p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${isChecked ? "border-beak/50 bg-beak/10 text-beak" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ jsx4("span", { children: key }),
              /* @__PURE__ */ jsx4(
                "span",
                {
                  className: `w-2 h-2 rounded-full ${isChecked ? "bg-beak" : "bg-border"}`
                }
              )
            ]
          },
          key
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "w-full lg:flex-1 space-y-3 min-w-0", children: [
      /* @__PURE__ */ jsxs4("div", { className: card, children: [
        /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground", children: "Result" }),
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-2", children: [
            simResponse?.performance && /* @__PURE__ */ jsx4("span", { className: "text-[11px] text-muted-foreground font-mono", children: simResponse.performance }),
            /* @__PURE__ */ jsxs4(
              "button",
              {
                type: "button",
                onClick: copyRequest,
                title: `POST ${SIMULATE_PATH}`,
                className: "flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                children: [
                  copiedReq ? /* @__PURE__ */ jsx4(Check3, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsx4(Copy2, { className: "h-3 w-3" }),
                  copiedReq ? "Copied" : "Copy request"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs4("p", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: [
          "POST ",
          SIMULATE_PATH
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-4 text-center", children: [
          /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-center gap-1.5", children: [
            skinProfile?.category && /* @__PURE__ */ jsx4("span", { className: "text-[10px] font-semibold text-muted-foreground", children: skinProfile.category }),
            skinProfile && !skinProfile.complete && /* @__PURE__ */ jsx4("span", { className: "text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5", children: "Incomplete" })
          ] }),
          /* @__PURE__ */ jsx4("div", { className: "text-2xl font-black tracking-tight text-foreground font-mono my-1", children: profileCode }),
          /* @__PURE__ */ jsx4("div", { className: "text-xs font-semibold text-foreground", children: profileName }),
          skinProfile?.description && /* @__PURE__ */ jsx4("p", { className: "text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed", children: skinProfile.description })
        ] }),
        skinProfile?.axis_values && Object.keys(skinProfile.axis_values).length > 0 && /* @__PURE__ */ jsxs4("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx4("h4", { className: "text-[11px] font-semibold text-muted-foreground mb-2", children: "Axis codes" }),
          /* @__PURE__ */ jsx4("div", { className: "flex flex-wrap gap-2 text-xs", children: Object.entries(skinProfile.axis_values).map(([axis, val]) => /* @__PURE__ */ jsxs4(
            "div",
            {
              className: "min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center",
              children: [
                /* @__PURE__ */ jsx4("div", { className: "text-muted-foreground text-[10px] truncate", children: axis }),
                /* @__PURE__ */ jsx4("div", { className: "text-sm font-bold text-beak font-mono mt-0.5", children: String(val) })
              ]
            },
            axis
          )) })
        ] }),
        /* @__PURE__ */ jsxs4("div", { className: "mt-4 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ jsx4("div", { className: "text-[10px] text-muted-foreground", children: "Overall score" }),
          /* @__PURE__ */ jsx4("div", { className: "text-sm font-bold text-foreground font-mono mt-0.5", children: totalScore }),
          /* @__PURE__ */ jsx4("div", { className: "text-[10px] text-muted-foreground", children: "100 = sehat" })
        ] }),
        warnings.length > 0 && /* @__PURE__ */ jsxs4("div", { className: "mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ jsx4("div", { className: "text-[10px] font-semibold text-amber-500", children: "Warnings" }),
          warnings.map((w) => /* @__PURE__ */ jsx4("div", { className: "text-amber-500/90 font-mono text-[11px]", children: w }, w))
        ] }),
        Object.keys(subClassification).length > 0 && /* @__PURE__ */ jsxs4("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ jsx4("div", { className: "text-[10px] text-muted-foreground mb-0.5", children: "Sub-classification" }),
          Object.entries(subClassification).map(([k, v]) => /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx4("span", { className: "text-foreground", children: k }),
            /* @__PURE__ */ jsx4("span", { className: "text-muted-foreground font-mono", children: v === null ? "\u2014" : String(v) })
          ] }, k))
        ] })
      ] }),
      Object.keys(dimensions).length > 0 && /* @__PURE__ */ jsxs4("div", { className: card, children: [
        /* @__PURE__ */ jsx4("h3", { className: "text-sm font-bold text-foreground mb-3", children: "Dimension breakdown" }),
        /* @__PURE__ */ jsx4("div", { className: "space-y-2", children: Object.entries(dimensions).map(([dimKey, d]) => /* @__PURE__ */ jsxs4(
          "div",
          {
            className: "rounded-md border border-border bg-muted/20 p-2.5 flex items-center justify-between text-xs gap-2",
            children: [
              /* @__PURE__ */ jsxs4("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx4("div", { className: "text-foreground font-semibold truncate", children: dimKey }),
                /* @__PURE__ */ jsxs4("div", { className: "text-muted-foreground text-[10px]", children: [
                  sourceLabel[d.source] || d.source,
                  d.source === "blend" && d.weight ? ` (form ${Math.round(d.weight.form * 100)}% / vision ${Math.round(d.weight.vision * 100)}%)` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3 shrink-0 font-mono", children: [
                /* @__PURE__ */ jsxs4("span", { className: "text-muted-foreground text-[10px]", title: "form_score", children: [
                  "F ",
                  d.form_score ?? "\u2014"
                ] }),
                /* @__PURE__ */ jsxs4("span", { className: "text-muted-foreground text-[10px]", title: "vision_score", children: [
                  "V ",
                  d.vision_score ?? "\u2014"
                ] }),
                /* @__PURE__ */ jsx4("span", { className: "text-beak font-semibold", title: "final_score", children: d.final_score ?? "\u2014" }),
                d.axis && /* @__PURE__ */ jsx4("span", { className: "text-foreground font-semibold bg-card border border-border rounded px-1.5 py-0.5", children: d.axis })
              ] })
            ]
          },
          dimKey
        )) })
      ] })
    ] })
  ] });
};

// src/score/components/modals/RulesetModal.tsx
import { useState as useState5, useEffect as useEffect4, useRef } from "react";
import { Copy as Copy3, Check as Check4, Plus as Plus5, AlertTriangle as AlertTriangle2, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Modal, Button as Button3, BrandSelect, ApplicationSelect, StatusSelect, InfoTooltip as InfoTooltip5 } from "@gateway-experience/shared";

// src/score/components/reusable/BandTable.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var BandTable = ({
  bands,
  onChange,
  disabled = false,
  fixed = false,
  idPrefix = "band"
}) => {
  const setMax = (idx, raw) => {
    const next = bands.map((b) => ({ ...b }));
    const lower = idx === 0 ? 0 : next[idx - 1].max + 1;
    const upper = idx === next.length - 1 ? 100 : next[idx + 1].max - 1;
    next[idx].max = Math.max(lower, Math.min(upper, Math.round(raw)));
    onChange(next);
  };
  const setLabel = (idx, label) => {
    const next = bands.map((b) => ({ ...b }));
    next[idx].label = label;
    onChange(next);
  };
  const addRow = () => {
    const last = bands[bands.length - 1];
    const prev = bands[bands.length - 2];
    const mid = prev ? Math.round((prev.max + last.max) / 2) : Math.max(1, last.max - 1);
    const inserted = { id: `${idPrefix}_${Date.now()}`, max: mid, label: "New band" };
    onChange([...bands.slice(0, -1), inserted, last]);
  };
  const removeRow = (idx) => {
    if (bands.length <= 2) return;
    onChange(bands.filter((_, i) => i !== idx));
  };
  return /* @__PURE__ */ jsxs5("div", { className: "rounded-md border border-border bg-card divide-y divide-border", children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ jsx5("span", { className: "w-24 shrink-0", children: "Score" }),
      /* @__PURE__ */ jsx5("span", { className: "flex-1", children: "Label" }),
      !fixed && /* @__PURE__ */ jsx5("span", { className: "w-6 shrink-0", "aria-hidden": "true" })
    ] }),
    bands.map((b, idx) => {
      const lower = idx === 0 ? 0 : bands[idx - 1].max + 1;
      return /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ jsxs5("div", { className: "flex w-24 shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground", children: [
          /* @__PURE__ */ jsx5("span", { className: "w-6 text-right", children: lower }),
          /* @__PURE__ */ jsx5("span", { children: "\u2013" }),
          /* @__PURE__ */ jsx5(
            "input",
            {
              type: "number",
              min: lower,
              max: 100,
              disabled: disabled || idx === bands.length - 1,
              value: b.max,
              onChange: (e) => setMax(idx, Number(e.target.value)),
              className: "w-12 h-7 rounded bg-muted/40 border border-border px-1 text-center text-foreground text-xs outline-none focus:border-ring disabled:opacity-60"
            }
          )
        ] }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            type: "text",
            disabled,
            value: b.label,
            onChange: (e) => setLabel(idx, e.target.value),
            placeholder: "e.g. Optimal",
            className: "flex-1 min-w-0 h-7 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50"
          }
        ),
        !fixed && /* @__PURE__ */ jsx5(
          "button",
          {
            type: "button",
            disabled: disabled || bands.length <= 2,
            onClick: () => removeRow(idx),
            className: "w-6 shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30 text-sm",
            title: "Remove band",
            children: "\xD7"
          }
        )
      ] }, b.id);
    }),
    !fixed && /* @__PURE__ */ jsx5("div", { className: "px-3 py-1.5", children: /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        disabled,
        onClick: addRow,
        className: "text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50",
        children: "+ Add band"
      }
    ) })
  ] });
};

// src/score/components/reusable/ProfileMappingTable.tsx
import React5, { useState as useState4 } from "react";
import { Plus as Plus4, Trash2 as Trash24, ChevronRight as ChevronRight2, ChevronDown as ChevronDown2 } from "lucide-react";
import { ScoreRangeInput, DimensionSelect as DimensionSelect2, SeveritySelect, InfoTooltip as InfoTooltip4 } from "@gateway-experience/shared";
import { Fragment, jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var ProfileMappingTable = ({
  axes,
  config,
  onChange,
  disabled = false
}) => {
  const { strategy, profiles } = config;
  const [expandedRows, setExpandedRows] = useState4({});
  const [cache, setCache] = useState4({});
  const wide = strategy === "combination_matrix";
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleStrategyChange = (newStrategy) => {
    if (newStrategy === strategy) return;
    setCache((prev) => ({ ...prev, [strategy]: profiles }));
    const cached = cache[newStrategy];
    let initialProfiles = cached ?? [];
    if (!cached) {
      if (newStrategy === "total_score") {
        initialProfiles = [
          { id: `prof_${Date.now()}_1`, minScore: 80, maxScore: 100, code: "OPTIMAL_RESILIENT", title: "Optimal Vitality", category: "Resilient Barrier", summary: "Healthy barrier balance." },
          { id: `prof_${Date.now()}_2`, minScore: 50, maxScore: 79, code: "MODERATE_FATIGUE", title: "Moderate Fatigue", category: "Early Stress", summary: "Mild cellular stress." },
          { id: `prof_${Date.now()}_3`, minScore: 0, maxScore: 49, code: "ACCELERATED_DEFICIT", title: "Accelerated Deficit", category: "High Concern", summary: "Elevated concern." }
        ];
      } else if (newStrategy === "combination_matrix") {
        initialProfiles = generateCartesianCombinations(axes);
      } else if (newStrategy === "primary_concern") {
        initialProfiles = axes.map((a, idx) => ({
          id: `prof_${Date.now()}_${idx + 1}`,
          primaryDimension: a.dimensionKey,
          severityLevel: "Sangat Parah",
          code: `${a.dimensionKey.toUpperCase()}_CRITICAL`,
          title: `${a.name} Critical Concern`,
          category: "Acute Concern",
          summary: `Acute focus required on ${a.name}.`
        }));
      }
    }
    onChange({
      strategy: newStrategy,
      profiles: initialProfiles
    });
  };
  const handleAddProfile = () => {
    let newEntry;
    const pIdx = profiles.length + 1;
    if (strategy === "total_score") {
      const last = profiles[profiles.length - 1];
      const max = last && last.minScore !== void 0 ? Math.max(0, last.minScore - 1) : 49;
      newEntry = {
        id: `prof_${Date.now()}`,
        minScore: 0,
        maxScore: max,
        code: `TIER_${pIdx}`,
        title: `Health Tier ${pIdx}`,
        category: "Standard",
        summary: ""
      };
    } else if (strategy === "combination_matrix") {
      const dimCodes = {};
      axes.forEach((a) => {
        dimCodes[a.dimensionKey] = axisLetters(a)[0];
      });
      newEntry = {
        id: `prof_${Date.now()}`,
        dimensionCodes: dimCodes,
        code: Object.values(dimCodes).join(""),
        title: `Profile ${pIdx}`,
        category: "General",
        summary: ""
      };
    } else {
      newEntry = {
        id: `prof_${Date.now()}`,
        primaryDimension: axes[0]?.dimensionKey || "sebum",
        severityLevel: "Parah",
        code: `CONCERN_${pIdx}`,
        title: `Concern Profile ${pIdx}`,
        category: "Targeted",
        summary: ""
      };
    }
    onChange({
      ...config,
      profiles: [...profiles, newEntry]
    });
  };
  const handleDeleteProfile = (id) => {
    if (profiles.length <= 1) return;
    onChange({
      ...config,
      profiles: profiles.filter((p) => p.id !== id)
    });
  };
  const handleUpdateProfile = (id, field, val) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: val };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };
  const handleUpdateDimCode = (id, dimKey, codeVal) => {
    const updated = profiles.map((p) => {
      if (p.id === id) {
        const nextCodes = { ...p.dimensionCodes || {}, [dimKey]: codeVal.toUpperCase() };
        return { ...p, dimensionCodes: nextCodes };
      }
      return p;
    });
    onChange({ ...config, profiles: updated });
  };
  const handleAutoGenerateMatrix = () => {
    const generated = generateCartesianCombinations(axes);
    onChange({
      ...config,
      profiles: generated
    });
  };
  return /* @__PURE__ */ jsxs6("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs6("div", { className: "bg-card p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx6("label", { className: "text-sm font-bold text-foreground block", children: "How the profile is chosen" }),
        /* @__PURE__ */ jsx6(
          InfoTooltip4,
          {
            content: "Sets skin_profile.code and skin_profile.name \u2014 a different result than Score Range and Severity Level above, which only set score_range and severity_level. 'Total Score' reads the same overall score as those two, just to pick a different output.",
            label: "About profile strategy"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs6("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border shrink-0", children: [
        /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("total_score"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "total_score" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Total Score"
          }
        ),
        /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("combination_matrix"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "combination_matrix" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Combination Matrix"
          }
        ),
        /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("primary_concern"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "primary_concern" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Primary Concern"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx6("p", { className: "text-[11px] text-muted-foreground -mt-2", children: "Only the highlighted method above is saved to this ruleset \u2014 the other two are kept in this browser tab so you can switch back without losing what you typed, but they're discarded on reload." }),
    strategy === "total_score" && /* @__PURE__ */ jsxs6("p", { className: "text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2", children: [
      `"Trigger range" reads the same overall score as the Score Range / Severity Level labels above, but this table picks the profile's own`,
      " ",
      /* @__PURE__ */ jsx6("span", { className: "font-mono", children: "skin_profile.code" }),
      " /",
      " ",
      /* @__PURE__ */ jsx6("span", { className: "font-mono", children: "skin_profile.name" }),
      " \u2014 a different result than",
      " ",
      /* @__PURE__ */ jsx6("span", { className: "font-mono", children: "score_range" }),
      " /",
      " ",
      /* @__PURE__ */ jsx6("span", { className: "font-mono", children: "severity_level" }),
      ". Editing one does not change the others."
    ] }),
    strategy === "combination_matrix" && /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between bg-muted/40 border border-border p-2.5 rounded-lg", children: [
      /* @__PURE__ */ jsxs6("span", { className: "text-xs text-muted-foreground", children: [
        "One row per combination of ",
        axes.length,
        " dimensions (",
        profiles.length,
        " rows)."
      ] }),
      /* @__PURE__ */ jsx6(
        "button",
        {
          type: "button",
          disabled: disabled || axes.length === 0,
          onClick: handleAutoGenerateMatrix,
          className: "px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded text-xs flex items-center gap-1 transition-colors disabled:opacity-50",
          children: "Generate all combinations"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs6("div", { className: "border border-border rounded-lg overflow-hidden bg-card", children: [
      /* @__PURE__ */ jsx6("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs6(
        "table",
        {
          className: `${wide ? "min-w-full" : "w-full"} text-left text-xs border-collapse`,
          style: wide ? { width: "max-content" } : void 0,
          children: [
            /* @__PURE__ */ jsx6("thead", { children: /* @__PURE__ */ jsxs6("tr", { className: "bg-muted/40 border-b border-border text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3 text-center", style: { width: 40 }, children: "#" }),
              strategy === "total_score" && /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3", style: { minWidth: 160 }, children: "Trigger range" }),
              strategy === "combination_matrix" && axes.map((a) => {
                const letters = axisLetters(a);
                const bipolar = !!(a.axisCodeLow?.trim() && a.axisCodeHigh?.trim());
                return /* @__PURE__ */ jsxs6(
                  "th",
                  {
                    className: "py-2.5 px-3 text-center whitespace-nowrap",
                    style: { minWidth: 120 },
                    children: [
                      a.name || a.dimensionKey,
                      /* @__PURE__ */ jsx6("span", { className: "block text-[10px] font-normal text-muted-foreground", children: bipolar ? letters.join(" / ") : "O / S / P" })
                    ]
                  },
                  a.id
                );
              }),
              strategy === "primary_concern" && /* @__PURE__ */ jsxs6(Fragment, { children: [
                /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3", style: { minWidth: 224 }, children: "Dimension" }),
                /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Level" })
              ] }),
              /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Code" }),
              /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: "Name" }),
              /* @__PURE__ */ jsx6("th", { className: "py-2.5 px-3 text-center", style: { width: 80 } })
            ] }) }),
            /* @__PURE__ */ jsx6("tbody", { className: "divide-y divide-border", children: profiles.map((p, pIdx) => {
              const isExpanded = !!expandedRows[p.id];
              return /* @__PURE__ */ jsxs6(React5.Fragment, { children: [
                /* @__PURE__ */ jsxs6("tr", { className: "hover:bg-muted/40 transition-colors", children: [
                  /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3 text-center text-muted-foreground font-semibold", children: pIdx + 1 }),
                  strategy === "total_score" && /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsx6(
                    ScoreRangeInput,
                    {
                      minScore: p.minScore ?? 0,
                      maxScore: p.maxScore ?? 100,
                      disabled,
                      onChange: (min, max) => {
                        const updated = profiles.map(
                          (item) => item.id === p.id ? { ...item, minScore: min, maxScore: max } : item
                        );
                        onChange({ ...config, profiles: updated });
                      }
                    }
                  ) }),
                  strategy === "combination_matrix" && axes.map((a) => {
                    const codeVal = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[a.axisCode] || axisLetters(a)[0];
                    return /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ jsx6(
                      "input",
                      {
                        type: "text",
                        disabled,
                        value: codeVal,
                        onChange: (e) => handleUpdateDimCode(p.id, a.dimensionKey, e.target.value),
                        placeholder: "D",
                        className: "w-12 px-1.5 py-1 bg-muted/40 border border-border rounded text-beak font-bold text-center focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                      }
                    ) }, a.id);
                  }),
                  strategy === "primary_concern" && /* @__PURE__ */ jsxs6(Fragment, { children: [
                    /* @__PURE__ */ jsx6("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ jsx6(
                      DimensionSelect2,
                      {
                        label: "",
                        value: p.primaryDimension || axes[0]?.dimensionKey || "sebum",
                        disabled,
                        onChange: (dimKey) => handleUpdateProfile(p.id, "primaryDimension", dimKey)
                      }
                    ) }),
                    /* @__PURE__ */ jsx6("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ jsx6(
                      SeveritySelect,
                      {
                        value: p.severityLevel || "Parah",
                        disabled,
                        onChange: (sev) => handleUpdateProfile(p.id, "severityLevel", sev)
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: /* @__PURE__ */ jsx6(
                    "input",
                    {
                      type: "text",
                      disabled,
                      value: p.code,
                      onChange: (e) => handleUpdateProfile(p.id, "code", e.target.value.toUpperCase().replace(/\s+/g, "_")),
                      placeholder: "DSPW",
                      className: "w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-beak font-bold focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                    }
                  ) }),
                  /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: /* @__PURE__ */ jsx6(
                    "input",
                    {
                      type: "text",
                      disabled,
                      value: p.title,
                      onChange: (e) => handleUpdateProfile(p.id, "title", e.target.value),
                      placeholder: "e.g. Dry Sensitive Pigmented Wrinkled",
                      className: "w-full px-2.5 py-1.5 bg-muted/40 border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs font-medium"
                    }
                  ) }),
                  /* @__PURE__ */ jsx6("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ jsx6(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleRow(p.id),
                        className: `p-1.5 rounded transition-colors ${isExpanded ? "text-beak bg-beak/10 border border-beak/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`,
                        title: "Show category & description",
                        children: isExpanded ? /* @__PURE__ */ jsx6(ChevronDown2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx6(ChevronRight2, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsx6(
                      "button",
                      {
                        type: "button",
                        disabled: disabled || profiles.length <= 1,
                        onClick: () => handleDeleteProfile(p.id),
                        className: "p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 rounded transition-colors",
                        title: "Delete Profile Row",
                        children: /* @__PURE__ */ jsx6(Trash24, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }) })
                ] }),
                isExpanded && /* @__PURE__ */ jsx6("tr", { className: "bg-muted/40 border-b border-border", children: /* @__PURE__ */ jsx6(
                  "td",
                  {
                    colSpan: strategy === "combination_matrix" ? axes.length + 4 : strategy === "primary_concern" ? 6 : 5,
                    className: "px-4 py-3",
                    children: /* @__PURE__ */ jsxs6("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs", children: [
                      /* @__PURE__ */ jsxs6("div", { children: [
                        /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Category" }),
                        /* @__PURE__ */ jsx6(
                          "input",
                          {
                            type: "text",
                            disabled,
                            value: p.category,
                            onChange: (e) => handleUpdateProfile(p.id, "category", e.target.value),
                            placeholder: "e.g. Dry Reactive",
                            className: "w-full px-2.5 py-1.5 bg-card border border-border rounded text-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs6("div", { className: "md:col-span-2", children: [
                        /* @__PURE__ */ jsx6("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Description" }),
                        /* @__PURE__ */ jsx6(
                          "input",
                          {
                            type: "text",
                            disabled,
                            value: p.summary || "",
                            onChange: (e) => handleUpdateProfile(p.id, "summary", e.target.value),
                            placeholder: "Short description of this profile",
                            className: "w-full px-2.5 py-1.5 bg-card border border-border rounded text-muted-foreground focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                          }
                        )
                      ] })
                    ] })
                  }
                ) })
              ] }, p.id);
            }) })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs6("div", { className: "p-2.5 bg-muted/40 border-t border-border flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs6(
          "button",
          {
            type: "button",
            disabled,
            onClick: handleAddProfile,
            className: "px-2.5 py-1 bg-card hover:bg-muted text-foreground rounded text-xs font-medium flex items-center gap-1 transition-colors border border-border disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsx6(Plus4, { className: "h-3 w-3" }),
              "Add profile"
            ]
          }
        ),
        /* @__PURE__ */ jsxs6("span", { className: "text-[11px] text-muted-foreground", children: [
          profiles.length,
          " profiles"
        ] })
      ] })
    ] })
  ] });
};
var MAX_COMBINATIONS = 64;
var SCORE_RANGE_CODES = ["O", "S", "P"];
function axisLetters(a) {
  const low = (a.axisCodeLow || "").trim().toUpperCase();
  const high = (a.axisCodeHigh || "").trim().toUpperCase();
  return low && high ? [low, high] : SCORE_RANGE_CODES;
}
function generateCartesianCombinations(axes) {
  if (axes.length === 0) return [];
  const dimTierArrays = axes.map((a) => {
    return axisLetters(a).map((code) => ({ dimKey: a.dimensionKey, code }));
  });
  let combinations = [[]];
  for (const curr of dimTierArrays) {
    const next = [];
    for (const partial of combinations) {
      for (const item of curr) {
        next.push([...partial, item]);
        if (next.length >= MAX_COMBINATIONS) break;
      }
      if (next.length >= MAX_COMBINATIONS) break;
    }
    combinations = next;
  }
  return combinations.map((combo, idx) => {
    const dimCodes = {};
    const codeParts = [];
    const nameParts = [];
    combo.forEach((item) => {
      dimCodes[item.dimKey] = item.code;
      codeParts.push(item.code);
      if (item.tier?.gradeName) {
        nameParts.push(item.tier.gradeName);
      }
    });
    const fullCode = codeParts.join("");
    const fullTitle = nameParts.length > 0 ? nameParts.join(", ") : `Profile ${fullCode}`;
    return {
      id: `prof_${Date.now()}_${idx + 1}`,
      dimensionCodes: dimCodes,
      code: fullCode,
      title: fullTitle,
      category: "Diagnostic Profile",
      summary: `Combination evaluation for ${fullCode}.`
    };
  });
}

// src/score/components/modals/RulesetModal.tsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var inputCls = "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring disabled:opacity-50";
var labelCls = "block text-xs font-semibold text-foreground mb-1.5";
var slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var RulesetModal = ({
  isOpen,
  onClose,
  onSave,
  editingRuleset
}) => {
  const [name, setName] = useState5("");
  const [code, setCode] = useState5("");
  const [codeEdited, setCodeEdited] = useState5(false);
  const [showCodeField, setShowCodeField] = useState5(false);
  const [description, setDescription] = useState5("");
  const [brandId, setBrandId] = useState5("*");
  const [applicationId, setApplicationId] = useState5("*");
  const [status, setStatus] = useState5("ACTIVE");
  const [formSurveyCode, setFormSurveyCode] = useState5("");
  const [visionSourceCode, setVisionSourceCode] = useState5("");
  const [surveys, setSurveys] = useState5([]);
  const [axes, setAxes] = useState5(DEFAULT_STARTER_AXES);
  const [profileConfig, setProfileConfig] = useState5(DEFAULT_STARTER_PROFILES);
  const [scoreRangeBands, setScoreRangeBands] = useState5(DEFAULT_SCORE_RANGE_BANDS);
  const [severityBands, setSeverityBands] = useState5(DEFAULT_SEVERITY_BANDS);
  const [tab, setTab] = useState5("setup");
  const [schemaOpen, setSchemaOpen] = useState5(true);
  const notesRef = useRef(null);
  const fitNotes = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [copied, setCopied] = useState5(null);
  const [isSubmitting, setIsSubmitting] = useState5(false);
  const [formError, setFormError] = useState5(null);
  const [isLegacy, setIsLegacy] = useState5(false);
  useEffect4(() => {
    if (editingRuleset) {
      setName(editingRuleset.title);
      setCode(editingRuleset.code);
      setCodeEdited(true);
      setShowCodeField(false);
      setDescription(editingRuleset.description || "");
      setBrandId(editingRuleset.brandId || "*");
      setApplicationId(editingRuleset.applicationId || "*");
      setStatus(editingRuleset.status || "ACTIVE");
      const { axes: a, profileConfig: p, scoreRangeBands: sr, severityBands: sv, legacy } = decompileJDMToVisualComponents(editingRuleset.schema);
      setAxes(a);
      setProfileConfig(p);
      setScoreRangeBands(sr);
      setSeverityBands(sv);
      setIsLegacy(legacy);
      try {
        const parsed = JSON.parse(editingRuleset.schema || "{}");
        setFormSurveyCode(parsed.form_survey_code || "");
        setVisionSourceCode(parsed.vision_source_code || "");
      } catch {
        setFormSurveyCode("");
        setVisionSourceCode("");
      }
    } else {
      setName("");
      setCode("");
      setCodeEdited(false);
      setShowCodeField(false);
      setDescription("");
      setBrandId("*");
      setApplicationId("*");
      setStatus("ACTIVE");
      setAxes(DEFAULT_STARTER_AXES);
      setProfileConfig(DEFAULT_STARTER_PROFILES);
      setScoreRangeBands(DEFAULT_SCORE_RANGE_BANDS);
      setSeverityBands(DEFAULT_SEVERITY_BANDS);
      setIsLegacy(false);
      setFormSurveyCode("");
      setVisionSourceCode("");
    }
    setTab("setup");
    setFormError(null);
  }, [editingRuleset, isOpen]);
  useEffect4(() => {
    fitNotes(notesRef.current);
  }, [description, tab, isOpen]);
  useEffect4(() => {
    if (!isOpen) return;
    fetch(`/core/form-engine/survey?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`).then((res) => res.json()).then((data) => {
      const list = Array.isArray(data) ? data : Array.isArray(data?.surveys) ? data.surveys : data?.code ? [data] : [];
      setSurveys(list);
    }).catch(() => setSurveys([]));
  }, [isOpen, brandId, applicationId]);
  const effectiveCode = codeEdited ? code : slugify(name);
  const totalWeight = axes.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
  const addAxis = () => {
    const n = axes.length + 1;
    setAxes((prev) => [
      ...prev,
      {
        id: `axis_${Date.now()}`,
        axisCode: `DIM_${n}`,
        name: `Dimension ${n}`,
        dimensionKey: "sensitivity",
        weight: 1,
        concernLabel: defaultConcernLabel("sensitivity")
      }
    ]);
  };
  const withSetupFields = (schemaStr) => {
    try {
      const parsed = JSON.parse(schemaStr);
      if (formSurveyCode) parsed.form_survey_code = formSurveyCode;
      else delete parsed.form_survey_code;
      if (visionSourceCode) parsed.vision_source_code = visionSourceCode;
      else delete parsed.vision_source_code;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return schemaStr;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setTab("setup");
      return setFormError("Name is required.");
    }
    if (!effectiveCode) {
      setTab("setup");
      return setFormError("Could not derive a code \u2014 set one manually.");
    }
    setIsSubmitting(true);
    try {
      await onSave({
        id: editingRuleset?.id,
        code: effectiveCode,
        title: name.trim(),
        description: description.trim(),
        brandId,
        applicationId,
        status,
        schema: withSetupFields(compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, editingRuleset?.schema))
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save grading model");
    } finally {
      setIsSubmitting(false);
    }
  };
  const jsonText = withSetupFields(compileVisualToJDM(axes, profileConfig, scoreRangeBands, severityBands, editingRuleset?.schema));
  const createRequestBody = JSON.stringify(
    {
      brandId,
      applicationId,
      code: effectiveCode || "<code>",
      title: name.trim() || "<name>",
      description: description.trim(),
      status,
      schema: jsonText
    },
    null,
    2
  );
  const simulateRequestBody = JSON.stringify(
    {
      schema: jsonText,
      dimension_scores: Object.fromEntries(
        axes.map((a) => [a.dimensionKey.toLowerCase(), 50])
      ),
      customer_condition: {}
    },
    null,
    2
  );
  const copyAs = (label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };
  return /* @__PURE__ */ jsx7(
    Modal,
    {
      isOpen,
      onClose,
      title: editingRuleset ? `Edit: ${editingRuleset.title}` : "New grading model",
      maxWidth: "max-w-5xl",
      children: /* @__PURE__ */ jsxs7("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        isLegacy && /* @__PURE__ */ jsxs7("div", { className: "p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ jsx7(AlertTriangle2, { className: "h-4 w-4 shrink-0 text-beak" }),
          /* @__PURE__ */ jsxs7("span", { children: [
            "Ruleset ini dibuat dengan format lama. Dimensi, band, dan profil di bawah adalah hasil konversi terbaik \u2014 periksa dulu sebelum ",
            /* @__PURE__ */ jsx7("strong", { children: "Save changes" }),
            ", karena menyimpan akan menulis ulang ruleset ke format baru."
          ] })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex flex-col lg:flex-row gap-4 items-start", children: [
          /* @__PURE__ */ jsxs7("div", { className: "w-full lg:flex-1 min-w-0 space-y-3", children: [
            /* @__PURE__ */ jsx7("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1", children: [
              ["setup", "Setup"],
              ["dimensions", `Dimensions${axes.length ? ` (${axes.length})` : ""}`],
              ["bands", "Skin Profile"]
            ].map(([id, label]) => /* @__PURE__ */ jsx7(
              "button",
              {
                type: "button",
                onClick: () => setTab(id),
                className: `flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                children: label
              },
              id
            )) }),
            tab === "setup" && /* @__PURE__ */ jsxs7("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs7("div", { children: [
                /* @__PURE__ */ jsxs7("label", { className: labelCls, children: [
                  "Name ",
                  /* @__PURE__ */ jsx7("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ jsx7(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g. Wardah Skinverse grading",
                    className: inputCls
                  }
                ),
                /* @__PURE__ */ jsxs7("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
                  "saved as ",
                  /* @__PURE__ */ jsx7("span", { className: "text-foreground font-mono", children: effectiveCode || "\u2026" }),
                  !editingRuleset && /* @__PURE__ */ jsx7(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setShowCodeField((v) => !v);
                        if (!codeEdited) setCode(effectiveCode);
                      },
                      className: "ml-2 underline hover:text-foreground",
                      children: "edit"
                    }
                  )
                ] }),
                showCodeField && !editingRuleset && /* @__PURE__ */ jsx7(
                  "input",
                  {
                    type: "text",
                    value: code,
                    onChange: (e) => {
                      setCode(slugify(e.target.value));
                      setCodeEdited(true);
                    },
                    className: inputCls + " mt-1.5 font-mono"
                  }
                ),
                editingRuleset?.id && /* @__PURE__ */ jsxs7(
                  "button",
                  {
                    type: "button",
                    onClick: () => copyAs("ID", editingRuleset.id),
                    title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                    className: "mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                    children: [
                      copied === "ID" ? /* @__PURE__ */ jsx7(Check4, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsx7(Copy3, { className: "h-3 w-3" }),
                      copied === "ID" ? "ID copied" : `ID ${editingRuleset.id}`
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "max-w-xs", children: [
                /* @__PURE__ */ jsx7("label", { className: labelCls, children: "Status" }),
                /* @__PURE__ */ jsx7(StatusSelect, { value: status, onChange: setStatus, label: "" })
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "rounded-md border border-border bg-muted/20", children: [
                /* @__PURE__ */ jsx7("div", { className: "px-3 py-2 text-xs font-semibold text-muted-foreground", children: "Scope & notes" }),
                /* @__PURE__ */ jsxs7("div", { className: "border-t border-border p-3 space-y-3", children: [
                  /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsx7(BrandSelect, { value: brandId, onChange: setBrandId, includeUniversal: true, label: "Brand" }),
                    /* @__PURE__ */ jsx7(
                      ApplicationSelect,
                      {
                        value: applicationId,
                        onChange: setApplicationId,
                        includeUniversal: true,
                        label: "Application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxs7("div", { children: [
                      /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ jsx7("label", { className: labelCls + " mb-0", children: "Form input" }),
                        /* @__PURE__ */ jsx7(
                          InfoTooltip5,
                          {
                            content: "Which Form Engine survey this ruleset pairs with. Scopes what shows up when adding/wiring a dimension's Form source in Blending.",
                            label: "About Form input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs7(
                        "select",
                        {
                          value: formSurveyCode,
                          onChange: (e) => setFormSurveyCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ jsx7("option", { value: "", children: "\u2014 none selected \u2014" }),
                            surveys.map((s) => /* @__PURE__ */ jsxs7("option", { value: s.code, children: [
                              s.title || s.name || s.code,
                              " (",
                              s.code,
                              ")"
                            ] }, s.code))
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs7("div", { children: [
                      /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ jsx7("label", { className: labelCls + " mb-0", children: "Vision input" }),
                        /* @__PURE__ */ jsx7(
                          InfoTooltip5,
                          {
                            content: "Which CV/vendor source this ruleset pairs with. Only one is registered today (Paradev Skin Analyzer) \u2014 more get added as new vendors are wired up.",
                            label: "About Vision input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs7(
                        "select",
                        {
                          value: visionSourceCode,
                          onChange: (e) => setVisionSourceCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ jsx7("option", { value: "", children: "\u2014 none selected \u2014" }),
                            /* @__PURE__ */ jsx7("option", { value: "paradev_skin_analyzer", children: "Paradev Skin Analyzer" })
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs7("div", { children: [
                    /* @__PURE__ */ jsx7("label", { className: labelCls, children: "Notes" }),
                    /* @__PURE__ */ jsx7(
                      "textarea",
                      {
                        ref: (el) => {
                          notesRef.current = el;
                          fitNotes(el);
                        },
                        rows: 2,
                        value: description,
                        onChange: (e) => {
                          setDescription(e.target.value);
                          fitNotes(e.target);
                        },
                        placeholder: "What this model covers and why the thresholds are set this way\u2026",
                        className: inputCls + " h-auto py-2 resize-none overflow-hidden"
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            tab === "dimensions" && /* @__PURE__ */ jsxs7("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx7("h3", { className: "text-sm font-bold text-foreground", children: "Dimensions" }),
                  /* @__PURE__ */ jsx7(
                    InfoTooltip5,
                    {
                      content: "Weights are relative \u2014 a dimension\u2019s share of the overall score is its weight \xF7 the total of all weights. The concern label is what the customer sees when that dimension is their dominant concern. Form/Vision blend per dimension moved to the Blending tab.",
                      label: "About dimensions"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx7(
                  Button3,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: addAxis,
                    leftIcon: /* @__PURE__ */ jsx7(Plus5, { className: "h-3.5 w-3.5" }),
                    children: "Add dimension"
                  }
                )
              ] }),
              axes.map((axis, i) => /* @__PURE__ */ jsx7(
                ClinicalAxisCard,
                {
                  axis,
                  index: i,
                  defaultOpen: axes.length === 1,
                  siblingWeightTotal: totalWeight,
                  onUpdate: (updated) => setAxes((prev) => prev.map((a) => a.id === axis.id ? updated : a)),
                  onDelete: () => {
                    if (axes.length <= 1) {
                      setFormError("Keep at least one dimension.");
                      return;
                    }
                    setAxes((prev) => prev.filter((a) => a.id !== axis.id));
                    setFormError(null);
                  },
                  canDelete: axes.length > 1
                },
                axis.id
              ))
            ] }),
            tab === "bands" && /* @__PURE__ */ jsxs7("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx7("h3", { className: "text-base font-bold text-foreground", children: "Skin Profile" }),
                  /* @__PURE__ */ jsx7(
                    InfoTooltip5,
                    {
                      content: "Everything here is derived from the same overall score (0-100). The two label tables below just name a bracket of that score; the method further down decides skin_profile.code/name, the actual profile result.",
                      label: "About Skin Profile"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx7("p", { className: "text-[11px] text-muted-foreground", children: "Score Range and Severity Level are two labels for the same overall score \u2014 handy for a quick badge, not required by the profile method below." })
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx7("h4", { className: "text-xs font-semibold text-foreground", children: "Score Range label" }),
                    /* @__PURE__ */ jsx7(
                      InfoTooltip5,
                      {
                        content: "Sets score_range only \u2014 a coarse 3-tier badge for the overall score.",
                        label: "About Score Range"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx7(BandTable, { bands: scoreRangeBands, onChange: setScoreRangeBands, idPrefix: "sr" })
                ] }),
                /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx7("h4", { className: "text-xs font-semibold text-foreground", children: "Severity Level label" }),
                    /* @__PURE__ */ jsx7(
                      InfoTooltip5,
                      {
                        content: "Sets severity_level only \u2014 a finer 5-tier badge for the same overall score.",
                        label: "About Severity Level"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx7(BandTable, { bands: severityBands, onChange: setSeverityBands, idPrefix: "sv" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs7("div", { className: "space-y-1.5 border-t border-border pt-4", children: [
                /* @__PURE__ */ jsxs7("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx7("h4", { className: "text-xs font-semibold text-foreground", children: "Profile method" }),
                  /* @__PURE__ */ jsx7(
                    InfoTooltip5,
                    {
                      content: "Decides skin_profile.code and skin_profile.name \u2014 the actual profile result, separate from the two labels above. Only one method runs at a time: they'd otherwise write conflicting values to the same code/name.",
                      label: "About profile method"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx7(ProfileMappingTable, { axes, config: profileConfig, onChange: setProfileConfig })
              ] })
            ] })
          ] }),
          !schemaOpen ? /* @__PURE__ */ jsxs7(
            "button",
            {
              type: "button",
              onClick: () => setSchemaOpen(true),
              title: "Show schema & API",
              className: "rounded-md border border-border bg-muted/20 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-beak/50",
              style: {
                flex: "0 0 34px",
                width: 34,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "12px 0"
              },
              children: [
                /* @__PURE__ */ jsx7(PanelRightOpen, { className: "h-3.5 w-3.5", style: { flexShrink: 0 } }),
                /* @__PURE__ */ jsx7("span", { style: { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }, children: "Schema & API" })
              ]
            }
          ) : /* @__PURE__ */ jsx7("div", { className: "w-full lg:w-64 lg:shrink-0", children: /* @__PURE__ */ jsxs7("div", { className: "rounded-md border border-border bg-muted/20 lg:sticky lg:top-0", children: [
            /* @__PURE__ */ jsxs7(
              "button",
              {
                type: "button",
                onClick: () => setSchemaOpen(false),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
                children: [
                  /* @__PURE__ */ jsx7("span", { children: "Schema & API" }),
                  /* @__PURE__ */ jsx7(PanelRightClose, { className: "h-3.5 w-3.5 shrink-0" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs7("div", { className: "border-t border-border", children: [
              /* @__PURE__ */ jsx7("div", { className: "flex flex-wrap items-center gap-1.5 px-3 py-2", children: [
                { label: "Schema", text: jsonText },
                { label: "Copy request body", text: createRequestBody },
                { label: "Simulate request", text: simulateRequestBody }
              ].map(({ label, text }) => /* @__PURE__ */ jsxs7(
                "button",
                {
                  type: "button",
                  onClick: () => copyAs(label, text),
                  className: "flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                  children: [
                    copied === label ? /* @__PURE__ */ jsx7(Check4, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ jsx7(Copy3, { className: "h-3 w-3" }),
                    copied === label ? "Copied" : label
                  ]
                },
                label
              )) }),
              /* @__PURE__ */ jsx7(
                "textarea",
                {
                  rows: 10,
                  readOnly: true,
                  value: jsonText,
                  className: "w-full border-t border-border bg-card px-3 py-2 font-mono text-[11px] text-foreground outline-none leading-relaxed lg:max-h-[30vh]"
                }
              )
            ] })
          ] }) })
        ] }),
        formError && /* @__PURE__ */ jsxs7("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
          /* @__PURE__ */ jsx7(AlertTriangle2, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsx7("span", { children: formError })
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-border", children: [
          /* @__PURE__ */ jsx7(Button3, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }),
          /* @__PURE__ */ jsx7(Button3, { type: "submit", variant: "primary", size: "sm", isLoading: isSubmitting, disabled: !name.trim(), children: editingRuleset ? "Save changes" : "Create" })
        ] })
      ] })
    }
  );
};

// src/score/components/ScoreManager.tsx
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var SCORE = "/core/score-engine";
var ScoreManager = () => {
  const [activeTab, setActiveTab] = usePersistentState2("xg.scoreEngine.activeTab", "rulesets");
  const [searchQuery, setSearchQuery] = useState6("");
  const [rulesets, setRulesets] = useState6([]);
  const [selectedRulesetId, setSelectedRulesetId] = usePersistentState2("xg.scoreEngine.selectedRulesetId", null);
  const selectedRuleset = rulesets.find((r) => r.id === selectedRulesetId) ?? null;
  const setSelectedRuleset = (r) => setSelectedRulesetId(r?.id ?? null);
  const [isRulesetModalOpen, setIsRulesetModalOpen] = useState6(false);
  const [editingRuleset, setEditingRuleset] = useState6(null);
  const [deleteConfirm, setDeleteConfirm] = useState6({
    isOpen: false,
    title: "",
    message: "",
    isLoading: false,
    onConfirm: () => {
    }
  });
  const loadRulesets = useCallback2(() => {
    fetch(withTenantScope(`${SCORE}/rulesets`)).then((res) => res.json()).then((data) => {
      if (Array.isArray(data.rulesets)) {
        setRulesets(data.rulesets);
      }
    }).catch(() => {
    });
  }, []);
  useEffect5(() => {
    loadRulesets();
  }, [loadRulesets]);
  const scoreTabs = [
    {
      id: "rulesets",
      label: "Skin Grading",
      icon: /* @__PURE__ */ jsx8(Sliders3, { className: "h-4 w-4" }),
      badge: rulesets.length
    },
    {
      id: "blending",
      label: "Blending",
      icon: /* @__PURE__ */ jsx8(SlidersHorizontal, { className: "h-4 w-4" })
    },
    {
      id: "simulator",
      label: "Simulator",
      icon: /* @__PURE__ */ jsx8(Play2, { className: "h-4 w-4" })
    }
  ];
  const handleSaveRuleset = async (rulesetData) => {
    const isEdit = !!rulesetData.id;
    const url = isEdit ? `${SCORE}/rulesets/${rulesetData.id}` : `${SCORE}/rulesets`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rulesetData)
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to save skin grading framework");
    }
    loadRulesets();
  };
  const handleDeleteRuleset = (id, code) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Skin Grading Framework",
      message: `Are you sure you want to delete skin grading framework "${code}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`${SCORE}/rulesets/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Failed to delete ruleset");
          }
          loadRulesets();
        } catch (err) {
          alert(err.message);
        } finally {
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs8("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsx8(
      PageHeader,
      {
        icon: /* @__PURE__ */ jsx8(FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/api-client" },
          { label: "Core Engines" },
          { label: "Score Engine" }
        ],
        title: "Score Engine",
        children: /* @__PURE__ */ jsx8(
          TabNav,
          {
            tabs: scoreTabs,
            activeTab,
            onTabChange: (id) => {
              setActiveTab(id);
              setSearchQuery("");
            }
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs8("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "rulesets" && /* @__PURE__ */ jsx8(
        RulesetsTab,
        {
          rulesets,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenCreateModal: () => {
            setEditingRuleset(null);
            setIsRulesetModalOpen(true);
          },
          onOpenEditModal: (r) => {
            setEditingRuleset(r);
            setIsRulesetModalOpen(true);
          },
          onSelectSimulatorRuleset: (r) => {
            setSelectedRuleset(r);
            setActiveTab("simulator");
          },
          onDeleteRuleset: handleDeleteRuleset
        }
      ),
      activeTab === "blending" && /* @__PURE__ */ jsx8(
        BlendingTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset,
          onSaveRuleset: handleSaveRuleset
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ jsx8(
        ScoreSimulatorTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset
        }
      )
    ] }),
    /* @__PURE__ */ jsx8(
      RulesetModal,
      {
        isOpen: isRulesetModalOpen,
        onClose: () => setIsRulesetModalOpen(false),
        onSave: handleSaveRuleset,
        editingRuleset
      }
    ),
    /* @__PURE__ */ jsx8(
      ConfirmDialog,
      {
        isOpen: deleteConfirm.isOpen,
        title: deleteConfirm.title,
        message: deleteConfirm.message,
        onConfirm: deleteConfirm.onConfirm,
        onClose: () => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))
      }
    )
  ] });
};

// src/score/components/reusable/SeverityTierTable.tsx
import { useState as useState7 } from "react";
import { Plus as Plus6, Trash2 as Trash25 } from "lucide-react";
import { ScoreRangeInput as ScoreRangeInput2, SeveritySelect as SeveritySelect2 } from "@gateway-experience/shared";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var SEV_LABEL = {
  optimal: "Level 5 \xB7 Healthy",
  mild: "Level 4 \xB7 Mild",
  moderate: "Level 3 \xB7 Moderate",
  severe: "Level 2 \xB7 Poor",
  critical: "Level 1 \xB7 Critical"
};
var fieldCls3 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var W_RANGE = 160;
var W_SEVERITY = 160;
var W_CODE = 48;
var W_TAG = 112;
var W_DELETE = 28;
var SeverityTierTable = ({
  tiers,
  onChange,
  disabled = false,
  showValueCode = false
}) => {
  const [customize, setCustomize] = useState7(false);
  const update = (id, patch) => onChange(tiers.map((t) => t.id === id ? { ...t, ...patch } : t));
  const addLevel = () => {
    const last = tiers[tiers.length - 1];
    onChange([
      ...tiers,
      {
        id: `t_${Date.now()}`,
        minScore: last ? Math.min(100, last.maxScore + 1) : 0,
        maxScore: 100,
        valueCode: "X",
        gradeName: `Level ${tiers.length + 1}`,
        severity: "optimal",
        trait: "Normal"
      }
    ]);
  };
  const rowMinWidth = W_RANGE + 140 + W_SEVERITY + (showValueCode ? W_CODE + 8 : 0) + W_TAG + W_DELETE + 4 * 8;
  return /* @__PURE__ */ jsxs9("div", { className: "rounded-md border border-border bg-card", children: [
    /* @__PURE__ */ jsxs9("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ jsx9("span", { className: "text-[11px] font-semibold text-muted-foreground", children: "Score \u2192 level" }),
      /* @__PURE__ */ jsx9(
        "button",
        {
          type: "button",
          onClick: () => setCustomize((v) => !v),
          className: "text-[11px] text-muted-foreground hover:text-foreground underline",
          children: customize ? "Done" : "Customize levels"
        }
      )
    ] }),
    !customize && /* @__PURE__ */ jsx9("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-3 px-3 py-2", children: [
      /* @__PURE__ */ jsxs9("span", { className: "w-16 shrink-0 text-xs tabular-nums text-muted-foreground", children: [
        tier.minScore,
        "\u2013",
        tier.maxScore
      ] }),
      /* @__PURE__ */ jsx9(
        "input",
        {
          type: "text",
          disabled,
          value: tier.gradeName,
          onChange: (e) => update(tier.id, { gradeName: e.target.value }),
          placeholder: "e.g. Balanced",
          className: `flex-1 min-w-0 ${fieldCls3}`
        }
      ),
      showValueCode && /* @__PURE__ */ jsx9("span", { className: "w-7 shrink-0 text-center text-xs font-semibold text-beak", children: tier.valueCode }),
      /* @__PURE__ */ jsx9("span", { className: "w-36 shrink-0 text-right text-[11px] text-muted-foreground", children: SEV_LABEL[tier.severity] ?? tier.severity })
    ] }, tier.id)) }),
    customize && /* @__PURE__ */ jsx9("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs9("div", { style: { minWidth: rowMinWidth }, children: [
      /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx9("span", { className: "shrink-0", style: { width: W_RANGE }, children: "Range" }),
        /* @__PURE__ */ jsx9("span", { className: "flex-1 min-w-0", children: "Label" }),
        /* @__PURE__ */ jsx9("span", { className: "shrink-0", style: { width: W_SEVERITY }, children: "Severity" }),
        showValueCode && /* @__PURE__ */ jsx9("span", { className: "shrink-0 text-center", style: { width: W_CODE }, children: "Code" }),
        /* @__PURE__ */ jsx9("span", { className: "shrink-0", style: { width: W_TAG }, children: "Tag" }),
        /* @__PURE__ */ jsx9("span", { className: "shrink-0", style: { width: W_DELETE }, "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ jsx9("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ jsxs9("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ jsx9("div", { className: "shrink-0", style: { width: W_RANGE }, children: /* @__PURE__ */ jsx9(
          ScoreRangeInput2,
          {
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            disabled,
            onChange: (min, max) => update(tier.id, { minScore: min, maxScore: max })
          }
        ) }),
        /* @__PURE__ */ jsx9(
          "input",
          {
            type: "text",
            disabled,
            value: tier.gradeName,
            onChange: (e) => update(tier.id, { gradeName: e.target.value }),
            placeholder: "e.g. Balanced",
            className: `flex-1 min-w-0 ${fieldCls3}`
          }
        ),
        /* @__PURE__ */ jsx9("div", { className: "shrink-0", style: { width: W_SEVERITY }, children: /* @__PURE__ */ jsx9(
          SeveritySelect2,
          {
            value: tier.severity,
            disabled,
            onChange: (sev) => update(tier.id, { severity: sev })
          }
        ) }),
        showValueCode && /* @__PURE__ */ jsx9(
          "input",
          {
            type: "text",
            disabled,
            value: tier.valueCode,
            onChange: (e) => update(tier.id, { valueCode: e.target.value.toUpperCase().slice(0, 2) }),
            placeholder: "D",
            title: "Short code for this level (Combination Matrix)",
            className: `shrink-0 h-8 rounded-md bg-muted/40 border border-border px-1 text-center text-beak text-xs font-semibold outline-none focus:border-ring disabled:opacity-50`,
            style: { width: W_CODE }
          }
        ),
        /* @__PURE__ */ jsx9(
          "input",
          {
            type: "text",
            disabled,
            value: tier.trait,
            onChange: (e) => update(tier.id, { trait: e.target.value }),
            placeholder: "tag",
            title: "Concern tag surfaced when this level is hit",
            className: `shrink-0 ${fieldCls3}`,
            style: { width: W_TAG }
          }
        ),
        /* @__PURE__ */ jsx9(
          "button",
          {
            type: "button",
            disabled: disabled || tiers.length <= 1,
            onClick: () => tiers.length > 1 && onChange(tiers.filter((t) => t.id !== tier.id)),
            className: "shrink-0 flex h-7 items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30",
            style: { width: W_DELETE },
            title: "Remove level",
            children: /* @__PURE__ */ jsx9(Trash25, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, tier.id)) })
    ] }) }),
    customize && /* @__PURE__ */ jsx9("div", { className: "px-3 py-2 border-t border-border", children: /* @__PURE__ */ jsxs9(
      "button",
      {
        type: "button",
        disabled,
        onClick: addLevel,
        className: "text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
        children: [
          /* @__PURE__ */ jsx9(Plus6, { className: "h-3 w-3" }),
          "Add level"
        ]
      }
    ) })
  ] });
};
export {
  BandTable,
  BlendingTab,
  ClinicalAxisCard,
  ClinicalDimensionCard,
  DEFAULT_SCORE_RANGE_BANDS,
  DEFAULT_SEVERITY_BANDS,
  DEFAULT_STARTER_AXES,
  DEFAULT_STARTER_PROFILES,
  ProfileMappingTable,
  ScoreManager,
  SeverityTierTable,
  compileVisualToJDM,
  decompileJDMToVisual,
  decompileJDMToVisualComponents,
  defaultConcernLabel
};
//# sourceMappingURL=index.mjs.map