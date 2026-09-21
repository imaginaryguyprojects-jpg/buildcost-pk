import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const platform = body.platform || "web";
    const plan = body.plan || "free";
    const city = body.city || "Islamabad";
    const userId = body.userId || null;
    const guestId = body.guestId || null;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.from("active_sessions").insert({
        user_id: userId,
        guest_id: guestId,
        platform,
        plan,
        city,
        ip_address: ip,
        user_agent: userAgent,
        last_active_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      acknowledgedAt: new Date().toISOString(),
      platform,
      clientStatus: "active"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
