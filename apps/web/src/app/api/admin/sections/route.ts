import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: sections, error } = await supabase
      .from("platform_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ sections: [], source: "fallback" });
    }

    return NextResponse.json({ success: true, sections: sections || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch sections" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { key, isEnabled, planRequired, displayOrder, title, description, navVisibility } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing section key" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const updates: any = {
      updated_at: new Date().toISOString(),
      updated_by: auth.email
    };
    if (isEnabled !== undefined) updates.is_enabled = Boolean(isEnabled);
    if (planRequired !== undefined) updates.plan_required = planRequired;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (navVisibility !== undefined) updates.nav_visibility = navVisibility;

    const { data: updated, error } = await supabase
      .from("platform_sections")
      .update(updates)
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, section: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update section" }, { status: 500 });
  }
}
