'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils';
export const CodeBlock = ({ code, language = 'json', maxHeight = '300px', showLineNumbers = false, className = '', }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const lines = code ? code.split('\n') : [];
    return (_jsxs("div", { className: cn('relative bg-muted/50 border border-border rounded-xl overflow-hidden group shadow-xs', className), children: [_jsxs("div", { className: "px-3.5 py-2 bg-muted border-b border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono", children: [_jsx("span", { className: "uppercase font-semibold tracking-wider", children: language }), _jsxs("button", { type: "button", onClick: handleCopy, className: "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer px-2 py-0.5 rounded-md hover:bg-accent text-[11px]", children: [copied ? _jsx(Check, { className: "h-3 w-3 text-emerald-400" }) : _jsx(Copy, { className: "h-3 w-3" }), _jsx("span", { children: copied ? 'Copied' : 'Copy' })] })] }), _jsxs("div", { style: { maxHeight }, className: "p-3 text-xs font-mono text-foreground overflow-x-auto overflow-y-auto leading-relaxed select-text flex", children: [showLineNumbers && (_jsx("div", { className: "pr-3 mr-3 border-r border-border/60 text-muted-foreground/40 select-none text-right shrink-0", children: lines.map((_, i) => (_jsx("div", { children: i + 1 }, i))) })), _jsx("pre", { className: "flex-1", children: _jsx("code", { children: code }) })] })] }));
};
