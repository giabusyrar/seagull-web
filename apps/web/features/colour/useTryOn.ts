'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { type ApiError, readApiError } from './types';

// Quick taps on several swatches become one request.
const DEBOUNCE_MS = 250;
// Rendered looks kept for this photo, so switching back is instant.
const CACHE_MAX = 40;

type GetEndpoint = (key: 'colour', path: string) => string;

function remember(store: Map<string, string>, key: string, u: string) {
  store.set(key, u);
  while (store.size > CACHE_MAX) {
    const oldest = store.keys().next().value as string;
    const ou = store.get(oldest);
    store.delete(oldest);
    if (ou) URL.revokeObjectURL(ou);
  }
}

/**
 * Photo try-on requests for one photo: debounced, stale responses dropped
 * (AbortController + request id), results cached per look (sorted shade ids)
 * and object URLs revoked when the photo changes or the view unmounts.
 */
export function useTryOn(file: File | null, getEndpoint: GetEndpoint) {
  const cache = useRef(new Map<string, string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const reqId = useRef(0);
  // State is tagged with the photo it belongs to, so a new photo never shows
  // the previous photo's (revoked) render.
  const [state, setState] = useState<{ file: File | null; url: string | null; loading: boolean; error: ApiError | null }>({
    file: null,
    url: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const store = cache.current;
    return () => {
      if (timer.current) clearTimeout(timer.current);
      inflight.current?.abort();
      reqId.current += 1;
      store.forEach((u) => URL.revokeObjectURL(u));
      store.clear();
    };
  }, [file]);

  const request = useCallback(
    (shadeIds: string[]) => {
      if (timer.current) clearTimeout(timer.current);
      inflight.current?.abort();
      const ids = [...shadeIds].filter(Boolean).sort();
      const key = ids.join(',');
      if (!file || ids.length === 0) {
        reqId.current += 1;
        setState({ file, url: null, loading: false, error: null });
        return;
      }
      const hit = cache.current.get(key);
      if (hit) {
        cache.current.delete(key); // most recently used goes last
        cache.current.set(key, hit);
        reqId.current += 1;
        setState({ file, url: hit, loading: false, error: null });
        return;
      }
      setState((s) => ({ file, url: s.file === file ? s.url : null, loading: true, error: null }));
      timer.current = setTimeout(async () => {
        const id = ++reqId.current;
        const ac = new AbortController();
        inflight.current = ac;
        try {
          const fd = new FormData();
          fd.append('image', file);
          ids.forEach((sid) => fd.append('shadeIds', sid));
          const res = await fetch(getEndpoint('colour', '/tryon'), { method: 'POST', body: fd, signal: ac.signal });
          if (!res.ok) throw await readApiError(res);
          const blob = await res.blob();
          if (id !== reqId.current) return;
          const u = URL.createObjectURL(blob);
          remember(cache.current, key, u);
          setState({ file, url: u, loading: false, error: null });
        } catch (e: unknown) {
          if (ac.signal.aborted || id !== reqId.current) return;
          const err = e as Partial<ApiError>;
          setState((s) => ({
            ...s,
            loading: false,
            error: { status: err.status ?? 0, code: err.code ?? '', message: err.message ?? String(e) },
          }));
        }
      }, DEBOUNCE_MS);
    },
    [file, getEndpoint],
  );

  const current = state.file === file;
  return {
    url: current ? state.url : null,
    loading: current && state.loading,
    error: current ? state.error : null,
    request,
  };
}
