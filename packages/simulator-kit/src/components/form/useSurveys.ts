'use client';
import { useEffect, useState } from 'react';
import { call } from '../../lib/http';
import { listSurveys, selectableSurveys, type SurveyRow } from '../../lib/form';
import type { Brand } from '../../lib/photo';

interface Loaded { scope: string; rows: SurveyRow[]; error: string | null }

/**
 * The brand/application's surveys; reloads when the scope changes. `loading`
 * stays true until the answer for the current scope is in, so a caller never
 * mistakes "not fetched yet" for "this brand has no forms".
 */
export function useSurveys(brand: Brand) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const ready = !!brand.brandId && !!brand.applicationId;
  const scope = `${brand.brandId}|${brand.applicationId}`;

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    call(listSurveys(brand)).then((r) => {
      if (!alive) return;
      if (!r.ok) setLoaded({ scope, rows: [], error: r.networkError ?? r.hint ?? `Forms: HTTP ${r.status}` });
      else setLoaded({ scope, rows: selectableSurveys(r.json), error: null });
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on the scope, not the object identity
  }, [scope, ready]);

  const current = ready && loaded?.scope === scope ? loaded : null;
  return { rows: current?.rows ?? [], error: current?.error ?? null, loading: ready && !current, ready };
}
