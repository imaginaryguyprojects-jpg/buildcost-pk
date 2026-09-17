# BuildCost.pk — Android v3.0.3 Final Production Audit

**Release Target**: Version 3.0.3 (Version Code 13)  
**Package ID**: `pk.buildcost.app`  
**Audited Date**: September 17, 2026  
**Release Build Status**: PASS (Clean Compile & Cryptographically Verified)  

---

## 1. Project Overview & Identity
- **Application Name**: BuildCost.pk
- **Application ID / Package**: `pk.buildcost.app` (Unchanged, 100% Google Play compatible)
- **Version Name**: `3.0.3`
- **Version Code**: `13` (Incremented from previous release code 12 to satisfy Google Play Store monotonic increase rules)
- **Min SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 36 (Android 15+)
- **Compile SDK**: 36
- **Gradle Version**: 8.11.1
- **Android Gradle Plugin (AGP)**: 8.5.2
- **Java / JVM**: OpenJDK 17 (Java 17 Bytecode target)

---

## 2. Comprehensive Subsystem Audit

### A. Civil Engineering & Property Calculator Engine
- **FREE Tier Features**:
  - City selection across 28 Pakistani cities with localized material coefficients.
  - Plot size and Marla standards (225, 250, 272.25 CDA, and custom sq ft).
  - Covered area, floor count (1 to 4 storeys), construction grade (Grey Structure, Standard, Premium, Executive).
  - Material takeoff quantities (cement bags, Grade 60 steel rebar in kg/tons, bricks, sand cft, crush cft).
  - Dynamic duration forecasting, cost per square foot, and calculation-based cost breakdown chart.
- **PRO Tier Features**:
  - Exact wall height parameter (8–20 ft) dynamically sizing masonry and plaster surfaces.
  - Multi-bathroom dimensional takeoffs (count, length, width, 4.5" partition masonry, waterproof plaster).
  - Sub-structure foundation modeling (depth, trench width, Strip vs Raft footing).
  - Structural RCC column grid (count, cross-sections 9x9/9x12/12x12 in, height, steel factor).
  - Structural RCC beam grid (count, dimensions, length, concrete volume, steel factor).
  - Anti-double-counting engine: column, beam, and opening volumes are strictly deducted from brick masonry volume.

### B. Architectural Layout Plans
- **FREE Layout**: 1 complete modern 5 Marla 2-storey residential floor plan with CAD dimensioning and room zoning.
- **PRO Layouts**: 3+ premium architectural layouts (3 Marla, 10 Marla, 1 Kanal) including drawing room, dining, TV lounge, bedrooms, attached bathrooms, kitchen, car porch, staircase placement, doors, windows, and circulation dimensions. Protected by server-side PRO authorization.

### C. Google AdMob Monetization (SDK v23.3.0)
- **Anchored Adaptive Banners**: Native FrameLayout placed at screen base with layout_above preventing UI overlap.
- **Interstitial Transitions**: Shown strictly upon calculation completion, governed by a 90-second minimum cooldown timer.
- **Rewarded Video Ads**: Optional reward ad flow for previewing advanced layouts without compromising account entitlement.
- **PRO Ad Immunity**: Server-verified PRO users trigger immediate native banner destruction and zero ad requests.

### D. Google Play In-App Updates (SDK v2.1.0)
- **Flexible In-App Updates**: Background download with Material Snackbar prompting restart.
- **Immediate In-App Updates**: Fullscreen blocking modal for critical rate/security updates.
- **Security Policy**: Zero silent or arbitrary APK sideloading inside production Google Play builds.

### E. Backend Sync & Offline Support
- Real-time rate sync against Supabase without app reinstall.
- Clear status chips: 'Last Synced: [date/time]' and 'Offline — Last synced data'.
- Zero fabricated numbers while offline.

### F. Crash Reporting & Analytics
- UncaughtExceptionHandler logging app version (3.0.3), versionCode (13), Android API, device model with zero token/password leakage.
- JavaScript bridge logging user events (calculation_completed, pro_upgrade_clicked, app_open).

---

## 3. Cryptographic Verification
- **AAPT2 Badging**: `package: name='pk.buildcost.app' versionCode='13' versionName='3.0.3' compileSdkVersion='36'`
- **APK Signature**: `APK Signature Scheme v2: true` (Signer: CN=Umer Shahzad, OU=BuildCost, O=BuildCostPK, Valid until 2054)
- **AAB Bundle**: `jar verified.`
