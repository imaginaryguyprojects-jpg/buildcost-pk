# Phase 2 — Mobile Application Update & OTA System Report
**Project**: BuildCost-PK (BuildCost Connect)  
**Scope**: In-App Version Detection, Dynamic Release Metadata, Native & OTA Updates  
**Current Client Version**: `v1.3.0` (Build `4`)  
**Date**: September 10, 2026  
**Status**: CONFIGURED & VERIFIED  

---

## 1. System Architecture

Because users install the application directly via APK (or through Google Play Store / enterprise direct distribution in Pakistan), the mobile app requires an autonomous mechanism to detect new releases and prompt users to update without relying solely on Play Store services.

The update pipeline operates across three tiers:
1. **Client Version Identity**: `CURRENT_CLIENT_INFO` in `appUpdateChecker.ts` tracks `version: "1.3.0"` and `versionCode: 4`, matching `android/app/build.gradle`.
2. **Database Metadata Layer**: The Supabase table `public.app_releases` stores release records per platform (`android`, `web`, `ios`).
3. **In-App Enforcement UI**: `AppUpdateModal.tsx` renders dynamic release notes, version comparisons, and direct update buttons.

---

## 2. Release Configuration Schema (`app_releases`)

The `public.app_releases` table controls update behavior:
```sql
CREATE TABLE IF NOT EXISTS public.app_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL UNIQUE,          -- 'android', 'web', 'ios'
    latest_version TEXT NOT NULL,           -- e.g. '1.3.0'
    latest_version_code INTEGER NOT NULL,   -- e.g. 4
    minimum_version_code INTEGER NOT NULL,  -- e.g. 4
    mandatory_update BOOLEAN DEFAULT false, -- If true, modal cannot be dismissed
    ota_available BOOLEAN DEFAULT false,    -- Instant bundle reload
    ota_channel TEXT DEFAULT 'production',
    apk_download_url TEXT,                  -- Direct APK download link
    release_notes TEXT,                     -- What's new in this release
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.1 Public Read & Admin Write RLS Policies
- `Allow public read on app_releases`: Any app client (guest or logged-in) can read release status without authentication.
- `Allow super admins full access on app_releases`: Only verified superadmins can publish new release versions.

---

## 3. Version Comparison & Update Logic (`appUpdateChecker.ts`)

When the application mounts (`AppShell.tsx`), `checkAppUpdate()` executes:
1. **Multi-Source Fetching**:
   - On the web, it queries `/api/app-update?platform=android&versionCode=4`.
   - In the native offline APK (where `/api/` route handlers do not run locally), it queries the Supabase `app_releases` table directly over HTTPS.
2. **Comparison Logic**:
   - `updateAvailable`: `currentVersionCode < latestVersionCode`
   - `mandatoryUpdate`: `mandatory_update === true || currentVersionCode < minimumVersionCode`
3. **Session Dismissal**:
   - For non-mandatory updates, if the user clicks "Remind Me Later", the decision is stored in `sessionStorage` to prevent intrusive prompts during their active workflow.
   - For mandatory updates, the close button is hidden, and interaction is blocked until the update is initiated.

---

## 4. In-App Update Modal (`AppUpdateModal.tsx`)

### 4.1 UI Design & Experience
- **Header**: Displays "New Version Available" (Emerald) or "Critical Native Update Required" (Rose/Red).
- **Version Telemetry**: Shows Current Version (`v1.3.0 (Build 4)`) → Target Release (`vX.X.X (Build Y)`).
- **Release Notes**: Scrollable markdown card detailing bug fixes, new civil estimators, and updated PBS rate feeds.
- **Action CTA**: Direct download button launching the browser or native download manager to retrieve the verified APK.

### 4.2 Security Safeguards
- **Zero Silent APK Execution**: The app never downloads and installs arbitrary APKs silently in the background without user consent.
- **HTTPS Enforcement**: All update URLs must use HTTPS.
- **No Insecure Code Injection**: Local scripts are immutable inside the APK's `assets/www` directory.

---

## 5. Over-The-Air (OTA) Roadmap

For minor formula corrections, UI enhancements, and layout adjustments that do not alter native Java/AndroidManifest code:
- An OTA manifest field (`ota_bundle_url`) is integrated into `app_releases`.
- In future iterations, a secure zip download can update the local asset cache using cryptographic hash verification before swapping the runtime bundle.
