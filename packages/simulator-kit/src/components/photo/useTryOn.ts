'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { call, type CallResult } from '@/lib/http';
import { tryOn } from '@/lib/photo';
import { useBlobUrl } from '@/lib/blob';

const DEBOUNCE_MS = 250;

export const resultMessage = (r: CallResult) => {
  const body = r.kind === 'json' ? JSON.stringify(r.json) : r.text ?? '';
  return [`HTTP ${r.status || 'ERR'}`, r.networkError, r.hint, body.slice(0, 500)].filter(Boolean).join(' · ');
};

/**
 * Try-on renders for one photo: debounced, the in-flight request is aborted
 * by a newer pick, and a stale answer is dropped (its blob URL revoked).
 */
export function useTryOn(photo: File | null) {
  const [url, setUrl] = useBlobUrl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    inflight.current?.abort();
    inflight.current = null;
    return ++reqId.current;
  }, []);

  useEffect(() => () => { cancel(); }, [cancel]);

  const reset = useCallback(() => {
    cancel();
    setUrl(null); setLoading(false); setError(undefined);
  }, [cancel, setUrl]);

  const request = useCallback((shadeIds: string[]) => {
    const id = cancel();
    const ids = shadeIds.filter(Boolean);
    setError(undefined);
    if (!photo || ids.length === 0) { setUrl(null); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const ac = new AbortController();
      inflight.current = ac;
      const req = tryOn(photo, ids);
      const r = await call({ url: req.url, init: { ...req.init, signal: ac.signal } });
      if (id !== reqId.current) { if (r.blobUrl) URL.revokeObjectURL(r.blobUrl); return; }
      inflight.current = null;
      setLoading(false);
      if (r.ok && r.kind === 'image' && r.blobUrl) setUrl(r.blobUrl);
      else { if (r.blobUrl) URL.revokeObjectURL(r.blobUrl); setError(resultMessage(r)); }
    }, DEBOUNCE_MS);
  }, [photo, cancel, setUrl]);

  return { url, loading, error, request, reset };
}
