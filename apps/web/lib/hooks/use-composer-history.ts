import { useEffect, useState } from 'react';

export interface HistoryEntryBase {
  id: string;
  timestamp: number;
}

/**
 * Shared request-history persistence for composer pages (modules, LLM
 * routes). Extracted after both pages independently grew ~80 lines of
 * near-identical history logic — a prior review flagged the duplication
 * as a maintainability risk, since any future fix (like the quota
 * handling below) would otherwise need to land in two places.
 *
 * localStorage.setItem is guarded: browser storage quotas are commonly
 * 5-10MB per origin, and a handful of history entries carrying file/image
 * base64 payloads can exceed that. On quota failure we drop the oldest
 * entries and retry once rather than losing the write (and the in-memory
 * state) silently.
 */
export function useComposerHistory<T extends HistoryEntryBase>(historyKey: string, maxEntries = 50) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      // Initial load from localStorage on mount/key change — synchronizing
      // with external storage is the intended purpose of this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error(`Failed to load history for "${historyKey}"`, e);
    }
  }, [historyKey]);

  const persist = (next: T[]) => {
    let toStore = next;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        localStorage.setItem(historyKey, JSON.stringify(toStore));
        return toStore;
      } catch (e) {
        if (toStore.length <= 1) {
          console.error(`Failed to persist history for "${historyKey}" even at minimum size`, e);
          return toStore;
        }
        // Quota likely exceeded — drop the oldest half and retry.
        toStore = toStore.slice(0, Math.ceil(toStore.length / 2));
      }
    }
    return toStore;
  };

  const addItem = (item: T) => {
    setItems((prev) => {
      const next = [item, ...prev].slice(0, maxEntries);
      return persist(next);
    });
  };

  const clear = () => {
    setItems([]);
    try {
      localStorage.removeItem(historyKey);
    } catch (e) {
      console.error(`Failed to clear history for "${historyKey}"`, e);
    }
  };

  return { items, addItem, clear };
}

/**
 * Debounced draft autosave, paired with a synchronous loader for initial
 * mount. `enabled` should be false until the page's underlying resource
 * has loaded, so a draft isn't written from default/placeholder state
 * before the real one is fetched.
 */
export function useDraftAutosave<T>(storageKey: string, draft: T, enabled: boolean, delayMs = 500) {
  const serialized = JSON.stringify(draft);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, serialized);
      } catch (e) {
        console.error(`Failed to persist draft for "${storageKey}" (storage quota likely exceeded)`, e);
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [storageKey, serialized, enabled, delayMs]);
}

export function loadDraft<T extends Record<string, unknown>>(storageKey: string): Partial<T> | null {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error(`Failed to load draft for "${storageKey}"`, e);
    return null;
  }
}
