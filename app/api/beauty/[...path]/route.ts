import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';
import { SIM_APP_HEADER, SIM_BRAND_HEADER } from '@/lib/sdk';

type Ctx = { params: Promise<{ path?: string[] }> };

// The SDK proxy requires an API key; core-engine and reference-service do not check it (only the gateway does).
const PLACEHOLDER_API_KEY = 'simulator-no-gateway';

async function handle(req: Request, ctx: Ctx): Promise<Response> {
  const brandId = req.headers.get(SIM_BRAND_HEADER) ?? '';
  const applicationId = req.headers.get(SIM_APP_HEADER) ?? '';
  if (!brandId || !applicationId) return Response.json({ detail: { code: 'pick_brand_and_application' } }, { status: 400 });
  // Fixed self-origin: req.url's Host is client-controlled, so deriving the target from it would let a caller aim the proxy elsewhere.
  const selfUrl = process.env.SIM_SELF_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3100}`;
  const proxy = createBeautyProxy({ gatewayUrl: `${selfUrl}/svc/sdkgw`, apiKey: PLACEHOLDER_API_KEY, brandId, applicationId });
  return req.method === 'POST' ? proxy.POST(req, ctx) : proxy.GET(req, ctx);
}

export const GET = handle;
export const POST = handle;
