export interface PaymentMethodConfig {
  accountName: string;
  accountNumber: string;
  accountNumberRaw?: string;
  bankName?: string;
  iban?: string;
}

export type PaymentAccountType =
  | "easypaisa"
  | "jazzcash"
  | "bank_transfer"
  | "raast"
  | "sadapay"
  | "nayapay"
  | "other";

export interface PaymentAccount {
  id: string;
  type: PaymentAccountType;
  title: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  branchCode?: string;
  whatsappForSlip?: string;
  instructions?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessConfig {
  businessName: string;
  adminEmail: string;
  superAdminEmails: string[];
  adminWhatsApp: string;
  adminWhatsAppRaw: string;
  adminWhatsAppUrl: string;
  easypaisa: PaymentMethodConfig;
  jazzcash: PaymentMethodConfig;
  bankTransfer: PaymentMethodConfig;
}

/**
 * Super Admin Identity Matrix (Dual God-Mode Emails)
 */
export const SUPER_ADMIN_EMAILS: string[] = [
  "imaginary.guy.project@gmail.com",
  "umershahzad0@gmail.com"
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
};

export type PlatformRole = "super_admin" | "admin" | "editor" | "support" | "user";

export const ROLE_HIERARCHY: Record<PlatformRole, number> = {
  super_admin: 100,
  admin: 80,
  editor: 60,
  support: 40,
  user: 10
};

export const hasRolePermission = (
  role: string | undefined | null,
  requiredRole: PlatformRole
): boolean => {
  if (!role) return false;
  const normalized = role.toLowerCase() === "superadmin" ? "super_admin" : (role.toLowerCase() as PlatformRole);
  const userLevel = ROLE_HIERARCHY[normalized] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
};

export interface FeatureFlagItem {
  id: string;
  key: string;
  name: string;
  description: string;
  category: "calculators" | "market" | "site" | "logistics" | "reports" | "design" | "ai" | "financials" | "system" | string;
  enabled: boolean;
  planRequired: "free" | "pro" | "business" | "disabled";
  platform: "all" | "web" | "android" | "extension";
  rolloutPercentage: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PlatformContentItem {
  id: string;
  key: string;
  section: string;
  title: string;
  content: string;
  meta?: Record<string, any>;
  isPublished: boolean;
  version: number;
  previousVersions?: { version: number; content: string; updatedBy?: string; updatedAt: string }[];
  updatedBy?: string;
  updatedAt?: string;
}

export interface PlatformSectionItem {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  planRequired: "free" | "pro" | "disabled";
  displayOrder: number;
  navVisibility: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PlatformNavigationItem {
  id: string;
  location: "sidebar" | "topbar" | "mobile" | "footer";
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  planRequired: "free" | "pro" | "admin" | "none";
  isEnabled: boolean;
  displayOrder: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PlatformMediaAsset {
  id: string;
  fileName: string;
  filePath: string;
  storageBucket: string;
  publicUrl: string;
  altText?: string;
  category: string;
  sizeBytes: number;
  mimeType: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface PlatformEmergencyStatus {
  id: string;
  isEmergencyMode: boolean;
  maintenanceMessage: string;
  registrationsEnabled: boolean;
  paymentsEnabled: boolean;
  pdfEnabled: boolean;
  aiEnabled: boolean;
  ratesUpdateEnabled: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SuperAdminAuditRecord {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: string;
}

export type PaymentStatusType =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired"
  | "refunded";

export interface PromotionCampaign {
  id: string;
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  eligibleUsers: "all_free" | "new_users" | "contractors" | "all";
  targetPlan: "pro";
  discountPct: number;
  trialDays: number;
  featuresUnlocked: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface ActiveSessionRecord {
  id: string;
  userId?: string;
  guestId?: string;
  platform: "web" | "android" | "extension";
  plan: "free" | "pro" | "business";
  city: string;
  ipAddress?: string;
  lastActiveAt: string;
}

export interface PlatformUsageMetrics {
  users: number;
  sessions: number;
  activeUsers: number;
  calculations: number;
  projects: number;
  pdfs: number;
  shares: number;
  conversions: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  tier: "free" | "pro" | "business";
  description: string;
  price: number;
  priceMonthlyPkr: number;
  priceAnnualPkr: number;
  currency: string;
  billingPeriod: "monthly" | "annual";
  maxProjects: number;
  maxSavedEstimates?: number;
  maxVendors?: number;
  maxStorageMb?: number;
  features: Record<string, boolean>;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface LaunchPriceConfig {
  enabled: boolean;
  monthlyPrice: number;
  annualPrice: number;
  regularMonthlyPrice: number;
  regularAnnualPrice: number;
  currency: string;
  messageUrdu: string;
  messageEnglish: string;
}

export const DEFAULT_LAUNCH_PRICE_CONFIG: LaunchPriceConfig = {
  enabled: true,
  monthlyPrice: 200,
  annualPrice: 500,
  regularMonthlyPrice: 399,
  regularAnnualPrice: 3999,
  currency: "PKR",
  messageUrdu:
    "Introducing Launch Price 🎉\n\nیہ خصوصی قیمت ہماری launching کی خوشی میں رکھی گئی ہے۔\n\nPro subscription ابھی صرف:\n\nPKR 200/month\nPKR 500/year\n\nپر دستیاب ہے۔\n\nیہ Introducing / Launching Price ہے۔\nمستقبل میں subscription price بڑھ سکتی ہے۔",
  messageEnglish:
    "Introducing Launch Price 🎉\n\nThese special prices are being offered as part of our launch celebration.\n\nPro is currently available for:\n\nPKR 200/month\nPKR 500/year\n\nThis is an introductory launch price.\nThe Pro subscription price may increase in the future."
};


/**
 * Official Project Owner & Admin Configuration
 * Sections 106–109 & 114–120
 */
export const BUSINESS_CONFIG: BusinessConfig = {
  businessName: "BuildCost Connect",
  adminEmail: "imaginary.guy.project@gmail.com",
  superAdminEmails: SUPER_ADMIN_EMAILS,
  adminWhatsApp: "0345-50-74-541",
  adminWhatsAppRaw: "923455074541",
  adminWhatsAppUrl: "https://wa.me/923455074541",

  // Easypaisa Beneficiary Account
  easypaisa: {
    accountName: "Umer Shahzad",
    accountNumber: "0300-5155604",
    accountNumberRaw: "03005155604"
  },

  // Configurable JazzCash Account
  jazzcash: {
    accountName: "Umer Shahzad",
    accountNumber: "0300-5155604",
    accountNumberRaw: "03005155604"
  },

  // Configurable Corporate Bank Account
  bankTransfer: {
    bankName: "Meezan Bank Limited (I-8 Markaz Islamabad)",
    accountName: "BuildCost Technologies (Pvt) Ltd",
    accountNumber: "0002010108928371",
    iban: "PK72MEZN0002010108928371"
  }
};
