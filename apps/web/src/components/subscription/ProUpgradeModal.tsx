"use client";

import React from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock
} from "lucide-react";

export function ProUpgradeModal() {
  const { upgradeModalOpen, closeUpgradeModal, openCheckoutModal, activeFeaturePrompt } = useAuthStore();

  if (!upgradeModalOpen) return null;

  const proBenefits = [
    "Unlimited Active Construction Projects (vs. 3 on Free)",
    "Complete BOQ Studio & Contractor Quotation Export",
    "Vendor Directory, WhatsApp Khata Ledger & Udhaar Tracking",
    "Material Purchase Orders, Weighbridge Slips & Bill Photos",
    "Site Stock Inventory with Automatic Low-Stock Warning",
    "Daily Construction Site Diary & Worker Attendance Log",
    "Estimate vs. Actual Variance & Budget Overrun Alerts",
    "What-If Price Sensitivity Simulator (+10% Steel, +5% Cement)",
    "Cryptographic Secure Share Links & Professional PDF Reports",
    "Dedicated Priority Civil Engineering Support"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Unlock with BuildCost Pro
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise-grade estimation and site operations suite
            </p>
          </div>
        </div>

        {/* Contextual Trigger Alert */}
        {activeFeaturePrompt && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>{activeFeaturePrompt}</strong> is an advanced feature reserved for Pro members.
            </span>
          </div>
        )}

        {/* Pricing Box */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Professional Membership
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                Rs. 1,999
              </span>
              <span className="text-xs text-slate-500">/ month</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Or Rs. 19,990 / year (save 2 months)
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
              <Zap className="w-3 h-3" />
              Instant Upgrade
            </span>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-2 mb-6 max-h-52 overflow-y-auto pr-1">
          {proBenefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={openCheckoutModal}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade with Easypaisa / JazzCash / Bank</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Continue with Free Plan
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verified Pakistan Payment Channels • Cancel anytime from settings</span>
        </div>
      </div>
    </div>
  );
}
