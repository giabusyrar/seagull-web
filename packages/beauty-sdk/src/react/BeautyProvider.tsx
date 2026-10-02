'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { createBeautyClient, type BeautyClient } from '../client/transport';
import { defaultMessages, format, type Locale, type Messages } from './messages';

interface BeautyContext {
  client: BeautyClient;
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<BeautyContext | null>(null);

export interface BeautyProviderProps {
  /** The brand's proxy route, e.g. "/api/beauty". Ignored when `client` is given. */
  baseUrl?: string;
  client?: BeautyClient;
  locale?: Locale;
  /** Overrides for any message key. */
  messages?: Messages;
  children: React.ReactNode;
}

export function BeautyProvider({ baseUrl = '/api/beauty', client, locale = 'id', messages, children }: BeautyProviderProps) {
  const value = useMemo<BeautyContext>(() => {
    const dict = { ...defaultMessages[locale], ...messages };
    return {
      client: client ?? createBeautyClient({ baseUrl }),
      locale,
      t: (key, vars) => format(dict[key] ?? key, vars),
    };
  }, [baseUrl, client, locale, messages]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBeauty(): BeautyContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBeauty must be used inside <BeautyProvider>.');
  return ctx;
}
