'use client';
import { useEffect, useState } from 'react';
import { services, svcPath, type ServiceId } from '../lib/services';
import { call } from '../lib/http';

export function HealthPills() {
  const [state, setState] = useState<Partial<Record<ServiceId, { status: number; down: boolean }>>>({});
  // Only services the host gave a health check; the others have no pill rather than a guessed state.
  const checked = services().filter((s) => s.healthPath !== null);
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      const entries = await Promise.all(checked.map(async (s) => {
        const r = await call({ url: svcPath(s.id, s.healthPath as string), init: { method: 'GET', cache: 'no-store' } });
        return [s.id, { status: r.status, down: r.status === 0 || !!r.hint }] as const;
      }));
      if (alive) setState(Object.fromEntries(entries));
    };
    poll();
    const t = setInterval(poll, 10_000);
    return () => { alive = false; clearInterval(t); };
    // The host's configuration is fixed before the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-wrap gap-1.5">
      {checked.map((s) => {
        const h = state[s.id];
        const st = h?.status;
        const ok = st !== undefined && st >= 200 && st < 300;
        const dotCls = st === undefined ? 'bg-zinc-300 animate-pulse' : ok ? 'bg-emerald-500' : 'bg-red-500';
        const detail = st === undefined ? '' : ok ? '' : h?.down ? `${st || ''}`.trim() : String(st || '');
        return (
          <span key={s.id} title={`${s.label}: ${st === undefined ? 'checking' : h?.down ? `unreachable (HTTP ${st})` : `HTTP ${st}`}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ok || st === undefined ? 'border-zinc-200 text-zinc-600' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
            {s.label}{detail && <span className="font-mono">{detail}</span>}
          </span>
        );
      })}
    </div>
  );
}
