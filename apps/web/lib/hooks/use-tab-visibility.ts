import { createContext, useContext } from 'react';

/**
 * Whether the workbench tab a view lives in is the one on screen. Opened tabs
 * stay mounted while hidden (so their state survives a switch), which means
 * anything holding a device — a camera stream — must release it itself.
 * Defaults to true for views rendered outside the workbench's tabs.
 */
export const TabVisibilityContext = createContext(true);

export function useTabVisible(): boolean {
  return useContext(TabVisibilityContext);
}
