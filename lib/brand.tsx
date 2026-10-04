'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  useEffect(() => setB(load()), []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {} }, [b]);
  return (
    <BrandCtx.Provider value={{ ...b, setBrandId: (brandId) => setB((p) => ({ ...p, brandId })), setApplicationId: (applicationId) => setB((p) => ({ ...p, applicationId })) }}>
      {children}
    </BrandCtx.Provider>
  );
}

export function useBrand() {
  const c = useContext(BrandCtx);
  if (!c) throw new Error('useBrand outside BrandProvider');
  return c;
}
