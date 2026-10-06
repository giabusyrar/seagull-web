import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip static assets, Next.js internal files, favicon, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Skip this app's own API routes (/api/auth/*, /api/locations) and proxy endpoints (/backend-api/*)
  if (pathname.startsWith('/api/auth/') || pathname === '/api/locations' || pathname.startsWith('/backend-api/')) {
    return NextResponse.next();
  }

  // 3. Known Frontend UI Pages & HTML Navigation
  const isWebUiPage =
    pathname === '/' ||
    pathname === '/api-client' ||
    pathname === '/login' ||
    pathname === '/forms' ||
    pathname.startsWith('/forms/') ||
    pathname === '/matching' ||
    pathname === '/reference' ||
    pathname === '/scoring' ||
    pathname === '/assessments' ||
    pathname === '/colour-analysis';

  const accept = request.headers.get('accept') || '';
  const isHtmlNavigation = accept.includes('text/html');

  // If visiting a known Web UI page OR browser HTML navigation for root/web pages
  if (isWebUiPage || isHtmlNavigation) {
    return NextResponse.next();
  }

  // 4. Dynamic API Proxy Routing (for ALL custom collection routes /v1/*, /v2/*, /v3/*, /nasa/*, /weather/*, /anything/*)
  // Rewrite request to /backend-api/... so handleApiProxy executes it dynamically without hardcoding prefixes
  const proxyUrl = new URL(`/backend-api${pathname}${search}`, request.url);
  return NextResponse.rewrite(proxyUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
