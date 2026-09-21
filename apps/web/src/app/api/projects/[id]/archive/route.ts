import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { verifyUserProAccess } from "@/lib/auth/subscriptionGuard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proCheck = await verifyUserProAccess(request);
    if (!proCheck.authorized || !proCheck.isPro) {
      return NextResponse.json({ error: "Project archiving is a PRO feature", upgradeRequired: true }, { status: 403 });
    }

    const supabase = await createServerSupabase();
    const user = proCheck.user;

    if (user) {
      await supabase
        .from("projects")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

      await supabase.from("project_audit_logs").insert({
        project_id: id,
        user_id: user.id,
        action: "project_archived",
        metadata: { archivedAt: new Date().toISOString() },
      });
    }

    return NextResponse.json({ success: true, message: "Project archived successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to archive project" }, { status: 500 });
  }
}
