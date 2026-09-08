import { SubscriptionPlan } from "@buildcost/config";

// Global in-memory cache for subscription plans
export const fallbackSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_free",
    name: "BuildCost Free",
    slug: "free",
    tier: "free",
    description: "Essential cost calculators and standard estimates for Pakistani homeowners",
    price: 0,
    priceMonthlyPkr: 0,
    priceAnnualPkr: 0,
    currency: "PKR",
    billingPeriod: "monthly",
    maxProjects: 3,
    maxSavedEstimates: 5,
    maxVendors: 5,
    maxStorageMb: 25,
    features: {
      advanced_calculators: false,
      custom_material_rates: false,
      vendor_management: false,
      purchase_orders: false,
      bill_upload: false,
      inventory_tracking: false,
      site_diary: false,
      budget_variance: false,
      price_scenario_simulator: false,
      secure_share_links: false,
      unlimited_projects: false,
      priority_support: false
    },
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: "plan_pro",
    name: "BuildCost Pro",
    slug: "pro",
    tier: "pro",
    description: "Full engineering suite, unlimited projects, contractor BOQs, and live market rates",
    price: 200,
    priceMonthlyPkr: 200,
    priceAnnualPkr: 500,
    currency: "PKR",
    billingPeriod: "monthly",
    maxProjects: 100,
    maxSavedEstimates: 500,
    maxVendors: 200,
    maxStorageMb: 2000,
    features: {
      advanced_calculators: true,
      custom_material_rates: true,
      vendor_management: true,
      purchase_orders: true,
      bill_upload: true,
      inventory_tracking: true,
      site_diary: true,
      budget_variance: true,
      price_scenario_simulator: true,
      secure_share_links: true,
      unlimited_projects: true,
      priority_support: true
    },
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

export function updateFallbackPlan(planId: string, updates: Partial<SubscriptionPlan>): SubscriptionPlan {
  const idx = fallbackSubscriptionPlans.findIndex((p) => p.id === planId);
  if (idx !== -1) {
    fallbackSubscriptionPlans[idx] = {
      ...fallbackSubscriptionPlans[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return fallbackSubscriptionPlans[idx];
  }
  return fallbackSubscriptionPlans[1];
}
