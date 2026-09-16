'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
export const DimensionSelect = ({ value, onChange, label = 'Target Dimension', placeholder = 'Select Dimension...', disabled = false, className = '', }) => {
    const [dimensions, setDimensions] = useState([
        { code: 'sebum', name: 'Sebum Secretion' },
        { code: 'sensitivity', name: 'Epidermal Reactivity' },
        { code: 'pigmentation', name: 'Melanogenesis & Spots' },
        { code: 'aging', name: 'Elasticity & Wrinkles' },
        { code: 'barrier', name: 'Moisture Barrier' },
        { code: 'hydration', name: 'Skin Hydration' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        fetch('/api/dimensions')
            .then((res) => res.json())
            .then((data) => {
            const list = extractReferenceList(data, 'dimensions');
            if (list.length > 0) {
                setDimensions(list.map((d) => ({ code: d.code, name: d.name || d.code, category: d.category })));
            }
        })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);
    const options = useMemo(() => {
        return dimensions.map((d) => ({
            value: d.code,
            label: `${d.name} (${d.code})`,
            description: d.category || `Dimension key: ${d.code}`,
        }));
    }, [dimensions]);
    const handleChange = (dimKey) => {
        const matched = dimensions.find((d) => d.code === dimKey);
        onChange(dimKey, matched);
    };
    return (_jsxs("div", { className: `space-y-1 ${className}`, children: [label && (_jsx("label", { className: "block text-xs font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1", children: label })), _jsx(SearchableSelect, { options: options, value: value, onChange: handleChange, disabled: disabled || isLoading, placeholder: isLoading ? 'Loading dimensions...' : placeholder, searchPlaceholder: "Search dimensions..." })] }));
};
