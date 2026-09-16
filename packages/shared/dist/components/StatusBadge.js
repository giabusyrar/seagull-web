import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, Archive } from 'lucide-react';
export const StatusBadge = ({ status = 'ACTIVE', size = 'sm', className = '', }) => {
    const s = (status || 'ACTIVE').toUpperCase().trim();
    const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
    switch (s) {
        case 'ACTIVE':
        case 'PUBLISHED':
            return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 ${padding} ${className}`, children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" }), "Active"] }));
        case 'DRAFT':
            return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200 ${padding} ${className}`, children: [_jsx(Clock, { className: "w-3 h-3 shrink-0" }), "Draft"] }));
        case 'ARCHIVED':
            return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-50 text-rose-800 border border-rose-200 ${padding} ${className}`, children: [_jsx(Archive, { className: "w-3 h-3 shrink-0" }), "Archived"] }));
        case 'INACTIVE':
            return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${padding} ${className}`, children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" }), "Inactive"] }));
        default:
            return (_jsx("span", { className: `inline-flex items-center gap-1.5 rounded-full font-medium bg-secondary text-secondary-foreground border border-border ${padding} ${className}`, children: status }));
    }
};
