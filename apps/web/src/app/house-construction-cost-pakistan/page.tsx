"use client";

import React from "react";
import Link from "next/link";
import { SmartEstimateWizard } from "@/components/home/SmartEstimateWizard";
import { Home, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function HouseConstructionCostPakistanPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <span className="text-slate-200">House Construction Cost Pakistan</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          House Construction Cost in Pakistan (5 Marla, 10 Marla, 1 Kanal)
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          Comprehensive cost guide for building a double storey house in Pakistan under DHA, LDA, CDA, and Bahria Town architectural bylaws. Updated with verified factory prices for Bestway/Lucky Cement, Mughal Grade 60 Rebar, and first-class kiln bricks.
        </p>
      </div>

      {/* Embedded Wizard */}
      <SmartEstimateWizard />

      {/* Rule of Thumb Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <h2 className="text-base font-bold text-white">Estimated House Construction Costs (2026 Baseline)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold">
                <th className="pb-2.5">House Category</th>
                <th className="pb-2.5">Covered Area (Sqft)</th>
                <th className="pb-2.5">Grey Structure Cost</th>
                <th className="pb-2.5">Complete Turnkey Total</th>
                <th className="pb-2.5 text-right">Avg. Rate / Sqft</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-bold text-white">5 Marla Double Storey</td>
                <td className="py-2.5 text-slate-400">1,950 sqft</td>
                <td className="py-2.5 text-slate-300">Rs. 52 - 58 Lakh</td>
                <td className="py-2.5 text-emerald-400 font-bold font-mono">Rs. 1.01 - 1.12 Crore</td>
                <td className="py-2.5 text-right font-mono">Rs. 5,200 - 5,700</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">10 Marla Double Storey</td>
                <td className="py-2.5 text-slate-400">3,800 sqft</td>
                <td className="py-2.5 text-slate-300">Rs. 1.05 - 1.18 Crore</td>
                <td className="py-2.5 text-emerald-400 font-bold font-mono">Rs. 2.05 - 2.28 Crore</td>
                <td className="py-2.5 text-right font-mono">Rs. 5,400 - 6,000</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">1 Kanal Executive Villa</td>
                <td className="py-2.5 text-slate-400">6,200 sqft</td>
                <td className="py-2.5 text-slate-300">Rs. 1.85 - 2.10 Crore</td>
                <td className="py-2.5 text-emerald-400 font-bold font-mono">Rs. 3.65 - 4.15 Crore</td>
                <td className="py-2.5 text-right font-mono">Rs. 5,800 - 6,700</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
