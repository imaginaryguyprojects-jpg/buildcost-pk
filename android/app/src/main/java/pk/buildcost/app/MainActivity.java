package pk.buildcost.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
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

public class MainActivity extends AppCompatActivity {

    public static final String DEFAULT_URL = "https://buildcost-pk-web.vercel.app";
    private static final String PREFS_NAME = "BuildCostPrefs";
    private static final String KEY_CUSTOM_URL = "custom_url";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout offlineContainer;
    private Button btnRetry;

    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> filePickerLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupFilePicker();
        setupWebView();
        setupBackNavigation();

        loadTargetUrl();
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        offlineContainer = findViewById(R.id.offlineContainer);
        btnRetry = findViewById(R.id.btnRetry);

        swipeRefresh.setColorSchemeColors(0xFF059669);
        swipeRefresh.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                offlineContainer.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(this, "No internet connection", Toast.LENGTH_SHORT).show();
            }
        });

        btnRetry.setOnClickListener(v -> {
            offlineContainer.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            loadTargetUrl();
        });

        // Secret URL config trigger by long pressing retry button
        btnRetry.setOnLongClickListener(v -> {
            showUrlConfigDialog();
            return true;
        });
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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Append custom user agent identifier
        String defaultUA = settings.getUserAgentString();
        settings.setUserAgentString(defaultUA + " BuildCostApp/1.2.2 (Android)");

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

                // Handle custom schemes (WhatsApp, tel, mailto, etc.)
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

                return false; // Let WebView handle HTTP / HTTPS
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
                    if (!isNetworkAvailable()) {
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
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    private void loadTargetUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String url = prefs.getString(KEY_CUSTOM_URL, DEFAULT_URL);

        // Automatically upgrade any legacy cached domain that lacked '-web'
        if (url != null && url.contains("buildcost-pk.vercel.app") && !url.contains("buildcost-pk-web.vercel.app")) {
            url = DEFAULT_URL;
            prefs.edit().putString(KEY_CUSTOM_URL, DEFAULT_URL).apply();
        }

        if (!isNetworkAvailable()) {
            // Attempt to load offline cache, or show offline fallback
            webView.setVisibility(View.GONE);
            offlineContainer.setVisibility(View.VISIBLE);
            return;
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

        final EditText input = new EditText(this);
        input.setText(currentUrl);
        input.setSelection(currentUrl.length());

        new AlertDialog.Builder(this)
                .setTitle("Configure Server URL")
                .setMessage("Enter the web URL (e.g. production or local network IP for development):")
                .setView(input)
                .setPositiveButton("Save & Reload", (dialog, which) -> {
                    String newUrl = input.getText().toString().trim();
                    if (!newUrl.isEmpty()) {
                        prefs.edit().putString(KEY_CUSTOM_URL, newUrl).apply();
                        webView.setVisibility(View.VISIBLE);
                        offlineContainer.setVisibility(View.GONE);
                        webView.loadUrl(newUrl);
                    }
                })
                .setNeutralButton("Reset Default", (dialog, which) -> {
                    prefs.edit().remove(KEY_CUSTOM_URL).apply();
                    webView.setVisibility(View.VISIBLE);
                    offlineContainer.setVisibility(View.GONE);
                    webView.loadUrl(DEFAULT_URL);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
