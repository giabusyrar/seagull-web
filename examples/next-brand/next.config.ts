import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // This app has its own lockfile; keep Turbopack from adopting the monorepo root.
  turbopack: { root: path.resolve(import.meta.dirname) },
};

export default config;
