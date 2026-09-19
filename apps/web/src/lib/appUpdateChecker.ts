import { createClient } from "./supabase/client";

export interface UpdateCheckResult {
  hasUpdate: boolean;
  isMandatory: boolean;
  isOta: boolean;
  latestVersion: string;
  latestVersionCode: number;
  minimumVersionCode: number;
  releaseNotes: string;
  downloadUrl: string;
  otaBundleUrl: string;
}

export const CURRENT_CLIENT_INFO = {
  platform: "android",
  version: "3.0.5",
  versionCode: 14
};


export async function checkAppUpdate(
  currentVersionCode: number = CURRENT_CLIENT_INFO.versionCode,
  platform: string = CURRENT_CLIENT_INFO.platform
): Promise<UpdateCheckResult | null> {
  try {
    let data: any = null;

    // 1. If not on local appassets origin, try the local API route
    if (typeof window !== "undefined" && !window.location.hostname.includes("appassets")) {
      try {
        const res = await fetch(`/api/app-update?platform=${platform}&versionCode=${currentVersionCode}`, {
          cache: "no-store"
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch {
        // Fallback to Supabase direct query
      }
    }

    // 2. Direct Supabase query (works across native Android WebView and Web)
    if (!data) {
      const supabase = createClient();
      const { data: dbData, error } = await supabase
        .from("app_releases")
        .select("*")
        .eq("platform", platform)
        .maybeSingle();

      if (!error && dbData) {
        const latestCode = Number(dbData.latest_version_code || 0);
        // Only trigger update if remote is strictly newer than client
        const updateAvailable = currentVersionCode > 0 && latestCode > currentVersionCode;
        data = {
          updateAvailable,
          mandatoryUpdate: false, // Non-blocking
          otaAvailable: Boolean(dbData.ota_available),
          latestVersion: dbData.latest_version,
          latestVersionCode: latestCode,
          minimumVersionCode: Number(dbData.minimum_version_code || latestCode),
          releaseNotes: dbData.release_notes || "",
          downloadUrl: dbData.apk_download_url || "",
          otaBundleUrl: dbData.ota_bundle_url || ""
        };
      }
    }

    if (!data) return null;

    const latestVersionCode = Number(data.latestVersionCode || 0);
    // Guard: remote version must be strictly greater than current client
    const hasUpdate = currentVersionCode > 0 && latestVersionCode > currentVersionCode && Boolean(data.updateAvailable);
    // Non-blocking so users can access dashboard directly without getting stuck
    const isMandatory = false;
    const isOta = Boolean(data.otaAvailable && !isMandatory);

    return {
      hasUpdate,
      isMandatory,
      isOta,
      latestVersion: data.latestVersion || "3.0.5",
      latestVersionCode: latestVersionCode || 14,
      minimumVersionCode: Number(data.minimumVersionCode || 14),
      releaseNotes: data.releaseNotes || "",
      downloadUrl: data.downloadUrl || "",
      otaBundleUrl: data.otaBundleUrl || ""
    };
  } catch (err) {
    console.warn("Failed to check app update:", err);
    return null;
  }
}
