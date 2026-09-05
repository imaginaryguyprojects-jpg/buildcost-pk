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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Material Rates</h2>
            <span className="text-xs text-slate-500">Local Market Baseline ({cityName})</span>
          </div>
          <Link
            href="/rates/materials"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="pb-3 font-semibold">Material</th>
                <th className="pb-3 font-semibold text-right">Market Rate</th>
                <th className="pb-3 font-semibold text-center">Unit</th>
                <th className="pb-3 font-semibold text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {displayRates.map((item) => {
                const isPositive = (item.trendPercentage ?? 0) > 0;
                const isNegative = (item.trendPercentage ?? 0) < 0;
                const formattedRate =
                  item.unit === "ton"
                    ? `Rs. ${Math.round(item.deliveredRate).toLocaleString("en-PK")}`
                    : `Rs. ${item.deliveredRate}`;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{item.materialName}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">{formattedRate}</td>
                    <td className="py-3 text-center text-xs text-slate-500">/{item.unit}</td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full",
                          isPositive
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50"
                            : isNegative
                            ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50"
                            : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        {isPositive && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
                        {isNegative && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3 text-slate-400" />}
                        <span>
                          {isPositive ? "+" : ""}
                          {item.trendPercentage}%
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Verified daily with wholesale suppliers</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">APCMA / PSRMA Indexed</span>
      </div>
    </div>
  );
}
