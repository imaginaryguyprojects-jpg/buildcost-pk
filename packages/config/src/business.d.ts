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
export declare const BUSINESS_CONFIG: BusinessConfig;
