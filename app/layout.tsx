import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import { DarkModeInit } from "@/components/DarkModeInit";
import { OrbBackground } from "@/components/OrbBackground";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "เวชนิทัศน์และโสตทัศนศึกษา",
  description: "ระบบขอรับบริการออนไลน์ งานเวชนิทัศน์และโสตทัศนศึกษา โรงพยาบาลเจ้าพระยาอภัยภูเบศร",
  applicationName: "โสตฯ Service",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "โสตฯ Service",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192" },
      { url: "/icons/icon-512.png", sizes: "512x512" },
    ],
    apple: "/icons/icon-192.png",
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
    <html lang="th" className={kanit.variable}>
      <body suppressHydrationWarning>
        <DarkModeInit />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* App Router root layout is the correct single place for this — the
            no-page-custom-font rule's advice is Pages-Router-specific. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300,0,0&display=swap"
        />
        <OrbBackground />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
