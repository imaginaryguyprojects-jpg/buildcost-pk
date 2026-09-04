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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
