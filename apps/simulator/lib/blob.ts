'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Holds one blob URL; replacing or clearing it (or unmounting) revokes the old one. */
export function useBlobUrl(): [string | null, (u: string | null | undefined) => void] {
  const [url, setUrl] = useState<string | null>(null);
  const cur = useRef<string | null>(null);
  const set = useCallback((u: string | null | undefined) => {
    const next = u ?? null;
    if (cur.current && cur.current !== next) URL.revokeObjectURL(cur.current);
    cur.current = next;
    setUrl(next);
  }, []);
  useEffect(() => () => { if (cur.current) URL.revokeObjectURL(cur.current); cur.current = null; }, []);
  return [url, set];
}

/** Ref callback that shows a File in an <img>, revoking its object URL when the file changes or the img goes away. */
export function useFileSrc(file: File | null | undefined) {
  return useCallback((el: HTMLImageElement | null) => {
    if (!el || !file) return;
    const u = URL.createObjectURL(file);
    el.src = u;
    return () => URL.revokeObjectURL(u);
  }, [file]);
}
