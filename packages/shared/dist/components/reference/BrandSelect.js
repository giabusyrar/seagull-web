'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
import { NO_REFERENCE_SOURCE_PLACEHOLDER, useReferenceDataSource } from './ReferenceDataProvider';
export const BrandSelect = ({ value, onChange, includeUniversal = true, label = 'Brand Scope', placeholder = 'Select Brand...', disabled = false, className = '', }) => {
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const source = useReferenceDataSource();
    useEffect(() => {
        if (!source)
            return;
        setIsLoading(true);
        source
            .brands()
            .then((data) => {
            const list = extractReferenceList(data, 'brands');
            if (list.length > 0) {
                setBrands(list.map((b) => ({ code: b.code || b.id, name: b.name || b.code })));
            }
        })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [source]);
    const options = useMemo(() => {
        const list = [];
        if (includeUniversal) {
            list.push({ value: '*', label: '* (Universal / All Brands)', description: 'Universal fallback for all brand tenants' });
        }
        brands.forEach((b) => {
            list.push({
                value: b.code,
                label: `${b.name} (${b.code})`,
                description: `Brand tenant: ${b.code}`,
            });
        });
        return list;
    }, [brands, includeUniversal]);
    return (_jsxs("div", { className: `space-y-1 ${className}`, children: [label && (_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5", children: label })), _jsx(SearchableSelect, { options: options, value: value, onChange: onChange, disabled: disabled || isLoading, placeholder: !source ? NO_REFERENCE_SOURCE_PLACEHOLDER : isLoading ? 'Loading brands...' : placeholder, searchPlaceholder: "Search brands..." })] }));
};
