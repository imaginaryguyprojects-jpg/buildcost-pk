# Google AdMob Monetization & Entitlement Report — BuildCost PK v3.0.0

**Module**: Google Mobile Ads SDK (`com.google.android.gms:play-services-ads:23.3.0`)  
**AdMob Application ID (Test)**: `ca-app-pub-3940256099942544~3347511713`  
**Configuration Strategy**: Gradle `resValue` and `buildConfigField` with dynamic Gradle Property injection  

---

## 1. Supported Ad Formats & UX Guardrails

### A. Anchored Adaptive Banner
- **Location**: Anchored at the bottom of the screen (`FrameLayout` with id `adBannerContainer`).
- **Layout Safety**: The primary `SwipeRefreshLayout` / `WebView` container is anchored with `android:layout_above="@id/adBannerContainer"`. The banner **never** covers the Calculate button, input sliders, material results, bottom navigation, or PRO upgrade prompts.
- **Adaptive Sizing**: Dynamic orientation and width calculation using `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, adWidth)`.

### B. Interstitial Ads (Cooldown Controlled)
- **Natural Transitions**: Interstitial ads are shown only after significant user actions (e.g. calculation completed, moving between major calculator modules).
- **Cooldown Policy**: Strict 90-second minimum cooldown (`INTERSTITIAL_COOLDOWN_MS = 90_000`). If triggered before 90 seconds have elapsed, the request is silently suppressed.
- **Preloading**: Ads are preloaded asynchronously on background threads so that transitions remain smooth.

### C. Rewarded Ads (Safe Opt-in)
- **Use Case**: Allows FREE users to watch an ad to unlock one temporary extra calculation or advanced layout preview.
- **Entitlement Isolation**: Rewarded ads **never** grant permanent PRO status. They provide a temporary single-use perk with official callback confirmation via `onUserEarnedReward`.

---

## 2. Server-Side Entitlement & PRO Protection

BuildCost PK strictly rejects client-only flags (such as `localStorage.isPro = true` or URL parameters) for advertising control:

1. **Database Authority**: PRO subscription status is determined by Supabase `profiles` table matching the authenticated user's ID (`is_pro = true` and `pro_expires_at > Date.now()`).
2. **Immediate Destruction**: When `useAuthStore` verifies PRO entitlement, it invokes `syncProStatusWithNative(true)`:
   - Native banner is immediately hidden (`bannerContainer.setVisibility(View.GONE)`).
   - Active `AdView` is destroyed and removed from the view hierarchy.
   - All subsequent interstitial and rewarded ad requests return `false` immediately without contacting Google AdMob servers.

---

## 3. Production Configuration Guide

To deploy production AdMob IDs without modifying any source code:
Supply the following Gradle properties in your CI/CD environment or `android/gradle.properties`:

```properties
ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```
Or via Gradle CLI:
```bash
./gradlew bundleRelease -PADMOB_APP_ID="ca-app-pub-..." -PADMOB_BANNER_ID="ca-app-pub-..."
```
During development and local testing, Google test IDs are used automatically to prevent invalid traffic penalties.
