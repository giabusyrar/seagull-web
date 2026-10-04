'use client';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { usePersistentState } from '@gateway-experience/shared';

/**
 * UI language. English is the default; Indonesian is the alternative. Only
 * the simulator's own text is translated: survey questions, advisor speech
 * and engine messages arrive in whatever language the brand wrote them.
 */
export type Lang = 'en' | 'id';
export const DEFAULT_LANG: Lang = 'en';

interface LangCtx {
  lang: Lang;
  setLang(l: Lang): void;
  /** The text in the current language: t('English', 'Indonesia'). */
  t(en: string, id: string): string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = usePersistentState<Lang>('sim.lang', DEFAULT_LANG);
  const t = useCallback((en: string, id: string) => (lang === 'id' ? id : en), [lang]);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang needs a <LangProvider>.');
  return c;
}

/** A label map per language, for lookups outside JSX (shade categories, QC advice, …). */
export type Bilingual<K extends string = string> = Record<Lang, Record<K, string>>;
