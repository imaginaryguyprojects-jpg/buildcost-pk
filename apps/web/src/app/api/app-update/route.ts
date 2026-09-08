import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fallbackAppReleases, AppReleaseConfig } from "@/lib/appUpdateState";

/**
 * BuildCost Connect — Cross-Platform App Update & OTA Metadata Endpoint
 * 
 * Provides dynamic release metadata for Android APK, Web, and Mobile OTA:
 * - Compares client versionCode against latestVersionCode and minimumVersionCode
 * - Determines mandatory update enforcement (critical native patches)
 * - Returns OTA bundle URL and channel for instant in-app JS updates
 * - Provides verified release notes and signed APK download URL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientPlatform = (searchParams.get("platform") || "android").toLowerCase();
  const currentVersionCode = parseInt(searchParams.get("versionCode") || "0", 10);

  let releaseConfig: AppReleaseConfig = fallbackAppReleases[clientPlatform] || fallbackAppReleases.android;
  let source = "fallback";

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("app_releases")
        .select("*")
        .eq("platform", clientPlatform)
        .single();

      if (!error && data) {
        releaseConfig = {
          platform: data.platform,
          latestVersion: data.latest_version,
          latestVersionCode: Number(data.latest_version_code),
          minimumVersionCode: Number(data.minimum_version_code),
          mandatoryUpdate: Boolean(data.mandatory_update),
          otaAvailable: Boolean(data.ota_available),
          otaBundleUrl: data.ota_bundle_url || "",
          otaChannel: data.ota_channel || "production",
          apkDownloadUrl: data.apk_download_url || "",
          releaseNotes: data.release_notes || "",
          updatedAt: data.updated_at || new Date().toISOString()
        };
        source = "database";
      }
    }
  } catch (err: any) {
    console.error("Error fetching app release from database:", err?.message);
  }

  // Calculate update requirement flags
  const updateAvailable = currentVersionCode > 0 && currentVersionCode < releaseConfig.latestVersionCode;
  const isMandatory = releaseConfig.mandatoryUpdate || (currentVersionCode > 0 && currentVersionCode < releaseConfig.minimumVersionCode);

  const payload = {
    platform: releaseConfig.platform,
    latestVersion: releaseConfig.latestVersion,
    latestVersionCode: releaseConfig.latestVersionCode,
    minimumVersionCode: releaseConfig.minimumVersionCode,
    updateAvailable,
    mandatoryUpdate: isMandatory,
    otaAvailable: releaseConfig.otaAvailable,
    otaBundleUrl: releaseConfig.otaBundleUrl,
    otaChannel: releaseConfig.otaChannel,
    downloadUrl: releaseConfig.apkDownloadUrl,
    releaseNotes: releaseConfig.releaseNotes,
    releaseDate: releaseConfig.updatedAt,
    source,
    serverTimestamp: new Date().toISOString()
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
    }
  });
}
