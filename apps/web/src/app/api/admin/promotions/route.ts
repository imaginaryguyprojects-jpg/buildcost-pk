import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request, "support");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: promotions } = await supabase.from("platform_promotions").select("*").order("created_at", { ascending: false });

  const defaultPromotions = [
    {
      id: "promo_1",
      name: "Ramadan Kareem Pro Special",
      code: "RAMADAN2026",
      description: "25% discount on annual Pro subscription with priority support",
      start_date: "2026-03-01",
      end_date: "2026-04-15",
      eligible_users: "all_free",
      target_plan: "pro",
      discount_pct: 25,
      trial_days: 0,
      features_unlocked: ["advanced_grey_structure", "advanced_boq", "vendor_management"],
      is_active: true
    },
    {
      id: "promo_2",
      name: "7-Day Pro Contractor Trial",
      code: "TRIAL7DAY",
      description: "Complimentary 7-day access to BOQ Studio and Rate Intelligence",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      eligible_users: "all_free",
      target_plan: "pro",
      discount_pct: 0,
      trial_days: 7,
      features_unlocked: ["advanced_grey_structure", "advanced_boq", "vendor_management", "ai_construction_advisor"],
      is_active: true
    }
  ];

  return NextResponse.json({
    success: true,
    promotions: promotions && promotions.length > 0 ? promotions : defaultPromotions
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { name, code, description, startDate, endDate, eligibleUsers, discountPct, trialDays, featuresUnlocked } = body;

    if (!name || !code || !endDate) {
      return NextResponse.json({ error: "name, code, and endDate are required" }, { status: 400 });
    }

    const newPromo = {
      id: `promo_${Date.now()}`,
      name,
      code: code.toUpperCase().trim(),
      description: description || "",
      start_date: startDate || new Date().toISOString(),
      end_date: endDate,
      eligible_users: eligibleUsers || "all_free",
      target_plan: "pro",
      discount_pct: Number(discountPct) || 0,
      trial_days: Number(trialDays) || 0,
      features_unlocked: featuresUnlocked || ["advanced_grey_structure", "advanced_boq"],
      is_active: true,
      created_by: auth.user?.email || "admin@buildcost.pk"
    };

    const supabase = await createServerSupabaseClient();
    await supabase.from("platform_promotions").insert(newPromo);

    return NextResponse.json({ success: true, promotion: newPromo });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
