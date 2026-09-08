import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateFallbackPlan } from "@/lib/pricingState";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price_monthly_pkr", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, plans });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const {
      planId = "plan_pro",
      price,
      priceAnnual,
      currency = "PKR",
      billingPeriod = "monthly",
      name,
      description,
      maxProjects,
      maxSavedEstimates,
      features,
      isActive = true,
      reason = "Admin modified subscription pricing"
    } = body;

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Invalid price. Price must be a non-negative number." }, { status: 400 });
    }

    const numericAnnualPrice = priceAnnual !== undefined 
      ? Number(priceAnnual) 
      : Math.round(numericPrice * 10); // 2 months discount standard

    // 1. Immediately sync in-memory plan state
    const localPlan = updateFallbackPlan(planId, {
      price: numericPrice,
      priceMonthlyPkr: numericPrice,
      priceAnnualPkr: numericAnnualPrice,
      currency: currency.toUpperCase(),
      billingPeriod,
      name: name || (planId === "plan_pro" ? "BuildCost Pro" : "BuildCost Free"),
      description: description || (planId === "plan_pro" ? "Full engineering suite & live rates" : "Free essential estimators"),
      maxProjects: maxProjects !== undefined ? Number(maxProjects) : undefined,
      maxSavedEstimates: maxSavedEstimates !== undefined ? Number(maxSavedEstimates) : undefined,
      features: features && typeof features === "object" ? features : undefined,
      isActive
    });

    let updatedPlan: any = localPlan;
    let oldPrice = 0;

    // 2. Persist to Supabase Database & Audit Log
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        try {
          const { data: currentRecord } = await supabase
            .from("subscription_plans")
            .select("price, price_monthly_pkr, currency, name")
            .eq("id", planId)
            .single();
          if (currentRecord) {
            oldPrice = Number(currentRecord.price ?? currentRecord.price_monthly_pkr ?? 0);
          }
        } catch {
          // ignore if record not found yet
        }

        const updatePayload: Record<string, any> = {
          id: planId,
          name: name || (planId === "plan_pro" ? "BuildCost Pro" : "BuildCost Free"),
          slug: planId.replace("plan_", ""),
          tier: planId.replace("plan_", ""),
          description: description || (planId === "plan_pro" ? "Full engineering suite & live rates" : "Free essential estimators"),
          price: numericPrice,
          price_monthly_pkr: numericPrice,
          price_annual_pkr: numericAnnualPrice,
          currency: currency.toUpperCase(),
          billing_period: billingPeriod,
          is_active: isActive,
          updated_at: new Date().toISOString()
        };

        if (maxProjects !== undefined) updatePayload.max_projects = Number(maxProjects);
        if (maxSavedEstimates !== undefined) updatePayload.max_saved_estimates = Number(maxSavedEstimates);
        if (features && typeof features === "object") updatePayload.features = features;

        const { data: dbPlan, error: updateError } = await supabase
          .from("subscription_plans")
          .upsert(updatePayload)
          .select()
          .single();

        if (!updateError && dbPlan) {
          updatedPlan = dbPlan;
        }

        // 3. Write immutable admin audit log (Section: Price Change Audit)
        try {
          await supabase.from("system_audit_logs").insert({
            admin_email: auth.user?.email || "super_admin@buildcost.pk",
            action: "SUBSCRIPTION_PLAN_PRICE_UPDATED",
            entity_type: "subscription_plans",
            entity_id: planId,
            new_value: {
              plan_id: planId,
              old_price: oldPrice,
              new_price: numericPrice,
              new_annual_price: numericAnnualPrice,
              currency: currency.toUpperCase(),
              billing_period: billingPeriod,
              reason
            },
            reason: `${reason} (${currency} ${oldPrice} → ${currency} ${numericPrice})`
          });
        } catch (auditErr) {
          console.warn("Could not log to system_audit_logs table:", auditErr);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase sync bypassed (offline / fallback mode active):", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Subscription plan '${planId}' updated successfully to ${currency.toUpperCase()} ${numericPrice}`,
      plan: updatedPlan,
      oldPrice,
      newPrice: numericPrice,
      currency: currency.toUpperCase(),
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
