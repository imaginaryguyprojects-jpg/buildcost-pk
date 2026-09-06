"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FEATURE_FLAGS = exports.PLAN_FEATURE_MATRIX = exports.PLAN_LIMITS = void 0;
exports.canUseFeature = canUseFeature;
exports.isWithinPlanLimit = isWithinPlanLimit;
exports.PLAN_LIMITS = {
    free: {
        maxProjects: 2,
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
exports.PLAN_FEATURE_MATRIX = {
    free: {
        project_management: false,
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
        priority_support: false,
        material_price_alerts: false,
        transport_calculator: false,
        cash_flow_planner: false,
        ai_construction_advisor: false,
        floor_plan_analysis: false,
        estimate_vs_actual: false,
        workforce_simulator: false,
        society_rules: false
    },
    pro: {
        project_management: true,
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
        priority_support: true,
        material_price_alerts: true,
        transport_calculator: true,
        cash_flow_planner: true,
        ai_construction_advisor: true,
        floor_plan_analysis: true,
        estimate_vs_actual: true,
        workforce_simulator: true,
        society_rules: true
    },
    business: {
        project_management: true,
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
        priority_support: true,
        material_price_alerts: true,
        transport_calculator: true,
        cash_flow_planner: true,
        ai_construction_advisor: true,
        floor_plan_analysis: true,
        estimate_vs_actual: true,
        workforce_simulator: true,
        society_rules: true
    }
};
/**
 * Centralized Feature Gating check (Section 51)
 * Used across Web, future Android, and Chrome Extension
 */
function canUseFeature(userTier, feature) {
    const normalizedTier = (userTier?.toLowerCase() || "free");
    const tierFeatures = exports.PLAN_FEATURE_MATRIX[normalizedTier] || exports.PLAN_FEATURE_MATRIX.free;
    return tierFeatures[feature] ?? false;
}
/**
 * Check if the user is within their plan's numeric limits
 */
function isWithinPlanLimit(userTier, limitKey, currentCount) {
    const normalizedTier = (userTier?.toLowerCase() || "free");
    const limits = exports.PLAN_LIMITS[normalizedTier] || exports.PLAN_LIMITS.free;
    return currentCount < limits[limitKey];
}
exports.DEFAULT_FEATURE_FLAGS = {
    grey_structure_v2: true,
    advanced_labour: true,
    vendor_management: true,
    house_layouts: true,
    ai_advisor: true,
    pro_reports: true,
    whatsapp_sharing: true,
    price_simulator: true
};
