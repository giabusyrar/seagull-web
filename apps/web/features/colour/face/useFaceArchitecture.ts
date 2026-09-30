'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readFaceApiError, type FaceApiError, type FaceArchitectureResult } from './faceTypes';

type GetEndpoint = (key: 'vision', path: string) => string;

// core-engine's own face-measure timeout is 20s (seagull-core). Allowing a
// little more lets its error body arrive instead of being cut off here.
const CLIENT_TIMEOUT_MS = 25_000;

interface State {
  file: File | null;
  result: FaceArchitectureResult | null;
  loading: boolean;
  error: FaceApiError | null;
}

const IDLE: State = { file: null, result: null, loading: false, error: null };

/**
 * One face-architecture analysis for one photo:
 * POST <vision collection>/face-architecture/:brandId/:applicationId,
 * multipart field "image".
 *
 * State is tagged with the photo it belongs to, so a result never outlives
 * the photo that produced it. A second run aborts the first.
 */
export function useFaceArchitecture(file: File | null, getEndpoint: GetEndpoint) {
  const inflight = useRef<AbortController | null>(null);
  const [state, setState] = useState<State>(IDLE);

  useEffect(() => () => inflight.current?.abort(), []);

  // A new photo invalidates whatever was on screen. Nothing is reset on the
  // way in: every value below is read through the photo it was tagged with,
  // so a stale result is simply not returned.

  const analyze = useCallback(
    async (brandId: string, applicationId: string) => {
      if (!file || !brandId || !applicationId) return;

      inflight.current?.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;
      const timer = setTimeout(() => ctrl.abort(), CLIENT_TIMEOUT_MS);
      setState({ file, result: null, loading: true, error: null });

      const body = new FormData();
      body.append('image', file, file.name);

      try {
        const path = `/face-architecture/${encodeURIComponent(brandId)}/${encodeURIComponent(applicationId)}`;
        const res = await fetch(getEndpoint('vision', path), { method: 'POST', body, signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          setState({ file, result: null, loading: false, error: await readFaceApiError(res) });
          return;
        }
        setState({ file, result: (await res.json()) as FaceArchitectureResult, loading: false, error: null });
      } catch (err) {
        if (ctrl.signal.aborted && inflight.current !== ctrl) return; // superseded by a newer run
        const timedOut = ctrl.signal.aborted;
        setState({
          file,
          result: null,
          loading: false,
          error: {
            status: timedOut ? 504 : 0,
            code: timedOut ? 'timeout' : '',
            message: timedOut ? '' : err instanceof Error ? err.message : String(err),
            entries: [],
          },
        });
      } finally {
        clearTimeout(timer);
        if (inflight.current === ctrl) inflight.current = null;
      }
    },
    [file, getEndpoint],
  );

  const reset = useCallback(() => {
    inflight.current?.abort();
    setState(IDLE);
  }, []);

  return {
    result: state.file === file ? state.result : null,
    error: state.file === file ? state.error : null,
    loading: state.loading && state.file === file,
    analyze,
    reset,
  };
}
