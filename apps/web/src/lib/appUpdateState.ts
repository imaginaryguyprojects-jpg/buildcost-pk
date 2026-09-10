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
    latestVersion: "2.0.0",
    latestVersionCode: 5,
    minimumVersionCode: 5,
    mandatoryUpdate: false,
    otaAvailable: false,
    otaBundleUrl: "",
    otaChannel: "production",
    apkDownloadUrl: "https://buildcostconnect.pk/releases/BuildCost-PK-v2.0.0-offline.apk",
    releaseNotes: "BuildCost Connect v2.0.0 Offline-First Edition: Bundled civil engineering estimators, offline cached PBS material rates, BOQ generator, and local sync queue.",
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
