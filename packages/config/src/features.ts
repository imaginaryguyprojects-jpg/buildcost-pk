export type FeatureKey =
  | "vendor_management"
  | "purchase_orders"
  | "bill_upload"
  | "material_photos"
  | "inventory_tracking"
  | "site_diary"
  | "budget_variance"
  | "advanced_boq"
  | "secure_share"
  | "custom_material_rates"
  | "price_scenario_simulator"
  | "unlimited_projects"
  | "professional_pdf"
  | "priority_support";

export interface PlanLimits {
  maxProjects: number;
  maxSavedEstimates: number;
  maxVendors: number;
  maxStorageMb: number;
}

export const PLAN_LIMITS: Record<"free" | "pro" | "business", PlanLimits> = {
  free: {
    maxProjects: 3,
    maxSavedEstimates: 5,
    maxVendors: 5,
    maxStorageMb: 25
  },
  pro: {
    maxProjects: 100,
    maxSavedEstimates: 500,
    maxVendors: 200,
    maxStorageMb: 2000
  },
  business: {
    maxProjects: 1000,
    maxSavedEstimates: 5000,
    maxVendors: 2000,
    maxStorageMb: 10000
  }
};

export const PLAN_FEATURE_MATRIX: Record<"free" | "pro" | "business", Record<FeatureKey, boolean>> = {
  free: {
    vendor_management: false,
    purchase_orders: false,
    bill_upload: false,
    material_photos: false,
    inventory_tracking: false,
    site_diary: false,
    budget_variance: false,
    advanced_boq: false,
    secure_share: false,
    custom_material_rates: false,
    price_scenario_simulator: false,
    unlimited_projects: false,
    professional_pdf: false,
    priority_support: false
  },
  pro: {
    vendor_management: true,
    purchase_orders: true,
    bill_upload: true,
    material_photos: true,
    inventory_tracking: true,
    site_diary: true,
    budget_variance: true,
    advanced_boq: true,
    secure_share: true,
    custom_material_rates: true,
    price_scenario_simulator: true,
    unlimited_projects: true,
    professional_pdf: true,
    priority_support: true
  },
  business: {
    vendor_management: true,
    purchase_orders: true,
    bill_upload: true,
    material_photos: true,
    inventory_tracking: true,
    site_diary: true,
    budget_variance: true,
    advanced_boq: true,
    secure_share: true,
    custom_material_rates: true,
    price_scenario_simulator: true,
    unlimited_projects: true,
    professional_pdf: true,
    priority_support: true
  }
};

/**
 * Centralized Feature Gating check (Section 51)
 * Used across Web, future Android, and Chrome Extension
 */
export function canUseFeature(
  userTier: string | undefined | null,
  feature: FeatureKey
): boolean {
  const normalizedTier = (userTier?.toLowerCase() || "free") as "free" | "pro" | "business";
  const tierFeatures = PLAN_FEATURE_MATRIX[normalizedTier] || PLAN_FEATURE_MATRIX.free;
  return tierFeatures[feature] ?? false;
}

/**
 * Check if the user is within their plan's numeric limits
 */
export function isWithinPlanLimit(
  userTier: string | undefined | null,
  limitKey: keyof PlanLimits,
  currentCount: number
): boolean {
  const normalizedTier = (userTier?.toLowerCase() || "free") as "free" | "pro" | "business";
  const limits = PLAN_LIMITS[normalizedTier] || PLAN_LIMITS.free;
  return currentCount < limits[limitKey];
}

/**
 * System Feature Flags (Section 78)
 * Configurable toggles for platform feature rollout across Web, Android, and Extension.
 */
export type SystemFeatureFlag =
  | "grey_structure_v2"
  | "advanced_labour"
  | "vendor_management"
  | "house_layouts"
  | "ai_advisor"
  | "pro_reports"
  | "whatsapp_sharing"
  | "price_simulator";

export const DEFAULT_FEATURE_FLAGS: Record<SystemFeatureFlag, boolean> = {
  grey_structure_v2: true,
  advanced_labour: true,
  vendor_management: true,
  house_layouts: true,
  ai_advisor: true,
  pro_reports: true,
  whatsapp_sharing: true,
  price_simulator: true
};
