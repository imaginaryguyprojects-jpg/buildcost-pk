const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// 1. /api/projects/[id]/route.ts
ensureDir('apps/web/src/app/api/projects/[id]');
fs.writeFileSync('apps/web/src/app/api/projects/[id]/route.ts', import { NextRequest, NextResponse } from next/server;
import { createServerSupabase } from @/lib/supabase/server;
import { ProjectUpdateSchema } from @buildcost/validation;
import { canUseFeature } from @buildcost/config;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: project, error } = await supabase
      .from(projects)
      .select(*, project_audit_logs(*), project_estimate_versions(*))
      .eq(id, id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: Project not found }, { status: 404 });
    }

    if (user && project.user_id !== user.id) {
      return NextResponse.json({ error: Unauthorized access }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to fetch project }, { status: 500 });
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
        { error: Validation failed, details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get(x-user-plan) || pro;
    if (!canUseFeature(clientTierHeader, project_management)) {
      return NextResponse.json({ error: Project editing is a PRO feature, upgradeRequired: true }, { status: 403 });
    }

    const updates = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    if (user) {
      const { error } = await supabase
        .from(projects)
        .update(updates)
        .eq(id, id)
        .eq(user_id, user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from(project_audit_logs).insert({
        project_id: id,
        user_id: user.id,
        action: updates.totalBudget ? budget_changed : project_edited,
        metadata: { updatedFields: Object.keys(updates) },
      });
    }

    return NextResponse.json({ success: true, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to update project }, { status: 500 });
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

    const clientTierHeader = request.headers.get(x-user-plan) || pro;
    if (!canUseFeature(clientTierHeader, project_management)) {
      return NextResponse.json({ error: Project deletion is a PRO feature, upgradeRequired: true }, { status: 403 });
    }

    if (user) {
      const { data: project } = await supabase
        .from(projects)
        .select(id, user_id)
        .eq(id, id)
        .single();

      if (!project || project.user_id !== user.id) {
        return NextResponse.json({ error: Unauthorized or project not found }, { status: 403 });
      }

      await supabase.from(project_audit_logs).insert({
        project_id: id,
        user_id: user.id,
        action: project_deleted,
        metadata: { deletedAt: new Date().toISOString() },
      });

      const { error } = await supabase.from(projects).delete().eq(id, id).eq(user_id, user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: Project permanently deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to delete project }, { status: 500 });
  }
}
);

// 2. /api/projects/[id]/archive/route.ts
ensureDir('apps/web/src/app/api/projects/[id]/archive');
fs.writeFileSync('apps/web/src/app/api/projects/[id]/archive/route.ts', import { NextRequest, NextResponse } from next/server;
import { createServerSupabase } from @/lib/supabase/server;
import { canUseFeature } from @buildcost/config;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get(x-user-plan) || pro;
    if (!canUseFeature(clientTierHeader, project_management)) {
      return NextResponse.json({ error: Project archiving is a PRO feature, upgradeRequired: true }, { status: 403 });
    }

    if (user) {
      await supabase
        .from(projects)
        .update({
          status: archived,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq(id, id)
        .eq(user_id, user.id);

      await supabase.from(project_audit_logs).insert({
        project_id: id,
        user_id: user.id,
        action: project_archived,
        metadata: { archivedAt: new Date().toISOString() },
      });
    }

    return NextResponse.json({ success: true, message: Project archived successfully });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to archive project }, { status: 500 });
  }
}
);

// 3. /api/projects/[id]/restore/route.ts
ensureDir('apps/web/src/app/api/projects/[id]/restore');
fs.writeFileSync('apps/web/src/app/api/projects/[id]/restore/route.ts', import { NextRequest, NextResponse } from next/server;
import { createServerSupabase } from @/lib/supabase/server;
import { canUseFeature } from @buildcost/config;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get(x-user-plan) || pro;
    if (!canUseFeature(clientTierHeader, project_management)) {
      return NextResponse.json({ error: Project restoration is a PRO feature, upgradeRequired: true }, { status: 403 });
    }

    if (user) {
      await supabase
        .from(projects)
        .update({
          status: active,
          archived_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq(id, id)
        .eq(user_id, user.id);

      await supabase.from(project_audit_logs).insert({
        project_id: id,
        user_id: user.id,
        action: project_restored,
        metadata: { restoredAt: new Date().toISOString() },
      });
    }

    return NextResponse.json({ success: true, message: Project restored to active state });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to restore project }, { status: 500 });
  }
}
);

// 4. /api/projects/[id]/duplicate/route.ts
ensureDir('apps/web/src/app/api/projects/[id]/duplicate');
fs.writeFileSync('apps/web/src/app/api/projects/[id]/duplicate/route.ts', import { NextRequest, NextResponse } from next/server;
import { createServerSupabase } from @/lib/supabase/server;
import { canUseFeature } from @buildcost/config;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const clientTierHeader = request.headers.get(x-user-plan) || pro;
    if (!canUseFeature(clientTierHeader, project_management)) {
      return NextResponse.json({ error: Project duplication is a PRO feature, upgradeRequired: true }, { status: 403 });
    }

    const { data: original, error } = await supabase
      .from(projects)
      .select(*)
      .eq(id, id)
      .single();

    if (error || !original) {
      return NextResponse.json({ error: Original project not found }, { status: 404 });
    }

    if (user && original.user_id !== user.id) {
      return NextResponse.json({ error: Unauthorized access to project }, { status: 403 });
    }

    const newProjectId = proj_ + Date.now();
    const newName = body.newName || (original.project_name +  - Copy);

    const clonedRecord = {
      ...original,
      id: newProjectId,
      project_name: newName,
      reference_number: BC- + Date.now().toString().slice(-6),
      status: planning,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (user) {
      await supabase.from(projects).insert(clonedRecord);
      await supabase.from(project_audit_logs).insert({
        project_id: newProjectId,
        user_id: user.id,
        action: project_duplicated,
        metadata: { sourceProjectId: id, newName },
      });
    }

    return NextResponse.json({ success: true, project: clonedRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || Failed to duplicate project }, { status: 500 });
  }
}
);
console.log('API routes created successfully');
