import path from "node:path";
import type { NextConfig } from "next";
import { getGatewayEngineUrl } from "./lib/config/services";

// Turbopack infers the workspace root from the nearest lockfile. This repo has
// no package-lock.json yet (README: it cannot be generated honestly until
// @gateway-experience/contracts is published), so the inference lands outside
// the repo and the build fails. Pin it to the workspace root instead.
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "..", "..");

// Resolved the same way as everywhere else in the app (lib/config/services.ts),
// so the rewrites and the server proxy cannot point at different hosts.
const GATEWAY_ENGINE_URL = getGatewayEngineUrl();

const nextConfig: NextConfig = {
  // Simulator Studio renders the simulator's screens from source.
  transpilePackages: ['@gateway-experience/simulator-kit'],
  // The customer step's country list (simulator-kit location/server.ts) reads
  // its data files from the package's own folder at runtime, which the bundler
  // cannot follow: load it with Node's require instead of bundling it.
  serverExternalPackages: ['@countrystatecity/countries'],
  output: "standalone",
  // …and the standalone build only copies files it can trace, so name that
  // package's data for the one route that reads it. Paths are from apps/web.
  outputFileTracingIncludes: {
    '/api/locations': ['../../node_modules/@countrystatecity/countries/dist/data/**/*'],
  },
  devIndicators: false,
  turbopack: { root: WORKSPACE_ROOT },
  async rewrites() {
    return [
      // 1. /core/* has no rewrite: proxy.ts sends it to lib/proxy-handler.ts,
      //    which picks the data plane of the environment selected in the UI
      //    first (lib/data-plane.ts) and attaches the data-plane key.

      // 2. Reference data (/api/reference/*, /reference-api/*, /api/<entity>)
      //    has no rewrite here: lib/proxy-handler.ts sends it through the
      //    gateway's /reference collection, with the data-plane API key a
      //    rewrite cannot attach.

      // 4. Gateway Engine Endpoints (control plane) - Auth & Collections Management
      {
        source: "/api/v1/auth/:path*",
        destination: `${GATEWAY_ENGINE_URL}/api/v1/auth/:path*`,
      },
      {
        source: "/api/collections",
        destination: `${GATEWAY_ENGINE_URL}/api/collections`,
      },
      {
        source: "/api/collections/:path*",
        destination: `${GATEWAY_ENGINE_URL}/api/collections/:path*`,
      },
      {
        source: "/api/global-environments",
        destination: `${GATEWAY_ENGINE_URL}/api/global-environments`,
      },
      {
        source: "/api/global-environments/:path*",
        destination: `${GATEWAY_ENGINE_URL}/api/global-environments/:path*`,
      },
    ];
  },
};

export default nextConfig;
