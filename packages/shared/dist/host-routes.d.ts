import React from 'react';
/**
 * The host app's own API routes that the studio package calls. The
 * packages do not know them; the host supplies them: HostRoutesProvider in
 * the browser, the pipeline's `routes` dependency on the server.
 *
 * The context lives in this package because the studio's entries are
 * bundled separately: a context created inside the studio would be a
 * different instance in each bundle, and a provider from one would not
 * reach a consumer in another. This package is external to all of them.
 *
 * Gateway data-plane paths (`/core/<engine>/*`) are not here: they are the
 * engines' API, reached through the collection resolver, not routes of the
 * host app.
 */
export interface HostRoutes {
    /** A reference-data collection, e.g. reference('brands'). */
    reference(resource: string): string;
    /** Skin conditions with their vision capabilities. */
    skinConditions: string;
    /** The gateway collections registry (the resolver adds `?type=core`). */
    collections: string;
}
export declare function HostRoutesProvider({ routes, children }: {
    routes: HostRoutes;
    children: React.ReactNode;
}): React.JSX.Element;
/**
 * The host routes. Throws outside a HostRoutesProvider: a screen with no
 * routes cannot load anything, and an error says so where an empty screen
 * would not.
 */
export declare function useHostRoutes(): HostRoutes;
