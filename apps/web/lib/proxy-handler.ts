import { NextRequest, NextResponse } from 'next/server';
import {
  getGatewayEngineUrl,
  getGatewayProxyUrl,
  getReferenceServiceUrl,
  getVisionAiWorkerUrl,
} from '@/lib/config/services';

// core-engine's own mounts. It is reached only through the gateway data plane
// as /core/<module>/..., never directly; see the branch that answers these.
const DIRECT_CORE_ENGINE_PATH = /^(api\/(scoring|matching|vision)|v1\/survey)(\/|$)/;

const REFERENCE_ENTITIES = new Set([
  'brands',
  'ingredients',
  'dimensions',
  'conditions',
  'statuses',
  'applications',
  'skin-conditions',
]);

export async function handleApiProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  pathPrefix = ''
) {
  let targetUrl = '';
  try {
    const resolvedParams = await context.params;
    let rawPath = resolvedParams.path ? resolvedParams.path.join('/') : '';

    try {
      rawPath = decodeURIComponent(rawPath);
    } catch {}

    const fullPath = pathPrefix ? `${pathPrefix}/${rawPath}` : rawPath;

    // Strip template variables like {{global.host}}, {{host}}, or http://... from proxy path
    const cleanPath = fullPath
      .replace(/^\{\{\s*[a-zA-Z0-9_$.\:]+\s*\}\}\/?/, '')
      .replace(/^https?:\/\/[^\/]+\/?/, '')
      .replace(/^\/+/, '');

    const search = request.nextUrl.search;
    const headers: Record<string, string> = {};
    // Server-side only: this runs in a route handler, so the key never needs a
    // NEXT_PUBLIC_ variant — that would inline it into the browser bundle.
    const dataPlaneKey = process.env.GATEWAY_API_KEY || '';

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      targetUrl = `${cleanPath}${search}`;
    } else if (cleanPath === 'core' || cleanPath.startsWith('core/')) {
      // Dynamic core-engine collection — hits the gateway-proxy data plane (:8080)
      targetUrl = `${getGatewayProxyUrl()}/${cleanPath}${search}`;
      if (dataPlaneKey) headers['x-api-key'] = dataPlaneKey;
    } else if (
      cleanPath.startsWith('api/reference/') ||
      cleanPath.startsWith('reference-api/') ||
      cleanPath === 'api/reference' ||
      cleanPath === 'reference-api'
    ) {
      const subPath = cleanPath.replace(/^(api\/reference|reference-api)\/?/, '');
      targetUrl = `${getReferenceServiceUrl()}/api/reference${subPath ? `/${subPath}` : ''}${search}`;
    } else if (cleanPath.startsWith('api/') && REFERENCE_ENTITIES.has(cleanPath.replace(/^api\//, '').split('/')[0])) {
      const subPath = cleanPath.replace(/^api\//, '');
      targetUrl = `${getReferenceServiceUrl()}/api/reference/${subPath}${search}`;
    } else if (cleanPath.startsWith('api/vision-worker/')) {
      // Vision AI Worker (Python, :8088) — model registry upload/download/dispatch
      const subPath = cleanPath.replace(/^api\/vision-worker\//, '');
      targetUrl = `${getVisionAiWorkerUrl()}/api/v1/${subPath}${search}`;
    } else if (DIRECT_CORE_ENGINE_PATH.test(cleanPath)) {
      // These used to go straight to a local core-engine. There is no direct
      // route any more; say where the endpoint lives rather than forwarding
      // it to a service that would answer with an unrelated 404.
      return NextResponse.json(
        {
          success: false,
          error: `/${cleanPath} is a core-engine path, and core-engine is only reachable through the gateway: call /core/<module>/... (score-engine, match-engine, vision-engine, form-engine).`,
        },
        { status: 410 },
      );
    } else if (cleanPath.startsWith('api/')) {
      // Gateway Engine Control Plane (:8081) — Admin, Collections, Auth, Environments, Users, etc.
      targetUrl = `${getGatewayEngineUrl()}/${cleanPath}${search}`;
    } else {
      // Any other custom collection path (e.g. /nasa/*, /weather/*) -> Gateway Proxy Data Plane (:8080)
      targetUrl = `${getGatewayProxyUrl()}/${cleanPath}${search}`;
      if (dataPlaneKey) headers['x-api-key'] = dataPlaneKey;
    }

    // Keys are lowercased so an explicit header here cleanly overwrites the
    // auto-attached defaults above (e.g. x-api-key) instead of sitting
    // alongside them as a second, differently-cased entry. An empty value is
    // treated as "not sent" rather than "sent as blank" — a client UI whose
    // own key field happens to be empty (e.g. Try & Send's sessionStorage-
    // backed X-API-Key, empty on a fresh tab) must not blank out the
    // server-side default; only a genuinely non-empty client value overrides it.
    request.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (value === '') return;
      if (k === 'authorization' || k === 'content-type' || k.startsWith('x-')) {
        headers[k] = value;
      }
    });

    // Auto-forward session cookie as Bearer token if not explicitly present
    if (!headers['authorization']) {
      const sessionCookie = request.cookies.get('session')?.value;
      if (sessionCookie) {
        headers['authorization'] = `Bearer ${sessionCookie}`;
      }
    }

    // ArrayBuffer (not text()) to pass binary bodies (file uploads, multipart/form-data)
    // through untouched — decoding as text would corrupt any non-UTF-8 bytes.
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    // ArrayBuffer (not text()) on the way back too: binary responses such as
    // the colour engine's try-on PNG are corrupted by a UTF-8 round trip.
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err: any) {
    const errorMsg = err instanceof Error ? err.message : 'Backend connection error';
    console.error(`[API Proxy] ${request.method} -> ${targetUrl || request.nextUrl.pathname} failed:`, errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg === 'fetch failed' ? `Service connection failed: backend at ${targetUrl || 'target endpoint'} is unreachable. Ensure backend services are running.` : errorMsg,
      },
      { status: 502 }
    );
  }
}
