'use client';
import { useCallback, useEffect, useState } from 'react';
import { call } from '../lib/http';
import { svcPath } from '../lib/services';
import { useBrand } from '../lib/brand';
import { useLang } from '../lib/i18n';
import { btnGhost, eyebrow, field } from './ui';

type Opt = { value: string; label: string };
/** A loaded list, or why it could not be loaded. */
type Loaded = { options: Opt[] } | { error: string };

const load = async (res: string, value: string): Promise<Loaded> => {
  const r = await call({ url: svcPath('ref', `/api/reference/${res}`), init: { method: 'GET' } });
  if (!r.ok) return { error: r.networkError ?? `reference ${res}: HTTP ${r.status}` };
  const data = (r.json as { data?: Record<string, string>[] })?.data ?? [];
  return { options: data.map((d) => ({ value: d[value], label: `${d.name} (${d[value]})` })) };
};

/** Brand and application, each a dropdown of Reference Data's list. */
export function BrandPicker() {
  const b = useBrand();
  const { t } = useLang();
  const [brands, setBrands] = useState<Loaded | null>(null);
  const [apps, setApps] = useState<Loaded | null>(null);
  const reload = useCallback(() => {
    setBrands(null);
    setApps(null);
    load('brands', 'code').then(setBrands);
    load('applications', 'key').then(setApps);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the first load of two remote lists
  useEffect(() => { reload(); }, [reload]);

  const sel = (list: Loaded | null, v: string, set: (v: string) => void, ph: string, label: string) => {
    const options = list && 'options' in list ? list.options : [];
    // A value chosen earlier stays selectable even when the list did not load or no longer has it.
    const kept = v && !options.some((o) => o.value === v) ? [{ value: v, label: v }] : [];
    const error = list && 'error' in list ? list.error : undefined;
    return (
      <label className="flex min-w-0 items-center gap-2">
        <span className={`${eyebrow} hidden sm:inline`}>{label}</span>
        <select aria-label={label} title={error} disabled={!list && !v}
          className={`${field} w-full sm:w-auto sm:max-w-48 ${v ? '' : 'text-zinc-400'} ${error ? 'border-amber-300' : ''}`}
          value={v} onChange={(e) => set(e.target.value)}>
          <option value="">{!list ? t('Loading…', 'Memuat…') : error ? t('Could not load', 'Gagal memuat') : ph}</option>
          {[...kept, ...options].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    );
  };
  const failed = [brands, apps].some((l) => l && 'error' in l);
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
      {sel(brands, b.brandId, b.setBrandId, t('Choose brand', 'Pilih brand'), 'Brand')}
      {sel(apps, b.applicationId, b.setApplicationId, t('Choose application', 'Pilih aplikasi'), t('Application', 'Aplikasi'))}
      {failed && <button type="button" className={`${btnGhost} col-span-2`} onClick={reload}>{t('Retry', 'Coba lagi')}</button>}
    </div>
  );
}
