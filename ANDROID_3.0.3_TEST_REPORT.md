# Android Test & Verification Matrix — BuildCost.pk v3.0.3

**Date**: September 17, 2026  
**Target**: BuildCost.pk v3.0.3 (Version Code 13)  
**Verification Status**: PASS (100% Verified)  

---

## 1. Test Execution Matrix

| Test Suite | Scenario | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **App Launch & Rendering** | Cold launch from APK on Android device | Displays emerald branded splash overlay, smoothly transitions to UI with zero CSS collapse | **PASS** |
| **Property Calculator (Free)** | 5 Marla calculation with Lahore rates | Displays grey structure cost, material quantities, duration, dynamic graph | **PASS** |
| **Property Calculator (Pro)** | 10 Marla with custom wall height (11 ft), 3 baths, columns, beams | Displays detailed BOQ, deducts column/beam volume from brickwork, no NaN/Infinity | **PASS** |
| **Architectural Layouts (Free)** | View standard 5 Marla floor plan | Renders 2D CAD layout with room zoning and clear dimensions | **PASS** |
| **Architectural Layouts (Pro)** | View 1 Kanal Luxury Villa plan | Gated by PRO authorization modal; unlocks with verified PRO session | **PASS** |
| **AdMob Banner** | Free user opens calculator | Anchored adaptive banner renders at base without covering buttons | **PASS** |
| **AdMob Interstitial** | Calculation completed | Interstitial ad appears; subsequent calculation respects 90s cooldown | **PASS** |
| **AdMob PRO Immunity** | PRO user logs in | Banner immediately removed; zero ads requested | **PASS** |
| **Offline Mode** | Device disconnected from Wi-Fi/data | App loads cached rates; displays "Offline — Last synced data"; calculations work | **PASS** |
| **Backend Auto-Sync** | Reconnect network | Refreshes rates; updates timestamp to "Last Synced: Today at HH:mm" | **PASS** |
| **Play In-App Update** | Trigger update check via bridge | Connects to AppUpdateManager; handles flexible & immediate listeners | **PASS** |
| **Crash Reporting** | Uncaught exception simulation | Logged via custom handler with device/OS info and zero secrets | **PASS** |

---

## 2. Consistency Verification
- All calculations were verified between the web engine and mobile bundle:
  - Plot sizes, Marla to sq ft conversions, cement, steel, bricks, sand, crush, and labour produce identical figures with zero rounding drift or NaN errors.
