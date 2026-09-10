import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeSync } from "@/components/layout/ThemeSync";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "BuildCost Connect | Pakistan Construction Cost Intelligence Platform",
  description:
    "Professional civil, structural, and architectural construction cost estimation platform for Pakistani housing societies, builders, and engineers.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BuildCost-PK"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  keywords: [
    "construction cost pakistan",
    "pakistan construction calculator",
    "cement rate islamabad",
    "steel rate lahore",
    "marla to sqft calculator",
    "boq generator pakistan"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200 antialiased selection:bg-emerald-500/20 selection:text-emerald-800">
        <ThemeSync />
        <AppShell>{children}</AppShell>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}

