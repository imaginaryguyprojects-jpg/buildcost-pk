import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { canUseFeature } from "@buildcost/config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get("x-user-plan") || "pro";
    if (!canUseFeature(clientTierHeader, "project_management")) {
      return NextResponse.json({ error: "Project restoration is a PRO feature", upgradeRequired: true }, { status: 403 });
    }

    if (user) {
      await supabase
        .from("projects")
        .update({
          status: "active",
          archived_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

      await supabase.from("project_audit_logs").insert({
        project_id: id,
        user_id: user.id,
        action: "project_restored",
        metadata: { restoredAt: new Date().toISOString() },
      });
    }

    return NextResponse.json({ success: true, message: "Project restored to active state" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore project" }, { status: 500 });
  }
}
