import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: flags, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      // Fallback in case table is not yet migrated in local instance
      return NextResponse.json({ flags: [], source: "fallback" });
    }

    return NextResponse.json({ success: true, flags: flags || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch feature flags" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { key, enabled, planRequired, bulkKeys, bulkAction } = body;

    const supabase = await createServerSupabase();

    // 1. Bulk action support (Section 24)
    if (bulkKeys && Array.isArray(bulkKeys) && bulkAction) {
      const updates: any = { updated_at: new Date().toISOString(), updated_by: auth.email };
      if (bulkAction === "make_free") updates.plan_required = "free";
      if (bulkAction === "make_pro") updates.plan_required = "pro";
      if (bulkAction === "enable") updates.enabled = true;
      if (bulkAction === "disable") updates.enabled = false;

      await supabase
        .from("feature_flags")
        .update(updates)
        .in("key", bulkKeys);

      // Log bulk audit entry
      await supabase.from("system_audit_logs").insert({
        admin_email: auth.email,
        action: `bulk_feature_${bulkAction}`,
        entity_type: "feature_flags",
        entity_id: bulkKeys.join(","),
        new_value: updates,
        reason: `Bulk execution by ${auth.email}`
      });

      return NextResponse.json({ success: true, bulkAction, updatedCount: bulkKeys.length });
    }

    // 2. Single item update
    if (!key) {
      return NextResponse.json({ error: "Missing feature key" }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
      updated_by: auth.email
    };
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (planRequired !== undefined) updates.plan_required = planRequired;

    const { data: updated, error } = await supabase
      .from("feature_flags")
      .update(updates)
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from("system_audit_logs").insert({
      admin_email: auth.email,
      action: "feature_flag_updated",
      entity_type: "feature_flags",
      entity_id: key,
      new_value: updates,
      reason: `Super Admin update via Control Center`
    });

    return NextResponse.json({ success: true, feature: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update feature flag" }, { status: 500 });
  }
}
