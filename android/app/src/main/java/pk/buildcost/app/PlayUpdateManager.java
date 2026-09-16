package pk.buildcost.app;

import android.app.Activity;
import android.content.IntentSender;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.google.android.material.snackbar.Snackbar;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.InstallState;
import com.google.android.play.core.install.InstallStateUpdatedListener;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * PlayUpdateManager — Official Google Play In-App Update Implementation
 * 
 * Rules:
 * 1. Supports Flexible Updates for standard releases.
 * 2. Supports Immediate Updates for critical/security-mandatory releases.
 * 3. Never downloads arbitrary APKs or bypasses Google Play security.
 * 4. Dispatches status to WebView JS bridge.
 */
public class PlayUpdateManager {

    private static final String TAG = "PlayUpdateManager";
    public static final int UPDATE_REQUEST_CODE = 4210;

    private final Activity activity;
    private final WebView webView;
    private final AppUpdateManager appUpdateManager;
    private AppUpdateInfo cachedUpdateInfo;

    private final InstallStateUpdatedListener installStateUpdatedListener = new InstallStateUpdatedListener() {
        @Override
        public void onStateUpdate(@NonNull InstallState state) {
            int installStatus = state.installStatus();
            Log.d(TAG, "Play install state updated: " + installStatus);

            if (installStatus == InstallStatus.DOWNLOADED) {
                notifyUpdateStatus("DOWNLOADED", 100);
                showCompletionSnackbar();
            } else if (installStatus == InstallStatus.DOWNLOADING) {
                long totalBytes = state.totalBytesToDownload();
                long bytesDownloaded = state.bytesDownloaded();
                int percent = totalBytes > 0 ? (int) ((bytesDownloaded * 100) / totalBytes) : 0;
                notifyUpdateStatus("DOWNLOADING", percent);
            } else if (installStatus == InstallStatus.FAILED) {
                notifyUpdateStatus("FAILED", 0);
            } else if (installStatus == InstallStatus.CANCELED) {
                notifyUpdateStatus("CANCELED", 0);
            }
        }
    };

    public PlayUpdateManager(@NonNull Activity activity, @NonNull WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.appUpdateManager = AppUpdateManagerFactory.create(activity);
    }

    public void initialize() {
        appUpdateManager.registerListener(installStateUpdatedListener);
        checkForUpdates(false);
    }

    /**
     * Checks Google Play for in-app updates.
     * @param isMandatory whether to force Immediate Update flow if available
     */
    public void checkForUpdates(final boolean isMandatory) {
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
            cachedUpdateInfo = appUpdateInfo;
            int availability = appUpdateInfo.updateAvailability();
            int availableVersionCode = appUpdateInfo.availableVersionCode();
            Log.d(TAG, "Play Update availability: " + availability + ", availableVersionCode=" + availableVersionCode);

            if (availability == UpdateAvailability.UPDATE_AVAILABLE) {
                int updateType = isMandatory && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
                        ? AppUpdateType.IMMEDIATE
                        : AppUpdateType.FLEXIBLE;

                notifyUpdateAvailable(availableVersionCode, updateType == AppUpdateType.IMMEDIATE);

                if (appUpdateInfo.isUpdateTypeAllowed(updateType)) {
                    startUpdate(updateType);
                }
            } else if (availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                // Resume ongoing update
                startUpdate(AppUpdateType.IMMEDIATE);
            } else {
                notifyUpdateStatus("UP_TO_DATE", 100);
            }
        }).addOnFailureListener(e -> {
            Log.w(TAG, "Play update check failed: " + e.getMessage());
            notifyUpdateStatus("ERROR", 0);
        });
    }

    public void startUpdate(int updateType) {
        if (cachedUpdateInfo == null) {
            checkForUpdates(updateType == AppUpdateType.IMMEDIATE);
            return;
        }

        try {
            appUpdateManager.startUpdateFlowForResult(
                    cachedUpdateInfo,
                    updateType,
                    activity,
                    UPDATE_REQUEST_CODE
            );
        } catch (IntentSender.SendIntentException e) {
            Log.e(TAG, "Failed to start Play update flow", e);
        }
    }

    public void completeUpdate() {
        appUpdateManager.completeUpdate();
    }

    private void showCompletionSnackbar() {
        activity.runOnUiThread(() -> {
            Snackbar snackbar = Snackbar.make(
                    activity.findViewById(android.R.id.content),
                    "New version downloaded from Google Play.",
                    Snackbar.LENGTH_INDEFINITE
            );
            snackbar.setAction("Restart & Install", v -> completeUpdate());
            snackbar.setActionTextColor(0xFF34D399);
            snackbar.show();
        });
    }

    private void notifyUpdateAvailable(int versionCode, boolean isImmediate) {
        activity.runOnUiThread(() -> {
            if (webView != null) {
                String js = String.format("if (window.onPlayUpdateAvailable) window.onPlayUpdateAvailable(%d, %b);", versionCode, isImmediate);
                webView.evaluateJavascript(js, null);
            }
        });
    }

    private void notifyUpdateStatus(String status, int progressPercent) {
        activity.runOnUiThread(() -> {
            if (webView != null) {
                String js = String.format("if (window.onPlayUpdateStatus) window.onPlayUpdateStatus('%s', %d);", status, progressPercent);
                webView.evaluateJavascript(js, null);
            }
        });
    }

    public void onResume() {
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
            if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                showCompletionSnackbar();
            }
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                startUpdate(AppUpdateType.IMMEDIATE);
            }
        });
    }

    public void onDestroy() {
        appUpdateManager.unregisterListener(installStateUpdatedListener);
    }
}
