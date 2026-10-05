'use client';
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/score/index.ts
var score_exports = {};
__export(score_exports, {
  BandTable: () => BandTable,
  BlendingTab: () => BlendingTab,
  ClinicalAxisCard: () => ClinicalAxisCard,
  ClinicalDimensionCard: () => ClinicalDimensionCard,
  DEFAULT_SCORE_RANGE_BANDS: () => DEFAULT_SCORE_RANGE_BANDS,
  DEFAULT_SEVERITY_BANDS: () => DEFAULT_SEVERITY_BANDS,
  EMPTY_PROFILE_CONFIG: () => EMPTY_PROFILE_CONFIG,
  ProfileMappingTable: () => ProfileMappingTable,
  ScoreManager: () => ScoreManager,
  SeverityTierTable: () => SeverityTierTable,
  compileVisualToJDM: () => compileVisualToJDM,
  decompileJDMToVisual: () => decompileJDMToVisual,
  decompileJDMToVisualComponents: () => decompileJDMToVisualComponents
});
module.exports = __toCommonJS(score_exports);

// src/score/components/ScoreManager.tsx
var import_react7 = require("react");
var import_lucide_react7 = require("lucide-react");
var import_shared7 = require("@gateway-experience/shared");

// src/core/scope.ts
var ALL_TENANTS = "*";
function tenantScopeQuery(brandId = ALL_TENANTS, applicationId = ALL_TENANTS) {
  return `brand_id=${encodeURIComponent(brandId || ALL_TENANTS)}&application_id=${encodeURIComponent(applicationId || ALL_TENANTS)}`;
}
function withTenantScope(path, brandId, applicationId) {
  return `${path}${path.includes("?") ? "&" : "?"}${tenantScopeQuery(brandId, applicationId)}`;
}

// src/score/api.ts
var SCORE = "/core/score-engine";
async function listRulesets() {
  const data = await (await fetch(withTenantScope(`${SCORE}/rulesets`))).json();
  return Array.isArray(data.rulesets) ? data.rulesets : null;
}
async function throwFromBody(res, fallback) {
  const errData = await res.json().catch(() => ({}));
  const list = Array.isArray(errData?.errors) ? errData.errors : [];
  const items = list.map((e) => typeof e === "string" ? e : e?.message || JSON.stringify(e));
  const head = errData?.error || fallback;
  throw new Error(items.length ? `${head}: ${items.join("; ")}` : head);
}
async function saveRuleset(ruleset) {
  const isEdit = !!ruleset.id;
  const res = await fetch(isEdit ? `${SCORE}/rulesets/${ruleset.id}` : `${SCORE}/rulesets`, {
    method: isEdit ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ruleset)
  });
  if (!res.ok) await throwFromBody(res, "Failed to save skin grading framework");
}
async function deleteRuleset(id) {
  const res = await fetch(`${SCORE}/rulesets/${id}`, { method: "DELETE" });
  if (!res.ok) await throwFromBody(res, "Failed to delete ruleset");
}
var SIMULATE_PATH = `${SCORE}/simulate`;
async function simulateRuleset(body) {
  const res = await fetch(SIMULATE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.ok ? await res.json() : null;
}
async function fetchTenantSurveys(brandId, applicationId) {
  const res = await fetch(
    `/core/form-engine/survey?brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`
  );
  return res.ok ? res.json() : null;
}
function surveyList(data) {
  const d = data;
  return Array.isArray(data) ? data : Array.isArray(d?.surveys) ? d.surveys : d?.code ? [data] : [];
}
async function listSkinConditions(routes) {
  const data = await (await fetch(routes.skinConditions)).json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

// src/score/components/tabs/RulesetsTab.tsx
var import_react = __toESM(require("react"));
var import_lucide_react = require("lucide-react");
var import_shared = require("@gateway-experience/shared");
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [filterBrand, setFilterBrand] = import_react.default.useState("ALL");
  const [filterStatus, setFilterStatus] = import_react.default.useState("ALL");
  const [copiedId, setCopiedId] = import_react.default.useState(null);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_shared.SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search grading models by title, code, or brand\u2026",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { className: "h-4 w-4" }),
        customFilterContent: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: filterBrand,
              onChange: (e) => setFilterBrand(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ALL", children: "All brands" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "*", children: "* (universal)" }),
                uniqueBrands.filter((b) => b !== "*").map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: b, children: b }, b))
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              className: filterSelect,
              style: { colorScheme: "dark" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ALL", children: "All statuses" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ACTIVE", children: "Active" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "DRAFT", children: "Draft" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "INACTIVE", children: "Inactive" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ARCHIVED", children: "Archived" })
              ]
            }
          )
        ] })
      }
    ),
    filteredRulesets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_shared.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading models yet",
        description: "A grading model turns 0\u2013100 dimension scores into Level 1\u20135 severity and a skin profile.",
        actionLabel: "New grading model",
        onAction: onOpenCreateModal,
        actionIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { className: "h-4 w-4" }),
        className: "py-12 rounded-lg border border-border bg-card"
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredRulesets.map((ruleset) => {
      let dimCount = 0;
      try {
        const parsed = JSON.parse(ruleset.schema);
        const dimKeys = parsed.dimension_weights || parsed.concern_labels || parsed.axis_codes || {};
        dimCount = Object.keys(dimKeys).length;
      } catch {
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "rounded-lg border border-border bg-card p-4 flex flex-col justify-between transition-colors hover:border-beak/50",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-mono text-[10px] text-beak bg-beak/10 px-2 py-0.5 rounded border border-beak/30", children: ruleset.code }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
                  "v",
                  ruleset.version
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_shared.StatusBadge, { status: ruleset.status })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-sm font-bold text-foreground mt-1.5", children: ruleset.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed", children: ruleset.description || "Severity bands and skin-profile mapping for this brand." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-4 text-[11px] text-muted-foreground mt-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  "Brand ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-foreground", children: ruleset.brandId })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  "App ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-foreground", children: ruleset.applicationId })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-foreground", children: dimCount }),
                  " dimensions"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => copyId(ruleset.id),
                  title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                  className: "mt-2 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                  children: [
                    copiedId === ruleset.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Copy, { className: "h-3 w-3" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "truncate max-w-[16rem]", children: copiedId === ruleset.id ? "ID copied" : `ID ${ruleset.id}` })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between pt-3 mt-3 border-t border-border", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_shared.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onOpenEditModal(ruleset),
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Pencil, { className: "h-3.5 w-3.5" }),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_shared.Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => onSelectSimulatorRuleset(ruleset),
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Play, { className: "h-3.5 w-3.5" }),
                    children: "Simulate"
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  onClick: () => onDeleteRuleset(ruleset.id, ruleset.code),
                  className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors",
                  title: "Delete grading model",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { className: "h-4 w-4" })
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
var import_react3 = require("react");
var import_lucide_react3 = require("lucide-react");
var import_shared3 = require("@gateway-experience/shared");

// src/score/types.ts
var LEGACY_SOURCES = {
  form: { scale: [0, 100], direction: "concern" },
  vision: { scale: [0, 100], direction: "health" }
};
var AGE_FIELD = "age_over_30";
var AGE_FIELD_CUTOFF_YEARS = 30;
var FORM_SOURCE = "form";
var VISION_SOURCE = "vision";
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
  { code: "data.inference_result.results.skin_scoring.Pores", label: "Pores", description: "results.skin_scoring.Pores \u2014 feeds Pore Severity." }
];

// src/score/utils/blend.ts
var WEIGHT_SUM_TOLERANCE = 1e-6;
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var pct = (w) => typeof w === "number" && Number.isFinite(w) ? Math.round(w * 100 * 1e6) / 1e6 : void 0;
function convertLegacyDimension(key, fusion, mapping) {
  const formField = mapping?.form === AGE_FIELD ? AGE_FIELD : key;
  const visionField = mapping?.vision;
  if (fusion) {
    const out = [];
    if ((fusion.form ?? 0) > 0) out.push({ source: "form", field: formField, weight: pct(fusion.form) });
    if ((fusion.vision ?? 0) > 0 && visionField) out.push({ source: "vision", field: visionField, weight: pct(fusion.vision) });
    return out.length === 1 ? [{ ...out[0], weight: 100 }] : out;
  }
  const mapped = [];
  if (mapping?.form) mapped.push({ source: "form", field: formField, weight: void 0 });
  if (visionField) mapped.push({ source: "vision", field: visionField, weight: void 0 });
  if (mapped.length === 0) return [{ source: "form", field: key, weight: 100 }];
  if (mapped.length === 1) return [{ ...mapped[0], weight: 100 }];
  return mapped;
}
function readBlend(schema, legacyKeys = []) {
  if (isObj(schema.sources) || isObj(schema.dimension_inputs)) {
    const sources2 = {};
    for (const [name, s] of Object.entries(isObj(schema.sources) ? schema.sources : {})) {
      if (!isObj(s)) continue;
      const scale = Array.isArray(s.scale) && s.scale.length === 2 ? [Number(s.scale[0]), Number(s.scale[1])] : [NaN, NaN];
      sources2[name] = { scale, direction: s.direction };
    }
    const dims2 = {};
    for (const [key, d] of Object.entries(isObj(schema.dimension_inputs) ? schema.dimension_inputs : {})) {
      if (!isObj(d)) continue;
      const inputs = isObj(d.inputs) ? d.inputs : {};
      const weights = isObj(d.weights) ? d.weights : {};
      dims2[key] = {
        inputs: Object.entries(inputs).map(([source, field]) => ({ source, field: String(field), weight: pct(weights[source]) })),
        required: Array.isArray(d.required) ? d.required.map(String) : []
      };
    }
    return { sources: sources2, dims: dims2, converted: false };
  }
  const fusion = isObj(schema.dimension_fusion) ? schema.dimension_fusion : {};
  const mapping = isObj(schema.field_mapping) ? schema.field_mapping : {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(fusion), ...Object.keys(mapping), ...legacyKeys]);
  const dims = {};
  for (const key of keys) dims[key] = { inputs: convertLegacyDimension(key, fusion[key], mapping[key]), required: [] };
  const used = new Set(Object.values(dims).flatMap((d) => d.inputs.map((i) => i.source)));
  const sources = {};
  for (const name of ["form", "vision"]) if (used.has(name)) sources[name] = { ...LEGACY_SOURCES[name], scale: [...LEGACY_SOURCES[name].scale] };
  return { sources, dims, converted: keys.size > 0 };
}
function toDimensionInputs(axis) {
  const rows = (axis.inputs || []).filter((i) => i.source && i.field);
  if (rows.length === 0) return void 0;
  const out = {
    inputs: Object.fromEntries(rows.map((i) => [i.source, i.field])),
    weights: Object.fromEntries(rows.map((i) => [i.source, typeof i.weight === "number" ? i.weight / 100 : NaN]))
  };
  const required = (axis.required || []).filter((r) => rows.some((i) => i.source === r));
  if (required.length > 0) out.required = required;
  return out;
}
function validateBlend(sources, axes) {
  const problems = [];
  for (const [name, s] of Object.entries(sources)) {
    const [min, max] = s.scale || [];
    if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) problems.push(`Source "${name}": scale needs two numbers, min below max.`);
    if (s.direction !== "concern" && s.direction !== "health") problems.push(`Source "${name}": direction must be concern or health.`);
  }
  for (const a of axes) {
    const label = a.name || a.dimensionKey;
    const rows = a.inputs || [];
    if (rows.length === 0) continue;
    const seen = /* @__PURE__ */ new Set();
    let sum = 0;
    for (const i of rows) {
      if (!i.source) {
        problems.push(`${label}: a row has no source.`);
        continue;
      }
      if (seen.has(i.source)) problems.push(`${label}: source "${i.source}" is used twice.`);
      seen.add(i.source);
      if (!sources[i.source]) problems.push(`${label}: source "${i.source}" is not declared.`);
      if (!i.field) problems.push(`${label}: source "${i.source}" has no field.`);
      if (typeof i.weight !== "number" || !Number.isFinite(i.weight)) problems.push(`${label}: source "${i.source}" has no weight.`);
      else if (i.weight <= 0) problems.push(`${label}: source "${i.source}" weight must be above 0.`);
      else sum += i.weight;
    }
    if (Math.abs(sum / 100 - 1) > WEIGHT_SUM_TOLERANCE && rows.every((i) => typeof i.weight === "number")) {
      problems.push(`${label}: weights add up to ${Math.round(sum * 100) / 100}%, not 100%.`);
    }
    for (const r of a.required || []) if (!seen.has(r)) problems.push(`${label}: required source "${r}" is not one of its inputs.`);
  }
  return problems;
}

// src/score/utils/jdm-compiler.ts
var visionFieldLabel = (code) => KNOWN_VISION_FIELDS.find((f) => f.code === code)?.label || code;
var EMPTY_PROFILE_CONFIG = { strategy: "total_score", profiles: [] };
function scoreRangeLetters(bands) {
  const letters = bands.slice().sort((x, y) => x.max - y.max).map((b) => b.label.trim().charAt(0).toUpperCase()).filter(Boolean);
  return Array.from(new Set(letters));
}
var bandsToSchema = (bands) => bands.map((b) => ({ max: Math.max(0, Math.min(100, Number(b.max) || 0)), label: b.label || "" }));
var cleanVal = (v) => `"${(v || "").replace(/"/g, "")}"`;
var rangeCell = (min, max) => `[${Math.max(0, Math.min(100, min ?? 0))}..${Math.max(0, Math.min(100, max ?? 100))}]`;
function compileVisualToJDM(axes, profileConfig = EMPTY_PROFILE_CONFIG, scoreRangeBands = DEFAULT_SCORE_RANGE_BANDS, severityBands = DEFAULT_SEVERITY_BANDS, existingSchema, sources) {
  const effectiveAxes = axes.filter((a) => (a.dimensionKey || "").trim());
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
  const dimension_inputs = {};
  const concern_labels = {};
  const axis_codes = {};
  for (const a of effectiveAxes) {
    const key = a.dimensionKey.toLowerCase();
    dimension_weights[key] = a.weight ?? 1;
    const concern = (a.concernLabel || "").trim();
    if (concern) concern_labels[key] = concern;
    const di = toDimensionInputs(a);
    if (di) dimension_inputs[key] = di;
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
  const prevBlend = readBlend(base, [...Object.keys(base.dimension_weights || {}), ...Object.keys(base.concern_labels || {})]);
  const carried = {};
  for (const [k, d] of Object.entries(prevBlend.dims)) {
    if (ownedDimKeys.has(k)) continue;
    const di = toDimensionInputs(d);
    if (di) carried[k] = di;
  }
  const mergedInputs = mergeOwned(carried, dimension_inputs);
  const usedSources = new Set(Object.values(mergedInputs).flatMap((d) => Object.keys(d.inputs)));
  const declared = sources ?? prevBlend.sources;
  const model = {
    ...base,
    nodes: [...nodes, ...preservedNodes],
    edges,
    dimension_weights: mergeOwned(base.dimension_weights, dimension_weights),
    concern_labels: mergeOwned(base.concern_labels, concern_labels),
    score_range_bands: bandsToSchema(scoreRangeBands),
    severity_bands: bandsToSchema(severityBands)
  };
  const mergedAxisCodes = mergeOwned(base.axis_codes, axis_codes);
  if (Object.keys(mergedAxisCodes).length > 0) model.axis_codes = mergedAxisCodes;
  else delete model.axis_codes;
  delete model.field_mapping;
  delete model.dimension_fusion;
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
    axes: [],
    profileConfig: { ...EMPTY_PROFILE_CONFIG, profiles: [] },
    scoreRangeBands: DEFAULT_SCORE_RANGE_BANDS.map((b) => ({ ...b })),
    severityBands: DEFAULT_SEVERITY_BANDS.map((b) => ({ ...b })),
    sources: {},
    convertedBlend: false,
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
  const concernLabels = parsed.concern_labels || {};
  const axisCodes = parsed.axis_codes || {};
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
      ...salvagedKeys
    ])
  );
  const blend = readBlend(parsed, dimKeys);
  for (const k of Object.keys(blend.dims)) if (!dimKeys.includes(k)) dimKeys.push(k);
  const legacy = Object.keys(weights).length === 0 && Object.keys(concernLabels).length === 0 && !hasProfileNode;
  const bandNodeFor = (key) => nodeContents.find((c) => {
    const ins = c?.inputs || [];
    const outs = c?.outputs || [];
    return ins.length === 1 && ins[0]?.field === `dimension_scores.${key}` && outs.length === 1 && outs[0]?.field === `axis_values.${key.toUpperCase()}`;
  });
  const axes = dimKeys.map((key, i) => {
    const ac = axisCodes[key.toLowerCase()];
    const bd = blend.dims[key];
    const bandNode = bandNodeFor(key);
    let bands;
    if (bandNode) {
      const inId = bandNode.inputs?.[0]?.id ?? "in";
      const outId = bandNode.outputs?.[0]?.id ?? "out";
      bands = (bandNode.rules || []).map((r, ri) => {
        const range = parseRange(r[inId]);
        if (!range) return null;
        return { id: `${key}_b${ri}`, min: range.min, max: range.max, letter: clean(r[outId]) };
      }).filter(Boolean);
    } else if (ac && (ac.low || ac.high)) {
      const t = typeof ac.threshold === "number" ? ac.threshold : 50;
      bands = [
        { id: `${key}_lo`, min: 0, max: Math.max(0, t - 1), letter: ac.low || "" },
        { id: `${key}_hi`, min: t, max: 100, letter: ac.high || "" }
      ];
    }
    return {
      id: `axis_${key}`,
      axisCode: key.toUpperCase(),
      name: key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      dimensionKey: key,
      weight: typeof weights[key] === "number" ? weights[key] : 1,
      concernLabel: concernLabels[key] || void 0,
      inputs: (bd?.inputs || []).map((i2) => ({ ...i2, label: i2.source === VISION_SOURCE ? visionFieldLabel(i2.field) : i2.field })),
      required: bd?.required || [],
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
  let profileConfig = { ...EMPTY_PROFILE_CONFIG, profiles: [] };
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
    profileConfig = { strategy, profiles };
  }
  return {
    axes,
    profileConfig,
    scoreRangeBands: bandsFromSchema(parsed.score_range_bands, DEFAULT_SCORE_RANGE_BANDS, "sr"),
    severityBands: bandsFromSchema(parsed.severity_bands, DEFAULT_SEVERITY_BANDS, "sv"),
    sources: blend.sources,
    convertedBlend: blend.converted,
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
var import_react2 = require("react");
var import_lucide_react2 = require("lucide-react");
var import_shared2 = require("@gateway-experience/shared");
var import_jsx_runtime2 = require("react/jsx-runtime");
function useVisionFields() {
  const [conditions, setConditions] = (0, import_react2.useState)([]);
  const hostRoutes = (0, import_shared2.useHostRoutes)();
  (0, import_react2.useEffect)(() => {
    listSkinConditions(hostRoutes).then(setConditions).catch(() => {
    });
  }, [hostRoutes]);
  return (0, import_react2.useMemo)(
    () => conditions.flatMap(
      (c) => (c.visionCapabilities || []).map((cap) => ({ code: cap, label: `${c.name} (${cap})` }))
    ),
    [conditions]
  );
}
var fieldCls = "w-full h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var FieldPicker = ({ source, field, onChange, disabled }) => {
  const visionFields = useVisionFields();
  if (source === FORM_SOURCE) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_shared2.DimensionSelect,
      {
        value: field,
        disabled,
        onChange: (code, meta) => onChange(code || "", meta?.name || code || ""),
        label: ""
      }
    );
  }
  if (source === VISION_SOURCE) {
    const known = visionFields.some((f) => f.code === field);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "select",
      {
        disabled,
        value: field,
        onChange: (e) => {
          const code = e.target.value;
          onChange(code, visionFields.find((f) => f.code === code)?.label || code);
        },
        className: fieldCls,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: "\u2014 pick a CV field (ref_skin_conditions) \u2014" }),
          field && !known && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: field, children: field }),
          visionFields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: f.code, children: f.label }, `${f.code}:${f.label}`))
        ]
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "input",
    {
      type: "text",
      disabled,
      value: field,
      placeholder: `${source} field, e.g. its signal name`,
      onChange: (e) => onChange(e.target.value.trim(), e.target.value.trim()),
      className: fieldCls + " font-mono"
    }
  );
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
  const [open, setOpen] = (0, import_react2.useState)(defaultOpen);
  const share = typeof siblingWeightTotal === "number" && siblingWeightTotal > 0 ? Math.round(axis.weight / siblingWeightTotal * 100) : null;
  const concern = (axis.concernLabel || "").trim() || "engine default concern name";
  const handleDimensionChange = (dimKey, dimMeta) => {
    onUpdate({
      ...axis,
      dimensionKey: dimKey,
      axisCode: dimKey.toUpperCase(),
      name: dimMeta?.name || dimKey.toUpperCase()
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "rounded-lg border border-border bg-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          type: "button",
          onClick: () => setOpen((v) => !v),
          className: "flex flex-1 items-center gap-2 text-left",
          children: [
            open ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            !axis.dimensionKey && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-[11px] font-semibold text-amber-500", children: "no dimension picked" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-[11px] text-muted-foreground", children: share !== null ? `\u2248${share}% of overall` : `weight ${axis.weight}` }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
              "\xB7 ",
              concern
            ] })
          ]
        }
      ),
      canDelete && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          type: "button",
          disabled,
          onClick: onDelete,
          className: "p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted/40 rounded transition-colors disabled:opacity-30",
          title: "Remove dimension",
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Trash2, { className: "h-4 w-4" })
        }
      )
    ] }),
    open && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "border-t border-border p-3 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_shared2.DimensionSelect,
          {
            value: axis.dimensionKey,
            disabled,
            onChange: handleDimensionChange,
            label: "Dimension"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1.5 mb-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Weight" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_shared2.InfoTooltip,
              {
                content: share !== null ? `Relative to the other dimensions \u2014 counts as \u2248${share}% of the overall score.` : "Relative to the other dimensions.",
                label: "About weight",
                iconClassName: "h-3 w-3"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { className: "block text-[11px] font-semibold text-muted-foreground", children: "Concern label" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_shared2.InfoTooltip,
            {
              content: "Shown when this dimension is the customer\u2019s dominant concern. Left empty, the Score Engine uses its own default name for the dimension.",
              label: "About concern label",
              iconClassName: "h-3 w-3"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            type: "text",
            disabled,
            value: axis.concernLabel ?? "",
            onChange: (e) => onUpdate({ ...axis, concernLabel: e.target.value }),
            placeholder: "Not set: the engine's default concern name is used",
            className: fieldCls
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-[10px] text-muted-foreground italic", children: "How this axis's number is computed (its sources and their weights) and turned into a letter (bands) is set in the Blending tab, not here." })
    ] })
  ] });
};
var ClinicalAxisCard = ClinicalDimensionCard;

// src/score/components/tabs/BlendingTab.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var fieldCls2 = "h-8 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring disabled:opacity-50";
var SOURCE_NAME = /^[a-z][a-z0-9_]*$/;
var BlendingTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset,
  onSaveRuleset
}) => {
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const [axes, setAxes] = (0, import_react3.useState)([]);
  const [sources, setSources] = (0, import_react3.useState)({});
  const [loaded, setLoaded] = (0, import_react3.useState)(null);
  const [newSource, setNewSource] = (0, import_react3.useState)("");
  const [isSaving, setIsSaving] = (0, import_react3.useState)(false);
  const [saveSuccess, setSaveSuccess] = (0, import_react3.useState)(false);
  const [saveError, setSaveError] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    if (activeRuleset && activeRuleset.schema) {
      try {
        const decompiled = decompileJDMToVisualComponents(activeRuleset.schema);
        setLoaded(decompiled);
        setAxes(decompiled.axes);
        setSources(decompiled.sources);
        setSaveError(null);
      } catch (err) {
        setSaveError("Could not read this ruleset: " + (err instanceof Error ? err.message : "invalid schema"));
      }
    }
  }, [activeRuleset]);
  const problems = (0, import_react3.useMemo)(() => validateBlend(sources, axes), [sources, axes]);
  const usedSources = (0, import_react3.useMemo)(() => new Set(axes.flatMap((a) => (a.inputs || []).map((i) => i.source))), [axes]);
  const sourceNames = Object.keys(sources);
  const updateAxis = (id, patch) => setAxes((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
  const updateSource = (name, patch) => setSources((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  const addSource = () => {
    const name = newSource.trim();
    if (!SOURCE_NAME.test(name) || sources[name]) return;
    setSources((prev) => ({ ...prev, [name]: { scale: [NaN, NaN], direction: "" } }));
    setNewSource("");
  };
  const removeSource = (name) => setSources((prev) => Object.fromEntries(Object.entries(prev).filter(([n]) => n !== name)));
  const handleSave = async () => {
    if (!activeRuleset || !loaded || problems.length > 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updatedSchema = compileVisualToJDM(axes, loaded.profileConfig, loaded.scoreRangeBands, loaded.severityBands, activeRuleset.schema, sources);
      await onSaveRuleset({
        id: activeRuleset.id,
        code: activeRuleset.code,
        title: activeRuleset.title,
        description: activeRuleset.description,
        brandId: activeRuleset.brandId,
        applicationId: activeRuleset.applicationId,
        status: activeRuleset.status,
        // Core's update replaces the whole row, so leaving the version out reset it to 0.
        version: activeRuleset.version,
        schema: updatedSchema
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3e3);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save blending");
    } finally {
      setIsSaving(false);
    }
  };
  if (!activeRuleset) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      import_shared3.EmptyState,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Sliders, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No grading model selected",
        description: "Create or pick a grading model to set its blending weights.",
        className: "py-16 rounded-lg border border-border bg-card"
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-semibold text-muted-foreground whitespace-nowrap", children: "Grading model" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "select",
          {
            value: activeRuleset.id,
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "h-8 max-w-md w-full truncate rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("option", { value: r.id, children: [
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-3 shrink-0", children: [
        saveSuccess && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs text-beak flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Check, { className: "h-3.5 w-3.5" }),
          "Saved"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_shared3.Button, { variant: "primary", size: "sm", onClick: handleSave, isLoading: isSaving, disabled: problems.length > 0, children: isSaving ? "Saving\u2026" : "Save blending" })
      ] })
    ] }),
    saveError && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.AlertTriangle, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "break-words", children: saveError })
    ] }),
    loaded?.convertedBlend && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-md border border-border bg-muted/30 text-[11px] text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Info, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "This ruleset uses the old form/vision blend. It is shown here converted to sources, the way the engine reads it today; saving stores it in the new format with the same scores." })
    ] }),
    problems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-md border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "font-semibold flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.AlertTriangle, { className: "h-3.5 w-3.5" }),
        "Fix before saving \u2014 the engine would refuse:"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "list-disc pl-5", children: problems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: p }, p)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Sources" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_shared3.InfoTooltip,
          {
            content: "Each kind of signal a dimension can be scored from, and how to read its raw values: the scale they arrive on and whether higher means worse (concern) or better (health). The engine turns every input into 0-100 concern before blending.",
            label: "About sources"
          }
        )
      ] }),
      sourceNames.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-[11px] text-muted-foreground italic", children: "No sources declared yet." }),
      sourceNames.map((name) => {
        const s = sources[name];
        const scale = s.scale || [NaN, NaN];
        const num = (v) => Number.isFinite(v) ? v : "";
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "w-24 truncate font-mono text-xs font-semibold text-foreground", children: name }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [
            "scale",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "number", value: num(scale[0]), onChange: (e) => updateSource(name, { scale: [e.target.value === "" ? NaN : Number(e.target.value), scale[1]] }), className: fieldCls2 + " w-20 text-center", "aria-label": `${name} scale minimum` }),
            "\u2013",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "number", value: num(scale[1]), onChange: (e) => updateSource(name, { scale: [scale[0], e.target.value === "" ? NaN : Number(e.target.value)] }), className: fieldCls2 + " w-20 text-center", "aria-label": `${name} scale maximum` })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("select", { value: s.direction || "", onChange: (e) => updateSource(name, { direction: e.target.value }), className: fieldCls2, "aria-label": `${name} direction`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: "\u2014 direction \u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "concern", children: "concern (higher = worse)" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "health", children: "health (higher = better)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              onClick: () => removeSource(name),
              disabled: usedSources.has(name),
              title: usedSources.has(name) ? "Used by a dimension \u2014 remove it there first" : "Remove source",
              className: "p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground",
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }, name);
      }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "text",
            value: newSource,
            onChange: (e) => setNewSource(e.target.value.toLowerCase()),
            onKeyDown: (e) => {
              if (e.key === "Enter") addSource();
            },
            placeholder: "new source, e.g. device",
            className: fieldCls2 + " w-48 font-mono"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: addSource,
            disabled: !SOURCE_NAME.test(newSource.trim()) || !!sources[newSource.trim()],
            className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Plus, { className: "h-3 w-3" }),
              "Add source"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "rounded-lg border border-border bg-card p-4 space-y-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Per-dimension blend" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_shared3.InfoTooltip,
          {
            content: "For each dimension, which sources its score comes from and how much each counts. Weights must add up to 100%. When a source does not arrive (e.g. no photo), its weight is shared among the ones that did; a dimension missing a required source, or every source, is not scored.",
            label: "About blending"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-[11px] text-muted-foreground", children: "e.g. Sebum: form 30%, vision 50%, device 20%." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "rounded-lg border border-border bg-card divide-y divide-border", children: [
      axes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "p-6 text-center text-xs text-muted-foreground italic", children: "This ruleset has no dimensions yet \u2014 add some in Skin Grading first." }),
      axes.map((axis) => {
        const inputs = axis.inputs || [];
        const required = axis.required || [];
        const bands = axis.bands || [];
        const sum = inputs.reduce((s, i) => s + (typeof i.weight === "number" && Number.isFinite(i.weight) ? i.weight : 0), 0);
        const sumOk = Math.abs(sum / 100 - 1) <= WEIGHT_SUM_TOLERANCE;
        const free = sourceNames.filter((n) => !inputs.some((i) => i.source === n));
        const setInputs = (next) => updateAxis(axis.id, { inputs: next, required: required.filter((r) => next.some((i) => i.source === r)) });
        const updateInput = (idx, patch) => setInputs(inputs.map((i, j) => j === idx ? { ...i, ...patch } : i));
        const addInput = () => free.length > 0 && setInputs([...inputs, { source: free[0], field: "", weight: void 0 }]);
        const toggleRequired = (src) => updateAxis(axis.id, { required: required.includes(src) ? required.filter((r) => r !== src) : [...required, src] });
        const updateBand = (id, patch) => updateAxis(axis.id, { bands: bands.map((b) => b.id === id ? { ...b, ...patch } : b) });
        const addBand = () => updateAxis(axis.id, { bands: [...bands, { id: `b_${Date.now()}`, min: 0, max: 100, letter: "" }] });
        const removeBand = (id) => updateAxis(axis.id, { bands: bands.filter((b) => b.id !== id) });
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-sm font-semibold text-foreground", children: axis.name || axis.dimensionKey.toUpperCase() }),
            inputs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: `text-[11px] font-semibold tabular-nums ${sumOk ? "text-muted-foreground" : "text-destructive"}`, children: [
              Math.round(sum * 100) / 100,
              "% ",
              sumOk ? "" : "\u2014 must be 100%"
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-amber-700 dark:text-amber-300", children: "No inputs \u2014 this dimension is not scored" })
          ] }),
          inputs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] gap-2 text-[10px] font-semibold text-muted-foreground", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Source" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Field" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-center", children: "Weight %" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-center", children: "Required" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", {})
            ] }),
            inputs.map((inp, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-[7rem_1fr_5rem_4.5rem_1.5rem] items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "select",
                {
                  value: inp.source,
                  onChange: (e) => updateInput(idx, { source: e.target.value, field: "", label: "" }),
                  className: fieldCls2 + " font-mono",
                  "aria-label": "Source",
                  children: [inp.source, ...free].filter((n, i, a) => a.indexOf(n) === i).map((n) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("option", { value: n, children: [
                    n,
                    sources[n] ? "" : " (undeclared)"
                  ] }, n))
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FieldPicker, { source: inp.source, field: inp.field, onChange: (field, label) => updateInput(idx, { field, label }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "input",
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  step: 1,
                  value: typeof inp.weight === "number" && Number.isFinite(inp.weight) ? inp.weight : "",
                  onChange: (e) => updateInput(idx, { weight: e.target.value === "" ? void 0 : Number(e.target.value) }),
                  className: fieldCls2 + " text-center tabular-nums",
                  "aria-label": `${inp.source} weight percent`
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "flex justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", checked: required.includes(inp.source), onChange: () => toggleRequired(inp.source), "aria-label": `${inp.source} required` }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => setInputs(inputs.filter((_, j) => j !== idx)), className: "p-1 text-muted-foreground hover:text-destructive", "aria-label": `Remove ${inp.source}`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, `${inp.source}-${idx}`))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              onClick: addInput,
              disabled: free.length === 0,
              title: free.length === 0 ? "Every declared source is already an input; declare another above" : void 0,
              className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded disabled:opacity-40",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Plus, { className: "h-3 w-3" }),
                "Add input"
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pt-2 border-t border-border space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "block text-[10px] font-semibold text-muted-foreground", children: "Bands (axis & threshold)" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                import_shared3.InfoTooltip,
                {
                  content: "Health-oriented (100 = optimal). Exactly 2 bands compiles to a simple threshold; 3+ compiles to a small rule table (e.g. Pore Severity's Smooth/Visible/Enlarged). Bands should be ordered and cover 0-100 with no gaps.",
                  label: "About bands"
                }
              )
            ] }),
            bands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "number", min: 0, max: 100, value: b.min, onChange: (e) => updateBand(b.id, { min: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-muted-foreground text-[10px]", children: "\u2013" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "number", min: 0, max: 100, value: b.max, onChange: (e) => updateBand(b.id, { max: Number(e.target.value) }), className: fieldCls2 + " w-16 text-center" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-muted-foreground text-[10px]", children: "\u2192" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "text", maxLength: 12, value: b.letter, onChange: (e) => updateBand(b.id, { letter: e.target.value.toUpperCase() }), placeholder: "D", className: fieldCls2 + " flex-1 min-w-0 text-center font-bold text-beak" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => removeBand(b.id), className: "p-1 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Trash2, { className: "h-3.5 w-3.5" }) })
            ] }, b.id)),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { type: "button", onClick: addBand, className: "flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Plus, { className: "h-3 w-3" }),
              "Add band"
            ] })
          ] })
        ] }, axis.id);
      })
    ] })
  ] });
};

// src/score/components/tabs/ScoreSimulatorTab.tsx
var import_react4 = require("react");
var import_lucide_react4 = require("lucide-react");
var import_shared4 = require("@gateway-experience/shared");

// src/form/api.ts
async function getSafetyFlags(routes) {
  try {
    const res = await fetch(routes.reference("conditions"), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}

// src/score/utils/safety-flags.ts
function safetyFlagsFromSurveys(surveys, surveyCode) {
  if (!Array.isArray(surveys)) return [];
  const rows = surveys;
  const selected = surveyCode ? rows.filter((s) => s.code === surveyCode) : rows;
  const flags = /* @__PURE__ */ new Set();
  for (const survey of selected) {
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
  return Array.from(flags);
}

// src/score/components/tabs/ScoreSimulatorTab.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var card = "rounded-lg border border-border bg-card p-4";
var sliderCls = "w-full h-1.5 rounded appearance-none cursor-pointer bg-muted accent-[#d97706]";
var unsetSliderCls = sliderCls + " opacity-40";
var SCORE_MIN = 0;
var SCORE_MAX = 100;
var UNSET_THUMB = (SCORE_MIN + SCORE_MAX) / 2;
var AGE_SLIDER_MIN = 13;
var AGE_SLIDER_MAX = 70;
var AGE_UNSET_THUMB = AGE_FIELD_CUTOFF_YEARS;
function withValue(prev, key, v) {
  const next = { ...prev };
  if (v === void 0) delete next[key];
  else next[key] = v;
  return next;
}
var ScoreInput = ({ label, value, onChange }) => {
  const set = value !== void 0;
  const commit = (e) => onChange(Number(e.currentTarget.value));
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between text-xs mb-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-foreground", children: label }),
      set ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-beak font-semibold font-mono", children: value }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            onClick: () => onChange(void 0),
            className: "text-[10px] text-muted-foreground underline hover:text-foreground",
            title: "Unset: send this dimension as not answered",
            children: "clear"
          }
        )
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[10px] italic text-muted-foreground", title: "Not sent to /simulate", children: "not set" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        type: "range",
        min: SCORE_MIN,
        max: SCORE_MAX,
        value: value ?? UNSET_THUMB,
        onChange: commit,
        onPointerUp: commit,
        "aria-label": set ? `${label}: ${value}` : `${label}: not set`,
        className: set ? sliderCls : unsetSliderCls
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        SCORE_MIN,
        " = parah"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
        SCORE_MAX,
        " = sehat"
      ] })
    ] })
  ] });
};
var ScoreSimulatorTab = ({
  rulesets,
  selectedRuleset,
  onSelectRuleset
}) => {
  const hostRoutes = (0, import_shared4.useHostRoutes)();
  const activeRuleset = selectedRuleset || rulesets[0] || null;
  const rulesetDims = (0, import_react4.useMemo)(() => {
    if (!activeRuleset?.schema) return [];
    try {
      const s = JSON.parse(activeRuleset.schema);
      const keys = /* @__PURE__ */ new Set([
        ...Object.keys(s.dimension_weights || {}),
        ...Object.keys(s.concern_labels || {}),
        ...Object.keys(s.axis_codes || {}),
        ...Object.keys(readBlend(s).dims)
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
  const blend = (0, import_react4.useMemo)(() => {
    try {
      return readBlend(JSON.parse(activeRuleset?.schema || "{}"), rulesetDims);
    } catch {
      return readBlend({});
    }
  }, [activeRuleset, rulesetDims]);
  const fieldOf = (0, import_react4.useCallback)(
    (d, source) => blend.dims[d]?.inputs.find((i) => i.source === source)?.field,
    [blend]
  );
  const ageAxisKeys = (0, import_react4.useMemo)(() => rulesetDims.filter((d) => fieldOf(d, FORM_SOURCE) === AGE_FIELD), [rulesetDims, fieldOf]);
  const formDims = (0, import_react4.useMemo)(
    () => rulesetDims.filter((d) => !ageAxisKeys.includes(d) && !!fieldOf(d, FORM_SOURCE)),
    [rulesetDims, fieldOf, ageAxisKeys]
  );
  const visionDims = (0, import_react4.useMemo)(() => rulesetDims.filter((d) => !!fieldOf(d, VISION_SOURCE)), [rulesetDims, fieldOf]);
  const otherSources = (0, import_react4.useMemo)(
    () => Array.from(new Set(Object.values(blend.dims).flatMap((d) => d.inputs.map((i) => i.source)))).filter((s) => s !== FORM_SOURCE && s !== VISION_SOURCE),
    [blend]
  );
  const [questionnaireValues, setQuestionnaireValues] = (0, import_shared4.usePersistentState)(
    "xg.scoreEngine.simulator.questionnaireValues",
    {}
  );
  const [visionValues, setVisionValues] = (0, import_shared4.usePersistentState)(
    "xg.scoreEngine.simulator.visionValues",
    {}
  );
  const [respondentAge, setRespondentAge] = (0, import_shared4.usePersistentState)(
    "xg.scoreEngine.simulator.respondentAgeYears",
    null
  );
  const rulesetSafetyFlags = (0, import_react4.useMemo)(() => {
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
  const formSurveyCode = (0, import_react4.useMemo)(() => {
    try {
      return JSON.parse(activeRuleset?.schema || "{}").form_survey_code || "";
    } catch {
      return "";
    }
  }, [activeRuleset]);
  const [surveySafetyFlags, setSurveySafetyFlags] = (0, import_react4.useState)([]);
  (0, import_react4.useEffect)(() => {
    if (!activeRuleset?.brandId || !activeRuleset?.applicationId) {
      setSurveySafetyFlags([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const surveys = await fetchTenantSurveys(activeRuleset.brandId, activeRuleset.applicationId);
        if (surveys === null) return;
        const flags = safetyFlagsFromSurveys(surveys, formSurveyCode);
        if (!cancelled) setSurveySafetyFlags(flags);
      } catch {
        if (!cancelled) setSurveySafetyFlags([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeRuleset?.brandId, activeRuleset?.applicationId, formSurveyCode]);
  const [catalogSafetyFlags, setCatalogSafetyFlags] = (0, import_react4.useState)([]);
  (0, import_react4.useEffect)(() => {
    getSafetyFlags(hostRoutes).then((rows) => setCatalogSafetyFlags(rows.map((r) => r.code))).catch(() => setCatalogSafetyFlags([]));
  }, [hostRoutes]);
  const allSafetyFlags = (0, import_react4.useMemo)(
    () => Array.from(/* @__PURE__ */ new Set([...rulesetSafetyFlags, ...surveySafetyFlags])),
    [rulesetSafetyFlags, surveySafetyFlags]
  );
  const [conditionChoices, setConditionChoices] = (0, import_shared4.usePersistentState)(
    "xg.scoreEngine.simulator.conditions",
    {}
  );
  const selectedConditions = (0, import_react4.useMemo)(() => {
    const keys = allSafetyFlags.length > 0 ? allSafetyFlags : catalogSafetyFlags;
    const out = {};
    for (const k of keys) out[k] = conditionChoices[k] ?? false;
    return out;
  }, [allSafetyFlags, catalogSafetyFlags, conditionChoices]);
  const [simResponse, setSimResponse] = (0, import_react4.useState)(null);
  const [copiedReq, setCopiedReq] = (0, import_react4.useState)(false);
  const formScores = (0, import_react4.useMemo)(() => {
    const out = {};
    for (const d of formDims) if (questionnaireValues[d] !== void 0) out[d] = questionnaireValues[d];
    return out;
  }, [formDims, questionnaireValues]);
  const visionScores = (0, import_react4.useMemo)(() => {
    const out = {};
    for (const d of visionDims) if (visionValues[d] !== void 0) out[d] = visionValues[d];
    return out;
  }, [visionDims, visionValues]);
  const ageYears = ageAxisKeys.length > 0 && respondentAge !== null ? respondentAge : void 0;
  const requestBody = (0, import_react4.useMemo)(
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
  const runSimulation = (0, import_react4.useCallback)(async () => {
    if (!activeRuleset?.schema) return;
    try {
      const response = await simulateRuleset({
        schema: activeRuleset.schema,
        form_scores: formScores,
        vision_scores: visionScores,
        age_years: ageYears,
        customer_condition: selectedConditions
      });
      if (response) setSimResponse(response);
    } catch (err) {
      console.error("Simulation request failed", err);
    }
  }, [activeRuleset, formScores, visionScores, ageYears, selectedConditions]);
  (0, import_react4.useEffect)(() => {
    const timer = setTimeout(runSimulation, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);
  const result = simResponse?.result;
  const dimensions = result?.dimensions || {};
  const breakdown = result?.dimension_breakdown || {};
  const breakdownKeys = Array.from(/* @__PURE__ */ new Set([...Object.keys(dimensions), ...Object.keys(breakdown)]));
  const skinProfile = result?.skin_profile;
  const subClassification = result?.sub_classification || {};
  const warnings = result?.warnings || [];
  const totalScore = typeof result?.total_score === "number" ? Math.round(result.total_score) : null;
  const profileCode = skinProfile?.code || "\u2014";
  const profileName = skinProfile?.name || "Answer to see a profile";
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col lg:flex-row gap-5 items-start", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "w-full lg:w-80 lg:shrink-0 space-y-3 min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "block text-xs font-semibold text-muted-foreground", children: "Grading model" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "select",
          {
            value: activeRuleset?.id || "",
            onChange: (e) => {
              const r = rulesets.find((item) => item.id === e.target.value);
              if (r) onSelectRuleset(r);
            },
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: rulesets.map((r) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("option", { value: r.id, children: [
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
      ageAxisKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Usia" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_shared4.InfoTooltip,
            {
              content: `Bukan slider form biasa \u2014 dihitung dari date_of_birth di kuisioner data pribadi, bukan Q1-Q6. Dikirim sebagai age_years dan dinilai oleh cek AgeOverThirty di core, dipakai axis: ${ageAxisKeys.join(", ")}.`,
              label: "About Usia"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between text-xs mb-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-foreground", children: "Umur (tahun)" }),
          respondentAge !== null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-beak font-semibold font-mono", children: [
              respondentAge,
              " (",
              respondentAge <= AGE_FIELD_CUTOFF_YEARS ? "sehat" : "faktor W",
              ")"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setRespondentAge(null),
                className: "text-[10px] text-muted-foreground underline hover:text-foreground",
                title: "Unset: send no age_years",
                children: "clear"
              }
            )
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[10px] italic text-muted-foreground", title: "No age_years is sent", children: "not set" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "range",
            min: AGE_SLIDER_MIN,
            max: AGE_SLIDER_MAX,
            value: respondentAge ?? AGE_UNSET_THUMB,
            onChange: (e) => setRespondentAge(Number(e.currentTarget.value)),
            onPointerUp: (e) => setRespondentAge(Number(e.currentTarget.value)),
            "aria-label": respondentAge !== null ? `Umur: ${respondentAge}` : "Umur: not set",
            className: respondentAge !== null ? sliderCls : unsetSliderCls
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground mt-0.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            "\u2264",
            AGE_FIELD_CUTOFF_YEARS,
            " = sehat"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            ">",
            AGE_FIELD_CUTOFF_YEARS,
            " = faktor W"
          ] })
        ] })
      ] }),
      formDims.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Questionnaire result" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_shared4.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari kuisioner (form_source). 0 = parah, 100 = sehat.", label: "About questionnaire result" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-3", children: formDims.map((dimKey) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          ScoreInput,
          {
            label: dimKey,
            value: questionnaireValues[dimKey],
            onChange: (v) => setQuestionnaireValues((p) => withValue(p, dimKey, v))
          },
          dimKey
        )) })
      ] }),
      visionDims.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Vision result" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_shared4.InfoTooltip, { content: "Per-dimensi, hanya yang dihitung dari foto vendor (vision_source). 0 = parah, 100 = sehat.", label: "About vision result" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-3", children: visionDims.map((dimKey) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          ScoreInput,
          {
            label: dimKey,
            value: visionValues[dimKey],
            onChange: (v) => setVisionValues((p) => withValue(p, dimKey, v))
          },
          dimKey
        )) })
      ] }),
      otherSources.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " text-[11px] text-muted-foreground", children: [
        "The simulator cannot send ",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-mono", children: otherSources.join(", ") }),
        " yet, so those inputs count as missing and their weight is shared among the sources above."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card + " space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Safety flags" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "grid grid-cols-2 gap-2 text-xs", children: Object.entries(selectedConditions).map(([key, isChecked]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => setConditionChoices((p) => ({ ...p, [key]: !isChecked })),
            className: `p-2.5 rounded-md border text-left transition-colors flex items-center justify-between ${isChecked ? "border-beak/50 bg-beak/10 text-beak" : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: key }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "w-full lg:flex-1 space-y-3 min-w-0", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Result" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2", children: [
            simResponse?.performance && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[11px] text-muted-foreground font-mono", children: simResponse.performance }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
              "button",
              {
                type: "button",
                onClick: copyRequest,
                title: `POST ${SIMULATE_PATH}`,
                className: "flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                children: [
                  copiedReq ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Copy, { className: "h-3 w-3" }),
                  copiedReq ? "Copied" : "Copy request"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("p", { className: "mt-1 text-[10px] text-muted-foreground font-mono", children: [
          "POST ",
          SIMULATE_PATH
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-4 text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-center gap-1.5", children: [
            skinProfile?.category && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[10px] font-semibold text-muted-foreground", children: skinProfile.category }),
            skinProfile && !skinProfile.complete && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[10px] font-semibold text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5", children: "Incomplete" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-2xl font-black tracking-tight text-foreground font-mono my-1", children: profileCode }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs font-semibold text-foreground", children: profileName }),
          skinProfile?.description && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed", children: skinProfile.description })
        ] }),
        skinProfile?.axis_values && Object.keys(skinProfile.axis_values).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h4", { className: "text-[11px] font-semibold text-muted-foreground mb-2", children: "Axis codes" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex flex-wrap gap-2 text-xs", children: Object.entries(skinProfile.axis_values).map(([axis, val]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "div",
            {
              className: "min-w-[4.5rem] flex-1 rounded-md border border-border bg-muted/20 p-2.5 text-center",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-muted-foreground text-[10px] truncate", children: axis }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-sm font-bold text-beak font-mono mt-0.5", children: String(val) })
              ]
            },
            axis
          )) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-4 rounded-md border border-border bg-muted/20 p-2.5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-[10px] text-muted-foreground", children: "Overall score" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-sm font-bold text-foreground font-mono mt-0.5", children: totalScore ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-[10px] text-muted-foreground", children: "100 = sehat" })
        ] }),
        warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-[10px] font-semibold text-amber-500", children: "Warnings" }),
          warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-amber-500/90 font-mono text-[11px]", children: w }, w))
        ] }),
        Object.keys(subClassification).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "mt-3 rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-[10px] text-muted-foreground mb-0.5", children: "Sub-classification" }),
          Object.entries(subClassification).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-foreground", children: k }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-muted-foreground font-mono", children: v === null ? "\u2014" : String(v) })
          ] }, k))
        ] })
      ] }),
      breakdownKeys.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h3", { className: "text-sm font-bold text-foreground mb-3", children: "Dimension breakdown" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "space-y-2", children: breakdownKeys.map((dimKey) => {
          const d = dimensions[dimKey];
          const b = breakdown[dimKey];
          const contributions = Object.entries(b?.contributions || d?.contributions || {}).sort((x, y) => y[1].weight - x[1].weight);
          const missing = b?.missing || d?.missing || [];
          const scored = b ? b.scored : d?.scored !== false && d?.final_score !== null;
          const finalScore = d?.final_score ?? b?.score;
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 p-2.5 text-xs space-y-1.5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-foreground font-semibold truncate", children: dimKey }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 shrink-0 font-mono", children: [
                scored ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-beak font-semibold", title: "final score (100 = healthy)", children: typeof finalScore === "number" ? Math.round(finalScore * 10) / 10 : "\u2014" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-muted-foreground text-[11px] font-sans", children: "Not scored" }),
                d?.axis && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-foreground font-semibold bg-card border border-border rounded px-1.5 py-0.5", children: d.axis })
              ] })
            ] }),
            contributions.map(([src, c]) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 text-[10px]", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "w-16 truncate font-mono text-muted-foreground", children: src }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "block h-full rounded-full bg-beak", style: { width: `${Math.max(0, Math.min(1, c.weight)) * 100}%` } }) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "w-10 text-right font-mono text-muted-foreground", children: [
                Math.round(c.weight * 1e3) / 10,
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "w-10 text-right font-mono text-foreground", children: Math.round(c.score * 10) / 10 })
            ] }, src)),
            missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "text-[10px] text-amber-600 dark:text-amber-400", children: [
              "Missing: ",
              missing.join(", ")
            ] }),
            !scored && (b?.reason || d?.reason) && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-[10px] text-muted-foreground", children: b?.reason || d?.reason })
          ] }, dimKey);
        }) })
      ] })
    ] })
  ] });
};

// src/score/components/modals/RulesetModal.tsx
var import_react6 = require("react");
var import_lucide_react6 = require("lucide-react");
var import_shared6 = require("@gateway-experience/shared");

// src/score/components/reusable/BandTable.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "rounded-md border border-border bg-card divide-y divide-border", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "w-24 shrink-0", children: "Score" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "flex-1", children: "Label" }),
      !fixed && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "w-6 shrink-0", "aria-hidden": "true" })
    ] }),
    bands.map((b, idx) => {
      const lower = idx === 0 ? 0 : bands[idx - 1].max + 1;
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex w-24 shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "w-6 text-right", children: lower }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: "\u2013" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
        !fixed && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
    !fixed && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "px-3 py-1.5", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
var import_react5 = __toESM(require("react"));
var import_lucide_react5 = require("lucide-react");
var import_shared5 = require("@gateway-experience/shared");
var import_jsx_runtime6 = require("react/jsx-runtime");
var ProfileMappingTable = ({
  axes,
  config,
  onChange,
  scoreRangeBands,
  severityBands,
  disabled = false
}) => {
  const { strategy, profiles } = config;
  const rangeLetters = (0, import_react5.useMemo)(() => scoreRangeLetters(scoreRangeBands), [scoreRangeBands]);
  const lettersOf = (a) => axisLetters(a, rangeLetters);
  const severityLabels = (0, import_react5.useMemo)(
    () => severityBands.slice().sort((x, y) => x.max - y.max).map((b) => b.label.trim()).filter(Boolean),
    [severityBands]
  );
  const [expandedRows, setExpandedRows] = (0, import_react5.useState)({});
  const [cache, setCache] = (0, import_react5.useState)({});
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
      if (newStrategy === "combination_matrix") {
        initialProfiles = generateCartesianCombinations(axes, rangeLetters);
      } else if (newStrategy === "primary_concern") {
        initialProfiles = axes.filter((a) => a.dimensionKey).map((a, idx) => ({
          id: `prof_${Date.now()}_${idx + 1}`,
          primaryDimension: a.dimensionKey,
          severityLevel: "",
          code: `${a.dimensionKey.toUpperCase()}_CONCERN`,
          title: `${a.name || a.dimensionKey} concern`,
          category: "",
          summary: ""
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
      const max = last && last.minScore !== void 0 ? Math.max(0, last.minScore - 1) : 100;
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
        const first = lettersOf(a)[0];
        if (a.dimensionKey && first) dimCodes[a.dimensionKey] = first;
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
        primaryDimension: "",
        severityLevel: "",
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
    const generated = generateCartesianCombinations(axes, rangeLetters);
    onChange({
      ...config,
      profiles: generated
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "bg-card p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { className: "text-sm font-bold text-foreground block", children: "How the profile is chosen" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          import_shared5.InfoTooltip,
          {
            content: "Sets skin_profile.code and skin_profile.name \u2014 a different result than Score Range and Severity Level above, which only set score_range and severity_level. 'Total Score' reads the same overall score as those two, just to pick a different output.",
            label: "About profile strategy"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center gap-1.5 bg-muted/40 p-1 rounded-md border border-border shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("total_score"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "total_score" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Total Score"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            disabled,
            onClick: () => handleStrategyChange("combination_matrix"),
            className: `px-3 py-1.5 rounded text-xs font-semibold transition-colors ${strategy === "combination_matrix" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`,
            children: "Combination Matrix"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "text-[11px] text-muted-foreground -mt-2", children: "Only the highlighted method above is saved to this ruleset \u2014 the other two are kept in this browser tab so you can switch back without losing what you typed, but they're discarded on reload." }),
    strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "text-[11px] text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2", children: [
      `"Trigger range" reads the same overall score as the Score Range / Severity Level labels above, but this table picks the profile's own`,
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "font-mono", children: "skin_profile.code" }),
      " /",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "font-mono", children: "skin_profile.name" }),
      " \u2014 a different result than",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "font-mono", children: "score_range" }),
      " /",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "font-mono", children: "severity_level" }),
      ". Editing one does not change the others."
    ] }),
    strategy === "combination_matrix" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-between bg-muted/40 border border-border p-2.5 rounded-lg", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-xs text-muted-foreground", children: [
        "One row per combination of ",
        axes.length,
        " dimensions (",
        profiles.length,
        " rows)."
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "border border-border rounded-lg overflow-hidden bg-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
        "table",
        {
          className: `${wide ? "min-w-full" : "w-full"} text-left text-xs border-collapse`,
          style: wide ? { width: "max-content" } : void 0,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("tr", { className: "bg-muted/40 border-b border-border text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3 text-center", style: { width: 40 }, children: "#" }),
              strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 160 }, children: "Trigger range" }),
              strategy === "combination_matrix" && axes.map((a) => {
                const letters = lettersOf(a);
                return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
                  "th",
                  {
                    className: "py-2.5 px-3 text-center whitespace-nowrap",
                    style: { minWidth: 120 },
                    children: [
                      a.name || a.dimensionKey,
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "block text-[10px] font-normal text-muted-foreground", children: letters.length ? letters.join(" / ") : "no letters" })
                    ]
                  },
                  a.id
                );
              }),
              strategy === "primary_concern" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 224 }, children: "Dimension" }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Level" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: "Code" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: "Name" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("th", { className: "py-2.5 px-3 text-center", style: { width: 80 } })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tbody", { className: "divide-y divide-border", children: profiles.map((p, pIdx) => {
              const isExpanded = !!expandedRows[p.id];
              return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_react5.default.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("tr", { className: "hover:bg-muted/40 transition-colors", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3 text-center text-muted-foreground font-semibold", children: pIdx + 1 }),
                  strategy === "total_score" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    import_shared5.ScoreRangeInput,
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
                    const codeVal = p.dimensionCodes?.[a.dimensionKey] || p.dimensionCodes?.[a.axisCode] || "";
                    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "input",
                      {
                        type: "text",
                        disabled,
                        value: codeVal,
                        onChange: (e) => handleUpdateDimCode(p.id, a.dimensionKey, e.target.value),
                        placeholder: "any",
                        className: "w-12 px-1.5 py-1 bg-muted/40 border border-border rounded text-beak font-bold text-center focus:outline-none focus:border-ring disabled:opacity-50 text-xs"
                      }
                    ) }, a.id);
                  }),
                  strategy === "primary_concern" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      import_shared5.DimensionSelect,
                      {
                        label: "",
                        value: p.primaryDimension || "",
                        placeholder: "Any dimension",
                        disabled,
                        onChange: (dimKey) => handleUpdateProfile(p.id, "primaryDimension", dimKey)
                      }
                    ) }),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2 px-3 align-middle", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      import_shared5.SeveritySelect,
                      {
                        value: p.severityLevel || "",
                        options: severityLabels,
                        emptyLabel: "Any level",
                        disabled,
                        onChange: (sev) => handleUpdateProfile(p.id, "severityLevel", sev)
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3", style: { minWidth: 150 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3", style: { minWidth: 240 }, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        type: "button",
                        onClick: () => toggleRow(p.id),
                        className: `p-1.5 rounded transition-colors ${isExpanded ? "text-beak bg-beak/10 border border-beak/40" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`,
                        title: "Show category & description",
                        children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.ChevronRight, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        type: "button",
                        disabled: disabled || profiles.length <= 1,
                        onClick: () => handleDeleteProfile(p.id),
                        className: "p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 rounded transition-colors",
                        title: "Delete Profile Row",
                        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }) })
                ] }),
                isExpanded && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("tr", { className: "bg-muted/40 border-b border-border", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                  "td",
                  {
                    colSpan: strategy === "combination_matrix" ? axes.length + 4 : strategy === "primary_concern" ? 6 : 5,
                    className: "px-4 py-3",
                    children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-xs", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Category" }),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
                      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "md:col-span-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("label", { className: "text-muted-foreground text-[11px] font-semibold block mb-1", children: "Description" }),
                        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-2.5 bg-muted/40 border-t border-border flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "button",
          {
            type: "button",
            disabled,
            onClick: handleAddProfile,
            className: "px-2.5 py-1 bg-card hover:bg-muted text-foreground rounded text-xs font-medium flex items-center gap-1 transition-colors border border-border disabled:opacity-50",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react5.Plus, { className: "h-3 w-3" }),
              "Add profile"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "text-[11px] text-muted-foreground", children: [
          profiles.length,
          " profiles"
        ] })
      ] })
    ] })
  ] });
};
var MAX_COMBINATIONS = 64;
function axisLetters(a, rangeLetters) {
  const own = Array.from(new Set((a.bands || []).map((b) => (b.letter || "").trim().toUpperCase()).filter(Boolean)));
  if (own.length) return own;
  const low = (a.axisCodeLow || "").trim().toUpperCase();
  const high = (a.axisCodeHigh || "").trim().toUpperCase();
  return low && high ? [low, high] : rangeLetters;
}
function generateCartesianCombinations(axes, rangeLetters) {
  const lettered = axes.filter((a) => a.dimensionKey && axisLetters(a, rangeLetters).length > 0);
  if (lettered.length === 0) return [];
  const dimTierArrays = lettered.map((a) => {
    return axisLetters(a, rangeLetters).map((code) => ({ dimKey: a.dimensionKey, code }));
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
var import_jsx_runtime7 = require("react/jsx-runtime");
var inputCls = "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-ring disabled:opacity-50";
var labelCls = "block text-xs font-semibold text-foreground mb-1.5";
var SIMULATE_SCORE_PLACEHOLDER = "<health score 0-100, or remove if not answered>";
var slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
var RulesetModal = ({
  isOpen,
  onClose,
  onSave,
  editingRuleset
}) => {
  const [name, setName] = (0, import_react6.useState)("");
  const [code, setCode] = (0, import_react6.useState)("");
  const [codeEdited, setCodeEdited] = (0, import_react6.useState)(false);
  const [showCodeField, setShowCodeField] = (0, import_react6.useState)(false);
  const [description, setDescription] = (0, import_react6.useState)("");
  const [brandId, setBrandId] = (0, import_react6.useState)("*");
  const [applicationId, setApplicationId] = (0, import_react6.useState)("*");
  const [status, setStatus] = (0, import_react6.useState)("ACTIVE");
  const [formSurveyCode, setFormSurveyCode] = (0, import_react6.useState)("");
  const [visionSourceCode, setVisionSourceCode] = (0, import_react6.useState)("");
  const [surveys, setSurveys] = (0, import_react6.useState)([]);
  const [axes, setAxes] = (0, import_react6.useState)([]);
  const [profileConfig, setProfileConfig] = (0, import_react6.useState)(EMPTY_PROFILE_CONFIG);
  const [scoreRangeBands, setScoreRangeBands] = (0, import_react6.useState)(DEFAULT_SCORE_RANGE_BANDS);
  const [severityBands, setSeverityBands] = (0, import_react6.useState)(DEFAULT_SEVERITY_BANDS);
  const [tab, setTab] = (0, import_react6.useState)("setup");
  const [schemaOpen, setSchemaOpen] = (0, import_react6.useState)(true);
  const notesRef = (0, import_react6.useRef)(null);
  const fitNotes = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [copied, setCopied] = (0, import_react6.useState)(null);
  const [isSubmitting, setIsSubmitting] = (0, import_react6.useState)(false);
  const [formError, setFormError] = (0, import_react6.useState)(null);
  const [isLegacy, setIsLegacy] = (0, import_react6.useState)(false);
  (0, import_react6.useEffect)(() => {
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
      setAxes([]);
      setProfileConfig({ ...EMPTY_PROFILE_CONFIG, profiles: [] });
      setScoreRangeBands(DEFAULT_SCORE_RANGE_BANDS);
      setSeverityBands(DEFAULT_SEVERITY_BANDS);
      setIsLegacy(false);
      setFormSurveyCode("");
      setVisionSourceCode("");
    }
    setTab("setup");
    setFormError(null);
  }, [editingRuleset, isOpen]);
  (0, import_react6.useEffect)(() => {
    fitNotes(notesRef.current);
  }, [description, tab, isOpen]);
  (0, import_react6.useEffect)(() => {
    if (!isOpen) return;
    fetchTenantSurveys(brandId, applicationId).then((data) => setSurveys(surveyList(data))).catch(() => setSurveys([]));
  }, [isOpen, brandId, applicationId]);
  const effectiveCode = codeEdited ? code : slugify(name);
  const totalWeight = axes.reduce((sum, a) => sum + (Number(a.weight) || 0), 0);
  const addAxis = () => {
    const n = axes.length + 1;
    setAxes((prev) => [
      ...prev,
      {
        id: `axis_${Date.now()}`,
        axisCode: "",
        name: `Dimension ${n}`,
        dimensionKey: "",
        weight: 1
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
    if (axes.length === 0) {
      setTab("dimensions");
      return setFormError("Add at least one dimension.");
    }
    if (axes.some((a) => !(a.dimensionKey || "").trim())) {
      setTab("dimensions");
      return setFormError("Pick a dimension for every row before saving.");
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
        // Core's update replaces the whole row, so leaving the version out reset it to 0.
        ...editingRuleset ? { version: editingRuleset.version } : {},
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
      form_scores: Object.fromEntries(
        axes.filter((a) => a.dimensionKey).map((a) => [a.dimensionKey.toLowerCase(), SIMULATE_SCORE_PLACEHOLDER])
      ),
      vision_scores: {},
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
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_shared6.Modal,
    {
      isOpen,
      onClose,
      title: editingRuleset ? `Edit: ${editingRuleset.title}` : "New grading model",
      maxWidth: "max-w-5xl",
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        isLegacy && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "p-3 rounded-md border border-beak/40 bg-beak/10 text-xs text-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.AlertTriangle, { className: "h-4 w-4 shrink-0 text-beak" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
            "Ruleset ini dibuat dengan format lama. Dimensi, band, dan profil di bawah adalah hasil konversi terbaik \u2014 periksa dulu sebelum ",
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { children: "Save changes" }),
            ", karena menyimpan akan menulis ulang ruleset ke format baru."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex flex-col lg:flex-row gap-4 items-start", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "w-full lg:flex-1 min-w-0 space-y-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1", children: [
              ["setup", "Setup"],
              ["dimensions", `Dimensions${axes.length ? ` (${axes.length})` : ""}`],
              ["bands", "Skin Profile"]
            ].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setTab(id),
                className: `flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
                children: label
              },
              id
            )) }),
            tab === "setup" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: labelCls, children: [
                  "Name ",
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-destructive", children: "*" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g. Brand skin grading",
                    className: inputCls
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "mt-1 text-[11px] text-muted-foreground", children: [
                  "saved as ",
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-foreground font-mono", children: effectiveCode || "\u2026" }),
                  !editingRuleset && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
                showCodeField && !editingRuleset && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
                editingRuleset?.id && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "button",
                  {
                    type: "button",
                    onClick: () => copyAs("ID", editingRuleset.id),
                    title: "Copy ID \u2014 needed for PUT /core/score-engine/rulesets/:id",
                    className: "mt-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground",
                    children: [
                      copied === "ID" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Copy, { className: "h-3 w-3" }),
                      copied === "ID" ? "ID copied" : `ID ${editingRuleset.id}`
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "max-w-xs", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: labelCls, children: "Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_shared6.StatusSelect, { value: status, onChange: setStatus, label: "" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-md border border-border bg-muted/20", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "px-3 py-2 text-xs font-semibold text-muted-foreground", children: "Scope & notes" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "border-t border-border p-3 space-y-3", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_shared6.BrandSelect, { value: brandId, onChange: setBrandId, includeUniversal: true, label: "Brand" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      import_shared6.ApplicationSelect,
                      {
                        value: applicationId,
                        onChange: setApplicationId,
                        includeUniversal: true,
                        label: "Application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: labelCls + " mb-0", children: "Form input" }),
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                          import_shared6.InfoTooltip,
                          {
                            content: "Which Form Engine survey this ruleset pairs with. Scopes what shows up when adding/wiring a dimension's Form source in Blending.",
                            label: "About Form input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                        "select",
                        {
                          value: formSurveyCode,
                          onChange: (e) => setFormSurveyCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: "\u2014 none selected \u2014" }),
                            surveys.map((s) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("option", { value: s.code, children: [
                              s.title || s.name || s.code,
                              " (",
                              s.code,
                              ")"
                            ] }, s.code))
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: labelCls + " mb-0", children: "Vision input" }),
                        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                          import_shared6.InfoTooltip,
                          {
                            content: "Which CV/vendor source this ruleset pairs with. Only one is registered today (Paradev Skin Analyzer) \u2014 more get added as new vendors are wired up.",
                            label: "About Vision input"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                        "select",
                        {
                          value: visionSourceCode,
                          onChange: (e) => setVisionSourceCode(e.target.value),
                          className: inputCls,
                          style: { colorScheme: "dark" },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "", children: "\u2014 none selected \u2014" }),
                            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "paradev_skin_analyzer", children: "Paradev Skin Analyzer" })
                          ]
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { className: labelCls, children: "Notes" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
            tab === "dimensions" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-sm font-bold text-foreground", children: "Dimensions" }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    import_shared6.InfoTooltip,
                    {
                      content: "Weights are relative \u2014 a dimension\u2019s share of the overall score is its weight \xF7 the total of all weights. The concern label is what the customer sees when that dimension is their dominant concern. Form/Vision blend per dimension moved to the Blending tab.",
                      label: "About dimensions"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  import_shared6.Button,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: addAxis,
                    leftIcon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Plus, { className: "h-3.5 w-3.5" }),
                    children: "Add dimension"
                  }
                )
              ] }),
              axes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground", children: "No dimensions yet. Add one and pick it from reference data." }),
              axes.map((axis, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                ClinicalAxisCard,
                {
                  axis,
                  index: i,
                  defaultOpen: axes.length === 1 || !axis.dimensionKey,
                  siblingWeightTotal: totalWeight,
                  onUpdate: (updated) => setAxes((prev) => prev.map((a) => a.id === axis.id ? updated : a)),
                  onDelete: () => {
                    setAxes((prev) => prev.filter((a) => a.id !== axis.id));
                    setFormError(null);
                  },
                  canDelete: true
                },
                axis.id
              ))
            ] }),
            tab === "bands" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "text-base font-bold text-foreground", children: "Skin Profile" }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    import_shared6.InfoTooltip,
                    {
                      content: "Everything here is derived from the same overall score (0-100). The two label tables below just name a bracket of that score; the method further down decides skin_profile.code/name, the actual profile result.",
                      label: "About Skin Profile"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "text-[11px] text-muted-foreground", children: "Score Range and Severity Level are two labels for the same overall score \u2014 handy for a quick badge, not required by the profile method below." })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Score Range label" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      import_shared6.InfoTooltip,
                      {
                        content: "Sets score_range only \u2014 a coarse 3-tier badge for the overall score.",
                        label: "About Score Range"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(BandTable, { bands: scoreRangeBands, onChange: setScoreRangeBands, idPrefix: "sr" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Severity Level label" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      import_shared6.InfoTooltip,
                      {
                        content: "Sets severity_level only \u2014 a finer 5-tier badge for the same overall score.",
                        label: "About Severity Level"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(BandTable, { bands: severityBands, onChange: setSeverityBands, idPrefix: "sv" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1.5 border-t border-border pt-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { className: "text-xs font-semibold text-foreground", children: "Profile method" }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                    import_shared6.InfoTooltip,
                    {
                      content: "Decides skin_profile.code and skin_profile.name \u2014 the actual profile result, separate from the two labels above. Only one method runs at a time: they'd otherwise write conflicting values to the same code/name.",
                      label: "About profile method"
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  ProfileMappingTable,
                  {
                    axes,
                    config: profileConfig,
                    onChange: setProfileConfig,
                    scoreRangeBands,
                    severityBands
                  }
                )
              ] })
            ] })
          ] }),
          !schemaOpen ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
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
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.PanelRightOpen, { className: "h-3.5 w-3.5", style: { flexShrink: 0 } }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }, children: "Schema & API" })
              ]
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-full lg:w-64 lg:shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "rounded-md border border-border bg-muted/20 lg:sticky lg:top-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => setSchemaOpen(false),
                className: "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Schema & API" }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.PanelRightClose, { className: "h-3.5 w-3.5 shrink-0" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "border-t border-border", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "flex flex-wrap items-center gap-1.5 px-3 py-2", children: [
                { label: "Schema", text: jsonText },
                { label: "Copy request body", text: createRequestBody },
                { label: "Simulate request", text: simulateRequestBody }
              ].map(({ label, text }) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => copyAs(label, text),
                  className: "flex items-center gap-1 rounded border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-beak/50",
                  children: [
                    copied === label ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Check, { className: "h-3 w-3 text-beak" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Copy, { className: "h-3 w-3" }),
                    copied === label ? "Copied" : label
                  ]
                },
                label
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
        formError && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "p-3 rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.AlertTriangle, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: formError })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-border", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_shared6.Button, { type: "button", variant: "outline", size: "sm", onClick: onClose, children: "Cancel" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_shared6.Button, { type: "submit", variant: "primary", size: "sm", isLoading: isSubmitting, disabled: !name.trim(), children: editingRuleset ? "Save changes" : "Create" })
        ] })
      ] })
    }
  );
};

// src/score/components/ScoreManager.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var ScoreManager = () => {
  const [activeTab, setActiveTab] = (0, import_shared7.usePersistentState)("xg.scoreEngine.activeTab", "rulesets");
  const [searchQuery, setSearchQuery] = (0, import_react7.useState)("");
  const [rulesets, setRulesets] = (0, import_react7.useState)([]);
  const [selectedRulesetId, setSelectedRulesetId] = (0, import_shared7.usePersistentState)("xg.scoreEngine.selectedRulesetId", null);
  const selectedRuleset = rulesets.find((r) => r.id === selectedRulesetId) ?? null;
  const setSelectedRuleset = (r) => setSelectedRulesetId(r?.id ?? null);
  const [isRulesetModalOpen, setIsRulesetModalOpen] = (0, import_react7.useState)(false);
  const [editingRuleset, setEditingRuleset] = (0, import_react7.useState)(null);
  const [deleteConfirm, setDeleteConfirm] = (0, import_react7.useState)({
    isOpen: false,
    title: "",
    message: "",
    isLoading: false,
    onConfirm: () => {
    }
  });
  const loadRulesets = (0, import_react7.useCallback)(() => {
    listRulesets().then((list) => {
      if (list) setRulesets(list);
    }).catch(() => {
    });
  }, []);
  (0, import_react7.useEffect)(() => {
    loadRulesets();
  }, [loadRulesets]);
  const scoreTabs = [
    {
      id: "rulesets",
      label: "Skin Grading",
      icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Sliders, { className: "h-4 w-4" }),
      badge: rulesets.length
    },
    {
      id: "blending",
      label: "Blending",
      icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.SlidersHorizontal, { className: "h-4 w-4" })
    },
    {
      id: "simulator",
      label: "Simulator",
      icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Play, { className: "h-4 w-4" })
    }
  ];
  const handleSaveRuleset = async (rulesetData) => {
    await saveRuleset(rulesetData);
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
          await deleteRuleset(id);
          loadRulesets();
        } catch (err) {
          alert(err.message);
        } finally {
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      import_shared7.PageHeader,
      {
        icon: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/api-client" },
          { label: "Core Engines" },
          { label: "Score Engine" }
        ],
        title: "Score Engine",
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_shared7.TabNav,
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
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("main", { className: "flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto", children: [
      activeTab === "rulesets" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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
      activeTab === "blending" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        BlendingTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset,
          onSaveRuleset: handleSaveRuleset
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        ScoreSimulatorTab,
        {
          rulesets,
          selectedRuleset,
          onSelectRuleset: setSelectedRuleset
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      RulesetModal,
      {
        isOpen: isRulesetModalOpen,
        onClose: () => setIsRulesetModalOpen(false),
        onSave: handleSaveRuleset,
        editingRuleset
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      import_shared7.ConfirmDialog,
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
var import_react8 = require("react");
var import_lucide_react8 = require("lucide-react");
var import_shared8 = require("@gateway-experience/shared");
var import_jsx_runtime9 = require("react/jsx-runtime");
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
  const [customize, setCustomize] = (0, import_react8.useState)(false);
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
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "rounded-md border border-border bg-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center justify-between px-3 py-2 border-b border-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "text-[11px] font-semibold text-muted-foreground", children: "Score \u2192 level" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "button",
        {
          type: "button",
          onClick: () => setCustomize((v) => !v),
          className: "text-[11px] text-muted-foreground hover:text-foreground underline",
          children: customize ? "Done" : "Customize levels"
        }
      )
    ] }),
    !customize && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-3 px-3 py-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "w-16 shrink-0 text-xs tabular-nums text-muted-foreground", children: [
        tier.minScore,
        "\u2013",
        tier.maxScore
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
      showValueCode && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "w-7 shrink-0 text-center text-xs font-semibold text-beak", children: tier.valueCode }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "w-36 shrink-0 text-right text-[11px] text-muted-foreground", children: SEV_LABEL[tier.severity] ?? tier.severity })
    ] }, tier.id)) }),
    customize && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { minWidth: rowMinWidth }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "shrink-0", style: { width: W_RANGE }, children: "Range" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "flex-1 min-w-0", children: "Label" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "shrink-0", style: { width: W_SEVERITY }, children: "Severity" }),
        showValueCode && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "shrink-0 text-center", style: { width: W_CODE }, children: "Code" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "shrink-0", style: { width: W_TAG }, children: "Tag" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "shrink-0", style: { width: W_DELETE }, "aria-hidden": "true" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "divide-y divide-border", children: tiers.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "flex items-center gap-2 px-3 py-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "shrink-0", style: { width: W_RANGE }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared8.ScoreRangeInput,
          {
            minScore: tier.minScore,
            maxScore: tier.maxScore,
            disabled,
            onChange: (min, max) => update(tier.id, { minScore: min, maxScore: max })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "shrink-0", style: { width: W_SEVERITY }, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          import_shared8.SeveritySelect,
          {
            value: tier.severity,
            disabled,
            onChange: (sev) => update(tier.id, { severity: sev })
          }
        ) }),
        showValueCode && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          "button",
          {
            type: "button",
            disabled: disabled || tiers.length <= 1,
            onClick: () => tiers.length > 1 && onChange(tiers.filter((t) => t.id !== tier.id)),
            className: "shrink-0 flex h-7 items-center justify-center rounded text-muted-foreground hover:text-destructive disabled:opacity-30",
            style: { width: W_DELETE },
            title: "Remove level",
            children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react8.Trash2, { className: "h-3.5 w-3.5" })
          }
        )
      ] }, tier.id)) })
    ] }) }),
    customize && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "px-3 py-2 border-t border-border", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
      "button",
      {
        type: "button",
        disabled,
        onClick: addLevel,
        className: "text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_lucide_react8.Plus, { className: "h-3 w-3" }),
          "Add level"
        ]
      }
    ) })
  ] });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BandTable,
  BlendingTab,
  ClinicalAxisCard,
  ClinicalDimensionCard,
  DEFAULT_SCORE_RANGE_BANDS,
  DEFAULT_SEVERITY_BANDS,
  EMPTY_PROFILE_CONFIG,
  ProfileMappingTable,
  ScoreManager,
  SeverityTierTable,
  compileVisualToJDM,
  decompileJDMToVisual,
  decompileJDMToVisualComponents
});
//# sourceMappingURL=index.js.map