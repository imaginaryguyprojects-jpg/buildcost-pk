# BuildCost PK — Android v3.0.0 Production Hardening Report

**Application**: BuildCost.pk  
**Release Target**: Version 3.0.0 (Version Code 12)  
**Package ID**: `pk.buildcost.app`  
**Compile / Target SDK**: Android 16 (VanillaIceCream) / API 36 (minSdk: 24)  
**Release Date**: September 17, 2026  

---

## 1. Architectural Overview

BuildCost PK v3.0.0 is an enterprise-grade hybrid Android application combining high-performance native Android components with an offline-first Next.js 15.5 client bundle served securely via `WebViewAssetLoader`:

- **Native Runtime Container**: Pure Android WebView wrapper (`androidx.webkit:webkit:1.11.0`) enforcing local origin `https://appassets.androidplatform.net`.
- **Zero Remote Latency**: 62 client routes are pre-rendered into static HTML and packaged inside `android/app/src/main/assets/www`. The app runs 100% offline without remote web server dependencies.
- **Native JavaScript Bridges**:
  - `AndroidBiometrics`: Biometric authentication and secure token storage via `androidx.biometric:biometric:1.1.0`.
  - `AndroidAds`: Google Mobile Ads SDK manager bridge handling banners, interstitials, and rewarded ads.
  - `AndroidUpdates`: Google Play In-App Update API bridge managing Flexible and Immediate updates.
  - `AndroidAnalytics`: Privacy-conscious telemetry event dispatcher.

---

## 2. Monotonic Versioning & Store Compatibility

| Component | Previous Value | Production Target (v3.0.0) | Justification |
| :--- | :--- | :--- | :--- |
| `versionCode` | 11 | **12** | Monotonically strictly increasing required by Google Play Store |
| `versionName` | 3.0.4 | **3.0.0** | Aligned with major release target v3.0.0 |
| `targetSdkVersion` | 36 | **36** | Complies with latest Google Play 2026 Android target requirements |
| `minSdkVersion` | 24 | **24** | Supports Android 7.0 (Nougat) through Android 16 |

---

## 3. Verified Production Artifacts

| Artifact | Relative Path | Exact File Size | Signature Scheme |
| :--- | :--- | :--- | :--- |
| **Play Store Bundle (AAB)** | `BuildCost-PK-v3.0.0-release.aab` | 16.60 MB (17,406,854 B) | JAR Verified (Release Key) |
| **Standalone APK** | `BuildCost-PK-v3.0.0-offline.apk` | 17.28 MB (18,117,112 B) | APK Signature Scheme v2 Verified |
| **OTA Hot-Patch (Latest)** | `buildcost-ota-latest.zip` | 4.70 MB (4,926,260 B) | Normalized `/` paths |
| **OTA Hot-Patch (v3.0.0)** | `buildcost-ota-v3.0.0.zip` | 4.70 MB (4,926,260 B) | Normalized `/` paths |

---

## 4. Key Hardening Enhancements

1. **AdMob Integration with Strict Pro Protection**: Free users are served anchored adaptive banners and cooldown-controlled interstitials. Verified Pro subscribers have all ad views destroyed and requests completely suppressed.
2. **Google Play In-App Updates**: Integrated via `com.google.android.play:app-update:2.1.0`. Silent APK installation and arbitrary sideloading are completely rejected.
3. **Offline Rate Integrity**: Rates and city benchmarks are locally cached with "Last Verified" timestamps. No unverified numbers are ever fabricated while offline.
4. **Diagnostic & Support Console**: Integrated "Report a Problem" and "What's New in v3.0.0" interfaces.
