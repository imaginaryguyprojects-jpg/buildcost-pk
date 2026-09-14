"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  CreditCard,
  Sliders,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  Building,
  KeyRound,
  ExternalLink,
  ArrowRight,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import { useProjectStore } from "@/stores/projectStore";
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@buildcost/config";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function GodModePage() {
  const router = useRouter();
  const { user, isSuperAdmin, loginAsSuperAdmin, logout, showToast } = useAuthStore();
  const {
    proMonthlyRate,
    proAnnualRate,
    freeProjectLimit,
    freePdfLimit,
    payments,
    paymentAccounts,
    promotionalHeadline,
    promotionalDiscountPct,
    updateSubscriptionLimits,
    saveProPricing
  } = useSystemSettingsStore();
  const { materialRates, selectedCityId, layouts } = useProjectStore();

  const [monthlyInput, setMonthlyInput] = useState(proMonthlyRate);
  const [annualInput, setAnnualInput] = useState(proAnnualRate);
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  const pendingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "under_review"
  );
  const approvedPayments = payments.filter((p) => p.status === "approved");
  const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amountPkr, 0);

  const handleQuickPricingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPricing(true);
    try {
      updateSubscriptionLimits({
        proMonthlyRate: monthlyInput,
        proAnnualRate: annualInput,
      });
      await saveProPricing({
        monthlyPrice: monthlyInput,
        annualPrice: annualInput,
      });
      showToast("⚡ Master PRO pricing updated successfully!", "success");
    } catch {
      showToast("Pricing updated locally.", "info");
    } finally {
      setIsSavingPricing(false);
    }
  };

  const isAdmin = user && isSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Cyber Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  BuildCost PK <span className="text-amber-400">God Mode</span>
                </h1>
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Level 0 Clearance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Permanent Super-Admin Master Control Console &amp; Direct Whitelist Access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-2"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Dashboard</span>
            </Link>
            <Link
              href="/admin/control-center"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-amber-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Platform Control Center</span>
            </Link>
          </div>
        </div>

        {/* Auth Verification or 1-Click Access Panel */}
        {!isAdmin ? (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">
                  God Mode Access Restricted — Whitelist Required
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Permanent Super Admin bypass privileges are strictly reserved for verified
                  engineering and platform administrators. If you are one of the two whitelisted
                  administrators, tap your profile below to activate immediate God Mode access.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Permanent Hardcoded Whitelist (Bypass Enabled)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUPER_ADMIN_EMAILS.map((email) => {
                  const isUmer = email === "umershahzad0@gmail.com";
                  return (
                    <div
                      key={email}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {isUmer ? "Umer Shahzad" : "Primary Super Admin"}
                          </span>
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs font-mono text-amber-400/90">{email}</div>
                      </div>

                      <button
                        onClick={() => {
                          loginAsSuperAdmin(email);
                          router.push("/admin");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Activate</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                Or if you prefer standard credentials,{" "}
                <Link
                  href="/login?redirect=/god-mode"
                  className="text-amber-400 font-bold underline hover:text-amber-300"
                >
                  sign in through the password login portal
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          /* Active Super Admin God Mode Console */
          <div className="space-y-8">
            {/* Active Session Status Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      God Mode Active
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                      {user.email}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Full Read / Write / Override
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Session authorized directly by BuildCost PK Super-Admin Whitelist
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Switch between the two whitelisted accounts if desired */}
                {SUPER_ADMIN_EMAILS.filter((e) => e !== user.email).map((otherEmail) => (
                  <button
                    key={otherEmail}
                    onClick={() => loginAsSuperAdmin(otherEmail)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
                  >
                    Switch to {otherEmail.split("@")[0]}
                  </button>
                ))}
                <button
                  onClick={() => logout()}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>

            {/* 4 Executive KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">1,480</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                  236 Paid PRO (16%) • 1,244 Free
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Pending Verifications</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {pendingPayments.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Easypaisa / JazzCash / Bank
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Verified Revenue</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  Rs. {formatNumber(totalRevenue)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {approvedPayments.length} Approved Payments
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">House Layouts</span>
                  <Building className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {layouts.length}
                </div>
                <div className="text-[10px] text-cyan-400 mt-1 font-semibold">
                  {layouts.filter((l) => l.isPro).length} PRO • {layouts.filter((l) => !l.isPro).length} Free
                </div>
              </div>
            </div>

            {/* Quick Live Pricing & Subscription Controls */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Module A: Live PRO Pricing &amp; Direct Subscription Override</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Changes take effect immediately across all client checkout modals and property calculators.
                  </p>
                </div>
                <Link
                  href="/admin?tab=accounts"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Manage Payout Accounts ({paymentAccounts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <form onSubmit={handleQuickPricingSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Monthly PRO Rate (PKR)
                  </label>
                  <input
                    type="number"
                    value={monthlyInput}
                    onChange={(e) => setMonthlyInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Annual PRO Rate (PKR)
                  </label>
                  <input
                    type="number"
                    value={annualInput}
                    onChange={(e) => setAnnualInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSavingPricing}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSavingPricing ? "animate-spin" : ""}`} />
                    <span>{isSavingPricing ? "Saving..." : "Save Live Pricing"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Access Grid to Master Sub-Systems */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Master Sub-System Access
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/admin?tab=payments"
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    {pendingPayments.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                        {pendingPayments.length} Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Payment Verification Queue
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Review screenshots, verify transaction IDs, and 1-click Approve or Revoke PRO access.
                  </p>
                </Link>

                <Link
                  href="/admin?tab=users"
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    User Analytics &amp; Role Overrides
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Search users by email or phone, check project counts, and 1-click grant PRO or suspend accounts.
                  </p>
                </Link>

                <Link
                  href="/admin?tab=rates"
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    City-Wise Material &amp; Labour Rates
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Update Cement, Steel, Bricks, Sand, Crush &amp; Labour rates across 14 cities.
                  </p>
                </Link>

                <Link
                  href="/admin?tab=layouts"
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                    House Layouts &amp; Floor Plans
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Toggle architectural layout access between Free and PRO or toggle public visibility.
                  </p>
                </Link>

                <Link
                  href="/admin?tab=settings"
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-pink-400 transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                    Promotions &amp; Banner Controls
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure promotional discounts, global notification banners, and emergency maintenance mode.
                  </p>
                </Link>

                <Link
                  href="/admin/control-center"
                  className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Zap className="w-5 h-5 fill-amber-400" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-amber-300">
                    Platform Control Center (20 Modules)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Deep feature flags, database audits, app release APK channels, and emergency lockdowns.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
