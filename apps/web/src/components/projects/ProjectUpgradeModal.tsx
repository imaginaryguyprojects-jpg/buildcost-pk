"use client";

import React from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  FolderKanban,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  History,
  TrendingUp,
  Receipt,
  Users
} from "lucide-react";

export function ProjectUpgradeModal() {
  const { projectUpgradeModalOpen, closeProjectUpgradeModal, openCheckoutModal } = useAuthStore();

  if (!projectUpgradeModalOpen) return null;

  const proFeatures = [
    "Save and manage persistent construction projects",
    "Edit project dimensions, clear ceiling heights & structural depths",
    "Duplicate projects and clone engineering specifications",
    "Project budget tracking, cash flow and actual expense logs",
    "Contractor khata ledgers, purchase orders & vendor management",
    "Versioned estimates with historical material rate snapshots",
    "Daily site diary logs & worker attendance history"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={closeProjectUpgradeModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Project Management is a PRO feature
              </h2>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full inline-block mt-0.5">
              PRO EXCLUSIVE
            </span>
          </div>
        </div>

        {/* Description requested in specification */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          Upgrade to PRO to save, manage, edit and track your construction projects from one place.
        </p>

        {/* Notice that inputs are preserved */}
        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl mb-5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Your current calculator inputs and preview results are preserved.</span>
        </div>

        {/* Feature List */}
        <div className="space-y-2 mb-6 max-h-44 overflow-y-auto pr-1">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons requested in specification */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={openCheckoutModal}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade to PRO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeProjectUpgradeModal}
            className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Continue as Guest / Cancel
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Instant activation via Easypaisa, JazzCash, or Bank Transfer</span>
        </div>
      </div>
    </div>
  );
}
