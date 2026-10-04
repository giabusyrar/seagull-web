import type { HostRoutes, ReferenceDataSource } from '@gateway-experience/shared';

/**
 * This app's own API routes, as the shared and studio packages need them.
 * The packages no longer hardcode these paths; the app hands them in
 * (see components/HostProviders.tsx).
 */
export const HOST_ROUTES = {
  /** Reference catalogs for BrandSelect, ApplicationSelect and DimensionSelect. */
  brands: '/api/brands',
  applications: '/api/applications',
  dimensions: '/api/dimensions',
} as const;

/** The routes the studio package calls (reference data, skin conditions, collections). */
export const STUDIO_HOST_ROUTES: HostRoutes = {
  reference: (resource) => `/api/reference/${resource}`,
  skinConditions: '/api/skin-conditions',
  collections: '/api/collections',
};

const getJson = (path: string) => fetch(path).then((res) => res.json());

export const referenceDataSource: ReferenceDataSource = {
  brands: () => getJson(HOST_ROUTES.brands),
  applications: () => getJson(HOST_ROUTES.applications),
  dimensions: () => getJson(HOST_ROUTES.dimensions),
};
