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
    latestVersion: "3.0.3",
    latestVersionCode: 13,
    minimumVersionCode: 12,
    mandatoryUpdate: false,
    otaAvailable: false,
    otaBundleUrl: "",
    otaChannel: "production",
    apkDownloadUrl: "https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v3.0.3/BuildCost-PK-v3.0.3-offline.apk",
    releaseNotes: "BuildCost.pk v3.0.3:\n• Advanced construction calculation with wall height, foundation, beams, columns, and bathrooms\n• Modern architectural layout plans (Free & Pro tiers)\n• Official Google AdMob monetization for Free users & ad-free Pro experience\n• Official Google Play In-App Updates (Flexible & Immediate)\n• Enhanced offline-first synchronization with real-time rate verification\n• Supabase authentication & security hardening",
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
