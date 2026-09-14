"use client";

import React, { useState } from "react";
import {
  Check,
  X as CrossIcon,
  ShieldCheck,
  Crown,
  Smartphone,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  Zap,
  Info
} from "lucide-react";

interface FeatureComparisonSectionProps {
  onUpgradeClick: (feature: string) => void;
  onViewReleaseNotes?: () => void;
}

const COMPARISON_FEATURES = [
  { name: "Basic calculation (standard settings)", free: true, pro: true },
  { name: "Wall height (automatic/manual)", free: true, pro: true },
  { name: "Bathroom count & dimensions", free: true, pro: true },
  { name: "Foundation details", free: false, pro: true },
  { name: "Columns & beams", free: false, pro: true },
  { name: "Advanced material breakdown", free: false, pro: true },
  { name: "Multiple layout plans", free: false, pro: true },
  { name: "Save & manage projects", free: false, pro: true },
  { name: "Export PDF / Share", free: false, pro: true },
  { name: "Priority support", free: false, pro: true }
];

const PRO_BENEFITS = [
  "Get exact construction calculation",
  "Save and manage your projects",
  "Access premium layout designs",
  "More accurate material quantities",
  "Better cost planning and budgeting",
  "Priority customer support"
];

const V3_NEW_FEATURES = [
  "Advanced construction calculation",
  "Wall height, bathrooms, foundation",
  "Columns & beams configuration",
  "Improved material breakdown",
  "Better offline support"
];

export function FeatureComparisonSection({
  onUpgradeClick,
  onViewReleaseNotes
}: FeatureComparisonSectionProps) {
  const [showReleaseNotesModal, setShowReleaseNotesModal] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* Column 1: Feature Comparison (Table) - 6 cols on lg */}
      <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-1 mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Feature Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See the difference between Free and PRO versions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <th className="py-2.5 font-bold">Feature</th>
                <th className="py-2.5 text-center font-bold">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold">
                    <Check className="w-3 h-3" />
                    <span>Free Version</span>
                  </span>
                </th>
                <th className="py-2.5 text-center font-bold">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-200/60 dark:border-amber-800/40">
                    <Crown className="w-3 h-3" />
                    <span>PRO Version</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {COMPARISON_FEATURES.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 pr-2">
                    {item.name}
                  </td>
                  <td className="py-2.5 text-center">
                    {item.free ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <CrossIcon className="w-3.5 h-3.5 text-red-400 dark:text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {item.pro ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                    ) : (
                      <CrossIcon className="w-3.5 h-3.5 text-red-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column 2: Why Upgrade to PRO? - 3 cols on lg */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Why Upgrade to PRO?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unlock the complete civil engineering toolkit
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {PRO_BENEFITS.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpgradeClick("Why Upgrade to PRO Banner")}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>Upgrade to PRO</span>
        </button>
      </div>

      {/* Column 3: App Update Information - 3 cols on lg */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                App Update Information
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Current Version</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">3.0.0</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                Latest
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            We regularly update the app with new features, rate updates and improvements. Your data will automatically sync — no need to reinstall for backend updates.
          </p>

          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
              New features in v3.0.0:
            </div>
            <div className="space-y-1.5">
              {V3_NEW_FEATURES.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onViewReleaseNotes) {
              onViewReleaseNotes();
            } else {
              setShowReleaseNotesModal(true);
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Release Notes</span>
        </button>
      </div>

      {/* Release Notes Modal */}
      {showReleaseNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500 text-white">
                  v3.0.0 Release Notes
                </span>
                <span className="text-xs text-slate-400">BuildCode 7</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReleaseNotesModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-1">
              <p>
                <strong>BuildCost Pakistan v3.0.0</strong> represents a major engineering leap with the introduction of the PRO Exact Construction Suite.
              </p>
              <ul className="space-y-1.5 list-disc pl-4">
                <li>Exact wall height adjustment (8–20 ft) dynamically calculating masonry volume, bricks, plaster, and labour.</li>
                <li>Dynamic multi-bathroom dimensional takeoffs with 4.5&quot; partition walls.</li>
                <li>Foundation (Bunyad) depth and width calculations with structural disclaimers.</li>
                <li>RCC columns &amp; beams structural concrete and steel rebar estimations.</li>
                <li>Interactive 2D CAD Blueprint floor plan visualizer with layer controls.</li>
                <li>Zero double-counting master reconciliation for complete mathematical accuracy.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReleaseNotesModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

