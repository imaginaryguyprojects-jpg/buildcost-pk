import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventName, platform = "web", city = "Islamabad", properties = {}, userId = null, guestId = null } = body;

    if (!eventName) {
      return NextResponse.json({ error: "eventName is required" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.from("analytics_events").insert({
        event_name: eventName,
        platform,
        city,
        properties,
        user_id: userId,
        guest_id: guestId
      });
    }

    return NextResponse.json({ success: true, logged: eventName });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
