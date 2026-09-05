export type FeatureKey = "vendor_management" | "purchase_orders" | "bill_upload" | "material_photos" | "inventory_tracking" | "site_diary" | "budget_variance" | "advanced_boq" | "secure_share" | "custom_material_rates" | "price_scenario_simulator" | "unlimited_projects" | "professional_pdf" | "priority_support";
export interface PlanLimits {
    maxProjects: number;
    maxSavedEstimates: number;
    maxVendors: number;
    maxStorageMb: number;
}
export declare const PLAN_LIMITS: Record<"free" | "pro" | "business", PlanLimits>;
export declare const PLAN_FEATURE_MATRIX: Record<"free" | "pro" | "business", Record<FeatureKey, boolean>>;
/**
 * Centralized Feature Gating check (Section 51)
 * Used across Web, future Android, and Chrome Extension
 */
export declare function canUseFeature(userTier: string | undefined | null, feature: FeatureKey): boolean;
/**
 * Check if the user is within their plan's numeric limits
 */
export declare function isWithinPlanLimit(userTier: string | undefined | null, limitKey: keyof PlanLimits, currentCount: number): boolean;
/**
 * System Feature Flags (Section 78)
 * Configurable toggles for platform feature rollout across Web, Android, and Extension.
 */
export type SystemFeatureFlag = "grey_structure_v2" | "advanced_labour" | "vendor_management" | "house_layouts" | "ai_advisor" | "pro_reports" | "whatsapp_sharing" | "price_simulator";
export declare const DEFAULT_FEATURE_FLAGS: Record<SystemFeatureFlag, boolean>;
