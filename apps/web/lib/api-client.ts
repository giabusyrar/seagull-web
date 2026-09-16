/**
 * Centralized, strongly-typed API Client for the Go Echo Backend Gateway Engine.
 * Replaces direct Prisma ORM access across Next.js Server Components, Actions, and Handlers.
 */

import { getGatewayEngineUrl } from '@/lib/config/services';

export interface ApiClientConfig {
  baseUrl?: string;
  getToken?: () => string | null | undefined;
}

export interface Collection {
  id: string;
  name: string;
  type: string;
  originalPrefix?: string;
  stripPrefix?: boolean;
  healthCheckPath?: string;
  status?: string;
  lastCheckedAt?: string;
  activeEnvironmentId?: string;
  provider?: string;
  defaultLlmModel?: string;
  environments?: any[];
  routeGroups?: any[];
  routes?: any[];
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  keyLastFour: string;
  plaintextKey?: string;
  status: string;
  allCollections: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface GlobalEnvironment {
  id: string;
  name: string;
  isDefault?: boolean;
  variables?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export function createApiClient(config: ApiClientConfig = {}) {
  const getBaseUrl = () => {
    if (config.baseUrl) return config.baseUrl;
    if (typeof window === 'undefined') {
      return getGatewayEngineUrl();
    }
    return process.env.NEXT_PUBLIC_GATEWAY_ENGINE_URL || '';
  };

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = config.getToken?.();
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const baseUrl = getBaseUrl();
    const url = baseUrl ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : path;
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedError: any;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = null;
      }
      const message = parsedError?.message || parsedError?.error || errorText || `HTTP ${res.status}`;
      throw new Error(`API Request Error [${res.status}] ${path}: ${message}`);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as unknown as T;
    }

    return res.json();
  }

  return {
    auth: {
      login: (credentials: { username: string; password?: string; passwordHash?: string }) =>
        request<{ token: string; user: User }>('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        }),
      me: () => request<User>('/api/v1/auth/me'),
    },
    users: {
      list: () => request<User[]>('/api/v1/users'),
      create: (data: { username: string; password?: string; role?: string }) =>
        request<User>('/api/v1/users', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<User>) =>
        request<User>(`/api/v1/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<void>(`/api/v1/users/${id}`, {
          method: 'DELETE',
        }),
    },
    collections: {
      list: () => request<Collection[]>('/api/v1/collections'),
      get: (id: string) => request<Collection>(`/api/v1/collections/${id}`),
      create: (data: Partial<Collection>) =>
        request<Collection>('/api/v1/collections', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<Collection>) =>
        request<Collection>(`/api/v1/collections/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<void>(`/api/v1/collections/${id}`, {
          method: 'DELETE',
        }),
    },
    apiKeys: {
      list: () => request<ApiKey[]>('/api/v1/api-keys'),
      create: (data: { name: string; expiresAt?: string | null; collectionIds?: string[]; allCollections?: boolean }) =>
        request<{ apiKey: ApiKey; plaintextKey: string }>('/api/v1/api-keys', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      revoke: (id: string) =>
        request<void>(`/api/v1/api-keys/${id}`, {
          method: 'DELETE',
        }),
    },
    globalEnvironments: {
      list: () => request<GlobalEnvironment[]>('/api/v1/global-environments'),
      get: (id: string) => request<GlobalEnvironment>(`/api/v1/global-environments/${id}`),
      create: (data: Partial<GlobalEnvironment>) =>
        request<GlobalEnvironment>('/api/v1/global-environments', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<GlobalEnvironment>) =>
        request<GlobalEnvironment>(`/api/v1/global-environments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<void>(`/api/v1/global-environments/${id}`, {
          method: 'DELETE',
        }),
    },
    settings: {
      get: () => request<Record<string, any>>('/api/v1/settings'),
      update: (data: Record<string, any>) =>
        request<Record<string, any>>('/api/v1/settings', {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },
    raw: request,
  };
}

export const apiClient = createApiClient();

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

export async function apiPut<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${path} failed [${res.status}]: ${text}`);
  }
  return res.json();
}
