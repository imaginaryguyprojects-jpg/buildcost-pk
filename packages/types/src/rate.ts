import { MaterialUnit } from "./material.js";

export type RateSourceType = "official" | "supplier" | "market_survey" | "public_source" | "admin_verified" | "demo_sample";

export type ConfidenceScore = "HIGH" | "MEDIUM" | "LOW" | "ESTIMATED";

export type RateStatus = "collected" | "imported" | "reviewed" | "verified" | "published" | "expired";

export interface RateSource {
  id: string;
  name: string;
  sourceType: RateSourceType;
  websiteUrl?: string;
  reliabilityScore: number; // 1 to 5
  notes?: string;
}

export interface MaterialRate {
  id: string;
  materialId: string;
  materialName?: string;
  categoryKey?: string;
  cityId: string;
  cityName?: string;
  brand?: string;
  grade?: string;
  unit: MaterialUnit;
  baseRate: number;
  transportRate: number;
  loadingRate: number;
  unloadingRate: number;
  deliveredRate: number;
  currency: string;
  sourceId: string;
  sourceName: string;
  sourceType: RateSourceType;
  verifiedAt: string;
  expiresAt?: string;
  confidenceScore: ConfidenceScore;
  status: RateStatus;
  trendPercentage?: number; // e.g. +2.5% or -1.1%
  isDemoSample?: boolean;
}

export type LabourPricingType = "per_day" | "per_sqft" | "per_job" | "per_cft";

export interface LabourRate {
  id: string;
  role: string;
  roleUrdu?: string;
  cityId: string;
  cityName?: string;
  skillLevel: "skilled" | "semi_skilled" | "helper" | "supervisor";
  pricingType: LabourPricingType;
  rate: number;
  currency: string;
  sourceName: string;
  verifiedAt: string;
  notes?: string;
}

export interface RateHistoryPoint {
  id: string;
  materialId: string;
  cityId: string;
  rate: number;
  recordedAt: string;
  changePercentage: number;
}
