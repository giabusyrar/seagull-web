'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Severity Level is the clinical 5-level scale (Scoring Method doc), health-
// oriented: higher score = healthier. Plain native <select> — no search, no
// colour glyphs.
const OPTIONS = ['Sangat Parah', 'Parah', 'Sedang', 'Ringan', 'Sehat'];
export const SeveritySelect = ({ value, onChange, label, disabled = false, className = '', }) => {
    return (_jsxs("div", { className: className, children: [label && (_jsx("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label })), _jsx("select", { value: value, disabled: disabled, onChange: (e) => onChange(e.target.value), className: "h-8 w-full rounded-md border border-border bg-muted/40 px-2 text-xs text-foreground outline-none focus:border-ring disabled:opacity-50", children: OPTIONS.map((opt) => (_jsx("option", { value: opt, className: "bg-card text-foreground", children: opt }, opt))) })] }));
};
