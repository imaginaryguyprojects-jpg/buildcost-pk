# BuildCost Pakistan (Pak-Construction Calculator)
# Version 3.0.0 Official Release Report

**Release Date:** September 14, 2026  
**Milestone:** v3.0.0 Production Release — Advanced PRO Structural Suite & 2D Blueprint Engine  
**Target Environments:** Web (Vercel Production), Android Native APK/AAB (`versionCode 7`, `versionName "3.0.0"`), Offline Mobile PWA

---

## 1. Executive Summary

Version 3.0.0 is the most significant mathematical and architectural upgrade to BuildCost Pakistan since inception. It introduces the **"PRO — Exact Construction Calculation"** suite, transforming the calculator from an empirical rule-of-thumb estimator into a civil-engineering-grade structural quantification engine.

Key highlights of this release:
- **Zero Double-Counting Architecture**: Pure masonry brickwork is structurally isolated from concrete columns, beams, floor/roof slabs, and foundation sub-structures.
- **Parametric Structural Inputs**: Exact Wall Height (8–20 ft), multi-bathroom dimensional sizing, Bunyad (Foundation) depth/width/type, concrete columns, and beam spans.
- **Interactive 2D CAD Blueprint Diagram**: Scalable SVG architectural floor plan rendered live from user inputs with layer toggles (Columns, Beams, Bathrooms, Grid, Dimensions) and pan/zoom controls.
- **Dynamic Real-Time Donut Chart**: Replaced static percentage allocations with 100% real calculated material volumes and local Pakistani market rates.
- **Monorepo Version Synchronization**: Unified across all packages (`@buildcost/calculations`, `@buildcost/config`, `@buildcost/types`, `@buildcost/validation`, `web`), Android Gradle (`versionCode 7`, `3.0.0`), Capacitor, and offline OTA bundles.

---

## 2. Structural Calculation Engine (`@buildcost/calculations`)

All new mathematical models are housed in `packages/calculations/src/advanced_pro_structure.ts` and thoroughly tested (79 unit tests, 100% passing).

### 2.1 Wall Height Precision
- **Auto Default**: 10.0 ft.
- **Manual Range**: 8.0 ft to 20.0 ft.
- **Impact**: Dynamically calculates pure masonry volume, brick count (13.5 bricks/cft of masonry), mortar dry volume (30% factor), internal & external plaster surface area, and proportional masonry labour costs.

### 2.2 Dynamic Bathrooms Engine
- Configurable bathroom count per floor (Auto: 2 bathrooms/floor).
- Individual Length × Width specification per bathroom (default: 7 ft × 5 ft).
- **"Apply same size to all bathrooms"** quick-toggle for instant batch configuration.
- Adds 4.5-inch non-load-bearing partition brickwork, wet-area water-resistant plaster, tile screed bedding, and dedicated sanitary plumbing allowances.

### 2.3 Bunyad (Foundation Sub-Structure)
- **Parameters**: Depth (ft), Trench Width (ft), and Foundation Type (`Strip Footing`, `Isolated Pad Footing`, `Raft Mat Foundation`, `Other`).
- Calculates lean concrete blinding (1:4:8 ratio), stepped brickwork masonry up to DPC (Damp Proof Course), and Grade 60 structural steel rebar.
- **Structural Engineering Safety Disclaimer**: Prominently displayed to inform users that local soil bearing capacity and seismic zone requirements govern structural foundation design.

### 2.4 Columns & Beams
- **Columns**: Configurable count per floor, cross-sectional dimensions in inches (e.g., 9"×9", 9"×12", 12"×12"), and height matching wall height. Calculates concrete volume (1:2:4 ratio) and Grade 60 deformed rebar (1.5% volumetric steel ratio).
- **Beams**: Configurable count per floor, cross-sectional width & depth (inches), and total running length (ft). Calculates concrete volume and flexural/shear rebar (2.0% volumetric steel ratio).

### 2.5 Master Reconciliation & Zero Double-Counting
```
Total Project Grey Cost =
    Pure Wall Masonry (Bricks + Mortar)
  + Bunyad / Foundation Concrete & Stepped Masonry
  + Reinforced Concrete Columns
  + Reinforced Concrete Beams
  + RCC Floor & Roof Slabs
  + Bathroom Partition Walls & Sanitary Bedding
  + Internal & External Plastering
  + Construction Labour & Masonry Work
  + Site Transport, Loading & Unloading
  + Material Wastage Contingencies
```
Empirical lump-sums are removed when PRO exact parameters are active, ensuring total mathematical consistency.

---

## 3. User Experience & PRO Gating

### 3.1 PRO Visual Highlights & Lock System
- Section Header: **"PRO — Exact Construction Calculation"** styled with an amber gradient and official `PRO` badge.
- When accessed by FREE users:
  - Advanced inputs display lock indicators (`🔒 PRO Only`).
  - Interacting with locked fields opens the **PRO Upgrade Modal** showcasing high-value benefits.
  - Official launch pricing: **PKR 200 / month** and **PKR 799 / year** (sourced from `packages/config/src/business.ts`).
  - Active Business/PRO accounts unlock all controls with live calculation response.

### 3.2 Interactive 2D Blueprint Diagram
- Dynamic SVG architectural plan responsive from 360px mobile screens to 4K ultra-wide monitors.
- **Visual Controls**:
  - Interactive Layer Toggles: *Columns*, *Beams*, *Bathrooms*, *Grid*, *Dimensions*.
  - Multi-floor selector (Ground Floor, 1st Floor, 2nd Floor, etc.).
  - Zoom In, Zoom Out, and Fit to Screen reset.
  - Visual scale indicator (e.g., CDA/Punjab Marla aspect ratio).

### 3.3 Dynamic Donut Chart & PRO Detailed Estimate
- Donut chart slices dynamically generated from true calculated costs:
  - Cement (50kg bags)
  - Grade 60 Steel Rebar (kg)
  - Clay Bricks (pcs)
  - Ravi / Chenab Sand (cft)
  - Margalla / Sargodha Crush (cft)
  - Masonry & RCC Labour
  - Transport & Wastage
- Full itemized table with sub-categories: Walls, Foundation, Columns, Beams, Slabs, Bathrooms, Plaster, and Labour.

### 3.4 State Persistence & Saved Calculations
- "Save Calculation" button integrated into the calculator action bar.
- Automatically stores all standard and advanced PRO structural parameters into `projectStore.ts`.
- Restores all parameters seamlessly when loading historical saved estimates.

---

## 4. Quality Assurance & Verification

| Test Suite / Step | Status | Result |
|---|---|---|
| Advanced Pro Structure Unit Tests (`packages/calculations`) | ✅ PASSED | 79/79 tests passed (100%) |
| TypeScript Monorepo Check (`pnpm --filter web exec tsc --noEmit`) | ✅ PASSED | 0 errors |
| Next.js Production Build (`turbo run build`) | ✅ PASSED | 78/78 static/dynamic routes compiled |
| Android Native Project Sync (`versionCode 7`, `3.0.0`) | ✅ PASSED | Gradle scripts & manifests synchronized |

---

## 5. Deployment & Release Assets

- **Web Deployment**: Ready for automatic deployment to Vercel upon push to `main`.
- **Android Offline Standalone APK**: `BuildCost-PK-v3.0.0-offline.apk` (and `BuildCost-PK.apk`).
- **Google Play Store Release Bundle**: `BuildCost-PK-v3.0.0-release.aab` (and `BuildCost-PK.aab`).
- **Over-The-Air (OTA) Hot-Patch**: `buildcost-ota-v3.0.0.zip` (and `buildcost-ota-latest.zip`).
- **Play Store Visual Assets**:
  - App Icon: 512×512 px PNG (`android/app/src/main/res/playstore-icon.png`)
  - Feature Graphic: 1024×500 px PNG (`android/app/src/main/res/playstore-feature-graphic.png`)
- **Public Privacy Policy**: `/privacy` route.
