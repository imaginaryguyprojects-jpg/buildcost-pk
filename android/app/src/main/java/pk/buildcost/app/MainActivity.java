package pk.buildcost.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import java.util.concurrent.Executor;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends AppCompatActivity {

    public static final String LOCAL_ORIGIN = "https://appassets.androidplatform.net";
    public static final String DEFAULT_URL = "https://appassets.androidplatform.net/index.html";
    private static final String PREFS_NAME = "BuildCostPrefs";
    private static final String KEY_CUSTOM_URL = "custom_url";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout offlineContainer;
    private Button btnRetry;
    private View splashContainer;
    private FrameLayout adBannerContainer;

    private AdMobManager adMobManager;
    private PlayUpdateManager playUpdateManager;

    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> filePickerLauncher;
    private WebViewAssetLoader assetLoader;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupAssetLoader();
        setupFilePicker();
        setupWebView();
        setupBackNavigation();

        adMobManager = new AdMobManager(this, adBannerContainer, webView);
        adMobManager.initialize();

        playUpdateManager = new PlayUpdateManager(this, webView);
        playUpdateManager.initialize();

        loadTargetUrl();
        OtaUpdateManager.checkForUpdates(this, webView);
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        offlineContainer = findViewById(R.id.offlineContainer);
        btnRetry = findViewById(R.id.btnRetry);
        splashContainer = findViewById(R.id.splashContainer);
        adBannerContainer = findViewById(R.id.adBannerContainer);

        swipeRefresh.setColorSchemeColors(0xFF059669);
        swipeRefresh.setOnRefreshListener(() -> {
            offlineContainer.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.reload();
        });

        btnRetry.setOnClickListener(v -> {
            offlineContainer.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            loadTargetUrl();
        });

        // Developer URL config override by long-pressing retry (Debug builds only)
        btnRetry.setOnLongClickListener(v -> {
            boolean isDebug = (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
            if (isDebug) {
                showUrlConfigDialog();
            }
            return true;
        });
    }

    private WebResourceResponse createResponse(String mimeType, InputStream is) {
        if (is == null) return null;
        java.util.Map<String, String> headers = new java.util.HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "*");
        headers.put("Cache-Control", "no-cache");
        return new WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, is);
    }

    private void setupAssetLoader() {
        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/", new WebViewAssetLoader.PathHandler() {
                    @Override
                    public WebResourceResponse handle(String path) {
                        try {
                            String cleanPath = path;
                            if (cleanPath.startsWith("/")) {
                                cleanPath = cleanPath.substring(1);
                            }
                            if (cleanPath.isEmpty()) {
                                cleanPath = "index.html";
                            }

                            // PRIORITY 1: Check OTA Live Hot-Patch file first (if applied)
                            File otaFile = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath);
                            if (otaFile != null && otaFile.isFile()) {
                                return createResponse(getMimeType(cleanPath), new FileInputStream(otaFile));
                            }

                            // Check OTA directory index
                            if (cleanPath.endsWith("/")) {
                                File otaIndex = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + "index.html");
                                if (otaIndex != null && otaIndex.isFile()) {
                                    return createResponse("text/html", new FileInputStream(otaIndex));
                                }
                            } else {
                                File otaIndex = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + "/index.html");
                                if (otaIndex != null && otaIndex.isFile()) {
                                    return createResponse("text/html", new FileInputStream(otaIndex));
                                }
                                File otaHtml = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + ".html");
                                if (otaHtml != null && otaHtml.isFile()) {
                                    return createResponse("text/html", new FileInputStream(otaHtml));
                                }
                            }

                            // PRIORITY 2: Fall back to factory bundled APK assets
                            String assetPath = "www/" + cleanPath;
                            AssetManager am = getAssets();

                            // 1. Try exact asset file
                            try {
                                InputStream is = am.open(assetPath);
                                return createResponse(getMimeType(assetPath), is);
                            } catch (IOException ignored) {}

                            // Special Next.js chunk / css resolution (handles nested route relative paths)
                            if (cleanPath.contains("_next/")) {
                                try {
                                    String sub = cleanPath.substring(cleanPath.indexOf("_next/"));
                                    return createResponse(getMimeType(sub), am.open("www/" + sub));
                                } catch (IOException ignored) {}
                            }
                            if (cleanPath.contains("next/")) {
                                try {
                                    String sub = cleanPath.substring(cleanPath.indexOf("next/"));
                                    return createResponse(getMimeType(sub), am.open("www/" + sub));
                                } catch (IOException ignored) {}
                            }

                            // 2. Try directory index (e.g. /calculator/ -> www/calculator/index.html)
                            if (cleanPath.endsWith("/")) {
                                try {
                                    InputStream is = am.open(assetPath + "index.html");
                                    return createResponse("text/html", is);
                                } catch (IOException ignored) {}
                            } else {
                                try {
                                    InputStream is = am.open(assetPath + "/index.html");
                                    return createResponse("text/html", is);
                                } catch (IOException ignored) {}
                                try {
                                    InputStream is = am.open(assetPath + ".html");
                                    return createResponse("text/html", is);
                                } catch (IOException ignored) {}
                            }

                            // PRIORITY 3: Client-side SPA fallback (OTA index.html first, then bundled index.html)
                            File otaSpaFallback = OtaUpdateManager.getOtaFile(MainActivity.this, "index.html");
                            if (otaSpaFallback != null && otaSpaFallback.isFile()) {
                                return createResponse("text/html", new FileInputStream(otaSpaFallback));
                            }

                            try {
                                InputStream is = am.open("www/index.html");
                                return createResponse("text/html", is);
                            } catch (IOException ignored) {}

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return null;
                    }
                })
                .build();
    }

    private String getMimeType(String path) {
        if (path.endsWith(".html") || path.endsWith(".htm")) return "text/html";
        if (path.endsWith(".js") || path.endsWith(".mjs")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        if (path.endsWith(".svg")) return "image/svg+xml";
        if (path.endsWith(".webp")) return "image/webp";
        if (path.endsWith(".woff2")) return "font/woff2";
        if (path.endsWith(".woff")) return "font/woff";
        if (path.endsWith(".ttf")) return "font/ttf";
        if (path.endsWith(".ico")) return "image/x-icon";
        String ext = MimeTypeMap.getFileExtensionFromUrl(path);
        if (ext != null) {
            String type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
            if (type != null) return type;
        }
        return "application/octet-stream";
    }

    private void setupFilePicker() {
        filePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (fileUploadCallback != null) {
                        Uri[] results = null;
                        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                            if (result.getData().getClipData() != null) {
                                int count = result.getData().getClipData().getItemCount();
                                results = new Uri[count];
                                for (int i = 0; i < count; i++) {
                                    results[i] = result.getData().getClipData().getItemAt(i).getUri();
                                }
                            } else if (result.getData().getData() != null) {
                                results = new Uri[]{result.getData().getData()};
                            }
                        }
                        fileUploadCallback.onReceiveValue(results);
                        fileUploadCallback = null;
                    }
                }
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        try {
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
        } catch (Exception ignored) {}
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Custom user agent identifier for offline Android app
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " BuildCostApp/3.0.0 (Android)");

        // Register Native JavaScript Bridges
        webView.addJavascriptInterface(new BiometricBridge(this), "AndroidBiometrics");
        webView.addJavascriptInterface(new AdsBridge(adMobManager), "AndroidAds");
        webView.addJavascriptInterface(new PlayUpdateBridge(playUpdateManager), "AndroidUpdates");
        webView.addJavascriptInterface(new AnalyticsBridge(this), "AndroidAnalytics");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                    swipeRefresh.setRefreshing(false);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                }
                fileUploadCallback = filePathCallback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    filePickerLauncher.launch(intent);
                } catch (ActivityNotFoundException e) {
                    fileUploadCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file chooser", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Handle system schemes (WhatsApp, phone calls, email)
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") || url.startsWith("intent:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "No app available to handle this request", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }

                return false;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equals(uri.getHost())) {
                    return assetLoader.shouldInterceptRequest(uri);
                }
                // Allow network requests (such as Supabase database sync) to proceed normally
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
                progressBar.setVisibility(View.GONE);

                // Smoothly fade out the splash screen once DOM has finished parsing and styling
                if (splashContainer != null && splashContainer.getVisibility() == View.VISIBLE) {
                    splashContainer.animate()
                            .alpha(0f)
                            .setDuration(350)
                            .withEndAction(() -> splashContainer.setVisibility(View.GONE));
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    swipeRefresh.setRefreshing(false);
                    // Only show offline container if an external live URL was explicitly configured and failed
                    if (!request.getUrl().toString().contains("appassets.androidplatform.net")) {
                        webView.setVisibility(View.GONE);
                        offlineContainer.setVisibility(View.VISIBLE);
                    }
                }
            }
        });
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });
    }

    private void loadTargetUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String url = prefs.getString(KEY_CUSTOM_URL, DEFAULT_URL);

        // Automatically upgrade any remote URL to the self-contained offline bundle
        if (url != null && url.contains("vercel.app")) {
            url = DEFAULT_URL;
            prefs.edit().putString(KEY_CUSTOM_URL, DEFAULT_URL).apply();
        }

        webView.setVisibility(View.VISIBLE);
        offlineContainer.setVisibility(View.GONE);
        webView.loadUrl(url);
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        }
        return false;
    }

    private void showUrlConfigDialog() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String currentUrl = prefs.getString(KEY_CUSTOM_URL, DEFAULT_URL);

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Application Target Source");

        final EditText input = new EditText(this);
        input.setText(currentUrl);
        input.setHint(DEFAULT_URL);
        builder.setView(input);

        builder.setPositiveButton("Save", (dialog, which) -> {
            String newUrl = input.getText().toString().trim();
            if (!newUrl.isEmpty()) {
                prefs.edit().putString(KEY_CUSTOM_URL, newUrl).apply();
                webView.loadUrl(newUrl);
            }
        });

        builder.setNeutralButton("Reset Offline Bundle", (dialog, which) -> {
            prefs.edit().remove(KEY_CUSTOM_URL).apply();
            webView.loadUrl(DEFAULT_URL);
        });

        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }

    public static class BiometricBridge {
        private final MainActivity activity;

        public BiometricBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public boolean isBiometricAvailable() {
            try {
                BiometricManager biometricManager = BiometricManager.from(activity);
                int canAuthenticate = biometricManager.canAuthenticate(
                        BiometricManager.Authenticators.BIOMETRIC_STRONG |
                        BiometricManager.Authenticators.BIOMETRIC_WEAK |
                        BiometricManager.Authenticators.DEVICE_CREDENTIAL
                );
                return canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void saveSecureToken(String key, String value) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                prefs.edit().putString("sec_" + key, value).apply();
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public String getSecureToken(String key) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                return prefs.getString("sec_" + key, null);
            } catch (Exception e) {
                return null;
            }
        }

        @JavascriptInterface
        public void removeSecureToken(String key) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                prefs.edit().remove("sec_" + key).apply();
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public boolean authenticate(String title, String subtitle) {
            final boolean[] resultHolder = new boolean[]{false};
            final Object lock = new Object();

            activity.runOnUiThread(() -> {
                try {
                    Executor executor = ContextCompat.getMainExecutor(activity);
                    BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                            .setTitle(title != null && !title.isEmpty() ? title : "Unlock BuildCost PK")
                            .setSubtitle(subtitle != null && !subtitle.isEmpty() ? subtitle : "Confirm fingerprint or screen lock")
                            .setNegativeButtonText("Cancel")
                            .build();

                    BiometricPrompt biometricPrompt = new BiometricPrompt(activity, executor,
                            new BiometricPrompt.AuthenticationCallback() {
                                @Override
                                public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                                    super.onAuthenticationSucceeded(result);
                                    synchronized (lock) {
                                        resultHolder[0] = true;
                                        lock.notifyAll();
                                    }
                                }

                                @Override
                                public void onAuthenticationError(int errorCode, CharSequence errString) {
                                    super.onAuthenticationError(errorCode, errString);
                                    synchronized (lock) {
                                        resultHolder[0] = false;
                                        lock.notifyAll();
                                    }
                                }

                                @Override
                                public void onAuthenticationFailed() {
                                    super.onAuthenticationFailed();
                                }
                            });

                    biometricPrompt.authenticate(promptInfo);
                } catch (Exception e) {
                    synchronized (lock) {
                        resultHolder[0] = false;
                        lock.notifyAll();
                    }
                }
            });

            synchronized (lock) {
                try {
                    lock.wait(60000);
                } catch (InterruptedException ignored) {}
            }

            return resultHolder[0];
        }
    }

    public static class AdsBridge {
        private final AdMobManager adMobManager;

        public AdsBridge(AdMobManager adMobManager) {
            this.adMobManager = adMobManager;
        }

        @JavascriptInterface
        public void showBanner() {
            if (adMobManager != null) adMobManager.showBanner();
        }

        @JavascriptInterface
        public void hideBanner() {
            if (adMobManager != null) adMobManager.hideBanner();
        }

        @JavascriptInterface
        public boolean showInterstitial(String trigger) {
            return adMobManager != null && adMobManager.showInterstitial(trigger);
        }

        @JavascriptInterface
        public void showRewarded(String featureId) {
            if (adMobManager != null) adMobManager.showRewarded(featureId);
        }

        @JavascriptInterface
        public void setProStatus(boolean isPro) {
            if (adMobManager != null) adMobManager.setProEntitlement(isPro);
        }

        @JavascriptInterface
        public boolean isPro() {
            return adMobManager != null && adMobManager.isPro();
        }
    }

    public static class PlayUpdateBridge {
        private final PlayUpdateManager playUpdateManager;

        public PlayUpdateBridge(PlayUpdateManager playUpdateManager) {
            this.playUpdateManager = playUpdateManager;
        }

        @JavascriptInterface
        public void checkForUpdate(boolean isMandatory) {
            if (playUpdateManager != null) playUpdateManager.checkForUpdates(isMandatory);
        }

        @JavascriptInterface
        public void startUpdate(int updateType) {
            if (playUpdateManager != null) playUpdateManager.startUpdate(updateType);
        }

        @JavascriptInterface
        public void completeUpdate() {
            if (playUpdateManager != null) playUpdateManager.completeUpdate();
        }
    }

    public static class AnalyticsBridge {
        private final Context context;

        public AnalyticsBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void logEvent(String eventName, String paramsJson) {
            android.util.Log.i("BuildCostAnalytics", "[EVENT] " + eventName + ": " + (paramsJson != null ? paramsJson : "{}"));
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (adMobManager != null) adMobManager.onResume();
        if (playUpdateManager != null) playUpdateManager.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (adMobManager != null) adMobManager.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (adMobManager != null) adMobManager.onDestroy();
        if (playUpdateManager != null) playUpdateManager.onDestroy();
    }
}
