'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CORE_DEFAULT_SEVERITY_BANDS } from './core-default-bands';
// Severity Level is the clinical 5-level scale (Scoring Method doc), health-
// oriented: higher score = healthier. Plain native <select> — no search, no
// colour glyphs.
//
// Omitted options: the labels of core's default severity bands (one mirror,
// core-default-bands.ts), which apply when a ruleset carries no
// severity_bands. A ruleset that sets its own is the authority: pass them.
const CORE_DEFAULT_SEVERITY_LABELS = CORE_DEFAULT_SEVERITY_BANDS.map((b) => b.label);
export const SeveritySelect = ({ value, onChange, options = CORE_DEFAULT_SEVERITY_LABELS, emptyLabel, label, disabled = false, className = '', }) => {
    return (_jsxs("div", { className: className, children: [label && (_jsx("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label })), _jsxs("select", { value: value, disabled: disabled, onChange: (e) => onChange(e.target.value), className: "h-8 w-full rounded-md border border-border bg-muted/40 px-2 text-xs text-foreground outline-none focus:border-ring disabled:opacity-50", children: [emptyLabel !== undefined && (_jsx("option", { value: "", className: "bg-card text-foreground", children: emptyLabel })), value && !options.includes(value) && (_jsxs("option", { value: value, className: "bg-card text-foreground", children: [value, " (not a listed severity level)"] })), options.map((opt) => (_jsx("option", { value: opt, className: "bg-card text-foreground", children: opt }, opt)))] })] }));
};
