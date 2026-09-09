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
      return NextResponse.json({ error: "Project duplication is a PRO feature", upgradeRequired: true }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const supabase = await createServerSupabase();
    const user = proCheck.user;

    const { data: original, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !original) {
      return NextResponse.json({ error: "Original project not found" }, { status: 404 });
    }

    if (user && original.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to project" }, { status: 403 });
    }

    const newProjectId = "proj_" + Date.now();
    const newName = body.newName || (original.project_name + " - Copy");

    // Copy structural & engineering specs, omitting actual expense/slip history (Section 8)
    const clonedRecord = {
      ...original,
      id: newProjectId,
      project_name: newName,
      reference_number: "BC-" + Date.now().toString().slice(-6),
      status: "planning",
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (user) {
      await supabase.from("projects").insert(clonedRecord);
      await supabase.from("project_audit_logs").insert({
        project_id: newProjectId,
        user_id: user.id,
        action: "project_duplicated",
        metadata: { sourceProjectId: id, newName },
      });
    }

    return NextResponse.json({ success: true, project: clonedRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to duplicate project" }, { status: 500 });
  }
}
