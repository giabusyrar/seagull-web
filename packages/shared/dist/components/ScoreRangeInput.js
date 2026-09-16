import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ScoreRangeInput = ({ minScore, maxScore, minLimit = 0, maxLimit = 100, onChange, disabled = false, className = '', }) => {
    const handleMinChange = (e) => {
        const val = Number(e.target.value);
        const clamped = isNaN(val) ? minLimit : Math.max(minLimit, Math.min(maxLimit, val));
        onChange(clamped, Math.max(clamped, maxScore));
    };
    const handleMaxChange = (e) => {
        const val = Number(e.target.value);
        const clamped = isNaN(val) ? maxLimit : Math.max(minLimit, Math.min(maxLimit, val));
        onChange(Math.min(clamped, minScore), clamped);
    };
    return (_jsxs("div", { className: `inline-flex items-center gap-1.5 font-mono ${className}`, children: [_jsx("input", { type: "number", min: minLimit, max: maxLimit, disabled: disabled, value: minScore, onChange: handleMinChange, className: "w-14 px-2 py-1 bg-muted/40 border border-border rounded text-sky-800 text-xs font-semibold text-center focus:outline-none focus:border-ring disabled:opacity-50" }), _jsx("span", { className: "text-muted-foreground text-xs select-none", children: "to" }), _jsx("input", { type: "number", min: minLimit, max: maxLimit, disabled: disabled, value: maxScore, onChange: handleMaxChange, className: "w-14 px-2 py-1 bg-muted/40 border border-border rounded text-sky-800 text-xs font-semibold text-center focus:outline-none focus:border-ring disabled:opacity-50" })] }));
};
