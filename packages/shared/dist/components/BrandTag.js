'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExternalLink } from 'lucide-react';
import { cn } from '../utils';
export function getDomainFromUrl(url) {
    if (!url)
        return '';
    let cleaned = url.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleaned.split('/')[0].split('?')[0].split('#')[0];
}
const BRAND_COLOR_PALETTES = {
    wardah: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    makeover: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', dot: 'bg-rose-400' },
    'make over': { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', dot: 'bg-rose-400' },
    emina: { bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-300', dot: 'bg-pink-400' },
    kahf: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300', dot: 'bg-amber-400' },
    biodef: { bg: 'bg-beak/20', border: 'border-beak/20', text: 'text-beak', dot: 'bg-beak' },
    wonderly: { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', dot: 'bg-purple-400' },
    omg: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', dot: 'bg-orange-400' },
    labore: { bg: 'bg-teal-500/15', border: 'border-teal-500/40', text: 'text-teal-300', dot: 'bg-teal-400' },
    somethinc: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', text: 'text-violet-300', dot: 'bg-violet-400' },
};
const COLOR_TIERS = [
    { bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-300', dot: 'bg-amber-400' },
    { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    { bg: 'bg-rose-500/15', border: 'border-rose-500/40', text: 'text-rose-300', dot: 'bg-rose-400' },
    { bg: 'bg-sky-500/15', border: 'border-sky-500/40', text: 'text-sky-300', dot: 'bg-sky-400' },
    { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-300', dot: 'bg-purple-400' },
    { bg: 'bg-beak/20', border: 'border-beak/20', text: 'text-beak', dot: 'bg-beak' },
    { bg: 'bg-teal-500/15', border: 'border-teal-500/40', text: 'text-teal-300', dot: 'bg-teal-400' },
    { bg: 'bg-indigo-500/15', border: 'border-indigo-500/40', text: 'text-indigo-300', dot: 'bg-indigo-400' },
    { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-300', dot: 'bg-orange-400' },
];
export function getBrandColorTheme(name) {
    const cleanName = (name || '').toLowerCase().trim();
    if (BRAND_COLOR_PALETTES[cleanName]) {
        return BRAND_COLOR_PALETTES[cleanName];
    }
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLOR_TIERS.length;
    return COLOR_TIERS[index];
}
export const BrandTag = ({ name, website, colorCode, className = '', showWebsiteLink = false, }) => {
    const theme = getBrandColorTheme(name);
    const domain = getDomainFromUrl(website);
    const formattedWebsiteUrl = website
        ? website.startsWith('http')
            ? website
            : `https://${website}`
        : domain
            ? `https://${domain}`
            : null;
    return (_jsxs("div", { className: cn('inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-bold rounded-md w-fit whitespace-nowrap shadow-xs hover:brightness-110 transition select-none', theme.bg, theme.border, theme.text, className), children: [_jsx("span", { className: cn('h-2 w-2 rounded-full shrink-0 border border-white/20', colorCode ? '' : theme.dot), style: colorCode ? { backgroundColor: colorCode } : undefined }), _jsx("span", { children: name }), showWebsiteLink && formattedWebsiteUrl && (_jsx("a", { href: formattedWebsiteUrl, target: "_blank", rel: "noopener noreferrer", onClick: (e) => e.stopPropagation(), className: "ml-0.5 opacity-70 hover:opacity-100 transition", title: `Visit ${name} (${domain || formattedWebsiteUrl})`, children: _jsx(ExternalLink, { className: "h-3 w-3 shrink-0" }) }))] }));
};
