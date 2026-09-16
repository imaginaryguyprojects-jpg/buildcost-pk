# Android Security & Entitlement Final Report — BuildCost PK v3.0.0

---

## 1. Authentication Security Hardening

- **Google OAuth & Email/Password**: Unified under Supabase Identity.
- **Zero Bypass / Fake Login**: All authentication attempts must pass cryptographic verification on Supabase servers. Fake demo logins and local token forgery are strictly rejected.
- **Wrong Credentials Enforcement**: Invalid passwords immediately return user-facing error notices without leaking account existence timing.
- **Forgot Password Flow**: Secure recovery emails sent through official SMTP. Password reset requires verified token authentication.
- **Biometric Protection**: Utilizes Android BiometricPrompt (`androidx.biometric:biometric:1.1.0`) with hardware-backed keystore integration for quick, secure unlocking.

---

## 2. Server-Side Entitlement & Anti-Tamper Policy

- **No Trust in Local State**: Entitlement is never determined solely by `localStorage`, `SharedPreferences`, or boolean variables like `isPro`.
- **Database Row Verification**: Pro status requires an active profile record in the Supabase database where `is_pro == true` and `pro_expires_at > NOW()`.
- **Ad Suppression Integrity**: The native AdMob bridge receives confirmed database state before removing banner containers or suppressing full-screen interstitial ads.

---

## 3. Network & Transport Security

- **Strict HTTPS**: Cleartext HTTP is restricted. All Supabase database sync, authentication, and update calls use TLS 1.3.
- **No Exposed Secrets**:
  - Service-role keys are strictly banned from client builds.
  - Keystore passwords and alias secrets are protected in Gradle signing configurations and excluded from public logs.
- **Safe Diagnostics**: Support tickets and analytics events strip any sensitive fields (passwords, JWT tokens, personal billing info) before dispatch.
