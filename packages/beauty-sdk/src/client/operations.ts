// The one list of what the SDK may call. The browser client builds SDK
// urls from it; the proxy matches incoming requests against it and builds
// the gateway request from it; the server-side direct client does the same.
// Gateway paths are the data-plane paths the dashboard uses today
// (apps/web/lib/proxy-handler.ts): core modules under /core/<module>/...,
// reference-service under /reference/....

export type OperationId =
  | 'colour.analyze'
  | 'colour.tryOn'
  | 'colour.catalog'
  | 'face.analyze'
  | 'face.head'
  | 'skin.analyze'
  | 'reference.brands'
  | 'reference.products'
  | 'forms.evaluate'
  | 'assessments.history';

/** Where brand and application go: the gateway path, a JSON body
 *  (brand_id / application_id), a multipart body (brandId / applicationId),
 *  or nowhere. */
export type ScopePlacement = 'none' | 'path' | 'json' | 'multipart';

export interface Operation {
  id: OperationId;
  method: 'GET' | 'POST';
  /** Path under the SDK base url; `:name` segments come from the caller. */
  sdkPath: string;
  /** Gateway path; `{brandId}`, `{applicationId}`, `{customerId}` come from the
   *  scope, `:name` from the caller. */
  gatewayPath: string;
  scope: ScopePlacement;
  /** Needs a signed-in customer (authorize must return a customerId). */
  customer: boolean;
}

export const OPERATIONS: readonly Operation[] = [
  { id: 'colour.analyze', method: 'POST', sdkPath: '/colour/analyze', gatewayPath: '/core/colour-engine/analyze', scope: 'none', customer: false },
  { id: 'colour.tryOn', method: 'POST', sdkPath: '/colour/tryon', gatewayPath: '/core/colour-engine/tryon', scope: 'none', customer: false },
  { id: 'colour.catalog', method: 'GET', sdkPath: '/colour/catalog', gatewayPath: '/core/colour-engine/catalog', scope: 'none', customer: false },
  { id: 'face.analyze', method: 'POST', sdkPath: '/face/analyze', gatewayPath: '/core/vision-engine/face-architecture/{brandId}/{applicationId}', scope: 'path', customer: false },
  { id: 'face.head', method: 'POST', sdkPath: '/face/head', gatewayPath: '/core/vision-engine/face-architecture/{brandId}/{applicationId}/head', scope: 'path', customer: false },
  { id: 'skin.analyze', method: 'POST', sdkPath: '/skin/analyze', gatewayPath: '/core/vision-engine/analyze-image', scope: 'multipart', customer: false },
  { id: 'reference.brands', method: 'GET', sdkPath: '/reference/brands', gatewayPath: '/reference/brands', scope: 'none', customer: false },
  { id: 'reference.products', method: 'GET', sdkPath: '/reference/products', gatewayPath: '/reference/products', scope: 'none', customer: false },
  { id: 'forms.evaluate', method: 'POST', sdkPath: '/forms/:code/evaluate', gatewayPath: '/core/form-engine/survey/:code/evaluate', scope: 'json', customer: false },
  { id: 'assessments.history', method: 'GET', sdkPath: '/assessments/history', gatewayPath: '/core/assessments/customers/{customerId}', scope: 'none', customer: true },
];

export interface Scope {
  brandId: string;
  applicationId: string;
  customerId?: string;
}

const split = (p: string) => p.split('/').filter(Boolean);

/** Check if a value is safe for use as a path parameter: not '.', '..' or containing '/' or '\' */
function isSafePathParam(value: string): boolean {
  if (value === '.' || value === '..') return false;
  if (value.includes('/') || value.includes('\\')) return false;
  return true;
}

/** Check if a value is safe for use as a scope value: not '.' or '..' */
function isSafeScopeValue(value: string): boolean {
  if (value === '.' || value === '..') return false;
  return true;
}

export function matchOperation(method: string, path: string): { op: Operation; params: Record<string, string> } | null {
  const segs = split(path);
  for (const op of OPERATIONS) {
    if (op.method !== method.toUpperCase()) continue;
    const pat = split(op.sdkPath);
    if (pat.length !== segs.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < pat.length && ok; i++) {
      if (pat[i].startsWith(':')) {
        try {
          const decoded = decodeURIComponent(segs[i]);
          if (!isSafePathParam(decoded)) {
            ok = false;
          } else {
            params[pat[i].slice(1)] = decoded;
          }
        } catch {
          // Malformed percent-encoding
          return null;
        }
      } else {
        ok = pat[i] === segs[i];
      }
    }
    if (ok) return { op, params };
  }
  return null;
}

const fillParams = (path: string, params: Record<string, string>) =>
  path.replace(/:([A-Za-z]+)/g, (_, k: string) => {
    if (!(k in params)) throw new Error(`Missing path parameter "${k}"`);
    const value = params[k];
    if (!isSafePathParam(value)) throw new Error(`Unsafe path parameter: "${k}"`);
    return encodeURIComponent(value);
  });

export function sdkUrl(op: Operation, params: Record<string, string>): string {
  return fillParams(op.sdkPath, params);
}

export function gatewayUrl(op: Operation, params: Record<string, string>, scope: Scope): string {
  const withScope = op.gatewayPath.replace(/\{(brandId|applicationId|customerId)\}/g, (_, k: keyof Scope) => {
    const v = scope[k];
    if (!v) throw new Error(`Missing scope "${k}" for ${op.id}`);
    if (!isSafeScopeValue(v)) throw new Error(`Unsafe scope "${k}": "${v}"`);
    return encodeURIComponent(v);
  });
  return fillParams(withScope, params);
}

export function injectScope(
  op: Operation,
  body: FormData | Record<string, unknown> | undefined,
  scope: Scope,
): FormData | Record<string, unknown> | undefined {
  if (op.scope === 'json') {
    if (body instanceof FormData) {
      throw new Error(`${op.id} requires JSON body, got FormData`);
    }
    return { ...(body as Record<string, unknown>), brand_id: scope.brandId, application_id: scope.applicationId };
  }
  if (op.scope === 'multipart') {
    if (!(body instanceof FormData)) {
      throw new Error(`${op.id} requires FormData body`);
    }
    // Create a new FormData to avoid mutating the input
    const newFormData = new FormData();
    for (const [key, value] of body) {
      newFormData.set(key, value);
    }
    newFormData.set('brandId', scope.brandId);
    newFormData.set('applicationId', scope.applicationId);
    return newFormData;
  }
  return body;
}
