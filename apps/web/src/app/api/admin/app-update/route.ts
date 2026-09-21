import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fallbackAppReleases, updateFallbackRelease, AppReleaseConfig } from "@/lib/appUpdateState";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("app_releases")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, releases: data });
      }
    }

    return NextResponse.json({ success: true, releases: Object.values(fallbackAppReleases) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const {
      platform = "android",
      latestVersion,
      latestVersionCode,
      minimumVersionCode,
      mandatoryUpdate = false,
      otaAvailable = true,
      otaBundleUrl,
      otaChannel = "production",
      apkDownloadUrl,
      releaseNotes
    } = body;

    if (!latestVersion || !latestVersionCode) {
      return NextResponse.json({ error: "latestVersion and latestVersionCode are required." }, { status: 400 });
    }

    const updates: Partial<AppReleaseConfig> = {
      latestVersion: String(latestVersion),
      latestVersionCode: Number(latestVersionCode),
      minimumVersionCode: Number(minimumVersionCode ?? latestVersionCode),
      mandatoryUpdate: Boolean(mandatoryUpdate),
      otaAvailable: Boolean(otaAvailable),
      otaBundleUrl: String(otaBundleUrl || ""),
      otaChannel: String(otaChannel || "production"),
      apkDownloadUrl: String(apkDownloadUrl || ""),
      releaseNotes: String(releaseNotes || "")
    };

    // Update fallback memory state immediately
    const updatedRelease = updateFallbackRelease(platform, updates);

    // Persist to Supabase if available
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("app_releases")
        .upsert(
          {
            platform,
            latest_version: updates.latestVersion,
            latest_version_code: updates.latestVersionCode,
            minimum_version_code: updates.minimumVersionCode,
            mandatory_update: updates.mandatoryUpdate,
            ota_available: updates.otaAvailable,
            ota_bundle_url: updates.otaBundleUrl,
            ota_channel: updates.otaChannel,
            apk_download_url: updates.apkDownloadUrl,
            release_notes: updates.releaseNotes,
            updated_at: new Date().toISOString()
          },
          { onConflict: "platform" }
        )
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          message: "App release configuration updated in database",
          release: data
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "App release configuration updated in memory",
      release: updatedRelease
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
