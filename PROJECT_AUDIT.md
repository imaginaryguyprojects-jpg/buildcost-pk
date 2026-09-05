# PROJECT AUDIT: BuildCost Connect Platform
**Master Addendum Phase 1 Architecture & Codebase Review**
*Generated: September 2026*

---

## 1. Executive Summary

BuildCost Connect has been architected as a Pakistan-centric construction cost intelligence, progressive estimation, and site management platform. It follows a multi-package monorepo structure (pnpm + Turborepo) intended to support three client targets sharing a single backend and business logic core:
1. **Web Application** (Next.js 15 App Router, React 19, Tailwind CSS v4, Zustand)
2. **Android Application** (Targeted for Phase 2: React Native / Expo Router / EAS Build)
3. **Chrome Extension** (Targeted for Phase 3: React / Vite Manifest V3)

This audit documents the current codebase, identifies reusable components, highlights technical debt, verifies database and security posture, and establishes the phase-by-phase implementation plan aligned with the 114 sections of the Master Addendum.

---

## 2. Current Technology Stack

| Layer | Technology | Version / Specification | Role |
|---|---|---|---|
| **Monorepo** | Turborepo + pnpm | Turborepo 2.4.4, pnpm 11.25.0 | Workspace management, task caching, multi-package builds |
| **Frontend Framework** | Next.js (App Router) | 15.5.25 | Server & client rendering, route optimization, SEO landing |
| **Language** | TypeScript | 5.7.3 (strict mode) | End-to-end type safety across packages and web apps |
| **Styling & UI** | Tailwind CSS v4 + Lucide Icons | Tailwind v4, Lucide React | Modern dark/light responsive interface matching `Updated UI.jpg` |
| **Client State** | Zustand | 5.0.3 (with `persist` middleware) | Reactive state for projects, materials, auth, and system settings |
| **Data Validation** | Zod | 3.24.2 | Schema validation for user inputs, project models, and calculator forms |
| **Visual Charts** | Recharts | 2.15.1 | Donut breakdowns, cost vs. progress charts, rate trend timelines |
| **Testing Engine** | Vitest | 3.2.7 | 25/25 automated unit tests covering structural, finishing & labour math |
| **Backend & DB** | Supabase / PostgreSQL | PostgreSQL 15+ with RLS | Database, Row Level Security, Auth, Edge functions, Storage |
| **Document Export** | html2canvas + jsPDF | Standard Web Canvas & PDF | Client/Server PDF generation and BOQ CSV exports |

---

## 3. Monorepo Folder Structure

```
Pak-Construction Calculator-2.0/
├── apps/
│   └── web/                                # Primary Next.js 15 Web Application
│       ├── public/                         # Static assets, logos, and icons
│       └── src/
│           ├── app/                        # Next.js App Router (44 static/dynamic routes)
│           │   ├── (public pages)          # /, /login, /signup, /pricing, /about
│           │   ├── dashboard/              # 6-Question Executive Dashboard
│           │   ├── calculator/             # Multi-mode Calculator Hub & Sub-Calculators
│           │   ├── projects/               # Projects List, Detail ([id]), and Creator
│           │   ├── layouts/                # 2D CAD House Layout Library
│           │   ├── purchases/              # Material Purchases & Order Management
│           │   ├── inventory/              # Site Stock Inventory Tracking
│           │   ├── vendors/                # Vendor Profiles, Ratings & Khata Ledger
│           │   ├── diary/                  # Daily Site Diary with weather & labor logs
│           │   ├── reminders/              # Task, Milestone & Procurement Reminders
│           │   ├── boq/                    # Bill of Quantities (35+ civil items)
│           │   ├── reports/                # Executive PDF & Analytics Reports
│           │   ├── rates/                  # Materials, History & Market Watchlist
│           │   ├── admin/                  # Permission-Gated Admin Panel (5 Tabs)
│           │   └── share/[token]/          # Expiring Read-Only Project Share Links
│           ├── components/                 # Reusable UI, Calculator, & Layout components
│           ├── lib/                        # Formatters (formatPKR), utilities, mockData
│           └── stores/                     # Zustand stores (projectStore, authStore, systemSettingsStore)
├── packages/
│   ├── calculations/                       # SHARED CALCULATION ENGINE (Cross-platform)
│   │   ├── src/
│   │   │   ├── structural_elements.ts      # Multi-type columns, slabs, beams, lintels, brickwork, footings
│   │   │   ├── grey_structure.ts           # Itemized quantities with Pakistani wastage factors
│   │   │   ├── finishing_estimator.ts      # 17-category finishing (Material + Labour split)
│   │   │   ├── labour_engine.ts            # Pakistani productivity rates, working days, Scenarios A/B/C
│   │   │   ├── full_estimate.ts            # Progressive pipeline & quality tiers (Economy/Standard/Premium/Luxury)
│   │   │   ├── concrete.ts, masonry.ts...  # Individual material math
│   │   │   └── __tests__/                  # Vitest test suite (25 test cases passing)
│   ├── config/                             # SHARED METADATA & CONFIGURATION
│   │   └── src/
│   │       ├── cities.ts                   # 14 Pakistani Metropolitan Markets (Lahore, Karachi, ISB...)
│   │       ├── marla.ts                    # 3 Marla Standards (225 sqft, 250 sqft, 272.25 sqft)
│   │       ├── defaults.ts                 # Verified baseline rates (PBS & APCMA)
│   │       └── business.ts                 # Admin contacts (Umer Shahzad, Easypaisa, WhatsApp)
│   ├── types/                              # SHARED TYPESCRIPT CONTRACTS
│   │   └── src/                            # Project, User, Rate, BOQ, Purchase, Vendor interfaces
│   └── validation/                         # SHARED ZOD SCHEMAS
│       └── src/                            # Form and API schema validators
├── supabase/
│   ├── migrations/                         # 4 PostgreSQL Migrations with RLS
│   │   ├── 20260904000001_initial_schema.sql
│   │   ├── 20260905000001_customer_account_and_sharing.sql
│   │   ├── 20260905000002_layouts_vendors_purchases.sql
│   │   └── 20260905000003_subscriptions_payments_verification.sql
│   └── seed.sql                            # Benchmark data (PBS/APCMA rates, sample projects)
├── UI.jpg & Updated UI.jpg                 # Visual design reference mockups
├── package.json & turbo.json               # Root monorepo orchestration
└── .env.example                            # Public variable documentation
```

---

## 4. Existing Calculators & Formulas

The `@buildcost/calculations` package contains pure mathematical functions completely decoupled from the DOM and Next.js, guaranteeing direct reusability in future React Native (Expo) and Chrome Extension clients:

1. **Concrete Volume & Mix Design (`calculateConcrete`, `calculateColumns`, `calculateRoofSlab`, `calculateBeams`)**:
   - Dry Volume Factor: $1.54$ applied to wet concrete volume.
   - Mix Ratio breakdown ($1:2:4$, $1:1.5:3$, $1:4:8$):
     $$\text{Cement Bags} = \frac{\text{Part}_{\text{cement}}}{\sum \text{Parts}} \times \frac{\text{Dry Volume}}{1.25\text{ cuft/bag}}$$
     $$\text{Sand (cuft)} = \frac{\text{Part}_{\text{sand}}}{\sum \text{Parts}} \times \text{Dry Volume}$$
     $$\text{Crush (cuft)} = \frac{\text{Part}_{\text{crush}}}{\sum \text{Parts}} \times \text{Dry Volume}$$
2. **Structural Reinforcement (Grade 60 Deformed Steel Bars)**:
   - Bar Weight Formula: $W (\text{lbs/ft}) = \frac{d^2}{52.9}$ (where $d$ is bar diameter in eighths of an inch, e.g. #4 bar $= \frac{16}{52.9} \approx 0.302\text{ lbs/ft}$).
   - Columns: Longitudinal bars + lateral ties ($135^\circ$ seismic hooks).
   - Beams: Top/bottom continuous bars + shear stirrup rings.
   - Roof Slabs: Main reinforcement + distribution bars + temperature steel.
3. **Brick Masonry with Opening Deductions (`calculateBrickMasonry`)**:
   - Net Wall Volume $= (L \times H \times T) - \sum (\text{Door/Window/Vent Openings})$.
   - Brick Factor: $13.5\text{ bricks/cuft}$ standard Pakistani red clay bricks.
   - Mortar Dry Volume Factor: $1.33$.
4. **Itemized Grey Structure Wastage**:
   - Cement: $3\%$
   - Sand (Ravi / Chenab): $5\%$
   - Crush (Margalla / Sargodha): $5\%$
   - Bricks: $5\%$
   - Steel: $4\%$
5. **17-Category Finishing Estimator (`calculateFinishingEstimate`)**:
   - Explicit separation of Material Cost and Labour Cost across 17 trades.
6. **Labour Productivity & Calendar Schedule (`calculateLabourWorkforce`)**:
   - Daily crew production standard (e.g. Masonry: $100\text{ sqft/team/day}$; Plaster: $150\text{ sqft/team/day}$).
   - Working days converted into calendar duration accounting for Friday half-days, Gazetted holidays, and concrete curing lag.
   - 3 Workforce Scenarios: A (Standard), B (Fast-track), and C (Economy).
7. **Full Progressive Estimate Pipeline (`calculateFullHouseEstimate`)**:
   - Progressive stages: Plot $\rightarrow$ Grey Structure $\rightarrow$ Finishing $\rightarrow$ Labour $\rightarrow$ Contingency ($3\%-5\%$) $\rightarrow$ Cost per covered sqft.

---

## 5. Existing Database & Supabase Configuration

### Tables Implemented:
1. `profiles`: User accounts, subscription tier (`free` vs `pro`), phone number, business metadata.
2. `projects`: User projects with location, covered area, marla standard, quality level, total budget, status.
3. `floors`: Multi-storey breakdown per project (Ground, First, Second, Basement).
4. `material_rates`: City-based materials, PBS/APCMA benchmarks, delivered rates, timestamps.
5. `labour_rates`: Daily and unit rates per trade across cities.
6. `project_rate_overrides`: Project-level rate overrides preserving historical immutable baselines.
7. `saved_estimates`: JSON snapshot of inputs, quantities, rates, assumptions, and calculation engine version.
8. `vendors`: Suppliers, contacts, categories, cities, khata balances.
9. `purchases`: Procurement orders, quantities, rates, transport, loading/unloading, payment status.
10. `payments`: Pro subscription payments, TRX IDs, receipts, status (`pending`, `approved`, `rejected`), audit logs.
11. `site_diary`: Daily logs, weather, workers present, milestones.
12. `reminders`: Due dates, priorities, task statuses.
13. `share_links`: Secure random tokens, expiry timestamps, view counts.

### Row Level Security (RLS):
- Every user-owned table enforces `auth.uid() = user_id`.
- Public read access permitted only for `material_rates` and active `share_links`.
- Sensitive documents and bills protected against unauthenticated access.

---

## 6. Authentication & User Access Rules

- **Supabase Auth**: Email/Password, phone OTP, and session tokens.
- **Guest Users (Unauthenticated)**:
  - Allowed: Basic standalone calculators (`/calculator`), previewing layouts, viewing public market rates.
  - Restricted: Cannot save projects to cloud, cannot upload receipts, cannot export unbranded PDFs, cannot generate secure share links.
  - Upgrade Prompt: Triggered upon repeated usage to encourage account registration.
- **Registered Free Users**:
  - Up to 3 cloud-saved projects, standard PDF reports, access to site diary and reminders.
- **Registered Pro Users**:
  - Unlimited projects, multi-scenario workforce simulator, custom contractor BOQ Excel export, WhatsApp supplier dispatch, price sensitivity analysis, unbranded white-label reports.
- **Admin Users**:
  - Gated by role (`admin`), granting access to `/admin` for manual payment verification, market rate updates, system configuration, and aggregate conversion analytics.

---

## 7. Reusable Components & UI Patterns

- Layout Components:
  - `Topbar.tsx`: Sticky navigation, city selector, light/dark mode switch, search launcher, auth avatar, Pro upgrade badge.
  - `Sidebar.tsx`: Collapsible 4-section sidebar matching the visual reference (`Updated UI.jpg`), active route highlighting.
- Modular Calculator Components:
  - `CalculatorHub`: Tabbed selector for Grey, Finishing, Labour, Full Estimate, Scenarios, and Rates.
  - Sub-element cards for Footings, Columns, Beams, Slabs, and Masonry.
- Modals & Sheets:
  - `PaymentCheckoutModal.tsx`: Easypaisa copy buttons, 7-step guide, WhatsApp slip launcher.
  - `LoginModal.tsx`: Seamless modal login without losing calculator input state.

---

## 8. Technical Debt & Gaps Identified

Based on the 114 sections of the Master Addendum, the following gaps need to be systematically resolved:

1. **Navigation Structure (Section 4)**:
   - Master navigation requires 14 top-level items:
     `Dashboard`, `Projects`, `Calculator`, `Materials`, `Labour`, `Vendors`, `Purchases`, `Budget`, `Progress`, `Reports`, `House Layouts`, `Rates`, `Reminders`, `Profile`.
   - Currently, `Budget` and `Progress` are nested inside project details or dashboard rather than having dedicated high-level routes (`/budget`, `/progress`).
   - Need dedicated route `/materials` (or explicit alias to material management with project-level overrides, brand, grade, and confidence scoring).
2. **Project Health Score Engine (Section 38)**:
   - Currently, health score (0–100) is calculated in dashboard view state. It must be formalized in `@buildcost/calculations` as `calculateProjectHealthScore` taking real project inputs (budget variance, physical progress, material procurement, labour attendance, vendor overdue khata).
3. **What-If Price Simulator (Section 42)**:
   - Needs dedicated reusable function in `@buildcost/calculations` and an interactive UI allowing dynamic adjustment (e.g. Steel +10%, Cement +5%, Labour +15%) with before/after variance.
4. **Calculation Assumptions Panel (Section 92)**:
   - Standardize an explicit "Calculation Assumptions" collapsible drawer across all calculator modes, allowing users to inspect and override mortar ratios, dry factors, wastage percentages, and brick dimensions without hardcoding.
5. **Rate Confidence & Verification Fallback (Sections 47 & 49)**:
   - Expose explicit confidence badges (`HIGH`, `MEDIUM`, `ESTIMATED`) and fallback timestamps (`"Last verified on: [DATE]"`) on all rate displays.
6. **Cross-Platform Shared Architecture (Sections 1, 66–74, 108–112)**:
   - Formalize shared platform configuration endpoints/helpers (Feature Flags, App Update Metadata for future Android OTA / Direct APK, announcements) so Phase 2 (Android) and Phase 3 (Chrome Extension) can seamlessly plug in.

---

## 9. Security & Privacy Audit

- **Secrets Handling**: No private keys or service-role keys committed to source control. `.env.example` documents public variable names only.
- **Payment Verification**: Manual Easypaisa / JazzCash transactions require explicit admin verification; no client-side automated bypass exists.
- **Admin Access**: Protected via role check and server-side verification; no query parameter or localStorage backdoor.
- **Document Protection**: Vendor bills and payment slips stored in restricted Supabase storage buckets with authenticated access policies.

---

## 10. Master Migration & Implementation Roadmap

Following the implementation order specified in Section 106:

### Phase 1A: Architecture & Shared Core Hardening
- Audit completion (`PROJECT_AUDIT.md`).
- Ensure `@buildcost/calculations` contains all mathematical modules (`calculateProjectHealth`, `calculateWhatIfScenario`, `calculateRoomCost`).
- Centralize feature flags store (`grey_structure_v2`, `advanced_labour`, `vendor_management`, `house_layouts`, `ai_advisor`, `pro_reports`, `whatsapp_sharing`, `price_simulator`).
- Create Android update metadata contract endpoint (`/api/app-update`) per Sections 70, 71, and 110.

### Phase 1B: Navigation & Dedicated Core Pages
- Add dedicated `/budget` route (Section 34: Budget vs Estimated vs Actual with category breakdown).
- Add dedicated `/progress` route (Section 36 & 37: Multi-stage progress tracking and Cost vs Progress correlation).
- Add dedicated `/materials` route (Section 16: Material catalog, custom project overrides, brand, grade, confidence rating).
- Synchronize Topbar and Sidebar with the 14-item navigation menu (Section 4).

### Phase 1C: Interactive Calculators & Assumptions
- Implement Assumptions Panel (Section 92) across calculator modes.
- Implement What-If Price Simulator (Section 42) inside Calculator Hub.
- Integrate Room-Level Estimation (Section 26) with detailed room templates.

### Phase 1D: Project Management & Verification
- Ensure full end-to-end user journey:
  $\text{Plot} \rightarrow \text{Layout} \rightarrow \text{Grey Structure} \rightarrow \text{Finishing} \rightarrow \text{Labour} \rightarrow \text{Vendors} \rightarrow \text{Purchases} \rightarrow \text{Budget} \rightarrow \text{Progress} \rightarrow \text{PDF/Share}$.
- Re-run full test suites, typechecks, and Next.js production builds.
