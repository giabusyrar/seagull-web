import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';
import { env } from '../../../env';

export const { GET, POST } = createBeautyProxy({
  gatewayUrl: env('BEAUTY_GATEWAY_URL'),
  apiKey: env('BEAUTY_API_KEY'),
  brandId: env('BEAUTY_BRAND_ID'),
  applicationId: env('BEAUTY_APP_ID'),
});
