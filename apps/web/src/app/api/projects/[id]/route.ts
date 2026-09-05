import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProjectUpdateSchema } from "@buildcost/validation";
import { canUseFeature } from "@buildcost/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: project, error } = await supabase
      .from("projects")
      .select("*, project_audit_logs(*), project_estimate_versions(*)")
      .eq("id", id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user && project.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = ProjectUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get("x-user-plan") || "pro";
    if (!canUseFeature(clientTierHeader, "project_management")) {
      return NextResponse.json({ error: "Project editing is a PRO feature", upgradeRequired: true }, { status: 403 });
    }

    const updates = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    if (user) {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from("project_audit_logs").insert({
        project_id: id,
        user_id: user.id,
        action: updates.totalBudget ? "budget_changed" : "project_edited",
        metadata: { updatedFields: Object.keys(updates) },
      });
    }

    return NextResponse.json({ success: true, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get("x-user-plan") || "pro";
    if (!canUseFeature(clientTierHeader, "project_management")) {
      return NextResponse.json({ error: "Project deletion is a PRO feature", upgradeRequired: true }, { status: 403 });
    }

    if (user) {
      const { data: project } = await supabase
        .from("projects")
        .select("id, user_id")
        .eq("id", id)
        .single();

      if (!project || project.user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized or project not found" }, { status: 403 });
      }

      await supabase.from("project_audit_logs").insert({
        project_id: id,
        user_id: user.id,
        action: "project_deleted",
        metadata: { deletedAt: new Date().toISOString() },
      });

      const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Project permanently deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500 });
  }
}
