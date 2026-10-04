'use client';
import { useEffect, useState } from 'react';
import { call } from '@/lib/http';
import { svcPath } from '@/lib/services';
import { useBrand } from '@/lib/brand';
import { useLang } from '@/lib/i18n';
import { eyebrow, field } from './ui';

type Opt = { value: string; label: string };
const load = async (res: string, value: string): Promise<Opt[] | string> => {
  const r = await call({ url: svcPath('ref', `/api/reference/${res}`), init: { method: 'GET' } });
  if (!r.ok) return r.networkError ?? `reference ${res}: HTTP ${r.status}`;
  const data = (r.json as { data?: Record<string, string>[] })?.data ?? [];
  return data.map((d) => ({ value: d[value], label: `${d.name} (${d[value]})` }));
};

export function BrandPicker() {
  const b = useBrand();
  const { t } = useLang();
  const [brands, setBrands] = useState<Opt[] | string>([]);
  const [apps, setApps] = useState<Opt[] | string>([]);
  useEffect(() => { load('brands', 'code').then(setBrands); load('applications', 'key').then(setApps); }, []);
  const sel = (opts: Opt[] | string, v: string, set: (v: string) => void, ph: string, label: string) => (
    <label className="flex min-w-0 items-center gap-2">
      <span className={`${eyebrow} hidden sm:inline`}>{label}</span>
      {typeof opts === 'string'
        ? <input aria-label={label} className={`${field} w-full sm:w-36`} placeholder={ph} value={v} onChange={(e) => set(e.target.value)} title={opts} />
        : <select aria-label={label} className={`${field} w-full sm:w-auto sm:max-w-48 ${v ? '' : 'text-zinc-400'}`} value={v} onChange={(e) => set(e.target.value)}>
            <option value="">{ph}</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>}
    </label>
  );
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
      {sel(brands, b.brandId, b.setBrandId, t('Choose brand', 'Pilih brand'), 'Brand')}
      {sel(apps, b.applicationId, b.setApplicationId, t('Choose application', 'Pilih aplikasi'), t('Application', 'Aplikasi'))}
    </div>
  );
}
