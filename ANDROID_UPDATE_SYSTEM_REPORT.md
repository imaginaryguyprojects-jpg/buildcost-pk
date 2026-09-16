# Android Update Systems Report — BuildCost PK v3.0.0

**Module**: Google Play In-App Update API (`com.google.android.play:app-update:2.1.0`)  
**Secondary OTA Hot-Patch**: `OtaUpdateManager` (Supabase REST / Web API fallback)  

---

## 1. Google Play In-App Updates

BuildCost PK implements the official Google Play Core In-App Update API to deliver trusted, policy-compliant binary updates directly within the user workflow.

### Supported Update Flows

1. **Flexible Update**:
   - Designed for standard feature enhancements and non-breaking releases.
   - The user can continue calculating, browsing rates, and generating BOQs while Google Play downloads the update package in the background.
   - Once the download is complete (`InstallStatus.DOWNLOADED`), a non-intrusive bottom snackbar displays:
     *"New version downloaded from Google Play. [Restart & Install]"*.
   - Clicking triggers `appUpdateManager.completeUpdate()`.

2. **Immediate Update**:
   - Enforced for security-critical, database-breaking, or mandatory minimum-version releases.
   - Google Play presents a full-screen blocking update dialog that ensures the user cannot proceed on outdated binary code until the update has finished installing.

3. **Strict Security Compliance**:
   - Zero silent APK downloading.
   - Zero arbitrary installation from external sources (`android.permission.REQUEST_INSTALL_PACKAGES` is strictly omitted).
   - All code is validated and distributed through Google Play infrastructure.

---

## 2. Dynamic Backend Synchronization Without Reinstall

Market rates, city indices, and engineering formulas update in real time without requiring an app reinstall or Play Store download:

- **Data Sourced From Remote**:
  - Material rates across 13 major Pakistani cities
  - Labour and contractor trade benchmarks
  - Architectural layout metadata
  - Remote feature flags and Pro pricing configuration
- **Offline Integrity**:
  - If connected: Syncs automatically every 30 minutes or on pull-to-refresh, updating the timestamp: *"Last Synced: 10:45 PM"*.
  - If offline: Gracefully loads cached data and explicitly indicates *"Offline — Last synced data: [date/time]"*. Cached values are never labeled as "Live Rates".
