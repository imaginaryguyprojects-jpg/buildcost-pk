/**
 * adsService.ts — Google Mobile Ads (AdMob) & Native Bridge Integration
 * 
 * Enforces strict entitlement rules:
 * - FREE users see anchored adaptive banners and non-intrusive transition interstitials.
 * - PRO users NEVER see advertisements (enforced server-side via Supabase profiles).
 * - Safe fallback when running in a desktop browser or PWA.
 */

declare global {
  interface Window {
    AndroidAds?: {
      showBanner: () => void;
      hideBanner: () => void;
      showInterstitial: (trigger: string) => boolean;
      showRewarded: (featureId: string) => void;
      setProStatus: (isPro: boolean) => void;
      isPro: () => boolean;
    };
    AndroidUpdates?: {
      checkForUpdate: (isMandatory: boolean) => void;
      startUpdate: (updateType: number) => void;
      completeUpdate: () => void;
    };
    AndroidAnalytics?: {
      logEvent: (eventName: string, paramsJson: string) => void;
    };
    onAdRewardEarned?: (featureId: string, amount: number) => void;
    onAdRewardUnavailable?: (featureId: string) => void;
    onAdMobEvent?: (eventName: string, adFormat: string) => void;
  }
}

// Active listeners for rewarded ads
const rewardListeners = new Map<string, (amount: number) => void>();

// Initialize reward listeners once
if (typeof window !== "undefined") {
  window.onAdRewardEarned = (featureId: string, amount: number) => {
    const callback = rewardListeners.get(featureId);
    if (callback) {
      callback(amount);
      rewardListeners.delete(featureId);
    }
    logAnalyticsEvent("reward_earned", { featureId, amount });
  };

  window.onAdRewardUnavailable = (featureId: string) => {
    rewardListeners.delete(featureId);
    console.info("Rewarded ad not available currently for feature:", featureId);
  };

  window.onAdMobEvent = (eventName: string, adFormat: string) => {
    logAnalyticsEvent(eventName, { format: adFormat });
  };
}

/**
 * Synchronizes Pro status to the native Android AdMob manager.
 * If user is Pro, immediately collapses all banners and blocks interstitials.
 */
export function syncProStatusWithNative(isPro: boolean): void {
  if (typeof window === "undefined" || !window.AndroidAds) return;
  try {
    window.AndroidAds.setProStatus(isPro);
  } catch (err) {
    console.warn("Failed to notify native ads bridge:", err);
  }
}

/**
 * Shows the anchored adaptive banner at the bottom of the screen (Free users only).
 */
export function showBannerAd(): void {
  if (typeof window === "undefined" || !window.AndroidAds) return;
  try {
    window.AndroidAds.showBanner();
  } catch (err) {
    console.warn("Failed to show banner ad:", err);
  }
}

/**
 * Hides the bottom banner ad.
 */
export function hideBannerAd(): void {
  if (typeof window === "undefined" || !window.AndroidAds) return;
  try {
    window.AndroidAds.hideBanner();
  } catch (err) {
    console.warn("Failed to hide banner ad:", err);
  }
}

/**
 * Shows an interstitial ad at a natural transition (e.g. calculation completed).
 * Controlled by a native 90s cooldown timer.
 */
export function showInterstitialAd(trigger: string = "general_transition"): boolean {
  if (typeof window === "undefined" || !window.AndroidAds) return false;
  try {
    const shown = window.AndroidAds.showInterstitial(trigger);
    if (shown) {
      logAnalyticsEvent("ad_interstitial_triggered", { trigger });
    }
    return shown;
  } catch (err) {
    console.warn("Failed to request interstitial ad:", err);
    return false;
  }
}

/**
 * Presents a rewarded ad (e.g., watch an ad for 1 temporary extra calculation).
 */
export function showRewardedAd(featureId: string, onReward?: (amount: number) => void): void {
  if (onReward) {
    rewardListeners.set(featureId, onReward);
  }

  if (typeof window === "undefined" || !window.AndroidAds) {
    // If running in browser or preview, immediately grant fallback access
    if (onReward) onReward(1);
    return;
  }

  try {
    window.AndroidAds.showRewarded(featureId);
    logAnalyticsEvent("ad_rewarded_requested", { featureId });
  } catch (err) {
    console.warn("Failed to show rewarded ad:", err);
    if (onReward) onReward(1);
  }
}

/**
 * Privacy-conscious analytics logger connecting to native Android bridge
 */
export function logAnalyticsEvent(eventName: string, params: Record<string, any> = {}): void {
  try {
    if (typeof window !== "undefined" && window.AndroidAnalytics) {
      window.AndroidAnalytics.logEvent(eventName, JSON.stringify(params));
    }
  } catch (err) {
    // Silently ignore telemetry logging errors
  }
}
