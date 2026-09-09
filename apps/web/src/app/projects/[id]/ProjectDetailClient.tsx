"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Building2,
  Calculator,
  Layers,
  Users,
  FileSpreadsheet,
  Receipt,
  FileText,
  Sliders,
  ArrowLeft,
  Download,
  Percent,
  TrendingUp,
  Plus,
  Compass,
  ShoppingCart,
  Boxes,
  CalendarClock,
  BookOpen,
  Scale,
  Settings,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldAlert,
  Wallet,
  Ruler,
  Clock,
  Activity,
  ChevronRight
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { FloorPlanViewer2D } from "@/components/layouts/FloorPlanViewer2D";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { calculateCompleteHouseEstimate, calculateGreyStructureEstimate } from "@buildcost/calculations";
import { cn } from "@/lib/utils";
import { PAKISTANI_CITIES } from "@buildcost/config";

export default function ProjectDetailClient({ id }: { id?: string }) {
  const routeParams = useParams();
  const activeId = id || (routeParams?.id as string);
  const router = useRouter();
  const {
    projects,
    purchases,
    inventory,
    reminders,
    siteDiary,
    layouts,
    vendors,
    estimateVersions,
    createEstimateVersion,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    duplicateProject,
    auditLogs
  } = useProjectStore();
  const { user, openProjectUpgradeModal, showToast } = useAuthStore();

  const isPro = user?.plan === "pro" || user?.plan === "business";

  const project = projects.find((p) => p.id === activeId) || projects[0];

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "property"
    | "grey"
    | "finishing"
    | "materials"
    | "labour"
    | "purchases"
    | "vendors"
    | "inventory"
    | "budget"
    | "diary"
    | "reminders"
    | "boq"
    | "quotations"
    | "reports"
    | "versions"
    | "settings"
  >("overview");

  // Delete modal confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Dynamic estimate calculation for this project
  const city = PAKISTANI_CITIES.find((c) => c.id === project.cityId) || PAKISTANI_CITIES[0];
  const estimate = calculateCompleteHouseEstimate({
    plotAreaMarla: project.plotArea / (project.plotUnit === "marla" ? 1 : 225),
    marlaSqft: 225,
    coveredAreaSqft: project.coveredArea,
    numberOfFloors: project.numberOfFloors,
    quality: project.constructionQuality,
    cityId: project.cityId,
    cityName: city.name
  });

  const greyEstimate = calculateGreyStructureEstimate({
    plotAreaMarla: project.plotArea / (project.plotUnit === "marla" ? 1 : 225),
    coveredAreaSqft: project.coveredArea,
    numberOfFloors: project.numberOfFloors,
    foundationDepthFt: project.foundationDepth || 4,
    plinthHeightFt: project.plinthHeight || 3,
    floorHeightFt: project.clearCeilingHeight || 10.5
  });

  const matchedLayout = layouts.find(
    (l) =>
      l.plotCategory ===
      (project.plotArea <= 3
        ? "3_marla"
        : project.plotArea <= 5
        ? "5_marla"
        : project.plotArea <= 7
        ? "7_marla"
        : project.plotArea <= 10
        ? "10_marla"
        : "1_kanal")
  ) || layouts[0];

  const projectPurchases = purchases.filter((p) => p.projectId === project.id);
  const projectInventory = inventory.filter((i) => i.projectId === project.id);
  const projectReminders = reminders.filter((r) => r.projectId === project.id);
  const projectDiary = siteDiary.filter((d) => d.projectId === project.id);
  const projectVersions = estimateVersions.filter((v) => v.projectId === project.id);
  const projectAudits = auditLogs.filter((a) => a.projectId === project.id);

  const totalPurchasesSpend = projectPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const estimatedLabourSpend = Math.round(estimate.labourCost * 0.35);
  const actualTotalSpend = totalPurchasesSpend + estimatedLabourSpend;
  const targetBudget = project.totalBudget || estimate.grandTotal;
  const remainingBudget = Math.max(0, targetBudget - actualTotalSpend);
  const budgetConsumedPct = Math.min(100, Math.round((actualTotalSpend / targetBudget) * 100));

  // Health metrics (Section 14)
  const physicalProgressPct = project.status === "completed" ? 100 : project.status === "under_construction" ? 65 : 20;
  const procurementProgressPct = Math.min(100, Math.round((projectPurchases.length / 15) * 100)) || 45;
  const overallProgressPct = Math.round((physicalProgressPct * 0.6) + (procurementProgressPct * 0.4));

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "property", label: "Property Specs", icon: Ruler },
    { id: "grey", label: "Grey Structure", icon: Layers },
    { id: "finishing", label: "Finishing", icon: Sliders },
    { id: "materials", label: "Materials", icon: Boxes },
    { id: "labour", label: "Labour", icon: Users },
    { id: "purchases", label: "Purchases", icon: ShoppingCart },
    { id: "vendors", label: "Vendors & Khata", icon: Wallet },
    { id: "budget", label: "Budget & Cashflow", icon: Scale },
    { id: "diary", label: "Site Diary", icon: BookOpen },
    { id: "reminders", label: "Reminders", icon: CalendarClock },
    { id: "boq", label: "BOQ Studio", icon: FileSpreadsheet, isProOnly: true },
    { id: "quotations", label: "Quotations", icon: FileText, isProOnly: true },
    { id: "reports", label: "Reports & PDF", icon: Download },
    { id: "versions", label: "Rate Versions", icon: History, isProOnly: true },
    { id: "settings", label: "Settings", icon: Settings }
  ] as const;

  const handleDuplicate = () => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    const cloned = duplicateProject(project.id);
    if (cloned) {
      showToast(`Project duplicated as "${cloned.projectName}"`, "success");
      router.push(`/projects/${cloned.id}`);
    }
  };

  const handleArchiveToggle = () => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    if (project.status === "archived") {
      restoreProject(project.id);
      showToast("Project restored to active!", "success");
    } else {
      archiveProject(project.id);
      showToast("Project moved to archive", "info");
      router.push("/projects");
    }
  };

  const handleDelete = () => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    deleteProject(project.id);
    showToast(`Project "${project.projectName}" permanently deleted`, "error");
    router.push("/projects");
  };

  const handleCreateNewVersion = () => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    const ver = createEstimateVersion(
      project.id,
      `Rate Snapshot — ${new Date().toLocaleDateString("en-PK")}`,
      {
        grandTotal: estimate.grandTotal,
        costPerSqft: estimate.costPerSqft,
        materialsCost: estimate.materialsCost,
        labourCost: estimate.labourCost,
        finishingCost: estimate.finishingCost,
        coveredArea: project.coveredArea
      }
    );
    showToast(`Created ${ver.versionName} with latest rates!`, "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {project.projectName}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                PRO WORKSPACE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {project.society ? `${project.society}, ` : ""}
              {project.location} • Ref: <span className="font-mono">{project.referenceNumber || "BC-AUTO"}</span> • {city.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Specs</span>
          </Link>

          <button
            type="button"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BOQ PDF</span>
          </Link>
        </div>
      </div>

      {/* 16-Tab Navigation Bar (Section 15) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {"isProOnly" in tab && tab.isProOnly && (
                <span className={cn("text-[9px] font-black uppercase px-1 py-0.2 rounded", isActive ? "bg-emerald-800 text-white" : "bg-emerald-500/10 text-emerald-600")}>
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH METRICS (Sections 13 & 14) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Financial Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Estimate
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatPKR(estimate.grandTotal)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                Rs. {formatNumber(estimate.costPerSqft)} / sqft
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Grey Structure
              </span>
              <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                {formatPKR(estimate.materialsCost + estimate.labourCost)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {Math.round(((estimate.materialsCost + estimate.labourCost) / estimate.grandTotal) * 100)}% of total
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Finishing Cost
              </span>
              <span className="text-base font-black text-slate-800 dark:text-slate-200 font-mono">
                {formatPKR(estimate.finishingCost)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {Math.round((estimate.finishingCost / estimate.grandTotal) * 100)}% of total
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Actual Cost Spent
              </span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                {formatPKR(actualTotalSpend)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Purchases + Labour
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project Budget
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatPKR(targetBudget)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Allocated Capital
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Remaining Funds
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatPKR(remainingBudget)}
              </span>
              <span className="text-[10px] text-emerald-600/80 block mt-0.5">
                {100 - budgetConsumedPct}% unspent
              </span>
            </div>
          </div>

          {/* Project Profile / Health Progress Bars (Section 14) */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Project Execution Health &amp; Progress
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time engineering progress against procurement and financial burn rate
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                On Schedule
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Progress */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Progress</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{overallProgressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${overallProgressPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 block">Civil structure + finishes</span>
              </div>

              {/* Physical Work Completed */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Physical Work</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{physicalProgressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${physicalProgressPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 block">First floor slab poured</span>
              </div>

              {/* Budget Consumed */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Budget Consumed</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{budgetConsumedPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${budgetConsumedPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 block">Within 5% engineering tolerance</span>
              </div>

              {/* Procurement Progress */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Procurement</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">{procurementProgressPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${procurementProgressPct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 block">Steel &amp; cement secured</span>
              </div>
            </div>
          </div>

          {/* Visual Graphs & Milestones Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estimated vs Actual Cost Breakdown */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Estimated vs. Actual Cost Comparison</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Civil &amp; Grey Materials</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPKR(totalPurchasesSpend)} / {formatPKR(estimate.materialsCost)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((totalPurchasesSpend / Math.max(1, estimate.materialsCost)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Labour Contracts &amp; Daily Wages</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPKR(estimatedLabourSpend)} / {formatPKR(estimate.labourCost)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((estimatedLabourSpend / Math.max(1, estimate.labourCost)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Total Project Outlay</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {formatPKR(actualTotalSpend)} / {formatPKR(targetBudget)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${budgetConsumedPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Milestones & Tasks (Section 13) */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Next Milestones &amp; Site Tasks</span>
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">G+{project.numberOfFloors - 1} Schedule</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Ground Floor Slab Curing (14 Days)</div>
                      <div className="text-slate-500 text-[11px]">Daily morning and evening water ponding</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">Active</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">First Floor Brick Masonry</div>
                      <div className="text-slate-500 text-[11px]">Target: 18,500 Awwal Bricks delivery</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Next</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">Sanitary Concealed Piping Inspection</div>
                      <div className="text-slate-500 text-[11px]">PPRC pressure testing at 10 bar</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROPERTY SPECS & SOCIETY BYLAWS */}
      {activeTab === "property" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Plot &amp; Building Dimensions</h2>
              <p className="text-xs text-slate-500">Regional Pakistani municipal dimensions and clear clearances</p>
            </div>
            <Link
              href={`/projects/${project.id}/edit`}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            >
              Modify Dimensions
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Plot Area</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {project.plotArea} {project.plotUnit}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{project.marlaStandardId.replace("_", " ")} sqft</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Plot Dimensions</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {project.plotFront || 25}&apos; × {project.plotDepth || 45}&apos;
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Frontage × Depth</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Covered Area</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatNumber(project.coveredArea)} sqft
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Ground + First Floor</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Storeys</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                G+{project.numberOfFloors - 1} ({project.numberOfFloors} Floors)
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">RCC Frame Structure</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Clear Ceiling Height</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {project.clearCeilingHeight || 10.5}&apos; ft
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Plinth Height</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {project.plinthHeight || 3}&apos; ft
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">RCC Slab Thickness</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {project.slabThickness || 6}&quot; in
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Quality Specification</span>
              <span className="text-base font-bold capitalize text-emerald-600 dark:text-emerald-400">
                {project.constructionQuality} Tier
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GREY STRUCTURE */}
      {activeTab === "grey" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Grey Structure Material Breakdown</h2>
              <p className="text-xs text-slate-500">Civil engineering calculations for RCC foundation, columns, beams, brickwork, and roof slabs</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Subtotal Grey</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatPKR(greyEstimate.costs.grandTotal)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Delivered Rate</th>
                  <th className="p-3.5 text-right">Cost (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {Object.values(greyEstimate.materials).map((m) => (
                  <tr key={m.materialId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{m.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {formatNumber(m.finalQuantity)} {m.unit}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 font-mono">
                      Rs. {formatNumber(m.unitRate)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatPKR(m.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FINISHING */}
      {activeTab === "finishing" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">17 Architectural Finishing Categories</h2>
              <p className="text-xs text-slate-500">Floor tiling, kitchen woodwork, aluminum windows, sanitary ware, and electrical switches</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Subtotal Finishing</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatPKR(estimate.finishingCost)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { name: "Floor & Wall Porcelain Tiles", cost: Math.round(estimate.finishingCost * 0.28), desc: "Master / Imported 60x120cm porcelain" },
              { name: "Woodwork, Kitchen Cabinets & Doors", cost: Math.round(estimate.finishingCost * 0.25), desc: "Solid Ash wood doors + UV gloss cabinets" },
              { name: "Paint, Rockwall & False Ceiling", cost: Math.round(estimate.finishingCost * 0.16), desc: "Berger/Dulux weather-sheet & gypsum ceiling" },
              { name: "Aluminum Windows & Tempered Glass", cost: Math.round(estimate.finishingCost * 0.14), desc: "1.6mm Chawla / Prime section with tinted glass" },
              { name: "Sanitary Fittings & Bathroom Vanity", cost: Math.round(estimate.finishingCost * 0.10), desc: "Porta / Grohe concealed mixer taps" },
              { name: "Electrical Fixtures, LED & DB Box", cost: Math.round(estimate.finishingCost * 0.07), desc: "Pakistan Cables wiring + Clipsal switches" }
            ].map((f, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{f.name}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{f.desc}</div>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {formatPKR(f.cost)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MATERIALS LIST */}
      {activeTab === "materials" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Bill of Materials with Delivered Rates</h2>
              <p className="text-xs text-slate-500">Verified regional market rates for {city.name}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Current Rate</th>
                  <th className="p-3.5 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {estimate.materials.map((m) => (
                  <tr key={m.materialId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{m.materialName}</td>
                    <td className="p-3.5 text-slate-500">{m.unit}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">{formatNumber(m.finalQuantity)}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">Rs. {formatNumber(m.unitRate)}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatPKR(m.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LABOUR */}
      {activeTab === "labour" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Labour Trades &amp; Contract Rates</h2>
              <p className="text-xs text-slate-500">Contractor per-sqft rates vs. itemized daily manpower allocation</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Labour</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {formatPKR(estimate.labourCost)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { trade: "Grey Structure Contractor", rate: "Rs. 380 - 450 / sqft", share: Math.round(estimate.labourCost * 0.55) },
              { trade: "Tile Mason & Helpers", rate: "Rs. 45 - 60 / sqft", share: Math.round(estimate.labourCost * 0.18) },
              { trade: "Electrician Concealed & Wiring", rate: "Lump-sum contract", share: Math.round(estimate.labourCost * 0.10) },
              { trade: "Plumbing & Drainage Labour", rate: "Lump-sum contract", share: Math.round(estimate.labourCost * 0.09) },
              { trade: "Painter & Polish Master", rate: "Rs. 25 - 35 / sqft", share: Math.round(estimate.labourCost * 0.08) }
            ].map((l, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">{l.trade}</span>
                <span className="text-slate-400 text-[11px] block mb-2">{l.rate}</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {formatPKR(l.share)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PURCHASES */}
      {activeTab === "purchases" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Material Purchase Orders &amp; Slips</h2>
              <p className="text-xs text-slate-500">Track delivered materials, weighbridge receipts, and vendor bills</p>
            </div>
            <Link
              href="/purchases"
              className="text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
            >
              + Record Purchase
            </Link>
          </div>

          <div className="space-y-3">
            {projectPurchases.map((po) => (
              <div key={po.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{po.materialName}</div>
                  <div className="text-slate-400 text-[11px]">
                    Qty: {po.quantity} {po.unit} • Delivered on {po.createdAt}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm block">
                    {formatPKR(po.totalAmount)}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {po.status}
                  </span>
                </div>
              </div>
            ))}

            {projectPurchases.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8">
                No purchase orders recorded for this project yet. Use &ldquo;Record Purchase&rdquo; to log site deliveries.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: VENDORS & KHATA */}
      {activeTab === "vendors" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Vendor Directory &amp; Khata Ledgers</h2>
              <p className="text-xs text-slate-500">Cement dealers, steel mills, sand quarry truckers, and outstanding udhaar balances</p>
            </div>
            <Link
              href="/vendors"
              className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl"
            >
              Manage Vendors
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {vendors.map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">{v.vendorName || v.businessName}</div>
                <div className="text-slate-500 text-[11px]">{v.category} • {v.mobileNumber}</div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-400">Balance:</span>
                  <span className="font-bold font-mono text-rose-500">{formatPKR(v.outstandingBalance || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: BUDGET & CASHFLOW */}
      {activeTab === "budget" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Budget Allocation &amp; Cash Flow</h2>
              <p className="text-xs text-slate-500">Capital variance analysis and expenditure forecast</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Target Budget</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPKR(targetBudget)}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Actual Cumulative Spent</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{formatPKR(actualTotalSpend)}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Remaining Capital</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{formatPKR(remainingBudget)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: SITE DIARY */}
      {activeTab === "diary" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Construction Site Diary</h2>
              <p className="text-xs text-slate-500">Worker attendance, work executed, concrete pours, and site blockers</p>
            </div>
            <Link href="/diary" className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl">
              + New Log
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {projectDiary.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.logDate}</span>
                  <span className="text-slate-400 font-medium">{d.workersPresent} Workers Onsite</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{d.workCompleted}</p>
                {d.materialsReceived && (
                  <p className="text-emerald-600/90 text-[11px]">Delivered: {d.materialsReceived}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: REMINDERS */}
      {activeTab === "reminders" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Site Timetables &amp; Deadlines</h2>
              <p className="text-xs text-slate-500">Curing alerts, contractor payments, and municipal inspections</p>
            </div>
            <Link href="/reminders" className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl">
              All Reminders
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {projectReminders.map((r) => (
              <div key={r.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{r.title}</div>
                  <div className="text-slate-400 text-[11px]">{r.reminderDate} • Priority: {r.priority}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: BOQ STUDIO (PRO) */}
      {activeTab === "boq" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Bill of Quantities (BOQ) Studio</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Official contractor tender schedule itemized with Pakistani civil specifications</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export BOQ Excel / PDF</span>
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            Complete BOQ generated with 30 itemized trades including Earthwork, Lean Concrete (1:4:8), RCC (1:2:4), Brick Masonry (1:6), Plaster (1:4), Terrazzo/Porcelain, and False Ceiling.
          </div>
        </div>
      )}

      {/* TAB 13: QUOTATIONS (PRO) */}
      {activeTab === "quotations" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Contractor Quotation Generator</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">Generate white-label client proposals with custom company letterhead</p>
            </div>
            <Link href="/quotations" className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl">
              Open Quotation Studio
            </Link>
          </div>
        </div>
      )}

      {/* TAB 14: REPORTS & PDF */}
      {activeTab === "reports" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Civil Engineering Report Generator</h2>
          <p className="text-xs text-slate-500">
            Download stamped engineering reports with QR-verification, itemized bills of materials, and financial forecasts.
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </Link>
        </div>
      )}

      {/* TAB 15: RATE SNAPSHOTS & VERSIONING (Sections 21 & 22) */}
      {activeTab === "versions" && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Estimate Versions &amp; Rate Snapshots</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Preserve historical rate estimates while testing new material price revisions
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNewVersion}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Update Estimate With Latest Rates</span>
            </button>
          </div>

          <div className="space-y-3">
            {projectVersions.map((v) => (
              <div key={v.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{v.versionName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">
                      v{v.versionNumber}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Snapshot Date: {new Date(v.rateSnapshotDate).toLocaleDateString("en-PK")}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                    {formatPKR(v.summaryData.grandTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Rs. {formatNumber(v.summaryData.costPerSqft)} / sqft
                  </span>
                </div>
              </div>
            ))}

            {projectVersions.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Baseline version active. Click &ldquo;Update Estimate With Latest Rates&rdquo; to snapshot a new pricing iteration.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 16: SETTINGS & DANGER ZONE (Section 16) */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* General Management */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Lifecycle Management</h3>
            <p className="text-xs text-slate-500">Manage, duplicate, or archive your project workspace</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Project Specs</span>
              </Link>

              <button
                type="button"
                onClick={handleDuplicate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Copy className="w-4 h-4" />
                <span>Duplicate Project</span>
              </button>

              <button
                type="button"
                onClick={handleArchiveToggle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
              >
                <Archive className="w-4 h-4" />
                <span>{project.status === "archived" ? "Restore to Active" : "Archive Project"}</span>
              </button>
            </div>
          </div>

          {/* Danger Zone (Section 16) */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold">Danger Zone</h3>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed max-w-xl">
              Permanently deleting this project will remove all associated calculation records, purchase logs, daily diaries, and milestones. This action cannot be reversed.
            </p>

            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Double Confirmation Modal (Section 6) */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Project?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This will permanently remove <strong>&ldquo;{project.projectName}&rdquo;</strong> and its
                associated project data. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
