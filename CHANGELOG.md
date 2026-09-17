# BuildCost Pakistan — Changelog

All notable changes to the BuildCost Pakistan platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.3] - 2026-09-17 (Version Code 13)

### Added & Enhanced
- **Authentication Improvements**:
  - Full Google OAuth Sign-In and Email/Password registration and login via Supabase.
  - Secure password recovery and reset flows without token leakage.
  - Automated login security email notifications (`New Sign-In — Email & Password` and `New Sign-In — Google`).
  - Session persistence and biometric quick-unlock with AES/biometric prompt integration.
- **Advanced PRO Exact Construction Calculation Engine**:
  - Configurable exact wall height (8–20 ft) dynamically recalculating brickwork, mortar, plaster, and labour.
  - Dynamic bathroom dimensional modeling with 4.5-inch partition wall surface calculations.
  - Sub-structure Bunyad (Foundation) modeling with depth, width, and footing classification (Strip / Raft).
  - Structural RCC column grid configuration (count, dimensions, height, rebar density).
  - Structural RCC beam grid configuration (count, cross-sections, span lengths).
  - Strict anti-double-counting engine deducting structural column/beam volumes from masonry.
- **Realistic Architectural Layout Plans**:
  - 1 verified modern architectural layout plan for FREE members.
  - 3+ premium residential architectural layouts (multi-storey, luxury, corner-plot) with complete zoning (bedrooms, bathrooms, drawing/dining, lounge, kitchen, porch, stairs, doors/windows) for PRO members.
- **Google AdMob Monetization (SDK v23.3.0)**:
  - Anchored adaptive bottom banners for FREE users with zero UI overlap.
  - Interstitial transition ads triggered upon calculation completion with strict 90s cooldown.
  - Rewarded ads for temporary premium layout previews without altering permanent entitlement.
  - 100% Ad-Free experience for verified PRO subscribers, enforced server-side.
- **Automatic Backend Data Synchronization & Offline Resilience**:
  - Live background sync for material prices, labour benchmarks, and city rates without app reinstall.
  - Transparent timestamping: `Last Synced: [date/time]` and `Offline — Last synced data` (no fabricated live data).
  - Offline-first caching preserving last verified rates and recent calculations.
- **Google Play In-App Updates (SDK v2.1.0)**:
  - Official Google Play Flexible In-App Update support for background downloads.
  - Immediate update support for critical security or rate database updates.
  - Zero silent APK sideloading inside production Google Play builds.
- **Diagnostics, Analytics & Crash Reporting**:
  - Native uncaught exception crash handler logging app version, Android API, and device model without sensitive tokens.
  - JavaScript bridge analytics recording key user events.
  - In-app "Report a Problem" and "What's New in v3.0.3" modal dialogs.
- **Verified Production Artifacts**:
  - Signed release AAB (`BuildCost-PK-v3.0.3-release.aab`) for Google Play Store upload.
  - Signed standalone release APK (`BuildCost-PK-v3.0.3-offline.apk`) verified via APK Signature Scheme v2.
  - Clean OTA hot-patch bundles (`buildcost-ota-v3.0.3.zip` and `buildcost-ota-latest.zip`).

---

## [3.0.0] - 2026-09-17 (Version Code 12)

### Added
- **Google AdMob Monetization & Server-Side Entitlement**:
  - Official Google Mobile Ads SDK (`play-services-ads:23.3.0`) integration.
  - Anchored adaptive banner ads at screen bottom with layout anti-overlap protection.
  - Natural transition interstitial ads with configurable 90-second cooldown frequency timer.
  - Optional rewarded ads offering temporary single-calculation perks.
  - Strict server-side PRO entitlement protection: zero ads displayed to verified PRO subscribers.
- **Official Google Play In-App Updates**:
  - `com.google.android.play:app-update:2.1.0` integration with Flexible and Immediate update flows.
  - Fully compliant with Google Play security policies with zero silent APK sideloading.
- **Dynamic Backend Synchronization Without Reinstall**:
  - Synchronizes verified market rates, city benchmarks, and layout metadata automatically.
  - Transparent timestamp indicators (*"Last Synced"* and *"Offline — Last synced data"*).
  - Strict policy: cached figures are never fabricated as live rates while offline.
- **Productivity Special Features**:
  - Recent & Favorite Calculations with instant 1-click "Recalculate" populating all parameters.
  - "Save to My Account" prompt on login for guest-created estimates.
  - 4 Architectural floor plans (1 Free quality plan, 3+ Pro luxury villa designs).
  - Diagnostic & Support Console with "Report a Problem" and "What's New in v3.0.0" dialogs.
- **Production Build & Verification**:
  - Signed release AAB (`BuildCost-PK-v3.0.0-release.aab`) and offline APK (`BuildCost-PK-v3.0.0-offline.apk`).
  - Target SDK 36 (Android 16), Min SDK 24, Version Code 12.

---

### Added
- **PRO Exact Construction Calculation Engine**:
  - High-precision engineering module replacing empirical allowances with exact geometric calculations.
  - Zero double-counting architecture: pure brickwork masonry is isolated from concrete columns, beams, slabs, and foundations.
  - **Exact Wall Height**: Auto (10 ft default) or manual specification (8–20 ft) dynamically sizing wall volume, brick count, mortar, plaster area, and labour.
  - **Dynamic Bathrooms Engine**: Floor-level bathroom counts, individual Length × Width dimensions, and one-click "Apply same size to all bathrooms" toggle.
  - **Bunyad (Foundation) Sub-Structure**: Depth, trench width, and type (Strip, Isolated, Raft) with structural civil engineering disclaimers.
  - **Structural Columns & Beams**: Configurable column count, cross-sections (e.g., 9"×9", 9"×12", 12"×12"), beam running feet, and steel reinforcement factors.
- **Interactive 2D CAD Blueprint Diagram**:
  - Vector SVG architectural plan dynamically rendered from user dimensions and floor selections.
  - Layer toggles for Structural Columns, Beams, Bathroom Partitions, Engineering Grid, and Dimension Callouts.
  - Interactive Pan/Zoom controls, viewport reset, and scale indicator.
- **PRO Detailed Estimate & Real-Time Dynamic Donut Chart**:
  - Comprehensive itemized bill with zero static percentages, powered directly by true material volumes and local market rates.
  - Full material takeoffs: Bricks, Cement, Sand, Crush, Grade 60 Rebar, Labour, Transport, Wastage, and Other.
- **PRO Feature Lock & Upgrade Experience**:
  - Direct modals and gating banners highlighting PRO value with official launch pricing (PKR 200/month, PKR 799/year).
  - One-click "Save Calculation" storing and restoring all advanced PRO structural parameters to local project state.
- **Play Store Production Assets**:
  - 512×512 px official app icon and 1024×500 px Google Play feature graphic.
  - Comprehensive Public Privacy Policy at `/privacy`.
  - Android native bundle `versionCode 7`, `versionName "3.0.0"`.

---

## [2.1.0] - 2026-09-10

### Added
- **PDF & Print Estimate Sharing**:
  - Instant client-ready quotation generation in branded PDF and print-ready formats.
- **Over-The-Air (OTA) Hot-Patching Engine**:
  - In-app automatic update checker and delta bundle extraction.
- **Offline First Mobile PWA & Native Capacitor Shell**:
  - Standalone offline Android bundle with zero internet dependencies.

---

## [1.2.0] - 2026-09-09

### Added
- **Hero Property Construction Calculator**: Placed at the top of the dashboard for instant, friction-free calculations within 5 seconds.
- **28 Major Pakistani Cities & Regional Markets**: Accurate regional cost indexes and local bylaws from Islamabad and Rawalpindi to Gilgit, Gwadar, and Muzaffarabad.
- **Provincial & Custom Marla Standards**:
  - `272.25 sq ft`: Islamabad, Rawalpindi, CDA standard, and traditional Punjab revenue records.
  - `250.00 sq ft`: Lahore standard and select modern Punjab societies.
  - `225.00 sq ft`: Karachi standard and modern urban developments (DHA, Bahria).
  - `Custom`: User-defined square footage per Marla.
- **Area Conversion Summary Card**: Real-time card showing simultaneous mathematical equivalence across Marla, Kanal, and Square Feet.
- **Material Cost Breakdown Donut Chart**: Dynamic civil engineering percentage distribution for Cement, Steel, Bricks, Sand, Crush, Labour, Transport, and Wastage.
- **Custom / Manual Material Rates Panel**: Live recalculation upon modifying cement (50kg bag), steel (kg), brick (pc), sand (cft), crush (cft), and labour (sq ft) rates with city benchmark comparisons.
- **100% Free Guest Experience**: Complete calculations, material takeoffs, and visual breakdowns accessible to all visitors without requiring authentication.
- **Streamlined 5-Category Navigation**: Consolidated desktop sidebar and mobile drawer into Main, Estimation, Project, Reports, and Admin.
- **Public Updates & Changelog Pages**: Dedicated `/updates` and `/changelog` routes for tracking public release notes.

---

## [1.1.0] - 2026-09-07

### Added
- **Super Admin Platform Control Center**: Comprehensive management dashboard with live metrics, feature flags, and administrative control over dynamic settings.
- **Pakistan Manual Payment Gateway**: Native EasyPaisa and JazzCash receipt upload workflow with auto-calculated 18% GST and WhatsApp notification integration.
- **BOQ Studio & Client PDF Export**: Contractor-grade Bill of Quantities export and formal estimate generation.
- **Daily Site Diary**: Digital logging for site progress, labour attendance, and daily material deliveries.

---

## [1.0.0] - 2026-08-25

### Added
- **Initial Production Release**: Launched civil engineering calculation engines for RCC concrete, 9-inch brickwork masonry, Grade 60 deformed steel rebar, plaster, and floor finishes.
- **Supabase Cloud Integration**: User authentication, cloud-synced project profiles, and real-time offline persistence.
- **Unit Converter**: Multi-unit conversion between Marla, Kanal, Square Yards, Square Meters, and Square Feet.
