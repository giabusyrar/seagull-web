'use client';
import { severityToneOf, type SeverityTone } from '@gateway-experience/shared';
import { Component, useState, type ReactNode } from 'react';
import type { CallResult } from '../../lib/http';
import { ResponseView } from '../ResponseView';
import { btnGhost, card, eyebrow } from '../ui';
import { useLang } from '../../lib/i18n';

/** One analysis request's lifecycle. `error` is a client-side failure (no request was sent). */
export interface TabState { loading: boolean; result?: CallResult; error?: string }
export const IDLE: TabState = { loading: false };

const bodyText = (r: CallResult) => {
  const t = r.kind === 'json' ? JSON.stringify(r.json, null, 2) : r.text ?? '';
  return t.length > 3000 ? `${t.slice(0, 3000)}…` : t;
};

/** The failure exactly as the backend (or the network) gave it. */
export function ErrorBox({ result, children }: { result: CallResult; children?: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-900">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">{result.status ? `HTTP ${result.status}` : t('No response', 'Tidak ada respons')}</span>
        <span className="break-all font-mono text-[11px] text-red-700">{result.url}</span>
      </div>
      {result.hint && <p className="text-amber-800">{result.hint}</p>}
      {result.networkError && <p>{result.networkError}</p>}
      {children}
      {bodyText(result) && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-white/80 p-3 font-mono text-[11px]">{bodyText(result)}</pre>}
    </div>
  );
}

/** One bad field in a response must not take the page down: the tab says so and the JSON stays reachable. */
export class TabBoundary extends Component<{ children: ReactNode }, { failed: string | null }> {
  state = { failed: null as string | null };
  static getDerivedStateFromError(e: unknown) { return { failed: e instanceof Error ? e.message : String(e) }; }
  render() {
    if (this.state.failed) return <BoundaryFallback reason={this.state.failed} />;
    return this.props.children;
  }
}

function BoundaryFallback({ reason }: { reason: string }) {
  const { t } = useLang();
  return <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">{t('Could not display the result — see the JSON.', 'Gagal menampilkan hasil — lihat JSON.')} <span className="text-amber-700">({reason})</span></p>;
}

/** Placeholder blocks while a request is in flight. */
function Loading() {
  const { t } = useLang();
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label={t('Loading', 'Memuat')}>
      <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100" />)}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}

export function TabShell({ state, children, errorExtra }: {
  state: TabState;
  children: (json: unknown) => ReactNode;
  errorExtra?: (result: CallResult) => ReactNode;
}) {
  const [showJson, setShowJson] = useState(false);
  const { t } = useLang();
  const { loading, result, error } = state;
  if (loading) return <Loading />;
  if (error) return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">{error}</p>;
  if (!result) return <p className="py-10 text-center text-sm text-zinc-500">{t('No result yet.', 'Belum ada hasil.')}</p>;
  let body: ReactNode;
  if (!result.ok) body = <ErrorBox result={result}>{errorExtra?.(result)}</ErrorBox>;
  else if (result.kind !== 'json') body = <ErrorBox result={result}><p className="font-semibold">{t('The response is not JSON', 'Respons bukan JSON')} ({result.kind}).</p></ErrorBox>;
  else body = <TabBoundary key={result.url + result.ms}>{children(result.json)}</TabBoundary>;
  return (
    <div className="flex flex-col gap-4">
      {body}
      <div className="border-t border-zinc-100 pt-2">
        <button type="button" className={btnGhost} onClick={() => setShowJson((v) => !v)}>
          {showJson ? t('Hide JSON', 'Sembunyikan JSON') : t('View JSON', 'Lihat JSON')}
          <span className="font-mono text-zinc-400">· {result.status || 'ERR'} · {result.ms} ms</span>
        </button>
        {showJson && <ResponseView result={result} />}
      </div>
    </div>
  );
}

export const LABEL = eyebrow;

export function Section({ title, children, aside }: { title: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={eyebrow}>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Tile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={`${card} px-3.5 py-3`}>
      <div className={eyebrow}>{label}</div>
      <div className="mt-1 truncate text-sm font-semibold capitalize">{value === undefined || value === null || value === '' ? '—' : value}</div>
    </div>
  );
}

/**
 * Colour for a severity word the backend sent. Only the backend's own
 * words are read; an unknown word stays neutral rather than guessed at.
 */
const TONE_CLASSES: Record<SeverityTone, string> = {
  good: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  bad: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  neutral: 'bg-zinc-100 text-zinc-600',
};

export function severityTone(severity: unknown): string {
  return TONE_CLASSES[severityToneOf(severity)];
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>;
}

export const dash = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));
export const num = (v: unknown, digits = 1) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : '—');
export const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v.filter((x) => x !== null && x !== undefined) as T[]) : []);
export const entries = <T,>(v: unknown): [string, T][] =>
  v && typeof v === 'object' && !Array.isArray(v) ? (Object.entries(v).filter(([, x]) => x && typeof x === 'object') as [string, T][]) : [];
/** "skin_texture" → "Skin texture" for keys shown as labels. */
export const humanize = (k: string) => {
  const t = k.replace(/[_-]+/g, ' ').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : k;
};
