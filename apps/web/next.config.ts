import path from "node:path";
import type { NextConfig } from "next";

// Turbopack infers the workspace root from the nearest lockfile. This repo has
// no package-lock.json yet (README: it cannot be generated honestly until
// @gateway-experience/contracts is published), so the inference lands outside
// the repo and the build fails. Pin it to the workspace root instead.
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "..", "..");

const baseHost = process.env.SERVICE_BASE_HOST || "127.0.0.1";
const protocol = process.env.SERVICE_PROTOCOL || "http";

const REFERENCE_SERVICE_URL =
  process.env.REFERENCE_SERVICE_URL ||
  `${protocol}://${baseHost}:${process.env.REFERENCE_SERVICE_PORT || "8086"}`;

const GATEWAY_ENGINE_URL =
  process.env.GATEWAY_ENGINE_URL ||
  `${protocol}://${baseHost}:${process.env.GATEWAY_ENGINE_PORT || "8081"}`;

const GATEWAY_PROXY_URL =
  process.env.GATEWAY_PROXY_URL ||
  `${protocol}://${baseHost}:${process.env.GATEWAY_PROXY_PORT || "8080"}`;

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: { root: WORKSPACE_ROOT },
  async rewrites() {
    return [
      // 1. Dynamic API Gateway Collection Proxy Data Plane (:8080)
      //    core-engine is reached only through here (/core/<module>/...);
      //    the dashboard has no direct route to it.
      {
        source: "/core/:path*",
        destination: `${GATEWAY_PROXY_URL}/core/:path*`,
      },

      // 2. Reference Service Endpoints (:8086)
      {
        source: "/api/reference/:path*",
        destination: `${REFERENCE_SERVICE_URL}/api/reference/:path*`,
      },
      {
        source: "/reference-api/:path*",
        destination: `${REFERENCE_SERVICE_URL}/api/reference/:path*`,
      },
      // Backward-compatible entity aliases to Reference Service
      {
        source: "/api/:entity(brands|ingredients|dimensions|conditions|statuses|applications|skin-conditions)/:path*",
        destination: `${REFERENCE_SERVICE_URL}/api/reference/:entity/:path*`,
      },
      {
        source: "/api/:entity(brands|ingredients|dimensions|conditions|statuses|applications|skin-conditions)",
        destination: `${REFERENCE_SERVICE_URL}/api/reference/:entity`,
      },

      // 4. Gateway Engine Endpoints (:8081) - Auth & Collections Management
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
