"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  Check,
  Plus
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { calculateProjectHealthScore } from "@buildcost/calculations";
import { formatNumber } from "@/lib/formatters";

interface StageItem {
  id: string;
  name: string;
  progressPercent: number;
  status: "completed" | "in_progress" | "pending";
  estimatedDays: number;
  actualDays?: number;
  startDate?: string;
  targetDate?: string;
}

export default function ProgressTrackingPage() {
  const { getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  const [stages, setStages] = useState<StageItem[]>([
    { id: "1", name: "1. Excavation & PCC Foundation", progressPercent: 100, status: "completed", estimatedDays: 15, actualDays: 14, startDate: "Jun 10", targetDate: "Jun 24" },
    { id: "2", name: "2. RCC Columns & Plinth Beams", progressPercent: 100, status: "completed", estimatedDays: 20, actualDays: 21, startDate: "Jun 25", targetDate: "Jul 15" },
    { id: "3", name: "3. Ground Floor Brick Masonry", progressPercent: 100, status: "completed", estimatedDays: 25, actualDays: 24, startDate: "Jul 16", targetDate: "Aug 10" },
    { id: "4", name: "4. Ground Floor Roof Slab Casting", progressPercent: 100, status: "completed", estimatedDays: 12, actualDays: 12, startDate: "Aug 11", targetDate: "Aug 23" },
    { id: "5", name: "5. First Floor RCC & Brick Masonry", progressPercent: 80, status: "in_progress", estimatedDays: 28, actualDays: 20, startDate: "Aug 24", targetDate: "Sep 20" },
    { id: "6", name: "6. Electrical & Plumbing Rough-In", progressPercent: 65, status: "in_progress", estimatedDays: 18, actualDays: 12, startDate: "Sep 01", targetDate: "Sep 18" },
    { id: "7", name: "7. Internal & External Plastering", progressPercent: 40, status: "in_progress", estimatedDays: 22, actualDays: 8, startDate: "Sep 10", targetDate: "Oct 02" },
    { id: "8", name: "8. Flooring, Marble & Tile Fixing", progressPercent: 10, status: "in_progress", estimatedDays: 30, actualDays: 3, startDate: "Sep 25", targetDate: "Oct 25" },
    { id: "9", name: "9. False Ceiling & Woodwork", progressPercent: 0, status: "pending", estimatedDays: 20, targetDate: "Nov 15" },
    { id: "10", name: "10. Paint, Fixtures & Final Handover", progressPercent: 0, status: "pending", estimatedDays: 25, targetDate: "Dec 10" }
  ]);

  // Overall Physical Progress
  const overallProgress = Math.round(
    stages.reduce((sum, s) => sum + s.progressPercent, 0) / stages.length
  );

  // Material Procurement Progress (Section 39)
  const procurementItems = [
    { name: "Portland Cement", progress: 80, target: "850 Bags", purchased: "680 Bags" },
    { name: "Deformed Steel Bar Grade 60", progress: 65, target: "9.2 Tons", purchased: "6.0 Tons" },
    { name: "First Class Red Clay Bricks", progress: 75, target: "45,000 Bricks", purchased: "33,750 Bricks" },
    { name: "Porcelain & Ceramic Tiles", progress: 20, target: "2,400 sqft", purchased: "480 sqft" },
    { name: "PPRC / PVC Pipes & Conduits", progress: 60, target: "Complete Lot", purchased: "Rough-in Lot" }
  ];

  const overallProcurement = Math.round(
    procurementItems.reduce((sum, p) => sum + p.progress, 0) / procurementItems.length
  );

  // Project Health Calculation
  const healthResult = calculateProjectHealthScore({
    totalBudget: activeProject?.totalBudget || 14000000,
    actualCost: 7850000,
    estimatedCost: 13200000,
    physicalProgressPercent: overallProgress,
    procurementProgressPercent: overallProcurement,
    daysDelayed: 4,
    vendorOverdueAmount: 250000
  });

  const budgetPercentUsed = 56;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Construction Progress &amp; Milestone Schedule
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Sections 36–39
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Physical site completion, schedule adherence, material procurement tracking &amp; health score.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/diary"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Update Site Diary</span>
          </Link>
          <Link
            href="/budget"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Check Budget</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Physical Progress</span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {overallProgress}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            4 of 10 Stages 100% Completed
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Project Health Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {healthResult.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
            STATUS: {healthResult.status}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Material Procurement</span>
            <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {overallProcurement}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Major civil supplies secured on site
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Projected Delivery</span>
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">
            Dec 15, 2026
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Estimated 85 working days remaining
          </div>
        </div>
      </div>

      {/* SECTION 37: COST + PROGRESS CORRELATION & SECTION 39: PROCUREMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Physical Progress */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Section 37: Cost + Progress Correlation</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
              Balanced Ratio
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Physical Site Progress</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{overallProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Budget Consumed</span>
                <span className="font-mono font-bold text-amber-600">{budgetPercentUsed}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${budgetPercentUsed}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Correlation Diagnosis:</div>
              <p>
                Physical progress ({overallProgress}%) exceeds cash utilization ({budgetPercentUsed}%) by 3.5%, indicating excellent financial discipline and favorable negotiated supplier terms.
              </p>
            </div>
          </div>
        </div>

        {/* Section 39: Material Procurement Progress */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-600" />
              <span>Section 39: Material Procurement Progress</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">{overallProcurement}% Total Procured</span>
          </div>

          <div className="space-y-3">
            {procurementItems.map((item) => (
              <div key={item.name} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{item.purchased} / {item.target}</span>
                    <span className="font-mono font-bold text-cyan-600">{item.progress}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 10 CONSTRUCTION STAGES PROGRESSION TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>10-Stage Construction Progression Matrix (Section 36)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              From foundation excavation to final painting and sanitary fixtures.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-700/60">
              <tr>
                <th className="px-5 py-3">Stage Description</th>
                <th className="px-4 py-3">Schedule Timeline</th>
                <th className="px-4 py-3">Est. vs Actual Days</th>
                <th className="px-6 py-3">Completion %</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stages.map((stg) => (
                <tr key={stg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                    {stg.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                    {stg.startDate ? `${stg.startDate} → ${stg.targetDate}` : `Target: ${stg.targetDate}`}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-mono">
                    {stg.actualDays ? `${stg.actualDays}d / ${stg.estimatedDays}d` : `${stg.estimatedDays}d planned`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 sm:w-36 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stg.progressPercent === 100 ? "bg-emerald-500" : "bg-cyan-500"
                          }`}
                          style={{ width: `${stg.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {stg.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      stg.status === "completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : stg.status === "in_progress"
                        ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {stg.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
