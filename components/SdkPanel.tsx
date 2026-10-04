'use client';
import { useMemo, useState } from 'react';
import { createBeautyClient } from '@gateway-experience/beauty-sdk/client';
import { buildRequest, type FieldValue } from '@/lib/endpoint';
import { call, readResponse, type CallResult } from '@/lib/http';
import { GROUPS } from '@/lib/groups';
import { sdkInit, withBrandHeaders, type SdkOpDef } from '@/lib/sdk';
import { useBrand } from '@/lib/brand';
import { FieldInput } from './FieldInput';
import { ResponseView } from './ResponseView';

const DIRECT = new Map(GROUPS.flatMap((g) => g.endpoints).map((e) => [e.id, e]));

export function SdkPanel({ def }: { def: SdkOpDef }) {
  const brand = useBrand();
  const client = useMemo(
    () => createBeautyClient({ baseUrl: '/api/beauty', fetch: withBrandHeaders({ brandId: brand.brandId, applicationId: brand.applicationId }) }),
    [brand.brandId, brand.applicationId],
  );
  const [values, setValues] = useState<Record<string, FieldValue>>(() => Object.fromEntries(def.fields.map((f) => [f.name, f.default])));
  const [sdk, setSdk] = useState<CallResult | null>(null);
  const [direct, setDirect] = useState<CallResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const viaSdk = async (): Promise<CallResult> => {
    const t0 = performance.now();
    try {
      return await readResponse(await client.call(def.id, sdkInit(def, values)), `sdk ${def.id}`, t0);
    } catch (e) {
      return { ok: false, status: 0, ms: Math.round(performance.now() - t0), url: `sdk ${def.id}`, headers: [], kind: 'empty', networkError: `SDK call failed: ${e instanceof Error ? e.message : String(e)}` };
    }
  };
  const viaDirect = async (): Promise<CallResult | null> => {
    const d = DIRECT.get(def.directId);
    if (!d) { setError(`no direct endpoint ${def.directId}`); return null; }
    return call(buildRequest(d, values, brand));
  };
  const run = async (which: 'sdk' | 'direct' | 'both') => {
    setError('');
    if (!brand.brandId || !brand.applicationId) { setError('pick a brand and application in the top bar'); return; }
    setBusy(true);
    try {
      const [s, d] = await Promise.all([which !== 'direct' ? viaSdk() : null, which !== 'sdk' ? viaDirect() : null]);
      if (which !== 'direct') setSdk(s);
      if (which !== 'sdk') setDirect(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const btn = 'rounded px-3 py-1 text-sm disabled:opacity-50';
  return (
    <section className="rounded-lg border p-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-mono font-medium">{def.title}</h2>
        <span className="text-xs text-zinc-500">direct equivalent: {def.directId}</span>
      </div>
      {def.fields.length > 0 && (
        <div className="mt-2 grid grid-cols-[10rem_1fr] items-center gap-x-3 gap-y-1.5">
          {def.fields.map((f) => [
            <label key={`${f.name}-l`} className="font-mono text-xs">{f.name}{f.required && <span className="text-red-600">*</span>}</label>,
            <div key={`${f.name}-i`}>
              <FieldInput field={f} value={values[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />
              {f.help && <div className="text-[11px] text-zinc-500">{f.help}</div>}
            </div>,
          ])}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button className={`${btn} bg-zinc-900 text-white`} disabled={busy} onClick={() => run('sdk')}>Via SDK</button>
        <button className={`${btn} border`} disabled={busy} onClick={() => run('direct')}>Direct</button>
        <button className={`${btn} border`} disabled={busy} onClick={() => run('both')}>Both</button>
        {error && <span className="text-xs text-red-700">{error}</span>}
      </div>
      {(sdk || direct) && (
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          <div><div className="text-xs font-semibold">SDK</div>{sdk ? <ResponseView key={`s-${sdk.ms}`} result={sdk} /> : <p className="text-xs text-zinc-500">not run</p>}</div>
          <div><div className="text-xs font-semibold">Direct</div>{direct ? <ResponseView key={`d-${direct.ms}`} result={direct} /> : <p className="text-xs text-zinc-500">not run</p>}</div>
        </div>
      )}
    </section>
  );
}
