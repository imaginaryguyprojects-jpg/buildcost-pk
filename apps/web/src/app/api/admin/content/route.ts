import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: content, error } = await supabase
      .from("platform_content")
      .select("*")
      .order("section", { ascending: true });

    if (error) {
      return NextResponse.json({ content: [], source: "fallback" });
    }

    return NextResponse.json({ success: true, content: content || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch content" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminSession(request, "editor");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { key, title, content, isPublished, restoreVersion } = body;

    if (!key) {
      return NextResponse.json({ error: "Missing content key" }, { status: 400 });
    }

    const supabase = await createServerSupabase();

    // Fetch existing version for history
    const { data: existing } = await supabase
      .from("platform_content")
      .select("*")
      .eq("key", key)
      .single();

    if (restoreVersion && existing) {
      // Rollback logic (Section 23)
      const targetVersion = existing.previous_versions?.find((v: any) => v.version === restoreVersion);
      if (!targetVersion) {
        return NextResponse.json({ error: `Version ${restoreVersion} not found` }, { status: 404 });
      }

      const { data: restored, error } = await supabase
        .from("platform_content")
        .update({
          content: targetVersion.content,
          version: (existing.version || 1) + 1,
          updated_at: new Date().toISOString(),
          updated_by: auth.email
        })
        .eq("key", key)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, content: restored, restoredFrom: restoreVersion });
    }

    const previousVersions = existing?.previous_versions || [];
    if (existing && content && content !== existing.content) {
      previousVersions.push({
        version: existing.version || 1,
        content: existing.content,
        updatedBy: existing.updated_by || "system",
        updatedAt: existing.updated_at || new Date().toISOString()
      });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
      updated_by: auth.email,
      previous_versions: previousVersions
    };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) {
      updates.content = content;
      updates.version = (existing?.version || 1) + 1;
    }
    if (isPublished !== undefined) updates.is_published = isPublished;

    const { data: updated, error } = await supabase
      .from("platform_content")
      .update(updates)
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // System audit log
    await supabase.from("system_audit_logs").insert({
      admin_email: auth.email,
      action: "content_updated",
      entity_type: "platform_content",
      entity_id: key,
      old_value: { content: existing?.content },
      new_value: { content: updates.content },
      reason: "CMS update via Control Center"
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update content" }, { status: 500 });
  }
}
