"use client";

import React from "react";
import { Lock, Sparkles, Check, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface ProPreviewCardProps {
  title?: string;
  previewPoints?: string[];
  featureKey?: string;
  className?: string;
}

export function ProPreviewCard({
  title = "Unlock Advanced Market Intelligence",
  previewPoints = [
    "Compare rates from multiple cities and suppliers",
    "View historical price trends (30d / 90d / 1y)",
    "Set automated price alerts & notifications",
    "Compare delivered cost with freight & loading"
  ],
  featureKey = "Market Rates Intelligence",
  className
}: ProPreviewCardProps) {
  const { openUpgradeModal } = useAuthStore();

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900/90 dark:to-emerald-950/20 border border-emerald-500/30 shadow-xs relative overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
              <Lock className="w-2.5 h-2.5" />
              <span>PRO FEATURE</span>
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            {previewPoints.map((pt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => openUpgradeModal(featureKey)}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Upgrade to Unlock</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
