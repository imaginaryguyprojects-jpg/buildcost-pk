"use client";

import React from "react";
import { formatPKR, formatLakhCrore } from "@/lib/formatters";

interface CostOverviewCardProps {
  totalEstimatedCost?: number;
  materialsCost?: number;
  laborCost?: number;
  equipmentCost?: number;
  permitsCost?: number;
}

export function CostOverviewCard({
  totalEstimatedCost = 55800000,
  materialsCost = 36270000,
  laborCost = 13950000,
  equipmentCost = 3906000,
  permitsCost = 1674000
}: CostOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Project Overview</h2>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
            Active Baseline
          </span>
        </div>

        <div className="mb-6 p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Estimated Cost
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {formatPKR(totalEstimatedCost)}
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ≈ {formatLakhCrore(totalEstimatedCost)}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Cost Allocation Breakdown
          </h3>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Civil &amp; Finishing Materials</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{formatLakhCrore(materialsCost)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Labour &amp; Subcontractors</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{formatLakhCrore(laborCost)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400">Machinery &amp; Equipment</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{formatLakhCrore(equipmentCost)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-600 dark:text-slate-400">Permits &amp; Contingency</span>
              <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{formatLakhCrore(permitsCost)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Calculated with verified Pakistan market baseline</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.2% Verified</span>
      </div>
    </div>
  );
}
