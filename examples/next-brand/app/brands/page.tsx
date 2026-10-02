import { createBeautyClient } from '@gateway-experience/beauty-sdk/client';
import { env } from '../env';

// Rendered per request: the build never calls the gateway.
export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const client = createBeautyClient({
    baseUrl: env('BEAUTY_GATEWAY_URL'),
    apiKey: env('BEAUTY_API_KEY'),
    brandId: env('BEAUTY_BRAND_ID'),
    applicationId: env('BEAUTY_APP_ID'),
  });
  const brands = await client.reference.brands();
  return (
    <ul>
      {brands.map((b) => (
        <li key={b.id}>{b.name}</li>
      ))}
    </ul>
  );
}
