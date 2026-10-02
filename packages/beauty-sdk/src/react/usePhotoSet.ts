'use client';

import { useCallback, useMemo, useState } from 'react';

export type PhotoView = 'front' | 'left' | 'right';
export type Photos = Partial<Record<PhotoView, File>>;

export interface PhotoSetState {
  photos: Photos;
  set(view: PhotoView, file: File | null): void;
  clear(): void;
  /** Identity of the set, for tying results to it (useOperation's inputKey). */
  key: string;
}

const VIEWS: PhotoView[] = ['front', 'left', 'right'];

// Files have no identity beyond the object; name, size and mtime tell a
// replaced photo from the same one.
export function photosKey(photos: Photos): string {
  return VIEWS.map((v) => {
    const f = photos[v];
    return f ? `${v}:${f.name}:${f.size}:${f.lastModified}` : `${v}:-`;
  }).join('|');
}

/** The photos one analysis runs on: a front photo and optional left/right
 *  three-quarter views. Kept in memory only. */
export function usePhotoSet(initial: Photos = {}): PhotoSetState {
  const [photos, setPhotos] = useState<Photos>(initial);
  const set = useCallback((view: PhotoView, file: File | null) => {
    setPhotos((p) => {
      const next = { ...p };
      if (file) next[view] = file;
      else delete next[view];
      return next;
    });
  }, []);
  const clear = useCallback(() => setPhotos({}), []);
  const key = useMemo(() => photosKey(photos), [photos]);
  return { photos, set, clear, key };
}
