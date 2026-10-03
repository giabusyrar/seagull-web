import { gatewayUrl, injectScope, matchOperation, type OperationId } from '../client/operations';
import { OPERATION_TIMEOUT_MS } from './timeouts';

export interface BeautyProxyOptions {
  gatewayUrl: string;
  apiKey: string;
  brandId: string;
  applicationId: string;
  /** Return { customerId } from the brand's session, or a Response to refuse.
   *  Without it, customer routes answer 401. */
  authorize?: (req: Request) => Promise<{ customerId?: string } | Response> | { customerId?: string } | Response;
  timeouts?: Partial<Record<OperationId, number>>;
  fetch?: typeof fetch;
}

export type RouteHandler = (req: Request, ctx: { params: Promise<{ path?: string[] }> }) => Promise<Response>;

const problem = (status: number, code: string) =>
  new Response(JSON.stringify({ detail: { code } }), { status, headers: { 'content-type': 'application/json' } });

// Only these response headers reach the browser; nothing from the gateway
// that could carry cookies or credentials.
// content-length and content-encoding are left out on purpose: fetch has
// already decoded the body, so the upstream values would no longer describe it.
const PASS_HEADERS = ['content-type', 'content-disposition', 'cache-control'];

/**
 * The brand's server-side door to the gateway, for
 * app/api/beauty/[...path]/route.ts:
 *   export const { GET, POST } = createBeautyProxy({ ... });
 * Forwards only the SDK's operations, writes brand/application (and the
 * signed-in customer) itself, adds the API key, and streams bodies through.
 */
export function createBeautyProxy(opts: BeautyProxyOptions): { GET: RouteHandler; POST: RouteHandler } {
  for (const field of ['gatewayUrl', 'apiKey', 'brandId', 'applicationId'] as const) {
    const v = opts[field];
    if (typeof v !== 'string' || !v.trim()) {
      throw new Error(`createBeautyProxy: "${field}" is required and must not be empty (is its environment variable set?)`);
    }
  }
  const base = opts.gatewayUrl.replace(/\/+$/, '');
  const doFetch = opts.fetch ?? fetch;

  const handle: RouteHandler = async (req, ctx) => {
    const segments = (await ctx.params).path ?? [];
    const match = matchOperation(req.method, `/${segments.join('/')}`);
    if (!match) return problem(404, 'not_found');
    const { op, params } = match;

    let customerId: string | undefined;
    if (opts.authorize) {
      // A throwing authorize means the brand could not establish who this is:
      // refuse, never fall through unauthenticated.
      let auth: Awaited<ReturnType<NonNullable<typeof opts.authorize>>>;
      try {
        auth = await opts.authorize(req);
      } catch {
        return problem(401, 'authorize_failed');
      }
      if (auth instanceof Response) return auth;
      customerId = auth.customerId;
    }
    if (op.customer && !customerId) return problem(401, 'customer_required');

    const scope = { brandId: opts.brandId, applicationId: opts.applicationId, customerId };
    const query = new URLSearchParams();
    for (const [k, v] of new URL(req.url).searchParams) if (op.query.includes(k)) query.append(k, v);
    const search = query.size ? `?${query}` : '';
    let path: string;
    try {
      path = gatewayUrl(op, params, scope);
    } catch {
      return problem(400, 'invalid_params');
    }
    const url = `${base}${path}${search}`;

    const headers = new Headers({ 'x-api-key': opts.apiKey });
    const accept = req.headers.get('accept');
    if (accept) headers.set('accept', accept);

    let body: BodyInit | undefined;
    if (op.method === 'POST') {
      try {
        if (op.scope === 'json') {
          headers.set('content-type', 'application/json');
          body = JSON.stringify(injectScope(op, (await req.json()) as Record<string, unknown>, scope));
        } else if (op.scope === 'multipart') {
          body = injectScope(op, await req.formData(), scope) as FormData;
        } else {
          const type = req.headers.get('content-type');
          if (type) headers.set('content-type', type);
          body = req.body ?? undefined;
        }
      } catch {
        // A body the proxy cannot read for this operation is the caller's
        // fault; never forward it unscoped.
        return problem(400, 'invalid_body');
      }
    }

    const timeout = opts.timeouts?.[op.id] ?? OPERATION_TIMEOUT_MS[op.id];
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(timeout)]);
    let upstream: Response;
    try {
      upstream = await doFetch(url, { method: op.method, headers, body, signal, duplex: 'half' } as RequestInit);
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError') && !req.signal.aborted) return problem(504, 'timeout');
      return problem(502, 'gateway_unreachable');
    }

    const out = new Headers();
    for (const h of PASS_HEADERS) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  };

  return { GET: handle, POST: handle };
}
