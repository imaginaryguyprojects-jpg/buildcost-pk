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
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
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

        loadTargetUrl();
        OtaUpdateManager.checkForUpdates(this, webView);
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        offlineContainer = findViewById(R.id.offlineContainer);
        btnRetry = findViewById(R.id.btnRetry);

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
                                return new WebResourceResponse(getMimeType(cleanPath), "UTF-8", new FileInputStream(otaFile));
                            }

                            // Check OTA directory index
                            if (cleanPath.endsWith("/")) {
                                File otaIndex = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + "index.html");
                                if (otaIndex != null && otaIndex.isFile()) {
                                    return new WebResourceResponse("text/html", "UTF-8", new FileInputStream(otaIndex));
                                }
                            } else {
                                File otaIndex = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + "/index.html");
                                if (otaIndex != null && otaIndex.isFile()) {
                                    return new WebResourceResponse("text/html", "UTF-8", new FileInputStream(otaIndex));
                                }
                                File otaHtml = OtaUpdateManager.getOtaFile(MainActivity.this, cleanPath + ".html");
                                if (otaHtml != null && otaHtml.isFile()) {
                                    return new WebResourceResponse("text/html", "UTF-8", new FileInputStream(otaHtml));
                                }
                            }

                            // PRIORITY 2: Fall back to factory bundled APK assets
                            String assetPath = "www/" + cleanPath;
                            AssetManager am = getAssets();

                            // 1. Try exact asset file
                            try {
                                InputStream is = am.open(assetPath);
                                return new WebResourceResponse(getMimeType(assetPath), "UTF-8", is);
                            } catch (IOException ignored) {}

                            // 2. Try directory index (e.g. /calculator/ -> www/calculator/index.html)
                            if (cleanPath.endsWith("/")) {
                                try {
                                    InputStream is = am.open(assetPath + "index.html");
                                    return new WebResourceResponse("text/html", "UTF-8", is);
                                } catch (IOException ignored) {}
                            } else {
                                try {
                                    InputStream is = am.open(assetPath + "/index.html");
                                    return new WebResourceResponse("text/html", "UTF-8", is);
                                } catch (IOException ignored) {}
                                try {
                                    InputStream is = am.open(assetPath + ".html");
                                    return new WebResourceResponse("text/html", "UTF-8", is);
                                } catch (IOException ignored) {}
                            }

                            // PRIORITY 3: Client-side SPA fallback (OTA index.html first, then bundled index.html)
                            File otaSpaFallback = OtaUpdateManager.getOtaFile(MainActivity.this, "index.html");
                            if (otaSpaFallback != null && otaSpaFallback.isFile()) {
                                return new WebResourceResponse("text/html", "UTF-8", new FileInputStream(otaSpaFallback));
                            }

                            try {
                                InputStream is = am.open("www/index.html");
                                return new WebResourceResponse("text/html", "UTF-8", is);
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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Custom user agent identifier for offline Android app
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " BuildCostApp/1.3.0-offline (Android)");

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
}
