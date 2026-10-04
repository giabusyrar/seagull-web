'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { CallResult } from '@/lib/http';

const GlbViewer = dynamic(() => import('./GlbViewer').then((m) => m.GlbViewer), { ssr: false });

export function ResponseView({ result }: { result: CallResult }) {
  const tabs = [
    result.kind === 'json' && 'json', result.kind === 'image' && 'image', result.kind === 'glb' && '3d',
    result.kind === 'text' && 'text', 'headers',
  ].filter(Boolean) as string[];
  const [tab, setTab] = useState(tabs[0]);
  const colour = result.status === 0 ? 'bg-red-600' : result.ok ? 'bg-emerald-600' : 'bg-amber-600';
  return (
    <div className="mt-3 rounded border">
      <div className="flex items-center gap-2 border-b px-2 py-1 text-xs">
        <span className={`rounded px-1.5 py-0.5 font-semibold text-white ${colour}`}>{result.status || 'ERR'}</span>
        <span>{result.ms} ms</span>
        {result.size !== undefined && <span>{Math.round(result.size / 1024)} KB</span>}
        <span className="truncate text-zinc-500">{result.url}</span>
        <span className="ml-auto flex gap-1">{tabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded px-1.5 ${tab === t ? 'bg-zinc-200' : ''}`}>{t}</button>)}</span>
      </div>
      <div className="max-h-[32rem] overflow-auto p-2 text-xs">
        {result.networkError && <p className="text-red-700">{result.networkError}</p>}
        {tab === 'json' && <pre>{JSON.stringify(result.json, null, 2)}</pre>}
        {tab === 'text' && <pre className="whitespace-pre-wrap">{result.text}</pre>}
        {tab === 'image' && result.blobUrl && <img src={result.blobUrl} alt="response" className="max-h-[30rem]" />}
        {tab === '3d' && result.blobUrl && (
          <div><GlbViewer src={result.blobUrl} /><a className="underline" href={result.blobUrl} download="head.glb">download .glb</a></div>
        )}
        {tab === 'headers' && <table><tbody>{result.headers.map(([k, v]) => <tr key={k}><td className="pr-3 font-mono text-zinc-500">{k}</td><td className="font-mono break-all">{v}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
