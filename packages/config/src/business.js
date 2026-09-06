"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUSINESS_CONFIG = exports.hasRolePermission = exports.ROLE_HIERARCHY = exports.isSuperAdminEmail = exports.SUPER_ADMIN_EMAILS = void 0;
/**
 * Super Admin Identity Matrix (Dual God-Mode Emails)
 */
exports.SUPER_ADMIN_EMAILS = [
    "imaginary.guy.project@gmail.com",
    "umershahzad0@gmail.com"
];
const isSuperAdminEmail = (email) => {
    if (!email)
        return false;
    const normalized = email.trim().toLowerCase();
    return exports.SUPER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
};
exports.isSuperAdminEmail = isSuperAdminEmail;
exports.ROLE_HIERARCHY = {
    super_admin: 100,
    admin: 80,
    editor: 60,
    support: 40,
    user: 10
};
const hasRolePermission = (role, requiredRole) => {
    if (!role)
        return false;
    const normalized = role.toLowerCase() === "superadmin" ? "super_admin" : role.toLowerCase();
    const userLevel = exports.ROLE_HIERARCHY[normalized] ?? 0;
    const requiredLevel = exports.ROLE_HIERARCHY[requiredRole] ?? 0;
    return userLevel >= requiredLevel;
};
exports.hasRolePermission = hasRolePermission;
/**
 * Official Project Owner & Admin Configuration
 * Sections 106–109 & 114–120
 */
exports.BUSINESS_CONFIG = {
    businessName: "BuildCost Connect",
    adminEmail: "imaginary.guy.project@gmail.com",
    superAdminEmails: exports.SUPER_ADMIN_EMAILS,
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
