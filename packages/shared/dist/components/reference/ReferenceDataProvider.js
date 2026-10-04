'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const ReferenceDataContext = createContext(null);
export function ReferenceDataProvider({ source, children }) {
    return _jsx(ReferenceDataContext.Provider, { value: source, children: children });
}
/** The mounted source, or null outside a ReferenceDataProvider. */
export function useReferenceDataSource() {
    return useContext(ReferenceDataContext);
}
/**
 * Shown by a select rendered outside a ReferenceDataProvider, which has no
 * catalog to load: says why the list is empty rather than looking like an
 * empty catalog.
 */
export const NO_REFERENCE_SOURCE_PLACEHOLDER = 'No reference data source';
