'use client';
import { useEffect, useState } from 'react';
import { call } from '../../lib/http';
import { activeFlowSurveys, listFlows } from '../../lib/conversation';
import type { Brand } from '../../lib/photo';

/**
 * Survey codes that have an active conversation flow for the scope. `codes`
 * is null until known (or when the list cannot be read), in which case the
 * caller shows every survey and the engine says if one has no flow.
 */
export function useFlowSurveys(brand: Brand) {
  const [codes, setCodes] = useState<Set<string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ready = !!brand.brandId && !!brand.applicationId;

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    queueMicrotask(() => { if (alive) { setLoading(true); setError(null); } });
    call(listFlows(brand)).then((r) => {
      if (!alive) return;
      setLoading(false);
      if (!r.ok) { setCodes(null); setError(`Alur percakapan: HTTP ${r.status || 'ERR'}`); return; }
      setCodes(activeFlowSurveys(r.json));
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on the scope, not the object identity
  }, [brand.brandId, brand.applicationId, ready]);

  return { codes: ready ? codes : null, error: ready ? error : null, loading: ready && loading };
}
