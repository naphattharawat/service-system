"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/base-path";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Never register in dev: a cache-first service worker intercepting
    // every fetch (including HMR/asset requests) causes exactly the kind of
    // "I updated a file but the browser keeps showing the old one" confusion
    // this app hit with a stale-cached logo.png during local testing.
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      // Registering at the basePath (rather than "/") also scopes the worker
      // to just this app, in case something else is deployed at the domain root.
      navigator.serviceWorker.register(withBasePath("/sw.js"), { scope: withBasePath("/") }).catch(() => {});
    }
  }, []);
  return null;
}
