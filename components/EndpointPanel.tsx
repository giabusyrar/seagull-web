'use client';
import { useState } from 'react';
import { buildRequest, type EndpointDef, type FieldValue } from '@/lib/endpoint';
import { call, type CallResult } from '@/lib/http';
import { useBrand } from '@/lib/brand';
import { FieldInput } from './FieldInput';
import { ResponseView } from './ResponseView';

export function EndpointPanel({ def }: { def: EndpointDef }) {
  const brand = useBrand();
  const [values, setValues] = useState<Record<string, FieldValue>>(() => Object.fromEntries(def.fields.map((f) => [f.name, f.default])));
  const [result, setResult] = useState<CallResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const needsBrand = def.brand !== 'none' && (!brand.brandId || !brand.applicationId);

  const send = async () => {
    setError('');
    let req;
    try { req = buildRequest(def, values, brand); } catch (e) { setError((e as Error).message); return; }
    setBusy(true);
    setResult(await call(req));
    setBusy(false);
  };

  return (
    <section className="rounded-lg border p-3">
      <div className="flex items-baseline gap-2">
        <span className="rounded bg-zinc-100 px-1.5 font-mono text-xs">{def.method}</span>
        <h2 className="font-medium">{def.title}</h2>
        <code className="truncate text-xs text-zinc-500">{def.path}</code>
      </div>
      {def.note && <p className="mt-1 text-xs text-amber-700">{def.note}</p>}
      {def.fields.length > 0 && (
        <div className="mt-2 grid grid-cols-[10rem_1fr] items-center gap-x-3 gap-y-1.5">
          {def.fields.map((f) => [
            <label key={`${f.name}-l`} className="text-xs font-mono">{f.label ?? f.name}{f.required && <span className="text-red-600">*</span>}</label>,
            <div key={`${f.name}-i`}>
              <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
              {f.help && <div className="text-[11px] text-zinc-500">{f.help}</div>}
            </div>,
          ])}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button onClick={send} disabled={busy} className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send'}</button>
        {needsBrand && <span className="text-xs text-amber-700">pick a brand and application in the top bar</span>}
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
      {result && <ResponseView key={`${result.url}-${result.ms}`} result={result} />}
    </section>
  );
}
