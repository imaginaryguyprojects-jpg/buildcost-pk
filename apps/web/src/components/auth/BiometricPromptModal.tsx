"use client";

import React, { useState } from "react";
import { Fingerprint, ShieldCheck, X, Check } from "lucide-react";
import { saveBiometricCredentials } from "@/lib/auth/biometricService";

interface BiometricPromptModalProps {
  isOpen: boolean;
  email: string;
  sessionToken?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BiometricPromptModal({
  isOpen,
  email,
  sessionToken = "active_session",
  onClose,
  onSuccess
}: BiometricPromptModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEnable = async () => {
    setLoading(true);
    try {
      await saveBiometricCredentials(email, sessionToken);
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <Fingerprint className="w-8 h-8 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-white tracking-tight">
            Enable Fingerprint Login?
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Log in faster and securely next time without typing your password every time you open BuildCost PK.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left space-y-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted on device hardware</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant offline access to all estimates</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={handleEnable}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{loading ? "Enabling..." : "Enable Fingerprint Login"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
