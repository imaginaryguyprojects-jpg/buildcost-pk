# BuildCost Pakistan — Dashboard Simplification & Property Calculator Redesign Report

**Date**: September 9, 2026  
**Status**: Production Ready & Fully Verified  
**Target Environment**: Live Monorepo / Vercel Production  
**Build Status**: All 70 Pages Built Successfully (Exit Code 0)  
**Test Suite**: 69 / 69 Vitest Unit & Integration Tests Passing (100%)  

---

## 1. Executive Summary & Philosophy

In accordance with the prompt requirements, the BuildCost Pakistan dashboard has been transformed from an overly complex layout into a **fast, clean, and intuitive** experience built specifically for normal Pakistani property owners, builders, and contractors.

The **Property Construction Calculator** is now the primary hero feature occupying the top of `/dashboard` and `/`. Within **5 seconds** of landing on the platform, any user can obtain an instant, accurate construction cost estimate with zero friction and without forced logins.

---

## 2. Key Architectural & UI/UX Implementations

### 1. City Selection (28 Pakistani Cities & Markets)
- **Top Quick Chips**: Instant single-click selection for top regional hubs:
  - `[ Islamabad ]` `[ Rawalpindi ]` `[ Lahore ]` `[ Karachi ]` `[ Peshawar ]`
- **Comprehensive City Dropdown**: All 28 major Pakistani cities and regional markets loaded from `@buildcost/config`:
  - Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Quetta, Faisalabad, Multan, Gujranwala, Sialkot, Bahawalpur, Sargodha, Gujrat, Sheikhupura, Rahim Yar Khan, Dera Ghazi Khan, Jhelum, Chakwal, Wah Cantt, Taxila, Murree, Hyderabad, Sukkur, Abbottabad, Mardan, Mingora / Swat, Muzaffarabad, Gilgit.
- **Urdu & Regional Integration**: Includes Urdu titles (`لاہور`, `اسلام آباد`, `کراچی`) and automatic provincial Marla standard associations.

### 2. Property & Plot Size Unit Controls
- **Segmented Control**: Prominent, touch-friendly segmented switch:
  - `[ Marla ]` `[ Kanal ]` `[ Sq Ft ]`

### 3. Marla Standards (CDA, Lahore, Karachi & Custom)
- **Quick Preset Chips**:
  - `[ 272.25 sq ft ]` (Islamabad, Rawalpindi, CDA standard)
  - `[ 250 sq ft ]` (Lahore standard)
  - `[ 225 sq ft ]` (Karachi, traditional)
  - `[ Custom: 1 Marla = [ ___ ] sq ft ]`
- **Automatic City Mapping**: Selecting Islamabad sets 272.25 sq ft; selecting Lahore sets 250 sq ft; selecting Karachi sets 225 sq ft, while retaining user override capability at all times.

### 4. Plot Size Input & Quick Chips
- **Context-Aware Quick Chips**:
  - In Marla mode: `[ 3 Marla ]` `[ 5 Marla ]` `[ 7 Marla ]` `[ 10 Marla ]` `[ 20 Marla (1 Kanal) ]`
  - In Kanal mode: `[ 0.5 Kanal (10 Marla) ]` `[ 1 Kanal (20 Marla) ]` `[ 2 Kanal ]` `[ 4 Kanal ]`
  - In Sq Ft mode: `[ 1,125 sqft ]` `[ 1,361 sqft ]` `[ 2,250 sqft ]` `[ 2,722.5 sqft ]` `[ 5,445 sqft ]`
- **Decimal Support**: Allows exact entries such as `7.5` Marla, `0.75` Kanal, or custom square footage.

### 5. Area Conversion Summary Card
- High-contrast, instant feedback summary card:
  > **Area Conversion Summary**: `10 Marla = 2,722.50 Sq Ft = 0.50 Kanal (Active Benchmark: 1 Marla = 272.25 sq ft)`
- Live recalculation on every keystroke.

### 6. Construction Calculator Inputs
- **Covered Area (Sq Ft)**: Auto-suggests 70% plot footprint multiplied by the number of floors (`plotAreaSqft * 0.7 * floors`), with a one-click `[ Auto: X sqft ]` reset button and full manual override support.
- **Number of Floors**: Segmented selector:
  - `[ 1 Floor (Ground) ]` `[ 2 Floors (Ground + 1) ]` `[ 3 Floors ]` `[ Custom ]`
- **Construction Scope**:
  - `[ Grey Structure ]` `[ Complete House ]` `[ Custom Scope ]`
- **Finishing Quality Tier**:
  - Standard (A-Class Pakistani Specs), Economy, Premium Executive, Luxury Elite.
- **CTA**: High-visibility emerald gradient `[ CALCULATE FREE ]` button (100% free for all guest users).

### 7. Estimated Cost Result Card (Hero Result)
- Prominent PKR amount formatted in standard currency (`Rs 5,450,000`).
- Pakistani readable Lakh / Crore conversion (`54.50 Lakh` / `0.54 Crore`).
- Cost Per Square Foot (`Rs 2,477 / sq ft`).
- Total Construction Area (`2,200 sq ft`).
- Estimated Duration (`7 - 9 Months`).

### 8. Material Cost Graph: Donut / Pie Chart
- Recharts Donut Chart (`GREY STRUCTURE COST BREAKDOWN` or `CONSTRUCTION COST BREAKDOWN`).
- **Dynamic Calculation**: Real mathematical percentages calculated from actual bill quantities and unit rates:
  - Cement (~12% - 22%)
  - Deformed Steel (~25% - 40%)
  - Bricks (~12% - 18%)
  - Sand & Crush (~6% - 10%)
  - Labour & Shuttering (~15% - 22%)
  - Transport & Logistics (~2% - 3%)
  - Wastage Allowance (~2% - 3%)
- Centered indicator displaying Cost/Sqft.
- Interactive legend with color indicators, item names, exact PKR values, and percentages.

### 9. Itemized Material Cost Cards
- 6 individual cards detailing:
  - **Cement**: Bags count, unit rate, and subtotal.
  - **Steel (Saria)**: Tons & Kg, unit rate, and subtotal.
  - **Bricks**: Pieces count (Awwal 1st Class), unit rate, and subtotal.
  - **Sand**: CFT count (Chenab/Ravi), unit rate, and subtotal.
  - **Crush (Bajri)**: CFT count (Margalla), unit rate, and subtotal.
  - **Labour**: Total sqft area, civil shell rate, and subtotal.

### 10. Custom / Manual Rates Panel
- Drawer with:
  - `[ ✏ Edit Rates ]`
  - `[ Use Current Rates ]` (toggle active/inactive)
  - `[ Reset to City Rates ]`
- Live recalculation immediately upon input change.
- Clear indicators distinguishing `[ City Benchmark ]` from `[ Custom Override ]`.

### 11. Streamlined Navigation (5 Clean Categories)
Both `Sidebar.tsx` (desktop) and `MobileDrawer.tsx` (mobile) have been consolidated into 5 clean categories:
1. **MAIN**: Dashboard (`/dashboard`), Property Calculator (`/calculator`).
2. **ESTIMATION**: Grey Structure (`/calculator/concrete`), Finishing (`/calculator/paint`), BOQ Studio (`/boq`), Labour & Mistri (`/labour`), Materials Takeoff (`/materials`).
3. **PROJECT**: My Projects (`/projects`), Budget & Cash Flow (`/budget`), Purchases & Slips (`/purchases`), Vendors & Khata (`/vendors`), Progress Tracking (`/progress`).
4. **REPORTS**: Reports & PDF Export (`/reports`), Saved Calculations (`/history`).
5. **ADMIN**: Admin Dashboard (`/admin`), Market Rates (`/rates/materials`), Users & Subscriptions (`/admin?tab=users`), Settings (`/settings`).

---

## 3. Verification of the 12 Test Scenarios

The test suite in `packages/calculations/src/__tests__/dashboard_simplification.test.ts` executes and passes all 12 scenarios:

| # | Test Scenario | Input & Formula | Result / Assertion | Status |
|---|---|---|---|---|
| **1** | Islamabad + 10 Marla + 272.25 | $10 \times 272.25$ | $2,722.50\text{ sq ft}$, $0.50\text{ Kanal}$ | **PASS** |
| **2** | Lahore + 10 Marla + 250 | $10 \times 250$ | $2,500.00\text{ sq ft}$, $0.50\text{ Kanal}$ | **PASS** |
| **3** | Karachi + 10 Marla + 225 | $10 \times 225$ | $2,250.00\text{ sq ft}$, $0.50\text{ Kanal}$ | **PASS** |
| **4** | 20 Marla + 272.25 (1 Kanal) | $20 \times 272.25$ | $5,445.00\text{ sq ft}$, $1.00\text{ Kanal}$ | **PASS** |
| **5** | 2,722.50 sq ft with 272.25 | $2722.50 / 272.25$ | $10.00\text{ Marla}$, $0.50\text{ Kanal}$ | **PASS** |
| **6** | Custom Marla 300 sq ft, 5 Marla | $5 \times 300$ | $1,500.00\text{ sq ft}$, $0.25\text{ Kanal}$ | **PASS** |
| **7** | Custom Rate Edits | Cement: 1450 $\rightarrow$ 1600 | Live increase in civil total & cost/sqft | **PASS** |
| **8** | City Rate & Benchmark Switches | 28 Pakistani cities in config | Correct provincial mapping | **PASS** |
| **9** | Covered Area Auto-Suggest | $2722.5 \times 0.7 \times 2$ | Auto suggests $3,812\text{ sq ft}$ + manual override | **PASS** |
| **10** | Construction Scope Toggle | Grey vs Complete House | Complete house includes finishing package | **PASS** |
| **11** | Material Cost Breakdown Proportions | Real quantities $\times$ rates | Proportions align with PEC standards | **PASS** |
| **12** | 100% Free Guest Experience | Complete calculation & breakdown | Available without authentication gate | **PASS** |

---

## 4. Build & Deployment Readiness

1. **TypeScript Typecheck**:
   - Monorepo `tsc --noEmit` exits with code 0 (Zero type errors).
2. **Vitest Test Suite**:
   - `4 passed (4)` test files, `69 passed (69)` test cases.
3. **Next.js Production Build**:
   - `next build` exits with code 0.
   - All 70 routes generated cleanly (static prerender & dynamic server routes).
4. **Vercel Deployment Compatibility**:
   - Root and `apps/web` build configurations verified.
