'use client';
import { lazy, Suspense, useSyncExternalStore, type ComponentProps } from 'react';

const GlbViewer = lazy(() => import('./GlbViewer').then((m) => ({ default: m.GlbViewer })));
const noop = () => () => {};

/**
 * The 3D viewer, loaded only in the browser: model-viewer registers a custom
 * element on window, so it must never load during a server render. Works in
 * any React host (no next/dynamic).
 */
export function LazyGlbViewer(props: ComponentProps<typeof GlbViewer>) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return null;
  return (
    <Suspense fallback={null}>
      <GlbViewer {...props} />
    </Suspense>
  );
}
