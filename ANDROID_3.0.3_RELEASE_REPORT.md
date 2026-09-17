# Android Release Report — BuildCost.pk v3.0.3

**Release Version**: `3.0.3`  
**Release Version Code**: `13`  
**Package ID**: `pk.buildcost.app`  
**Release Date**: September 17, 2026  
**Target SDK**: `36` (Android 15+)  
**Min SDK**: `24` (Android 7.0+)  

---

## 1. Production Artifacts Generated

| Artifact | File Name | Size | Verification |
| :--- | :--- | :--- | :--- |
| **Google Play Bundle (AAB)** | `BuildCost-PK-v3.0.3-release.aab` | 16.60 MB | **Verified with jarsigner** |
| **Standalone Release APK** | `BuildCost-PK-v3.0.3-offline.apk` | 17.28 MB | **Verified with apksigner (v2)** |
| **OTA Hot-Patch Package** | `buildcost-ota-v3.0.3.zip` | 4.70 MB | **Verified Linux normalized ZIP** |
| **OTA Latest Package** | `buildcost-ota-latest.zip` | 4.70 MB | **Verified Linux normalized ZIP** |

---

## 2. Google Play Console Upload Instructions

1. Log in to [Google Play Console](https://play.google.com/console).
2. Select **BuildCost PK** (`pk.buildcost.app`).
3. Navigate to **Testing > Closed testing** (or **Production**).
4. Click **Create new release**.
5. Upload the release App Bundle:
   `BuildCost-PK-v3.0.3-release.aab`
6. Confirm release details:
   - Version name: `3.0.3`
   - Version code: `13`
7. Copy and paste the release notes from `CHANGELOG.md`.
8. Click **Save** and **Review release**, then roll out to testing track!

---

## 3. Standalone Sideloading Instructions

For direct testing on physical Android devices:
```bash
adb install -r BuildCost-PK-v3.0.3-offline.apk
```
