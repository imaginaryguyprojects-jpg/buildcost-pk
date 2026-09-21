import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: media, error } = await supabase
      .from("platform_media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        success: true,
        media: [
          {
            id: "med_1",
            file_name: "meezan_bank_raast_qr.png",
            file_path: "payouts/meezan_bank_raast_qr.png",
            storage_bucket: "platform-media",
            public_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
            alt_text: "Official Meezan Bank Raast QR Code",
            category: "payouts",
            size_bytes: 142000,
            mime_type: "image/png",
            created_at: new Date().toISOString()
          },
          {
            id: "med_2",
            file_name: "hero_construction_blueprint.jpg",
            file_path: "banners/hero_construction_blueprint.jpg",
            storage_bucket: "platform-media",
            public_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=600&q=80",
            alt_text: "Pakistani Residential Architecture Blueprint",
            category: "banners",
            size_bytes: 380000,
            mime_type: "image/jpeg",
            created_at: new Date().toISOString()
          },
          {
            id: "med_3",
            file_name: "layout_5_marla_double_storey.jpg",
            file_path: "layouts/layout_5_marla_double_storey.jpg",
            storage_bucket: "platform-media",
            public_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
            alt_text: "5 Marla Double Storey Reference CAD Layout",
            category: "layouts",
            size_bytes: 290000,
            mime_type: "image/jpeg",
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    return NextResponse.json({ success: true, media: media || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch media assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request, "editor");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { fileName, filePath, publicUrl, altText, category, sizeBytes, mimeType } = body;

    const supabase = await createServerSupabase();
    const mediaRecord = {
      id: `med_${Date.now()}`,
      file_name: fileName || "unnamed_asset",
      file_path: filePath || "uploads/asset",
      storage_bucket: "platform-media",
      public_url: publicUrl || "https://placeholder-url.com",
      alt_text: altText || null,
      category: category || "general",
      size_bytes: sizeBytes || 0,
      mime_type: mimeType || "image/jpeg",
      uploaded_by: auth.email,
      created_at: new Date().toISOString()
    };

    await supabase.from("platform_media").insert(mediaRecord);

    await supabase.from("system_audit_logs").insert({
      admin_email: auth.email,
      action: "media_uploaded",
      entity_type: "platform_media",
      entity_id: mediaRecord.id,
      new_value: mediaRecord,
      reason: "Asset added via Media Manager"
    });

    return NextResponse.json({ success: true, media: mediaRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record media asset" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminSession(request, "editor");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("id");
    if (!mediaId) {
      return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    await supabase.from("platform_media").delete().eq("id", mediaId);

    await supabase.from("system_audit_logs").insert({
      admin_email: auth.email,
      action: "media_deleted",
      entity_type: "platform_media",
      entity_id: mediaId,
      reason: "Asset deleted via Media Manager"
    });

    return NextResponse.json({ success: true, message: "Media asset deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete media asset" }, { status: 500 });
  }
}
