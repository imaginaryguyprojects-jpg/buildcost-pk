export interface PaymentMethodConfig {
  accountName: string;
  accountNumber: string;
  accountNumberRaw?: string;
  bankName?: string;
  iban?: string;
}

export interface BusinessConfig {
  businessName: string;
  adminEmail: string;
  adminWhatsApp: string;
  adminWhatsAppRaw: string;
  adminWhatsAppUrl: string;
  easypaisa: PaymentMethodConfig;
  jazzcash: PaymentMethodConfig;
  bankTransfer: PaymentMethodConfig;
}

/**
 * Official Project Owner & Admin Configuration
 * Sections 106–109 & 114–120
 */
export const BUSINESS_CONFIG: BusinessConfig = {
  businessName: "BuildCost Connect",
  adminEmail: "imaginary.guy.project@gmail.com",
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
    accountName: "BuildCost Connect (Pvt) Ltd",
    accountNumber: "0301-9876543",
    accountNumberRaw: "03019876543"
  },

  // Configurable Corporate Bank Account
  bankTransfer: {
    bankName: "Meezan Bank Limited (I-8 Markaz Islamabad)",
    accountName: "BuildCost Technologies (Pvt) Ltd",
    accountNumber: "0002010108928371",
    iban: "PK72MEZN0002010108928371"
  }
};
