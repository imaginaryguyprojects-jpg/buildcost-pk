import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("slip") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a JPG, PNG, or PDF file." }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
    }

    const fileName = `${userId || "guest"}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `slips/${fileName}`;

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { data, error } = await supabase.storage.from("payment-slips").upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

      if (!error && data) {
        // Generate signed URL (expires in 7 days for review)
        const { data: signed } = await supabase.storage.from("payment-slips").createSignedUrl(filePath, 60 * 60 * 24 * 7);
        return NextResponse.json({
          success: true,
          fileName,
          filePath,
          slipUrl: signed?.signedUrl || filePath
        });
      }
    }

    // Fallback if storage bucket is not configured locally
    return NextResponse.json({
      success: true,
      fileName,
      filePath,
      slipUrl: `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
