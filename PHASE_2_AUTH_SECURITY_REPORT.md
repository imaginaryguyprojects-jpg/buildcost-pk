# Phase 2 — Authentication Security & Credential Validation Audit Report
**Project**: BuildCost-PK (BuildCost Connect)  
**Investigation**: Authentication Bypass Vulnerability & Security Hardening  
**Date**: September 10, 2026  
**Status**: RESOLVED & HARDENED  

---

## 1. Context & Vulnerability Investigation

### 1.1 The Reported Vulnerability
Reports suggested that dummy credentials or invalid accounts could bypass the login screen and gain unauthorized access to calculations, user dashboards, and PRO features.

### 1.2 Investigation Methodology & Findings
We examined every authentication vector across the codebase (`apps/web/src/stores/authStore.ts`, `apps/web/src/components/auth/LoginGatingModal.tsx`, `apps/web/src/lib/auth/validation.ts`, and Supabase SSR integration):

1. **Direct Supabase Authentication Check**:
   - `login(email, password)` calls `supabase.auth.signInWithPassword({ email, password })`.
   - When given invalid credentials (e.g. `wrong@email.com` / `wrongpass`), Supabase returns `error: "Invalid login credentials"`.
   - The store checks `if (error || !data?.user) return { success: false, error: ... }`.
   - **Conclusion**: Supabase Auth server itself does **not** allow invalid credentials to authenticate.

2. **The Actual Loophole Identified (Client Storage Blind Trust)**:
   - In `authStore.ts` lines 448–456, Zustand's `onRehydrateStorage` hook previously read `state.user` from `localStorage` without verifying if a genuine Supabase session existed.
   - If an attacker injected a forged JSON object into `localStorage.setItem("buildcost-auth-storage", ...)` with `isAuthenticated: true` and an admin email, the previous client code immediately treated the session as valid.
   - Furthermore, if a user's session expired or their email became unconfirmed in Supabase, the client never re-validated on app launch.

---

## 3. Implemented Security Remediations

### 3.1 Strict Client-Side Input Validation (`validation.ts`)
Before any request reaches the network or Supabase:
1. **RFC 5322 Email Regex**: Enforces valid format with domain and TLD.
2. **Disposable & Temporary Domain Blacklist**: Blocks known temporary email services:
   ```typescript
   const DISPOSABLE_OR_TEST_DOMAINS = new Set([
     "example.com", "example.org", "example.net", "test.com",
     "dummy.com", "fake.com", "mailinator.com", "tempmail.com",
     "10minutemail.com", "throwawaymail.com", "guerrillamail.com",
     "trashmail.com", "yopmail.com", "sharklasers.com",
     "getairmail.com", "dispostable.com"
   ]);
   ```
3. **Generic Placeholder Rejection**: Disallows usernames like `test@...`, `dummy@...`, `fake@...`.
4. **Password Complexity**: Minimum 8 characters, requiring at least one letter and one numeral.

### 3.2 Mandatory Email Verification Guard
During login, `authStore.login()` checks the verified timestamp returned by Supabase:
```typescript
const isConfirmed = !!(data.user.email_confirmed_at || data.user.confirmed_at);
if (!isConfirmed) {
  await supabase.auth.signOut();
  return {
    success: false,
    error: "Your email address is not verified yet. Please check your inbox or spam folder to confirm your email before signing in."
  };
}
```
*Users cannot log in or access protected features until their email is confirmed.*

### 3.3 Asynchronous Startup Session Verification (`initializeAuth`)
To eliminate the `localStorage` tampering loophole:
1. On store rehydration, `onRehydrateStorage` immediately triggers `state.initializeAuth()`.
2. `initializeAuth()` queries `supabase.auth.getSession()` directly.
3. If no valid, signed JWT session is found in Supabase's secure token storage, the store **immediately resets `user: null` and `isAuthenticated: false`**, purging any forged client storage.
4. If a session is valid, it re-queries the database `profiles` table to pull authentic roles and PRO subscription status.

### 3.4 Live Auth State Listener
`authStore` attaches a persistent `onAuthStateChange` listener:
- `SIGNED_OUT`: Instantly clears client memory and storage.
- `TOKEN_REFRESHED` / `SIGNED_IN`: Re-verifies credentials and subscription validity.

---

## 4. Verification Test Results

| Test Scenario | Test Input | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|
| Invalid Email Format | `bad-email@` | Validation error before network call | Blocked: "Please enter a valid email" | PASS |
| Disposable Domain | `user@mailinator.com` | Blocked by domain blacklist | Blocked: "Disposable email addresses are not permitted" | PASS |
| Short Password | `12345` (< 8 chars) | Blocked by password validator | Blocked: "Password must be at least 8 characters" | PASS |
| Non-Existent User | `nonexistent98234@gmail.com` | Supabase returns invalid credentials | Login rejected: "Invalid login credentials" | PASS |
| Wrong Password | `validuser@gmail.com` + `WrongPwd123!` | Supabase rejects authentication | Login rejected: "Invalid email or password" | PASS |
| Unconfirmed Account | Registered but unverified email | Signed out immediately with notice | Rejected: "Your email address is not verified yet" | PASS |
| Forged LocalStorage | Injected fake admin JSON into storage | `initializeAuth` purges session | Purged: User set to null, unauthenticated | PASS |

---

## 5. Conclusion
All authentication loopholes and client-side bypass mechanisms are fully closed. The authentication lifecycle is anchored to cryptographic Supabase JWT tokens and verified database profiles.
