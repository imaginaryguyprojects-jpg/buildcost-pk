import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUSINESS_CONFIG, BusinessConfig, PaymentMethodConfig } from "@buildcost/config";

export interface PaymentSubmission {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  plan: "pro_monthly" | "pro_annual";
  amountPkr: number;
  provider: "easypaisa" | "jazzcash" | "bank_transfer";
  trxId: string;
  screenshotName: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
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

  // Live Payment Verification Queue
  payments: PaymentSubmission[];
  auditEntries: SystemAuditEntry[];

  // Update actions
  updateBusinessSettings: (settings: {
    businessName?: string;
    adminEmail?: string;
    adminWhatsApp?: string;
  }) => void;
  updateEasypaisaSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updateJazzCashSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updateBankSettings: (settings: Partial<PaymentMethodConfig>) => void;
  updatePricing: (monthly: number, annual: number) => void;

  // Verification operations
  submitPaymentVerification: (submission: Omit<PaymentSubmission, "id" | "submittedAt" | "status">) => PaymentSubmission;
  approvePayment: (paymentId: string, adminName?: string) => void;
  rejectPayment: (paymentId: string, reason: string, adminName?: string) => void;

  // Helpers
  getWhatsAppPaymentUrl: (details: {
    name?: string;
    email?: string;
    paymentMethod: string;
    amount: number;
    trxId?: string;
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

      proMonthlyRate: 1999,
      proAnnualRate: 19990,

      payments: INITIAL_PAYMENTS,
      auditEntries: INITIAL_AUDITS,

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
        set((state) => ({
          easypaisa: {
            ...state.easypaisa,
            ...settings,
            accountNumberRaw: settings.accountNumber
              ? settings.accountNumber.replace(/\D/g, "")
              : state.easypaisa.accountNumberRaw
          },
          auditEntries: [
            {
              id: `audit_${Date.now()}`,
              adminName: "Admin User",
              action: "Updated Easypaisa Account",
              details: `Account: ${settings.accountNumber || state.easypaisa.accountNumber} (${settings.accountName || state.easypaisa.accountName})`,
              timestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
            },
            ...state.auditEntries
          ]
        }));
      },

      updateJazzCashSettings: (settings) => {
        set((state) => ({
          jazzcash: { ...state.jazzcash, ...settings }
        }));
      },

      updateBankSettings: (settings) => {
        set((state) => ({
          bankTransfer: { ...state.bankTransfer, ...settings }
        }));
      },

      updatePricing: (monthly, annual) => {
        set({ proMonthlyRate: monthly, proAnnualRate: annual });
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

      /**
       * Section 108: Generates WhatsApp pre-filled message URL
       * Does NOT auto-send; customer must explicitly press Send in WhatsApp.
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
          `Hello BuildCost Connect Admin,\n\n` +
          `I have made a payment for the Pro subscription.\n\n` +
          `Name: ${details.name || "[Your Name]"}\n` +
          `Email: ${details.email || "[Your Email]"}\n` +
          `Payment Method: ${providerName}\n` +
          `Amount: Rs. ${details.amount.toLocaleString()}\n` +
          `Transaction ID: ${details.trxId || "[Transaction ID]"}\n\n` +
          `I am attaching my payment slip for verification.`;

        const encodedMessage = encodeURIComponent(textMessage);
        return `https://wa.me/${adminWhatsAppRaw}?text=${encodedMessage}`;
      }
    }),
    {
      name: "buildcost_system_settings_v1"
    }
  )
);
