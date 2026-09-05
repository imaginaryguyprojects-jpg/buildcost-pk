"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import { formatNumber } from "@/lib/formatters";

interface ProFeatureLockProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  capabilities: string[];
  backUrl?: string;
  backLabel?: string;
  minHeight?: string;
}

export function ProFeatureLock({
  title,
  subtitle = "Available with PRO",
  badgeText = "PRO FEATURE",
  capabilities,
  backUrl,
  backLabel = "Continue with Free Calculators",
  minHeight = "min-h-[420px]"
}: ProFeatureLockProps) {
  const router = useRouter();
  const { openUpgradeModal } = useAuthStore();
  const { proMonthlyRate } = useSystemSettingsStore();

  return (
    <div
      className={`w-full ${minHeight} flex items-center justify-center p-4 sm:p-8`}
    >
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 text-center space-y-6 relative">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Lock Icon & Badge */}
        <div className="space-y-3 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{badgeText}</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Capabilities List */}
        <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 text-left space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Included in this module:
          </div>
          <ul className="space-y-2 text-xs">
            {capabilities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Pricing Callout */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Starting from{" "}
          <span className="font-extrabold text-slate-900 dark:text-white">
            PKR {formatNumber(proMonthlyRate)}
          </span>{" "}
          / month
        </div>

        {/* Primary & Secondary Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => openUpgradeModal(title)}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade to PRO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Unlock this and 25+ other professional construction management tools.
          </p>

          <div className="pt-2">
            {backUrl ? (
              <Link
                href={backUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{backLabel}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
