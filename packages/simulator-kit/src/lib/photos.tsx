'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadBlob, saveBlob } from '@gateway-experience/shared';

/**
 * The captured photos, shared by every input mode: a photo taken once feeds
 * Foto, Form and Percakapan. They survive a reload in this browser's
 * IndexedDB (photos are too large for localStorage); nothing leaves the
 * browser by being saved.
 */
interface Photos {
  front: File | null;
  left: File | null;
  right: File | null;
  /** False until the saved photos have been read back after a reload. */
  restored: boolean;
  setFront(f: File | null): void;
  setLeft(f: File | null): void;
  setRight(f: File | null): void;
}

type Slot = 'front' | 'left' | 'right';
const KEY: Record<Slot, string> = { front: 'sim.photo.front', left: 'sim.photo.left', right: 'sim.photo.right' };

const PhotosCtx = createContext<Photos | null>(null);

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Record<Slot, File | null>>({ front: null, left: null, right: null });
  const [restored, setRestored] = useState(false);
  // A photo picked before the restore finishes wins over the saved one.
  const touched = useRef<Set<Slot>>(new Set());

  useEffect(() => {
    let alive = true;
    Promise.all((Object.keys(KEY) as Slot[]).map(async (s) => [s, await loadBlob<File>(KEY[s])] as const)).then((saved) => {
      if (!alive) return;
      setPhotos((cur) => {
        const next = { ...cur };
        for (const [s, f] of saved) if (!touched.current.has(s)) next[s] = f;
        return next;
      });
      setRestored(true);
    });
    return () => { alive = false; };
  }, []);

  const update = useCallback((slot: Slot, f: File | null) => {
    touched.current.add(slot);
    setPhotos((cur) => ({ ...cur, [slot]: f }));
    void saveBlob(KEY[slot], f);
  }, []);
  const setters = useMemo(() => ({
    setFront: (f: File | null) => update('front', f),
    setLeft: (f: File | null) => update('left', f),
    setRight: (f: File | null) => update('right', f),
  }), [update]);

  return (
    <PhotosCtx.Provider value={{ ...photos, restored, ...setters }}>
      {children}
    </PhotosCtx.Provider>
  );
}

export function usePhotos(): Photos {
  const p = useContext(PhotosCtx);
  if (!p) throw new Error('usePhotos needs a <PhotosProvider>.');
  return p;
}
