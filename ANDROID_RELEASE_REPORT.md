# Android Release Report — BuildCost PK v3.0.0

**Product**: BuildCost.pk  
**Release Tag**: `v3.0.0`  
**Version Code**: `12`  
**Release Binary**: `BuildCost-PK-v3.0.0-release.aab`  
**Sideload Binary**: `BuildCost-PK-v3.0.0-offline.apk`  
**Target Track**: Google Play Closed Testing / Production Release  

---

## 1. Release Checklist

- [x] Version bumped to `3.0.0` with `versionCode: 12`
- [x] Target SDK set to 36 (Android 16), Min SDK 24 (Android 7.0+)
- [x] Official Google Mobile Ads SDK integrated (`play-services-ads:23.3.0`)
- [x] FREE users receive non-intrusive adaptive banners & cooldown-controlled interstitials
- [x] PRO users strictly guaranteed 100% ad-free experience via Supabase server-side state
- [x] Official Google Play In-App Updates integrated (`app-update:2.1.0`)
- [x] Offline-first local asset architecture: all 62 pages bundled self-contained
- [x] Dynamic rate and pricing updates without app reinstall
- [x] Timestamped sync indicators preventing fabricated live rates while offline
- [x] Special productivity features added: Recent/Favorite calculations, Recalculate, Floor Plans
- [x] Diagnostics & "Report a Problem" modal integrated
- [x] Production AAB and APK compiled, signed with release keystore, and verified
- [x] Zero silent/insecure APK sideloading

---

## 2. File Artifacts for Upload

1. **Google Play Console**:
   - Upload file: `BuildCost-PK-v3.0.0-release.aab`
   - Path: Root of repository and `android/app/build/outputs/bundle/release/app-release.aab`
   - File Size: 16.60 MB
   - Signer: `buildcost-key` (verified via `jarsigner`)

2. **Direct APK Sideload (Testing Devices)**:
   - File: `BuildCost-PK-v3.0.0-offline.apk`
   - Path: Root of repository and `android/app/build/outputs/apk/release/app-release.apk`
   - File Size: 17.28 MB
   - Signer: v2 Scheme Verified via `apksigner`

3. **Over-The-Air Hot Patch**:
   - Files: `buildcost-ota-latest.zip` and `buildcost-ota-v3.0.0.zip`
   - File Size: 4.70 MB
