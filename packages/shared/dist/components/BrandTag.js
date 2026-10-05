'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExternalLink } from 'lucide-react';
import { cn } from '../utils';
import { brandColour } from './brand-colour';
export { brandColour, BRAND_COLOUR_PALETTE } from './brand-colour';
export function getDomainFromUrl(url) {
    if (!url)
        return '';
    let cleaned = url.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return cleaned.split('/')[0].split('?')[0].split('#')[0];
}
/**
 * Kept for existing callers; same as brandColour(name). The colour is derived
 * from the name, never looked up from a list of brands.
 */
export function getBrandColorTheme(name) {
    return brandColour(name);
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
