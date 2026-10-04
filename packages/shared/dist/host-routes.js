'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
const HostRoutesContext = createContext(null);
export function HostRoutesProvider({ routes, children }) {
    return _jsx(HostRoutesContext.Provider, { value: routes, children: children });
}
/**
 * The host routes. Throws outside a HostRoutesProvider: a screen with no
 * routes cannot load anything, and an error says so where an empty screen
 * would not.
 */
export function useHostRoutes() {
    const routes = useContext(HostRoutesContext);
    if (!routes)
        throw new Error('This component needs a <HostRoutesProvider routes={...}> from the host app.');
    return routes;
}
