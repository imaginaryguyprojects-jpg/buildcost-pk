package pk.buildcost.app;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.webkit.WebView;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

import java.util.Collections;

/**
 * AdMobManager — Production Google Mobile Ads integration for BuildCost.pk
 * 
 * Rules:
 * 1. FREE users see non-intrusive anchored adaptive banners at screen base.
 * 2. PRO users NEVER see any ads (verified against backend token / Supabase state).
 * 3. Interstitial ads are shown only at natural transitions (e.g. calculation completed)
 *    with a strict cooldown window (default 90s).
 * 4. Rewarded ads provide temporary advanced calculation access for FREE users without
 *    compromising permanent PRO entitlement.
 * 5. Uses official Google test ad units during development/testing.
 */
public class AdMobManager {

    private static final String TAG = "AdMobManager";
    private static final long INTERSTITIAL_COOLDOWN_MS = 90_000; // 90 seconds cooldown

    private final Activity activity;
    private final FrameLayout bannerContainer;
    private final WebView webView;
    private final Handler mainHandler;

    private boolean isInitialized = false;
    private boolean isProUser = false;
    private AdView adView;
    private InterstitialAd interstitialAd;
    private RewardedAd rewardedAd;

    private boolean isInterstitialLoading = false;
    private boolean isRewardedLoading = false;
    private long lastInterstitialShowTime = 0;

    public AdMobManager(@NonNull Activity activity, @NonNull FrameLayout bannerContainer, @NonNull WebView webView) {
        this.activity = activity;
        this.bannerContainer = bannerContainer;
        this.webView = webView;
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    /**
     * Initializes Google Mobile Ads SDK on a background thread.
     */
    public void initialize() {
        if (isInitialized) return;

        // Configure test device policy for debug builds
        boolean isDebug = (activity.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (isDebug) {
            RequestConfiguration requestConfiguration = new RequestConfiguration.Builder()
                    .setTestDeviceIds(Collections.singletonList(AdRequest.DEVICE_ID_EMULATOR))
                    .build();
            MobileAds.setRequestConfiguration(requestConfiguration);
        }

        MobileAds.initialize(activity, new OnInitializationCompleteListener() {
            @Override
            public void onInitializationComplete(@NonNull InitializationStatus initializationStatus) {
                isInitialized = true;
                Log.d(TAG, "Google Mobile Ads SDK initialized successfully");
                
                mainHandler.post(() -> {
                    if (!isProUser) {
                        loadAdaptiveBanner();
                        preloadInterstitial();
                        preloadRewarded();
                    }
                });
            }
        });
    }

    /**
     * Updates Pro entitlement verified by server/Supabase.
     * When isPro is true, all ad views are destroyed, containers collapsed,
     * and fullscreen ad requests are strictly rejected.
     */
    public void setProEntitlement(boolean isPro) {
        this.isProUser = isPro;
        Log.d(TAG, "Pro Entitlement updated: isPro=" + isPro);

        mainHandler.post(() -> {
            if (isPro) {
                hideBanner();
                if (adView != null) {
                    adView.destroy();
                    adView = null;
                }
                interstitialAd = null;
                rewardedAd = null;
            } else {
                if (isInitialized && (adView == null || bannerContainer.getVisibility() != View.VISIBLE)) {
                    loadAdaptiveBanner();
                    preloadInterstitial();
                }
            }
        });
    }

    public boolean isPro() {
        return isProUser;
    }

    // ==========================================
    // ANCHORED ADAPTIVE BANNER
    // ==========================================

    public void loadAdaptiveBanner() {
        if (isProUser || !isInitialized) return;

        mainHandler.post(() -> {
            try {
                if (adView != null) {
                    bannerContainer.removeView(adView);
                    adView.destroy();
                    adView = null;
                }

                adView = new AdView(activity);
                adView.setAdUnitId(BuildConfig.ADMOB_BANNER_ID);
                bannerContainer.removeAllViews();
                bannerContainer.addView(adView);

                AdSize adSize = getAdaptiveAdSize();
                adView.setAdSize(adSize);

                adView.setAdListener(new AdListener() {
                    @Override
                    public void onAdLoaded() {
                        super.onAdLoaded();
                        Log.d(TAG, "Banner ad loaded");
                        if (!isProUser) {
                            bannerContainer.setVisibility(View.VISIBLE);
                            dispatchWebEvent("ad_impression", "banner");
                        } else {
                            bannerContainer.setVisibility(View.GONE);
                        }
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        super.onAdFailedToLoad(loadAdError);
                        Log.w(TAG, "Banner ad failed to load: " + loadAdError.getMessage());
                        bannerContainer.setVisibility(View.GONE);
                    }

                    @Override
                    public void onAdClicked() {
                        super.onAdClicked();
                        dispatchWebEvent("ad_clicked", "banner");
                    }
                });

                AdRequest adRequest = new AdRequest.Builder().build();
                adView.loadAd(adRequest);

            } catch (Exception e) {
                Log.e(TAG, "Error loading adaptive banner", e);
            }
        });
    }

    public void showBanner() {
        if (isProUser) return;
        mainHandler.post(() -> {
            if (bannerContainer != null && adView != null) {
                bannerContainer.setVisibility(View.VISIBLE);
            } else if (isInitialized) {
                loadAdaptiveBanner();
            }
        });
    }

    public void hideBanner() {
        mainHandler.post(() -> {
            if (bannerContainer != null) {
                bannerContainer.setVisibility(View.GONE);
            }
        });
    }

    private AdSize getAdaptiveAdSize() {
        Display display = activity.getWindowManager().getDefaultDisplay();
        DisplayMetrics outMetrics = new DisplayMetrics();
        display.getMetrics(outMetrics);

        float density = outMetrics.density;
        float adWidthPixels = bannerContainer.getWidth();

        if (adWidthPixels == 0) {
            adWidthPixels = outMetrics.widthPixels;
        }

        int adWidth = (int) (adWidthPixels / density);
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, adWidth);
    }

    // ==========================================
    // INTERSTITIAL ADS (COOLDOWN CONTROLLED)
    // ==========================================

    public void preloadInterstitial() {
        if (isProUser || isInterstitialLoading || interstitialAd != null || !isInitialized) return;

        isInterstitialLoading = true;
        AdRequest adRequest = new AdRequest.Builder().build();

        InterstitialAd.load(
                activity,
                BuildConfig.ADMOB_INTERSTITIAL_ID,
                adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull InterstitialAd ad) {
                        interstitialAd = ad;
                        isInterstitialLoading = false;
                        Log.d(TAG, "Interstitial ad loaded");

                        interstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                interstitialAd = null;
                                lastInterstitialShowTime = System.currentTimeMillis();
                                dispatchWebEvent("ad_closed", "interstitial");
                                preloadInterstitial();
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                                interstitialAd = null;
                                Log.w(TAG, "Interstitial failed to show: " + adError.getMessage());
                                preloadInterstitial();
                            }

                            @Override
                            public void onAdShowedFullScreenContent() {
                                lastInterstitialShowTime = System.currentTimeMillis();
                                dispatchWebEvent("ad_impression", "interstitial");
                            }

                            @Override
                            public void onAdClicked() {
                                dispatchWebEvent("ad_clicked", "interstitial");
                            }
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        interstitialAd = null;
                        isInterstitialLoading = false;
                        Log.w(TAG, "Interstitial ad failed to load: " + loadAdError.getMessage());
                    }
                }
        );
    }

    /**
     * Shows an interstitial ad only if:
     * 1. User is not PRO
     * 2. Cooldown period (90s) has elapsed since last interstitial
     * 3. An ad is preloaded and ready
     */
    public boolean showInterstitial(String trigger) {
        if (isProUser) {
            Log.d(TAG, "Interstitial suppressed: user is PRO");
            return false;
        }

        long currentTime = System.currentTimeMillis();
        if (currentTime - lastInterstitialShowTime < INTERSTITIAL_COOLDOWN_MS) {
            Log.d(TAG, "Interstitial suppressed: cooldown active (" + ((INTERSTITIAL_COOLDOWN_MS - (currentTime - lastInterstitialShowTime)) / 1000) + "s remaining)");
            return false;
        }

        if (interstitialAd != null) {
            mainHandler.post(() -> {
                try {
                    Log.d(TAG, "Showing interstitial ad triggered by: " + trigger);
                    interstitialAd.show(activity);
                } catch (Exception e) {
                    Log.e(TAG, "Error displaying interstitial", e);
                }
            });
            return true;
        } else {
            preloadInterstitial();
            return false;
        }
    }

    // ==========================================
    // REWARDED ADS
    // ==========================================

    public void preloadRewarded() {
        if (isProUser || isRewardedLoading || rewardedAd != null || !isInitialized) return;

        isRewardedLoading = true;
        AdRequest adRequest = new AdRequest.Builder().build();

        RewardedAd.load(
                activity,
                BuildConfig.ADMOB_REWARDED_ID,
                adRequest,
                new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull RewardedAd ad) {
                        rewardedAd = ad;
                        isRewardedLoading = false;
                        Log.d(TAG, "Rewarded ad loaded");

                        rewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                rewardedAd = null;
                                preloadRewarded();
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                                rewardedAd = null;
                                Log.w(TAG, "Rewarded ad failed to show: " + adError.getMessage());
                                preloadRewarded();
                            }

                            @Override
                            public void onAdShowedFullScreenContent() {
                                dispatchWebEvent("ad_impression", "rewarded");
                            }
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        rewardedAd = null;
                        isRewardedLoading = false;
                        Log.w(TAG, "Rewarded ad failed to load: " + loadAdError.getMessage());
                    }
                }
        );
    }

    /**
     * Shows a rewarded ad.
     * When reward is earned, dispatches callback to WebView JS: window.onAdRewardEarned(rewardType, amount)
     */
    public void showRewarded(final String featureId) {
        if (isProUser) {
            // PRO users already have full unlocked features
            notifyRewardEarned(featureId, 1);
            return;
        }

        if (rewardedAd != null) {
            mainHandler.post(() -> {
                try {
                    rewardedAd.show(activity, rewardItem -> {
                        Log.d(TAG, "User earned reward: " + rewardItem.getType() + " x" + rewardItem.getAmount());
                        notifyRewardEarned(featureId, rewardItem.getAmount());
                    });
                } catch (Exception e) {
                    Log.e(TAG, "Error displaying rewarded ad", e);
                }
            });
        } else {
            preloadRewarded();
            mainHandler.post(() -> {
                if (webView != null) {
                    webView.evaluateJavascript("if (window.onAdRewardUnavailable) window.onAdRewardUnavailable('" + featureId + "');", null);
                }
            });
        }
    }

    private void notifyRewardEarned(String featureId, int amount) {
        mainHandler.post(() -> {
            if (webView != null) {
                String js = String.format("if (window.onAdRewardEarned) window.onAdRewardEarned('%s', %d);", featureId, amount);
                webView.evaluateJavascript(js, null);
            }
        });
    }

    private void dispatchWebEvent(String eventName, String adFormat) {
        mainHandler.post(() -> {
            if (webView != null) {
                String js = String.format("if (window.onAdMobEvent) window.onAdMobEvent('%s', '%s');", eventName, adFormat);
                webView.evaluateJavascript(js, null);
            }
        });
    }

    public void onResume() {
        if (adView != null) adView.resume();
    }

    public void onPause() {
        if (adView != null) adView.pause();
    }

    public void onDestroy() {
        if (adView != null) {
            adView.destroy();
            adView = null;
        }
    }
}
