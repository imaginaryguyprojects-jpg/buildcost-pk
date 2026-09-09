import { AreaUnit, CurrencyUnit } from "@buildcost/config";

export type UserRole = "user" | "admin" | "superadmin";

export type SubscriptionTier = "free" | "pro" | "business";

export type SubscriptionStatus =
  | "FREE"
  | "PRO_ACTIVE"
  | "PRO_PENDING_PAYMENT"
  | "PRO_EXPIRED"
  | "PRO_CANCELLED";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  companyName?: string;
  cityId: string;
  role: UserRole;
  plan?: SubscriptionTier;
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  is_pro?: boolean;
  emailConfirmed?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: "dark" | "light" | "system";
  preferredCurrency: CurrencyUnit;
  preferredAreaUnit: AreaUnit;
  preferredMarlaStandardId: string;
  defaultCityId: string;
  language: "en" | "ur";
  notifyOnRateChange: boolean;
}
