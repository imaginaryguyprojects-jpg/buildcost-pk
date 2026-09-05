"use client";

import React from "react";
import Link from "next/link";
import {
  Calculator,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { calculateFullHouseEstimate } from "@buildcost/calculations";

export default function DashboardPage() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    getActiveProject,
    reminders,
    purchases,
    siteDiary
  } = useProjectStore();

  const activeProject = getActiveProject();

  // Progressive Estimation based on active project
  const fullEstimate = calculateFullHouseEstimate({
    plotAreaMarla: activeProject?.plotUnit === "kanal" ? (activeProject?.plotArea || 1) * 20 : (activeProject?.plotArea || 5),
    coveredAreaSqft: activeProject?.coveredArea || 2000,
    numberOfFloors: activeProject?.numberOfFloors || 2,
    hasBasement: activeProject?.hasBasement || false,
    quality: (activeProject?.constructionQuality as any) || "standard"
  });

  const totalEstimatedCost = fullEstimate.summary.totalProjectEstimate;
  const totalBudget = activeProject?.totalBudget || Math.round(totalEstimatedCost * 1.05);

  // Actual expenditure from purchases or empirical baseline
  const recordedPurchaseTotal = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const actualSpending = recordedPurchaseTotal > 0 ? recordedPurchaseTotal : Math.round(totalEstimatedCost * 0.42);
  const remainingBudget = Math.max(0, totalBudget - actualSpending);
  const budgetHealth =
    actualSpending > totalBudget
      ? "OVER BUDGET"
      : actualSpending > totalBudget * 0.85
      ? "WARNING"
      : "ON TRACK";

  // Construction progress percentage
  const constructionProgress = 62;

  // Project Progress Stage breakdown (Section 33)
  const progressStages = [
    { name: "Excavation & Foundation", progress: 100, status: "completed" },
    { name: "RCC Structure & Slabs", progress: 75, status: "in_progress" },
    { name: "Brick Masonry & Walls", progress: 40, status: "in_progress" },
    { name: "Plaster & Screed", progress: 0, status: "pending" },
    { name: "Finishing & Fixtures", progress: 0, status: "pending" }
  ];

  // Next upcoming reminders (Section 33: only next 3-4 items)
  const upcomingReminders = reminders.slice(0, 3);

  // Recent site activities
  const recentActivities = siteDiary.length > 0
    ? siteDiary.slice(0, 3).map((entry) => ({
        id: entry.id,
        date: entry.logDate,
        weather: entry.weather,
        workDone: entry.workCompleted
      }))
    : [
        { id: "1", date: "Today", weather: "Clear", workDone: "Completed first floor beam shuttering inspection with civil engineer." },
        { id: "2", date: "Yesterday", weather: "Sunny", workDone: "Received 350 bags of Fauji Portland Cement at site gate." },
        { id: "3", date: "2 days ago", weather: "Mild", workDone: "Compacted ground floor sand filling and checked levels." }
      ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. TOP: PROJECT SELECTOR & CORE HIGHLIGHTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Executive Project Overview
            </span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              budgetHealth === "ON TRACK"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : budgetHealth === "WARNING"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}>
              {budgetHealth}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {activeProject?.projectName || "5 Marla Executive Villa"}
          </h1>
          <p className="text-xs text-slate-500">
            {activeProject?.location || "Islamabad"} • {activeProject?.coveredArea || 2000} sqft Covered • {activeProject?.numberOfFloors || 2} Storeys
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>

          <Link
            href="/projects/new"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Create New Project"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. THE FIVE CORE KPI CARDS (Section 33) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Estimated Cost */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Estimate
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            Rs. {formatNumber(totalEstimatedCost)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
            Rs. {fullEstimate.summary.costPerSqft} / sqft
          </span>
        </div>

        {/* Actual Spending */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Actual Spent
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
            Rs. {formatNumber(actualSpending)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            {Math.round((actualSpending / (totalBudget || 1)) * 100)}% of Budget
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Remaining Budget
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            Rs. {formatNumber(remainingBudget)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            Total: Rs. {formatNumber(totalBudget)}
          </span>
        </div>

        {/* Construction Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Site Progress
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            {constructionProgress}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            Phase 2 of 5 active
          </span>
        </div>

        {/* Estimated Completion */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Est. Completion
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
            18 Dec 2026
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            ~104 days remaining
          </span>
        </div>
      </div>

      {/* 3. MID ROW: COST BREAKDOWN + STAGE PROGRESS (Section 33) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card A: Cost Breakdown Chart (Percentage Split) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cost Allocation Breakdown
            </h3>
            <Link
              href="/calculator"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 flex items-center gap-1"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal multi-color bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${fullEstimate.percentages.greyStructurePercent}%` }}
              className="bg-emerald-600 h-full"
              title="Grey Structure"
            />
            <div
              style={{ width: `${fullEstimate.percentages.finishingPercent}%` }}
              className="bg-teal-500 h-full"
              title="Finishing"
            />
            <div
              style={{ width: `${fullEstimate.percentages.labourPercent}%` }}
              className="bg-cyan-500 h-full"
              title="Labour"
            />
            <div
              style={{ width: `${fullEstimate.percentages.otherAndContingencyPercent}%` }}
              className="bg-amber-400 h-full"
              title="Other & Contingency"
            />
          </div>

          {/* Category List */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Grey Structure ({fullEstimate.percentages.greyStructurePercent}%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Rs. {formatNumber(fullEstimate.summary.greyStructureCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Finishing Works ({fullEstimate.percentages.finishingPercent}%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Rs. {formatNumber(fullEstimate.summary.finishingCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Labour Wages ({fullEstimate.percentages.labourPercent}%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Rs. {formatNumber(fullEstimate.summary.labourCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Logistics &amp; Contingency ({fullEstimate.percentages.otherAndContingencyPercent}%)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  Rs. {formatNumber(fullEstimate.summary.contingencyCost + fullEstimate.summary.transportCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Project Stage Progress (Section 33) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Construction Stage Progress
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Overall: {constructionProgress}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {progressStages.map((st, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {st.progress === 100 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : st.progress > 0 ? (
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                    <span>{st.name}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {st.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${st.progress}%` }}
                    className={`h-full ${st.progress === 100 ? "bg-emerald-500" : "bg-cyan-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: RECENT ACTIVITY & REMINDERS (Section 33) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Site Activity (few items only) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Site Log
            </h3>
            <Link href="/diary" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500">
              View Diary
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">{act.date} • {act.weather}</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{act.workDone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders (3 items only) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Site Reminders
            </h3>
            <Link href="/reminders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-500">
              All Tasks
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((rem) => (
                <div key={rem.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{rem.title}</span>
                      <span className="text-[10px] text-slate-400">Due: {rem.reminderDate}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    {rem.priority}
                  </span>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Ground Floor RCC Slab Curing (Day 7)</span>
                      <span className="text-[10px] text-slate-400">Due: Tomorrow 08:00 AM</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">High</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Vendor Udhaar Payment - Al-Madina Steel</span>
                      <span className="text-[10px] text-slate-400">Due: 10 Sep 2026</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">Payment</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. QUICK ACTIONS (Section 33) */}
      <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
            Immediate Next Steps
          </span>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
            Quickly update estimates, log purchases, or generate contractor quotations
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/calculator"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Launch Calculator</span>
          </Link>
          <Link
            href="/purchases"
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Purchase</span>
          </Link>
          <Link
            href="/boq"
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
            <span>View BOQ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
