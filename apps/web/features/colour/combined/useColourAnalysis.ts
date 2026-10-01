'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readApiError, type AnalyzeResult, type ApiError } from '../types';

type GetEndpoint = (key: 'colour', path: string) => string;

interface State {
  file: File | null;
  result: AnalyzeResult | null;
  loading: boolean;
  error: ApiError | null;
}

const IDLE: State = { file: null, result: null, loading: false, error: null };

/**
 * One colour analysis for one photo: POST <colour collection>/analyze,
 * multipart "image", "hijab", "hairVisible". Tagged with the photo it was
 * made from, so a result never outlives it; a new run aborts the last.
 */
export function useColourAnalysis(file: File | null, getEndpoint: GetEndpoint) {
  const inflight = useRef<AbortController | null>(null);
  const [state, setState] = useState<State>(IDLE);

  useEffect(() => () => inflight.current?.abort(), []);

  const analyze = useCallback(
    async (hijab: boolean, hairVisible: boolean) => {
      if (!file) return;
      inflight.current?.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;
      setState({ file, result: null, loading: true, error: null });

      const fd = new FormData();
      fd.append('image', file);
      fd.append('hijab', String(hijab));
      fd.append('hairVisible', String(hairVisible));
      try {
        const res = await fetch(getEndpoint('colour', '/analyze'), { method: 'POST', body: fd, signal: ctrl.signal });
        if (!res.ok) {
          setState({ file, result: null, loading: false, error: await readApiError(res) });
          return;
        }
        setState({ file, result: (await res.json()) as AnalyzeResult, loading: false, error: null });
      } catch (e) {
        if (ctrl.signal.aborted) return; // superseded or unmounted
        setState({ file, result: null, loading: false, error: { status: 0, code: '', message: e instanceof Error ? e.message : String(e) } });
      } finally {
        if (inflight.current === ctrl) inflight.current = null;
      }
    },
    [file, getEndpoint],
  );

  const current = state.file === file ? state : IDLE;
  return { result: current.result, loading: current.loading, error: current.error, analyze };
}
