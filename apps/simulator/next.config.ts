import type { NextConfig } from 'next';
import { serviceRewrites } from './services';

// Screens removed by the single-page redesign; old bookmarks land on the photo page instead of a 404.
const OLD_SCREENS = 'form|score|match|vision|colour|face-arch|assessments|flows|reference|w-colour|w-face|w-skin|w-tryon|conversation|sdk';

const nextConfig: NextConfig = {
  // The screens are TypeScript source in a workspace package.
  transpilePackages: ['@gateway-experience/simulator-kit'],
  async rewrites() { return serviceRewrites(process.env); },
  async redirects() { return [{ source: `/:screen(${OLD_SCREENS})`, destination: '/', permanent: false }]; },
};
export default nextConfig;
