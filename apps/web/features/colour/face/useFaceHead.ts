'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readFaceApiError, type FaceApiError } from './faceTypes';
import type { HeadViewName } from './headTypes';

type GetEndpoint = (key: 'vision', path: string) => string;

// core-engine's own head timeout defaults to 30s (seagull-core
// DefaultFaceHeadTimeout). A little more lets its error body arrive instead
// of being cut off here.
const CLIENT_TIMEOUT_MS = 35_000;

interface State {
  key: string | null;
  glb: ArrayBuffer | null;
  loading: boolean;
  error: FaceApiError | null;
}

const IDLE: State = { key: null, glb: null, loading: false, error: null };

/**
 * One 3D head for one set of photos:
 * POST <vision collection>/face-architecture/:brandId/:applicationId/head,
 * multipart "front" plus optional "left" / "right", answered with a GLB.
 *
 * Called only when the 3D view is asked for. State is tagged with the photos
 * it was made from, so a head never outlives them; a new run aborts the last.
 */
export function useFaceHead(views: Partial<Record<HeadViewName, File>>, getEndpoint: GetEndpoint) {
  const inflight = useRef<AbortController | null>(null);
  const [state, setState] = useState<State>(IDLE);
  const key = viewsKey(views);

  useEffect(() => () => inflight.current?.abort(), []);

  const build = useCallback(
    async (brandId: string, applicationId: string) => {
      if (!views.front) return;
      inflight.current?.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        ctrl.abort();
      }, CLIENT_TIMEOUT_MS);
      setState({ key, glb: null, loading: true, error: null });

      const body = new FormData();
      for (const [name, file] of Object.entries(views)) if (file) body.append(name, file, file.name);

      try {
        const path = `/face-architecture/${encodeURIComponent(brandId)}/${encodeURIComponent(applicationId)}/head`;
        const res = await fetch(getEndpoint('vision', path), { method: 'POST', body, signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          setState({ key, glb: null, loading: false, error: await readFaceApiError(res) });
          return;
        }
        setState({ key, glb: await res.arrayBuffer(), loading: false, error: null });
      } catch (err) {
        // Aborted by a newer run or by unmounting: nothing to report.
        if (ctrl.signal.aborted && !timedOut) return;
        setState({
          key,
          glb: null,
          loading: false,
          error: {
            status: timedOut ? 504 : 0,
            code: timedOut ? 'face_head_timeout' : '',
            message: timedOut ? '' : err instanceof Error ? err.message : String(err),
            entries: [],
          },
        });
      } finally {
        clearTimeout(timer);
        if (inflight.current === ctrl) inflight.current = null;
      }
    },
    [views, key, getEndpoint],
  );

  const current = state.key === key ? state : IDLE;
  return { glb: current.glb, loading: current.loading, error: current.error, build };
}

// Files have no identity beyond the object; name, size and mtime tell a
// replaced photo from the same one.
function viewsKey(views: Partial<Record<HeadViewName, File>>): string {
  return (['front', 'left', 'right'] as const)
    .map((v) => (views[v] ? `${v}:${views[v]!.name}:${views[v]!.size}:${views[v]!.lastModified}` : `${v}:-`))
    .join('|');
}
