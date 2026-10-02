import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';

const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} is not set (see .env.example)`);
  return v;
};

export const { GET, POST } = createBeautyProxy({
  gatewayUrl: env('BEAUTY_GATEWAY_URL'),
  apiKey: env('BEAUTY_API_KEY'),
  brandId: env('BEAUTY_BRAND_ID'),
  applicationId: env('BEAUTY_APP_ID'),
});
