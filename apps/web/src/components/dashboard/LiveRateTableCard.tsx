"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from "lucide-react";
import { MaterialRate } from "@buildcost/types";
import { cn } from "@/lib/utils";

interface LiveRateTableCardProps {
  rates?: MaterialRate[];
  cityName?: string;
}

export function LiveRateTableCard({ rates, cityName = "Islamabad" }: LiveRateTableCardProps) {
  const displayRates = rates && rates.length > 0 ? rates : [
    {
      id: "cement",
      materialName: "Cement",
      deliveredRate: 1450,
      unit: "bag",
      trendPercentage: 2.5
    },
    {
      id: "steel",
      materialName: "Steel (Grade 60)",
      deliveredRate: 260000,
      unit: "ton",
      trendPercentage: -1.1
    },
    {
      id: "sand",
      materialName: "Sand (Chenab)",
      deliveredRate: 45,
      unit: "cft",
      trendPercentage: 0.5
    },
    {
      id: "crush",
      materialName: "Crush (Bajri)",
      deliveredRate: 65,
      unit: "cft",
      trendPercentage: 0
    },
    {
      id: "bricks",
      materialName: "Bricks (Awwal)",
      deliveredRate: 14.0,
      unit: "piece",
      trendPercentage: 1.8
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Live Material Rates</h2>
            <span className="text-xs text-slate-400">Local Market ({cityName})</span>
          </div>
          <Link
            href="/rates/materials"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table matching UI.jpg right table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="pb-3 font-medium">Material</th>
                <th className="pb-3 font-medium text-right">Market Rate</th>
                <th className="pb-3 font-medium text-center">Unit</th>
                <th className="pb-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayRates.map((item) => {
                const isPositive = (item.trendPercentage ?? 0) > 0;
                const isNegative = (item.trendPercentage ?? 0) < 0;
                const formattedRate =
                  item.unit === "ton"
                    ? `Rs. ${Math.round(item.deliveredRate).toLocaleString("en-PK")}`
                    : `Rs. ${item.deliveredRate}`;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-200">{item.materialName}</td>
                    <td className="py-3 text-right font-semibold text-slate-100">{formattedRate}</td>
                    <td className="py-3 text-center text-xs text-slate-400">/{item.unit}</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded",
                          isPositive
                            ? "text-emerald-400 bg-emerald-950/40"
                            : isNegative
                            ? "text-rose-400 bg-rose-950/40"
                            : "text-slate-400 bg-slate-800/50"
                        )}
                      >
                        {isPositive && <ArrowUpRight className="w-3 h-3" />}
                        {isNegative && <ArrowDownRight className="w-3 h-3" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                        {isPositive ? `+${item.trendPercentage}%` : `${item.trendPercentage ?? 0}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: Verified field surveys & supplier updates</span>
        <span className="text-slate-400">Updated today</span>
      </div>
    </div>
  );
}
