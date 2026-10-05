"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Plus, Trash2, X, ChevronDown, ChevronRight, Flag } from "lucide-react";
import { Modal, Button, BrandSelect, ApplicationSelect, InfoTooltip, useHostRoutes } from "@gateway-experience/shared";
import type {
  CalculationMethod,
  QuestionnaireItem,
  QuestionItem,
  QuestionOption,
  QuestionType,
} from "../../types";
import {
  BUILTIN_TEMPLATES,
  CALCULATION_METHODS,
  getDimensionMeta,
  type DimensionMeta,
} from "../../catalog";
import { toSurveyModel } from "../../surveyjs";
import { getDimensions, getSafetyFlags, createSafetyFlag, type SafetyFlagRow } from "../../api";

// Builder question types and their friendly labels.
const QUESTION_TYPES: { value: QuestionType; label: string; hasOptions: boolean }[] = [
  { value: "single_choice", label: "Choose one", hasOptions: true },
  { value: "multi_choice", label: "Select many", hasOptions: true },
  { value: "dropdown", label: "Dropdown", hasOptions: true },
  { value: "ranking", label: "Rank order", hasOptions: true },
  { value: "matrix", label: "Matrix (grid)", hasOptions: true },
  { value: "boolean", label: "Yes / No", hasOptions: false },
  { value: "rating", label: "Rating", hasOptions: false },
  { value: "numeric_input", label: "Number", hasOptions: false },
];
const typeHasOptions = (t: QuestionType) =>
  QUESTION_TYPES.find((x) => x.value === t)?.hasOptions ?? true;

const TYPE_HINTS: Record<QuestionType, string> = {
  single_choice: "Respondent picks exactly one answer.",
  multi_choice: "Respondent ticks any number of answers; each ticked answer's score counts.",
  dropdown: "Pick one, shown as a dropdown. Good for long answer lists.",
  ranking: "Respondent drags the answers into order. Every answer's score counts.",
  matrix: "A grid: each row is scored against the shared answer columns.",
  boolean: "A single Yes / No toggle.",
  rating: "A small rating scale (2–10 buttons); the chosen number is the score. For a wider range use Number.",
  numeric_input: "A free number entry; the entered value is the score.",
  slider: "A slider; the chosen number is the score.",
};

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuestionnaireItem) => Promise<void>;
  editingQ: QuestionnaireItem | null;
  /**
   * Active tenant from the Form Manager selector — the default for a new
   * questionnaire. Empty means none was chosen: the Setup step asks for one and
   * the questionnaire cannot be saved until both are picked.
   */
  brandId?: string;
  applicationId?: string;
}

const field =
  "h-9 rounded-md bg-muted/40 border border-border px-2.5 text-foreground text-xs outline-none focus:border-ring transition";
const fieldSm =
  "h-8 rounded-md bg-muted/40 border border-border px-2 text-foreground text-xs outline-none focus:border-ring transition";

// Native <select> popups ignore CSS classes; keep them dark inline.
const selectStyle: React.CSSProperties = { colorScheme: "dark" };
const optionStyle: React.CSSProperties = {
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
};

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_{2,}/g, "_");

const newOption = (): QuestionOption => ({
  label: "",
  value: `opt_${Math.random().toString(36).slice(2, 8)}`,
  score: 0,
});

const newQuestion = (dimension: string): QuestionItem => ({
  id: `q_${Math.random().toString(36).slice(2, 9)}`,
  type: "single_choice",
  label: "",
  dimension,
  options: [newOption(), newOption()],
});

/**
 * A single answer's safety flags — a compact icon button that sits inline
 * with the answer row (filled when it carries any flag, outline when it
 * doesn't), opening a small floating panel to add/remove flags rather than
 * an inline block that pushes every row below it down the page.
 */
const SafetyFlagPicker: React.FC<{
  flags: string[];
  flagOptions: SafetyFlagRow[];
  onAdd: (code: string) => void;
  onRemove: (code: string) => void;
  onAddCustom: (name: string) => Promise<string | null>;
}> = ({ flags, flagOptions, onAdd, onRemove, onAddCustom }) => {
  const [open, setOpen] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasFlags = flags.length > 0;

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingCustom(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const choices = flagOptions.filter((f) => !flags.includes(f.code));

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        title={hasFlags ? `Safety flags: ${flags.join(", ")}` : "Add safety flags"}
        onClick={() => setOpen((o) => !o)}
        className={`h-9 w-9 flex items-center justify-center rounded-md border-2 transition ${
          hasFlags
            ? "border-amber-500 bg-amber-500/10 text-amber-600"
            : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
        }`}
      >
        <Flag className="h-5 w-5" fill={hasFlags ? "currentColor" : "none"} />
        {flags.length > 1 && (
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {flags.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-md border border-border bg-popover shadow-lg p-2 space-y-1.5">
          {hasFlags && (
            <div className="flex flex-wrap gap-1">
              {flags.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] px-1.5 py-0.5 rounded font-mono"
                >
                  {k}
                  <button type="button" onClick={() => onRemove(k)}>
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {addingCustom ? (
            <input
              autoFocus
              disabled={savingCustom}
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              onKeyDown={async (e) => {
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
              }}
              placeholder="Flag name (e.g. Baru sunburn)"
              className={`${fieldSm} w-full`}
            />
          ) : (
            <select
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__custom__") setAddingCustom(true);
                else if (v) onAdd(v);
              }}
              className={`${fieldSm} w-full`}
              style={selectStyle}
            >
              <option style={optionStyle} value="">
                + add flag
              </option>
              {choices.map((f) => (
                <option key={f.code} style={optionStyle} value={f.code}>
                  {f.code}
                </option>
              ))}
              <option style={optionStyle} value="__custom__">
                + Custom…
              </option>
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingQ,
  brandId = "",
  applicationId = "",
}) => {
  const hostRoutes = useHostRoutes();
  const [step, setStep] = useState<"setup" | "questions" | "calculation" | "json">("setup");
  const [qCode, setQCode] = useState("");
  const [qBrand, setQBrand] = useState(brandId);
  const [qApp, setQApp] = useState(applicationId);
  const [codeEdited, setCodeEdited] = useState(false);
  const [showCodeField, setShowCodeField] = useState(false);
  const [qName, setQName] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qStatus, setQStatus] = useState("draft");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [calcMethods, setCalcMethods] = useState<Record<string, CalculationMethod>>({});
  const [apiDimensions, setApiDimensions] = useState<DimensionMeta[]>([]);
  // False until the reference dimension catalog request settles, so an empty
  // list can be told apart from one still loading.
  const [dimensionsSettled, setDimensionsSettled] = useState(false);
  const [safetyFlagCatalog, setSafetyFlagCatalog] = useState<SafetyFlagRow[]>([]);
  const [filterDim, setFilterDim] = useState<string>("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string>("");

  const copy = (text: string, tag: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(tag);
        setTimeout(() => setCopied(""), 1500);
      },
      () => {},
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
    // Dimensions come only from reference data. When the catalog is empty or
    // unreachable the builder says so (see dimensionsUnavailable) rather than
    // offering a built-in list that may not match this deployment.
    getDimensions(hostRoutes)
      .then((raw) => {
        setApiDimensions(
          raw
            .filter((it) => it && it.code && !it.parentCode)
            .map((it) => ({
              code: it.code,
              label: it.name || it.code,
              purpose: it.description || getDimensionMeta(it.code).purpose,
            })),
        );
      })
      .catch(() => setApiDimensions([]))
      .finally(() => setDimensionsSettled(true));
  }, [isOpen, hostRoutes]);

  useEffect(() => {
    if (!isOpen) return;
    getSafetyFlags(hostRoutes)
      .then(setSafetyFlagCatalog)
      .catch(() => setSafetyFlagCatalog([]));
  }, [isOpen, hostRoutes]);

  const effectiveCode = codeEdited ? qCode : slugify(qName);
  const usedDimensions = Array.from(new Set(questions.map((q) => q.dimension).filter(Boolean)));

  // Every flag a choice's dropdown can offer: the registered catalog
  // (Reference Data -> Customer Conditions) plus whatever's already in use
  // on this questionnaire (e.g. a custom flag typed on another answer) —
  // never a hardcoded list.
  const flagOptions = useMemo(() => {
    const byCode = new Map<string, SafetyFlagRow>();
    for (const f of safetyFlagCatalog) byCode.set(f.code, f);
    for (const q of questions) {
      for (const o of q.options || []) {
        for (const k of Object.keys(o.conditionMap || {})) {
          if (!byCode.has(k)) byCode.set(k, { code: k });
        }
      }
    }
    return Array.from(byCode.values()).sort((a, b) =>
      (a.name || a.code).localeCompare(b.name || b.code),
    );
  }, [safetyFlagCatalog, questions]);

  // A "+ Custom..." flag is registered as a real ref_conditions catalog row
  // (code auto-generated from the name via slugify, same as a questionnaire's
  // own code), so it shows up with a proper name everywhere afterward instead
  // of a bare slug, and is reusable on other questionnaires going forward.
  const handleAddCustomFlag = async (name: string): Promise<string | null> => {
    const code = slugify(name);
    if (!code) return null;
    const existing = safetyFlagCatalog.find((f) => f.code === code);
    if (existing) return existing.code;
    const created = await createSafetyFlag(hostRoutes, code, name);
    if (created) setSafetyFlagCatalog((prev) => [...prev, created]);
    return code;
  };

  // Must run on every render (before the isOpen early return) to keep hook order stable.
  const draftItem = useMemo<QuestionnaireItem>(
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
        usedDimensions.map((d) => [d, calcMethods[d] || "sum"]),
      ) as Record<string, CalculationMethod>,
    }),
    [effectiveCode, qName, qDesc, qStatus, qBrand, qApp, questions, calcMethods, usedDimensions],
  );

  if (!isOpen) return null;

  const dimensionList = apiDimensions;
  const dimensionsUnavailable = dimensionsSettled && dimensionList.length === 0;
  const tenantMissing = !qBrand || !qApp;
  const metaOf = (code: string) => getDimensionMeta(code, dimensionList);

  const schemaJson = JSON.stringify(toSurveyModel(draftItem), null, 2);

  // Ready-to-paste body for POST /v1/survey (Create Questionnaire). brand_id /
  // application_id are injected by the gateway collection, so they're omitted here.
  const createBodyJson = JSON.stringify(
    {
      code: qCode || slugify(qName),
      title: qName,
      status:
        qStatus === "published" || qStatus === "active"
          ? "active"
          : qStatus === "archived"
            ? "archived"
            : "draft",
      schema: toSurveyModel(draftItem),
    },
    null,
    2,
  );

  const updateQuestion = (id: string, patch: Partial<QuestionItem>) =>
    setQuestions((cur) => cur.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const updateOption = (qid: string, idx: number, patch: Partial<QuestionOption>) =>
    setQuestions((cur) =>
      cur.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)) }
          : q,
      ),
    );

  const addQuestion = () => {
    // A new question starts unscored unless the list is filtered to one
    // dimension; scoring it is an explicit pick from the reference catalog.
    const dim = filterDim !== "all" ? filterDim : "";
    const q = newQuestion(dim);
    setQuestions((cur) => [...cur, q]);
    setCollapsed((cur) => ({ ...cur, [q.id]: false }));
  };

  const removeQuestion = (id: string) => setQuestions((cur) => cur.filter((q) => q.id !== id));

  const loadTemplate = (id: string) => {
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = effectiveCode.trim();
    if (!qName.trim() || !code || tenantMissing) return;
    setSubmitting(true);
    try {
      await onSave({ ...draftItem, code });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const visibleQuestions = questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => filterDim === "all" || q.dimension === filterDim);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      icon={<FileText className="h-4 w-4" />}
      title={editingQ ? "Edit questionnaire" : "New questionnaire"}
      subtitle="Form Engine only calculates scores. Labelling and normalisation happen in the Score Engine."
      isLoading={submitting}
      loadingText={submitting ? (editingQ ? "Saving questionnaire..." : "Creating questionnaire...") : undefined}
    >
      <div className="flex items-center gap-1 rounded-md border border-border bg-muted/30 p-1 text-xs">
        {(
          [
            ["setup", "1  Setup"],
            ["questions", `2  Questions (${questions.length})`],
            ["calculation", "3  Calculation"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setStep(v)}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              step === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setStep("json")}
          className={`ml-auto px-3 py-1.5 rounded font-semibold transition ${
            step === "json" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          title="Preview the stored SurveyJS schema"
        >
          Schema
        </button>
      </div>

      <form onSubmit={submit} className="mt-3 space-y-3">
        {/* STEP 1 — SETUP */}
        {step === "setup" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-3 space-y-3">
              <label className="block space-y-1">
                <span className="text-muted-foreground text-xs font-semibold">Name</span>
                <input
                  required
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  placeholder="e.g. Pixie Skin Analyzer"
                  className={`${field} w-full`}
                />
                <span className="block text-[11px] text-muted-foreground">
                  Saved as <code className="text-foreground">{effectiveCode || "—"}</code>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeField((s) => !s);
                      if (!codeEdited) setQCode(effectiveCode);
                    }}
                    className="ml-2 underline hover:text-foreground"
                  >
                    {showCodeField ? "done" : "edit"}
                  </button>
                </span>
                {showCodeField && (
                  <input
                    value={qCode}
                    disabled={!!editingQ}
                    onChange={(e) => {
                      setCodeEdited(true);
                      setQCode(slugify(e.target.value));
                    }}
                    className={`${field} w-full font-mono disabled:opacity-50`}
                  />
                )}
              </label>

              <label className="block space-y-1">
                <span className="text-muted-foreground text-xs font-semibold">Description</span>
                <textarea
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  rows={3}
                  placeholder="What this questionnaire is for."
                  className="w-full rounded-md bg-muted/40 border border-border px-2.5 py-2 text-foreground text-xs outline-none focus:border-ring transition resize-y"
                  style={{ minHeight: "4.5rem" }}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-muted-foreground text-xs font-semibold">Status</span>
                <select
                  value={qStatus}
                  onChange={(e) => setQStatus(e.target.value)}
                  className={`${field} w-full`}
                  style={selectStyle}
                >
                  <option style={optionStyle} value="draft">Draft</option>
                  <option style={optionStyle} value="published">Published</option>
                  <option style={optionStyle} value="archived">Archived</option>
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold">Brand</span>
                    <InfoTooltip
                      content={`Saved under ${qBrand || "—"} / ${qApp || "—"}. Defaults to the Form Engine selector; change it to build for a different tenant.`}
                      label="About brand / application"
                    />
                  </div>
                  <BrandSelect
                    value={qBrand}
                    includeUniversal={false}
                    label=""
                    onChange={setQBrand}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-semibold">Application</span>
                  <ApplicationSelect
                    value={qApp}
                    includeUniversal={false}
                    label=""
                    onChange={setQApp}
                  />
                </div>
              </div>
              {tenantMissing && (
                <p className="text-[11px] text-amber-500">
                  Choose a brand and an application — the questionnaire is saved under that tenant.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-3 space-y-2">
              <p className="text-foreground text-xs font-semibold">Start from a template</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BUILTIN_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => loadTemplate(t.id)}
                    className="text-left rounded-md border border-border bg-muted/30 hover:border-ring p-2.5 transition"
                  >
                    <p className="text-foreground text-xs font-semibold">{t.name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={() => setStep("questions")}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 — QUESTIONS (flat list + dimension filter) */}
        {step === "questions" && (
          <div className="space-y-3">
            {dimensionsUnavailable && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-500">
                Dimensions could not be loaded from reference data. Questions can still be
                written as label-only; scoring needs the dimension catalog (Reference Data →
                Dimensions).
              </div>
            )}
            {usedDimensions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", ...usedDimensions] as string[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFilterDim(d)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition ${
                      filterDim === d
                        ? "border-beak/50 bg-beak/15 text-beak"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === "all" ? "All" : metaOf(d).label}
                  </button>
                ))}
              </div>
            )}

            {questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-foreground text-xs font-semibold">No questions yet</p>
                <p className="text-muted-foreground text-[11px] mt-1 mb-3">
                  Add questions or load a template from Setup.
                </p>
                <Button type="button" size="sm" onClick={addQuestion}>
                  <Plus className="h-3.5 w-3.5" /> Add question
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleQuestions.map(({ q, index }) => {
                  const isCollapsed = collapsed[q.id];
                  return (
                    <div key={q.id} className="rounded-md border border-border bg-card">
                      <div className="flex items-center gap-2 p-2">
                        <span className="shrink-0 w-6 text-center text-[11px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <input
                          value={q.label}
                          onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                          placeholder="Question text"
                          className={`${fieldSm} flex-1 min-w-0`}
                        />
                        <button
                          type="button"
                          onClick={() => setCollapsed((c) => ({ ...c, [q.id]: !c[q.id] }))}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {!isCollapsed && (
                        <div className="border-t border-border p-2.5 space-y-2">
                          <div
                            className="flex flex-wrap items-center"
                            style={{ columnGap: "2rem", rowGap: "0.5rem" }}
                          >
                            <label className="flex items-center gap-2">
                              <span className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground">
                                Question type
                                <InfoTooltip
                                  content={TYPE_HINTS[q.type]}
                                  label="About this question type"
                                  iconClassName="h-3 w-3"
                                />
                              </span>
                              <select
                                value={q.type}
                                onChange={(e) => {
                                  const next = e.target.value as QuestionType;
                                  const patch: Partial<QuestionItem> = { type: next };
                                  if (typeHasOptions(next) && (!q.options || q.options.length === 0)) {
                                    patch.options = [newOption(), newOption()];
                                  }
                                  if ((next === "rating" || next === "numeric_input") && !q.scale) {
                                    patch.scale = { min: 0, max: next === "rating" ? 5 : 100 };
                                  }
                                  if (next === "matrix" && (!q.rows || q.rows.length === 0)) {
                                    patch.rows = [
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" },
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" },
                                    ];
                                  }
                                  updateQuestion(q.id, patch);
                                }}
                                className={`${fieldSm} w-36`}
                                style={selectStyle}
                              >
                                {QUESTION_TYPES.map((t) => (
                                  <option key={t.value} style={optionStyle} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                              {typeHasOptions(q.type) && (
                                <span className="text-[11px] text-muted-foreground">
                                  {q.options.length} {q.type === "matrix" ? "columns" : "answers"}
                                </span>
                              )}
                            </label>

                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 shrink-0 text-[11px] font-semibold text-muted-foreground">
                                Dimension
                                <InfoTooltip
                                  content="On: this question's answer counts toward a dimension's score. Off: it's collected as a plain label only (e.g. a free-text main concern), with no effect on scoring."
                                  label="About scoring vs. labeling"
                                  iconClassName="h-3 w-3"
                                />
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={Boolean(q.dimension)}
                                disabled={!q.dimension && dimensionList.length === 0}
                                onClick={() =>
                                  updateQuestion(q.id, {
                                    dimension: q.dimension
                                      ? ""
                                      : usedDimensions[0] || dimensionList[0]?.code || "",
                                  })
                                }
                                title={
                                  q.dimension
                                    ? "Counts toward scoring"
                                    : dimensionList.length === 0
                                      ? "No dimensions loaded from reference data"
                                      : "Label only — click to score it"
                                }
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full disabled:cursor-not-allowed disabled:opacity-50 border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  q.dimension ? "bg-emerald-500" : "bg-secondary border border-border"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    q.dimension ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              {q.dimension && (
                                <select
                                  value={q.dimension}
                                  onChange={(e) => updateQuestion(q.id, { dimension: e.target.value })}
                                  className={`${fieldSm} w-56`}
                                  style={selectStyle}
                                >
                                  {!dimensionList.some((d) => d.code === q.dimension) && (
                                    <option style={optionStyle} value={q.dimension}>
                                      {q.dimension} (not in reference data)
                                    </option>
                                  )}
                                  {dimensionList.map((d) => (
                                    <option key={d.code} style={optionStyle} value={d.code}>
                                      {d.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          {/* boolean — score per state */}
                          {q.type === "boolean" && (
                            <div className="flex items-center gap-3">
                              {(["scoreTrue", "scoreFalse"] as const).map((k) => (
                                <label
                                  key={k}
                                  className="flex items-center gap-1 text-[11px] text-muted-foreground"
                                >
                                  {k === "scoreTrue" ? "Score if Yes" : "Score if No"}
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                      scoreDrafts[`${q.id}:${k}`] ??
                                      String(q[k] ?? (k === "scoreTrue" ? 1 : 0))
                                    }
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      if (!/^-?\d*$/.test(v)) return;
                                      setScoreDrafts((d) => ({ ...d, [`${q.id}:${k}`]: v }));
                                      updateQuestion(q.id, {
                                        [k]: v === "" || v === "-" ? 0 : parseInt(v, 10),
                                      });
                                    }}
                                    onBlur={() =>
                                      setScoreDrafts((d) => {
                                        const n = { ...d };
                                        delete n[`${q.id}:${k}`];
                                        return n;
                                      })
                                    }
                                    className={`${fieldSm} w-14 text-right`}
                                  />
                                </label>
                              ))}
                            </div>
                          )}

                          {/* rating / number — value range */}
                          {(q.type === "rating" || q.type === "numeric_input") && (
                            <div className="flex items-center gap-3">
                              {(["min", "max"] as const).map((k) => (
                                <label
                                  key={k}
                                  className="flex items-center gap-1 text-[11px] text-muted-foreground"
                                >
                                  {k}
                                  <input
                                    type="number"
                                    min={0}
                                    max={q.type === "rating" ? 10 : undefined}
                                    value={q.scale?.[k] ?? (k === "min" ? 0 : q.type === "rating" ? 5 : 100)}
                                    onChange={(e) => {
                                      let n = parseInt(e.target.value || "0", 10);
                                      if (Number.isNaN(n)) n = 0;
                                      if (q.type === "rating") {
                                        n = k === "max" ? Math.min(10, Math.max(2, n)) : Math.max(0, n);
                                      }
                                      updateQuestion(q.id, {
                                        scale: {
                                          min: q.scale?.min ?? 0,
                                          max: q.scale?.max ?? (q.type === "rating" ? 5 : 100),
                                          [k]: n,
                                        },
                                      });
                                    }}
                                    className={`${fieldSm} w-16 text-right`}
                                  />
                                </label>
                              ))}
                            </div>
                          )}

                          {/* matrix — rows scored against the shared columns */}
                          {q.type === "matrix" && (
                            <div className="rounded-md border border-border bg-muted/20 p-2 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[11px] font-semibold text-foreground">Rows</p>
                                <InfoTooltip
                                  content="One score line per row."
                                  label="About matrix rows"
                                  iconClassName="h-3 w-3"
                                />
                              </div>
                              {(q.rows ?? []).map((r, ri) => (
                                <div key={r.value} className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-4 text-right">
                                    {ri + 1}
                                  </span>
                                  <input
                                    value={r.label}
                                    onChange={(e) =>
                                      updateQuestion(q.id, {
                                        rows: (q.rows ?? []).map((x, i) =>
                                          i === ri ? { ...x, label: e.target.value } : x,
                                        ),
                                      })
                                    }
                                    placeholder={`Row ${ri + 1} (e.g. "Forehead")`}
                                    className={`${fieldSm} flex-1 min-w-0`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuestion(q.id, {
                                        rows: (q.rows ?? []).filter((_, i) => i !== ri),
                                      })
                                    }
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestion(q.id, {
                                    rows: [
                                      ...(q.rows ?? []),
                                      { value: `row_${Math.random().toString(36).slice(2, 7)}`, label: "" },
                                    ],
                                  })
                                }
                                className="text-beak text-[11px] font-semibold inline-flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" /> Add row
                              </button>
                            </div>
                          )}

                          {/* choice answers / matrix columns — label + score (+ safety flags for choice) */}
                          {typeHasOptions(q.type) && (
                            <div className={q.type === "matrix" ? "rounded-md border border-border bg-muted/20 p-2 space-y-1.5" : "space-y-1"}>
                              {q.type === "matrix" && (
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[11px] font-semibold text-foreground">Answer columns</p>
                                  <InfoTooltip
                                    content="Shared by every row; each column carries a score."
                                    label="About matrix answer columns"
                                    iconClassName="h-3 w-3"
                                  />
                                </div>
                              )}
                              {q.options.map((o, idx) => {
                                const currentFlags = Object.keys(o.conditionMap || {});
                                return (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    value={o.label}
                                    onChange={(e) => updateOption(q.id, idx, { label: e.target.value })}
                                    placeholder={
                                      q.type === "matrix"
                                        ? `Column ${idx + 1} (e.g. "Severe")`
                                        : `Answer ${idx + 1}`
                                    }
                                    className={`${fieldSm} flex-1 min-w-0`}
                                  />
                                  <label className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                    score
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={scoreDrafts[`${q.id}:${idx}`] ?? String(o.score ?? 0)}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        if (!/^-?\d*$/.test(v)) return;
                                        setScoreDrafts((d) => ({ ...d, [`${q.id}:${idx}`]: v }));
                                        updateOption(q.id, idx, {
                                          score: v === "" || v === "-" ? 0 : parseInt(v, 10),
                                        });
                                      }}
                                      onBlur={() =>
                                        setScoreDrafts((d) => {
                                          const next = { ...d };
                                          delete next[`${q.id}:${idx}`];
                                          return next;
                                        })
                                      }
                                      className={`${fieldSm} w-10 text-right`}
                                    />
                                  </label>
                                  {q.type !== "matrix" && (
                                    <SafetyFlagPicker
                                      flags={currentFlags}
                                      flagOptions={flagOptions}
                                      onAddCustom={handleAddCustomFlag}
                                      onAdd={(k) =>
                                        updateOption(q.id, idx, {
                                          conditionMap: { ...(o.conditionMap || {}), [k]: true },
                                        })
                                      }
                                      onRemove={(k) => {
                                        const next = { ...(o.conditionMap || {}) };
                                        delete next[k];
                                        updateOption(q.id, idx, {
                                          conditionMap: Object.keys(next).length ? next : undefined,
                                        });
                                      }}
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuestion(q.id, {
                                        options: q.options.filter((_, i) => i !== idx),
                                      })
                                    }
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => updateQuestion(q.id, { options: [...q.options, newOption()] })}
                                className="text-beak text-[11px] font-semibold inline-flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />{" "}
                                {q.type === "matrix" ? "Add column" : "Add answer"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-beak text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add question
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — CALCULATION (per dimension) */}
        {step === "calculation" && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-foreground text-xs font-semibold">Calculation method per dimension</p>
              <InfoTooltip
                content="How every answer score for a dimension is combined into one number before it is sent to the Score Engine."
                label="About calculation methods"
              />
            </div>
            {usedDimensions.length === 0 ? (
              <p className="text-muted-foreground text-xs py-4 text-center">Add questions first.</p>
            ) : (
              <div className="space-y-2 pt-1">
                {usedDimensions.map((d) => {
                  const method = calcMethods[d] || "sum";
                  const hint = CALCULATION_METHODS.find((m) => m.value === method)?.hint;
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs font-semibold text-foreground">
                        {metaOf(d).label}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {questions.filter((q) => q.dimension === d).length} question(s)
                        </span>
                      </span>
                      <select
                        value={method}
                        onChange={(e) =>
                          setCalcMethods((cur) => ({ ...cur, [d]: e.target.value as CalculationMethod }))
                        }
                        className={`${field} w-40 shrink-0`}
                        style={selectStyle}
                      >
                        {CALCULATION_METHODS.map((m) => (
                          <option key={m.value} style={optionStyle} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <InfoTooltip content={hint} label="About this calculation method" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SCHEMA — read-only preview + copy for API testing */}
        {step === "json" && (
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <p className="text-foreground text-xs font-semibold">Stored SurveyJS schema</p>
                <InfoTooltip
                  content="The exact JSON persisted to the Form Engine and rendered to respondents. Custom keys (dimension, score, condition_map, calculation_methods) drive scoring. Copy Create body gives the ready-to-paste payload for POST /v1/survey (Create Questionnaire)."
                  label="About the stored schema"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => copy(schemaJson, "schema")}
                  className="h-7 rounded-md border border-border bg-muted/40 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                >
                  {copied === "schema" ? "Copied" : "Copy schema"}
                </button>
                <button
                  type="button"
                  onClick={() => copy(createBodyJson, "body")}
                  className="h-7 rounded-md border border-border bg-beak/10 px-2.5 text-[11px] font-semibold text-beak hover:bg-beak/20"
                >
                  {copied === "body" ? "Copied" : "Copy Create body"}
                </button>
              </div>
            </div>
            <pre className="w-full max-h-96 overflow-auto rounded-md bg-muted/40 border border-border p-2.5 text-foreground text-[11px] font-mono leading-relaxed whitespace-pre">
              {schemaJson}
            </pre>
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-border">
          {tenantMissing && (
            <span className="mr-3 text-[11px] text-amber-500">Pick a brand and application in Setup to save.</span>
          )}
          <Button type="submit" size="sm" isLoading={submitting} disabled={!qName.trim() || tenantMissing}>
            {editingQ ? "Save changes" : "Create questionnaire"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};