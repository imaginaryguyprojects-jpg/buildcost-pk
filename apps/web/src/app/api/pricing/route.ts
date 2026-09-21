import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SubscriptionPlan } from "@buildcost/config";

import { fallbackSubscriptionPlans } from "@/lib/pricingState";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly_pkr", { ascending: true });

      if (!error && data && data.length > 0) {
        const plans: SubscriptionPlan[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || item.tier,
          tier: item.tier,
          description: item.description || (item.tier === "pro" ? "Full engineering suite & live rates" : "Free essential estimators"),
          price: Number(item.price ?? item.price_monthly_pkr ?? 0),
          priceMonthlyPkr: Number(item.price_monthly_pkr ?? item.price ?? 0),
          priceAnnualPkr: Number(item.price_annual_pkr ?? (item.price_monthly_pkr ? item.price_monthly_pkr * 10 : 0)),
          currency: item.currency || "PKR",
          billingPeriod: item.billing_period || "monthly",
          maxProjects: item.max_projects || (item.tier === "pro" ? 100 : 3),
          maxSavedEstimates: item.max_saved_estimates || 5,
          maxVendors: item.max_vendors || 5,
          maxStorageMb: item.max_storage_mb || 25,
          features: typeof item.features === "object" ? item.features : {},
          isActive: item.is_active ?? true,
          updatedAt: item.updated_at || new Date().toISOString()
        }));

        return NextResponse.json({
          success: true,
          plans,
          source: "database",
          updatedAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      success: true,
      plans: fallbackSubscriptionPlans,
      source: "fallback",
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Error fetching subscription plans:", err);
    return NextResponse.json({
      success: true,
      plans: fallbackSubscriptionPlans,
      source: "fallback_error",
      error: err.message
    });
  }
}
