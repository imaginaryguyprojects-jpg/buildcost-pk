# BuildCost Pakistan — Changelog

All notable changes to the BuildCost Pakistan platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
