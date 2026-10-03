import type { ApiClientRequest } from '@/types/api-client';

/** A Route Settings body variable; a 'file' field makes the request multipart. */
export interface BodyVariable {
  key: string;
  value?: string;
  fieldType?: string;
}

/**
 * The URL and fetch init for a Try & Send request, built from the editor's
 * state. Pure: no network, no React.
 *
 * - Enabled params fill a `[key]`, `:key` or `{key}` placeholder in the URL,
 *   or else are appended as query parameters.
 * - The transport is derived from Route Settings' own body variables: any
 *   file field makes it a multipart FormData body (the declared text fields
 *   take their value from the JSON body, else their default), otherwise the
 *   JSON body is sent as written.
 * - A JSON body gets a Content-Type unless one was set. A multipart body
 *   never carries one: fetch sets it with the boundary from the FormData,
 *   and a manually set header has none, which breaks upstream parsing.
 * - The active collection environment is named in X-Environment and
 *   X-Collection-Environment unless those were set. The gateway routes by
 *   X-Environment to registered environment hosts only.
 */
export function buildTryRequest(
  req: ApiClientRequest,
  bodyVariables: BodyVariable[],
  collectionEnvName?: string,
): { url: string; init: RequestInit & { headers: Record<string, string> } } {
  let url = req.url;
  const queryParams: string[] = [];

  req.params.forEach((param) => {
    if (!param.enabled || !param.key) return;
    const key = param.key.trim();
    const rawVal = param.value.trim();

    const hasPathPlaceholder = url.includes(`[${key}]`) || url.includes(`:${key}`) || url.includes(`{${key}}`);

    if (hasPathPlaceholder) {
      url = url
        .replace(`[${key}]`, encodeURIComponent(rawVal))
        .replace(`:${key}`, encodeURIComponent(rawVal))
        .replace(`{${key}}`, encodeURIComponent(rawVal));
    } else if (rawVal) {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(rawVal)}`);
    }
  });

  if (queryParams.length > 0) {
    url += (url.includes('?') ? '&' : '?') + queryParams.join('&');
  }

  const headers = req.headers.reduce<Record<string, string>>((acc, h) => {
    if (h.enabled && h.key) acc[h.key] = h.value;
    return acc;
  }, {});

  const isMultipart = bodyVariables.some((b) => b.fieldType === 'file');
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method);

  if (hasBody && !isMultipart) {
    const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type');
    if (!hasContentType) headers['Content-Type'] = 'application/json; charset=UTF-8';
  }
  if (isMultipart) {
    for (const k of Object.keys(headers)) {
      if (k.toLowerCase() === 'content-type') delete headers[k];
    }
  }

  if (collectionEnvName !== undefined) {
    if (!headers['X-Environment']) headers['X-Environment'] = collectionEnvName;
    if (!headers['X-Collection-Environment']) headers['X-Collection-Environment'] = collectionEnvName;
  }

  let body: BodyInit | undefined;
  if (hasBody) {
    if (isMultipart) {
      const fd = new FormData();
      let bodyObj: Record<string, string> = {};
      try {
        bodyObj = JSON.parse(req.body || '{}');
      } catch {}
      for (const b of bodyVariables) {
        if (!b.key) continue;
        if (b.fieldType === 'file') {
          const picked = req.multipartFields?.find((f) => f.key === b.key)?.file;
          if (picked) fd.append(b.key, picked);
        } else {
          fd.append(b.key, bodyObj[b.key] ?? (b.value || ''));
        }
      }
      body = fd;
    } else {
      body = req.body;
    }
  }

  return { url, init: { method: req.method, headers, body } };
}
