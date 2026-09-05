"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import { formatNumber } from "@/lib/formatters";

export function DashboardProCard() {
  const { user, openUpgradeModal } = useAuthStore();
  const { proMonthlyRate, upgradeBannerVisible, promotionalHeadline } = useSystemSettingsStore();

  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";

  // If user is already Pro, show a clean, elegant Pro Member status card instead of an ad!
  if (isPro) {
    return (
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/40 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">PRO MEMBER</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full site intelligence, unlimited projects, and contractor features enabled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              Subscription Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin banner toggle check
  if (!upgradeBannerVisible) return null;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/30 shadow-lg relative overflow-hidden">
      {/* Decorative subtle ambient highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 space-y-5">
        {/* Header with Title and Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🚀</span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                UNLOCK MORE WITH PRO
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {promotionalHeadline || "Build smarter. Estimate better."}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-[11px] text-slate-400">Starting from</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              PKR {formatNumber(proMonthlyRate)}{" "}
              <span className="text-[10px] text-slate-400 font-normal">/ month</span>
            </div>
          </div>
        </div>

        {/* Feature Grid: 2 Columns on Desktop, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Advanced Material Market Rates</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Unlimited Projects</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Vendor &amp; Purchase Management</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Transport &amp; Delivery Calculator</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Estimate vs Actual Cost</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Advanced BOQ &amp; Reports</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Price Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>AI Construction Advisor</span>
            </div>
          </div>
        </div>

        {/* Action Button & Price Footnote */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => openUpgradeModal("Dashboard Pro Upgrade")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade to PRO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
            Starting from{" "}
            <span className="font-extrabold text-slate-900 dark:text-white">
              PKR {formatNumber(proMonthlyRate)}
            </span>{" "}
            / month
          </div>
        </div>
      </div>
    </div>
  );
}
