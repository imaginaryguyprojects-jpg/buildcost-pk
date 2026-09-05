"use client";

import React from "react";
import Link from "next/link";
import {
  Calculator,
  Plus,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  SlidersHorizontal,
  Activity,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  History,
  Scale,
  DollarSign,
  Compass,
  Boxes,
  CalendarClock,
  ShoppingCart,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectSummaryPills } from "@/components/dashboard/ProjectSummaryPills";
import { CostOverviewCard } from "@/components/dashboard/CostOverviewCard";
import { LiveRateTableCard } from "@/components/dashboard/LiveRateTableCard";
import { CostDonutChartsCard } from "@/components/dashboard/CostDonutChartsCard";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore } from "@/lib/formatters";

export default function DashboardPage() {
  const {
    projects,
    activeProjectId,
    selectedCityId,
    materialRates,
    savedCalculations,
    estimateVersions,
    inventory,
    reminders,
    purchases,
    siteDiary,
    getActiveProject
  } = useProjectStore();
  const activeProject = getActiveProject();
  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  // Dynamic calculation based on active project
  const currentEstimate = calculateCompleteHouseEstimate({
    plotAreaMarla: activeProject?.plotUnit === "kanal" ? (activeProject?.plotArea || 1) * 20 : (activeProject?.plotArea || 5),
    marlaSqft: 225,
    coveredAreaSqft: activeProject?.coveredArea || 1950,
    numberOfFloors: activeProject?.numberOfFloors || 2,
    hasBasement: activeProject?.hasBasement || false,
    quality: (activeProject?.constructionQuality as any) || "standard",
    cityId: selectedCity.id,
    cityName: selectedCity.name
  });

  // Project Cost Health (Section 113)
  const totalBudget = activeProject?.totalBudget || 15000000;
  const estimatedCost = currentEstimate.grandTotal;
  const actualSpent = Math.round(estimatedCost * 0.42); // 42% completed site progress
  const remainingBudget = totalBudget - actualSpent;
  const costHealthStatus =
    estimatedCost <= totalBudget
      ? "on_budget"
      : estimatedCost <= totalBudget * 1.1
      ? "at_risk"
      : "over_budget";

  // Smart Cost Insights (Section 114)
  const steelCost = Math.round(currentEstimate.materialsCost * 0.35);
  const steelPercent = Math.round((steelCost / (currentEstimate.materialsCost || 1)) * 100);
  const wastageSaving = Math.round(currentEstimate.materialsCost * 0.02);

  return (
    <div className="space-y-6">
      {/* Top Title Bar matching UI.jpg */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Construction Cost Calculator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Pakistan civil & architectural estimation engine • Local market baseline:{" "}
            <span className="text-emerald-400 font-semibold">{selectedCity.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/calculator/house-estimate"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/50"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Custom Calculator</span>
          </Link>

          <Link
            href="/projects"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Switch Project</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Bar (Section 88) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-2 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <Link
          href="/projects/new"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Project</span>
        </Link>
        <Link
          href="/calculator/house-estimate"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Estimate</span>
        </Link>
        <Link
          href="/boq"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
          <span>Create BOQ</span>
        </Link>
        <Link
          href="/quotations"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quotation</span>
        </Link>
        <Link
          href="/rates/materials"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>View Rates</span>
        </Link>
        <Link
          href="/history"
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>History ({savedCalculations.length})</span>
        </Link>
      </div>

      {/* Project Cost Health Section (Section 113) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Project Cost Health: {activeProject?.projectName || "Active Site"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {costHealthStatus === "on_budget" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> On Budget
              </span>
            )}
            {costHealthStatus === "at_risk" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Budget At Risk (±10%)
              </span>
            )}
            {costHealthStatus === "over_budget" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Over Budget
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Sanctioned Budget</span>
            <div className="text-sm font-black text-white mt-1 font-mono">{formatPKR(totalBudget)}</div>
            <div className="text-[10px] text-slate-500">{formatLakhCrore(totalBudget)}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Total</span>
            <div className="text-sm font-black text-emerald-400 mt-1 font-mono">{formatPKR(estimatedCost)}</div>
            <div className="text-[10px] text-slate-500">{formatLakhCrore(estimatedCost)}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Actual Spent</span>
            <div className="text-sm font-black text-slate-200 mt-1 font-mono">{formatPKR(actualSpent)}</div>
            <div className="text-[10px] text-slate-500">Procurement + Labour</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Remaining Budget</span>
            <div className={`text-sm font-black mt-1 font-mono ${remainingBudget >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatPKR(remainingBudget)}
            </div>
            <div className="text-[10px] text-slate-500">{Math.round((remainingBudget / totalBudget) * 100)}% available</div>
          </div>
        </div>
      </div>

      {/* Smart Cost Insights (Section 114) */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-300">Engineering Cost Insights:</span>
            <p className="text-slate-300 leading-relaxed">
              Grade 60 steel represents <strong>~{steelPercent}%</strong> of your grey material budget. Reducing site cutting wastage by 2% would save approximately <strong>{formatPKR(wastageSaving)}</strong> on this project.
            </p>
          </div>
        </div>
        <Link
          href="/advisor"
          className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 self-end sm:self-auto"
        >
          Ask AI Advisor →
        </Link>
      </div>

      {/* Top 4 Summary Pill Cards matching UI.jpg */}
      <ProjectSummaryPills project={activeProject} />

      {/* 2-Column Main Dashboard Grid matching UI.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostOverviewCard
          totalEstimatedCost={currentEstimate.grandTotal}
          materialsCost={currentEstimate.materialsCost}
          laborCost={currentEstimate.labourCost}
          equipmentCost={currentEstimate.equipmentCost}
          permitsCost={currentEstimate.contingencyCost + currentEstimate.otherCost}
        />

        <LiveRateTableCard
          rates={materialRates.filter((r) => r.cityId === selectedCityId || r.cityId === "isb")}
          cityName={selectedCity.name}
        />
      </div>

      {/* Site Operations & Daily Watch (Sections 147-225) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Site Operations &amp; Daily Intelligence
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of site stock, pending tasks, vendor khata, and daily diary logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/layouts"
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>House Layouts</span>
            </Link>
            <Link
              href="/purchases"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Purchases</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inventory Watch */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-teal-500" />
                  Site Inventory Watch
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {inventory.length} Items
                </span>
              </div>
              {inventory.filter((i) => i.isLowStock || i.remainingQuantity <= i.minStockThreshold).length > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  ⚠️ Low Stock Alert on {inventory.filter((i) => i.isLowStock || i.remainingQuantity <= i.minStockThreshold).length} materials. Cement / Steel near safety margin.
                </div>
              ) : (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ All materials within safe site stock thresholds.
                </div>
              )}
            </div>
            <Link
              href="/inventory"
              className="mt-3 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Site Tasks & Reminders */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-rose-500" />
                  Pending Site Tasks
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {reminders.filter((r) => r.status === "pending").length} Due
                </span>
              </div>
              <div className="space-y-1">
                {reminders.slice(0, 2).map((r) => (
                  <div key={r.id} className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                    • {r.title}
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/reminders"
              className="mt-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Daily Site Diary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Latest Site Log
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {siteDiary[0]?.logDate || "Today"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                {siteDiary[0]?.workCompleted || "Record today's worker count and concrete execution."}
              </p>
            </div>
            <Link
              href="/diary"
              className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Open Site Diary</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Dual Donut Charts and Breakdown Card matching UI.jpg */}
      <CostDonutChartsCard />
    </div>
  );
}
