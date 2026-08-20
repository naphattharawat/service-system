// First-party service worker (replaces the legacy app's hot-linked
// cpamav/mav-smart-service/sw.js). Only ever registered in production (see
// components/ServiceWorkerRegister.tsx) — never in dev, where a caching
// service worker just causes "why isn't my change showing up" confusion.
//
// Static assets: stale-while-revalidate — serve the cached copy instantly if
// there is one, but always also fetch in the background and update the
// cache, so an updated asset shows up on the *next* load instead of being
// stuck behind the old one indefinitely (pure cache-first previously served
// a stale logo.png forever until the CACHE name below was bumped by hand).
// API calls: network-first, falling back to cache only if fully offline.
const CACHE = "mav-service-v1";
const PRECACHE_URLS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);

      if (cached) {
        void network; // update the cache in the background, don't block on it
        return cached;
      }
      return (await network) || Response.error();
    })
  );
});
