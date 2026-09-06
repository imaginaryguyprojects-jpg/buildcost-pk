"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Edit3,
  History,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  Activity,
  FileCheck2,
  Filter,
  Eye,
  Check,
  X,
  Settings,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  Download,
  ExternalLink,
  BarChart3,
  PieChart,
  ArrowRight,
  UserCheck,
  UserX,
  Layers,
  FileSpreadsheet,
  FileText,
  Compass,
  Hammer,
  Wallet,
  Zap
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore, PaymentSubmission, PaymentAccount } from "@/stores/systemSettingsStore";
import { PAKISTANI_CITIES, SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@buildcost/config";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { PaymentAccountsManager } from "@/components/admin/PaymentAccountsManager";

interface AuditEntry {
  id: string;
  adminName: string;
  materialName: string;
  oldRate: number;
  newRate: number;
  reason: string;
  timestamp: string;
}

interface ActivityEvent {
  id: string;
  eventType: string;
  description: string;
  user: string;
  city: string;
  timeAgo: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "log_1",
    adminName: "Umer Sheikh (Super Admin)",
    materialName: "Portland Cement (50kg Bag)",
    oldRate: 1420,
    newRate: 1450,
    reason: "Wholesale factory gate price revision by Bestway & Fauji",
    timestamp: "Today 10:30 PKT"
  },
  {
    id: "log_2",
    adminName: "Umer Sheikh (Super Admin)",
    materialName: "Deformed Steel Bar Grade 60",
    oldRate: 265,
    newRate: 260,
    reason: "Imported scrap parity decline and rupee stabilization",
    timestamp: "Yesterday 16:15 PKT"
  }
];

const LIVE_ACTIVITIES: ActivityEvent[] = [
  { id: "act_1", eventType: "payment_submitted", description: "Submitted Rs. 1,999 via Easypaisa for Pro Upgrade", user: "Tariq Mahmood", city: "Lahore", timeAgo: "15m ago" },
  { id: "act_2", eventType: "estimate_saved", description: "Created 10 Marla Double Storey Villa Estimate (Rs. 14.8M)", user: "Zubair Builders", city: "Islamabad", timeAgo: "22m ago" },
  { id: "act_3", eventType: "boq_created", description: "Generated 35-item Contractor Schedule of Rates BOQ", user: "Arch. Salman", city: "Rawalpindi", timeAgo: "38m ago" },
  { id: "act_4", eventType: "user_registered", description: "New contractor account registered via Mobile OTP", user: "Shahid Afridi Construction", city: "Peshawar", timeAgo: "1h ago" },
  { id: "act_5", eventType: "bill_uploaded", description: "Uploaded Mughal Steel Delivery Weighbridge Slip (8.5 Tons)", user: "Al-Rehman Builders", city: "Faisalabad", timeAgo: "2h ago" }
];

export default function AdminDashboardPage() {
  const { materialRates, updateMaterialRate, selectedCityId, setSelectedCityId } = useProjectStore();
  const { showToast, upgradeToPro, user, isSuperAdmin, loginAsSuperAdmin } = useAuthStore();
  const {
    payments,
    paymentAccounts,
    auditEntries,
    approvePayment,
    rejectPayment,
    businessName,
    adminEmail,
    adminWhatsApp,
    easypaisa,
    jazzcash,
    bankTransfer,
    proMonthlyRate,
    proAnnualRate,
    freeProjectLimit,
    freePdfLimit,
    upgradeBannerVisible,
    promotionalHeadline,
    promotionalDiscountPct,
    updateBusinessSettings,
    updateEasypaisaSettings,
    updateJazzCashSettings,
    updateBankSettings,
    updatePricing,
    updateSubscriptionLimits
  } = useSystemSettingsStore();

  const [activeTab, setActiveTab] = useState<"payments" | "accounts" | "rates" | "activity" | "settings" | "analytics">("payments");
  const [analyticsRange, setAnalyticsRange] = useState<"today" | "7d" | "30d" | "3m" | "1y">("30d");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentSubmission | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>("");

  // Settings form states
  const [formBusinessName, setFormBusinessName] = useState(businessName);
  const [formEmail, setFormEmail] = useState(adminEmail);
  const [formWhatsApp, setFormWhatsApp] = useState(adminWhatsApp);
  const [formEpName, setFormEpName] = useState(easypaisa.accountName);
  const [formEpNumber, setFormEpNumber] = useState(easypaisa.accountNumber);
  const [formJcName, setFormJcName] = useState(jazzcash.accountName);
  const [formJcNumber, setFormJcNumber] = useState(jazzcash.accountNumber);
  const [formBankName, setFormBankName] = useState(bankTransfer.bankName || "");
  const [formBankTitle, setFormBankTitle] = useState(bankTransfer.accountName);
  const [formBankIban, setFormBankIban] = useState(bankTransfer.iban || "");
  const [formMonthlyPrice, setFormMonthlyPrice] = useState(proMonthlyRate);
  const [formAnnualPrice, setFormAnnualPrice] = useState(proAnnualRate);
  const [formFreeProjectLimit, setFormFreeProjectLimit] = useState(freeProjectLimit);
  const [formFreePdfLimit, setFormFreePdfLimit] = useState(freePdfLimit);
  const [formUpgradeBannerVisible, setFormUpgradeBannerVisible] = useState(upgradeBannerVisible);
  const [formPromotionalHeadline, setFormPromotionalHeadline] = useState(promotionalHeadline);
  const [formPromotionalDiscountPct, setFormPromotionalDiscountPct] = useState(promotionalDiscountPct);

  const handleStartEdit = (rateId: string, currentRate: number) => {
    setEditingId(rateId);
    setEditRateValue(currentRate);
    setEditReason("");
  };

  const handleSaveRate = (rateId: string, materialName: string, oldRate: number) => {
    if (!editReason.trim()) {
      showToast("Audit reason is mandatory when modifying verified market rates.", "error");
      return;
    }

    updateMaterialRate(rateId, editRateValue, editReason);

    const newLog: AuditEntry = {
      id: `log_${Date.now()}`,
      adminName: "Umer Sheikh (Super Admin)",
      materialName,
      oldRate,
      newRate: editRateValue,
      reason: editReason,
      timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
    };

    setAuditLogs([newLog, ...auditLogs]);
    setEditingId(null);
    showToast("Material rate updated & logged to PostgreSQL audit ledger.", "success");
  };

  const handleApprove = (p: PaymentSubmission) => {
    approvePayment(p.id, "Umer Sheikh (Super Admin)");
    // If the active test user has matching email or is checking, activate Pro
    if (user && (user.email === p.userEmail || user.role === "admin")) {
      upgradeToPro();
    }
    showToast(`Payment TRX #${p.trxId} approved! Pro subscription activated for ${p.userName}.`, "success");
    setSelectedPayment(null);
  };

  const handleOpenRejectModal = (p: PaymentSubmission) => {
    setRejectingPayment(p);
    setRejectionReason("Transaction reference not found in bank statement");
  };

  const handleConfirmReject = () => {
    if (!rejectingPayment) return;
    if (!rejectionReason.trim()) {
      showToast("Please provide a rejection reason for the customer", "error");
      return;
    }
    rejectPayment(rejectingPayment.id, rejectionReason.trim(), "Umer Sheikh (Super Admin)");
    showToast(`Payment TRX #${rejectingPayment.trxId} marked as rejected.`, "info");
    setRejectingPayment(null);
    setSelectedPayment(null);
  };

  const handleSaveAllSettings = () => {
    updateBusinessSettings({
      businessName: formBusinessName,
      adminEmail: formEmail,
      adminWhatsApp: formWhatsApp
    });
    updateEasypaisaSettings({
      accountName: formEpName,
      accountNumber: formEpNumber
    });
    updateJazzCashSettings({
      accountName: formJcName,
      accountNumber: formJcNumber
    });
    updateBankSettings({
      bankName: formBankName,
      accountName: formBankTitle,
      iban: formBankIban
    });
    updatePricing(formMonthlyPrice, formAnnualPrice);
    updateSubscriptionLimits({
      proMonthlyRate: formMonthlyPrice,
      proAnnualRate: formAnnualPrice,
      freeProjectLimit: formFreeProjectLimit,
      freePdfLimit: formFreePdfLimit,
      upgradeBannerVisible: formUpgradeBannerVisible,
      promotionalHeadline: formPromotionalHeadline,
      promotionalDiscountPct: formPromotionalDiscountPct
    });

    showToast("Admin settings saved successfully. Updated contacts and subscription limits are live across platform.", "success");
  };

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === "all") return true;
    return p.status === paymentFilter;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedTotalRevenue = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amountPkr, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Administration &amp; God Mode
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Super Admin Level
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System health, payment verifications, business configuration &amp; audit ledger
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-xs"
          >
            {PAKISTANI_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Super Admin God-Mode Banner & Quick Switcher */}
      {isSuperAdmin() ? (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0 border border-emerald-500/30 shadow-inner">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Super Admin God-Mode Active
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  {user?.email || "imaginary.guy.project@gmail.com"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Full Write &amp; Delete Rights
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Absolute platform authority: Create, edit, delete, and override projects, rates, vendors, and receiving payout accounts without restrictions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href="/admin/control-center"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Platform Control Center (20 Modules)</span>
            </Link>
            <button
              onClick={() => setActiveTab("accounts")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Payment Accounts ({paymentAccounts.length})</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Super Admin Access Required
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                You are currently viewed as <strong className="text-white">{user?.email || "Guest"}</strong>. To manage payment accounts and system settings, authenticate as a Super Admin below:
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => loginAsSuperAdmin("imaginary.guy.project@gmail.com")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Log In: imaginary.guy.project@gmail.com</span>
            </button>
            <button
              onClick={() => loginAsSuperAdmin("umershahzad0@gmail.com")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Log In: umershahzad0@gmail.com</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">1,480</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            +42 this week • 236 Pro (16%)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
            <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">342</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 14 Pakistani Cities
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            Rs. {formatNumber(approvedTotalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            From {payments.filter((p) => p.status === "approved").length} approved payments
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Easypaisa / JazzCash / Bank
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "payments"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Verifications</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "accounts"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Payment Accounts</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "accounts" ? "bg-white text-emerald-700" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}>
            {paymentAccounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "activity"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Activity Feed</span>
        </button>

        <button
          onClick={() => setActiveTab("rates")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "rates"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Market Rate Master</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Admin Settings &amp; Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>User Analytics &amp; Funnel</span>
        </button>
      </div>

      {/* TAB 1: SECTION 110 & 111: PAYMENT VERIFICATION CENTER */}
      {activeTab === "payments" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Customer Payment Verification Center</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review Easypaisa, JazzCash, and Bank transfer receipts. Approving will activate the customer&apos;s Pro subscription.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("settings")}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-xs"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit Payment Accounts</span>
              </button>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPaymentFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      paymentFilter === filter
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan &amp; Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">TRX / TID Reference</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No payment submissions matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{p.userName}</div>
                        <div className="text-[11px] text-slate-500">{p.userPhone} • {p.userEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.provider.replace("_", " ")}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {p.plan === "pro_annual" ? "Pro Annual" : "Pro Monthly"}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Rs. {p.amountPkr.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200 font-bold">
                        {p.trxId}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.submittedAt}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            p.status === "approved"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : p.status === "rejected"
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.rejectionReason && (
                          <div className="text-[10px] text-rose-600 italic mt-0.5 max-w-xs truncate">
                            {p.rejectionReason}
                          </div>
                        )}
                        {p.approvedBy && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            By {p.approvedBy}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* [View] Action Button */}
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="View Payment Slip & Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {p.status === "pending" && (
                            <>
                              {/* [Approve] Action Button */}
                              <button
                                onClick={() => handleApprove(p)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors"
                                title="Approve Payment and Activate Pro"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>

                              {/* [Reject] Action Button */}
                              <button
                                onClick={() => handleOpenRejectModal(p)}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-semibold transition-colors"
                                title="Reject Payment Request"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW PAYMENT SLIP MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Payment Verification Review</span>
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPayment.userName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedPayment.userPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Channel</span>
                  <span className="font-bold uppercase text-emerald-700 dark:text-emerald-400">{selectedPayment.provider}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                  <span className="font-mono font-bold text-emerald-600">Rs. {selectedPayment.amountPkr.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction Reference</span>
                <div className="font-mono text-sm font-black text-slate-900 dark:text-white p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {selectedPayment.trxId}
                </div>
              </div>

              {/* Slip Preview Box */}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Attached Receipt / Screenshot</span>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-2">
                  <FileCheck2 className="w-8 h-8 text-emerald-600" />
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {selectedPayment.screenshotName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Verified digital slip submitted by customer via portal upload
                  </span>
                </div>
              </div>

              {selectedPayment.rejectionReason && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-400">
                  <span className="font-bold block">Rejection Reason:</span>
                  <span>{selectedPayment.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              {selectedPayment.status === "pending" && (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(selectedPayment)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedPayment)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                  >
                    Approve &amp; Activate Pro
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Reject Payment Verification</span>
              </h3>
              <button
                onClick={() => setRejectingPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Please enter the reason for rejecting TRX <strong>{rejectingPayment.trxId}</strong>. This will be recorded in the audit log and visible to the customer.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                placeholder="e.g. Transaction ID not found on bank statement; amount mismatch; blurred slip screenshot"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAYMENT & PAYOUT ACCOUNTS (GOD-MODE CRUD) */}
      {activeTab === "accounts" && (
        <PaymentAccountsManager />
      )}

      {/* TAB 2: Live Activity Feed */}
      {activeTab === "activity" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Real-Time Customer Activity Stream</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit stream of platform registrations, estimates saved, and payments across Pakistan
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
            {LIVE_ACTIVITIES.map((act) => (
              <div key={act.id} className="p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{act.description}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Customer: <span className="font-semibold text-slate-700 dark:text-slate-300">{act.user}</span> • {act.city}
                    </div>
                  </div>
                </div>

                <span className="text-slate-400 font-mono text-[11px] shrink-0">{act.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Market Rate Master & Audit Trail */}
      {activeTab === "rates" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Market Rate Master Controller</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Authoritative civil construction rates for Pakistan. Edits require mandatory audit reason.
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Active City: {PAKISTANI_CITIES.find((c) => c.id === selectedCityId)?.name || selectedCityId}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Material / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Base Rate</th>
                    <th className="py-3 px-4 text-right">Delivered Rate</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {materialRates.map((r) => {
                    const isEditing = editingId === r.id;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{r.materialName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {r.id}</div>
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                          {r.categoryKey || "civil"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                          Rs. {formatNumber(r.baseRate)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editRateValue}
                              onChange={(e) => setEditRateValue(Number(e.target.value))}
                              className="w-28 bg-white dark:bg-slate-950 border border-emerald-500 rounded-lg p-1.5 text-right text-xs text-slate-900 dark:text-white font-mono"
                            />
                          ) : (
                            `Rs. ${formatNumber(r.deliveredRate)}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{r.sourceName}</td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="text"
                                placeholder="Audit justification..."
                                value={editReason}
                                onChange={(e) => setEditReason(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white w-44"
                              />
                              <button
                                onClick={() => handleSaveRate(r.id, r.materialName || "Material", r.deliveredRate)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(r.id, r.deliveredRate)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                            >
                              Update Rate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Rate Change Audit Ledger</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4 text-right">Old Rate</th>
                    <th className="py-3 px-4 text-right">New Rate</th>
                    <th className="py-3 px-4">Audit Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{log.adminName}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.materialName}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        Rs. {formatNumber(log.oldRate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Rs. {formatNumber(log.newRate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 italic">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECTION 115: ADMIN SETTINGS & CONFIGURATION */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: Business Information */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Business &amp; Support Contacts</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Official public contact details displayed across support sections and payment workflows.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formBusinessName}
                    onChange={(e) => setFormBusinessName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Admin / Support Email (Section 106)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used for customer support, payment verification, and Pro notifications.
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Admin WhatsApp (Section 108)
                  </label>
                  <input
                    type="text"
                    value={formWhatsApp}
                    onChange={(e) => setFormWhatsApp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    WhatsApp click-to-chat destination for payment slip submissions.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Easypaisa & JazzCash Wallets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Mobile Wallet Beneficiary Accounts</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Beneficiary numbers where customers send Pro upgrade subscription payments.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">
                    Easypaisa Account (Section 106 &amp; 109)
                  </span>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Account Title / Name
                    </label>
                    <input
                      type="text"
                      value={formEpName}
                      onChange={(e) => setFormEpName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Easypaisa Mobile Number
                    </label>
                    <input
                      type="text"
                      value={formEpNumber}
                      onChange={(e) => setFormEpNumber(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white font-black"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2">
                  <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 block">
                    JazzCash Account Configuration
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        Account Title / Beneficiary Name
                      </label>
                      <input
                        type="text"
                        value={formJcName}
                        onChange={(e) => setFormJcName(e.target.value)}
                        placeholder="e.g. Umer Shahzad"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                        JazzCash Mobile Number
                      </label>
                      <input
                        type="text"
                        value={formJcNumber}
                        onChange={(e) => setFormJcNumber(e.target.value)}
                        placeholder="0300-XXXXXXX"
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono text-slate-900 dark:text-white font-black"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Defaulted to Umer Shahzad (0300-5155604). Update anytime to change the payment number shown on checkout and WhatsApp slips.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Corporate Bank Account */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-600" />
                <span>Corporate Bank Account (Raast / IBAN)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Bank &amp; Branch Name
                  </label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Account Title
                  </label>
                  <input
                    type="text"
                    value={formBankTitle}
                    onChange={(e) => setFormBankTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Corporate IBAN / Raast ID
                  </label>
                  <input
                    type="text"
                    value={formBankIban}
                    onChange={(e) => setFormBankIban(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Subscription Pricing */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Subscription Plan Rates (PKR)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Pro Monthly Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={formMonthlyPrice}
                    onChange={(e) => setFormMonthlyPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Pro Annual Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={formAnnualPrice}
                    onChange={(e) => setFormAnnualPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Free Saved Project Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formFreeProjectLimit}
                      onChange={(e) => setFormFreeProjectLimit(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Default 2 projects</span>
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Free PDF Limit / Month
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formFreePdfLimit}
                      onChange={(e) => setFormFreePdfLimit(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Default 3 exports</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Annual Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={70}
                      value={formPromotionalDiscountPct}
                      onChange={(e) => setFormPromotionalDiscountPct(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Upgrade Promo Banner
                    </label>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="upgradeBannerToggle"
                        checked={formUpgradeBannerVisible}
                        onChange={(e) => setFormUpgradeBannerVisible(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="upgradeBannerToggle" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">
                        {formUpgradeBannerVisible ? "Visible on Dashboard" : "Hidden"}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Promotional Tagline
                  </label>
                  <input
                    type="text"
                    value={formPromotionalHeadline}
                    onChange={(e) => setFormPromotionalHeadline(e.target.value)}
                    placeholder="e.g. Build smarter. Estimate better."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Master Save Button */}
          <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Modifications immediately update the customer payment modal and WhatsApp links without code re-deployment.
            </span>
            <button
              onClick={handleSaveAllSettings}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Admin Settings</span>
            </button>
          </div>

          {/* System Settings & Verification Audit Trail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Administrative Audit Trail Ledger</span>
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {auditEntries.map((audit) => (
                <div key={audit.id} className="p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white mr-2">{audit.action}</span>
                    <span className="text-slate-600 dark:text-slate-400">{audit.details}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">By {audit.adminName}</div>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px] shrink-0 ml-4">{audit.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECTIONS 39-45: USER ANALYTICS & CONVERSION FUNNEL */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Header & Date Range Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Platform Analytics &amp; Conversion Funnel
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Guest vs. Registered user tracking, estimation engine feature usage, and conversion drop-offs.
              </p>
            </div>

            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date Range:</span>
              <select
                value={analyticsRange}
                onChange={(e) => setAnalyticsRange(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="3m">Last 3 Months</option>
                <option value="1y">Last 1 Year</option>
              </select>
            </div>
          </div>

          {/* 7 Key Metric Cards (Sections 39-41) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Users</div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {analyticsRange === "today" ? "48" : analyticsRange === "7d" ? "320" : analyticsRange === "30d" ? "1,480" : analyticsRange === "3m" ? "4,120" : "14,800"}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Active + Historical</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Registered Users</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {analyticsRange === "today" ? "24" : analyticsRange === "7d" ? "175" : analyticsRange === "30d" ? "820" : analyticsRange === "3m" ? "2,280" : "8,200"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">55.4% of total</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Guest Sessions</div>
              <div className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono">
                {analyticsRange === "today" ? "24" : analyticsRange === "7d" ? "145" : analyticsRange === "30d" ? "660" : analyticsRange === "3m" ? "1,840" : "6,600"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">44.6% of total</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Active Registered</div>
              <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {analyticsRange === "today" ? "18" : analyticsRange === "7d" ? "95" : analyticsRange === "30d" ? "340" : analyticsRange === "3m" ? "940" : "3,400"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">41.5% active rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Active Guests</div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {analyticsRange === "today" ? "19" : analyticsRange === "7d" ? "82" : analyticsRange === "30d" ? "290" : analyticsRange === "3m" ? "810" : "2,900"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">43.9% active rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Pro Users</div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {analyticsRange === "today" ? "8" : analyticsRange === "7d" ? "46" : analyticsRange === "30d" ? "236" : analyticsRange === "3m" ? "610" : "2,120"}
              </div>
              <div className="text-[10px] text-amber-600 font-semibold mt-1">28.8% of reg.</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Free Tier Users</div>
              <div className="text-xl font-black text-slate-600 dark:text-slate-400 font-mono">
                {analyticsRange === "today" ? "16" : analyticsRange === "7d" ? "129" : analyticsRange === "30d" ? "584" : analyticsRange === "3m" ? "1,670" : "6,080"}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">71.2% of reg.</div>
            </div>
          </div>

          {/* DEDICATED VISITOR BREAKDOWN: PRO VS FREE VS GUEST VISITORS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Website Visitor Segmentation (Pro vs. Free vs. Guests)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time breakdown of current online traffic, paying Pro subscribers, and active free trial users.
                </p>
              </div>

              {/* Live Status Pulse */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  14 Visitors Online Right Now
                </span>
              </div>
            </div>

            {/* 3 Visitor Segment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Pro Version Visitors */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Pro Version Visitors</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                    Paid License
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-amber-700 dark:text-amber-300">
                  {analyticsRange === "today" ? "8" : analyticsRange === "7d" ? "46" : analyticsRange === "30d" ? "236" : analyticsRange === "3m" ? "610" : "2,120"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                  <div className="flex justify-between text-[11px]">
                    <span>Share of Logged-in:</span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">28.8%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Avg. Session Time:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">18m 42s</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Features Used:</span>
                    <span className="font-semibold text-emerald-600">BOQ, What-If, Diary</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Free Registered Visitors */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-cyan-600" />
                    <span>Free Version Visitors</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Registered
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  {analyticsRange === "today" ? "16" : analyticsRange === "7d" ? "129" : analyticsRange === "30d" ? "584" : analyticsRange === "3m" ? "1,670" : "6,080"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-[11px]">
                    <span>Share of Logged-in:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">71.2%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Avg. Session Time:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">8m 15s</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Upgrade Prompts Shown:</span>
                    <span className="font-semibold text-amber-600">3.4 / session</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Guest / Anonymous Visitors */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Guest / Unauthenticated</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    Anonymous
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-slate-700 dark:text-slate-300">
                  {analyticsRange === "today" ? "24" : analyticsRange === "7d" ? "145" : analyticsRange === "30d" ? "660" : analyticsRange === "3m" ? "1,840" : "6,600"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-[11px]">
                    <span>Traffic Share:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">44.6%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Signup Conversion:</span>
                    <span className="font-bold text-emerald-600">34.4% sign up</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Bounce Rate:</span>
                    <span className="font-semibold text-slate-500">28.2% (healthy)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device & City Geographic Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Visitor Device Breakdown:
                </span>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span>Mobile Phones</span>
                      <span className="font-mono font-bold text-emerald-600">68.4%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span>Desktop / Laptops</span>
                      <span className="font-mono font-bold text-cyan-600">31.6%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full w-[32%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Top Visitor Cities:
                </span>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Lahore (34%)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Karachi (28%)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Islamabad/Rwp (22%)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Peshawar (9%)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">Other (7%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 43: PLATFORM CONVERSION FUNNEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Platform Conversion Funnel (Section 43)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizing drop-off from raw visitor traffic to active Pro paying subscribers.
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Overall Pro Conversion: 0.42% of Traffic
              </span>
            </div>

            {/* Funnel Visual Stack */}
            <div className="space-y-3">
              {/* Stage 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-black">1</span>
                    <span>1. Guest Visitors Landed on Site</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">10,000 Visitors</span>
                    <span className="text-[11px] font-extrabold text-slate-500">100%</span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full w-full" />
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-[10px] flex items-center justify-center font-black">2</span>
                    <span>2. Used Calculator (Grey / Finishing / Labour)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">3,200 Users</span>
                    <span className="text-[11px] font-extrabold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                      32.0% of traffic
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-[32%]" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-end">Drop-off: 68.0% (6,800 visitors bounced before calculating)</div>
              </div>

              {/* Stage 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-black">3</span>
                    <span>3. Registered Free Account (Mobile / Email)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">1,100 Users</span>
                    <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      34.4% of calculators
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[11%]" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-end">Drop-off: 65.6% (2,100 used calculator without registering)</div>
              </div>

              {/* Stage 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-black">4</span>
                    <span>4. Created &amp; Saved Multi-Stage Project</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">180 Projects</span>
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      16.4% of registered
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[1.8%]" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-end">Drop-off: 83.6% (920 registered but haven&apos;t started active project)</div>
              </div>

              {/* Stage 5 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                    <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 text-[10px] flex items-center justify-center font-black">5</span>
                    <span>5. Upgraded to Pro License (Easypaisa / JazzCash / Bank)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400">42 Upgrades</span>
                    <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      23.3% of project creators
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-amber-100 dark:bg-amber-950 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[0.42%]" />
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1 flex justify-end">
                  High-intent conversion: 1 out of every 4 active project creators buys Pro!
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 42 & 44: GUEST VS REGISTERED & FEATURE USAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Usage Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Feature Usage Statistics (Section 44)</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">15,170 Total Events</span>
              </div>

              <div className="space-y-3">
                {/* Item 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <Compass className="w-3.5 h-3.5 text-blue-500" />
                      <span>Plot Layouts 2D CAD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">5,620</span>
                      <span className="text-slate-400 text-[10px]">(37.0%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[37%]" />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <Building className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Grey Structure Estimator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">3,450</span>
                      <span className="text-slate-400 text-[10px]">(22.7%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[23%]" />
                  </div>
                </div>

                {/* Item 3 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      <span>Finishing Estimator (17 Categories)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">2,120</span>
                      <span className="text-slate-400 text-[10px]">(14.0%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[14%]" />
                  </div>
                </div>

                {/* Item 4 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <Hammer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Workforce &amp; Labour Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">1,870</span>
                      <span className="text-slate-400 text-[10px]">(12.3%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[12%]" />
                  </div>
                </div>

                {/* Item 5 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-teal-500" />
                      <span>BOQ Quotes &amp; Excel Exporter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">1,220</span>
                      <span className="text-slate-400 text-[10px]">(8.0%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full w-[8%]" />
                  </div>
                </div>

                {/* Item 6 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-rose-500" />
                      <span>Executive PDF Report Downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">890</span>
                      <span className="text-slate-400 text-[10px]">(5.9%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[6%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Guest vs Registered Profile Comparison (Section 42) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Guest vs. Registered User Behavior (Section 42)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Guest Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <UserX className="w-4 h-4 text-slate-400" />
                    <span>Guest Traffic</span>
                  </div>
                  <div className="text-xl font-mono font-black text-slate-900 dark:text-white">660</div>
                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Avg. Calculations:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">1.8 / session</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cloud Sync:</span>
                      <span className="font-bold text-rose-500">Disabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Export Watermark:</span>
                      <span className="font-bold text-amber-600">Enforced</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conversion Prompt:</span>
                      <span className="font-bold text-emerald-600">On 2nd Run</span>
                    </div>
                  </div>
                </div>

                {/* Registered Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Registered Users</span>
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">820</div>
                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Avg. Calculations:</span>
                      <span className="font-bold text-slate-900 dark:text-white">6.4 / user</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cloud Sync:</span>
                      <span className="font-bold text-emerald-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pro Conversion:</span>
                      <span className="font-bold text-amber-600">28.8% (236)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Retention (30d):</span>
                      <span className="font-bold text-emerald-600">41.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Traffic Distribution */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Top Traffic by Pakistani Metropolitan Markets:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="font-bold text-slate-900 dark:text-white">Lahore</div>
                    <div className="text-emerald-600 font-extrabold text-[11px]">38% (562)</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="font-bold text-slate-900 dark:text-white">Karachi</div>
                    <div className="text-cyan-600 font-extrabold text-[11px]">27% (400)</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="font-bold text-slate-900 dark:text-white">ISB / RWP</div>
                    <div className="text-indigo-600 font-extrabold text-[11px]">22% (326)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
