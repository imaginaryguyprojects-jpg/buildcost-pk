# Phase 2 — User Records & Admin Analytics Infrastructure Report
**Project**: BuildCost-PK (BuildCost Connect)  
**Scope**: User Lifecycle Management, Admin Role Gating, Analytics Engine & Audit Trail  
**Date**: September 10, 2026  
**Status**: AUDITED & OPERATIONAL  

---

## 1. User Records Management

### 1.1 User Profile Architecture
User profiles are maintained in the Supabase PostgreSQL `public.profiles` table, tied 1:1 with `auth.users`:
- `id` (UUID, references `auth.users.id` with `ON DELETE CASCADE`)
- `full_name` (Text)
- `phone` (Text, formatted for Pakistani mobile carriers e.g., `03XX-XXXXXXX`)
- `company_name` (Text, optional contracting/builder identity)
- `city_id` (Text, references Pakistani municipal market default: `isb`, `lhe`, `khi`, etc.)
- `role` (Text, default `'user'`; elevated to `'admin'` or `'superadmin'`)
- `is_pro` (Boolean, premium tier flag)
- `pro_expires_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 1.2 User Onboarding Flow
1. Upon initial signup or first calculation save, `OnboardingModal` captures the user's primary professional focus:
   - Contractor / Builder
   - Civil Engineer / Architect
   - Individual Home Builder / Plot Owner
2. Preferences (default city, preferred Marla standard `225 sqft` vs `272 sqft`, default area unit) are saved both locally and synchronized to the database.

### 1.3 Account Deletion & Right-to-be-Forgotten
`deleteAccount()` in `authStore.ts` triggers account teardown:
- Clears local storage keys (`buildcost-auth-storage`, `buildcost-projects-storage`).
- Signs out of Supabase Auth.
- Drops local caches and notifies the user with confirmation.

---

## 2. Admin Privileges & Access Control (`adminGuard.ts`)

### 2.1 Super Admin Identification
Access to administrative panels is gated by two independent checks:
1. **Database Role**: `profile.role IN ('admin', 'superadmin')`.
2. **Super Admin Email Whitelist** (`packages/config/src/index.ts`):
   ```typescript
   export const SUPER_ADMIN_EMAILS = [
     "imaginary.guy.project@gmail.com",
     "umershahzad0@gmail.com",
     "admin@buildcost.pk"
   ];
   ```

### 2.2 Server-Side Admin Guard (`adminGuard.ts`)
Every admin route handler (`/api/admin/...`) invokes `verifyAdminAccess()`:
```typescript
export async function verifyAdminAccess(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, status: 401, error: "Authentication required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAuthorized = isSuperAdminEmail(user.email) || profile?.role === "admin" || profile?.role === "superadmin";

  if (!isAuthorized) {
    return { authorized: false, status: 403, error: "Access denied. Administrator privileges required." };
  }

  return { authorized: true, user };
}
```

---

## 3. Administrator Console & Analytics Dashboards

### 3.1 Primary Admin Console (`/admin`)
- **User Management**: Search, filter, view registered Pakistani contractors, inspect verification status.
- **Payment Verification Ledger**: Review uploaded EasyPaisa/JazzCash deposit slips, match bank transaction IDs (TRX), and click-to-approve PRO subscriptions.
- **Market Benchmark Rate Editor**: Update city-level base rates for cement bags, Grade 60 rebar per tonne, bricks per thousand, and sand/crush per truck.

### 3.2 System Control Center (`/admin/control-center`)
- **Feature Flags**: Remotely toggle features (e.g. AI Cost Advisor, Vendor Ledgers, Multi-City Comparison).
- **Promotion & Voucher Engine**: Configure seasonal discount codes for Pakistani engineers and builders.
- **Maintenance / Emergency Mode**: Broadcast maintenance banners across all mobile APKs and web clients.

### 3.3 Live Real-Time Analytics (`/admin/live-analytics`)
- **Active Session Telemetry**: Heartbeat telemetry tracking active users across web and Android mobile APK.
- **Calculation Popularity**: Heatmap of most frequently calculated house configurations (5 Marla double-story, 10 Marla double-story, 1 Kanal luxury).
- **City Distribution**: Analytics showing user activity distribution across Islamabad, Lahore, Karachi, Rawalpindi, and Peshawar.

---

## 4. Immutable Audit Logging (`admin_audit_logs`)

All administrative actions (rate modifications, user status changes, payment approvals) are written to `public.admin_audit_logs`:
- `id` (UUID)
- `admin_id` (UUID of the executing admin)
- `action_type` (e.g., `RATE_OVERRIDE`, `PRO_UPGRADE_APPROVED`, `FEATURE_FLAG_CHANGE`)
- `target_entity` (Entity ID or table name)
- `payload_diff` (JSONB storing previous vs. new values)
- `ip_address`, `user_agent`
- `created_at` (Immutable timestamp)

*RLS strictly restricts `admin_audit_logs` to superadmin read-only access, preventing tampering with audit trails.*
