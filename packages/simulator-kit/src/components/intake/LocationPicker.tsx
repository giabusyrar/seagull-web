'use client';
import { useEffect, useState } from 'react';
import type { Respondent } from '../../lib/form';
import { fetchLocations, type LocationOption } from '../../lib/locations';
import { useLang } from '../../lib/i18n';
import { field } from '../ui';

type List = { key: string; data: LocationOption[]; error?: string };

/** One level's list, fetched when its parent is chosen; `key` keeps a stale answer from showing for a new parent. */
function useLevel(enabled: boolean, country?: string, province?: string) {
  const key = `${country ?? ''}|${province ?? ''}`;
  const [list, setList] = useState<List | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const ctl = new AbortController();
    fetchLocations(country, province, ctl.signal)
      .then((r) => setList({ key, data: r.data }))
      .catch((e) => { if (!ctl.signal.aborted) setList({ key, data: [], error: e instanceof Error ? e.message : String(e) }); });
    return () => ctl.abort();
  }, [enabled, key, country, province]);
  return enabled && list?.key === key ? list : null;
}

/**
 * Country → province → city, each list from the host's location route.
 * Choosing a level clears the ones below it, so a city never pairs with
 * another province. Names are stored; the province code only fetches cities.
 */
export function LocationPicker({ who, setWho }: { who: Respondent; setWho(r: Respondent): void }) {
  const { t } = useLang();
  const countries = useLevel(true);
  const provinces = useLevel(!!who.country, who.country);
  const cities = useLevel(!!who.country && !!who.provinceCode, who.country, who.provinceCode);

  const select = (label: string, list: List | null, value: string | undefined, enabled: boolean, onPick: (o: LocationOption | undefined) => void, emptyHint: string) => (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium text-zinc-600">{label}</span>
      <select className={`${field} w-full disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400`} disabled={!enabled || !list || !!list.error}
        value={value ?? ''} onChange={(e) => onPick(list?.data.find((o) => o.code === e.target.value))}>
        <option value="">{!enabled ? emptyHint : !list ? t('Loading…', 'Memuat…') : list.error ? t('Could not load', 'Gagal memuat') : list.data.length ? t('Choose…', 'Pilih…') : t('None listed', 'Tidak ada data')}</option>
        {list?.data.map((o) => <option key={o.code} value={o.code}>{o.flag ? `${o.flag} ` : ''}{o.name}</option>)}
      </select>
    </label>
  );

  const provinceValue = who.provinceCode;
  const cityValue = cities?.data.find((o) => o.name === who.city)?.code;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-4 sm:grid-cols-3">
        {select(t('Country', 'Negara'), countries, who.country, true,
          (o) => setWho({ ...who, country: o?.code, province: undefined, provinceCode: undefined, city: undefined }), '')}
        {select(t('Province', 'Provinsi'), provinces, provinceValue, !!who.country,
          (o) => setWho({ ...who, province: o?.name, provinceCode: o?.code, city: undefined }), t('Choose a country first', 'Pilih negara dulu'))}
        {select(t('City', 'Kota/Kabupaten'), cities, cityValue, !!who.provinceCode,
          (o) => setWho({ ...who, city: o?.name }), t('Choose a province first', 'Pilih provinsi dulu'))}
      </div>
    </div>
  );
}
