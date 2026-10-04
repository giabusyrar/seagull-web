import React from 'react';
/**
 * Where the reference selects (BrandSelect, ApplicationSelect,
 * DimensionSelect) get their catalogs. Each loader resolves to the host's
 * raw response payload; the selects pick the list out of it with
 * extractReferenceList. The host app decides the routes, so this package
 * does not know them.
 */
export interface ReferenceDataSource {
    brands(): Promise<unknown>;
    applications(): Promise<unknown>;
    dimensions(): Promise<unknown>;
}
export declare function ReferenceDataProvider({ source, children }: {
    source: ReferenceDataSource;
    children: React.ReactNode;
}): React.JSX.Element;
/** The mounted source, or null outside a ReferenceDataProvider. */
export declare function useReferenceDataSource(): ReferenceDataSource | null;
/**
 * Shown by a select rendered outside a ReferenceDataProvider, which has no
 * catalog to load: says why the list is empty rather than looking like an
 * empty catalog.
 */
export declare const NO_REFERENCE_SOURCE_PLACEHOLDER = "No reference data source";
