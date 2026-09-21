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
    latestVersion: "3.0.8",
    latestVersionCode: 17,
    minimumVersionCode: 17,
    mandatoryUpdate: false,
    otaAvailable: false,
    otaBundleUrl: "",
    otaChannel: "production",
    apkDownloadUrl: "https://github.com/imaginaryguyprojects-jpg/buildcost-pk/releases/download/v3.0.8/BuildCost-PK-v3.0.8-offline.apk",
    releaseNotes: "BuildCost Connect v3.0.8:\n• Modern soft pastel dashboard palette\n• Real-time reactive construction cost & plot calculator\n• Authentic Pakistani plot presets (5 Marla 25×45, 10 Marla 35×65, 1 Kanal 50×90)\n• Dynamic material consumption (Bricks, Steel, Sand, Crush, Cement)\n• Dynamic SVG cost breakdown chart and project completion timeline\n• Offline stability improvements and non-blocking updates",
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
