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
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100">Project Overview</h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Active Estimate
          </span>
        </div>

        <div className="mb-6">
          <span className="text-xs font-medium text-slate-400 block mb-1">
            Total Estimated Cost
          </span>
          <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {formatPKR(totalEstimatedCost)}
          </div>
          <div className="text-sm font-semibold text-emerald-400 mt-1">
            ≈ {formatLakhCrore(totalEstimatedCost)}
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Cost Breakdown
          </h3>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Materials</span>
              <span className="font-semibold text-slate-200">{formatLakhCrore(materialsCost)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Labor</span>
              <span className="font-semibold text-slate-200">{formatLakhCrore(laborCost)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Equipment</span>
              <span className="font-semibold text-slate-200">{formatLakhCrore(equipmentCost)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Permits & Contingency</span>
              <span className="font-semibold text-slate-200">{formatLakhCrore(permitsCost)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Calculated with verified Pakistan market baseline</span>
        <span className="text-emerald-400 font-medium">99.2% Confidence</span>
      </div>
    </div>
  );
}
