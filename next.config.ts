import type { NextConfig } from 'next';
import { serviceRewrites } from './lib/services';
const nextConfig: NextConfig = { async rewrites() { return serviceRewrites(process.env); } };
export default nextConfig;
