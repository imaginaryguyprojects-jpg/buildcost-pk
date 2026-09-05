"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  HelpCircle
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function PricingComparisonPage() {
  const { openUpgradeModal, openCheckoutModal } = useAuthStore();

  const comparisonFeatures = [
    { name: "Estimation & Civil Calculations", free: "Basic (5 Calculators)", pro: "Advanced (All 30+ Categories)" },
    { name: "Grey Structure Element Calculators", free: "Basic Floor Multiplier", pro: "Full Multi-Type (Columns, Slabs, Beams, Lintels)" },
    { name: "Finishing Works Estimator", free: "General Rate Estimate", pro: "17 Dedicated Categories (Plaster to Fixtures)" },
    { name: "Active Construction Projects", free: "Up to 3 Projects", pro: "Unlimited Projects" },
    { name: "Labour Sizing & Duration Estimator", free: "Fixed Assumptions", pro: "Custom Workforce & Scenarios A/B/C" },
    { name: "City Material Rate Engine", free: "Default Rates Only", pro: "PBS Verified Live Market Rates + Custom Overrides" },
    { name: "Contractor BOQ Studio", free: "View Only", pro: "Full Export & Itemized Rates" },
    { name: "Vendor Khata & Ledger", free: "Not Included", pro: "Unlimited Vendors & Udhaar Balances" },
    { name: "Purchases & Weighbridge Slips", free: "Manual Totals", pro: "Photo Uploads & Material Reconciliation" },
    { name: "Stock Inventory Tracking", free: "Not Included", pro: "Auto Formula + Low-Stock Warnings" },
    { name: "Daily Site Construction Diary", free: "Not Included", pro: "Daily Worker Log & Curing Reminders" },
    { name: "What-If Commodity Simulator", free: "Not Included", pro: "Instant Percentage Sliders (Steel, Cement, etc.)" },
    { name: "Cryptographic Share Links", free: "Standard Link", pro: "Encrypted Token Links with Rate Masking" },
    { name: "Official PDF Reports", free: "Basic 1-Page Summary", pro: "Multi-Page Detailed BOQ & Engineering Takeoffs" },
    { name: "Pakistani Payment Channels", free: "Free Forever", pro: "Easypaisa, JazzCash, Meezan Bank / Raast" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          BuildCost Connect Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Start for free to calculate plot dimensions and standard estimates, or upgrade to Pro for complete contractor management and site operations.
        </p>
      </div>

      {/* Side-by-Side Pricing Cards (Section 37) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* FREE PLAN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Access</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Free Plan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Ideal for individual homeowners starting preliminary planning.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">Rs. 0</span>
              <span className="text-xs text-slate-400">/ forever</span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic Civil &amp; Brickwork Calculators</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Up to 3 Active Saved Projects</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard Whole House Estimator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Default Regional Material Rates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Public 2D CAD Layouts Viewer</span>
              </div>
            </div>
          </div>

          <Link
            href="/calculator"
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs text-center transition-colors block"
          >
            Continue with Free Plan
          </Link>
        </div>

        {/* PRO PLAN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border-2 border-emerald-500 shadow-2xl relative flex flex-col justify-between space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-xl">
            Recommended for Contractors
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Enterprise Grade</span>
              <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>BuildCost Pro</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Full site operations, contractor procurement, and precision estimation.
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black font-mono text-emerald-400">Rs. 1,999</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-semibold block mt-0.5">
                Or Rs. 19,990 / year (save Rs. 4,000)
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Active Construction Projects</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated Grey Structure &amp; 17-Category Finishing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Labour Workforce Sizing &amp; Duration Estimator</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Vendor Ledger, WhatsApp Khata &amp; Udhaar Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Site Stock Inventory &amp; Bill Photo Uploads</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCheckoutModal}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
          >
            <span>Upgrade to Pro via Easypaisa / JazzCash / Bank</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Complete Feature Comparison Table (Section 38) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-4">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Detailed Plan Feature Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent comparison of capabilities across Free and Pro tiers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-5">Platform Feature</th>
                <th className="py-3.5 px-5 text-center">Free Plan</th>
                <th className="py-3.5 px-5 text-center text-emerald-600 dark:text-emerald-400">BuildCost Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {comparisonFeatures.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-5 font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-5 text-center text-slate-500">
                    {item.free}
                  </td>
                  <td className="py-3.5 px-5 text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10">
                    {item.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
