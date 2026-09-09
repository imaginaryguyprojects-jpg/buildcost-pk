"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share, RefreshCw, CheckCircle2, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // 2. Check if user dismissed prompt recently in this session
    const dismissedSession = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissedSession) {
      setIsDismissed(true);
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
    const isWebKit = /WebKit/i.test(ua);
    const isSafari = isIosDevice && isWebKit && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
    if (isSafari && !isStandaloneMode) {
      setIsIos(true);
    }

    // 4. Register Service Worker with auto-update listener
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwRegistration(reg);

          // Check if there's already an update waiting
          if (reg.waiting) {
            setUpdateAvailable(true);
          }

          // Listen for new updates found
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error("PWA: Service Worker registration failed:", err);
        });

      // Handle controllerchange (reload smoothly when worker takes control)
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 5. Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        setShowIosInstructions(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("PWA install error:", err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  const handleUpdateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  // If update is available, show high-priority update pill
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">App Update Available</p>
              <p className="text-xs text-slate-400">New rates and features are ready.</p>
            </div>
          </div>
          <button
            onClick={handleUpdateApp}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
          >
            Update Now
          </button>
        </div>
      </div>
    );
  }

  // If installed successfully toast
  if (installedSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-50 animate-in fade-in duration-300">
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <p className="text-sm font-medium">BuildCost-PK installed! Accessible from home screen.</p>
        </div>
      </div>
    );
  }

  // If in standalone mode or dismissed, don't show prompt
  if (isStandalone || isDismissed) {
    return null;
  }

  // Android / Chromium Install Banner or iOS Share prompt
  if (deferredPrompt || isIos) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="flex-1 pr-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Install BuildCost-PK
                </h4>
                <span className="text-[10px] uppercase font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                  Free App
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Add to your home screen for quick offline access, instant rate updates, and a native app experience.
              </p>

              {showIosInstructions ? (
                <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1">
                    <Share className="w-3.5 h-3.5 text-emerald-600" />
                    How to install on iPhone / iPad:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>Tap the <strong>Share</strong> button in Safari</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                  </ol>
                </div>
              ) : (
                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isIos ? "How to Install" : "Install App"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-2 px-2.5 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
