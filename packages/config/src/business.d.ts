export interface PaymentMethodConfig {
    accountName: string;
    accountNumber: string;
    accountNumberRaw?: string;
    bankName?: string;
    iban?: string;
}
export type PaymentAccountType = "easypaisa" | "jazzcash" | "bank_transfer" | "raast" | "sadapay" | "nayapay" | "other";
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
export declare const SUPER_ADMIN_EMAILS: string[];
export declare const isSuperAdminEmail: (email?: string | null) => boolean;
export type PlatformRole = "super_admin" | "admin" | "editor" | "support" | "user";
export declare const ROLE_HIERARCHY: Record<PlatformRole, number>;
export declare const hasRolePermission: (role: string | undefined | null, requiredRole: PlatformRole) => boolean;
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
    previousVersions?: {
        version: number;
        content: string;
        updatedBy?: string;
        updatedAt: string;
    }[];
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
/**
 * Official Project Owner & Admin Configuration
 * Sections 106–109 & 114–120
 */
export declare const BUSINESS_CONFIG: BusinessConfig;
