'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
export const StatusSelect = ({ value, onChange, label = 'Lifecycle Status', placeholder = 'Select Status...', disabled = false, className = '', }) => {
    const [statuses, setStatuses] = useState([
        { code: 'ACTIVE', name: 'Active' },
        { code: 'DRAFT', name: 'Draft' },
        { code: 'INACTIVE', name: 'Inactive' },
        { code: 'ARCHIVED', name: 'Archived' },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        fetch('/api/statuses')
            .then((res) => res.json())
            .then((data) => {
            const list = extractReferenceList(data, 'statuses');
            if (list.length > 0) {
                setStatuses(list.map((s) => ({ code: s.code, name: s.name || s.code })));
            }
        })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);
    const options = useMemo(() => {
        return statuses.map((s) => {
            const isLive = s.code === 'ACTIVE' || s.code === 'PUBLISHED';
            return {
                value: s.code,
                label: `${s.name} (${s.code})`,
                description: isLive ? 'Production live and active in assessments' : `Lifecycle state: ${s.code}`,
            };
        });
    }, [statuses]);
    return (_jsxs("div", { className: `space-y-1 ${className}`, children: [label && (_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5", children: label })), _jsx(SearchableSelect, { options: options, value: value, onChange: onChange, disabled: disabled || isLoading, placeholder: isLoading ? 'Loading statuses...' : placeholder, searchPlaceholder: "Search statuses..." })] }));
};
