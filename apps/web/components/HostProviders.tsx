'use client';

import React from 'react';
import { HostRoutesProvider, ReferenceDataProvider } from '@gateway-experience/shared';
import { STUDIO_HOST_ROUTES, referenceDataSource } from '@/lib/host-routes';

/** Hands this app's routes to the shared and studio packages. */
export function HostProviders({ children }: { children: React.ReactNode }) {
  return (
    <HostRoutesProvider routes={STUDIO_HOST_ROUTES}>
      <ReferenceDataProvider source={referenceDataSource}>{children}</ReferenceDataProvider>
    </HostRoutesProvider>
  );
}
