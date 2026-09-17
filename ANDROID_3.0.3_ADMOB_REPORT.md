# Google AdMob Monetization Report — BuildCost.pk v3.0.3

**Date**: September 17, 2026  
**AdMob SDK**: `com.google.android.gms:play-services-ads:23.3.0`  
**Status**: PASS — FULLY INTEGRATED & CONFIGURED  

---

## 1. Ad Format Implementation & Placement

| Ad Format | Native Component | Placement & Rules | Cooldown / Guard |
| :--- | :--- | :--- | :--- |
| **Anchored Adaptive Banner** | `com.google.android.gms.ads.AdView` | Anchored at bottom of `activity_main.xml` in dedicated `FrameLayout` with `layout_above` preventing overlap | Destroyed immediately when user has active PRO subscription. |
| **Interstitial Ad** | `com.google.android.gms.ads.interstitial.InterstitialAd` | Preloaded on app launch; shown upon calculation completion | Strict **90-second minimum cooldown** between displays. |
| **Rewarded Ad** | `com.google.android.gms.ads.rewarded.RewardedAd` | Preloaded on app launch; unlocks temporary layout access | Rewards temporary access without modifying server PRO tier. |

---

## 2. Server-Verified PRO Ad-Free Immunity

- **Verification Source**: Supabase Auth session token + `profiles.subscription_tier`.
- **Bridge Sync**: `window.AndroidAds.setProStatus(isPro)` executed on auth initialization, login, and refresh.
- **Native Safeguard**:
  ```java
  public void setProEntitlement(boolean isPro) {
      this.isProUser = isPro;
      if (isPro) {
          destroyBanner();
          if (interstitialAd != null) interstitialAd = null;
          if (rewardedAd != null) rewardedAd = null;
      }
  }
  ```
- **Verified**: PRO subscribers experience **zero ads**, zero banner rendering, and zero network calls to ad servers.

---

## 3. Ad Unit Identification & Environment Guards
- **Development / Debug Mode**: Official Google Test Unit IDs configured by default.
  - App ID: `ca-app-pub-3940256099942544~3347511713`
  - Banner: `ca-app-pub-3940256099942544/9214589741`
  - Interstitial: `ca-app-pub-3940256099942544/1033173712`
  - Rewarded: `ca-app-pub-3940256099942544/5224354917`
- **Production Mode**: Production ad unit IDs injected via Gradle properties or command-line properties (`-PADMOB_APP_ID=...`).
