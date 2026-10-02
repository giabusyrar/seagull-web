import { parseApiError } from './errors';
import { OPERATIONS, gatewayUrl, injectScope, sdkUrl, type OperationId, type Scope } from './operations';
import { referenceMethods, type ReferenceMethods } from './reference';

export interface BeautyClientOptions {
  /** Browser: the proxy route (e.g. "/api/beauty"). Server: the gateway url. */
  baseUrl: string;
  /** Server only. With a key the client talks to the gateway directly. */
  apiKey?: string;
  brandId?: string;
  applicationId?: string;
  customerId?: string;
  fetch?: typeof fetch;
}

export interface CallInit {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: FormData | Record<string, unknown>;
  signal?: AbortSignal;
}

export interface BeautyClient {
  call(id: OperationId, init?: CallInit): Promise<Response>;
  json<T>(id: OperationId, init?: CallInit): Promise<T>;
  binary(id: OperationId, init?: CallInit): Promise<ArrayBuffer>;
  reference: ReferenceMethods;
}

export function createBeautyClient(opts: BeautyClientOptions): BeautyClient {
  const direct = !!opts.apiKey;
  if (direct && typeof window !== 'undefined') {
    throw new Error('createBeautyClient: an apiKey may only be used on the server. In the browser, pass the proxy route as baseUrl.');
  }
  const base = opts.baseUrl.replace(/\/+$/, '');
  const doFetch = opts.fetch ?? fetch;
  const scope: Scope = { brandId: opts.brandId ?? '', applicationId: opts.applicationId ?? '', customerId: opts.customerId };

  const call = async (id: OperationId, init: CallInit = {}): Promise<Response> => {
    const op = OPERATIONS.find((o) => o.id === id);
    if (!op) throw new Error(`Unknown operation ${id}`);
    const params = init.params ?? {};
    const path = direct ? gatewayUrl(op, params, scope) : sdkUrl(op, params);
    const qs = init.query && Object.keys(init.query).length ? `?${new URLSearchParams(init.query)}` : '';
    const body = direct ? injectScope(op, init.body, scope) : init.body;
    const headers = new Headers();
    if (direct) headers.set('x-api-key', opts.apiKey!);
    let payload: BodyInit | undefined;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers.set('content-type', 'application/json');
      payload = JSON.stringify(body);
    }
    return doFetch(`${base}${path}${qs}`, { method: op.method, headers, body: payload, signal: init.signal });
  };

  const checked = async (id: OperationId, init?: CallInit) => {
    const res = await call(id, init);
    if (!res.ok) throw await parseApiError(res);
    return res;
  };

  const client: BeautyClient = {
    call,
    json: async <T>(id: OperationId, init?: CallInit) => (await (await checked(id, init)).json()) as T,
    binary: async (id: OperationId, init?: CallInit) => (await checked(id, init)).arrayBuffer(),
    reference: undefined as unknown as ReferenceMethods,
  };
  client.reference = referenceMethods(client);
  return client;
}
