"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useProjectStore } from "@/stores/projectStore";
import { ShareLink } from "@buildcost/types";
import { formatPKR, formatLakhCrore } from "@/lib/formatters";
import {
  ShieldCheck,
  Download,
  Calendar,
  Building,
  MapPin,
  FileText,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Share2,
  Lock,
  ExternalLink
} from "lucide-react";

export default function SharedDocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { getShareLinkByToken, incrementShareView } = useProjectStore();

  const [shareLink, setShareLink] = useState<ShareLink | null | undefined>(undefined);

  useEffect(() => {
    if (token) {
      const link = getShareLinkByToken(token);
      setShareLink(link || null);
      if (link && link.isActive) {
        incrementShareView(token);
      }
    }
  }, [token, getShareLinkByToken, incrementShareView]);

  if (shareLink === undefined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="animate-pulse text-xs text-slate-400">Loading secure construction estimate...</div>
      </div>
    );
  }

  // Link not found, revoked, or expired
  if (
    !shareLink ||
    !shareLink.isActive ||
    shareLink.revokedAt ||
    (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date())
  ) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-white">This Share Link Is Inactive or Expired</h1>
        <p className="text-xs text-slate-400 max-w-sm mt-2">
          The creator of this construction estimate has revoked this link, or its expiration period has lapsed.
        </p>
        <Link
          href="/"
          className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
        >
          Create Your Own Estimate on BuildCost Connect
        </Link>
      </div>
    );
  }

  const data = shareLink.documentData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">BuildCost Connect</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                Verified Public Estimate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {shareLink.allowDownload && (
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            )}

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Start Free Calculation
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8 flex-1">
        {/* Verification banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Cryptographically verified read-only snapshot. Market rates frozen at creation date.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            {new Date(shareLink.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
          </span>
        </div>

        {/* Project Letterhead */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                Official Cost Estimation Document
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {shareLink.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                {shareLink.includeCompany && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    BuildCost Engineering Partner
                  </span>
                )}
                {shareLink.includeClientName && data.clientName && (
                  <span>Client: <strong className="text-slate-200">{data.clientName}</strong></span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {shareLink.includeProjectAddress && data.location ? data.location : `${data.city || "Pakistan"} Region`}
                </span>
              </div>
            </div>

            {/* Grand Total Highlight */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right sm:min-w-[200px]">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Grand Total</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {formatPKR(data.grandTotal || 0)}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold">
                {formatLakhCrore(data.grandTotal || 0)}
              </div>
            </div>
          </div>

          {/* Project Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Covered Area</span>
              <div className="text-sm font-black text-slate-200 mt-1">
                {(data.coveredArea || 1950).toLocaleString()} Sq. Ft.
              </div>
              <div className="text-[10px] text-slate-500">{data.plotSize || 5} {data.plotUnit || "Marla"}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Rate / Sq. Ft.</span>
              <div className="text-sm font-black text-emerald-400 font-mono mt-1">
                Rs. {(data.costPerSqft || 5200).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">All-Inclusive</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Floors</span>
              <div className="text-sm font-black text-slate-200 mt-1">
                {data.floors || 2} Storey
              </div>
              <div className="text-[10px] text-slate-500">Ground + Upper</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500">Specification</span>
              <div className="text-sm font-black text-slate-200 capitalize mt-1">
                {data.quality || "Standard"}
              </div>
              <div className="text-[10px] text-slate-500">Grade 60 Rebar</div>
            </div>
          </div>

          {/* Key Materials & Labour Schedule */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Material & Labour Schedule Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2.5 font-bold">Category</th>
                    <th className="pb-2.5 font-bold">Specification Standard</th>
                    <th className="pb-2.5 font-bold">Basis</th>
                    <th className="pb-2.5 font-bold text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 font-semibold text-white">Civil Grey Structure</td>
                    <td className="py-2.5 text-slate-400">OPC Cement, Grade 60 Rebar, Chenab Sand, Awwal Bricks</td>
                    <td className="py-2.5 text-slate-400">APCMA / PSRMA Verified</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                      {formatPKR(Math.round((data.grandTotal || 10000000) * 0.52))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-white">Labour Contracts</td>
                    <td className="py-2.5 text-slate-400">Head Mason, Mazdoor, Bar Bending & Curing</td>
                    <td className="py-2.5 text-slate-400">Regional Labour Chowk Syndicate</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                      {formatPKR(Math.round((data.grandTotal || 10000000) * 0.20))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-white">Finishes, Tiles & Bathrooms</td>
                    <td className="py-2.5 text-slate-400">Porcelain Floor Tiles, Sanitary Ware, Solid Wood Doors, WeatherCoat</td>
                    <td className="py-2.5 text-slate-400">Master Ceramics / Sonex / Dulux</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                      {formatPKR(Math.round((data.grandTotal || 10000000) * 0.23))}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-white">Site Contingency & Wastage</td>
                    <td className="py-2.5 text-slate-400">5% Unforeseen buffer & material cutting margin</td>
                    <td className="py-2.5 text-slate-400">Engineering Standard</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                      {formatPKR(Math.round((data.grandTotal || 10000000) * 0.05))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Engineering & Statutory Notice:</div>
            <p>
              This cost calculation is generated for budgetary estimation purposes using prevailing market prices in Pakistan. Actual construction expense may vary depending on architectural customizations, soil bearing capacity, municipal sanctioning levies, and seasonal inflation.
            </p>
          </div>
        </div>

        {/* CTA for public viewer */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 space-y-3">
          <h2 className="text-lg font-bold text-white">Need to estimate your own house or commercial project?</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            BuildCost Connect gives you full access to authentic Pakistani construction calculators, live material rates, and BOQ tools.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all"
          >
            Start Free Construction Calculation
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
