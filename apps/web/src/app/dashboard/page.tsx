"use client";

import React, { useState } from "react";
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
  PieChart as PieChartIcon,
  Zap,
  ShieldCheck,
  X,
  Boxes,
  Hammer,
  Truck,
  Layers,
  Bot,
  Compass,
  Sparkles,
  Lock,
  ExternalLink
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import { SUPER_ADMIN_EMAILS, PAKISTANI_CITIES } from "@buildcost/config";
import { formatPKR, formatNumber, formatCurrency } from "@/lib/formatters";
import { PrimaryPropertyCalculator } from "@/components/dashboard/PrimaryPropertyCalculator";
import { DashboardProCard } from "@/components/pro/DashboardProCard";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    getActiveProject,
    reminders,
    purchases,
    siteDiary,
    materialRates,
    vendors
  } = useProjectStore();

  const { user, isSuperAdmin, openCheckoutModal, openProjectUpgradeModal } = useAuthStore();
  const isSuper = isSuperAdmin();
  const [superAdminBannerDismissed, setSuperAdminBannerDismissed] = useState(false);

  const activeProject = getActiveProject();

  // Next upcoming reminders (only next 3 items)
  const upcomingReminders = reminders.slice(0, 3);

  // Quick live benchmarks for the compact lower section
  const sampleRates = materialRates.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 pb-12">
      {/* 1-Line Compact Dismissible Super Admin Banner */}
      {isSuper && !superAdminBannerDismissed && (
        <div className="p-2.5 px-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Super Admin God-Mode Active — Logged in as <strong>{user?.email}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-2">
            <Link
              href="/admin/control-center"
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline hover:text-amber-500"
            >
              Control Center
            </Link>
            <Link
              href="/admin?tab=accounts"
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline hover:text-amber-500"
            >
              Payment Accounts
            </Link>
            <button
              onClick={() => setSuperAdminBannerDismissed(true)}
              className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-200"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: PRIMARY PROPERTY CALCULATOR (HERO PLACEMENT) */}
      {/* ======================================================== */}
      <PrimaryPropertyCalculator />

      {/* ======================================================== */}
      {/* SECTION 2: COMPACT SECONDARY DASHBOARD MODULES */}
      {/* (Carefully sized so they do NOT compete with Calculator) */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-500" />
              <span>Construction Suite &amp; Market Intelligence</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Deep-dive civil engineering modules, daily trade rates, and project khata.
            </p>
          </div>

          <Link
            href="/calculator"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>All Calculators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Compact Supporting Tool Cards (2 Rows of 4 on Desktop, 2x2 on Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Material Rates */}
          <Link
            href="/rates/materials"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Market Feeds</span>
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Material Rates
              </span>
              <span className="text-[10px] text-slate-400">
                Cement, Steel, Bricks across 13 cities
              </span>
            </div>
          </Link>

          {/* 2. Labour Rates */}
          <Link
            href="/labour"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Wages</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Hammer className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Labour &amp; Mistri
              </span>
              <span className="text-[10px] text-slate-400">
                Mason, helper, plumber, electrician
              </span>
            </div>
          </Link>

          {/* 3. Grey Structure Estimator */}
          <Link
            href="/calculator/concrete"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Civil Shell</span>
              <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Building className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Grey Structure
              </span>
              <span className="text-[10px] text-slate-400">
                RCC slabs, columns, beams, brickwork
              </span>
            </div>
          </Link>

          {/* 4. Finishing Works */}
          <Link
            href="/calculator/paint"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">17 Categories</span>
              <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Finishing Package
              </span>
              <span className="text-[10px] text-slate-400">
                Tiles, marble, sanitary, woodwork
              </span>
            </div>
          </Link>

          {/* 5. BOQ Studio */}
          <Link
            href="/boq"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Formal Bills</span>
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[8px] font-bold">PRO</span>
              </span>
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                BOQ Generator
              </span>
              <span className="text-[10px] text-slate-400">
                Itemized Bill of Quantities export
              </span>
            </div>
          </Link>

          {/* 6. Vendor Khata */}
          <Link
            href="/vendors"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Khata</span>
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[8px] font-bold">PRO</span>
              </span>
              <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Building className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Vendor Directory
              </span>
              <span className="text-[10px] text-slate-400">
                Supplier ledger, dues &amp; purchases
              </span>
            </div>
          </Link>

          {/* 7. Transport & Freight */}
          <Link
            href="/transport"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logistics</span>
              <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                Transport Calculator
              </span>
              <span className="text-[10px] text-slate-400">
                Dumper, Mazada &amp; Shahzore tariffs
              </span>
            </div>
          </Link>

          {/* 8. AI Advisor */}
          <Link
            href="/advisor"
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-xs group flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <span>Civil AI</span>
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[8px] font-bold">PRO</span>
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-white block group-hover:text-emerald-400 transition-colors">
                AI Construction Advisor
              </span>
              <span className="text-[10px] text-slate-400">
                Smart cost reduction recommendations
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: PROJECT ACTIVITY & REMINDERS (COMPACT FOOTER) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs pt-2">
        {/* Active Project Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Workspace</span>
            <Link href="/projects" className="text-emerald-500 text-[11px] font-semibold hover:underline">
              View All ({projects.length})
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {activeProject?.projectName || "Default Estimator"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeProject?.location || "Islamabad"} • {activeProject?.coveredArea || 2000} sqft
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/projects/new"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Site Reminders Card */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Upcoming Construction Reminders</span>
            </span>
            <Link href="/reminders" className="text-emerald-500 text-[11px] font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((rem) => (
                <div key={rem.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate text-[11px]">
                    {rem.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Date: {rem.reminderDate}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-2 text-slate-400 text-xs">
                No pending site alerts. Ready for next construction stage.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
