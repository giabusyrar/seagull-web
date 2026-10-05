'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { SearchableSelect } from '../SearchableSelect';
/** A ruleset's lifecycle states, fixed by the engine (it scores only ACTIVE); defined once. */
export const LIFECYCLE_STATUSES = [
    { code: 'ACTIVE', name: 'Active' },
    { code: 'DRAFT', name: 'Draft' },
    { code: 'INACTIVE', name: 'Inactive' },
    { code: 'ARCHIVED', name: 'Archived' },
];
export const StatusSelect = ({ value, onChange, label = 'Lifecycle Status', placeholder = 'Select Status...', disabled = false, className = '', }) => {
    // A lifecycle state is not reference data: core-engine scores a ruleset only
    // when its status is ACTIVE (score/entity/ruleset.go), so the set is fixed by
    // the engine, not by a brand. reference-service dropped its statuses entity
    // on 2026-10-01 — the list below is the whole truth, and it used to be
    // silently overwritten by whatever that endpoint happened to return.
    const statuses = LIFECYCLE_STATUSES;
    const options = useMemo(() => {
        return statuses.map((s) => {
            const isLive = s.code === 'ACTIVE' || s.code === 'PUBLISHED';
            return {
                value: s.code,
                label: `${s.name} (${s.code})`,
                description: isLive ? 'Production live and active in assessments' : `Lifecycle state: ${s.code}`,
            };
        });
    }, []);
    return (_jsxs("div", { className: `space-y-1 ${className}`, children: [label && (_jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5", children: label })), _jsx(SearchableSelect, { options: options, value: value, onChange: onChange, disabled: disabled, placeholder: placeholder, searchPlaceholder: "Search statuses..." })] }));
};
