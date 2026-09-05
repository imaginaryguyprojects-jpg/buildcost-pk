"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatLakhCrore } from "@/lib/formatters";

interface CostDonutChartsCardProps {
  totalEstimatedCost?: number;
}

const MATERIAL_DONUT_DATA = [
  { name: "Steel", value: 42, color: "#059669" },     // Emerald
  { name: "Cement", value: 38, color: "#0d9488" },    // Teal
  { name: "Bricks", value: 12, color: "#d97706" },    // Amber
  { name: "Sand & Crush", value: 8, color: "#f59e0b" } // Gold
];

const CATEGORY_DONUT_DATA = [
  { name: "Materials", value: 65, color: "#059669" },
  { name: "Labor", value: 25, color: "#0d9488" },
  { name: "Equipment", value: 6, color: "#d97706" },
  { name: "Permits", value: 4, color: "#64748b" }
];

const DETAILED_QUANTITY_ITEMS = [
  { text: "12,000 Cement bags @ Rs. 1,450/bag", total: 17400000 },
  { text: "250 tons Steel @ Rs. 260,000/ton", total: 65000000 },
  { text: "150,000 Bricks @ Rs. 14/unit", total: 2100000 },
  { text: "15,000 CFT Sand @ Rs. 45/cft", total: 675000 },
  { text: "12,000 CFT Crush @ Rs. 65/cft", total: 780000 }
];

export function CostDonutChartsCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Side: Dual Donut Charts */}
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Donut 1: Key Materials */}
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Pie
                    data={MATERIAL_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MATERIAL_DONUT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Materials</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Ratio</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Key Materials Composition</span>
          </div>

          {/* Donut 2: Budget Breakdown */}
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Pie
                    data={CATEGORY_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DONUT_DATA.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Budget</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">100%</span>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">Overall Cost Allocation</span>
          </div>
        </div>

        {/* Right Side: Detailed Quantities List */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Component Rate Breakdown
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {DETAILED_QUANTITY_ITEMS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300 gap-2">
                <span className="truncate text-slate-500 dark:text-slate-400">{item.text}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">
                  = {formatLakhCrore(item.total)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Totals based on active market snapshot</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Verified Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}
