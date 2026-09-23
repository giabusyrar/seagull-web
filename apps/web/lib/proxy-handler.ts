import { NextRequest, NextResponse } from 'next/server';
import {
  getGatewayEngineUrl,
  getGatewayProxyUrl,
  getCoreEngineUrl,
  getReferenceServiceUrl,
  getVisionAiWorkerUrl,
} from '@/lib/config/services';

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
    const dataPlaneKey = process.env.GATEWAY_API_KEY || process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '';

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
    } else if (
      cleanPath.startsWith('api/scoring') ||
      cleanPath.startsWith('api/matching') ||
      cleanPath.startsWith('api/vision') ||
      cleanPath.startsWith('v1/survey')
    ) {
      targetUrl = `${getCoreEngineUrl()}/${cleanPath}${search}`;
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

    const data = await res.text();
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
