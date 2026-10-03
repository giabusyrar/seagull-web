import type { CoreCollectionKey } from '@gateway-experience/studio/core';
import { readApiError, type AnalyzeResult, type CatalogResult } from './types';

/** Resolves a core-engine route through the dashboard's collections (useCoreCollection). */
export type EndpointResolver = (key: CoreCollectionKey, route: string) => string;

export interface AnalyzeInput {
  image: File;
  hijab: boolean;
  hairVisible: boolean;
}

/**
 * POST colour-engine /analyze. Throws the ApiError read from a failed
 * response. The beauty-sdk's colour.analyze is the same engine call, but it
 * goes through a brand's proxy route; the dashboard reaches the engine
 * through its own collection routing instead.
 */
export async function analyzeColour(endpoint: EndpointResolver, input: AnalyzeInput, doFetch: typeof fetch = fetch): Promise<AnalyzeResult> {
  const fd = new FormData();
  fd.append('image', input.image);
  fd.append('hijab', String(input.hijab));
  fd.append('hairVisible', String(input.hairVisible));
  const res = await doFetch(endpoint('colour', '/analyze'), { method: 'POST', body: fd });
  if (!res.ok) throw await readApiError(res);
  return (await res.json()) as AnalyzeResult;
}

/** GET colour-engine /catalog: every shade, with no analysis. Throws like analyzeColour. */
export async function fetchColourCatalog(endpoint: EndpointResolver, doFetch: typeof fetch = fetch): Promise<CatalogResult> {
  const res = await doFetch(endpoint('colour', '/catalog'));
  if (!res.ok) throw await readApiError(res);
  return (await res.json()) as CatalogResult;
}
