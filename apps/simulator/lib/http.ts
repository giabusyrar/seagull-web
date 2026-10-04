import type { BuiltRequest } from './photo';

export type BodyKindOut = 'json' | 'image' | 'glb' | 'text' | 'empty';
export interface CallResult { ok: boolean; status: number; ms: number; url: string; headers: [string, string][]; kind: BodyKindOut; json?: unknown; text?: string; blobUrl?: string; size?: number; networkError?: string; hint?: string }

export function classify(ct: string | null): BodyKindOut {
  const t = (ct ?? '').toLowerCase();
  if (t.includes('json')) return 'json';
  if (t.startsWith('image/')) return 'image';
  if (t.includes('gltf') || t.includes('glb') || t.includes('octet-stream')) return 'glb';
  return 'text';
}

const blobUrl = (b: Blob) => (typeof URL.createObjectURL === 'function' ? URL.createObjectURL(b) : undefined);

export async function call(req: BuiltRequest, fetchImpl: typeof fetch = fetch): Promise<CallResult> {
  const t0 = performance.now();
  let r: Response;
  try {
    r = await fetchImpl(req.url, req.init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, ms: Math.round(performance.now() - t0), url: req.url, headers: [], kind: 'empty', networkError: `service at ${req.url} unreachable: ${msg}` };
  }
  return readResponse(r, req.url, t0);
}

// Next's dev proxy answers a down backend with a plain-text 500, so fetch never rejects; recognise it by shape (no content-type is sent in practice).
const PROXY_DOWN_HINT = (url: string) => `service at ${url} looks unreachable (dev proxy could not connect; see the Next terminal for "Failed to proxy")`;

function hintFor(url: string, status: number, ct: string | null, text?: string): string | undefined {
  if (url.startsWith('/svc/') && status === 500 && /^(text\/plain|$)/.test((ct ?? '').toLowerCase()) && text?.trim() === 'Internal Server Error') return PROXY_DOWN_HINT(url);
  return undefined;
}

export async function readResponse(r: Response, url: string, t0: number): Promise<CallResult> {
  const base = { ok: r.ok, status: r.status, url, headers: [...r.headers.entries()] as [string, string][] };
  const ct = r.headers.get('content-type');
  const kind = r.status === 204 ? 'empty' : classify(ct);
  if (kind === 'empty') return { ...base, ms: Math.round(performance.now() - t0), kind };
  try {
    if (kind === 'image' || kind === 'glb') {
      const b = await r.blob();
      return { ...base, ms: Math.round(performance.now() - t0), kind, blobUrl: blobUrl(b), size: b.size };
    }
    const text = await r.text();
    const ms = Math.round(performance.now() - t0);
    if (kind === 'json') {
      try { const json = JSON.parse(text); return { ...base, ms, kind, json, hint: hintFor(url, r.status, ct, text) }; } catch { return { ...base, ms, kind: 'text', text }; }
    }
    return { ...base, ms, kind, text, hint: hintFor(url, r.status, ct, text) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const ms = Math.round(performance.now() - t0);
    return { ok: false, status: r.status, ms, url, headers: [...r.headers.entries()] as [string, string][], kind: 'empty', networkError: `service at ${url} unreachable: ${msg}` };
  }
}
