import { HttpMethod, ResponseData, KeyValuePair, ApiClientRequest } from '@/types/api-client';
import { browserDataPlaneHost } from '@/lib/config/services';

export const METHOD_COLORS: Record<HttpMethod, { text: string; bg: string; border: string }> = {
  GET: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  POST: { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  PUT: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  DELETE: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  PATCH: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  OPTIONS: { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  HEAD: { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
};

export function validateAndFormatJson(input: string): { isValid: boolean; formatted: string; error?: string } {
  if (!input || !input.trim()) {
    return { isValid: true, formatted: '{}' };
  }

  const trimmed = input.trim();

  // Try standard JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    return { isValid: true, formatted: JSON.stringify(parsed, null, 2) };
  } catch (err1) {
    try {
      const sanitized = trimmed
        .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

      const parsed = JSON.parse(sanitized);
      return { isValid: true, formatted: JSON.stringify(parsed, null, 2) };
    } catch {
      return {
        isValid: false,
        formatted: input,
        error: err1 instanceof Error ? err1.message : 'Invalid JSON',
      };
    }
  }
}

export function formatJsonString(input: string): string {
  return validateAndFormatJson(input).formatted;
}

export function extractVariableTokens(text: string): string[] {
  const matches = text.match(/\{\{\s*([a-zA-Z0-9_$.\:]+)\s*\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[\{\}\s]/g, ''))));
}

export function resolveVariableToken(
  token: string,
  variables: Record<string, string> = {},
  globalVars: Record<string, string> = {},
  collectionVars: Record<string, string> = {}
): { value: string | undefined; scope: 'collection' | 'global' | 'unresolved'; cleanKey: string; isExplicit: boolean } {
  let cleanKey = token;
  let explicitScope: 'global' | 'collection' | null = null;

  if (token.startsWith('global.')) {
    cleanKey = token.slice(7);
    explicitScope = 'global';
  } else if (token.startsWith('collection.')) {
    cleanKey = token.slice(11);
    explicitScope = 'collection';
  }

  const fallbackHost = browserDataPlaneHost();

  if (explicitScope === 'global') {
    const val = globalVars[cleanKey] || variables[cleanKey] || (cleanKey === 'host' ? (globalVars['host'] || fallbackHost) : undefined);
    return { value: val, scope: val ? 'global' : 'unresolved', cleanKey, isExplicit: true };
  }

  if (explicitScope === 'collection') {
    const val = collectionVars[cleanKey] || (cleanKey === 'target_host' || cleanKey === 'host' ? (collectionVars['target_host'] || collectionVars['host']) : undefined);
    return { value: val, scope: val ? 'collection' : 'unresolved', cleanKey, isExplicit: true };
  }

  const colVal = collectionVars[cleanKey] || (cleanKey === 'target_host' ? (collectionVars['target_host'] || collectionVars['host']) : undefined);
  if (colVal) return { value: colVal, scope: 'collection', cleanKey, isExplicit: false };

  const globalVal = globalVars[cleanKey] || variables[cleanKey] || (cleanKey === 'host' ? (globalVars['host'] || fallbackHost) : undefined);
  if (globalVal) return { value: globalVal, scope: 'global', cleanKey, isExplicit: false };

  return { value: undefined, scope: 'unresolved', cleanKey, isExplicit: false };
}

export function interpolateUrl(
  url: string,
  variables: Record<string, string> = {},
  globalVars: Record<string, string> = {},
  collectionVars: Record<string, string> = {}
): string {
  let result = url;
  const tokens = extractVariableTokens(url);

  tokens.forEach((t) => {
    const resolved = resolveVariableToken(t, variables, globalVars, collectionVars);
    if (resolved.value !== undefined) {
      const val = resolved.value;
      const cleanKey = resolved.cleanKey;

      if ((cleanKey === 'host' || cleanKey === 'target_host' || t.includes('host')) && val && !val.endsWith('/')) {
        const patternWithFollowingNonSlash = new RegExp(`\\{\\{\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}([^/])`, 'g');
        result = result.replace(patternWithFollowingNonSlash, (match, p1) => `${val}/${p1}`);
      }

      const escapedToken = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\{\\{\\s*${escapedToken}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, val);
    }
  });

  return result;
}

export function generateCurlCommand(req: ApiClientRequest, envVars: Record<string, string> = {}): string {
  const url = interpolateUrl(req.url, envVars);
  let curl = `curl -X ${req.method} "${url}"`;

  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      const val = interpolateUrl(h.value, envVars);
      curl += ` \\\n  -H "${h.key.trim()}: ${val}"`;
    });

  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body.trim()) {
    const cleanBody = req.body.replace(/"/g, '\\"');
    curl += ` \\\n  -d "${cleanBody.replace(/\n/g, '')}"`;
  }

  return curl;
}

export async function executeHttpRequest(
  method: HttpMethod,
  rawUrl: string,
  params: KeyValuePair[],
  headers: KeyValuePair[],
  body: string,
  envVars: Record<string, string> = {},
  extraHeaders: Record<string, string> = {}
): Promise<ResponseData> {
  const startTime = Date.now();
  let interpolatedUrl = interpolateUrl(rawUrl, envVars);

  const activeParams = params.filter((p) => p.enabled && p.key.trim() !== '');
  if (activeParams.length > 0) {
    const searchParams = new URLSearchParams();
    activeParams.forEach((p) => searchParams.append(p.key.trim(), interpolateUrl(p.value, envVars)));
    const queryString = searchParams.toString();
    if (queryString) {
      interpolatedUrl += (interpolatedUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headerObj: Record<string, string> = { ...extraHeaders };
  headers
    .filter((h) => h.enabled && h.key.trim() !== '')
    .forEach((h) => {
      headerObj[h.key.trim()] = interpolateUrl(h.value, envVars);
    });

  // A string fetch body defaults to text/plain, which servers that bind on
  // Content-Type (Echo's c.Bind, etc.) reject. Default write requests carrying a
  // body to JSON unless the caller set their own Content-Type.
  const hasContentType = Object.keys(headerObj).some((k) => k.toLowerCase() === 'content-type');
  if (!hasContentType && !['GET', 'HEAD'].includes(method) && body && body.trim() && body.trim() !== '{}') {
    headerObj['Content-Type'] = 'application/json';
  }

  try {
    let fetchUrl = interpolatedUrl;
    if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://') && !fetchUrl.startsWith('/api/')) {
      const apiBase = process.env.NEXT_PUBLIC_GATEWAY_ENGINE_URL;
      if (apiBase) {
        fetchUrl = apiBase + (fetchUrl.startsWith('/') ? fetchUrl : '/' + fetchUrl);
      }
    }

    const res = await fetch(fetchUrl, {
      method,
      headers: headerObj,
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
    });

    const latency = Date.now() - startTime;
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    const text = await res.text();
    let formattedBody = text;
    try {
      formattedBody = JSON.stringify(JSON.parse(text), null, 2);
    } catch {}

    const byteSize = new Blob([text]).size;
    const sizeStr = byteSize > 1024 ? `${(byteSize / 1024).toFixed(2)} KB` : `${byteSize} B`;

    return {
      status: res.status,
      statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
      latency,
      size: sizeStr,
      headers: resHeaders,
      body: formattedBody,
      error: null,
      timestamp: Date.now(),
    };
  } catch (err) {
    // No response at all (unreachable host, CORS, DNS, aborted). Report it as
    // that: no status, no body, and why.
    return {
      status: null,
      statusText: null,
      latency: Date.now() - startTime,
      size: null,
      headers: {},
      body: null,
      error: err instanceof Error ? err.message : String(err),
      timestamp: Date.now(),
    };
  }
}

export function getStatusColorClass(status: number): { text: string; bg: string; border: string } {
  if (status >= 200 && status < 300) {
    return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  }
  if (status >= 300 && status < 400) {
    return { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' };
  }
  if (status >= 400 && status < 500) {
    return { text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' };
  }
  if (status >= 500) {
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
  }
  return { text: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' };
}
