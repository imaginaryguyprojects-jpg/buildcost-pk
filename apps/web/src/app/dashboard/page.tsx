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
  Check,
  User,
  PieChart as PieChartIcon
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
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
  const { user } = useAuthStore();
  const customerName = activeProject?.clientName || user?.fullName || "Muhammad Usman (Client)";
  const isComplete = constructionProgress >= 100;
  const projectStatus = isComplete ? "Complete" : "In Progress";
  const completedPhasesCount = progressStages.filter(s => s.status === "completed").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* TOP HEADER: GREETING & ADD PROJECT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome, {user?.fullName || "John Anderson"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time construction progress and cost analytics for your property portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>

          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </Link>
        </div>
      </div>

      {/* THREE HIGH-FIDELITY MODULAR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Current Project Details & State */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Project
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {activeProject?.projectName || "Residential Complex Alpha"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeProject?.location || "Islamabad, PK"} • {activeProject?.coveredArea || 2000} sqft
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-100/80 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
              Current State / Budget
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              Rs. {formatNumber(totalBudget)}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 block">
              {budgetHealth === "ON TRACK" ? "● Within Planned Budget" : `● ${budgetHealth}`}
            </span>
          </div>
        </div>

        {/* Card 2: Dynamic Donut Chart — Project Progress Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Progress Breakdown
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
              Live Site
            </span>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex items-center justify-center my-2 relative">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle track */}
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="#f1f5f9"
                strokeWidth="15"
                className="dark:stroke-slate-800"
                fill="none"
              />
              {/* In-Progress slice (pastel sky blue) */}
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="#93c5fd"
                strokeWidth="15"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - 0.95)}`}
                strokeLinecap="round"
                fill="none"
              />
              {/* Completed slice (rich emerald green) */}
              <circle
                cx="60"
                cy="60"
                r="46"
                stroke="#059669"
                strokeWidth="15"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - (constructionProgress / 100))}`}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Donut Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight line-clamp-1 max-w-[80px]">
                {activeProject?.projectName?.split(" ")[0] || "Alpha"}
              </span>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                {constructionProgress}%
              </span>
              <span className="text-[8px] text-slate-400 uppercase font-semibold">Done</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex items-center justify-center gap-4 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>{constructionProgress}% Complete</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
              <span>In-Progress</span>
            </div>
          </div>
        </div>

        {/* Card 3: Project Overview Card with Customer Name & Status Badge */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Overview
            </h3>
            <span className="text-slate-400 hover:text-slate-600 cursor-pointer">•••</span>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{customerName}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Project:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {activeProject?.projectName || "Residential Alpha"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 font-medium">Location:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeProject?.location || "Islamabad, PK"}
              </span>
            </div>
          </div>

          {/* Status Indicators with Clean Badges */}
          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Status:
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                projectStatus === "Complete"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700"
              }`}>
                {projectStatus}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Phases:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {completedPhasesCount} / {progressStages.length} Complete
              </span>
            </div>
          </div>
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
