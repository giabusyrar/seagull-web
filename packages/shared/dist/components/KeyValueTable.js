'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';
export const KeyValueTable = ({ items, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value', descriptionPlaceholder = 'Description', showDescription = false, readOnly = false, title, className = '', }) => {
    const handleToggle = (index) => {
        if (readOnly)
            return;
        const next = [...items];
        next[index] = Object.assign(Object.assign({}, next[index]), { enabled: !next[index].enabled });
        onChange(next);
    };
    const handleUpdate = (index, field, val) => {
        if (readOnly)
            return;
        const next = [...items];
        next[index] = Object.assign(Object.assign({}, next[index]), { [field]: val });
        onChange(next);
    };
    const handleAdd = () => {
        if (readOnly)
            return;
        onChange([
            ...items,
            { id: Date.now().toString(), key: '', value: '', description: '', enabled: true },
        ]);
    };
    const handleDelete = (index) => {
        if (readOnly)
            return;
        onChange(items.filter((_, i) => i !== index));
    };
    return (_jsxs("div", { className: cn('space-y-2', className), children: [title && (_jsxs("div", { className: "flex justify-between items-center text-xs font-bold text-muted-foreground", children: [_jsx("span", { children: title }), !readOnly && (_jsxs("button", { type: "button", onClick: handleAdd, className: "text-xs text-primary hover:underline flex items-center gap-1 font-semibold transition cursor-pointer", children: [_jsx(Plus, { className: "h-3 w-3" }), " Add Item"] }))] })), _jsx("div", { className: "border border-border rounded-xl bg-card overflow-hidden shadow-xs", children: items.length === 0 ? (_jsxs("div", { className: "p-4 text-center text-xs text-muted-foreground italic flex flex-col items-center justify-center gap-2", children: [_jsx("span", { children: "No parameters defined." }), !readOnly && (_jsx(Button, { variant: "outline", size: "xs", onClick: handleAdd, leftIcon: _jsx(Plus, { className: "h-3 w-3" }), children: "Add Row" }))] })) : (_jsx("div", { className: "overflow-x-auto w-full", children: _jsxs("table", { className: "w-full text-xs text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted/80 text-muted-foreground font-bold text-[10px] uppercase tracking-wider border-b border-border select-none", children: [_jsx("th", { className: "px-3 py-2 w-8 text-center" }), _jsx("th", { className: "px-3 py-2 w-1/3", children: "Key" }), _jsx("th", { className: "px-3 py-2 w-1/3", children: "Value" }), showDescription && _jsx("th", { className: "px-3 py-2", children: "Description" }), !readOnly && _jsx("th", { className: "px-3 py-2 w-10 text-center" })] }) }), _jsx("tbody", { className: "divide-y divide-border/60", children: items.map((item, idx) => (_jsxs("tr", { className: cn('hover:bg-accent/40 transition-colors', !item.enabled ? 'opacity-50 bg-muted/20' : ''), children: [_jsx("td", { className: "px-2 py-1 text-center align-middle", children: _jsx("button", { type: "button", onClick: () => handleToggle(idx), disabled: readOnly, className: "text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center justify-center", children: item.enabled ? (_jsx(CheckSquare, { className: "h-3.5 w-3.5 text-primary" })) : (_jsx(Square, { className: "h-3.5 w-3.5" })) }) }), _jsx("td", { className: "p-1 px-3", children: _jsx("input", { type: "text", value: item.key, readOnly: readOnly, onChange: (e) => handleUpdate(idx, 'key', e.target.value), placeholder: keyPlaceholder, className: "w-full bg-transparent outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/50" }) }), _jsx("td", { className: "p-1 px-3", children: _jsx("input", { type: "text", value: item.value, readOnly: readOnly, onChange: (e) => handleUpdate(idx, 'value', e.target.value), placeholder: valuePlaceholder, className: "w-full bg-transparent outline-none font-mono text-xs text-foreground placeholder:text-muted-foreground/50" }) }), showDescription && (_jsx("td", { className: "p-1 px-3", children: _jsx("input", { type: "text", value: item.description || '', readOnly: readOnly, onChange: (e) => handleUpdate(idx, 'description', e.target.value), placeholder: descriptionPlaceholder, className: "w-full bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/50" }) })), !readOnly && (_jsx("td", { className: "p-1 text-center align-middle", children: _jsx("button", { type: "button", onClick: () => handleDelete(idx), className: "p-1 text-muted-foreground hover:text-destructive transition cursor-pointer rounded-md hover:bg-accent", title: "Delete row", children: _jsx(Trash2, { className: "h-3.5 w-3.5" }) }) }))] }, item.id || idx))) })] }) })) })] }));
};
