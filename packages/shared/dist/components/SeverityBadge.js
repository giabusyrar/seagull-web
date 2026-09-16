import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SeverityBadge = ({ severity = 'optimal', size = 'sm', className = '', }) => {
    const s = (severity || 'optimal').toLowerCase().trim();
    const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
    let colorStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    let dotColor = 'bg-emerald-400';
    if (s === 'critical') {
        colorStyle = 'bg-purple-950/80 text-purple-300 border-purple-800';
        dotColor = 'bg-purple-400';
    }
    else if (s === 'severe') {
        colorStyle = 'bg-rose-950/80 text-rose-300 border-rose-800';
        dotColor = 'bg-rose-400';
    }
    else if (s === 'moderate') {
        colorStyle = 'bg-orange-950/80 text-orange-300 border-orange-800';
        dotColor = 'bg-orange-400';
    }
    else if (s === 'mild') {
        colorStyle = 'bg-amber-950/80 text-amber-300 border-amber-800';
        dotColor = 'bg-amber-400';
    }
    return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${colorStyle} ${padding} ${className}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${dotColor} shrink-0` }), s] }));
};
