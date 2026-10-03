import { apiGet } from '@/lib/api-client';
import type { Environment } from '@/types/api-client';

/**
 * The dashboard API calls the route editor makes. List loaders resolve to
 * null when the response is not a successful list; every error is left to
 * the caller.
 */

export interface CollectionParameter {
  kind: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface CollectionGlobalVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface CollectionEnvironment {
  id: string;
  name: string;
  targetHost: string;
}

async function successList<T>(path: string, field: string): Promise<T[] | null> {
  const data = await apiGet<Record<string, unknown>>(path);
  return data.success && Array.isArray(data[field]) ? (data[field] as T[]) : null;
}

export const listCollectionParameters = (collectionId: string) =>
  successList<CollectionParameter>(`/api/collections/${collectionId}/parameters`, 'parameters');

export const listCollectionGlobalVariables = (collectionId: string) =>
  successList<CollectionGlobalVariable>(`/api/collections/${collectionId}/global-variables`, 'variables');

export const listCollectionEnvironments = (collectionId: string) =>
  successList<CollectionEnvironment>(`/api/collections/${collectionId}/environments`, 'environments');

export const listGlobalEnvironments = () => successList<Environment>('/api/global-environments', 'environments');

/**
 * Sets (or with '' clears) the collection's active environment. Resolves
 * once the server answers, whatever its status; rejects only when the
 * request cannot be made.
 */
export async function setActiveCollectionEnvironment(collectionId: string, envId: string): Promise<void> {
  await fetch(`/api/collections/${collectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activeEnvironmentId: envId || null }),
  });
}

export interface TryResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  text: string;
}

/** Sends a Try & Send request (see buildTryRequest) and reads the whole response. */
export async function sendTryRequest(url: string, init: RequestInit): Promise<TryResult> {
  const res = await fetch(url, init);
  const text = await res.text();
  return { status: res.status, statusText: res.statusText, headers: Object.fromEntries(res.headers.entries()), text };
}

export interface RouteExecutionLog {
  routeId: string;
  collectionId: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  latencyMs: number;
  source: 'ui-try';
  requestBody: string | null;
  responseBody: string;
}

/** Records a Try & Send execution for the history panel. */
export async function logRouteExecution(entry: RouteExecutionLog): Promise<void> {
  await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
}
