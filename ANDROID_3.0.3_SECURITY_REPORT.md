# Android Security & Entitlement Audit — BuildCost.pk v3.0.3

**Date**: September 17, 2026  
**Status**: PASS — FULLY HARDENED  

---

## 1. Cryptographic Signing & Keystore Integrity
- **Keystore**: `android/app/release-key.jks`
- **Key Alias**: `buildcost-key`
- **Key Algorithm**: 2048-bit RSA with SHA384withRSA
- **Signer DN**: `CN=Umer Shahzad, OU=BuildCost, O=BuildCostPK, L=Rawalpindi, ST=Punjab, C=PK`
- **Certificate SHA-256**: `3e026e3532b7a58e73321b803eedca4541d3f199625b375bae93e8e332d9bb1c`
- **Validity**: Valid until Saturday, January 31, 2054
- **Verification Scheme**: APK Signature Scheme v2 (Full binary protection against tampering)

---

## 2. Server-Side Entitlement & Anti-Bypass Review
- **PRO Subscription Enforcement**:
  - The client UI queries Supabase `profiles` table for `subscription_tier = 'pro'`.
  - Row Level Security (RLS) policies on Supabase prevent unauthorized access to premium data.
  - Native AdMob destroys ads only after verified state is received from the server.
- **Zero Hardcoded Secrets**:
  - No Supabase service-role keys are bundled in the APK or AAB.
  - Keystore passwords and private signing credentials are not committed to git.

---

## 3. Permissions & Network Security
- **Permissions Declared**:
  - `INTERNET` (Required for cloud sync and live rates)
  - `ACCESS_NETWORK_STATE` (Required for online/offline detection)
  - `USE_BIOMETRIC` & `USE_FINGERPRINT` (Biometric app unlock)
  - `POST_NOTIFICATIONS` (Rate alerts and in-app update status)
  - `com.google.android.gms.permission.AD_ID` (Google Mobile Ads)
- **Network Security**: Uses HTTPS exclusively with custom `network_security_config.xml`.
