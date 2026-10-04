'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
import { extractReferenceList } from './extractReferenceList';
import { NO_REFERENCE_SOURCE_PLACEHOLDER, useReferenceDataSource } from './ReferenceDataProvider';
export const ApplicationSelect = ({ value, onChange, includeUniversal = true, label = 'Application Scope', placeholder = 'Select Application...', disabled = false, className = '', }) => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const source = useReferenceDataSource();
    useEffect(() => {
        if (!source)
            return;
        setIsLoading(true);
        source
            .applications()
            .then((data) => {
            const list = extractReferenceList(data, 'applications');
            if (list.length > 0) {
                setApplications(list.map((a) => ({ key: a.key || a.code || a.id, name: a.name || a.key })));
            }
        })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [source]);
    const options = useMemo(() => {
        const list = [];
        if (includeUniversal) {
            list.push({ value: '*', label: '* (Universal / All Applications)', description: 'Universal fallback for all client applications' });
        }
        applications.forEach((a) => {
            list.push({
                value: a.key,
                label: `${a.name} (${a.key})`,
                description: `Application key: ${a.key}`,
            });
        });
        return list;
    }, [applications, includeUniversal]);
    return (_jsxs("div", { className: `space-y-1 ${className}`, children: [label && (_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5", children: label })), _jsx(SearchableSelect, { options: options, value: value, onChange: onChange, disabled: disabled || isLoading, placeholder: !source ? NO_REFERENCE_SOURCE_PLACEHOLDER : isLoading ? 'Loading applications...' : placeholder, searchPlaceholder: "Search applications..." })] }));
};
