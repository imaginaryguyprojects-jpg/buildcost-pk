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
    latestVersion: "2.1.0",
    latestVersionCode: 6,
    minimumVersionCode: 5,
    mandatoryUpdate: false,
    otaAvailable: true,
    otaBundleUrl: "https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v2.1.0/buildcost-ota-latest.zip",
    otaChannel: "production",
    apkDownloadUrl: "https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v2.1.0/BuildCost-PK-v2.1.0-offline.apk",
    releaseNotes: "⚡ BuildCost Connect v2.1.0 Major Update:\n• Remote Site Photo Timeline with Live GPS Coordinates & Timestamp Watermark for Overseas Pakistanis\n• 1-Click WhatsApp Material Order Slips with Pakistani Vendor Presets (Cement, 60-Grade Sariya, Sand, Bajri, Bricks)\n• AI Construction Advisor & Fraud Prevention Chatbot (60-Grade Sariya verification, Cement fresh checks, Pre-slab checklists)\n• Voice Note Site Diary with Urdu / Roman Urdu mic dictation & auto-parsing\n• Background OTA live auto-update.",
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
