package pk.buildcost.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * BuildCost Connect — Native Over-The-Air (OTA) Live Hot-Patch Manager
 * 
 * Automatically checks production endpoints in the background:
 * 1. Supabase app_releases table (https://wxcgpunqnxbezysulkdp.supabase.co)
 * 2. Next.js Web API endpoint (https://buildcost-pk.vercel.app/api/app-update)
 * 3. GitHub Releases CDN (https://api.github.com/repos/imaginaryguyprojects-jpg/buildcost-pk/releases/latest)
 * 
 * Downloads, verifies, and hot-patches local web assets without requiring a full APK reinstall.
 */
public class OtaUpdateManager {

    private static final String TAG = "OtaUpdateManager";
    private static final String PREFS_NAME = "BuildCostOtaPrefs";
    private static final String KEY_APPLIED_OTA_VERSION = "applied_ota_version";
    private static final String KEY_APPLIED_OTA_CODE = "applied_ota_version_code";

    // Primary Production Supabase REST Endpoint
    public static final String SUPABASE_ENDPOINT = "https://wxcgpunqnxbezysulkdp.supabase.co/rest/v1/app_releases?platform=eq.android&select=*";
    public static final String SUPABASE_ANON_KEY = "sb_publishable_GXaFn5Ooa8X5okJXgKGTKg__gs6mmoh";

    // Secondary / Fallback Endpoints
    public static final String WEB_ENDPOINT = "https://buildcost-pk.vercel.app/api/app-update?platform=android";
    public static final String GITHUB_RELEASES_ENDPOINT = "https://api.github.com/repos/imaginaryguyprojects-jpg/buildcost-pk/releases/latest";

    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    public static File getOtaDirectory(Context context) {
        return new File(context.getFilesDir(), "ota_hotpatch");
    }

    public static File getOtaFile(Context context, String relativePath) {
        File otaDir = getOtaDirectory(context);
        if (!otaDir.exists() || !new File(otaDir, "index.html").exists()) {
            return null;
        }

        File target = new File(otaDir, relativePath);
        try {
            // Guard against directory traversal attacks
            String canonicalDest = target.getCanonicalPath();
            String canonicalRoot = otaDir.getCanonicalPath();
            if (!canonicalDest.startsWith(canonicalRoot)) {
                return null;
            }
            return target.exists() ? target : null;
        } catch (IOException e) {
            return null;
        }
    }

    public static String getAppliedVersion(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_APPLIED_OTA_VERSION, "1.3.0-bundled");
    }

    public static void checkForUpdates(Context context, WebView webView) {
        executor.execute(() -> {
            try {
                Log.d(TAG, "Checking for OTA Live Updates in background...");
                JSONObject release = fetchReleaseMetadata();
                if (release == null) {
                    Log.d(TAG, "No OTA release metadata found on remote endpoints.");
                    return;
                }

                boolean otaAvailable = release.optBoolean("ota_available", false);
                String otaBundleUrl = release.optString("ota_bundle_url", "").trim();
                String latestVersion = release.optString("latest_version", "1.3.0");
                int latestVersionCode = release.optInt("latest_version_code", 4);

                if (!otaAvailable || otaBundleUrl.isEmpty()) {
                    Log.d(TAG, "OTA live update is not flagged as active on server (ota_available=false).");
                    return;
                }

                SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
                String currentAppliedVersion = prefs.getString(KEY_APPLIED_OTA_VERSION, "1.3.0-bundled");
                int currentAppliedCode = prefs.getInt(KEY_APPLIED_OTA_CODE, 4);

                if (latestVersionCode <= currentAppliedCode && latestVersion.equals(currentAppliedVersion)) {
                    Log.d(TAG, "Current app is up to date with active OTA release: " + latestVersion);
                    return;
                }

                Log.i(TAG, "New OTA Hot-Patch detected: v" + latestVersion + " (Build " + latestVersionCode + ")");
                Log.i(TAG, "Downloading bundle from: " + otaBundleUrl);

                boolean success = downloadAndExtractOta(context, otaBundleUrl);
                if (success) {
                    prefs.edit()
                            .putString(KEY_APPLIED_OTA_VERSION, latestVersion)
                            .putInt(KEY_APPLIED_OTA_CODE, latestVersionCode)
                            .apply();

                    Log.i(TAG, "OTA Hot-Patch v" + latestVersion + " installed and verified successfully!");

                    new Handler(Looper.getMainLooper()).post(() -> {
                        Toast.makeText(context, "⚡ BuildCost Connect updated to v" + latestVersion + "!", Toast.LENGTH_SHORT).show();
                        if (webView != null) {
                            webView.reload();
                        }
                    });
                }
            } catch (Exception e) {
                Log.w(TAG, "OTA update check deferred or failed: " + e.getMessage());
            }
        });
    }

    private static JSONObject fetchReleaseMetadata() {
        // 1. Try Supabase REST API
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(SUPABASE_ENDPOINT).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("apikey", SUPABASE_ANON_KEY);
            conn.setRequestProperty("Authorization", "Bearer " + SUPABASE_ANON_KEY);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            if (conn.getResponseCode() == 200) {
                String response = readStream(conn.getInputStream());
                JSONArray arr = new JSONArray(response);
                if (arr.length() > 0) {
                    return arr.getJSONObject(0);
                }
            }
        } catch (Exception e) {
            Log.d(TAG, "Supabase release fetch skipped: " + e.getMessage());
        }

        // 2. Fallback to Web API
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(WEB_ENDPOINT).openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            if (conn.getResponseCode() == 200) {
                String response = readStream(conn.getInputStream());
                JSONObject obj = new JSONObject(response);
                return new JSONObject()
                        .put("ota_available", obj.optBoolean("otaAvailable", false))
                        .put("ota_bundle_url", obj.optString("otaBundleUrl", ""))
                        .put("latest_version", obj.optString("latestVersion", "1.3.0"))
                        .put("latest_version_code", obj.optInt("latestVersionCode", 4));
            }
        } catch (Exception e) {
            Log.d(TAG, "Web API release fetch skipped: " + e.getMessage());
        }

        // 3. Fallback to GitHub Releases API
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(GITHUB_RELEASES_ENDPOINT).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "BuildCostApp-OTA");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            if (conn.getResponseCode() == 200) {
                String response = readStream(conn.getInputStream());
                JSONObject releaseObj = new JSONObject(response);
                JSONArray assets = releaseObj.optJSONArray("assets");
                if (assets != null) {
                    for (int i = 0; i < assets.length(); i++) {
                        JSONObject asset = assets.getJSONObject(i);
                        String name = asset.optString("name", "");
                        if (name.contains("ota") || name.endsWith(".zip")) {
                            return new JSONObject()
                                    .put("ota_available", true)
                                    .put("ota_bundle_url", asset.optString("browser_download_url", ""))
                                    .put("latest_version", releaseObj.optString("tag_name", "1.3.0").replace("v", ""))
                                    .put("latest_version_code", 5);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.d(TAG, "GitHub releases fetch skipped: " + e.getMessage());
        }

        return null;
    }

    private static boolean downloadAndExtractOta(Context context, String bundleUrl) {
        File cacheDir = context.getCacheDir();
        File zipFile = new File(cacheDir, "temp_ota.zip");
        File stagingDir = new File(context.getFilesDir(), "ota_staging");

        try {
            // Clean previous staging or temp files
            deleteRecursive(zipFile);
            deleteRecursive(stagingDir);
            stagingDir.mkdirs();

            // 1. Download zip file over HTTPS
            HttpURLConnection conn = (HttpURLConnection) new URL(bundleUrl).openConnection();
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(60000);
            conn.setInstanceFollowRedirects(true);

            if (conn.getResponseCode() != 200) {
                Log.w(TAG, "Failed to download OTA bundle: HTTP " + conn.getResponseCode());
                return false;
            }

            try (InputStream in = new BufferedInputStream(conn.getInputStream());
                 FileOutputStream out = new FileOutputStream(zipFile)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }

            // 2. Unzip safely into stagingDir
            boolean unzipped = unzipSafe(zipFile, stagingDir);
            if (!unzipped) {
                Log.e(TAG, "Failed to extract OTA zip bundle.");
                return false;
            }

            // 3. Normalize folder structure (if zip has a root "www" or "out" folder)
            File targetRoot = stagingDir;
            if (!new File(stagingDir, "index.html").exists()) {
                File subWww = new File(stagingDir, "www");
                File subOut = new File(stagingDir, "out");
                if (new File(subWww, "index.html").exists()) {
                    targetRoot = subWww;
                } else if (new File(subOut, "index.html").exists()) {
                    targetRoot = subOut;
                } else {
                    Log.e(TAG, "OTA bundle invalid: index.html not found in root or subfolder.");
                    return false;
                }
            }

            // 4. Atomically swap into active ota_hotpatch directory
            File activeOtaDir = getOtaDirectory(context);
            File backupDir = new File(context.getFilesDir(), "ota_backup");

            deleteRecursive(backupDir);
            if (activeOtaDir.exists()) {
                activeOtaDir.renameTo(backupDir);
            }

            boolean renamed = targetRoot.renameTo(activeOtaDir);
            if (!renamed) {
                // If rename fails across filesystems, copy recursively
                copyRecursive(targetRoot, activeOtaDir);
            }

            // Validate that active directory has index.html
            if (new File(activeOtaDir, "index.html").exists()) {
                deleteRecursive(backupDir);
                deleteRecursive(stagingDir);
                deleteRecursive(zipFile);
                return true;
            } else {
                // Rollback to previous backup if broken
                Log.e(TAG, "OTA verification failed! Rolling back to backup.");
                deleteRecursive(activeOtaDir);
                if (backupDir.exists()) {
                    backupDir.renameTo(activeOtaDir);
                }
                return false;
            }

        } catch (Exception e) {
            Log.e(TAG, "Exception during OTA update process", e);
            return false;
        } finally {
            deleteRecursive(zipFile);
            deleteRecursive(stagingDir);
        }
    }

    private static boolean unzipSafe(File zipFile, File targetDir) {
        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(new FileInputStream(zipFile)))) {
            ZipEntry entry;
            String targetCanonicalPath = targetDir.getCanonicalPath();

            while ((entry = zis.getNextEntry()) != null) {
                File file = new File(targetDir, entry.getName());
                String fileCanonicalPath = file.getCanonicalPath();

                // Prevent Zip Slip vulnerability
                if (!fileCanonicalPath.startsWith(targetCanonicalPath)) {
                    throw new SecurityException("Zip Slip exploit detected: " + entry.getName());
                }

                if (entry.isDirectory()) {
                    file.mkdirs();
                } else {
                    File parent = file.getParentFile();
                    if (parent != null && !parent.exists()) {
                        parent.mkdirs();
                    }
                    try (FileOutputStream fos = new FileOutputStream(file)) {
                        byte[] buffer = new byte[8192];
                        int count;
                        while ((count = zis.read(buffer)) != -1) {
                            fos.write(buffer, 0, count);
                        }
                    }
                }
                zis.closeEntry();
            }
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Zip extraction error", e);
            return false;
        }
    }

    private static void copyRecursive(File src, File dest) throws IOException {
        if (src.isDirectory()) {
            if (!dest.exists()) dest.mkdirs();
            String[] children = src.list();
            if (children != null) {
                for (String child : children) {
                    copyRecursive(new File(src, child), new File(dest, child));
                }
            }
        } else {
            try (InputStream in = new FileInputStream(src);
                 FileOutputStream out = new FileOutputStream(dest)) {
                byte[] buf = new byte[8192];
                int len;
                while ((len = in.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }
            }
        }
    }

    private static void deleteRecursive(File fileOrDirectory) {
        if (fileOrDirectory != null && fileOrDirectory.exists()) {
            if (fileOrDirectory.isDirectory()) {
                File[] children = fileOrDirectory.listFiles();
                if (children != null) {
                    for (File child : children) {
                        deleteRecursive(child);
                    }
                }
            }
            fileOrDirectory.delete();
        }
    }

    private static String readStream(InputStream is) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        return sb.toString();
    }
}
