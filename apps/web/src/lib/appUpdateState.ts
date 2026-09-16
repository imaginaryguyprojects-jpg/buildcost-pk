export interface AppReleaseConfig {
  platform: string;
  latestVersion: string;
  latestVersionCode: number;
  minimumVersionCode: number;
  mandatoryUpdate: boolean;
  otaAvailable: boolean;
  otaBundleUrl: string;
  otaChannel: string;
  apkDownloadUrl: string;
  releaseNotes: string;
  updatedAt: string;
}

export const fallbackAppReleases: Record<string, AppReleaseConfig> = {
  android: {
    platform: "android",
    latestVersion: "3.0.4",
    latestVersionCode: 11,
    minimumVersionCode: 10,
    mandatoryUpdate: false,
    otaAvailable: false,
    otaBundleUrl: "",
    otaChannel: "production",
    apkDownloadUrl: "https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v3.0.4/BuildCost-PK-v3.0.4-offline.apk",
    releaseNotes: "BuildCost PK v3.0.4:\n• Critical fix for UI/CSS rendering and mobile WebView asset delivery\n• High-performance local asset routing with offline-first support\n• Instant splash transition preventing unstyled layout flash\n• Android API 34+ / SDK 36 optimizations",
    updatedAt: new Date().toISOString()
  },

  web: {
    platform: "web",
    latestVersion: "2.0.0",
    latestVersionCode: 20,
    minimumVersionCode: 20,
    mandatoryUpdate: false,
    otaAvailable: false,
    otaBundleUrl: "",
    otaChannel: "production",
    apkDownloadUrl: "https://buildcostconnect.pk",
    releaseNotes: "Property Calculator 2.0 Web Production Release with zero-downtime auto updates.",
    updatedAt: new Date().toISOString()
  }
};

export function updateFallbackRelease(platform: string, updates: Partial<AppReleaseConfig>): AppReleaseConfig {
  const existing = fallbackAppReleases[platform] || fallbackAppReleases.android;
  const updated: AppReleaseConfig = {
    ...existing,
    ...updates,
    platform,
    updatedAt: new Date().toISOString()
  };
  fallbackAppReleases[platform] = updated;
  return updated;
}
