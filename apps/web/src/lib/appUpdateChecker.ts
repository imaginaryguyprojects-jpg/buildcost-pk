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
  version: "2.0.0",
  versionCode: 5
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
        const updateAvailable = currentVersionCode > 0 && currentVersionCode < Number(dbData.latest_version_code);
        const mandatoryUpdate =
          Boolean(dbData.mandatory_update) ||
          (currentVersionCode > 0 && currentVersionCode < Number(dbData.minimum_version_code));
        data = {
          updateAvailable,
          mandatoryUpdate,
          otaAvailable: Boolean(dbData.ota_available),
          latestVersion: dbData.latest_version,
          latestVersionCode: Number(dbData.latest_version_code),
          minimumVersionCode: Number(dbData.minimum_version_code),
          releaseNotes: dbData.release_notes || "",
          downloadUrl: dbData.apk_download_url || "",
          otaBundleUrl: dbData.ota_bundle_url || ""
        };
      }
    }

    if (!data) return null;

    const hasUpdate = Boolean(data.updateAvailable);
    const isMandatory = Boolean(data.mandatoryUpdate);
    const isOta = Boolean(data.otaAvailable && !isMandatory);

    return {
      hasUpdate,
      isMandatory,
      isOta,
      latestVersion: data.latestVersion || "1.3.0",
      latestVersionCode: Number(data.latestVersionCode || 4),
      minimumVersionCode: Number(data.minimumVersionCode || 4),
      releaseNotes: data.releaseNotes || "",
      downloadUrl: data.downloadUrl || "",
      otaBundleUrl: data.otaBundleUrl || ""
    };
  } catch (err) {
    console.warn("Failed to check app update:", err);
    return null;
  }
}
