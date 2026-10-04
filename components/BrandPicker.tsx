'use client';
import { useEffect, useState } from 'react';
import { call } from '@/lib/http';
import { svcPath } from '@/lib/services';
import { useBrand } from '@/lib/brand';

type Opt = { value: string; label: string };
const load = async (res: string, value: string): Promise<Opt[] | string> => {
  const r = await call({ url: svcPath('ref', `/api/reference/${res}`), init: { method: 'GET' } });
  if (!r.ok) return r.networkError ?? `reference ${res}: HTTP ${r.status}`;
  const data = (r.json as { data?: Record<string, string>[] })?.data ?? [];
  return data.map((d) => ({ value: d[value], label: `${d.name} (${d[value]})` }));
};

export function BrandPicker() {
  const b = useBrand();
  const [brands, setBrands] = useState<Opt[] | string>([]);
  const [apps, setApps] = useState<Opt[] | string>([]);
  useEffect(() => { load('brands', 'code').then(setBrands); load('applications', 'key').then(setApps); }, []);
  const sel = (opts: Opt[] | string, v: string, set: (v: string) => void, ph: string) =>
    typeof opts === 'string'
      ? <input className="rounded border px-2 py-1 text-sm" placeholder={ph} value={v} onChange={(e) => set(e.target.value)} title={opts} />
      : <select className="rounded border px-2 py-1 text-sm" value={v} onChange={(e) => set(e.target.value)}>
          <option value="">{ph}</option>
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>;
  return (
    <div className="flex gap-2">
      {sel(brands, b.brandId, b.setBrandId, 'brand')}
      {sel(apps, b.applicationId, b.setApplicationId, 'application')}
    </div>
  );
}
