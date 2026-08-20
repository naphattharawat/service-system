import type { NextConfig } from "next";

// Set when the app is deployed under a sub-path (e.g. https://m.cpa.go.th/service-system/)
// instead of a domain root. Must stay in sync with lib/base-path.ts, which
// re-exports the same value for use in client code (fetch URLs, <img> src,
// the service worker) that Next's basePath rewriting doesn't reach — see
// https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
