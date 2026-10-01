'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Model assets are the shared model files a worker fetches at start —
 * FaceLandmarker is the one in use today — as opposed to the capability models
 * in the registry panel, which score an analysis. They live in worker-models
 * (seagull-core docs/MODEL-REGISTRY.md) and are reached through the gateway;
 * /api/vision-worker/* is the dashboard path, and proxy-handler attaches the
 * data-plane key server-side, so nothing here handles a key.
 */
const BASE = '/api/vision-worker/assets';

export interface ModelAsset {
  id: string;
  name: string;
  s3_key: string;
  original_filename: string;
  size_bytes: number;
  /** Of the file itself: the only way to tell two versions apart by content. */
  sha256: string;
  label?: string | null;
  uploaded_at: string;
  active: boolean;
}

export interface AssetHistoryEntry {
  asset_id?: string;
  action?: string;
  at?: string;
  [key: string]: unknown;
}

export interface AssetGroup {
  name: string;
  versions: ModelAsset[];
  /** The version a worker gets today, or null when none is active. */
  activeId: string | null;
}

async function send(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // The worker explains itself ("… is not a version of face_landmarker").
    // Repeating that is more use than a generic failure.
    const detail = (data as { detail?: unknown } | null)?.detail;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (HTTP ${res.status}).`);
  }
  return data;
}

export const assetRequests = {
  list: () => send(BASE) as Promise<{ assets?: ModelAsset[] }>,

  upload: (name: string, file: File, opts: { label?: string; activate?: boolean }) => {
    const body = new FormData();
    body.append('file', file);
    if (opts.label) body.append('label', opts.label);
    // Sent only when asked: the worker treats an empty value as "do not activate",
    // but saying nothing is clearer than saying nothing-shaped-as-something.
    if (opts.activate) body.append('activate', 'true');
    return send(`${BASE}/${encodeURIComponent(name)}`, { method: 'POST', body });
  },

  activate: (name: string, assetId: string) =>
    send(`${BASE}/${encodeURIComponent(name)}/active`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId }),
    }),

  deactivate: (name: string) =>
    send(`${BASE}/${encodeURIComponent(name)}/active`, { method: 'DELETE' }),

  history: (name: string) =>
    send(`${BASE}/${encodeURIComponent(name)}/history`) as Promise<{ history?: AssetHistoryEntry[] }>,
};

/** One row per asset name, its versions newest first. */
export function groupByName(assets: ModelAsset[]): AssetGroup[] {
  const byName = new Map<string, ModelAsset[]>();
  for (const a of assets) {
    const list = byName.get(a.name);
    if (list) list.push(a);
    else byName.set(a.name, [a]);
  }
  return [...byName.entries()].map(([name, versions]) => {
    const sorted = [...versions].sort((x, y) => (x.uploaded_at < y.uploaded_at ? 1 : -1));
    return {
      name,
      versions: sorted,
      activeId: sorted.find((v) => v.active)?.id ?? null,
    };
  });
}

export function useModelAssets() {
  const [groups, setGroups] = useState<AssetGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared by the first load and the Refresh button. `announce` is false on
  // mount: isLoading already starts true, and setting it again from inside an
  // effect would be a synchronous state write during render.
  const load = useCallback(async (announce: boolean) => {
    if (announce) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const data = await assetRequests.list();
      setGroups(groupByName(Array.isArray(data?.assets) ? data.assets : []));
      setError(null);
    } catch (err) {
      setGroups([]);
      setError(err instanceof Error ? err.message : 'Could not read the asset registry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  // The first load subscribes to an external system and writes state from the
  // callback, which is the shape React asks for — calling load() here would
  // put a state write in the effect body itself.
  useEffect(() => {
    let cancelled = false;
    assetRequests
      .list()
      .then((data) => {
        if (!cancelled) setGroups(groupByName(Array.isArray(data?.assets) ? data.assets : []));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not read the asset registry.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<{ ok: boolean; error?: string }> => {
      try {
        await action();
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Failed.' };
      }
    },
    [refresh],
  );

  return {
    groups,
    isLoading,
    error,
    refresh,
    upload: (name: string, file: File, opts: { label?: string; activate?: boolean }) =>
      run(() => assetRequests.upload(name, file, opts)),
    activate: (name: string, assetId: string) => run(() => assetRequests.activate(name, assetId)),
    deactivate: (name: string) => run(() => assetRequests.deactivate(name)),
    history: (name: string) => assetRequests.history(name),
  };
}
