import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "BuildCost Connect | Pakistan Construction Cost Intelligence Platform",
  description:
    "Professional civil, structural, and architectural construction cost estimation platform for Pakistani housing societies, builders, and engineers.",
  keywords: [
    "construction cost pakistan",
    "pakistan construction calculator",
    "cement rate islamabad",
    "steel rate lahore",
    "marla to sqft calculator",
    "boq generator pakistan"
  ]
};

import { ThemeSync } from "@/components/layout/ThemeSync";

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
      </body>
    </html>
  );
}
