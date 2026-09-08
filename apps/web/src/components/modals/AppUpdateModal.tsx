"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import { checkAppUpdate, UpdateCheckResult, CURRENT_CLIENT_INFO } from "@/lib/appUpdateChecker";
import { cn } from "@/lib/utils";

export function AppUpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Check for updates on mount
    const runCheck = async () => {
      // Check session storage to avoid prompting on every page change if dismissed
      const dismissed = sessionStorage.getItem("app_update_dismissed");
      const result = await checkAppUpdate();

      if (result && result.hasUpdate) {
        if (result.isMandatory || !dismissed) {
          setUpdateInfo(result);
          setIsOpen(true);
        }
      }
    };

    runCheck();
  }, []);

  if (!isOpen || !updateInfo) return null;

  const handleDismiss = () => {
    if (updateInfo.isMandatory) return; // Cannot dismiss mandatory update
    sessionStorage.setItem("app_update_dismissed", "true");
    setIsOpen(false);
  };

  const handleDownload = () => {
    setDownloading(true);
    if (updateInfo.downloadUrl) {
      window.open(updateInfo.downloadUrl, "_blank", "noopener,noreferrer");
    }
    setTimeout(() => {
      setDownloading(false);
      if (!updateInfo.isMandatory) {
        setIsOpen(false);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 selection:bg-emerald-500">
        {/* Close Button (Disabled if Mandatory) */}
        {!updateInfo.isMandatory && (
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Badge & Icon */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              updateInfo.isMandatory
                ? "bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-rose-950/40"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-950/40"
            )}
          >
            {updateInfo.isMandatory ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1",
                updateInfo.isMandatory
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
              )}
            >
              {updateInfo.isMandatory
                ? "Critical Native Update Required"
                : updateInfo.isOta
                ? "Over-The-Air Patch Available"
                : "New Version Available"}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              BuildCost Connect v{updateInfo.latestVersion}
            </h2>
          </div>
        </div>

        {/* Version Comparison Box */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Current Version</span>
            <span className="font-semibold text-slate-300">
              v{CURRENT_CLIENT_INFO.version} (Build {CURRENT_CLIENT_INFO.versionCode})
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <div className="text-right">
            <span className="text-emerald-400 block text-[11px] font-medium">Target Release</span>
            <span className="font-bold text-emerald-400">
              v{updateInfo.latestVersion} (Build {updateInfo.latestVersionCode})
            </span>
          </div>
        </div>

        {/* Release Notes */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
            What's New in this Release:
          </label>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 max-h-32 overflow-y-auto leading-relaxed">
            {updateInfo.releaseNotes}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className={cn(
              "w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all",
              updateInfo.isMandatory
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
            )}
          >
            <Download className="w-4 h-4" />
            <span>
              {downloading
                ? "Opening Direct APK Download..."
                : updateInfo.isMandatory
                ? "Download & Install Required APK"
                : "Update to Latest Version (APK)"}
            </span>
          </button>

          {!updateInfo.isMandatory && (
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
