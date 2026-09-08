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
  version: "1.0.0",
  versionCode: 10
};

export async function checkAppUpdate(
  currentVersionCode: number = CURRENT_CLIENT_INFO.versionCode,
  platform: string = CURRENT_CLIENT_INFO.platform
): Promise<UpdateCheckResult | null> {
  try {
    const res = await fetch(`/api/app-update?platform=${platform}&versionCode=${currentVersionCode}`, {
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = await res.json();

    const hasUpdate = Boolean(data.updateAvailable);
    const isMandatory = Boolean(data.mandatoryUpdate);
    const isOta = Boolean(data.otaAvailable && !isMandatory);

    return {
      hasUpdate,
      isMandatory,
      isOta,
      latestVersion: data.latestVersion || "1.2.0",
      latestVersionCode: Number(data.latestVersionCode || 12),
      minimumVersionCode: Number(data.minimumVersionCode || 10),
      releaseNotes: data.releaseNotes || "",
      downloadUrl: data.downloadUrl || "",
      otaBundleUrl: data.otaBundleUrl || ""
    };
  } catch (err) {
    console.warn("Failed to check app update:", err);
    return null;
  }
}
