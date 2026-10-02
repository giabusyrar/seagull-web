import { createBeautyClient } from '@gateway-experience/beauty-sdk/client';

// Rendered per request: the build never calls the gateway.
export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const client = createBeautyClient({
    baseUrl: process.env.BEAUTY_GATEWAY_URL!,
    apiKey: process.env.BEAUTY_API_KEY!,
    brandId: process.env.BEAUTY_BRAND_ID!,
    applicationId: process.env.BEAUTY_APP_ID!,
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
