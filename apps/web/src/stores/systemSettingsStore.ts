import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BUSINESS_CONFIG,
  BusinessConfig,
  PaymentMethodConfig,
  PaymentAccount,
  PaymentAccountType,
  PaymentStatusType,
  PromotionCampaign,
  ActiveSessionRecord,
  PlatformUsageMetrics,
  SUPER_ADMIN_EMAILS,
  isSuperAdminEmail,
  FeatureFlagItem,
  PlatformContentItem,
  PlatformSectionItem,
  PlatformNavigationItem,
  PlatformMediaAsset,
  PlatformEmergencyStatus,
  SuperAdminAuditRecord,
  SubscriptionPlan,
  LaunchPriceConfig,
  DEFAULT_LAUNCH_PRICE_CONFIG
} from "@buildcost/config";

export type {
  PaymentAccount,
  PaymentAccountType,
  PaymentStatusType,
  PromotionCampaign,
  ActiveSessionRecord,
  PlatformUsageMetrics,
  FeatureFlagItem,
  PlatformContentItem,
  PlatformSectionItem,
  PlatformNavigationItem,
  PlatformMediaAsset,
  PlatformEmergencyStatus,
  SuperAdminAuditRecord,
  SubscriptionPlan
};

export interface PaymentSubmission {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  plan: "pro_monthly" | "pro_annual";
  amountPkr: number;
  provider: "easypaisa" | "jazzcash" | "bank_transfer" | string;
  trxId: string;
  screenshotName: string;
  paymentDate?: string;
  note?: string;
  slipUrl?: string;
  submittedAt: string;
  status: PaymentStatusType;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface SystemAuditEntry {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

interface SystemSettingsState {
  businessName: string;
  adminEmail: string;
  adminWhatsApp: string;
  adminWhatsAppRaw: string;
  easypaisa: PaymentMethodConfig;
  jazzcash: PaymentMethodConfig;
  bankTransfer: PaymentMethodConfig;
  proMonthlyRate: number;
  proAnnualRate: number;
  pricingCurrency: string;
  isPricingLoading: boolean;
  subscriptionPlans: SubscriptionPlan[];
  freeProjectLimit: number;
  freePdfLimit: number;
  upgradeBannerVisible: boolean;
  promotionalHeadline: string;
  promotionalDiscountPct: number;
  launchPriceConfig: LaunchPriceConfig;
  updateLaunchPriceConfig: (updates: Partial<LaunchPriceConfig>) => void;

  // Live Dynamic Payment & Payout Accounts (God-Mode CRUD)
  paymentAccounts: PaymentAccount[];

  // Live Payment Verification Queue
  payments: PaymentSubmission[];
  auditEntries: SystemAuditEntry[];

  // Super Admin Control Center State
  featureFlags: FeatureFlagItem[];
  platformContent: PlatformContentItem[];
  platformSections: PlatformSectionItem[];
  platformMedia: PlatformMediaAsset[];
  emergencyStatus: PlatformEmergencyStatus;
  superAdminAuditLogs: SuperAdminAuditRecord[];

  // Update actions
  fetchSubscriptionPlans: () => Promise<void>;
  saveProPricing: (updates: {
    monthlyPrice: number;
    annualPrice?: number;
    currency?: string;
    reason?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateBusinessSettings: (settings: {
    businessName?: string;
    adminEmail?: string;
    adminWhatsApp?: string;
  }) => void;
  updateEasypaisaSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updateJazzCashSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updateBankSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updatePricing: (monthly: number, annual: number) => void;
  updateSubscriptionLimits: (params: {
    proMonthlyRate?: number;
    proAnnualRate?: number;
    freeProjectLimit?: number;
    freePdfLimit?: number;
    upgradeBannerVisible?: boolean;
    promotionalHeadline?: string;
    promotionalDiscountPct?: number;
  }) => void;

  // Dedicated Payment Accounts Management (CRUD)
  addPaymentAccount: (account: Omit<PaymentAccount, "id" | "createdAt" | "updatedAt">) => PaymentAccount;
  updatePaymentAccount: (id: string, updates: Partial<PaymentAccount>) => void;
  deletePaymentAccount: (id: string) => void;
  togglePaymentAccountActive: (id: string) => void;
  setDefaultPaymentAccount: (id: string) => void;
  resetPaymentAccountsToDefault: () => void;

  // Verification operations
  submitPaymentVerification: (submission: Omit<PaymentSubmission, "id" | "submittedAt" | "status">) => PaymentSubmission;
  approvePayment: (paymentId: string, adminName?: string) => void;
  rejectPayment: (paymentId: string, reason: string, adminName?: string) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentStatusType, reason?: string, adminName?: string) => void;

  // Promotions & Campaigns
  promotions: PromotionCampaign[];
  addPromotion: (promo: PromotionCampaign) => void;
  updatePromotion: (id: string, updates: Partial<PromotionCampaign>) => void;
  togglePromotionActive: (id: string) => void;

  // Super Admin Control Center Actions
  updateFeatureFlag: (key: string, updates: Partial<FeatureFlagItem>) => void;
  bulkUpdateFeatureFlags: (keys: string[], action: "make_free" | "make_pro" | "enable" | "disable") => void;
  updateContentItem: (key: string, content: string, title?: string) => void;
  rollbackContentVersion: (key: string, version: number) => void;
  updateSectionItem: (key: string, updates: Partial<PlatformSectionItem>) => void;
  updateEmergencyStatus: (status: Partial<PlatformEmergencyStatus>) => void;
  addMediaAsset: (asset: Omit<PlatformMediaAsset, "id" | "createdAt">) => void;
  deleteMediaAsset: (id: string) => void;
  addSuperAdminAuditLog: (entry: Omit<SuperAdminAuditRecord, "id" | "createdAt">) => void;

  // Helpers
  getWhatsAppPaymentUrl: (details: {
    name?: string;
    email?: string;
    paymentMethod: string;
    amount: number;
    trxId?: string;
    paymentDate?: string;
  }) => string;
  getAdminContactUserWhatsAppUrl: (details: {
    name: string;
    amount: number;
    userPhone?: string;
  }) => string;
}

const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: "pay_101",
    userName: "Tariq Mahmood",
    userEmail: "tariq.civil@gmail.com",
    userPhone: "0300-8541299",
    plan: "pro_monthly",
    amountPkr: 1999,
    provider: "easypaisa",
    trxId: "EP94827103841",
    screenshotName: "easypaisa_receipt_9482.jpg",
    submittedAt: "15 mins ago",
    status: "pending"
  },
  {
    id: "pay_102",
    userName: "Engr. Bilal Farooq",
    userEmail: "bilal.farooq@construct.pk",
    userPhone: "0321-4499100",
    plan: "pro_annual",
    amountPkr: 19990,
    provider: "bank_transfer",
    trxId: "MEZN-PK72-0091823",
    screenshotName: "meezan_raast_transfer.png",
    submittedAt: "45 mins ago",
    status: "pending"
  },
  {
    id: "pay_103",
    userName: "Kashif Siddiqui",
    userEmail: "kashif.s@yahoo.com",
    userPhone: "0333-5128833",
    plan: "pro_monthly",
    amountPkr: 1999,
    provider: "jazzcash",
    trxId: "JC7718290192",
    screenshotName: "jazzcash_slip.jpg",
    submittedAt: "2 hours ago",
    status: "approved",
    approvedAt: "1 hour ago",
    approvedBy: "Umer Sheikh (Admin)"
  }
];

const INITIAL_AUDITS: SystemAuditEntry[] = [
  {
    id: "audit_1",
    adminName: "Umer Sheikh (Super Admin)",
    action: "System Initialization",
    details: "Configured authorized contact email imaginary.guy.project@gmail.com, WhatsApp 0345-50-74-541, and Easypaisa 0300-5155604 (Umer Shahzad).",
    timestamp: "Today 10:00 PKT"
  }
];

export const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: "pa_easypaisa_1",
    type: "easypaisa",
    title: "Official Easypaisa Account",
    accountTitle: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NAME || BUSINESS_CONFIG.easypaisa.accountName,
    accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || BUSINESS_CONFIG.easypaisa.accountNumber,
    whatsappForSlip: BUSINESS_CONFIG.adminWhatsApp,
    instructions: "Send the subscription fee to Easypaisa account. Copy the 11-digit TID and upload screenshot or share directly via WhatsApp.",
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "pa_jazzcash_1",
    type: "jazzcash",
    title: "Official JazzCash Account",
    accountTitle: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME || BUSINESS_CONFIG.jazzcash.accountName,
    accountNumber: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || BUSINESS_CONFIG.jazzcash.accountNumber,
    whatsappForSlip: BUSINESS_CONFIG.adminWhatsApp,
    instructions: "Open JazzCash app > Money Transfer > Mobile Account. Send payment, enter Transaction Reference (TID), and share slip on WhatsApp.",
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "pa_bank_1",
    type: "bank_transfer",
    title: "Meezan Bank Raast & IBAN",
    accountTitle: BUSINESS_CONFIG.bankTransfer.accountName,
    bankName: BUSINESS_CONFIG.bankTransfer.bankName,
    accountNumber: BUSINESS_CONFIG.bankTransfer.accountNumber,
    iban: BUSINESS_CONFIG.bankTransfer.iban,
    whatsappForSlip: BUSINESS_CONFIG.adminWhatsApp,
    instructions: "Transfer via Raast or IBAN from any banking app. Enter Transaction ID and upload screenshot slip for instant admin approval.",
    isActive: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_FEATURE_FLAGS: FeatureFlagItem[] = [
  { id: "ff_1", key: "grey_structure_calculator", name: "Grey Structure Calculator", description: "Core shell and structural estimator (bricks, cement, steel)", category: "calculators", enabled: true, planRequired: "free", platform: "all", rolloutPercentage: 100 },
  { id: "ff_2", key: "advanced_grey_structure", name: "Advanced Structural RCC Engine", description: "Deep foundation, retaining walls, clear ceiling heights", category: "calculators", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_3", key: "finishing_calculator", name: "Finishing & Fixtures Estimator", description: "Tiles, marble, paints, sanitary, woodwork and electrical", category: "calculators", enabled: true, planRequired: "free", platform: "all", rolloutPercentage: 100 },
  { id: "ff_4", key: "advanced_finishing", name: "17-Stage High-End Finishing Specs", description: "Custom imported woodwork, Italian tiles, double-glazed UPVC", category: "calculators", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_5", key: "material_rates", name: "Material Benchmark Rates Board", description: "PBS & APCMA verified rates for 14 Pakistani cities", category: "market", enabled: true, planRequired: "free", platform: "all", rolloutPercentage: 100 },
  { id: "ff_6", key: "price_alerts", name: "Material Price Alerts & Trend Charts", description: "Real-time alerts for cement, steel and sand price swings", category: "market", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_7", key: "vendor_management", name: "Vendor Directory & Khata Ledger", description: "Supplier khata, outstanding balance, credit terms, receipts", category: "site", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_8", key: "purchase_orders", name: "Purchases & Order Slips", description: "Weighbridge slips, delivery challans, procurement receipts", category: "site", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_9", key: "transport_calculator", name: "Transport & Logistics Freight", description: "Tractor trolley, dumper truck, Mazda haulage capacity & fuel", category: "logistics", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_10", key: "advanced_boq", name: "BOQ Studio & Export", description: "35-item Contractor Schedule of Rates with Excel/PDF export", category: "reports", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_11", key: "house_layout_library", name: "House Layouts 2D CAD Plans", description: "Reference floor plans for 3, 5, 7, 10 Marla and 1 Kanal", category: "design", enabled: true, planRequired: "free", platform: "all", rolloutPercentage: 100 },
  { id: "ff_12", key: "premium_layouts", name: "Premium 3D Floor Layouts", description: "High-fidelity architectural elevations and interior walkthroughs", category: "design", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_13", key: "ai_construction_advisor", name: "AI Site Advisor & What-If Simulator", description: "Scenario price simulation and civil engineering chatbot", category: "ai", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_14", key: "cash_flow_planner", name: "Cash Flow & Bi-Weekly Disbursements", description: "Predictive contractor milestone payments schedule", category: "financials", enabled: true, planRequired: "pro", platform: "all", rolloutPercentage: 100 },
  { id: "ff_15", key: "site_diary", name: "Daily Site Diary & Logbook", description: "Labour headcount, concrete pours, weather delays, and milestones", category: "site", enabled: true, planRequired: "free", platform: "all", rolloutPercentage: 100 }
];

export const INITIAL_PLATFORM_CONTENT: PlatformContentItem[] = [
  { id: "pc_1", key: "homepage_hero_title", section: "homepage", title: "Hero Headline", content: "Pakistan's #1 Construction & Property Cost Intelligence Platform", isPublished: true, version: 1 },
  { id: "pc_2", key: "homepage_hero_subtitle", section: "homepage", title: "Hero Subtitle", content: "Calculate precise structural grey structure, finishing materials, labour rates, and supplier expenses across 14 Pakistani cities with empirical civil accuracy.", isPublished: true, version: 1 },
  { id: "pc_3", key: "pro_promo_card_title", section: "dashboard", title: "Pro Promotional Card Title", content: "Unlock More With PRO", isPublished: true, version: 1 },
  { id: "pc_4", key: "pro_promo_card_desc", section: "dashboard", title: "Pro Promotional Card Description", content: "Get advanced construction estimation, vendor khata management, multi-city market comparison, and unlimited projects.", isPublished: true, version: 1 },
  { id: "pc_5", key: "pro_upgrade_button_text", section: "marketing", title: "Upgrade CTA Button Text", content: "Upgrade to PRO — Save 20%", isPublished: true, version: 1 },
  { id: "pc_6", key: "disclaimer_estimation", section: "legal", title: "Civil Estimation Disclaimer", content: "Notice: BuildCost Connect calculations are civil engineering reference estimates calibrated against prevailing Pakistani market rates. Actual site execution costs may vary depending on local soil conditions, steel brands, and contractor terms.", isPublished: true, version: 1 },
  { id: "pc_7", key: "disclaimer_layouts", section: "legal", title: "House Layouts Disclaimer", content: "Planning Reference Only: All house layouts provided in this library are conceptual reference plans and do not substitute approved municipal or structural engineering drawings.", isPublished: true, version: 1 },
  { id: "pc_8", key: "support_whatsapp_number", section: "contact", title: "Admin WhatsApp Support Contact", content: "0300-5155604", isPublished: true, version: 1 }
];

export const INITIAL_PLATFORM_SECTIONS: PlatformSectionItem[] = [
  { id: "sec_1", key: "dashboard", title: "Dashboard", description: "Central executive metrics and project health", icon: "LayoutGrid", isEnabled: true, planRequired: "free", displayOrder: 1, navVisibility: true },
  { id: "sec_2", key: "projects", title: "Projects Directory", description: "Multi-project management and portfolio oversight", icon: "FolderArchive", isEnabled: true, planRequired: "pro", displayOrder: 2, navVisibility: true },
  { id: "sec_3", key: "calculator", title: "Calculation Hub", description: "Progressive grey structure & finishing estimators", icon: "Calculator", isEnabled: true, planRequired: "free", displayOrder: 3, navVisibility: true },
  { id: "sec_4", key: "materials", title: "Material Catalog", description: "Delivered unit prices and Pakistani brand specifications", icon: "Boxes", isEnabled: true, planRequired: "free", displayOrder: 4, navVisibility: true },
  { id: "sec_5", key: "labour", title: "Labour & Crews", description: "Trade wage rates and productivity gang sizes", icon: "Hammer", isEnabled: true, planRequired: "free", displayOrder: 5, navVisibility: true },
  { id: "sec_6", key: "layouts", title: "House Layout Library", description: "2D architectural reference plans", icon: "Compass", isEnabled: true, planRequired: "free", displayOrder: 6, navVisibility: true },
  { id: "sec_7", key: "budget", title: "Cash Flow & Budget", description: "Variance analysis and bi-weekly payment forecasts", icon: "Wallet", isEnabled: true, planRequired: "pro", displayOrder: 7, navVisibility: true },
  { id: "sec_8", key: "progress", title: "Construction Progress", description: "10-stage physical vs cost milestones", icon: "Activity", isEnabled: true, planRequired: "free", displayOrder: 8, navVisibility: true },
  { id: "sec_9", key: "vendors", title: "Vendors & Khata", description: "Supplier ledgers and credit balance accounts", icon: "Building2", isEnabled: true, planRequired: "pro", displayOrder: 9, navVisibility: true },
  { id: "sec_10", key: "purchases", title: "Purchases & Orders", description: "Site invoices, weighbridge slips, and delivery tracking", icon: "ShoppingCart", isEnabled: true, planRequired: "pro", displayOrder: 10, navVisibility: true },
  { id: "sec_11", key: "transport", title: "Transport & Haulage", description: "Truck freight and Palledari loading calculator", icon: "ShoppingCart", isEnabled: true, planRequired: "pro", displayOrder: 11, navVisibility: true },
  { id: "sec_12", key: "rates", title: "Market Rates Intelligence", description: "PBS & APCMA weekly rate trends across Pakistan", icon: "TrendingUp", isEnabled: true, planRequired: "free", displayOrder: 12, navVisibility: true },
  { id: "sec_13", key: "boq", title: "BOQ Studio", description: "Contractor Bill of Quantities schedule of rates", icon: "FileSpreadsheet", isEnabled: true, planRequired: "pro", displayOrder: 13, navVisibility: true },
  { id: "sec_14", key: "reports", title: "PDF Reports", description: "Client-ready branded cost estimation summaries", icon: "BarChart3", isEnabled: true, planRequired: "free", displayOrder: 14, navVisibility: true },
  { id: "sec_15", key: "advisor", title: "AI Construction Advisor", description: "Site troubleshooting and cost engineering assistant", icon: "Bot", isEnabled: true, planRequired: "pro", displayOrder: 15, navVisibility: true },
  { id: "sec_16", key: "pricing", title: "Plans & Pricing", description: "Free vs Pro tiers and subscription checkout", icon: "CreditCard", isEnabled: true, planRequired: "free", displayOrder: 16, navVisibility: true }
];

export const INITIAL_MEDIA_ASSETS: PlatformMediaAsset[] = [
  { id: "med_1", fileName: "meezan_bank_raast_qr.png", filePath: "payouts/meezan_bank_raast_qr.png", storageBucket: "platform-media", publicUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80", altText: "Official Meezan Bank Raast QR Code", category: "payouts", sizeBytes: 142000, mimeType: "image/png", createdAt: new Date().toISOString() },
  { id: "med_2", fileName: "hero_construction_blueprint.jpg", filePath: "banners/hero_construction_blueprint.jpg", storageBucket: "platform-media", publicUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=600&q=80", altText: "Pakistani Residential Architecture Blueprint", category: "banners", sizeBytes: 380000, mimeType: "image/jpeg", createdAt: new Date().toISOString() },
  { id: "med_3", fileName: "layout_5_marla_double_storey.jpg", filePath: "layouts/layout_5_marla_double_storey.jpg", storageBucket: "platform-media", publicUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", altText: "5 Marla Double Storey Reference CAD Layout", category: "layouts", sizeBytes: 290000, mimeType: "image/jpeg", createdAt: new Date().toISOString() }
];

export const INITIAL_EMERGENCY_STATUS: PlatformEmergencyStatus = {
  id: "global_status",
  isEmergencyMode: false,
  maintenanceMessage: "BuildCost Connect is operating normally with all civil calculation nodes active.",
  registrationsEnabled: true,
  paymentsEnabled: true,
  pdfEnabled: true,
  aiEnabled: true,
  ratesUpdateEnabled: true
};

export const INITIAL_PROMOTIONS: PromotionCampaign[] = [
  {
    id: "promo_1",
    name: "Ramadan Kareem Pro Special",
    code: "RAMADAN2026",
    description: "25% discount on annual Pro subscription with priority support",
    startDate: "2026-03-01",
    endDate: "2026-04-15",
    eligibleUsers: "all_free",
    targetPlan: "pro",
    discountPct: 25,
    trialDays: 0,
    featuresUnlocked: ["advanced_grey_structure", "advanced_boq", "vendor_management"],
    isActive: true
  },
  {
    id: "promo_2",
    name: "7-Day Pro Contractor Trial",
    code: "TRIAL7DAY",
    description: "Complimentary 7-day access to BOQ Studio and Rate Intelligence",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    eligibleUsers: "all_free",
    targetPlan: "pro",
    discountPct: 0,
    trialDays: 7,
    featuresUnlocked: ["advanced_grey_structure", "advanced_boq", "vendor_management", "ai_construction_advisor"],
    isActive: true
  }
];

export const INITIAL_SUPERADMIN_AUDITS: SuperAdminAuditRecord[] = [
  {
    id: "aud_init_1",
    adminEmail: "imaginary.guy.project@gmail.com",
    action: "SYSTEM_INITIALIZED",
    entityType: "system",
    reason: "Platform Control Center v2.0 initialized",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan_free",
    name: "Free Starter",
    slug: "free",
    tier: "free",
    description: "Standard residential civil estimators and basic project tools",
    price: 0,
    priceMonthlyPkr: 0,
    priceAnnualPkr: 0,
    currency: "PKR",
    billingPeriod: "monthly",
    maxProjects: 3,
    features: { basicEstimator: true, greyStructure: true, defaultRates: true, pdfExport: true },
    isActive: true
  },
  {
    id: "plan_pro",
    name: "BuildCost Pro",
    slug: "pro",
    tier: "pro",
    description: "Full construction management, procurement, vendor ledgers & live rate tracking",
    price: 200,
    priceMonthlyPkr: 200,
    priceAnnualPkr: 500,
    currency: "PKR",
    billingPeriod: "monthly",
    maxProjects: 999999,
    features: { unlimitedProjects: true, advancedBoq: true, vendorKhata: true, aiAdvisor: true },
    isActive: true
  }
];

export const useSystemSettingsStore = create<SystemSettingsState>()(
  persist(
    (set, get) => ({
      businessName: process.env.NEXT_PUBLIC_APP_NAME || BUSINESS_CONFIG.businessName,
      adminEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || BUSINESS_CONFIG.adminEmail,
      adminWhatsApp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || BUSINESS_CONFIG.adminWhatsApp,
      adminWhatsAppRaw: BUSINESS_CONFIG.adminWhatsAppRaw,

      easypaisa: {
        accountName: process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NAME || BUSINESS_CONFIG.easypaisa.accountName,
        accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || BUSINESS_CONFIG.easypaisa.accountNumber,
        accountNumberRaw: BUSINESS_CONFIG.easypaisa.accountNumberRaw
      },

      jazzcash: {
        accountName: process.env.NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME || BUSINESS_CONFIG.jazzcash.accountName,
        accountNumber: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || BUSINESS_CONFIG.jazzcash.accountNumber,
        accountNumberRaw: BUSINESS_CONFIG.jazzcash.accountNumberRaw
      },
      bankTransfer: { ...BUSINESS_CONFIG.bankTransfer },

      proMonthlyRate: 200,
      proAnnualRate: 500,
      pricingCurrency: "PKR",
      isPricingLoading: false,
      subscriptionPlans: INITIAL_SUBSCRIPTION_PLANS,
      launchPriceConfig: DEFAULT_LAUNCH_PRICE_CONFIG,
      freeProjectLimit: 2,
      freePdfLimit: 3,
      upgradeBannerVisible: true,
      promotionalHeadline: "Build smarter. Estimate better.",
      promotionalDiscountPct: 20,

      // Live Dynamic Payment Accounts
      paymentAccounts: INITIAL_PAYMENT_ACCOUNTS,
      payments: INITIAL_PAYMENTS,
      auditEntries: INITIAL_AUDITS,

      // Super Admin Control Center State
      featureFlags: INITIAL_FEATURE_FLAGS,
      platformContent: INITIAL_PLATFORM_CONTENT,
      platformSections: INITIAL_PLATFORM_SECTIONS,
      platformMedia: INITIAL_MEDIA_ASSETS,
      emergencyStatus: INITIAL_EMERGENCY_STATUS,
      superAdminAuditLogs: INITIAL_SUPERADMIN_AUDITS,
      promotions: INITIAL_PROMOTIONS,

      updateFeatureFlag: (key, updates) => {
        set((state) => ({
          featureFlags: state.featureFlags.map((f) =>
            f.key === key ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          )
        }));
      },

      bulkUpdateFeatureFlags: (keys, action) => {
        set((state) => ({
          featureFlags: state.featureFlags.map((f) => {
            if (!keys.includes(f.key)) return f;
            const updated = { ...f, updatedAt: new Date().toISOString() };
            if (action === "make_free") updated.planRequired = "free";
            if (action === "make_pro") updated.planRequired = "pro";
            if (action === "enable") updated.enabled = true;
            if (action === "disable") updated.enabled = false;
            return updated;
          })
        }));
      },

      updateContentItem: (key, content, title) => {
        set((state) => ({
          platformContent: state.platformContent.map((item) => {
            if (item.key !== key) return item;
            const previous = item.previousVersions || [];
            previous.push({
              version: item.version,
              content: item.content,
              updatedAt: new Date().toISOString()
            });
            return {
              ...item,
              content,
              title: title || item.title,
              version: item.version + 1,
              previousVersions: previous,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },

      rollbackContentVersion: (key, targetVersion) => {
        set((state) => ({
          platformContent: state.platformContent.map((item) => {
            if (item.key !== key) return item;
            const target = item.previousVersions?.find((v) => v.version === targetVersion);
            if (!target) return item;
            return {
              ...item,
              content: target.content,
              version: item.version + 1,
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },

      updateSectionItem: (key, updates) => {
        set((state) => ({
          platformSections: state.platformSections.map((s) =>
            s.key === key ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          )
        }));
      },

      updateEmergencyStatus: (updates) => {
        set((state) => ({
          emergencyStatus: {
            ...state.emergencyStatus,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }));
      },

      addMediaAsset: (asset) => {
        set((state) => ({
          platformMedia: [
            {
              ...asset,
              id: `med_${Date.now()}`,
              createdAt: new Date().toISOString()
            },
            ...state.platformMedia
          ]
        }));
      },

      deleteMediaAsset: (id) => {
        set((state) => ({
          platformMedia: state.platformMedia.filter((m) => m.id !== id)
        }));
      },

      addSuperAdminAuditLog: (entry) => {
        set((state) => ({
          superAdminAuditLogs: [
            {
              ...entry,
              id: `aud_${Date.now()}`,
              createdAt: new Date().toISOString()
            },
            ...state.superAdminAuditLogs
          ]
        }));
      },

      fetchSubscriptionPlans: async () => {
        try {
          set({ isPricingLoading: true });
          const res = await fetch("/api/pricing", { cache: "no-store" });
          if (!res.ok) {
            set({ isPricingLoading: false });
            return;
          }
          const data = await res.json();
          if (data.success && Array.isArray(data.plans)) {
            const proPlan = data.plans.find((p: SubscriptionPlan) => p.slug === "pro" || p.tier === "pro");
            set((state) => ({
              subscriptionPlans: data.plans,
              proMonthlyRate: data.proMonthlyRate || (proPlan?.priceMonthlyPkr ?? proPlan?.price) || state.proMonthlyRate,
              proAnnualRate: data.proAnnualRate || proPlan?.priceAnnualPkr || state.proAnnualRate,
              pricingCurrency: data.currency || proPlan?.currency || state.pricingCurrency || "PKR",
              isPricingLoading: false
            }));
          } else {
            set({ isPricingLoading: false });
          }
        } catch (err) {
          console.error("[PricingStore] Error fetching subscription plans:", err);
          set({ isPricingLoading: false });
        }
      },

      saveProPricing: async (updates) => {
        try {
          const { monthlyPrice, annualPrice, currency = "PKR", reason } = updates;
          const computedAnnual = annualPrice !== undefined ? annualPrice : monthlyPrice * 10;

          // Call server-side protected admin pricing API
          const res = await fetch("/api/admin/pricing", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planSlug: "pro",
              price: monthlyPrice,
              priceMonthlyPkr: monthlyPrice,
              priceAnnualPkr: computedAnnual,
              currency,
              reason: reason || `Updated Pro pricing to ${currency} ${monthlyPrice}`
            })
          });

          const result = await res.json();
          if (result.success) {
            set((state) => ({
              proMonthlyRate: monthlyPrice,
              proAnnualRate: computedAnnual,
              pricingCurrency: currency,
              subscriptionPlans: state.subscriptionPlans.map((p) =>
                p.slug === "pro" || p.tier === "pro"
                  ? {
                      ...p,
                      price: monthlyPrice,
                      priceMonthlyPkr: monthlyPrice,
                      priceAnnualPkr: computedAnnual,
                      currency
                    }
                  : p
              )
            }));
            // Refresh from DB to guarantee store consistency
            await get().fetchSubscriptionPlans();
            return { success: true };
          } else {
            return { success: false, error: result.error || "Failed to update pricing" };
          }
        } catch (err: any) {
          console.error("[PricingStore] saveProPricing failed:", err);
          return { success: false, error: err?.message || "Network error" };
        }
      },

      updateBusinessSettings: (settings) => {
        set((state) => ({
          businessName: settings.businessName || state.businessName,
          adminEmail: settings.adminEmail || state.adminEmail,
          adminWhatsApp: settings.adminWhatsApp || state.adminWhatsApp,
          adminWhatsAppRaw: settings.adminWhatsApp
            ? settings.adminWhatsApp.replace(/\D/g, "").replace(/^0/, "92")
            : state.adminWhatsAppRaw,
          auditEntries: [
            {
              id: `audit_${Date.now()}`,
              adminName: "Admin User",
              action: "Updated Business Settings",
              details: `Email: ${settings.adminEmail || state.adminEmail}, WhatsApp: ${settings.adminWhatsApp || state.adminWhatsApp}`,
              timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
            },
            ...state.auditEntries
          ]
        }));
      },

      updateEasypaisaSettings: (settings) => {
        set((state) => {
          const newEp = {
            ...state.easypaisa,
            ...settings,
            accountNumberRaw: settings.accountNumber
              ? settings.accountNumber.replace(/\D/g, "")
              : state.easypaisa.accountNumberRaw
          };

          const updatedAccounts = state.paymentAccounts.map((a) => {
            if (a.type === "easypaisa" && a.isDefault) {
              return {
                ...a,
                accountTitle: settings.accountName || a.accountTitle,
                accountNumber: settings.accountNumber || a.accountNumber,
                updatedAt: new Date().toISOString()
              };
            }
            return a;
          });

          return {
            easypaisa: newEp,
            paymentAccounts: updatedAccounts,
            auditEntries: [
              {
                id: `audit_${Date.now()}`,
                adminName: "Super Admin",
                action: "Updated Easypaisa Account",
                details: `Account: ${newEp.accountNumber} (${newEp.accountName})`,
                timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
              },
              ...state.auditEntries
            ]
          };
        });
      },

      updateJazzCashSettings: (settings) => {
        set((state) => {
          const newJc = { ...state.jazzcash, ...settings };
          const updatedAccounts = state.paymentAccounts.map((a) => {
            if (a.type === "jazzcash" && a.isDefault) {
              return {
                ...a,
                accountTitle: settings.accountName || a.accountTitle,
                accountNumber: settings.accountNumber || a.accountNumber,
                updatedAt: new Date().toISOString()
              };
            }
            return a;
          });

          return {
            jazzcash: newJc,
            paymentAccounts: updatedAccounts,
            auditEntries: [
              {
                id: `audit_${Date.now()}`,
                adminName: "Super Admin",
                action: "Updated JazzCash Account",
                details: `Account: ${newJc.accountNumber} (${newJc.accountName})`,
                timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
              },
              ...state.auditEntries
            ]
          };
        });
      },

      updateBankSettings: (settings) => {
        set((state) => {
          const newBank = { ...state.bankTransfer, ...settings };
          const updatedAccounts = state.paymentAccounts.map((a) => {
            if (a.type === "bank_transfer" && a.isDefault) {
              return {
                ...a,
                accountTitle: settings.accountName || a.accountTitle,
                accountNumber: settings.accountNumber || a.accountNumber,
                bankName: settings.bankName || a.bankName,
                iban: settings.iban || a.iban,
                updatedAt: new Date().toISOString()
              };
            }
            return a;
          });

          return {
            bankTransfer: newBank,
            paymentAccounts: updatedAccounts,
            auditEntries: [
              {
                id: `audit_${Date.now()}`,
                adminName: "Super Admin",
                action: "Updated Bank Account",
                details: `Bank: ${newBank.bankName}, Account: ${newBank.accountNumber} (${newBank.accountName})`,
                timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
              },
              ...state.auditEntries
            ]
          };
        });
      },

      addPaymentAccount: (accountData) => {
        const newAccount: PaymentAccount = {
          ...accountData,
          id: `pa_${accountData.type}_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => {
          let updatedAccounts = [...state.paymentAccounts];
          if (newAccount.isDefault) {
            updatedAccounts = updatedAccounts.map((a) =>
              a.type === newAccount.type ? { ...a, isDefault: false } : a
            );
          }
          updatedAccounts.push(newAccount);

          const legacyUpdates: Partial<SystemSettingsState> = {};
          if (newAccount.type === "easypaisa" && (newAccount.isDefault || !state.easypaisa.accountNumber)) {
            legacyUpdates.easypaisa = {
              accountName: newAccount.accountTitle,
              accountNumber: newAccount.accountNumber,
              accountNumberRaw: newAccount.accountNumber.replace(/\D/g, "")
            };
          } else if (newAccount.type === "jazzcash" && (newAccount.isDefault || !state.jazzcash.accountNumber)) {
            legacyUpdates.jazzcash = {
              accountName: newAccount.accountTitle,
              accountNumber: newAccount.accountNumber,
              accountNumberRaw: newAccount.accountNumber.replace(/\D/g, "")
            };
          } else if (newAccount.type === "bank_transfer" && (newAccount.isDefault || !state.bankTransfer.accountNumber)) {
            legacyUpdates.bankTransfer = {
              accountName: newAccount.accountTitle,
              accountNumber: newAccount.accountNumber,
              bankName: newAccount.bankName,
              iban: newAccount.iban
            };
          }

          const audit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName: "Super Admin",
            action: "Added Payment Account",
            details: `Added ${newAccount.type.toUpperCase()}: ${newAccount.accountTitle} (${newAccount.accountNumber})`,
            timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
          };

          return {
            ...legacyUpdates,
            paymentAccounts: updatedAccounts,
            auditEntries: [audit, ...state.auditEntries]
          };
        });

        return newAccount;
      },

      updatePaymentAccount: (id, updates) => {
        set((state) => {
          const current = state.paymentAccounts.find((a) => a.id === id);
          if (!current) return state;

          const updatedAccounts = state.paymentAccounts.map((a) => {
            if (a.id === id) {
              return {
                ...a,
                ...updates,
                updatedAt: new Date().toISOString()
              };
            }
            if (updates.isDefault && a.type === current.type && a.id !== id) {
              return { ...a, isDefault: false };
            }
            return a;
          });

          const updatedAccount = updatedAccounts.find((a) => a.id === id);
          const legacyUpdates: Partial<SystemSettingsState> = {};
          if (updatedAccount) {
            if (updatedAccount.type === "easypaisa" && updatedAccount.isDefault) {
              legacyUpdates.easypaisa = {
                accountName: updatedAccount.accountTitle,
                accountNumber: updatedAccount.accountNumber,
                accountNumberRaw: updatedAccount.accountNumber.replace(/\D/g, "")
              };
            } else if (updatedAccount.type === "jazzcash" && updatedAccount.isDefault) {
              legacyUpdates.jazzcash = {
                accountName: updatedAccount.accountTitle,
                accountNumber: updatedAccount.accountNumber,
                accountNumberRaw: updatedAccount.accountNumber.replace(/\D/g, "")
              };
            } else if (updatedAccount.type === "bank_transfer" && updatedAccount.isDefault) {
              legacyUpdates.bankTransfer = {
                accountName: updatedAccount.accountTitle,
                accountNumber: updatedAccount.accountNumber,
                bankName: updatedAccount.bankName,
                iban: updatedAccount.iban
              };
            }
          }

          const audit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName: "Super Admin",
            action: "Updated Payment Account",
            details: updatedAccount
              ? `Modified ${updatedAccount.type.toUpperCase()}: ${updatedAccount.accountNumber} (${updatedAccount.accountTitle})`
              : `Modified account #${id}`,
            timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
          };

          return {
            ...legacyUpdates,
            paymentAccounts: updatedAccounts,
            auditEntries: [audit, ...state.auditEntries]
          };
        });
      },

      deletePaymentAccount: (id) => {
        set((state) => {
          const deleted = state.paymentAccounts.find((a) => a.id === id);
          const filtered = state.paymentAccounts.filter((a) => a.id !== id);

          const audit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName: "Super Admin",
            action: "Deleted Payment Account",
            details: deleted
              ? `Removed ${deleted.type.toUpperCase()}: ${deleted.accountNumber} (${deleted.accountTitle})`
              : `Deleted account #${id}`,
            timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
          };

          return {
            paymentAccounts: filtered,
            auditEntries: [audit, ...state.auditEntries]
          };
        });
      },

      togglePaymentAccountActive: (id) => {
        set((state) => {
          const updated = state.paymentAccounts.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a
          );
          return { paymentAccounts: updated };
        });
      },

      setDefaultPaymentAccount: (id) => {
        set((state) => {
          const target = state.paymentAccounts.find((a) => a.id === id);
          if (!target) return state;

          const updated = state.paymentAccounts.map((a) => {
            if (a.id === id) return { ...a, isDefault: true, isActive: true, updatedAt: new Date().toISOString() };
            if (a.type === target.type) return { ...a, isDefault: false };
            return a;
          });

          const legacyUpdates: Partial<SystemSettingsState> = {};
          if (target.type === "easypaisa") {
            legacyUpdates.easypaisa = {
              accountName: target.accountTitle,
              accountNumber: target.accountNumber,
              accountNumberRaw: target.accountNumber.replace(/\D/g, "")
            };
          } else if (target.type === "jazzcash") {
            legacyUpdates.jazzcash = {
              accountName: target.accountTitle,
              accountNumber: target.accountNumber,
              accountNumberRaw: target.accountNumber.replace(/\D/g, "")
            };
          } else if (target.type === "bank_transfer") {
            legacyUpdates.bankTransfer = {
              accountName: target.accountTitle,
              accountNumber: target.accountNumber,
              bankName: target.bankName,
              iban: target.iban
            };
          }

          return {
            ...legacyUpdates,
            paymentAccounts: updated,
          };
        });
      },

      resetPaymentAccountsToDefault: () => {
        set({
          paymentAccounts: INITIAL_PAYMENT_ACCOUNTS,
          easypaisa: {
            accountName: INITIAL_PAYMENT_ACCOUNTS[0].accountTitle,
            accountNumber: INITIAL_PAYMENT_ACCOUNTS[0].accountNumber,
            accountNumberRaw: INITIAL_PAYMENT_ACCOUNTS[0].accountNumber.replace(/\D/g, "")
          },
          jazzcash: {
            accountName: INITIAL_PAYMENT_ACCOUNTS[1].accountTitle,
            accountNumber: INITIAL_PAYMENT_ACCOUNTS[1].accountNumber,
            accountNumberRaw: INITIAL_PAYMENT_ACCOUNTS[1].accountNumber.replace(/\D/g, "")
          },
          bankTransfer: {
            bankName: INITIAL_PAYMENT_ACCOUNTS[2].bankName,
            accountName: INITIAL_PAYMENT_ACCOUNTS[2].accountTitle,
            accountNumber: INITIAL_PAYMENT_ACCOUNTS[2].accountNumber,
            iban: INITIAL_PAYMENT_ACCOUNTS[2].iban
          }
        });
      },

      updatePricing: (monthly, annual) => {
        set({ proMonthlyRate: monthly, proAnnualRate: annual });
      },

      updateSubscriptionLimits: (params) => {
        set((state) => {
          const updatedState = {
            proMonthlyRate: params.proMonthlyRate !== undefined ? params.proMonthlyRate : state.proMonthlyRate,
            proAnnualRate: params.proAnnualRate !== undefined ? params.proAnnualRate : state.proAnnualRate,
            freeProjectLimit: params.freeProjectLimit !== undefined ? params.freeProjectLimit : state.freeProjectLimit,
            freePdfLimit: params.freePdfLimit !== undefined ? params.freePdfLimit : state.freePdfLimit,
            upgradeBannerVisible: params.upgradeBannerVisible !== undefined ? params.upgradeBannerVisible : state.upgradeBannerVisible,
            promotionalHeadline: params.promotionalHeadline !== undefined ? params.promotionalHeadline : state.promotionalHeadline,
            promotionalDiscountPct: params.promotionalDiscountPct !== undefined ? params.promotionalDiscountPct : state.promotionalDiscountPct
          };

          const newAudit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName: "Admin User",
            action: "Updated Subscription Configuration",
            details: `Monthly: Rs. ${updatedState.proMonthlyRate}, Free Project Limit: ${updatedState.freeProjectLimit}, Free PDF: ${updatedState.freePdfLimit}`,
            timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
          };

          return {
            ...updatedState,
            auditEntries: [newAudit, ...state.auditEntries]
          };
        });
      },

      submitPaymentVerification: (submission) => {
        const newRecord: PaymentSubmission = {
          ...submission,
          id: `pay_${Date.now()}`,
          submittedAt: "Just now",
          status: "pending"
        };
        set((state) => ({
          payments: [newRecord, ...state.payments]
        }));
        return newRecord;
      },

      approvePayment: (paymentId, adminName = "Umer Sheikh (Admin)") => {
        const now = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT";
        set((state) => {
          const target = state.payments.find((p) => p.id === paymentId);
          const updatedPayments = state.payments.map((p) =>
            p.id === paymentId
              ? { ...p, status: "approved" as const, approvedAt: now, approvedBy: adminName }
              : p
          );

          const newAudit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName,
            action: "Approved Payment Verification",
            details: `Approved ${target?.provider.toUpperCase() || "Payment"} TRX #${target?.trxId || paymentId} for ${target?.userName || "Customer"} (Rs. ${target?.amountPkr || 0}). Pro activated.`,
            timestamp: now
          };

          return {
            payments: updatedPayments,
            auditEntries: [newAudit, ...state.auditEntries]
          };
        });
      },

      rejectPayment: (paymentId, reason, adminName = "Umer Sheikh (Admin)") => {
        const now = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT";
        set((state) => {
          const target = state.payments.find((p) => p.id === paymentId);
          const updatedPayments = state.payments.map((p) =>
            p.id === paymentId
              ? { ...p, status: "rejected" as const, rejectionReason: reason }
              : p
          );

          const newAudit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName,
            action: "Rejected Payment Verification",
            details: `Rejected ${target?.provider.toUpperCase() || "Payment"} TRX #${target?.trxId || paymentId} for ${target?.userName || "Customer"}. Reason: ${reason}`,
            timestamp: now
          };

          return {
            payments: updatedPayments,
            auditEntries: [newAudit, ...state.auditEntries]
          };
        });
      },

      updatePaymentStatus: (paymentId, status, reason, adminName = "Umer Sheikh (Admin)") => {
        const now = new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT";
        set((state) => {
          const target = state.payments.find((p) => p.id === paymentId);
          const updatedPayments = state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status,
                  ...(status === "approved" ? { approvedAt: now, approvedBy: adminName } : {}),
                  ...(reason ? { rejectionReason: reason } : {})
                }
              : p
          );

          const newAudit: SystemAuditEntry = {
            id: `audit_${Date.now()}`,
            adminName,
            action: `Payment Status -> ${status.toUpperCase()}`,
            details: `Updated ${target?.provider.toUpperCase() || "Payment"} TRX #${target?.trxId || paymentId} to ${status.toUpperCase()}${reason ? ` (${reason})` : ""}`,
            timestamp: now
          };

          return {
            payments: updatedPayments,
            auditEntries: [newAudit, ...state.auditEntries]
          };
        });
      },

      // Promotions Management
      addPromotion: (promo) => {
        set((state) => ({
          promotions: [promo, ...state.promotions]
        }));
      },

      updatePromotion: (id, updates) => {
        set((state) => ({
          promotions: state.promotions.map((p) => (p.id === id ? { ...p, ...updates } : p))
        }));
      },

      togglePromotionActive: (id) => {
        set((state) => ({
          promotions: state.promotions.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
        }));
      },

      updateLaunchPriceConfig: (updates) => {
        set((state) => {
          const updated = { ...state.launchPriceConfig, ...updates };
          return {
            launchPriceConfig: updated,
            proMonthlyRate: updated.enabled ? updated.monthlyPrice : updated.regularMonthlyPrice,
            proAnnualRate: updated.enabled ? updated.annualPrice : updated.regularAnnualPrice,
            auditEntries: [
              {
                id: `audit_${Date.now()}`,
                adminName: "Super Admin",
                action: "Updated Launch Pricing Settings",
                details: `Launch Active: ${updated.enabled}, Monthly: PKR ${updated.monthlyPrice}, Annual: PKR ${updated.annualPrice}`,
                timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
              },
              ...state.auditEntries
            ]
          };
        });
      },

      /**
       * Generates official WhatsApp payment slip submission URL
       * Does NOT auto-send; customer explicitly reviews and sends in WhatsApp.
       */
      getWhatsAppPaymentUrl: (details) => {
        const { adminWhatsAppRaw } = get();
        const providerName =
          details.paymentMethod === "easypaisa"
            ? "Easypaisa"
            : details.paymentMethod === "jazzcash"
            ? "JazzCash"
            : "Bank Transfer";

        const textMessage =
          `PRO Upgrade Payment\n\n` +
          `Name: ${details.name || "Customer"}\n` +
          `Email: ${details.email || "customer@buildcost.pk"}\n` +
          `Amount: PKR ${details.amount.toLocaleString()}\n` +
          `Payment Method: ${providerName}\n` +
          `Transaction ID: ${details.trxId || "N/A"}\n` +
          `Payment Date: ${details.paymentDate || new Date().toISOString().split("T")[0]}\n\n` +
          `"Payment slip attached."`;

        const encodedMessage = encodeURIComponent(textMessage);
        return `https://wa.me/${adminWhatsAppRaw}?text=${encodedMessage}`;
      },

      /**
       * Admin 1-Click WhatsApp User Contact URL
       * Pre-fills message without auto-sending.
       */
      getAdminContactUserWhatsAppUrl: (details) => {
        const rawPhone = (details.userPhone || "").replace(/\D/g, "").replace(/^0/, "92");
        const textMessage =
          `Hello ${details.name || "Valued User"},\n\n` +
          `We received your Pro subscription payment of PKR ${details.amount.toLocaleString()}.\n` +
          `Your payment is currently under verification.`;

        const encoded = encodeURIComponent(textMessage);
        return rawPhone ? `https://wa.me/${rawPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
      }
    }),
    {
      name: "buildcost_system_settings_v1",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.paymentAccounts || state.paymentAccounts.length === 0) {
          state.paymentAccounts = INITIAL_PAYMENT_ACCOUNTS;
        }
        if (!state.featureFlags || state.featureFlags.length === 0) {
          state.featureFlags = INITIAL_FEATURE_FLAGS;
        }
        if (!state.platformContent || state.platformContent.length === 0) {
          state.platformContent = INITIAL_PLATFORM_CONTENT;
        }
        if (!state.platformSections || state.platformSections.length === 0) {
          state.platformSections = INITIAL_PLATFORM_SECTIONS;
        }
        if (!state.platformMedia || state.platformMedia.length === 0) {
          state.platformMedia = INITIAL_MEDIA_ASSETS;
        }
        if (!state.emergencyStatus) {
          state.emergencyStatus = INITIAL_EMERGENCY_STATUS;
        }
        if (!state.superAdminAuditLogs || state.superAdminAuditLogs.length === 0) {
          state.superAdminAuditLogs = INITIAL_SUPERADMIN_AUDITS;
        }
        if (!state.promotions || state.promotions.length === 0) {
          state.promotions = INITIAL_PROMOTIONS;
        }
        // Ensure default accounts sync to legacy fields
        const defaultEp = state.paymentAccounts.find((a) => a.type === "easypaisa" && a.isDefault) || state.paymentAccounts.find((a) => a.type === "easypaisa");
        if (defaultEp) {
          state.easypaisa = {
            accountName: defaultEp.accountTitle,
            accountNumber: defaultEp.accountNumber,
            accountNumberRaw: defaultEp.accountNumber.replace(/\D/g, "")
          };
        }
        const defaultJc = state.paymentAccounts.find((a) => a.type === "jazzcash" && a.isDefault) || state.paymentAccounts.find((a) => a.type === "jazzcash");
        if (defaultJc) {
          state.jazzcash = {
            accountName: defaultJc.accountTitle,
            accountNumber: defaultJc.accountNumber,
            accountNumberRaw: defaultJc.accountNumber.replace(/\D/g, "")
          };
        }
        const defaultBank = state.paymentAccounts.find((a) => a.type === "bank_transfer" && a.isDefault) || state.paymentAccounts.find((a) => a.type === "bank_transfer");
        if (defaultBank) {
          state.bankTransfer = {
            bankName: defaultBank.bankName || "Corporate Bank",
            accountName: defaultBank.accountTitle,
            accountNumber: defaultBank.accountNumber,
            iban: defaultBank.iban
          };
        }

        // Live synchronisation of centralized subscription plans from server
        if (typeof window !== "undefined" && typeof state.fetchSubscriptionPlans === "function") {
          setTimeout(() => {
            state.fetchSubscriptionPlans();
          }, 0);
        }
      }
    }
  )
);
