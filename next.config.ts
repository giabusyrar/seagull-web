import type { NextConfig } from 'next';
import { sdkGatewayRewrites, serviceRewrites } from './lib/services';
const nextConfig: NextConfig = { async rewrites() { return [...sdkGatewayRewrites(process.env), ...serviceRewrites(process.env)]; } };
export default nextConfig;
