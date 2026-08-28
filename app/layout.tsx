import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import localFont from "next/font/local";
import { DarkModeInit } from "@/components/DarkModeInit";
import { OrbBackground } from "@/components/OrbBackground";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { withBasePath } from "@/lib/base-path";
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-kanit",
  display: "swap",
});

// Self-hosted instead of loaded from fonts.gstatic.com at runtime — some
// networks (including this hospital's) allowlist fonts.googleapis.com but
// block fonts.gstatic.com, which silently breaks every icon in the app.
// Run `node scripts/fetch-material-symbols.mjs` to (re-)download the font
// file into app/fonts/ from a machine with normal internet access.
const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  variable: "--font-material-symbols",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เวชนิทัศน์และโสตทัศนศึกษา",
  description: "ระบบขอรับบริการออนไลน์ งานเวชนิทัศน์และโสตทัศนศึกษา โรงพยาบาลเจ้าพระยาอภัยภูเบศร",
  applicationName: "โสตฯ Service",
  appleWebApp: {
    title: "โสตฯ Service",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    icon: [
      { url: withBasePath("/icons/icon-192.png"), sizes: "192x192" },
      { url: withBasePath("/icons/icon-512.png"), sizes: "512x512" },
    ],
    apple: withBasePath("/icons/icon-192.png"),
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f0f4ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} ${materialSymbols.variable}`}>
      <body suppressHydrationWarning>
        <DarkModeInit />
        <OrbBackground />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
