'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Brand } from './endpoint';

type Ctx = Brand & { setBrandId(v: string): void; setApplicationId(v: string): void };
const BrandCtx = createContext<Ctx | null>(null);
const KEY = 'sim.brand';

function load(): Brand {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? ''); if (v && typeof v.brandId === 'string') return v; } catch {}
  return { brandId: '', applicationId: '' };
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [b, setB] = useState<Brand>({ brandId: '', applicationId: '' });
  const cur = useRef<Brand>(b);
  // Load only; never write here, so a double-invoked mount effect cannot clobber saved state.
  useEffect(() => { const saved = load(); queueMicrotask(() => { cur.current = saved; setB(saved); }); }, []);
  // Persist only on real user changes.
  const update = (patch: Partial<Brand>) => {
    const next = { ...cur.current, ...patch };
    cur.current = next; setB(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  return (
    <BrandCtx.Provider value={{ ...b, setBrandId: (brandId) => update({ brandId }), setApplicationId: (applicationId) => update({ applicationId }) }}>
      {children}
    </BrandCtx.Provider>
  );
}

export function useBrand() {
  const c = useContext(BrandCtx);
  if (!c) throw new Error('useBrand outside BrandProvider');
  return c;
}
