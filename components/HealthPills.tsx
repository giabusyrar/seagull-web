'use client';
import { useEffect, useState } from 'react';
import { SERVICES, svcPath, type ServiceId } from '@/lib/services';
import { call } from '@/lib/http';

export function HealthPills() {
  const [state, setState] = useState<Partial<Record<ServiceId, number>>>({});
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const entries = await Promise.all(Object.values(SERVICES).map(async (s) => {
        const r = await call({ url: svcPath(s.id, s.healthPath), init: { method: 'GET', cache: 'no-store' } });
        return [s.id, r.status] as const;
      }));
      if (alive) setState(Object.fromEntries(entries));
    };
    poll();
    const t = setInterval(poll, 10_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.values(SERVICES).map((s) => {
        const st = state[s.id];
        const ok = st !== undefined && st >= 200 && st < 300;
        const cls = st === undefined ? 'bg-zinc-200 text-zinc-600' : ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';
        return <span key={s.id} title={`${s.label}: ${st === undefined ? 'checking' : st === 0 ? 'unreachable' : `HTTP ${st}`}`} className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{s.label} {st === undefined ? '…' : ok ? '●' : st || '✕'}</span>;
      })}
    </div>
  );
}
