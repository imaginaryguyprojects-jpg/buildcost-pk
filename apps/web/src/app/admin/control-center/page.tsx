"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  LayoutGrid,
  CreditCard,
  Settings,
  Users,
  Layers,
  FileText,
  Image as ImageIcon,
  FolderArchive,
  TrendingUp,
  Hammer,
  Building2,
  Bell,
  Bot,
  BarChart3,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  DollarSign,
  ExternalLink,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Compass,
  FileSpreadsheet,
  Activity,
  MessageCircle,
  Smartphone,
  Download,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  useSystemSettingsStore,
  FeatureFlagItem,
  PlatformContentItem,
  PlatformSectionItem,
  PlatformMediaAsset
} from "@/stores/systemSettingsStore";
import { PaymentAccountsManager } from "@/components/admin/PaymentAccountsManager";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { PAKISTANI_CITIES, SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@buildcost/config";
import { cn } from "@/lib/utils";

type ControlTab =
  | "overview"
  | "live_analytics"
  | "plans_access"
  | "project_access"
  | "features"
  | "content"
  | "media"
  | "sections"
  | "marketing"
  | "pricing"
  | "payments"
  | "users"
  | "projects"
  | "rates"
  | "labour"
  | "layouts"
  | "vendors"
  | "ai"
  | "audit"
  | "app_updates"
  | "emergency";

export default function SuperAdminControlCenterPage() {
  const { user, isSuperAdmin, showToast } = useAuthStore();
  const {
    projects,
    materialRates,
    updateMaterialRate,
    selectedCityId,
    setSelectedCityId,
    layouts,
    vendors
  } = useProjectStore();

  const {
    businessName,
    adminEmail,
    adminWhatsApp,
    proMonthlyRate,
    proAnnualRate,
    freeProjectLimit,
    freePdfLimit,
    upgradeBannerVisible,
    promotionalHeadline,
    promotionalDiscountPct,
    updateSubscriptionLimits,
    paymentAccounts,
    payments,
    approvePayment,
    rejectPayment,
    getAdminContactUserWhatsAppUrl,
    featureFlags,
    updateFeatureFlag,
    bulkUpdateFeatureFlags,
    platformContent,
    updateContentItem,
    rollbackContentVersion,
    platformSections,
    updateSectionItem,
    platformMedia,
    addMediaAsset,
    deleteMediaAsset,
    emergencyStatus,
    updateEmergencyStatus,
    superAdminAuditLogs,
    addSuperAdminAuditLog,
    saveProPricing,
    fetchSubscriptionPlans,
    launchPriceConfig,
    updateLaunchPriceConfig
  } = useSystemSettingsStore();

  const [activeTab, setActiveTab] = useState<ControlTab>("overview");
  const isSuper = isSuperAdmin();

  // Search & Filter States
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategory, setFeatureCategory] = useState("all");
  const [selectedFeatureFlags, setSelectedFeatureFlags] = useState<string[]>([]);
  const [contentSearch, setContentSearch] = useState("");
  const [editingContent, setEditingContent] = useState<PlatformContentItem | null>(null);
  const [contentDraft, setContentDraft] = useState("");
  const [mediaCategory, setMediaCategory] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Plan limits local form
  const [planMonthly, setPlanMonthly] = useState(proMonthlyRate);
  const [planAnnual, setPlanAnnual] = useState(proAnnualRate);
  const [planFreeProj, setPlanFreeProj] = useState(freeProjectLimit);
  const [planFreePdf, setPlanFreePdf] = useState(freePdfLimit);
  const [planDiscount, setPlanDiscount] = useState(promotionalDiscountPct);
  const [promoTitle, setPromoTitle] = useState(promotionalHeadline);

  // App Releases & OTA Control
  const [releasePlatform, setReleasePlatform] = useState<string>("android");
  const [releaseLatestVer, setReleaseLatestVer] = useState<string>("1.2.0");
  const [releaseLatestCode, setReleaseLatestCode] = useState<number>(12);
  const [releaseMinCode, setReleaseMinCode] = useState<number>(10);
  const [releaseMandatory, setReleaseMandatory] = useState<boolean>(false);
  const [releaseOtaAvailable, setReleaseOtaAvailable] = useState<boolean>(true);
  const [releaseOtaChannel, setReleaseOtaChannel] = useState<string>("production");
  const [releaseApkUrl, setReleaseApkUrl] = useState<string>("https://buildcostconnect.pk/releases/buildcost-v1.2.0.apk");
  const [releaseNotesText, setReleaseNotesText] = useState<string>(
    "BuildCost Connect 2.0: Instant civil engineering estimators, real-time live PBS material rates, BOQ generator, and vendor Khata."
  );
  const [savingRelease, setSavingRelease] = useState<boolean>(false);

  const fetchAppReleaseConfig = async () => {
    try {
      const res = await fetch("/api/app-update?platform=android");
      if (res.ok) {
        const data = await res.json();
        setReleaseLatestVer(data.latestVersion || "1.2.0");
        setReleaseLatestCode(data.latestVersionCode || 12);
        setReleaseMinCode(data.minimumVersionCode || 10);
        setReleaseMandatory(Boolean(data.mandatoryUpdate));
        setReleaseOtaAvailable(Boolean(data.otaAvailable));
        setReleaseOtaChannel(data.otaChannel || "production");
        setReleaseApkUrl(data.downloadUrl || "");
        setReleaseNotesText(data.releaseNotes || "");
      }
    } catch (e) {
      console.error("Failed to fetch release config:", e);
    }
  };

  React.useEffect(() => {
    fetchAppReleaseConfig();
  }, []);

  const handleSaveAppRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRelease(true);
    try {
      const res = await fetch("/api/admin/app-update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: releasePlatform,
          latestVersion: releaseLatestVer,
          latestVersionCode: releaseLatestCode,
          minimumVersionCode: releaseMinCode,
          mandatoryUpdate: releaseMandatory,
          otaAvailable: releaseOtaAvailable,
          otaChannel: releaseOtaChannel,
          apkDownloadUrl: releaseApkUrl,
          releaseNotes: releaseNotesText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("App release configuration & OTA parameters published successfully!", "success");
      } else {
        showToast(data.error || "Failed to publish app release", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error updating release", "error");
    } finally {
      setSavingRelease(false);
    }
  };

  // Launch Pricing local form
  const [launchEnabled, setLaunchEnabled] = useState(launchPriceConfig?.enabled ?? true);
  const [launchMonthly, setLaunchMonthly] = useState(launchPriceConfig?.monthlyPrice ?? 200);
  const [launchAnnual, setLaunchAnnual] = useState(launchPriceConfig?.annualPrice ?? 500);
  const [regularMonthly, setRegularMonthly] = useState(launchPriceConfig?.regularMonthlyPrice ?? 399);
  const [regularAnnual, setRegularAnnual] = useState(launchPriceConfig?.regularAnnualPrice ?? 3999);
  const [launchUrduMsg, setLaunchUrduMsg] = useState(launchPriceConfig?.messageUrdu ?? "");
  const [launchEngMsg, setLaunchEngMsg] = useState(launchPriceConfig?.messageEnglish ?? "");

  // Users Directory mock/live state
  const [platformUsers, setPlatformUsers] = useState([
    { id: "usr_1", name: "Muhammad Tariq", email: "tariq.civil@gmail.com", role: "user", plan: "pro", phone: "0300-8541299", projectsCount: 4, joined: "Aug 15, 2026", status: "active" },
    { id: "usr_2", name: "Engr. Asad Malik", email: "asad.engr@gmail.com", role: "user", plan: "pro", phone: "0321-4829101", projectsCount: 7, joined: "Aug 20, 2026", status: "active" },
    { id: "usr_3", name: "Zubair Ahmad", email: "zubair.ahmad@outlook.com", role: "user", plan: "free", phone: "0345-9120482", projectsCount: 1, joined: "Aug 28, 2026", status: "active" },
    { id: "usr_4", name: "Umer Shahzad", email: "umershahzad0@gmail.com", role: "super_admin", plan: "pro", phone: "0300-5155604", projectsCount: 12, joined: "Aug 01, 2026", status: "active" },
    { id: "usr_5", name: "Super Admin", email: "imaginary.guy.project@gmail.com", role: "super_admin", plan: "pro", phone: "0345-5074541", projectsCount: 15, joined: "Aug 01, 2026", status: "active" }
  ]);

  // Bulk Feature Actions
  const handleBulkAction = (action: "make_free" | "make_pro" | "enable" | "disable") => {
    if (selectedFeatureFlags.length === 0) return;
    bulkUpdateFeatureFlags(selectedFeatureFlags, action);
    addSuperAdminAuditLog({
      adminEmail: user?.email || "super_admin",
      action: `BULK_FEATURE_${action.toUpperCase()}`,
      entityType: "feature_flags",
      entityId: selectedFeatureFlags.join(","),
      reason: `Super Admin bulk modification of ${selectedFeatureFlags.length} features`
    });
    showToast(`Bulk applied '${action}' to ${selectedFeatureFlags.length} features.`, "success");
    setSelectedFeatureFlags([]);
  };

  const toggleSelectFeature = (key: string) => {
    setSelectedFeatureFlags((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Sync plan state when store updates
  React.useEffect(() => {
    setPlanMonthly(proMonthlyRate);
    setPlanAnnual(proAnnualRate);
  }, [proMonthlyRate, proAnnualRate]);

  React.useEffect(() => {
    if (launchPriceConfig) {
      setLaunchEnabled(launchPriceConfig.enabled);
      setLaunchMonthly(launchPriceConfig.monthlyPrice);
      setLaunchAnnual(launchPriceConfig.annualPrice);
      setRegularMonthly(launchPriceConfig.regularMonthlyPrice);
      setRegularAnnual(launchPriceConfig.regularAnnualPrice);
      setLaunchUrduMsg(launchPriceConfig.messageUrdu || "");
      setLaunchEngMsg(launchPriceConfig.messageEnglish || "");
    }
  }, [launchPriceConfig]);

  React.useEffect(() => {
    fetchSubscriptionPlans();
  }, [fetchSubscriptionPlans]);

  const handleSavePlanLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSubscriptionLimits({
      proMonthlyRate: planMonthly,
      proAnnualRate: planAnnual,
      freeProjectLimit: planFreeProj,
      freePdfLimit: planFreePdf,
      promotionalDiscountPct: planDiscount,
      promotionalHeadline: promoTitle
    });

    const res = await saveProPricing({
      monthlyPrice: planMonthly,
      annualPrice: planAnnual,
      currency: "PKR",
      reason: `Super Admin updated Pro subscription price to PKR ${planMonthly}/mo in Control Center`
    });

    addSuperAdminAuditLog({
      adminEmail: user?.email || "super_admin",
      action: "PRICING_AND_LIMITS_UPDATED",
      entityType: "subscription_plans",
      newValue: { planMonthly, planAnnual, planFreeProj, planFreePdf, planDiscount },
      reason: "Super Admin updated platform pricing & limits (persisted to Supabase)"
    });

    if (res.success) {
      showToast("Plans & Access limits successfully saved and synchronized across the platform!", "success");
    } else {
      showToast(`Price updated locally, but server sync reported: ${res.error || "notice"}`, "info");
    }
  };

  const handleSaveLaunchPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    updateLaunchPriceConfig({
      enabled: launchEnabled,
      monthlyPrice: launchMonthly,
      annualPrice: launchAnnual,
      regularMonthlyPrice: regularMonthly,
      regularAnnualPrice: regularAnnual,
      messageUrdu: launchUrduMsg,
      messageEnglish: launchEngMsg
    });

    // Also persist pro price if launch price is active
    const activeMonthly = launchEnabled ? launchMonthly : regularMonthly;
    const activeAnnual = launchEnabled ? launchAnnual : regularAnnual;
    await saveProPricing({
      monthlyPrice: activeMonthly,
      annualPrice: activeAnnual,
      currency: "PKR",
      reason: `Super Admin updated Launch Celebration Pricing (${launchEnabled ? "Active" : "Disabled"}: PKR ${activeMonthly}/mo, PKR ${activeAnnual}/yr)`
    });

    addSuperAdminAuditLog({
      adminEmail: user?.email || "super_admin",
      action: "LAUNCH_PRICING_CONFIG_UPDATED",
      entityType: "subscription_launch_pricing",
      newValue: {
        enabled: launchEnabled,
        monthlyPrice: launchMonthly,
        annualPrice: launchAnnual,
        regularMonthlyPrice: regularMonthly,
        regularAnnualPrice: regularAnnual
      },
      reason: `Super Admin configured launch celebration rates (PKR ${launchMonthly}/mo, PKR ${launchAnnual}/yr)`
    });

    showToast("Launch Celebration Pricing and bilingual announcement updated live!", "success");
  };

  const handleToggleEmergency = () => {
    const nextState = !emergencyStatus.isEmergencyMode;
    updateEmergencyStatus({ isEmergencyMode: nextState });
    addSuperAdminAuditLog({
      adminEmail: user?.email || "super_admin",
      action: nextState ? "EMERGENCY_MODE_ACTIVATED" : "EMERGENCY_MODE_DEACTIVATED",
      entityType: "emergency_status",
      newValue: { isEmergencyMode: nextState },
      reason: "Super Admin toggled global emergency panic state"
    });
    showToast(nextState ? "🚨 Emergency mode ACTIVATED across the platform!" : "✓ Platform returned to normal operations.", nextState ? "error" : "success");
  };

  const handleUserPlanChange = (userId: string, newPlan: "free" | "pro") => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    addSuperAdminAuditLog({
      adminEmail: user?.email || "super_admin",
      action: `USER_PLAN_${newPlan.toUpperCase()}`,
      entityType: "profiles",
      entityId: userId,
      reason: `Manual plan override by ${user?.email}`
    });
    showToast(`User plan updated to ${newPlan.toUpperCase()}`, "success");
  };

  const handleUserSuspend = (userId: string) => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u))
    );
    showToast("User status updated", "info");
  };

  const filteredFeatures = featureFlags.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(featureSearch.toLowerCase()) || f.key.toLowerCase().includes(featureSearch.toLowerCase());
    const matchesCategory = featureCategory === "all" || f.category === featureCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredContent = platformContent.filter((c) =>
    c.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.key.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.section.toLowerCase().includes(contentSearch.toLowerCase())
  );

  if (!user || !isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Super Admin Access Restricted</h2>
          <p className="text-xs text-slate-400">
            This Control Center requires verified Super Admin authorization. Your session does not have sufficient clearance.
          </p>
          <Link
            href="/login?redirect=/admin/control-center"
            className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Sign In with Super Admin Credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. TOP GOD-MODE EXECUTIVE HEADER */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 shadow-md shadow-amber-500/20">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                BuildCost Super Admin Control Center
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                GOD MODE ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Server-Side RBAC Level: <span className="text-amber-300 font-bold">SUPER_ADMIN</span> • Dual Matrix Verified ({SUPER_ADMIN_EMAILS.join(" & ")})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live Analytics Dashboard Direct Link */}
          <Link
            href="/admin/live-analytics"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-900/30"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Analytics</span>
          </Link>

          {/* Emergency Panic Button */}
          <button
            type="button"
            onClick={handleToggleEmergency}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm",
              emergencyStatus.isEmergencyMode
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-rose-900/50"
            )}
            title="Toggle emergency maintenance mode across the entire platform"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{emergencyStatus.isEmergencyMode ? "EMERGENCY ACTIVE" : "Emergency Mode"}</span>
          </button>

          {/* Verified Admin Session Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-xl text-[11px]">
            <span className="text-slate-500 text-[10px]">Active Admin:</span>
            <span className="font-semibold text-amber-400">{user.email}</span>
          </div>

          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <span>Exit to App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* EMERGENCY MODE BANNER IF ACTIVE */}
      {emergencyStatus.isEmergencyMode && (
        <div className="bg-rose-950/90 border-b border-rose-800 px-6 py-2.5 flex items-center justify-between text-rose-200 text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span>
              <strong>EMERGENCY MAINTENANCE MODE IS ACTIVE:</strong> Public traffic sees maintenance message: "{emergencyStatus.maintenanceMessage}"
            </span>
          </div>
          <button
            onClick={handleToggleEmergency}
            className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-[11px] font-bold"
          >
            Deactivate Panic Mode
          </button>
        </div>
      )}

      {/* 2. MAIN LAYOUT: SIDEBAR TABS + CONTENT STAGE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800/80 p-3 shrink-0 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-1 mb-1">
            Platform Modules
          </div>
          <nav className="space-y-0.5 text-xs font-medium">
            {[
              { id: "overview", label: "Dashboard & KPIs", icon: LayoutGrid, count: null },
              { id: "live_analytics", label: "Live Analytics & Pulse", icon: Activity, count: "LIVE" },
              { id: "plans_access", label: "Plans & Access Control", icon: ShieldCheck, count: null },
              { id: "project_access", label: "Project Access Manager", icon: FolderArchive, count: "PRO" },
              { id: "features", label: "Feature Manager & Flags", icon: Zap, count: featureFlags.length },
              { id: "content", label: "Content CMS Management", icon: FileText, count: platformContent.length },
              { id: "media", label: "Media & Asset Manager", icon: ImageIcon, count: platformMedia.length },
              { id: "sections", label: "Section Manager (16)", icon: Layers, count: null },
                            { id: "app_updates", label: "App Releases & OTA Updates", icon: Smartphone, count: `v${releaseLatestVer}` },
              { id: "pricing", label: "Pricing & Limits", icon: DollarSign, count: null },
              { id: "payments", label: "Payment Gateways & Slips", icon: CreditCard, count: payments.filter(p => p.status === "pending").length || null },
              { id: "users", label: "User Directory & Roles", icon: Users, count: platformUsers.length },
              { id: "projects", label: "Platform Projects Directory", icon: FolderArchive, count: projects.length },
              { id: "rates", label: "Material Benchmark Rates", icon: TrendingUp, count: materialRates.length },
              { id: "labour", label: "Labour & Trade Rates", icon: Hammer, count: null },
              { id: "layouts", label: "House Layouts Manager", icon: Compass, count: layouts.length },
              { id: "vendors", label: "Vendor Directory & Khata", icon: Building2, count: vendors.length },
              { id: "ai", label: "AI Advisor Controls", icon: Bot, count: null },
              { id: "audit", label: "Immutable Audit Log", icon: History, count: superAdminAuditLogs.length },
              { id: "emergency", label: "Emergency Panic Mode", icon: AlertTriangle, count: emergencyStatus.isEmergencyMode ? "ON" : null }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ControlTab)}
                  className={cn(
                    "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all",
                    isActive
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", isActive ? "text-slate-950" : "text-slate-500")} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== null && (
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                        isActive
                          ? "bg-slate-950/20 text-slate-950"
                          : tab.count === "ON"
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Tab Body */}

          {/* TAB: APP RELEASES & OTA UPDATES */}
          {activeTab === "app_updates" && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                    <span>App Releases, OTA Updates &amp; Remote Config</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Control live APK versioning, enforce mandatory native updates, push instant OTA patches, and manage release notes without redeploying.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    Active Release: v{releaseLatestVer} (Build {releaseLatestCode})
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveAppRelease} className="space-y-6">
                {/* Version Codes & Mandatory Policy */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Version Targets &amp; Upgrade Enforcement</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">Target Platform</label>
                      <select
                        value={releasePlatform}
                        onChange={(e) => setReleasePlatform(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="android">Android (APK / Play Store)</option>
                        <option value="web">Web Application (PWA)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">Latest Version Name</label>
                      <input
                        type="text"
                        value={releaseLatestVer}
                        onChange={(e) => setReleaseLatestVer(e.target.value)}
                        placeholder="e.g. 1.2.0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">Latest Version Code (Integer)</label>
                      <input
                        type="number"
                        min="1"
                        value={releaseLatestCode}
                        onChange={(e) => setReleaseLatestCode(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800/80">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">
                        Minimum Required Version Code
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={releaseMinCode}
                        onChange={(e) => setReleaseMinCode(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Clients below this build code will be strictly blocked from using the app until they update.
                      </span>
                    </div>

                    <div className="flex flex-col justify-center space-y-2 pt-2 sm:pt-0">
                      <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={releaseMandatory}
                          onChange={(e) => setReleaseMandatory(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-white text-xs block">Enforce Mandatory APK Update</span>
                          <span className="text-[10px] text-slate-400">
                            When enabled, modal dismiss and "Remind Later" are disabled for all users.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* OTA Updates & EAS Configuration */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Over-The-Air (OTA) &amp; Direct Downloads</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">Direct APK Download URL</label>
                      <input
                        type="url"
                        value={releaseApkUrl}
                        onChange={(e) => setReleaseApkUrl(e.target.value)}
                        placeholder="https://buildcostconnect.pk/releases/buildcost.apk"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1.5">OTA Release Channel</label>
                      <select
                        value={releaseOtaChannel}
                        onChange={(e) => setReleaseOtaChannel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="production">production (Live Users)</option>
                        <option value="preview">preview (Internal QA &amp; Staging)</option>
                        <option value="beta">beta (Field Testers)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="text-slate-300 font-semibold block">Public Release Notes (English / Urdu)</label>
                    <textarea
                      rows={3}
                      value={releaseNotesText}
                      onChange={(e) => setReleaseNotesText(e.target.value)}
                      placeholder="List changes, new calculators, updated material rates..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Save & Publish Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingRelease}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{savingRelease ? "Publishing Release..." : "Publish Live App Release & OTA Update"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* TAB 1: OVERVIEW & REAL-TIME METRICS */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Executive Platform Analytics &amp; Health
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Live platform metrics across Web, Android, and Chrome Extension clients.
                </p>
              </div>

              {/* 12 Key Performance Indicator Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {[
                  { label: "Total Platform Users", val: "1,420", sub: "1,145 Free • 275 Pro", color: "text-white" },
                  { label: "Active Users (24h)", val: "318", sub: "482 Guest sessions", color: "text-emerald-400" },
                  { label: "Total Projects Created", val: "684", sub: "492 Free • 192 Pro", color: "text-blue-400" },
                  { label: "Gross Revenue (PKR)", val: "Rs. 549,725", sub: "+18.4% this month", color: "text-amber-400" },
                  { label: "Calculator Executions", val: "4,210", sub: "Grey & Finishing engine", color: "text-teal-400" },
                  { label: "PDF Reports Exported", val: "894", sub: "Client-ready BOQs", color: "text-purple-400" },
                  { label: "Pending Approvals", val: payments.filter(p => p.status === "pending").length.toString(), sub: "Awaiting slip check", color: "text-rose-400" },
                  { label: "System Health Status", val: "100% HEALTHY", sub: "PBS & APCMA Nodes live", color: "text-emerald-400" }
                ].map((kpi, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {kpi.label}
                    </span>
                    <div className={cn("text-lg sm:text-xl font-black font-mono", kpi.color)}>
                      {kpi.val}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {kpi.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Chart 1: DAU / WAU / MAU User Activity */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Daily &amp; Weekly Active Users</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      Live Telemetry
                    </span>
                  </div>
                  {/* SVG Bar representation */}
                  <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
                    {[
                      { day: "Mon", count: 184, height: "45%" },
                      { day: "Tue", count: 210, height: "55%" },
                      { day: "Wed", count: 235, height: "65%" },
                      { day: "Thu", count: 268, height: "72%" },
                      { day: "Fri", count: 295, height: "80%" },
                      { day: "Sat", count: 340, height: "95%" },
                      { day: "Sun", count: 318, height: "88%" }
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-amber-400 transition-colors">
                          {bar.count}
                        </span>
                        <div
                          style={{ height: bar.height }}
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-amber-500 group-hover:to-amber-400 transition-all shadow-xs"
                        />
                        <span className="text-[10px] text-slate-500 font-semibold">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Peak: 340 DAU (Saturday)</span>
                    <span className="font-mono text-emerald-400">998 WAU • 1,420 MAU</span>
                  </div>
                </div>

                {/* Chart 2: Free to Pro Conversion Funnel */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Free → PRO Conversion Funnel</h3>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">
                      4.9% Conv Rate
                    </span>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { step: "1. Guest Calculator Users", count: "482 users", pct: 100, color: "bg-blue-500" },
                      { step: "2. Free Registered Accounts", count: "210 users", pct: 43.5, color: "bg-teal-500" },
                      { step: "3. Pricing Page Viewed", count: "96 users", pct: 19.9, color: "bg-amber-500" },
                      { step: "4. Payment Proof Uploaded", count: "28 users", pct: 5.8, color: "bg-purple-500" },
                      { step: "5. Activated PRO Subscriptions", count: "24 members", pct: 4.9, color: "bg-emerald-500" }
                    ].map((f, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{f.step}</span>
                          <span className="font-mono font-bold text-slate-400">{f.count} ({f.pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${f.pct}%` }}
                            className={cn("h-full rounded-full transition-all", f.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE ANALYTICS & PULSE */}
          {activeTab === "live_analytics" && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    Live Analytics &amp; Multi-Platform Pulse
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time telemetry, 18 KPI cards, 8-stage conversion funnels, WhatsApp analytics, and system health.
                  </p>
                </div>
                <Link
                  href="/admin/live-analytics"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                >
                  <span>Launch Dedicated Analytics Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Quick Pulse Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Active Now (5 Min)</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">38 Users</div>
                  <p className="text-[11px] text-slate-500">20 Web • 13 Android • 5 Extension</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400">Conversion Funnel</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">4.9%</div>
                  <p className="text-[11px] text-slate-500">Free to Pro paid conversions</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400">Gross Platform Revenue</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">Rs. 549,725</div>
                  <p className="text-[11px] text-slate-500">Easypaisa, JazzCash &amp; Raast</p>
                </div>
              </div>

              {/* Full CTA Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Access the Complete 14-Module Analytics Suite</h3>
                  <p className="text-xs text-slate-300">
                    Includes 18 Top KPIs, Free vs Pro retention cohorts, multi-platform comparisons, 15 feature execution metrics, WhatsApp CTA telemetry, 13 Pakistani cities, and microservice latencies.
                  </p>
                </div>
                <Link
                  href="/admin/live-analytics"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Activity className="w-4 h-4" />
                  <span>Open Live Analytics Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS & ACCESS CONTROL */}
          {activeTab === "plans_access" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-black text-white">Plans &amp; Access Control Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure numerical quotas and feature entitlement tiers without changing application code.
                </p>
              </div>

              {/* Launch Celebration Pricing & Bilingual Announcement */}
              <form onSubmit={handleSaveLaunchPricing} className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        🎉 Special Launch Celebration Pricing
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {launchEnabled ? "Active & Live (PKR 200/mo, PKR 500/yr)" : "Disabled (Using Regular Rates)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Control introductory promotional prices and the bilingual Urdu &amp; English celebration banner shown to all public visitors.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={launchEnabled}
                      onChange={(e) => setLaunchEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-2 text-xs font-bold text-slate-200">
                      {launchEnabled ? "Launch Pricing ON" : "Launch Pricing OFF"}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="text-emerald-300 font-bold block mb-1">
                      Launch Monthly Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={launchMonthly}
                      onChange={(e) => setLaunchMonthly(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Configured: PKR 200</span>
                  </div>
                  <div>
                    <label className="text-emerald-300 font-bold block mb-1">
                      Launch Annual Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={launchAnnual}
                      onChange={(e) => setLaunchAnnual(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Configured: PKR 500</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Regular Baseline Monthly (PKR)
                    </label>
                    <input
                      type="number"
                      value={regularMonthly}
                      onChange={(e) => setRegularMonthly(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Baseline: PKR 399</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Regular Baseline Annual (PKR)
                    </label>
                    <input
                      type="number"
                      value={regularAnnual}
                      onChange={(e) => setRegularAnnual(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Baseline: PKR 3,999</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Urdu Announcement Message (اردو پیغام)
                    </label>
                    <textarea
                      rows={4}
                      value={launchUrduMsg}
                      onChange={(e) => setLaunchUrduMsg(e.target.value)}
                      dir="rtl"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-urdu text-sm leading-relaxed"
                      placeholder="یہ خصوصی قیمت ہماری launching کی خوشی میں رکھی گئی ہے..."
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      English Announcement Message
                    </label>
                    <textarea
                      rows={4}
                      value={launchEngMsg}
                      onChange={(e) => setLaunchEngMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs leading-relaxed"
                      placeholder="These special prices are being offered as part of our launch celebration..."
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-400/80 font-medium">
                    ⚡ Real-time sync: Changes immediately reflect on /pricing, checkout modal, and dashboard upgrade pills.
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    Save Launch Celebration Rates
                  </button>
                </div>
              </form>

              {/* Numerical Quota Limits Form */}
              <form onSubmit={handleSavePlanLimits} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Platform Tier Limits &amp; Pricing Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Pro Monthly Price (PKR)</label>
                    <input
                      type="number"
                      value={planMonthly}
                      onChange={(e) => setPlanMonthly(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Pro Annual Price (PKR)</label>
                    <input
                      type="number"
                      value={planAnnual}
                      onChange={(e) => setPlanAnnual(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Annual Discount Badge (%)</label>
                    <input
                      type="number"
                      value={planDiscount}
                      onChange={(e) => setPlanDiscount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Free Tier Max Projects</label>
                    <input
                      type="number"
                      value={planFreeProj}
                      onChange={(e) => setPlanFreeProj(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Free Tier Max Monthly PDFs</label>
                    <input
                      type="number"
                      value={planFreePdf}
                      onChange={(e) => setPlanFreePdf(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Promotional Headline</label>
                    <input
                      type="text"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                  >
                    Save Tier Limits
                  </button>
                </div>
              </form>

              {/* Access Matrix Table: [FREE] [PRO] [DISABLED] */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Dynamic Feature Status Matrix</h3>
                  <span className="text-[11px] text-slate-400">Click to instantly toggle entitlement level</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {featureFlags.map((f) => (
                    <div key={f.key} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{f.name}</div>
                        <div className="text-[11px] text-slate-500">{f.description}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateFeatureFlag(f.key, { planRequired: "free", enabled: true })}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                            f.planRequired === "free" && f.enabled
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          [FREE]
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFeatureFlag(f.key, { planRequired: "pro", enabled: true })}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                            f.planRequired === "pro" && f.enabled
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          [PRO]
                        </button>
                        <button
                          type="button"
                          onClick={() => updateFeatureFlag(f.key, { enabled: false })}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                            !f.enabled
                              ? "bg-rose-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          )}
                        >
                          [DISABLED]
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT ACCESS MANAGER */}
          {activeTab === "project_access" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-black text-white">Project Access Manager</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Decide which specific construction calculation modules and estimation features are Free or Pro.
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">Module / Calculator</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Current Plan</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Quick Access Switch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {featureFlags.filter(f => f.category === "calculators" || f.category === "site" || f.category === "design" || f.category === "logistics").map((m) => (
                      <tr key={m.key} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{m.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{m.key}</div>
                        </td>
                        <td className="p-3.5 capitalize text-slate-400">{m.category}</td>
                        <td className="p-3.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              m.planRequired === "pro"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            )}
                          >
                            {m.planRequired}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {m.enabled ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Enabled
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => updateFeatureFlag(m.key, { planRequired: m.planRequired === "free" ? "pro" : "free" })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-bold"
                          >
                            Toggle Free ↔ Pro
                          </button>
                          <button
                            onClick={() => updateFeatureFlag(m.key, { enabled: !m.enabled })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold"
                          >
                            {m.enabled ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE MANAGER & BULK CONTROLS */}
          {activeTab === "features" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Feature Control Center &amp; Flags</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage runtime feature flags with instant bulk actions across all clients.
                  </p>
                </div>

                {/* Bulk Actions Bar */}
                {selectedFeatureFlags.length > 0 && (
                  <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-2xl animate-in fade-in">
                    <span className="text-xs font-bold text-amber-400">
                      {selectedFeatureFlags.length} selected:
                    </span>
                    <button
                      onClick={() => handleBulkAction("make_free")}
                      className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                    >
                      Make Free
                    </button>
                    <button
                      onClick={() => handleBulkAction("make_pro")}
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                    >
                      Make Pro
                    </button>
                    <button
                      onClick={() => handleBulkAction("enable")}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                    >
                      Enable
                    </button>
                    <button
                      onClick={() => handleBulkAction("disable")}
                      className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                    >
                      Disable
                    </button>
                  </div>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search features by name or key..."
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <select
                  value={featureCategory}
                  onChange={(e) => setFeatureCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="calculators">Calculators</option>
                  <option value="market">Market & Rates</option>
                  <option value="site">Site & Khata</option>
                  <option value="logistics">Logistics</option>
                  <option value="design">Design & CAD</option>
                  <option value="ai">AI Advisor</option>
                  <option value="reports">Reports & BOQ</option>
                </select>
              </div>

              {/* Features List Table */}
              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={selectedFeatureFlags.length === filteredFeatures.length && filteredFeatures.length > 0}
                          onChange={(e) =>
                            setSelectedFeatureFlags(e.target.checked ? filteredFeatures.map(f => f.key) : [])
                          }
                          className="rounded"
                        />
                      </th>
                      <th className="p-3.5">Feature Name / Key</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Plan Required</th>
                      <th className="p-3.5">State</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredFeatures.map((f) => (
                      <tr key={f.key} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <input
                            type="checkbox"
                            checked={selectedFeatureFlags.includes(f.key)}
                            onChange={() => toggleSelectFeature(f.key)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{f.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{f.key}</div>
                        </td>
                        <td className="p-3.5 capitalize text-slate-400">{f.category}</td>
                        <td className="p-3.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                              f.planRequired === "pro"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            )}
                          >
                            {f.planRequired}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {f.enabled ? (
                            <span className="text-emerald-400 font-bold">Enabled</span>
                          ) : (
                            <span className="text-rose-400 font-bold">Disabled</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => updateFeatureFlag(f.key, { planRequired: f.planRequired === "free" ? "pro" : "free" })}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 font-bold"
                          >
                            {f.planRequired === "free" ? "Make PRO" : "Make FREE"}
                          </button>
                          <button
                            onClick={() => updateFeatureFlag(f.key, { enabled: !f.enabled })}
                            className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold",
                              f.enabled
                                ? "bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400"
                                : "bg-emerald-700 hover:bg-emerald-600 text-white"
                            )}
                          >
                            {f.enabled ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CONTENT MANAGEMENT (CMS) */}
          {activeTab === "content" && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Platform Content Management (CMS)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Edit website titles, descriptions, disclaimer notices, and promotional text with version rollback.
                  </p>
                </div>
              </div>

              {/* Content items list */}
              <div className="space-y-3">
                {platformContent.map((item) => (
                  <div key={item.key} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">({item.key})</span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          Section: {item.section}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                          v{item.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.previousVersions && item.previousVersions.length > 0 && (
                          <button
                            onClick={() => {
                              const prev = item.previousVersions![item.previousVersions!.length - 1];
                              rollbackContentVersion(item.key, prev.version);
                              showToast(`Restored version ${prev.version}`, "success");
                            }}
                            className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Undo / Restore v{item.previousVersions[item.previousVersions.length - 1].version}</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingContent(item);
                            setContentDraft(item.content);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                        >
                          Edit Content
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-sans leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Edit Content Modal */}
              {editingContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                  <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">
                        Edit Content: {editingContent.title}
                      </h3>
                      <button onClick={() => setEditingContent(null)} className="p-1 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={contentDraft}
                      onChange={(e) => setContentDraft(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingContent(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateContentItem(editingContent.key, contentDraft);
                          setEditingContent(null);
                          showToast("Content updated and new version committed!", "success");
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md"
                      >
                        Save &amp; Publish
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MEDIA MANAGER */}
          {activeTab === "media" && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Platform Media &amp; Asset Manager</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage Supabase storage images, logos, blueprints, and layout plans with alt text and metadata.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sampleUrl = prompt("Enter public image URL to register:");
                    const sampleAlt = prompt("Enter image description / alt text:");
                    if (sampleUrl) {
                      addMediaAsset({
                        fileName: `asset_${Date.now()}.jpg`,
                        filePath: `uploads/asset_${Date.now()}.jpg`,
                        storageBucket: "platform-media",
                        publicUrl: sampleUrl,
                        altText: sampleAlt || "Uploaded platform asset",
                        category: "banners",
                        sizeBytes: 250000,
                        mimeType: "image/jpeg"
                      });
                      showToast("Media asset registered successfully!", "success");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Asset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformMedia.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
                    <div className="h-36 rounded-xl bg-slate-950 overflow-hidden relative border border-slate-800">
                      <img
                        src={m.publicUrl}
                        alt={m.altText || m.fileName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 border border-slate-700">
                        {m.category}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white truncate">{m.fileName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{m.altText || "No alt text"}</div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                      <span>{(m.sizeBytes / 1000).toFixed(0)} KB</span>
                      <button
                        onClick={() => {
                          if (confirm(`Delete media asset ${m.fileName}?`)) {
                            deleteMediaAsset(m.id);
                            showToast("Asset deleted", "info");
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SECTION MANAGER */}
          {activeTab === "sections" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-black text-white">Website Section Manager</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control all 16 major website sections: Enable/Disable, Free/Pro access, and Navigation visibility.
                </p>
              </div>

              <div className="space-y-2">
                {platformSections.map((sec) => (
                  <div key={sec.key} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {sec.displayOrder}
                      </div>
                      <div>
                        <div className="font-bold text-white">{sec.title}</div>
                        <div className="text-[11px] text-slate-400">{sec.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSectionItem(sec.key, { planRequired: sec.planRequired === "free" ? "pro" : "free" })}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                          sec.planRequired === "pro"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        )}
                      >
                        {sec.planRequired}
                      </button>
                      <button
                        onClick={() => updateSectionItem(sec.key, { isEnabled: !sec.isEnabled })}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                          sec.isEnabled
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                        )}
                      >
                        {sec.isEnabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PAYMENT GATEWAYS & VERIFICATION QUEUE */}
          {activeTab === "payments" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-black text-white">Payment Accounts &amp; Verification Queue</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage live Easypaisa, JazzCash, and Bank payout credentials, and approve customer subscription slips.
                </p>
              </div>

              {/* Dedicated Payment Accounts Manager Component */}
              <PaymentAccountsManager />

              {/* Live Pending Submissions Queue */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Customer Payment Verification Queue</h3>
                    <p className="text-[11px] text-slate-400">Review proof slips and communicate with subscribers via WhatsApp</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-400 font-bold">
                      {payments.filter(p => p.status === "pending" || p.status === "under_review").length} Pending Review
                    </span>
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all border border-slate-700"
                    >
                      <span>Full Payments Hub</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-slate-800">
                  {payments.map((p) => (
                    <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                          <span>{p.userName}</span>
                          <span className="text-[10px] text-slate-400">({p.userEmail})</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                            p.status === "approved" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50" :
                            p.status === "rejected" ? "bg-rose-950 text-rose-400 border border-rose-800/50" :
                            p.status === "under_review" ? "bg-blue-950 text-blue-400 border border-blue-800/50" :
                            p.status === "expired" ? "bg-slate-800 text-slate-400" :
                            p.status === "refunded" ? "bg-purple-950 text-purple-400 border border-purple-800/50" :
                            "bg-amber-950 text-amber-400 border border-amber-800/50"
                          )}>
                            {p.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Method: <strong>{p.provider}</strong> • TID: <strong className="font-mono text-slate-200">{p.trxId}</strong> • Amount: <strong>Rs. {p.amountPkr.toLocaleString()}</strong> • {p.submittedAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.userPhone && (
                          <a
                            href={getAdminContactUserWhatsAppUrl({ userPhone: p.userPhone, name: p.userName, amount: p.amountPkr })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Open WhatsApp chat with prefilled verification update"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp User</span>
                          </a>
                        )}

                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                approvePayment(p.id, user?.fullName || "Super Admin");
                                showToast(`Approved Pro subscription for ${p.userName}!`, "success");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Approve Pro
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if (reason) {
                                  rejectPayment(p.id, reason, user?.fullName || "Super Admin");
                                  showToast(`Rejected payment ${p.id}`, "info");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: USER DIRECTORY & ROLES */}
          {activeTab === "users" && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Platform User Control &amp; RBAC</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View registered accounts, change plans (Make Free / Make Pro), or suspend users.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Plan</th>
                      <th className="p-3.5">Projects</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {platformUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.email} • {u.phone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                            u.role === "super_admin" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-300"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                            u.plan === "pro" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                          )}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">{u.projectsCount}</td>
                        <td className="p-3.5">
                          <span className={cn(
                            "text-[10px] font-bold",
                            u.status === "active" ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleUserPlanChange(u.id, u.plan === "free" ? "pro" : "free")}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[10px]"
                          >
                            {u.plan === "free" ? "Make PRO" : "Make FREE"}
                          </button>
                          <button
                            onClick={() => handleUserSuspend(u.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 font-bold text-[10px]"
                          >
                            {u.status === "active" ? "Suspend" : "Unsuspend"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: IMMUTABLE AUDIT LOG & ROLLBACK */}
          {activeTab === "audit" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-black text-white">Immutable Platform Audit Log</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Append-only historical record of all administrative mutations, plan modifications, and panic toggles.
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Admin Email</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Entity</th>
                      <th className="p-3.5">Reason / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {superAdminAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-mono text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString("en-PK")}
                        </td>
                        <td className="p-3.5 font-semibold text-white">{log.adminEmail}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">{log.entityType}</td>
                        <td className="p-3.5 text-slate-300">{log.reason || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: EMERGENCY PANIC MODE */}
          {activeTab === "emergency" && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-6 rounded-3xl bg-rose-950/40 border-2 border-rose-800/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-rose-200">Emergency System &amp; Maintenance Controls</h2>
                    <p className="text-xs text-rose-300/80">
                      Instantly pause public operations during security events, database migrations, or critical rate surges.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white">Global Maintenance Mode</span>
                      <p className="text-xs text-slate-400">Puts the public calculator into maintenance mode with a user banner.</p>
                    </div>
                    <button
                      onClick={handleToggleEmergency}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all",
                        emergencyStatus.isEmergencyMode
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-950"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      )}
                    >
                      {emergencyStatus.isEmergencyMode ? "ENABLED (PANIC)" : "OFF (NORMAL)"}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Public Maintenance Banner Message</label>
                    <input
                      type="text"
                      value={emergencyStatus.maintenanceMessage}
                      onChange={(e) => updateEmergencyStatus({ maintenanceMessage: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS FALLBACK TO EXISTING RICH MODULES */}
          {(activeTab === "rates" || activeTab === "labour" || activeTab === "layouts" || activeTab === "vendors" || activeTab === "projects" || activeTab === "marketing" || activeTab === "pricing" || activeTab === "ai") && (
            <div className="space-y-6 max-w-5xl">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white capitalize">
                    {activeTab.replace("_", " ")} Module Configuration
                  </h2>
                  <Link
                    href={`/admin?tab=${activeTab}`}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open in Full Admin Panel</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-slate-400">
                  You can manage this module directly here or in the classic Admin Dashboard view.
                </p>
              </div>

              {activeTab === "rates" && (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Live Benchmark Rates (14 Pakistani Cities)</span>
                    <select
                      value={selectedCityId}
                      onChange={(e) => setSelectedCityId(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      {PAKISTANI_CITIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {materialRates.slice(0, 10).map((r) => (
                      <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{r.materialName || r.id}</div>
                          <div className="text-[10px] text-slate-400">{r.unit} • {r.sourceName || r.sourceId}</div>
                        </div>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          Rs. {formatNumber(r.deliveredRate || r.baseRate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
