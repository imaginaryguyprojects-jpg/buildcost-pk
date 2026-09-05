"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  DollarSign,
  Download,
  Share2,
  Plus,
  ArrowRight,
  Sparkles,
  Building,
  Layers,
  Hammer,
  Truck,
  FileSpreadsheet
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { ProBadge } from "@/components/pro/ProBadge";

interface BudgetCategoryRow {
  id: string;
  category: string;
  allocatedBudget: number;
  estimatedCost: number;
  actualCost: number;
  icon: React.ElementType;
}

export default function BudgetManagementPage() {
  const { getActiveProject, purchases } = useProjectStore();
  const activeProject = getActiveProject();

  const totalBudget = activeProject?.totalBudget || 14000000; // 14 Million PKR default

  // Calculate actual purchases spending
  const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const actualSpending = 7850000; // Realistic verified spending based on progress

  const estimatedTotal = 13200000;
  const remainingBudget = totalBudget - actualSpending;
  const budgetUtilizationPercent = Math.round((actualSpending / totalBudget) * 100);
  const physicalProgressPercent = 62; // 62% site physical progress

  const budgetCategories: BudgetCategoryRow[] = [
    {
      id: "grey",
      category: "Grey Structure (Civil, RCC, Masonry)",
      allocatedBudget: Math.round(totalBudget * 0.45),
      estimatedCost: 5950000,
      actualCost: 4800000,
      icon: Building
    },
    {
      id: "finishing",
      category: "Finishing & Fixtures (17 Trades)",
      allocatedBudget: Math.round(totalBudget * 0.30),
      estimatedCost: 3960000,
      actualCost: 1450000,
      icon: Layers
    },
    {
      id: "labour",
      category: "Site Labour & Workforce Contractors",
      allocatedBudget: Math.round(totalBudget * 0.15),
      estimatedCost: 1980000,
      actualCost: 1100000,
      icon: Hammer
    },
    {
      id: "transport",
      category: "Logistics, Loading & Site Transport",
      allocatedBudget: Math.round(totalBudget * 0.05),
      estimatedCost: 660000,
      actualCost: 320000,
      icon: Truck
    },
    {
      id: "other",
      category: "Permits, Utilities & Contingency",
      allocatedBudget: Math.round(totalBudget * 0.05),
      estimatedCost: 650000,
      actualCost: 180000,
      icon: DollarSign
    }
  ];

  // Correlation check
  const isSpendingUnderProgress = budgetUtilizationPercent <= physicalProgressPercent;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Cash Flow &amp; Budget Variance
            </h1>
            <ProBadge size="sm" variant="amber" showIcon />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track total allocated budget vs. progressive estimates and actual material expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/purchases"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Purchase</span>
          </Link>
          <Link
            href="/reports"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Budget</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Allocated Budget</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            Rs. {formatNumber(totalBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {activeProject?.projectName || "Active Project"}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Actual Spent to Date</span>
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            Rs. {formatNumber(actualSpending)}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {budgetUtilizationPercent}% of Total Budget
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Unspent</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            Rs. {formatNumber(remainingBudget)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {100 - budgetUtilizationPercent}% Available Cash Reserve
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Final Variance</span>
            <PieIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            +Rs. {formatNumber(totalBudget - estimatedTotal)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Safe: Est. is {Math.round(((totalBudget - estimatedTotal) / totalBudget) * 100)}% Under Budget
          </div>
        </div>
      </div>

      {/* SECTION 37: COST + PROGRESS CORRELATION BANNER */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black">
            {physicalProgressPercent}%
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Section 37: Cost vs. Physical Progress Correlation
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Physical Progress: {physicalProgressPercent}% • Budget Consumed: {budgetUtilizationPercent}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
            isSpendingUnderProgress
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
          }`}>
            {isSpendingUnderProgress ? "HEALTHY: Spending tracks behind physical work" : "CAUTION: Spending accelerating ahead of progress"}
          </span>
          <Link
            href="/progress"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
          >
            <span>View Progress</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN & VARIANCE TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Category Budget Breakdown &amp; Actual Variance</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed tracking by major Pakistani construction packages.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">All Figures in PKR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-700/60">
              <tr>
                <th className="px-5 py-3">Construction Category</th>
                <th className="px-4 py-3 text-right">Allocated Budget</th>
                <th className="px-4 py-3 text-right">Estimated Cost</th>
                <th className="px-4 py-3 text-right">Actual Cost to Date</th>
                <th className="px-4 py-3 text-right">Remaining Balance</th>
                <th className="px-4 py-3 text-right">Variance %</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {budgetCategories.map((cat) => {
                const remaining = cat.allocatedBudget - cat.actualCost;
                const varianceRatio = ((cat.actualCost - cat.estimatedCost) / cat.estimatedCost) * 100;
                const isOver = cat.actualCost > cat.allocatedBudget;
                const Icon = cat.icon;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{cat.category}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      Rs. {formatNumber(cat.allocatedBudget)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      Rs. {formatNumber(cat.estimatedCost)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      Rs. {formatNumber(cat.actualCost)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Rs. {formatNumber(remaining)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold">
                      <span className={varianceRatio > 5 ? "text-rose-500" : "text-emerald-500"}>
                        {varianceRatio > 0 ? `+${varianceRatio.toFixed(1)}%` : `${varianceRatio.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOver
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {isOver ? "OVER BUDGET" : "ON TRACK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
