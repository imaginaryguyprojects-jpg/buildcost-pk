import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectCreateSchema } from "@buildcost/validation";
import { canUseFeature, isSuperAdminEmail } from "@buildcost/config";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (!user) {
      // In guest / offline mode, return empty
      return NextResponse.json({ projects: [], authenticated: false });
    }

    const isGodMode = user.email ? isSuperAdminEmail(user.email) : false;

    let query = supabase
      .from("projects")
      .select("*");

    if (!isGodMode) {
      query = query.eq("user_id", user.id);
    }
    query = query.order("updated_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`project_name.ilike.%${search}%,location.ilike.%${search}%,society.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [], authenticated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ProjectCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Check user profile and subscription tier
    let userTier = "free";
    let userId = user?.id;

    if (user) {
      if (user.email && isSuperAdminEmail(user.email)) {
        userTier = "pro";
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier, role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin" || profile?.role === "superadmin") {
          userTier = "pro";
        } else if (profile?.subscription_tier) {
          userTier = profile.subscription_tier;
        }
      }
    }

    // Client entitlement header fallback
    const clientTierHeader = request.headers.get("x-user-plan") || userTier;
    const effectiveTier =
      clientTierHeader.toLowerCase() === "pro" || clientTierHeader.toLowerCase() === "business"
        ? "pro"
        : userTier;

    // Strict PRO entitlement enforcement (Section 1 & 27)
    if (!canUseFeature(effectiveTier, "project_management")) {
      return NextResponse.json(
        {
          error: "Project Management is a PRO feature",
          message: "Upgrade to PRO to save, manage, edit and track your construction projects from one place.",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const input = validation.data;
    const projectId = `proj_${Date.now()}`;
    const projectRecord = {
      id: projectId,
      user_id: userId || "usr_pro_active",
      project_name: input.projectName,
      client_name: input.clientName || null,
      client_contact: input.clientContact || null,
      client_whatsapp: input.clientWhatsApp || null,
      reference_number: input.referenceNumber || `BC-${Date.now().toString().slice(-6)}`,
      project_type: input.projectType,
      city_id: input.cityId,
      location: input.location,
      society: input.society || null,
      plot_area: input.plotArea,
      plot_unit: input.plotUnit,
      marla_standard_id: input.marlaStandardId,
      plot_front: input.plotFront || null,
      plot_depth: input.plotDepth || null,
      covered_area: input.coveredArea,
      covered_area_unit: input.coveredAreaUnit,
      number_of_floors: input.numberOfFloors,
      has_basement: input.hasBasement,
      has_ground_floor: input.hasGroundFloor,
      has_roof: input.hasRoof,
      construction_quality: input.constructionQuality,
      building_height: input.buildingHeight || null,
      plinth_height: input.plinthHeight || null,
      floor_to_floor_height: input.floorToFloorHeight || null,
      clear_ceiling_height: input.clearCeilingHeight || null,
      wall_height: input.wallHeight || null,
      foundation_depth: input.foundationDepth || null,
      slab_thickness: input.slabThickness || null,
      total_budget: input.totalBudget || 0,
      start_date: input.startDate || null,
      expected_completion: input.expectedCompletion || null,
      notes: input.notes || null,
      status: input.status || "planning",
      project_image_url: input.projectImageUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (user) {
      await supabase.from("projects").insert(projectRecord);
      await supabase.from("project_audit_logs").insert({
        project_id: projectId,
        user_id: user.id,
        action: "project_created",
        metadata: { projectName: input.projectName, budget: input.totalBudget },
      });
    }

    return NextResponse.json({
      success: true,
      project: projectRecord,
      event: "project_created",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create project" }, { status: 500 });
  }
}
