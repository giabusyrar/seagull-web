'use client';
import { Component, useState, type ReactNode } from 'react';
import type { CallResult } from '@/lib/http';
import { ResponseView } from '@/components/ResponseView';

/** One analysis request's lifecycle. `error` is a client-side failure (no request was sent). */
export interface TabState { loading: boolean; result?: CallResult; error?: string }
export const IDLE: TabState = { loading: false };

const bodyText = (r: CallResult) => {
  const t = r.kind === 'json' ? JSON.stringify(r.json, null, 2) : r.text ?? '';
  return t.length > 3000 ? `${t.slice(0, 3000)}…` : t;
};

/** The failure exactly as the backend (or the network) gave it. */
export function ErrorBox({ result, children }: { result: CallResult; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">
      <div className="font-semibold">{result.status ? `HTTP ${result.status}` : 'Tidak ada respons'} <span className="font-normal text-red-700">{result.url}</span></div>
      {result.hint && <p className="text-amber-800">{result.hint}</p>}
      {result.networkError && <p>{result.networkError}</p>}
      {children}
      {bodyText(result) && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-white/70 p-2 font-mono text-[11px]">{bodyText(result)}</pre>}
    </div>
  );
}

/** One bad field in a response must not take the page down: the tab says so and the JSON stays reachable. */
class TabBoundary extends Component<{ children: ReactNode }, { failed: string | null }> {
  state = { failed: null as string | null };
  static getDerivedStateFromError(e: unknown) { return { failed: e instanceof Error ? e.message : String(e) }; }
  render() {
    if (this.state.failed) return <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Gagal menampilkan hasil — lihat JSON. <span className="text-amber-700">({this.state.failed})</span></p>;
    return this.props.children;
  }
}

export function TabShell({ state, children, errorExtra }: {
  state: TabState;
  children: (json: unknown) => ReactNode;
  errorExtra?: (result: CallResult) => ReactNode;
}) {
  const [showJson, setShowJson] = useState(false);
  const { loading, result, error } = state;
  if (loading) return <p className="animate-pulse py-6 text-sm text-zinc-500">Memuat…</p>;
  if (error) return <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">{error}</p>;
  if (!result) return <p className="py-6 text-sm text-zinc-500">Belum ada hasil.</p>;
  let body: ReactNode;
  if (!result.ok) body = <ErrorBox result={result}>{errorExtra?.(result)}</ErrorBox>;
  else if (result.kind !== 'json') body = <ErrorBox result={result}><p className="font-semibold">Respons bukan JSON ({result.kind}).</p></ErrorBox>;
  else body = <TabBoundary key={result.url + result.ms}>{children(result.json)}</TabBoundary>;
  return (
    <div className="flex flex-col gap-3">
      {body}
      <div>
        <button type="button" className="text-xs text-zinc-500 underline" onClick={() => setShowJson((v) => !v)}>
          {showJson ? 'sembunyikan JSON' : 'lihat JSON'} · {result.status || 'ERR'} · {result.ms} ms
        </button>
        {showJson && <ResponseView result={result} />}
      </div>
    </div>
  );
}

export const LABEL = 'text-[10px] font-semibold uppercase tracking-wider text-zinc-500';

export function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={LABEL}>{title}</div>
      {children}
    </div>
  );
}

export function Tile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2">
      <div className={LABEL}>{label}</div>
      <div className="text-sm font-semibold">{value === undefined || value === null || value === '' ? '—' : value}</div>
    </div>
  );
}

export const dash = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));
export const num = (v: unknown, digits = 1) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : '—');
export const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v.filter((x) => x !== null && x !== undefined) as T[]) : []);
export const entries = <T,>(v: unknown): [string, T][] =>
  v && typeof v === 'object' && !Array.isArray(v) ? (Object.entries(v).filter(([, x]) => x && typeof x === 'object') as [string, T][]) : [];
