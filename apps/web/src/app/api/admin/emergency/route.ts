import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: status, error } = await supabase
      .from("platform_emergency_status")
      .select("*")
      .eq("id", "global_status")
      .single();

    if (error || !status) {
      return NextResponse.json({
        isEmergencyMode: false,
        maintenanceMessage: "BuildCost Connect is operational.",
        registrationsEnabled: true,
        paymentsEnabled: true,
        pdfEnabled: true,
        aiEnabled: true,
        ratesUpdateEnabled: true
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch emergency status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request, "super_admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const supabase = await createServerSupabase();

    const updates = {
      is_emergency_mode: body.isEmergencyMode !== undefined ? Boolean(body.isEmergencyMode) : false,
      maintenance_message: body.maintenanceMessage || "Platform is currently undergoing scheduled maintenance.",
      registrations_enabled: body.registrationsEnabled !== undefined ? Boolean(body.registrationsEnabled) : true,
      payments_enabled: body.paymentsEnabled !== undefined ? Boolean(body.paymentsEnabled) : true,
      pdf_enabled: body.pdfEnabled !== undefined ? Boolean(body.pdfEnabled) : true,
      ai_enabled: body.aiEnabled !== undefined ? Boolean(body.aiEnabled) : true,
      rates_update_enabled: body.ratesUpdateEnabled !== undefined ? Boolean(body.ratesUpdateEnabled) : true,
      updated_by: auth.email,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from("platform_emergency_status")
      .upsert({ id: "global_status", ...updates })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Critical audit entry
    await supabase.from("system_audit_logs").insert({
      admin_email: auth.email,
      action: updates.is_emergency_mode ? "EMERGENCY_MODE_ACTIVATED" : "EMERGENCY_MODE_DEACTIVATED",
      entity_type: "platform_emergency_status",
      entity_id: "global_status",
      new_value: updates,
      reason: body.reason || "Super Admin Panic / Maintenance Mode action"
    });

    return NextResponse.json({ success: true, status: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to toggle emergency mode" }, { status: 500 });
  }
}
