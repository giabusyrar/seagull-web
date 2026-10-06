'use client';
import { createContext, useContext } from 'react';

/**
 * How the host shows the simulator. `standalone` is the simulator app: its
 * own header and a centred page. `embedded` is a page inside another app (the
 * dashboard's Simulator Studio): the host already has a header, so the
 * simulator drops its mark and uses the host's full width.
 */
export type SimulatorLayout = 'standalone' | 'embedded';

const LayoutContext = createContext<SimulatorLayout>('standalone');
export const LayoutProvider = LayoutContext.Provider;
export const useLayout = () => useContext(LayoutContext);
