/**
 * Property Calculator 2.0 - Material Rate Precedence Engine
 *
 * Strict Hierarchy:
 * 1. Project Custom Rate (highest priority)
 * 2. Selected Vendor Rate
 * 3. City Verified Rate
 * 4. Global Default Rate (baseline fallback)
 */

export type RatePrecedenceSource =
  | "project_custom"
  | "vendor"
  | "city_verified"
  | "global_default";

export interface ResolvedRate {
  materialKey: string;
  unitRate: number;
  source: RatePrecedenceSource;
  sourceDescription: string;
  sourceId?: string;
  cityId?: string;
  vendorId?: string;
  verifiedAt?: string;
}

export interface VendorMaterialRateInput {
  materialKey: string;
  vendorId: string;
  vendorName?: string;
  unitPrice: number;
}

export interface CityVerifiedRateInput {
  materialKey: string;
  cityId: string;
  deliveredRate: number;
  cityName?: string;
  verifiedAt?: string;
}

export interface RateResolverParams {
  materialKey: string;
  cityId?: string;
  selectedVendorId?: string;
  projectCustomRates?: Record<string, number>;
  vendorRates?: VendorMaterialRateInput[];
  cityVerifiedRates?: CityVerifiedRateInput[];
  globalDefaultRates?: Record<string, number>;
}

/**
 * Resolves a single material unit rate according to Pakistan market precedence rules.
 */
export function resolveMaterialRate(params: RateResolverParams): ResolvedRate {
  const {
    materialKey,
    cityId,
    selectedVendorId,
    projectCustomRates,
    vendorRates,
    cityVerifiedRates,
    globalDefaultRates
  } = params;

  // 1. PROJECT CUSTOM RATE
  if (projectCustomRates && typeof projectCustomRates[materialKey] === "number" && projectCustomRates[materialKey] > 0) {
    return {
      materialKey,
      unitRate: projectCustomRates[materialKey],
      source: "project_custom",
      sourceDescription: "Project Custom Override Rate"
    };
  }

  // 2. SELECTED VENDOR RATE
  if (selectedVendorId && vendorRates && vendorRates.length > 0) {
    const matchedVendor = vendorRates.find(
      (v) => (v.materialKey === materialKey || v.materialKey.toLowerCase() === materialKey.toLowerCase()) &&
             v.vendorId === selectedVendorId &&
             v.unitPrice > 0
    );
    if (matchedVendor) {
      return {
        materialKey,
        unitRate: matchedVendor.unitPrice,
        source: "vendor",
        sourceDescription: matchedVendor.vendorName
          ? `Vendor Rate (${matchedVendor.vendorName})`
          : "Selected Vendor Quotation Rate",
        vendorId: matchedVendor.vendorId
      };
    }
  }

  // 3. CITY VERIFIED RATE
  if (cityId && cityVerifiedRates && cityVerifiedRates.length > 0) {
    const matchedCity = cityVerifiedRates.find(
      (c) => (c.materialKey === materialKey || c.materialKey.toLowerCase() === materialKey.toLowerCase()) &&
             c.cityId === cityId &&
             c.deliveredRate > 0
    );
    if (matchedCity) {
      return {
        materialKey,
        unitRate: matchedCity.deliveredRate,
        source: "city_verified",
        sourceDescription: matchedCity.cityName
          ? `Verified Market Rate (${matchedCity.cityName})`
          : `Verified Rate for ${cityId.toUpperCase()}`,
        cityId: matchedCity.cityId,
        verifiedAt: matchedCity.verifiedAt
      };
    }
  }

  // 4. GLOBAL DEFAULT RATE
  if (globalDefaultRates && typeof globalDefaultRates[materialKey] === "number" && globalDefaultRates[materialKey] > 0) {
    return {
      materialKey,
      unitRate: globalDefaultRates[materialKey],
      source: "global_default",
      sourceDescription: "National Baseline Default Rate"
    };
  }

  // Default fallback if rate not found
  return {
    materialKey,
    unitRate: 0,
    source: "global_default",
    sourceDescription: "No Rate Found (Default 0)"
  };
}

/**
 * Resolves a collection of material keys in batch
 */
export function resolveAllMaterialRates(
  materialKeys: string[],
  context: Omit<RateResolverParams, "materialKey">
): Record<string, ResolvedRate> {
  const result: Record<string, ResolvedRate> = {};
  for (const key of materialKeys) {
    result[key] = resolveMaterialRate({
      materialKey: key,
      ...context
    });
  }
  return result;
}
