import { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Play, Plus, ChevronUp, ChevronDown, Pencil, Trash2, ChevronRight, X, Flag } from 'lucide-react';
import { usePersistentState, PageHeader, TabNav, BrandSelect, ApplicationSelect, InfoTooltip, ConfirmDialog, SearchFilterBar, EmptyState, readPersisted, Modal, Button } from '@gateway-experience/shared';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

// src/form/catalog.ts
var FALLBACK_DIMENSIONS = [
  { code: "sebum", label: "Sebum / Oiliness", purpose: "How oily or dry the skin is." },
  { code: "sensitivity", label: "Sensitivity / Redness", purpose: "How reactive the skin is to products and environment." },
  { code: "pigmentation", label: "Pigment Level", purpose: "How much uneven pigment or dark spots are present." },
  { code: "dark_spot", label: "Dark Spot Tendency", purpose: "Whether the skin scars or darkens easily." },
  { code: "pores", label: "Pores / Texture", purpose: "How visible pores are and how rough the skin feels." },
  { code: "acne", label: "Acne", purpose: "Presence and severity of active breakouts." },
  { code: "wrinkle", label: "Wrinkles / Fine Lines", purpose: "Visible ageing signs such as fine lines." }
];
var getDimensionMeta = (code, extra = []) => [...extra, ...FALLBACK_DIMENSIONS].find((d) => d.code === code) || {
  code,
  label: code,
  purpose: "Measure this aspect of the skin."
};
var CALCULATION_METHODS = [
  { value: "sum", label: "Sum", hint: "Add every answer score together." },
  { value: "average", label: "Average", hint: "Total divided by the number of answered questions." },
  { value: "max", label: "Highest", hint: "Take the single highest answer score." },
  { value: "min", label: "Lowest", hint: "Take the single lowest answer score." },
  { value: "boolean_or", label: "Boolean OR", hint: "Any answer scores above 0 \u2192 100, otherwise 0." },
  { value: "boolean_and", label: "Boolean AND", hint: "All answers score above 0 \u2192 100, otherwise 0." }
];
var applyCalculationMethod = (scores, method = "sum") => {
  const clamp = (n) => Math.max(0, Math.min(100, n));
  const total = scores.reduce((a, b) => a + b, 0);
  switch (method) {
    case "average":
      return clamp(scores.length ? total / scores.length : 0);
    case "max":
      return clamp(scores.length ? Math.max(...scores) : 0);
    case "min":
      return clamp(scores.length ? Math.min(...scores) : 0);
    case "boolean_or":
      return scores.some((s) => s > 0) ? 100 : 0;
    case "boolean_and":
      return scores.length > 0 && scores.every((s) => s > 0) ? 100 : 0;
    default:
      return clamp(total);
  }
};
var opt = (label, value, score) => ({ label, value, score });
var abc = (id, label, dimension, choices) => ({
  id,
  type: "single_choice",
  label,
  dimension,
  options: [
    opt(choices[0], `${id}_a`, 1),
    opt(choices[1], `${id}_b`, 2),
    opt(choices[2], `${id}_c`, 3)
  ]
});
var sebumCharacter = {
  id: "sebum_character",
  type: "multi_choice",
  label: "Check every statement that matches your facial skin (select all that apply).",
  dimension: "sebum",
  options: [
    opt("I can use any cleanser without feeling dry", "sebum_any_cleanser", 2),
    opt("I do not use any product after cleansing", "sebum_no_product", 1),
    opt("I never or only occasionally use moisturizer", "sebum_rare_moist", 2),
    opt("I use facial moisturizer once a day", "sebum_moist_1x", -1),
    opt("I use facial moisturizer twice a day", "sebum_moist_2x", -2),
    opt("My facial skin is rough or dry", "sebum_rough_dry", -2),
    opt("My facial skin is oily in some areas", "sebum_oily_areas", 2),
    opt("My face is very oily", "sebum_very_oily", 3),
    opt("My face feels uncomfortable without moisturizer", "sebum_uncomfortable", -2),
    opt("I like the feel of rich creams and/or oils on my skin", "sebum_likes_rich", -3),
    opt("None of the above", "sebum_none", 0)
  ]
};
var sensitivityChecklist = {
  id: "sensitivity_checklist",
  type: "multi_choice",
  label: "Tick any condition you are prone to experiencing.",
  dimension: "sensitivity",
  options: [
    opt("Facial redness and/or flushing", "sens_redness", 1),
    opt("Stinging or burning sensation on the skin", "sens_stinging", 1),
    opt("Allergic reaction to skincare products", "sens_allergy", 1),
    opt("Irritation when shaving the face", "sens_shaving", 1),
    opt("None of the above", "sens_none", 0)
  ]
};
var pigmentAmount = abc(
  "pigment_amount",
  "How much dark pigment or discoloration is visible on your face?",
  "pigmentation",
  ["A few faint spots", "Several visible spots", "Many clearly visible spots"]
);
var pigmentScars = abc(
  "pigment_scars",
  "What happens to acne marks or dark marks you have had?",
  "pigmentation",
  ["They fade quickly", "They take a long time to fade", "They are hard to remove"]
);
var pigmentReactivity = abc(
  "pigment_reactivity",
  "How easily does your skin change colour after sun, injury, or acne?",
  "pigmentation",
  ["Rarely gets dark marks", "Often gets dark marks", "Very easily gets dark marks"]
);
var darkSpotTendency = {
  id: "dark_spot_tendency",
  type: "single_choice",
  label: "Do dark spots appear easily after acne, injury, or sun exposure?",
  dimension: "dark_spot",
  options: [opt("Yes", "ds_yes", 1), opt("No", "ds_no", 0)]
};
var PIXIE_OMG_SKIN_ANALYZER = {
  code: "pixie_omg_skin_analyzer",
  name: "Pixie / OMG Skin Analyzer",
  description: "Questionnaire replica of the Wardah (Pixie) + OMG Skin Analyzer inputs for sebum, sensitivity, pigment level, and dark-spot tendency.",
  status: "draft",
  questions: [
    sebumCharacter,
    sensitivityChecklist,
    pigmentAmount,
    pigmentScars,
    pigmentReactivity,
    darkSpotTendency
  ],
  calculationMethods: {
    sebum: "sum",
    sensitivity: "boolean_or",
    // Pixie: any checklist item -> "Sensitive Stinger"
    pigmentation: "average",
    dark_spot: "boolean_or"
  }
};
var pfChoice = (label, value, score) => ({
  label,
  value,
  score
});
var pfSingle = (id, label, choices) => ({
  id,
  type: "single_choice",
  label,
  dimension: "",
  // assigned by XG
  options: choices.map(([label2, score], i) => pfChoice(label2, `${id}_${i}`, score))
});
var PFORM_EXAMPLE = {
  code: "pform_example",
  name: "pForm form (example)",
  description: "Example of a pForm form imported into XG: scored questions with no dimension yet. Assign a dimension to each question (Questions tab) and a method per dimension (Calculation tab) before use.",
  status: "draft",
  questions: [
    pfSingle("pform_age", "Age range", [
      ["Under 20", 0],
      ["20\u201329", 1],
      ["30\u201339", 2],
      ["40\u201349", 3],
      ["50 or older", 4]
    ]),
    {
      id: "pform_pregnancy",
      type: "boolean",
      label: "Are you currently pregnant or breastfeeding?",
      dimension: "",
      options: [],
      scoreTrue: 1,
      scoreFalse: 0
    },
    pfSingle("pform_sun_exposure", "On an average day, how long are you outdoors in direct sun?", [
      ["Less than 30 minutes", 0],
      ["30 minutes \u2013 1 hour", 1],
      ["1 \u2013 3 hours", 2],
      ["More than 3 hours", 3]
    ]),
    pfSingle("pform_climate", "Which best describes the climate where you live?", [
      ["Cool and dry", 0],
      ["Temperate", 1],
      ["Hot and humid", 2],
      ["Hot and dry", 2]
    ]),
    pfSingle("pform_pollution", "How would you rate the air pollution / dust where you spend most of your day?", [
      ["Low", 0],
      ["Moderate", 1],
      ["High", 2]
    ]),
    {
      id: "pform_stress",
      type: "rating",
      label: "On a scale of 1\u20135, how stressed have you felt this past month?",
      dimension: "",
      options: [],
      scale: { min: 1, max: 5 }
    },
    {
      id: "pform_sleep",
      type: "rating",
      label: "On a scale of 1\u20135, how well have you been sleeping?",
      dimension: "",
      options: [],
      scale: { min: 1, max: 5 }
    },
    pfSingle("pform_diet", "How often do you eat fried, sugary, or heavily processed food?", [
      ["Rarely", 0],
      ["A few times a week", 1],
      ["Most days", 2],
      ["Every day", 3]
    ]),
    pfSingle("pform_hydration", "How much plain water do you drink daily?", [
      ["Less than 1 litre", 2],
      ["1 \u2013 2 litres", 1],
      ["More than 2 litres", 0]
    ]),
    {
      id: "pform_smoking",
      type: "boolean",
      label: "Do you smoke?",
      dimension: "",
      options: [],
      scoreTrue: 2,
      scoreFalse: 0
    }
  ],
  calculationMethods: {}
  // set alongside the dimension mapping
};
var PFORM_SUGGESTED_DIMENSIONS = {
  pform_age: "lifestyle",
  pform_pregnancy: "sensitivity",
  pform_sun_exposure: "sun_exposure",
  pform_climate: "climate_humidity",
  pform_pollution: "pollution_exposure",
  pform_stress: "mental_stress",
  pform_sleep: "mental_stress",
  pform_diet: "gut_health",
  pform_hydration: "gut_health",
  pform_smoking: "lifestyle"
};
var PFORM_TYPE_MAP = {
  radiogroup: "single_choice",
  radio: "single_choice",
  single: "single_choice",
  single_choice: "single_choice",
  dropdown: "dropdown",
  select: "dropdown",
  checkbox: "multi_choice",
  multi: "multi_choice",
  multi_choice: "multi_choice",
  boolean: "boolean",
  rating: "rating",
  ranking: "ranking",
  number: "numeric_input",
  numeric: "numeric_input",
  text: "numeric_input"
};
function fromPFormSchema(raw) {
  const flat = [
    ...raw.questions ?? [],
    ...raw.items ?? [],
    ...raw.fields ?? [],
    ...raw.elements ?? [],
    ...(raw.pages ?? []).flatMap((p) => p?.elements ?? [])
  ];
  const questions = flat.map((q, i) => {
    const id = q.id || q.name || q.key || `pform_q${i + 1}`;
    const rawChoices = q.choices ?? q.options ?? q.answers ?? [];
    const options = rawChoices.map((c, ci) => {
      const obj = typeof c === "string" ? { label: c } : c;
      return {
        label: obj.label ?? obj.text ?? obj.title ?? obj.value ?? `Option ${ci + 1}`,
        value: obj.value ?? `${id}_${ci}`,
        score: typeof obj.score === "number" ? obj.score : 0
      };
    });
    const type = PFORM_TYPE_MAP[(q.type || "").toLowerCase()] || (options.length ? "single_choice" : "numeric_input");
    return {
      id,
      type,
      label: q.label ?? q.title ?? q.question ?? `Question ${i + 1}`,
      dimension: "",
      // assigned in XG
      options: type === "boolean" ? [] : options
    };
  });
  return {
    code: raw.code || raw.id || "pform_import",
    name: raw.name || raw.title || "pForm import",
    description: raw.description || "Imported from pForm. Assign a dimension to each question before use.",
    status: "draft",
    questions,
    calculationMethods: {}
  };
}
function applyDimensionMapping(q, mapping, methods = {}) {
  const questions = (q.questions ?? []).map((question) => {
    const dim = mapping[question.id];
    return dim ? { ...question, dimension: dim } : { ...question };
  });
  const usedDims = Array.from(new Set(questions.map((x) => x.dimension).filter(Boolean)));
  const calculationMethods = {};
  for (const d of usedDims) {
    calculationMethods[d] = methods[d] || q.calculationMethods?.[d] || "sum";
  }
  return { ...q, questions, calculationMethods };
}
var cloneQuestionnaire = (q) => JSON.parse(JSON.stringify(q));
var BUILTIN_TEMPLATES = [
  {
    id: PIXIE_OMG_SKIN_ANALYZER.code,
    name: PIXIE_OMG_SKIN_ANALYZER.name,
    description: PIXIE_OMG_SKIN_ANALYZER.description,
    build: () => cloneQuestionnaire(PIXIE_OMG_SKIN_ANALYZER)
  },
  {
    id: PFORM_EXAMPLE.code,
    name: PFORM_EXAMPLE.name,
    description: PFORM_EXAMPLE.description,
    build: () => cloneQuestionnaire(PFORM_EXAMPLE)
  }
];
var methodLabel = (q, dimension) => {
  const m = q.calculationMethods?.[dimension] || "sum";
  return CALCULATION_METHODS.find((x) => x.value === m)?.label || m;
};
var QuestionnairesTab = ({
  questionnaires,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteQuestionnaire
}) => {
  const [expandedCode, setExpandedCode] = useState(null);
  const filtered = questionnaires.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return q.name.toLowerCase().includes(query) || q.code.toLowerCase().includes(query) || q.description?.toLowerCase().includes(query);
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(
      SearchFilterBar,
      {
        searchQuery,
        onSearchChange,
        searchPlaceholder: "Search questionnaires by name, code, or description\u2026",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filtered.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: /* @__PURE__ */ jsx(FileText, { className: "h-6 w-6 text-muted-foreground" }),
        title: "No questionnaires yet",
        description: "Build a questionnaire that turns answers into one score per dimension.",
        actionLabel: "New questionnaire",
        onAction: onOpenAddModal,
        actionIcon: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        className: "py-14"
      }
    ) : filtered.map((q) => {
      const isExpanded = expandedCode === q.code;
      const questions = q.questions || [];
      const dimensions = Array.from(new Set(questions.map((qu) => qu.dimension)));
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-lg border border-border bg-card overflow-hidden transition hover:border-beak/50",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("code", { className: "text-[11px] font-mono text-beak bg-beak/10 border border-beak/30 px-1.5 py-0.5 rounded", children: q.code }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${q.status === "published" ? "bg-beak/15 text-beak" : "bg-muted text-muted-foreground"}`,
                      children: q.status || "draft"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-foreground text-sm", children: q.name }),
                q.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: q.description }),
                dimensions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 pt-1", children: dimensions.map((dim) => /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground",
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: getDimensionMeta(dim).label }),
                      " ",
                      "\xB7 ",
                      methodLabel(q, dim)
                    ]
                  },
                  dim
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 self-end md:self-center shrink-0", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground hidden sm:block", children: [
                  questions.length || q.questionsCount || 0,
                  " questions"
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setExpandedCode(isExpanded ? null : q.code),
                    className: "h-8 px-2.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center gap-1.5",
                    children: [
                      isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" }),
                      isExpanded ? "Hide" : "Preview"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onOpenEditModal(q),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-ring transition flex items-center justify-center",
                    title: "Edit",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onDeleteQuestionnaire(q.code),
                    className: "h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition flex items-center justify-center",
                    title: "Delete",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ jsx("div", { className: "border-t border-border bg-muted/20 p-4 space-y-2", children: questions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No questions configured." }) : questions.map((qu, qIdx) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground mr-1", children: [
                    qIdx + 1,
                    "."
                  ] }),
                  qu.label
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide text-beak shrink-0", children: getDimensionMeta(qu.dimension).label })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5", children: qu.options.map((opt2, oi) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded border border-border px-2 py-1 flex items-center justify-between text-xs",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground truncate pr-2", children: opt2.label }),
                    /* @__PURE__ */ jsxs("span", { className: "text-foreground font-mono shrink-0", children: [
                      (opt2.score ?? 0) > 0 ? "+" : "",
                      opt2.score ?? 0
                    ] })
                  ]
                },
                oi
              )) })
            ] }, qu.id || qIdx)) })
          ]
        },
        q.code
      );
    }) })
  ] });
};

// src/form/surveyjs.ts
var TYPE_TO_SURVEYJS = {
  single_choice: { type: "radiogroup" },
  multi_choice: { type: "checkbox" },
  dropdown: { type: "dropdown" },
  boolean: { type: "boolean" },
  rating: { type: "rating" },
  ranking: { type: "ranking" },
  matrix: { type: "matrix" },
  numeric_input: { type: "text", inputType: "number" },
  slider: { type: "rating" }
};
var SURVEYJS_TO_TYPE = {
  radiogroup: "single_choice",
  buttongroup: "single_choice",
  imagepicker: "single_choice",
  dropdown: "dropdown",
  checkbox: "multi_choice",
  tagbox: "multi_choice",
  ranking: "ranking",
  boolean: "boolean",
  rating: "rating",
  matrix: "matrix",
  text: "numeric_input"
};
var CHOICE_SURVEYJS_TYPES = /* @__PURE__ */ new Set([
  "radiogroup",
  "checkbox",
  "dropdown",
  "tagbox",
  "buttongroup",
  "ranking"
]);
var CHOICE_BUILDER_TYPES = /* @__PURE__ */ new Set([
  "single_choice",
  "multi_choice",
  "dropdown",
  "ranking"
]);
function toSurveyModel(item) {
  const elements = (item.questions ?? []).map((q) => {
    const map = TYPE_TO_SURVEYJS[q.type] ?? { type: "radiogroup" };
    const el = { type: map.type, name: q.id, title: q.label };
    if (map.inputType) el.inputType = map.inputType;
    if (q.type === "single_choice" || q.type === "dropdown" || q.type === "boolean") {
      el.isRequired = true;
    }
    if (q.dimension) el.dimension = q.dimension;
    const asChoice = (o) => ({
      value: o.value,
      text: o.label,
      ...o.score != null ? { score: o.score } : {},
      ...o.conditionMap && Object.keys(o.conditionMap).length ? { condition_map: o.conditionMap } : {}
    });
    if (CHOICE_BUILDER_TYPES.has(q.type)) {
      el.choices = (q.options ?? []).map(asChoice);
    }
    if (q.type === "matrix") {
      el.columns = (q.options ?? []).map(asChoice);
      el.rows = (q.rows ?? []).map((r) => ({ value: r.value, text: r.label }));
    }
    if (q.type === "boolean") {
      if (q.scoreTrue != null) el.scoreTrue = q.scoreTrue;
      if (q.scoreFalse != null) el.scoreFalse = q.scoreFalse;
      el.renderAs = "radio";
    }
    if ((q.type === "rating" || q.type === "slider" || q.type === "numeric_input") && q.scale) {
      el.scale = q.scale;
      if (map.type === "rating") {
        el.rateMin = q.scale.min;
        el.rateMax = Math.min(q.scale.max, q.scale.min + 10);
        el.displayMode = "buttons";
      } else {
        el.min = q.scale.min;
        el.max = q.scale.max;
      }
    }
    return el;
  });
  return {
    title: item.name,
    ...item.description ? { description: item.description } : {},
    code: item.code,
    ...item.status ? { status: item.status } : {},
    pages: [{ name: "page1", elements }],
    ...item.calculationMethods && Object.keys(item.calculationMethods).length ? { calculation_methods: item.calculationMethods } : {}
  };
}
function isSurveyModel(raw) {
  return !!raw && typeof raw === "object" && !Array.isArray(raw.questions) && (Array.isArray(raw.pages) || Array.isArray(raw.elements));
}
function flattenElements(model) {
  return [
    ...(model.pages ?? []).flatMap((p) => p?.elements ?? []),
    ...model.elements ?? []
  ];
}
function fromSurveyModel(raw) {
  if (!isSurveyModel(raw)) {
    return {
      code: raw?.code ?? "",
      name: raw?.name ?? raw?.title ?? raw?.code ?? "",
      description: raw?.description ?? "",
      status: raw?.status ?? "draft",
      questions: raw?.questions ?? [],
      calculationMethods: raw?.calculationMethods ?? raw?.calculation_methods ?? {},
      questionsCount: raw?.questions?.length ?? 0
    };
  }
  const readChoice = (c) => typeof c === "string" ? { label: c, value: c } : {
    label: c.text ?? c.value,
    value: c.value,
    ...c.score != null ? { score: c.score } : {},
    ...c.condition_map ? { conditionMap: c.condition_map } : {}
  };
  const questions = flattenElements(raw).map((el, i) => {
    const type = SURVEYJS_TO_TYPE[el.type] ?? "single_choice";
    const source = type === "matrix" ? el.columns ?? [] : el.choices ?? [];
    const options = source.map(readChoice);
    const q = {
      id: el.name || `q_${i + 1}`,
      type,
      label: el.title || el.name || `Question ${i + 1}`,
      dimension: el.dimension || "",
      options
    };
    if (type === "matrix") {
      q.rows = (el.rows ?? []).map(
        (r) => typeof r === "string" ? { value: r, label: r } : { value: r.value, label: r.text ?? r.value }
      );
    }
    if (el.scoreTrue != null) q.scoreTrue = el.scoreTrue;
    if (el.scoreFalse != null) q.scoreFalse = el.scoreFalse;
    const min = el.scale?.min ?? el.rateMin ?? el.min;
    const max = el.scale?.max ?? el.rateMax ?? el.max;
    if (min != null && max != null) q.scale = { min, max };
    return q;
  });
  return {
    code: raw.code ?? "",
    name: raw.title ?? raw.code ?? "",
    description: raw.description ?? "",
    status: raw.status ?? "draft",
    questions,
    calculationMethods: raw.calculation_methods ?? {},
    questionsCount: questions.length
  };
}
function buildScoreRequest(model, data) {
  const answer_list = [];
  const customer_condition = {};
  const dimAnswers = {};
  const dimBounds = {};
  const bump = (dim, score, min, max) => {
    if (!dim) return;
    (dimAnswers[dim] ?? (dimAnswers[dim] = [])).push(score);
    const b = dimBounds[dim] ?? (dimBounds[dim] = { min: 0, max: 0 });
    if (min < b.min) b.min = min;
    if (max > b.max) b.max = max;
  };
  const scaleOf = (el) => [
    el.scale?.min ?? el.rateMin ?? el.min ?? 0,
    el.scale?.max ?? el.rateMax ?? el.max ?? 0
  ];
  const asChoice = (c) => typeof c === "string" ? { value: c, text: c } : c;
  for (const el of flattenElements(model)) {
    const ans = data[el.name];
    if (ans == null || ans === "") continue;
    const [minS, maxS] = scaleOf(el);
    if (el.type === "boolean") {
      const on = ans === true || ans === "true";
      const score = on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0;
      answer_list.push({ answer: String(on), score, min_score: minS, max_score: maxS || 1 });
      bump(el.dimension, score, minS, maxS || 1);
      continue;
    }
    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(ans) ? ans : [ans]).map(String);
      for (const raw of el.choices) {
        const ch = asChoice(raw);
        if (!picked.includes(String(ch.value))) continue;
        const score = typeof ch.score === "number" ? ch.score : 0;
        answer_list.push({ answer: ch.text ?? String(ch.value), score, min_score: minS, max_score: maxS });
        if (ch.condition_map) Object.assign(customer_condition, ch.condition_map);
        bump(ch.dimension || el.dimension, score, minS, maxS);
      }
      continue;
    }
    if (el.type === "matrix" && el.columns?.length && typeof ans === "object") {
      const cols = el.columns.map(asChoice);
      for (const colVal of Object.values(ans)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (!col) continue;
        const score = typeof col.score === "number" ? col.score : 0;
        answer_list.push({ answer: col.text ?? String(col.value), score, min_score: minS, max_score: maxS });
        bump(el.dimension, score, minS, maxS);
      }
      continue;
    }
    const n = Number(ans);
    if (!Number.isNaN(n)) {
      answer_list.push({ answer: String(n), score: n, min_score: minS, max_score: maxS });
      bump(el.dimension, n, minS, maxS);
    }
  }
  const methods = model.calculation_methods || {};
  const dimensions = Object.entries(dimAnswers).map(([key, answers]) => {
    const b = dimBounds[key] || { min: 0, max: 0 };
    return {
      key,
      min_score: b.min,
      max_score: b.max || 100,
      calculation_method: methods[key] || "sum",
      answers
    };
  });
  return { answer_list, customer_condition, dimensions };
}
function scoreSurveyAnswers(model, data) {
  const byDimension = {};
  const push = (dim, n) => {
    if (!dim) return;
    (byDimension[dim] ?? (byDimension[dim] = [])).push(n);
  };
  for (const el of flattenElements(model)) {
    const answer = data[el.name];
    if (answer == null || answer === "") continue;
    if (el.type === "boolean") {
      const on = answer === true || answer === "true";
      push(el.dimension, on ? el.scoreTrue ?? 1 : el.scoreFalse ?? 0);
      continue;
    }
    if (CHOICE_SURVEYJS_TYPES.has(el.type) && el.choices?.length) {
      const picked = (Array.isArray(answer) ? answer : [answer]).map(String);
      for (const c of el.choices) {
        const choice = typeof c === "string" ? { value: c} : c;
        if (picked.includes(String(choice.value))) {
          push(
            choice.dimension || el.dimension,
            typeof choice.score === "number" ? choice.score : 0
          );
        }
      }
      continue;
    }
    if (el.type === "matrix" && el.columns?.length && typeof answer === "object") {
      const cols = el.columns.map(
        (c) => typeof c === "string" ? { value: c, text: c } : c
      );
      for (const colVal of Object.values(answer)) {
        const col = cols.find((c) => String(c.value) === String(colVal));
        if (col) {
          push(
            el.dimension,
            typeof col.score === "number" ? col.score : 0
          );
        }
      }
      continue;
    }
    const n = Number(answer);
    if (!Number.isNaN(n)) push(el.dimension, n);
  }
  return byDimension;
}

// src/form/survey-theme.ts
var XG_SURVEY_THEME = {
  themeName: "xg",
  colorPalette: "dark",
  isPanelless: false,
  cssVariables: {
    "--sjs-font-family": "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
    "--sjs-corner-radius": "var(--radius, 0.625rem)",
    "--sjs-base-unit": "7px",
    // SurveyJS defaults run large (16px base). Tighten to console scale.
    "--sjs-font-size": "13px",
    "--sjs-font-questiontitle-size": "14px",
    "--sjs-font-questiondescription-size": "12px",
    "--sjs-font-editorfont-size": "13px",
    "--sjs-font-pagetitle-size": "15px",
    "--sjs-font-pagedescription-size": "12px",
    "--sjs-primary-backcolor": "var(--primary)",
    "--sjs-primary-backcolor-light": "color-mix(in srgb, var(--primary) 16%, transparent)",
    "--sjs-primary-backcolor-dark": "color-mix(in srgb, var(--primary) 88%, #000)",
    "--sjs-primary-forecolor": "var(--primary-foreground)",
    "--sjs-primary-forecolor-light": "color-mix(in srgb, var(--primary-foreground) 65%, transparent)",
    "--sjs-general-backcolor": "var(--card)",
    "--sjs-general-backcolor-dark": "color-mix(in srgb, var(--card) 90%, #000)",
    "--sjs-general-backcolor-dim": "var(--background)",
    "--sjs-general-backcolor-dim-light": "var(--muted)",
    "--sjs-general-backcolor-dim-dark": "color-mix(in srgb, var(--muted) 82%, #000)",
    "--sjs-general-forecolor": "var(--foreground)",
    "--sjs-general-forecolor-light": "var(--muted-foreground)",
    "--sjs-general-dim-forecolor": "var(--foreground)",
    "--sjs-general-dim-forecolor-light": "var(--muted-foreground)",
    "--sjs-border-default": "var(--border)",
    "--sjs-border-light": "color-mix(in srgb, var(--border) 60%, transparent)",
    "--sjs-shadow-small": "none",
    "--sjs-shadow-medium": "none",
    "--sjs-shadow-large": "none",
    "--sjs-shadow-inner": "none"
  }
};
var ANSWERS_KEY_PREFIX = "xg.formEngine.simulator.answers.";
var CUSTOMER_ID_KEY = "xg.formEngine.simulator.customerId";
var FormSimulatorTab = ({
  brandId,
  applicationId,
  questionnaires,
  selectedQCode,
  setSelectedQCode
}) => {
  const currentQ = questionnaires.find((q) => q.code === selectedQCode) || questionnaires[0];
  const hasQuestions = (currentQ?.questions?.length ?? 0) > 0;
  const schema = useMemo(
    () => currentQ ? toSurveyModel(currentQ) : null,
    [currentQ]
  );
  const answersKey = currentQ?.code ? ANSWERS_KEY_PREFIX + currentQ.code : null;
  const [data, setData] = usePersistentState(answersKey, {});
  const [showPayload, setShowPayload] = useState(false);
  const [customerId, setCustomerId] = usePersistentState(CUSTOMER_ID_KEY, "demo-customer-001");
  const [copied, setCopied] = useState("");
  const copy = (text, tag) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(""), 1500);
      },
      () => {
      }
    );
  };
  const survey = useMemo(() => {
    if (!schema || !hasQuestions) return null;
    const m = new Model(schema);
    m.showNavigationButtons = false;
    m.showCompleteButton = false;
    m.showProgressBar = "off";
    m.questionsOnPageMode = "singlePage";
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    const saved = answersKey ? readPersisted(answersKey) : void 0;
    if (saved) m.data = saved;
    return m;
  }, [schema, hasQuestions, answersKey]);
  useEffect(() => {
    setData({ ...survey?.data ?? {} });
    if (!survey) return;
    const onValue = (sender) => setData({ ...sender.data });
    survey.onValueChanged.add(onValue);
    return () => survey.onValueChanged.remove(onValue);
  }, [survey, setData]);
  const core = useMemo(
    () => schema ? buildScoreRequest(schema, data) : { answer_list: [], customer_condition: {}, dimensions: [] },
    [schema, data]
  );
  const results = core.dimensions.map((d) => ({
    dc: d.key,
    method: d.calculation_method,
    scores: d.answers,
    value: Math.round(applyCalculationMethod(d.answers, d.calculation_method) * 100) / 100
  }));
  const submitBody = {
    brand_id: currentQ?.brandId || brandId,
    application_id: currentQ?.applicationId || applicationId,
    customer_id: customerId,
    data
  };
  const submitBodyJson = JSON.stringify(submitBody, null, 2);
  const payload = {
    code: currentQ?.code,
    brand_id: currentQ?.brandId || brandId,
    application_id: currentQ?.applicationId || applicationId,
    answer_list: core.answer_list,
    customer_condition: core.customer_condition,
    dimensions: core.dimensions,
    vision_signals: {}
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-5", children: [
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Questionnaire" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: selectedQCode,
            onChange: (e) => setSelectedQCode(e.target.value),
            className: "w-full h-9 rounded-md bg-muted/40 border border-border px-3 text-foreground text-xs outline-none focus:border-ring",
            style: { colorScheme: "dark" },
            children: questionnaires.map((q) => /* @__PURE__ */ jsx(
              "option",
              {
                value: q.code,
                style: { backgroundColor: "var(--popover)", color: "var(--popover-foreground)" },
                children: q.name
              },
              q.code
            ))
          }
        )
      ] }),
      !survey ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs py-6 text-center", children: "This questionnaire has no questions configured." }) : /* @__PURE__ */ jsx(Survey, { model: survey })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-foreground text-sm font-bold", children: "Score per dimension" }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "Form Engine output" })
        ] }),
        results.length === 0 ? /* @__PURE__ */ jsx(
          EmptyState,
          {
            icon: /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 text-muted-foreground" }),
            title: "Nothing to calculate yet",
            description: "Answer a question to see its dimension score.",
            className: "py-10"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: results.map((r) => {
          const methodLabel2 = CALCULATION_METHODS.find((m) => m.value === r.method)?.label || r.method;
          return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-muted/20 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: getDimensionMeta(r.dc).label }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: methodLabel2 })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-baseline justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg font-black text-beak font-mono", children: r.value }),
              /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground font-mono", children: [
                "[",
                r.scores.join(", "),
                "] \u2192 ",
                r.method
              ] })
            ] })
          ] }, r.dc);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-4 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-foreground text-sm font-bold", children: "Submit Answers body" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground truncate", children: [
              "POST ",
              /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
                "/v1/survey/",
                currentQ?.code,
                "/evaluate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => copy(submitBodyJson, "submit"),
              className: "h-7 shrink-0 rounded-md border border-beak/40 bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20",
              children: copied === "submit" ? "Copied" : "Copy body"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
          "customer_id",
          /* @__PURE__ */ jsx(
            "input",
            {
              value: customerId,
              onChange: (e) => setCustomerId(e.target.value),
              className: "h-7 flex-1 rounded-md bg-muted/40 border border-border px-2 text-foreground font-mono outline-none focus:border-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("pre", { className: "max-h-56 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-[11px] text-foreground font-mono leading-relaxed whitespace-pre", children: submitBodyJson })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowPayload((v) => !v),
            className: "flex w-full items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-foreground",
            children: [
              /* @__PURE__ */ jsx("span", { children: "Internal: forwarded to Score Engine" }),
              showPayload ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
            ]
          }
        ),
        showPayload && /* @__PURE__ */ jsx("pre", { className: "border-t border-border px-4 py-3 text-[11px] text-muted-foreground whitespace-pre-wrap break-all font-mono leading-relaxed", children: JSON.stringify(payload, null, 2) })
      ] })
    ] })
  ] });
};

// src/form/api.ts
var FORM = "/core/form-engine";
var DEFAULT_BRAND = "wardah";
var DEFAULT_APP = "skinverse";
var tenantQuery = (brandId, applicationId) => `brand_id=${encodeURIComponent(brandId)}&application_id=${encodeURIComponent(applicationId)}`;
function parseSchema(row) {
  const s = row?.schema;
  if (s && typeof s === "object") return s;
  if (typeof s === "string") {
    try {
      return JSON.parse(s);
    } catch {
    }
  }
  return {};
}
function fromColumnStatus(s) {
  if (s === "active") return "published";
  return s || "";
}
function toColumnStatus(s) {
  if (s === "published" || s === "active") return "active";
  if (s === "archived") return "archived";
  return "draft";
}
function rowToItem(row) {
  const item = fromSurveyModel(parseSchema(row));
  return {
    ...item,
    // The DB row owns identity — the unique key is (brand, app, code, version).
    // A code/title embedded in the schema is only a copy and can go stale
    // (e.g. a questionnaire cloned from another one), so the row wins.
    code: row?.code || item.code || "",
    name: row?.title || item.name || row?.code || "",
    status: fromColumnStatus(row?.status) || item.status || "draft",
    brandId: row?.brandId || row?.brand_id || item.brandId,
    applicationId: row?.applicationId || row?.application_id || item.applicationId
  };
}
async function listRows(brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const res = await fetch(`${FORM}/survey?${tenantQuery(brandId, applicationId)}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`form-engine list failed (${res.status})`);
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.surveys)) return data.surveys;
  if (Array.isArray(data?.forms)) return data.forms;
  return [];
}
var isArchived = (r) => (r?.status ?? "") === "archived";
async function listQuestionnaires(brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  return (await listRows(brandId, applicationId)).filter((r) => !isArchived(r)).map(rowToItem);
}
async function getQuestionnaire(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  return (await listQuestionnaires(brandId, applicationId)).find((q) => q.code === code) ?? null;
}
async function getQuestionnaireModel(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const row = (await listRows(brandId, applicationId)).find(
    (r) => r.code === code && !isArchived(r)
  );
  if (!row) return null;
  const model = parseSchema(row);
  if (!Array.isArray(model.pages) && !Array.isArray(model.elements)) {
    return toSurveyModel(rowToItem(row));
  }
  return { ...model, code: row.code || model.code, title: row.title || model.title };
}
async function saveQuestionnaire(item, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const code = item.code || `form_${Date.now()}`;
  const res = await fetch(`${FORM}/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_id: item.brandId || brandId,
      application_id: item.applicationId || applicationId,
      code,
      title: item.name || code,
      status: toColumnStatus(item.status),
      schema: toSurveyModel({ ...item, code })
    })
  });
  if (!res.ok) throw new Error(`form-engine save failed (${res.status})`);
}
async function deleteQuestionnaire(code, brandId = DEFAULT_BRAND, applicationId = DEFAULT_APP) {
  const existing = (await listRows(brandId, applicationId)).find((r) => r.code === code);
  const schema = existing ? parseSchema(existing) : { code };
  const res = await fetch(`${FORM}/survey/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_id: existing?.brandId || existing?.brand_id || brandId,
      application_id: existing?.applicationId || existing?.application_id || applicationId,
      code,
      title: existing?.title || code,
      status: "archived",
      schema
    })
  });
  if (!res.ok) throw new Error(`form-engine archive failed (${res.status})`);
}
async function getDimensions() {
  try {
    const res = await fetch(`/api/reference/dimensions`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data) ? data : Array.isArray(data?.dimensions) ? data.dimensions : Array.isArray(data?.data) ? data.data : [];
    return arr;
  } catch {
    return [];
  }
}
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
async function createSafetyFlag(code, name) {
  try {
    const res = await fetch(`/api/reference/conditions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name })
    });
    if (!res.ok) return null;
    return { code, name };
  } catch {
    return null;
  }
}
var QUESTION_TYPES = [
  { value: "single_choice", label: "Choose one", hasOptions: true },
  { value: "multi_choice", label: "Select many", hasOptions: true },
  { value: "dropdown", label: "Dropdown", hasOptions: true },
  { value: "ranking", label: "Rank order", hasOptions: true },
  { value: "matrix", label: "Matrix (grid)", hasOptions: true },
  { value: "boolean", label: "Yes / No", hasOptions: false },
  { value: "rating", label: "Rating", hasOptions: false },
  { value: "numeric_input", label: "Number", hasOptions: false }
];
var typeHasOptions = (t) => QUESTION_TYPES.find((x) => x.value === t)?.hasOptions ?? true;
var TYPE_HINTS = {
  single_choice: "Respondent picks exactly one answer.",
  multi_choice: "Respondent ticks any number of answers; each ticked answer's score counts.",
  dropdown: "Pick one, shown as a dropdown. Good for long answer lists.",
  ranking: "Respondent drags the answers into order. Every answer's score counts.",
  matrix: "A grid: each row is scored against the shared answer columns.",
  boolean: "A single Yes / No toggle.",
  rating: "A small rating scale (2\u201310 buttons); the chosen number is the score. For a wider range use Number.",
  numeric_input: "A free number entry; the entered value is the score.",
  slider: "A slider; the chosen number is the score."
};
var field = "h-9 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring transition";
var fieldSm = "h-8 rounded-md bg-muted/40 border border-border px-2 text-foreground text-xs outline-none focus:border-ring transition";
var selectStyle = { colorScheme: "dark" };
var optionStyle = {
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)"
};
var clone = (v) => JSON.parse(JSON.stringify(v));
var slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_{2,}/g, "_");
var newOption = () => ({
  label: "",
  value: `opt_${Math.random().toString(36).slice(2, 8)}`,
  score: 0
});
var newQuestion = (dimension) => ({
  id: `q_${Math.random().toString(36).slice(2, 9)}`,
  type: "single_choice",
  label: "",
  dimension,
  options: [newOption(), newOption()]
});
var SafetyFlagPicker = ({ flags, flagOptions, onAdd, onRemove, onAddCustom }) => {
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);
  const ref = useRef(null);
  const hasFlags = flags.length > 0;
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setAddingCustom(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);
  const choices = flagOptions.filter((f) => !flags.includes(f.code));
  return /* @__PURE__ */ jsxs("div", { ref, className: "relative shrink-0", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        title: hasFlags ? `Safety flags: ${flags.join(", ")}` : "Add safety flags",
        onClick: () => setOpen((o) => !o),
        className: `h-9 w-9 flex items-center justify-center rounded-md border-2 transition ${hasFlags ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"}`,
        children: [
          /* @__PURE__ */ jsx(Flag, { className: "h-5 w-5", fill: hasFlags ? "currentColor" : "none" }),
          flags.length > 1 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none", children: flags.length })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-border bg-popover shadow-lg p-2 space-y-1.5", children: [
      hasFlags && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: flags.map((k) => /* @__PURE__ */ jsxs(
        "span",
        {
          className: "inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-mono",
          children: [
            k,
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onRemove(k), children: /* @__PURE__ */ jsx(X, { className: "h-2.5 w-2.5" }) })
          ]
        },
        k
      )) }),
      addingCustom ? /* @__PURE__ */ jsx(
        "input",
        {
          autoFocus: true,
          disabled: savingCustom,
          value: customDraft,
          onChange: (e) => setCustomDraft(e.target.value),
          onKeyDown: async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const name = customDraft.trim();
              if (!name) return;
              setSavingCustom(true);
              const code = await onAddCustom(name);
              setSavingCustom(false);
              if (code) onAdd(code);
              setCustomDraft("");
              setAddingCustom(false);
            } else if (e.key === "Escape") {
              setAddingCustom(false);
            }
          },
          placeholder: "Flag name (e.g. Baru sunburn)",
          className: `${fieldSm} w-full`
        }
      ) : /* @__PURE__ */ jsxs(
        "select",
        {
          value: "",
          onChange: (e) => {
            const v = e.target.value;
            if (v === "__custom__") setAddingCustom(true);
            else if (v) onAdd(v);
          },
          className: `${fieldSm} w-full`,
          style: selectStyle,
          children: [
            /* @__PURE__ */ jsx("option", { style: optionStyle, value: "", children: "+ add flag" }),
            choices.map((f) => /* @__PURE__ */ jsx("option", { style: optionStyle, value: f.code, children: f.code }, f.code)),
            /* @__PURE__ */ jsx("option", { style: optionStyle, value: "__custom__", children: "+ Custom\u2026" })
          ]
        }
      )
    ] })
  ] });
};
var QuestionnaireModal = ({
  isOpen,
  onClose,
  onSave,
  editingQ,
  brandId = "wardah",
  applicationId = "skinverse"
}) => {
  const [step, setStep] = useState("setup");
  const [qCode, setQCode] = useState("");
  const [qBrand, setQBrand] = useState(brandId);
  const [qApp, setQApp] = useState(applicationId);
  const [codeEdited, setCodeEdited] = useState(false);
  const [showCodeField, setShowCodeField] = useState(false);
  const [qName, setQName] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qStatus, setQStatus] = useState("draft");
  const [questions, setQuestions] = useState([]);
  const [calcMethods, setCalcMethods] = useState({});
  const [apiDimensions, setApiDimensions] = useState([]);
  const [safetyFlagCatalog, setSafetyFlagCatalog] = useState([]);
  const [filterDim, setFilterDim] = useState("all");
  const [collapsed, setCollapsed] = useState({});
  const [scoreDrafts, setScoreDrafts] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState("");
  const copy = (text, tag) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(""), 1500);
      },
      () => {
      }
    );
  };
  useEffect(() => {
    if (!isOpen) return;
    setStep("setup");
    setFilterDim("all");
    if (editingQ) {
      setQCode(editingQ.code);
      setCodeEdited(true);
      setShowCodeField(false);
      setQName(editingQ.name);
      setQDesc(editingQ.description || "");
      setQStatus(editingQ.status || "draft");
      setQBrand(editingQ.brandId || brandId);
      setQApp(editingQ.applicationId || applicationId);
      setQuestions(clone(editingQ.questions || []));
      setCalcMethods(clone(editingQ.calculationMethods || {}));
      setCollapsed(Object.fromEntries((editingQ.questions || []).map((q) => [q.id, true])));
    } else {
      setQCode("");
      setCodeEdited(false);
      setShowCodeField(false);
      setQName("");
      setQDesc("");
      setQStatus("draft");
      setQBrand(brandId);
      setQApp(applicationId);
      setQuestions([]);
      setCalcMethods({});
      setCollapsed({});
    }
  }, [editingQ, isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    getDimensions().then((raw) => {
      setApiDimensions(
        raw.filter((it) => it && it.code && !it.parentCode).map((it) => ({
          code: it.code,
          label: it.name || it.code,
          purpose: it.description || getDimensionMeta(it.code).purpose
        }))
      );
    }).catch(() => setApiDimensions([]));
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    getSafetyFlags().then(setSafetyFlagCatalog).catch(() => setSafetyFlagCatalog([]));
  }, [isOpen]);
  const effectiveCode = codeEdited ? qCode : slugify(qName);
  const usedDimensions = Array.from(new Set(questions.map((q) => q.dimension).filter(Boolean)));
  const flagOptions = useMemo(() => {
    const byCode = /* @__PURE__ */ new Map();
    for (const f of safetyFlagCatalog) byCode.set(f.code, f);
    for (const q of questions) {
      for (const o of q.options || []) {
        for (const k of Object.keys(o.conditionMap || {})) {
          if (!byCode.has(k)) byCode.set(k, { code: k });
        }
      }
    }
    return Array.from(byCode.values()).sort(
      (a, b) => (a.name || a.code).localeCompare(b.name || b.code)
    );
  }, [safetyFlagCatalog, questions]);
  const handleAddCustomFlag = async (name) => {
    const code = slugify(name);
    if (!code) return null;
    const existing = safetyFlagCatalog.find((f) => f.code === code);
    if (existing) return existing.code;
    const created = await createSafetyFlag(code, name);
    if (created) setSafetyFlagCatalog((prev) => [...prev, created]);
    return code;
  };
  const draftItem = useMemo(
    () => ({
      code: effectiveCode.trim(),
      name: qName.trim(),
      description: qDesc.trim(),
      status: qStatus,
      brandId: qBrand,
      applicationId: qApp,
      questionsCount: questions.length,
      questions,
      calculationMethods: Object.fromEntries(
        usedDimensions.map((d) => [d, calcMethods[d] || "sum"])
      )
    }),
    [effectiveCode, qName, qDesc, qStatus, qBrand, qApp, questions, calcMethods, usedDimensions]
  );
  if (!isOpen) return null;
  const dimensionList = apiDimensions.length ? apiDimensions : FALLBACK_DIMENSIONS;
  const metaOf = (code) => getDimensionMeta(code, dimensionList);
  const schemaJson = JSON.stringify(toSurveyModel(draftItem), null, 2);
  const createBodyJson = JSON.stringify(
    {
      code: qCode || slugify(qName),
      title: qName,
      status: qStatus === "published" || qStatus === "active" ? "active" : qStatus === "archived" ? "archived" : "draft",
      schema: toSurveyModel(draftItem)
    },
    null,
    2
  );
  const updateQuestion = (id, patch) => setQuestions((cur) => cur.map((q) => q.id === id ? { ...q, ...patch } : q));
  const updateOption = (qid, idx, patch) => setQuestions(
    (cur) => cur.map(
      (q) => q.id === qid ? { ...q, options: q.options.map((o, i) => i === idx ? { ...o, ...patch } : o) } : q
    )
  );
  const addQuestion = () => {
    const dim = filterDim !== "all" ? filterDim : usedDimensions[0] || dimensionList[0]?.code || "sebum";
    const q = newQuestion(dim);
    setQuestions((cur) => [...cur, q]);
    setCollapsed((cur) => ({ ...cur, [q.id]: false }));
  };
  const removeQuestion = (id) => setQuestions((cur) => cur.filter((q) => q.id !== id));
  const loadTemplate = (id) => {
    const t = BUILTIN_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    const built = t.build();
    setQuestions(clone(built.questions || []));
    setCalcMethods(clone(built.calculationMethods || {}));
    if (!qName.trim()) setQName(built.name);
    if (!qDesc.trim()) setQDesc(built.description);
    setCollapsed(Object.fromEntries((built.questions || []).map((q) => [q.id, true])));
    setStep("questions");
  };
  const submit = async (e) => {
    e.preventDefault();
    const code = effectiveCode.trim();
    if (!qName.trim() || !code) return;
    setSubmitting(true);
    try {
      await onSave({ ...draftItem, code });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  const visibleQuestions = questions.map((q, index) => ({ q, index })).filter(({ q }) => filterDim === "all" || q.dimension === filterDim);
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      isOpen,
      onClose,
      size: "3xl",
      icon: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
      title: editingQ ? "Edit questionnaire" : "New questionnaire",
      subtitle: "Form Engine only calculates scores. Labelling and normalisation happen in the Score Engine.",
      isLoading: submitting,
      loadingText: submitting ? editingQ ? "Saving questionnaire..." : "Creating questionnaire..." : void 0,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 text-xs", children: [
          [
            ["setup", "1  Setup"],
            ["questions", `2  Questions (${questions.length})`],
            ["calculation", "3  Calculation"]
          ].map(([v, label]) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep(v),
              className: `px-3 py-1.5 rounded font-semibold transition ${step === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              children: label
            },
            v
          )),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setStep("json"),
              className: `ml-auto px-3 py-1.5 rounded font-semibold transition ${step === "json" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
              title: "Preview the stored SurveyJS schema",
              children: "Schema"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-3 space-y-3", children: [
          step === "setup" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-3", children: [
              /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    required: true,
                    value: qName,
                    onChange: (e) => setQName(e.target.value),
                    placeholder: "e.g. Pixie Skin Analyzer",
                    className: `${field} w-full`
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "block text-[11px] text-muted-foreground", children: [
                  "Saved as ",
                  /* @__PURE__ */ jsx("code", { className: "text-foreground", children: effectiveCode || "\u2014" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setShowCodeField((s) => !s);
                        if (!codeEdited) setQCode(effectiveCode);
                      },
                      className: "ml-2 underline hover:text-foreground",
                      children: showCodeField ? "done" : "edit"
                    }
                  )
                ] }),
                showCodeField && /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: qCode,
                    disabled: !!editingQ,
                    onChange: (e) => {
                      setCodeEdited(true);
                      setQCode(slugify(e.target.value));
                    },
                    className: `${field} w-full font-mono disabled:opacity-50`
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Description" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: qDesc,
                    onChange: (e) => setQDesc(e.target.value),
                    rows: 3,
                    placeholder: "What this questionnaire is for.",
                    className: "w-full rounded-md bg-muted/40 border border-border px-2.5 py-2 text-foreground text-xs outline-none focus:border-ring transition resize-y",
                    style: { minHeight: "4.5rem" }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Status" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: qStatus,
                    onChange: (e) => setQStatus(e.target.value),
                    className: `${field} w-full`,
                    style: selectStyle,
                    children: [
                      /* @__PURE__ */ jsx("option", { style: optionStyle, value: "draft", children: "Draft" }),
                      /* @__PURE__ */ jsx("option", { style: optionStyle, value: "published", children: "Published" }),
                      /* @__PURE__ */ jsx("option", { style: optionStyle, value: "archived", children: "Archived" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Brand" }),
                    /* @__PURE__ */ jsx(
                      InfoTooltip,
                      {
                        content: `Saved under ${qBrand || "\u2014"} / ${qApp || "\u2014"}. Defaults to the Form Engine selector; change it to build for a different tenant.`,
                        label: "About brand / application"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    BrandSelect,
                    {
                      value: qBrand,
                      includeUniversal: false,
                      label: "",
                      onChange: setQBrand
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs font-semibold", children: "Application" }),
                  /* @__PURE__ */ jsx(
                    ApplicationSelect,
                    {
                      value: qApp,
                      includeUniversal: false,
                      label: "",
                      onChange: setQApp
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-foreground text-xs font-semibold", children: "Start from a template" }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: BUILTIN_TEMPLATES.map((t) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => loadTemplate(t.id),
                  className: "text-left rounded-md border border-border bg-muted/30 hover:border-ring p-2.5 transition",
                  children: [
                    /* @__PURE__ */ jsx("p", { className: "text-foreground text-xs font-semibold", children: t.name }),
                    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[11px] mt-0.5 leading-relaxed", children: t.description })
                  ]
                },
                t.id
              )) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", onClick: () => setStep("questions"), children: "Continue" }) })
          ] }),
          step === "questions" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            usedDimensions.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: ["all", ...usedDimensions].map((d) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setFilterDim(d),
                className: `px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${filterDim === d ? "border-beak/50 bg-beak/15 text-beak" : "border-border text-muted-foreground hover:text-foreground"}`,
                children: d === "all" ? "All" : metaOf(d).label
              },
              d
            )) }),
            questions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-dashed border-border p-8 text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "text-foreground text-xs font-semibold", children: "No questions yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[11px] mt-1 mb-3", children: "Add questions or load a template from Setup." }),
              /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", onClick: addQuestion, children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
                " Add question"
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              visibleQuestions.map(({ q, index }) => {
                const isCollapsed = collapsed[q.id];
                return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-card", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "shrink-0 w-6 text-center text-[11px] font-bold text-muted-foreground", children: index + 1 }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: q.label,
                        onChange: (e) => updateQuestion(q.id, { label: e.target.value }),
                        placeholder: "Question text",
                        className: `${fieldSm} flex-1 min-w-0`
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setCollapsed((c) => ({ ...c, [q.id]: !c[q.id] })),
                        className: "shrink-0 text-muted-foreground hover:text-foreground",
                        children: isCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => removeQuestion(q.id),
                        className: "shrink-0 text-muted-foreground hover:text-destructive",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] }),
                  !isCollapsed && /* @__PURE__ */ jsxs("div", { className: "border-t border-border p-2.5 space-y-2", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "flex flex-wrap items-center",
                        style: { columnGap: "2rem", rowGap: "0.5rem" },
                        children: [
                          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground", children: [
                              "Question type",
                              /* @__PURE__ */ jsx(
                                InfoTooltip,
                                {
                                  content: TYPE_HINTS[q.type],
                                  label: "About this question type",
                                  iconClassName: "h-3 w-3"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsx(
                              "select",
                              {
                                value: q.type,
                                onChange: (e) => {
                                  const next = e.target.value;
                                  const patch = { type: next };
                                  if (typeHasOptions(next) && (!q.options || q.options.length === 0)) {
                                    patch.options = [newOption(), newOption()];
                                  }
                                  if ((next === "rating" || next === "numeric_input") && !q.scale) {
                                    patch.scale = { min: 0, max: next === "rating" ? 5 : 100 };
                                  }
                                  if (next === "matrix" && (!q.rows || q.rows.length === 0)) {
                                    patch.rows = [
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" },
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" }
                                    ];
                                  }
                                  updateQuestion(q.id, patch);
                                },
                                className: `${fieldSm} w-36`,
                                style: selectStyle,
                                children: QUESTION_TYPES.map((t) => /* @__PURE__ */ jsx("option", { style: optionStyle, value: t.value, children: t.label }, t.value))
                              }
                            ),
                            typeHasOptions(q.type) && /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
                              q.options.length,
                              " ",
                              q.type === "matrix" ? "columns" : "answers"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground", children: [
                              "Dimension",
                              /* @__PURE__ */ jsx(
                                InfoTooltip,
                                {
                                  content: "On: this question's answer counts toward a dimension's score. Off: it's collected as a plain label only (e.g. a free-text main concern), with no effect on scoring.",
                                  label: "About scoring vs. labeling",
                                  iconClassName: "h-3 w-3"
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsx(
                              "button",
                              {
                                type: "button",
                                role: "switch",
                                "aria-checked": Boolean(q.dimension),
                                onClick: () => updateQuestion(q.id, {
                                  dimension: q.dimension ? "" : usedDimensions[0] || dimensionList[0]?.code || ""
                                }),
                                title: q.dimension ? "Counts toward scoring" : "Label only \u2014 click to score it",
                                className: `relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${q.dimension ? "bg-emerald-500" : "bg-secondary border border-border"}`,
                                children: /* @__PURE__ */ jsx(
                                  "span",
                                  {
                                    className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${q.dimension ? "translate-x-4" : "translate-x-0"}`
                                  }
                                )
                              }
                            ),
                            q.dimension && /* @__PURE__ */ jsx(
                              "select",
                              {
                                value: q.dimension,
                                onChange: (e) => updateQuestion(q.id, { dimension: e.target.value }),
                                className: `${fieldSm} w-56`,
                                style: selectStyle,
                                children: dimensionList.map((d) => /* @__PURE__ */ jsx("option", { style: optionStyle, value: d.code, children: d.label }, d.code))
                              }
                            )
                          ] })
                        ]
                      }
                    ),
                    q.type === "boolean" && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: ["scoreTrue", "scoreFalse"].map((k) => /* @__PURE__ */ jsxs(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k === "scoreTrue" ? "Score if Yes" : "Score if No",
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "text",
                              inputMode: "numeric",
                              value: scoreDrafts[`${q.id}:${k}`] ?? String(q[k] ?? (k === "scoreTrue" ? 1 : 0)),
                              onChange: (e) => {
                                const v = e.target.value;
                                if (!/^-?\d*$/.test(v)) return;
                                setScoreDrafts((d) => ({ ...d, [`${q.id}:${k}`]: v }));
                                updateQuestion(q.id, {
                                  [k]: v === "" || v === "-" ? 0 : parseInt(v, 10)
                                });
                              },
                              onBlur: () => setScoreDrafts((d) => {
                                const n = { ...d };
                                delete n[`${q.id}:${k}`];
                                return n;
                              }),
                              className: `${fieldSm} w-14 text-right`
                            }
                          )
                        ]
                      },
                      k
                    )) }),
                    (q.type === "rating" || q.type === "numeric_input") && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: ["min", "max"].map((k) => /* @__PURE__ */ jsxs(
                      "label",
                      {
                        className: "flex items-center gap-1 text-[11px] text-muted-foreground",
                        children: [
                          k,
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              type: "number",
                              min: 0,
                              max: q.type === "rating" ? 10 : void 0,
                              value: q.scale?.[k] ?? (k === "min" ? 0 : q.type === "rating" ? 5 : 100),
                              onChange: (e) => {
                                let n = parseInt(e.target.value || "0", 10);
                                if (Number.isNaN(n)) n = 0;
                                if (q.type === "rating") {
                                  n = k === "max" ? Math.min(10, Math.max(2, n)) : Math.max(0, n);
                                }
                                updateQuestion(q.id, {
                                  scale: {
                                    min: q.scale?.min ?? 0,
                                    max: q.scale?.max ?? (q.type === "rating" ? 5 : 100),
                                    [k]: n
                                  }
                                });
                              },
                              className: `${fieldSm} w-16 text-right`
                            }
                          )
                        ]
                      },
                      k
                    )) }),
                    q.type === "matrix" && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-muted/20 p-2 space-y-1.5", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground", children: "Rows" }),
                        /* @__PURE__ */ jsx(
                          InfoTooltip,
                          {
                            content: "One score line per row.",
                            label: "About matrix rows",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      (q.rows ?? []).map((r, ri) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground w-4 text-right", children: ri + 1 }),
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            value: r.label,
                            onChange: (e) => updateQuestion(q.id, {
                              rows: (q.rows ?? []).map(
                                (x, i) => i === ri ? { ...x, label: e.target.value } : x
                              )
                            }),
                            placeholder: `Row ${ri + 1} (e.g. "Forehead")`,
                            className: `${fieldSm} flex-1 min-w-0`
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => updateQuestion(q.id, {
                              rows: (q.rows ?? []).filter((_, i) => i !== ri)
                            }),
                            className: "shrink-0 text-muted-foreground hover:text-destructive",
                            children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                          }
                        )
                      ] }, r.value)),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => updateQuestion(q.id, {
                            rows: [
                              ...q.rows ?? [],
                              { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" }
                            ]
                          }),
                          className: "text-beak text-[11px] font-semibold inline-flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                            " Add row"
                          ]
                        }
                      )
                    ] }),
                    typeHasOptions(q.type) && /* @__PURE__ */ jsxs("div", { className: q.type === "matrix" ? "rounded-md border border-border bg-muted/20 p-2 space-y-1.5" : "space-y-1", children: [
                      q.type === "matrix" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-foreground", children: "Answer columns" }),
                        /* @__PURE__ */ jsx(
                          InfoTooltip,
                          {
                            content: "Shared by every row; each column carries a score.",
                            label: "About matrix answer columns",
                            iconClassName: "h-3 w-3"
                          }
                        )
                      ] }),
                      q.options.map((o, idx) => {
                        const currentFlags = Object.keys(o.conditionMap || {});
                        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx(
                            "input",
                            {
                              value: o.label,
                              onChange: (e) => updateOption(q.id, idx, { label: e.target.value }),
                              placeholder: q.type === "matrix" ? `Column ${idx + 1} (e.g. "Severe")` : `Answer ${idx + 1}`,
                              className: `${fieldSm} flex-1 min-w-0`
                            }
                          ),
                          /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 text-[11px] text-muted-foreground shrink-0", children: [
                            "score",
                            /* @__PURE__ */ jsx(
                              "input",
                              {
                                type: "text",
                                inputMode: "numeric",
                                value: scoreDrafts[`${q.id}:${idx}`] ?? String(o.score ?? 0),
                                onChange: (e) => {
                                  const v = e.target.value;
                                  if (!/^-?\d*$/.test(v)) return;
                                  setScoreDrafts((d) => ({ ...d, [`${q.id}:${idx}`]: v }));
                                  updateOption(q.id, idx, {
                                    score: v === "" || v === "-" ? 0 : parseInt(v, 10)
                                  });
                                },
                                onBlur: () => setScoreDrafts((d) => {
                                  const next = { ...d };
                                  delete next[`${q.id}:${idx}`];
                                  return next;
                                }),
                                className: `${fieldSm} w-10 text-right`
                              }
                            )
                          ] }),
                          q.type !== "matrix" && /* @__PURE__ */ jsx(
                            SafetyFlagPicker,
                            {
                              flags: currentFlags,
                              flagOptions,
                              onAddCustom: handleAddCustomFlag,
                              onAdd: (k) => updateOption(q.id, idx, {
                                conditionMap: { ...o.conditionMap || {}, [k]: true }
                              }),
                              onRemove: (k) => {
                                const next = { ...o.conditionMap || {} };
                                delete next[k];
                                updateOption(q.id, idx, {
                                  conditionMap: Object.keys(next).length ? next : void 0
                                });
                              }
                            }
                          ),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => updateQuestion(q.id, {
                                options: q.options.filter((_, i) => i !== idx)
                              }),
                              className: "shrink-0 text-muted-foreground hover:text-destructive",
                              children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                            }
                          )
                        ] }, idx);
                      }),
                      /* @__PURE__ */ jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => updateQuestion(q.id, { options: [...q.options, newOption()] }),
                          className: "text-beak text-[11px] font-semibold inline-flex items-center gap-1",
                          children: [
                            /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                            " ",
                            q.type === "matrix" ? "Add column" : "Add answer"
                          ]
                        }
                      )
                    ] })
                  ] })
                ] }, q.id);
              }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: addQuestion,
                  className: "text-beak text-xs font-semibold inline-flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
                    " Add question"
                  ]
                }
              )
            ] })
          ] }),
          step === "calculation" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-foreground text-xs font-semibold", children: "Calculation method per dimension" }),
              /* @__PURE__ */ jsx(
                InfoTooltip,
                {
                  content: "How every answer score for a dimension is combined into one number before it is sent to the Score Engine.",
                  label: "About calculation methods"
                }
              )
            ] }),
            usedDimensions.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs py-4 text-center", children: "Add questions first." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 pt-1", children: usedDimensions.map((d) => {
              const method = calcMethods[d] || "sum";
              const hint = CALCULATION_METHODS.find((m) => m.value === method)?.hint;
              return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "w-40 shrink-0 text-xs font-semibold text-foreground", children: [
                  metaOf(d).label,
                  /* @__PURE__ */ jsxs("span", { className: "block text-[10px] font-normal text-muted-foreground", children: [
                    questions.filter((q) => q.dimension === d).length,
                    " question(s)"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "select",
                  {
                    value: method,
                    onChange: (e) => setCalcMethods((cur) => ({ ...cur, [d]: e.target.value })),
                    className: `${field} w-40 shrink-0`,
                    style: selectStyle,
                    children: CALCULATION_METHODS.map((m) => /* @__PURE__ */ jsx("option", { style: optionStyle, value: m.value, children: m.label }, m.value))
                  }
                ),
                /* @__PURE__ */ jsx(InfoTooltip, { content: hint, label: "About this calculation method" })
              ] }, d);
            }) })
          ] }),
          step === "json" && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-card p-3 space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-foreground text-xs font-semibold", children: "Stored SurveyJS schema" }),
                /* @__PURE__ */ jsx(
                  InfoTooltip,
                  {
                    content: "The exact JSON persisted to the Form Engine and rendered to respondents. Custom keys (dimension, score, condition_map, calculation_methods) drive scoring. Copy Create body gives the ready-to-paste payload for POST /v1/survey (Create Questionnaire).",
                    label: "About the stored schema"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => copy(schemaJson, "schema"),
                    className: "h-7 rounded-md border border-border bg-muted/40 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted",
                    children: copied === "schema" ? "Copied" : "Copy schema"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => copy(createBodyJson, "body"),
                    className: "h-7 rounded-md border border-border bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20",
                    children: copied === "body" ? "Copied" : "Copy Create body"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("pre", { className: "w-full max-h-96 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-foreground text-[11px] font-mono leading-relaxed whitespace-pre", children: schemaJson })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end pt-3 border-t border-border", children: /* @__PURE__ */ jsx(Button, { type: "submit", size: "sm", isLoading: submitting, disabled: !qName.trim(), children: editingQ ? "Save changes" : "Create questionnaire" }) })
        ] })
      ]
    }
  );
};
var TENANT_KEY = "xg.formEngine.tenant";
var readTenant = () => {
  try {
    const raw = localStorage.getItem(TENANT_KEY);
    if (raw) {
      const t = JSON.parse(raw);
      if (t?.brandId && t?.applicationId) return t;
    }
  } catch {
  }
  return { brandId: "wardah", applicationId: "skinverse" };
};
var FormManager = () => {
  const [activeTab, setActiveTab] = usePersistentState("xg.formEngine.activeTab", "questionnaires");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {
    }
  });
  const [{ brandId, applicationId }, setTenant] = useState(readTenant);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [selectedQCode, setSelectedQCode] = usePersistentState("xg.formEngine.simulator.questionnaire", "");
  const loadData = () => {
    listQuestionnaires(brandId, applicationId).then(setQuestionnaires).catch(() => setQuestionnaires([]));
  };
  useEffect(() => {
    loadData();
    try {
      localStorage.setItem(TENANT_KEY, JSON.stringify({ brandId, applicationId }));
    } catch {
    }
  }, [brandId, applicationId]);
  useEffect(() => {
    if (questionnaires.length === 0) return;
    if (!questionnaires.some((q) => q.code === selectedQCode)) {
      setSelectedQCode(questionnaires[0].code);
    }
  }, [questionnaires, selectedQCode]);
  const formTabs = [
    { id: "questionnaires", label: "Questionnaires", icon: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }), badge: questionnaires.length },
    { id: "simulator", label: "Simulator", icon: /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }) }
  ];
  const handleSaveQuestionnaire = async (data) => {
    if (editingQ) {
      const updated = { ...editingQ, ...data };
      setQuestionnaires((prev) => prev.map((x) => x.code === editingQ.code ? updated : x));
      try {
        await saveQuestionnaire(updated, brandId, applicationId);
      } catch {
      }
    } else {
      const newItem = {
        ...data,
        brandId: data.brandId || brandId,
        applicationId: data.applicationId || applicationId,
        questionsCount: data.questions?.length || 0
      };
      setQuestionnaires((prev) => [...prev, newItem]);
      try {
        await saveQuestionnaire(newItem, brandId, applicationId);
      } catch {
      }
    }
    loadData();
  };
  const handleDeleteQuestionnaire = (code) => {
    const q = questionnaires.find((x) => x.code === code);
    setDeleteConfirm({
      isOpen: true,
      title: "Delete Questionnaire Form",
      message: `Are you sure you want to delete questionnaire form "${q?.name || code}" (${code})?`,
      onConfirm: async () => {
        setQuestionnaires((prev) => prev.filter((q2) => q2.code !== code));
        try {
          await deleteQuestionnaire(code, brandId, applicationId);
        } catch {
        }
        setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 h-full overflow-y-auto bg-background text-foreground font-sans flex flex-col select-none", children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
        breadcrumbs: [
          { label: "Workbench", href: "/" },
          { label: "Core Engines" },
          { label: "Form Engine" }
        ],
        title: "Form Engine",
        children: /* @__PURE__ */ jsx(
          TabNav,
          {
            tabs: formTabs,
            activeTab,
            onTabChange: (id) => setActiveTab(id)
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsx(
          BrandSelect,
          {
            value: brandId,
            includeUniversal: false,
            label: "Brand",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, brandId: v }))
          }
        ),
        /* @__PURE__ */ jsx(
          ApplicationSelect,
          {
            value: applicationId,
            includeUniversal: false,
            label: "Application",
            className: "w-48",
            onChange: (v) => setTenant((t) => ({ ...t, applicationId: v }))
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex pb-2", children: /* @__PURE__ */ jsx(
          InfoTooltip,
          {
            content: "Questionnaires below are scoped to this brand / application.",
            label: "About brand / application scope"
          }
        ) })
      ] }),
      activeTab === "questionnaires" && /* @__PURE__ */ jsx(
        QuestionnairesTab,
        {
          questionnaires,
          searchQuery,
          onSearchChange: setSearchQuery,
          onOpenAddModal: () => {
            setEditingQ(null);
            setIsQuestionnaireModalOpen(true);
          },
          onOpenEditModal: (q) => {
            setEditingQ(q);
            setIsQuestionnaireModalOpen(true);
          },
          onDeleteQuestionnaire: handleDeleteQuestionnaire
        }
      ),
      activeTab === "simulator" && /* @__PURE__ */ jsx(
        FormSimulatorTab,
        {
          brandId,
          applicationId,
          questionnaires,
          selectedQCode,
          setSelectedQCode
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      QuestionnaireModal,
      {
        isOpen: isQuestionnaireModalOpen,
        onClose: () => setIsQuestionnaireModalOpen(false),
        onSave: handleSaveQuestionnaire,
        editingQ,
        brandId,
        applicationId
      }
    ),
    /* @__PURE__ */ jsx(
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
function computeDimensions(schema, data) {
  const byDimension = scoreSurveyAnswers(schema, data);
  const methods = schema.calculation_methods || {};
  return Object.entries(byDimension).map(([code, raw]) => {
    const method = methods[code] || "sum";
    return {
      code,
      calculation_method: method,
      score: Math.round(applyCalculationMethod(raw, method) * 100) / 100,
      raw_scores: raw
    };
  });
}
var QuestionnaireRunner = ({
  questionnaireCode,
  model: modelProp,
  questionnaire,
  customerId,
  brandId,
  applicationId,
  onComplete,
  onAnswer,
  renderComplete,
  className = ""
}) => {
  const initialSchema = modelProp ? modelProp : questionnaire ? toSurveyModel(questionnaire) : null;
  const [schema, setSchema] = useState(initialSchema);
  const [loading, setLoading] = useState(!initialSchema);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);
  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    getQuestionnaireModel(questionnaireCode, brandId, applicationId).then((m) => {
      if (!alive) return;
      if (m) setSchema(m);
      else setError("This questionnaire is not available.");
    }).catch(() => alive && setError("Could not load the questionnaire.")).finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [questionnaireCode, modelProp, questionnaire, brandId, applicationId]);
  const survey = useMemo(() => {
    if (!schema) return null;
    const m = new Model(schema);
    m.showCompletedPage = false;
    m.applyTheme(XG_SURVEY_THEME);
    m.getAllQuestions().forEach((q) => {
      if (q.getType() === "boolean") q.renderAs = "radio";
    });
    return m;
  }, [schema]);
  useEffect(() => {
    if (!survey || !schema) return;
    const onValue = (_, opt2) => onAnswer?.(opt2.name, opt2.value);
    const onComplete_ = async (sender) => {
      const data = sender.data;
      let plain = [];
      try {
        plain = sender.getPlainData?.() ?? [];
      } catch {
        plain = [];
      }
      const result = {
        questionnaire_code: schema.code || questionnaireCode,
        customer_id: customerId,
        source: "questionnaire",
        brand_id: brandId,
        application_id: applicationId,
        answers: data,
        plain_data: plain,
        dimensions: computeDimensions(schema, data),
        completed_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      try {
        await onComplete(result);
      } finally {
        setPayload(result);
      }
    };
    survey.onValueChanged.add(onValue);
    survey.onComplete.add(onComplete_);
    return () => {
      survey.onValueChanged.remove(onValue);
      survey.onComplete.remove(onComplete_);
    };
  }, [survey, schema, customerId, brandId, applicationId]);
  const shell = `w-full max-w-2xl mx-auto text-foreground ${className}`;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: shell, children: /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: "Loading\u2026" }) });
  }
  if (error || !survey) {
    return /* @__PURE__ */ jsx("div", { className: shell, children: /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground", children: error || "This questionnaire is not available." }) });
  }
  if (payload) {
    return /* @__PURE__ */ jsx("div", { className: shell, children: renderComplete ? /* @__PURE__ */ jsx(Fragment, { children: renderComplete(payload) }) : /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-beak/15 text-beak text-xl", children: "\u2713" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Thanks \u2014 your answers are in." }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "You can close this window now." })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: shell, children: /* @__PURE__ */ jsx(Survey, { model: survey }) });
};

export { BUILTIN_TEMPLATES, CALCULATION_METHODS, FALLBACK_DIMENSIONS, FormManager, PFORM_EXAMPLE, PFORM_SUGGESTED_DIMENSIONS, PIXIE_OMG_SKIN_ANALYZER, QuestionnaireRunner, applyCalculationMethod, applyDimensionMapping, buildScoreRequest, createSafetyFlag, deleteQuestionnaire, flattenElements, fromPFormSchema, fromSurveyModel, getDimensionMeta, getDimensions, getQuestionnaire, getQuestionnaireModel, getSafetyFlags, listQuestionnaires, saveQuestionnaire, scoreSurveyAnswers, toSurveyModel };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map