import type { BuiltRequest } from './endpoint';

export type BodyKindOut = 'json' | 'image' | 'glb' | 'text' | 'empty';
export interface CallResult { ok: boolean; status: number; ms: number; url: string; headers: [string, string][]; kind: BodyKindOut; json?: unknown; text?: string; blobUrl?: string; size?: number; networkError?: string }

export function classify(ct: string | null): BodyKindOut {
  const t = (ct ?? '').toLowerCase();
  if (t.includes('json')) return 'json';
  if (t.startsWith('image/')) return 'image';
  if (t.includes('gltf') || t.includes('glb')) return 'glb';
  return 'text';
}

const blobUrl = (b: Blob) => (typeof URL.createObjectURL === 'function' ? URL.createObjectURL(b) : undefined);

export async function call(req: BuiltRequest, fetchImpl: typeof fetch = fetch): Promise<CallResult> {
  const t0 = performance.now();
  let r: Response;
  try {
    r = await fetchImpl(req.url, req.init);
  } catch (e) {
    return { ok: false, status: 0, ms: Math.round(performance.now() - t0), url: req.url, headers: [], kind: 'empty', networkError: `service at ${req.url} unreachable: ${(e as Error).message}` };
  }
  const base = { ok: r.ok, status: r.status, url: req.url, headers: [...r.headers.entries()] as [string, string][] };
  const kind = r.status === 204 ? 'empty' : classify(r.headers.get('content-type'));
  if (kind === 'empty') return { ...base, ms: Math.round(performance.now() - t0), kind };
  if (kind === 'image' || kind === 'glb') {
    const b = await r.blob();
    return { ...base, ms: Math.round(performance.now() - t0), kind, blobUrl: blobUrl(b), size: b.size };
  }
  const text = await r.text();
  const ms = Math.round(performance.now() - t0);
  if (kind === 'json') {
    try { return { ...base, ms, kind, json: JSON.parse(text) }; } catch { return { ...base, ms, kind: 'text', text }; }
  }
  return { ...base, ms, kind, text };
}
