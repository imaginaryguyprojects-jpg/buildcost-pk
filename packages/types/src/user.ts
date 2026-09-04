import { AreaUnit, CurrencyUnit } from "@buildcost/config";

export type UserRole = "user" | "admin" | "superadmin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  companyName?: string;
  cityId: string;
  role: UserRole;
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
