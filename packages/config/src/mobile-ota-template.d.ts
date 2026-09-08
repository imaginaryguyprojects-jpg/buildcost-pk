/**
 * BuildCost Connect — Mobile Over-The-Air (OTA) & Version Control Blueprint
 *
 * Target: Phase 2 Android APK (Expo SDK 52 / React Native / EAS Updates)
 *
 * Allows instant UI updates, calculation engine fixes, and layout improvements
 * to be delivered over-the-air to existing APK installs without prompting users
 * to reinstall an APK from scratch.
 */
export declare const EXPO_APP_CONFIG_TEMPLATE: {
    expo: {
        name: string;
        slug: string;
        version: string;
        orientation: string;
        icon: string;
        userInterfaceStyle: string;
        splash: {
            image: string;
            resizeMode: string;
            backgroundColor: string;
        };
        updates: {
            url: string;
            enabled: boolean;
            checkAutomatically: string;
            fallbackToCacheTimeout: number;
        };
        runtimeVersion: {
            policy: string;
        };
        assetBundlePatterns: string[];
        ios: {
            supportsTablet: boolean;
            bundleIdentifier: string;
        };
        android: {
            adaptiveIcon: {
                foregroundImage: string;
                backgroundColor: string;
            };
            package: string;
            versionCode: number;
            permissions: string[];
        };
        extra: {
            eas: {
                projectId: string;
            };
            backendApiUrl: string;
        };
    };
};
export declare const EAS_CONFIG_TEMPLATE: {
    cli: {
        version: string;
        appVersionSource: string;
    };
    build: {
        development: {
            developmentClient: boolean;
            distribution: string;
            channel: string;
        };
        preview: {
            distribution: string;
            channel: string;
        };
        production: {
            channel: string;
            autoIncrement: boolean;
            android: {
                buildType: string;
            };
        };
    };
    submit: {
        production: {};
    };
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
