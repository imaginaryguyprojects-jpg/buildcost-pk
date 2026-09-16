# Android Verification & Testing Matrix — BuildCost PK v3.0.0

---

## 1. Testing Matrix

| Scenario | Input Condition | Expected Behavior | Result |
| :--- | :--- | :--- | :--- |
| **New User** | Clean installation without prior storage | Starts with branded splash; defaults to standard calculator; displays banner ad at bottom | **PASS** |
| **FREE User** | Authenticated as standard user | Bottom anchored banner visible; interstitial triggered after calculation (respecting 90s cooldown) | **PASS** |
| **PRO User** | Authenticated with active Supabase Pro tier | Banner hidden/destroyed; interstitials completely blocked; 3+ premium layout plans unlocked | **PASS** |
| **Expired PRO** | Profile `pro_expires_at` in the past | Gracefully transitions back to FREE tier with ad monetization restored | **PASS** |
| **Google Sign-In** | Tap "Continue with Google" | Authenticates via Supabase OAuth; syncs user profile and favorites | **PASS** |
| **Email Sign-In** | Correct email and password | Authenticates against Supabase; restores cloud estimates | **PASS** |
| **Invalid Login** | Wrong password supplied | Rejects login with clear error message; no state bypass | **PASS** |
| **Forgot Password** | Enter registered email address | Sends official password recovery email with secure reset link | **PASS** |
| **Offline Mode** | Network disabled / airplane mode | Loads from self-contained assets; displays "Offline — Last synced data: [time]"; never fabricates live rates | **PASS** |
| **Online Reconnect** | Network restored | Re-synchronizes verified market rates from Supabase; updates sync timestamp | **PASS** |
| **Recalculation** | Click "Recalculate" on saved estimate | Instantly populates plot size, covered area, and parameters; recalculates without errors | **PASS** |
| **Play Update Check** | Check via Google Play API | Queries Play Core; prompts user with Flexible or Immediate flow when available | **PASS** |

---

## 2. Compilation & Signature Verification

- **Static Export**: 62 client routes exported without errors (`pnpm run build:mobile-bundle`).
- **Gradle Release Compilation**: `assembleRelease` & `bundleRelease` executed successfully in 2m 25s with 0 compiler errors.
- **AAPT2 Badging Inspection**:
  - `package: name='pk.buildcost.app' versionCode='12' versionName='3.0.0'`
  - `compileSdkVersion='36' targetSdkVersion='36' minSdkVersion='24'`
  - Permissions: `INTERNET`, `ACCESS_NETWORK_STATE`, `USE_BIOMETRIC`, `POST_NOTIFICATIONS`, `AD_ID`.
- **Signature Schemes**:
  - APK: Verified with APK Signature Scheme v2 via `apksigner.bat`.
  - AAB: Verified with release key via `jarsigner.exe`.
