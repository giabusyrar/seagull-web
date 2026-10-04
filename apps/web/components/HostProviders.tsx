'use client';

import React from 'react';
import { ReferenceDataProvider } from '@gateway-experience/shared';
import { referenceDataSource } from '@/lib/host-routes';

/** Hands this app's routes to the shared and studio packages. */
export function HostProviders({ children }: { children: React.ReactNode }) {
  return <ReferenceDataProvider source={referenceDataSource}>{children}</ReferenceDataProvider>;
}
