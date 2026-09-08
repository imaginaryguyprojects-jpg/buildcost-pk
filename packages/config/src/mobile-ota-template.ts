/**
 * BuildCost Connect — Mobile Over-The-Air (OTA) & Version Control Blueprint
 * 
 * Target: Phase 2 Android APK (Expo SDK 52 / React Native / EAS Updates)
 * 
 * Allows instant UI updates, calculation engine fixes, and layout improvements
 * to be delivered over-the-air to existing APK installs without prompting users
 * to reinstall an APK from scratch.
 */

export const EXPO_APP_CONFIG_TEMPLATE = {
  expo: {
    name: "BuildCost Connect",
    slug: "buildcost-connect",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0b1120"
    },
    updates: {
      url: "https://u.expo.dev/YOUR-EXPO-PROJECT-ID",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 3000
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "pk.buildcostconnect.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0b1120"
      },
      package: "pk.buildcostconnect.app",
      versionCode: 12,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    extra: {
      eas: {
        projectId: "YOUR-EXPO-PROJECT-ID"
      },
      backendApiUrl: "https://buildcostconnect.pk/api"
    }
  }
};

export const EAS_CONFIG_TEMPLATE = {
  cli: {
    version: ">= 14.0.0",
    appVersionSource: "remote"
  },
  build: {
    development: {
      developmentClient: true,
      distribution: "internal",
      channel: "development"
    },
    preview: {
      distribution: "internal",
      channel: "preview"
    },
    production: {
      channel: "production",
      autoIncrement: true,
      android: {
        buildType: "apk"
      }
    }
  },
  submit: {
    production: {}
  }
};

/**
 * Client React Native Hook Blueprint for Zero-Downtime Background OTA Updates
 * 
 * Usage inside Phase 2 Mobile App root (_layout.tsx or App.tsx):
 * 
 * ```tsx
 * import { useEffect } from "react";
 * import * as Updates from "expo-updates";
 * import { Alert } from "react-native";
 * 
 * export function useOTAUpdate() {
 *   useEffect(() => {
 *     async function checkOTA() {
 *       if (__DEV__) return;
 *       try {
 *         const update = await Updates.checkForUpdateAsync();
 *         if (update.isAvailable) {
 *           await Updates.fetchUpdateAsync();
 *           // Silently apply on next launch or alert user
 *           Alert.alert(
 *             "Update Ready",
 *             "A new version of BuildCost Connect has been downloaded. Restart now to apply?",
 *             [
 *               { text: "Later", style: "cancel" },
 *               { text: "Restart", onPress: async () => await Updates.reloadAsync() }
 *             ]
 *           );
 *         }
 *       } catch (error) {
 *         console.log("Error fetching OTA update:", error);
 *       }
 *     }
 *     checkOTA();
 *   }, []);
 * }
 * ```
 */
