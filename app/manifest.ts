import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/base-path";

// Generated (not a static public/manifest.json) specifically so icon/start
// URLs can be prefixed with BASE_PATH when deployed under a sub-path
// (e.g. https://m.cpa.go.th/service-system/) — Next does not rewrite the
// contents of a static manifest file the way it rewrites <Link> hrefs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "โสตฯ Service",
    short_name: "โสตฯ Service",
    description: "ระบบขอรับบริการออนไลน์ งานเวชนิทัศน์และโสตทัศนศึกษา",
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#f0f4ff",
    theme_color: "#f0f4ff",
    icons: [
      { src: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
