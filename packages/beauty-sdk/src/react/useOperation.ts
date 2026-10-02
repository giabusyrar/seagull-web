'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OperationState<T> {
  status: OperationStatus;
  data: T | null;
  error: unknown;
  run: () => Promise<void>;
  reset: () => void;
}

interface Stored<T> {
  key: string | null;
  status: OperationStatus;
  data: T | null;
  error: unknown;
}

const IDLE = { key: null, status: 'idle', data: null, error: null } as const;

/**
 * One call's lifecycle, the shape every SDK hook returns. A result belongs to
 * the input it was run for (`inputKey`, e.g. the photos' identity): once the
 * input changes it reads as idle. A new run aborts the previous one; aborts
 * from supersession or unmount are not errors.
 */
export function useOperation<T>(fn: (signal: AbortSignal) => Promise<T>, inputKey: string): OperationState<T> {
  const [state, setState] = useState<Stored<T>>(IDLE);
  const inflight = useRef<AbortController | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => inflight.current?.abort(), []);

  const run = useCallback(async () => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setState({ key: inputKey, status: 'loading', data: null, error: null });
    try {
      const data = await fnRef.current(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: 'success', data, error: null });
    } catch (error) {
      if (ctrl.signal.aborted) return;
      setState({ key: inputKey, status: 'error', data: null, error });
    } finally {
      if (inflight.current === ctrl) inflight.current = null;
    }
  }, [inputKey]);

  const reset = useCallback(() => {
    inflight.current?.abort();
    setState(IDLE);
  }, []);

  const current = state.key === inputKey ? state : IDLE;
  return { status: current.status, data: current.data, error: current.error, run, reset };
}
