// Must match `basePath` in next.config.ts. Next only auto-prefixes
// <Link>/router navigation with basePath — plain <img src>, fetch() calls,
// and the service worker's own path matching all need it added manually.
// NEXT_PUBLIC_ vars are inlined at build time, so this works in both
// server and client code.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
