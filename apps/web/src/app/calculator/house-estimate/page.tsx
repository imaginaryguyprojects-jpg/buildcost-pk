"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  Share2,
  Building2,
  Layers,
  Users,
  Truck,
  Sparkles
} from "lucide-react";
import { PAKISTANI_CITIES, MARLA_STANDARDS, BRAND_CONFIG } from "@buildcost/config";
import { ConstructionQuality } from "@buildcost/types";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { ShareModal } from "@/components/sharing/ShareModal";
import { cn } from "@/lib/utils";

export default function HouseEstimatePage() {
  const { isAuthenticated, openLoginModal, showToast } = useAuthStore();
  const { saveCalculation } = useProjectStore();
  const [shareOpen, setShareOpen] = useState(false);

  const [plotAreaMarla, setPlotAreaMarla] = useState<number>(5);
  const [marlaStandardId, setMarlaStandardId] = useState<string>("marla_225");
  const [coveredAreaSqft, setCoveredAreaSqft] = useState<number>(2200);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [quality, setQuality] = useState<ConstructionQuality>("standard");
  const [cityId, setCityId] = useState<string>("isb");

  // Custom rates overrides
  const [customCementRate, setCustomCementRate] = useState<number>(1450);
  const [customSteelRate, setCustomSteelRate] = useState<number>(260);
  const [customBrickRate, setCustomBrickRate] = useState<number>(14);

  const selectedStandard = MARLA_STANDARDS.find((m) => m.id === marlaStandardId) || MARLA_STANDARDS[0];
  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === cityId) || PAKISTANI_CITIES[0];

  const estimate = calculateCompleteHouseEstimate({
    plotAreaMarla,
    marlaSqft: selectedStandard.sqft,
    coveredAreaSqft,
    numberOfFloors,
    quality,
    cityId,
    cityName: selectedCity.name,
    customCementRate,
    customSteelRate,
    customBrickRate
  });

  const handleSaveEstimate = () => {
    const payload = {
      calculatorType: "house-estimate",
      inputs: {
        plotAreaMarla,
        marlaStandardId,
        coveredAreaSqft,
        numberOfFloors,
        quality,
        cityId,
        cityName: selectedCity.name,
        customCementRate,
        customSteelRate,
        customBrickRate
      },
      result: estimate,
      ratesSnapshot: {
        mat_cement: { rate: customCementRate, source: "APCMA Dealer Price Index", verifiedAt: "Today 09:30 AM" },
        mat_steel_g60: { rate: customSteelRate * 1000, source: "PSRMA Mills Ex-Factory", verifiedAt: "Today 09:30 AM" },
        mat_brick_awwal: { rate: customBrickRate, source: "Bhatta Kiln Association", verifiedAt: "Today 09:30 AM" }
      }
    };

    if (!isAuthenticated) {
      openLoginModal({
        actionName: "save_calculation",
        payload,
        message: "Your calculation has been preserved. Sign in to save to your records."
      });
    } else {
      saveCalculation(payload);
      showToast("Estimate saved to your project records!", "success");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Clean Modern Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/calculator"
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Complete House Cost Estimator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate 30-category civil, finishing, and labour cost calculation for Pakistan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Building Specifications
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Plot Area */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                Plot Area (Marlas)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={plotAreaMarla}
                onChange={(e) => {
                  const m = parseFloat(e.target.value) || 1;
                  setPlotAreaMarla(m);
                  setCoveredAreaSqft(Math.round(m * 225 * 0.9 * numberOfFloors));
                }}
                className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            {/* Marla Standard */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                Marla Standard (Sq Ft)
              </label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {MARLA_STANDARDS.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.sqft} sqft)
                  </option>
                ))}
              </select>
            </div>

            {/* Total Covered Area */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                Total Covered Area (Sq Ft)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={coveredAreaSqft}
                onChange={(e) => setCoveredAreaSqft(parseFloat(e.target.value) || 100)}
                className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            {/* Floors & City Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                  Floors / Storeys
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                  City Market
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  {PAKISTANI_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quality Tier */}
            <div>
              <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1.5">
                Construction Quality Specification
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ConstructionQuality)}
                className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="economy">Economy (Basic Finishes / Local Fittings)</option>
                <option value="standard">Standard (A-Quality Grey + Porcelain Tiles)</option>
                <option value="premium">Premium (Imported Fixtures, Teak Wood, Double Glazed)</option>
                <option value="luxury">Luxury (Smart Home, Spanish Marble &amp; HVAC)</option>
              </select>
            </div>

            {/* Custom Material Rates */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
                Custom Material Rates (Optional)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">
                    Cement (Bag)
                  </label>
                  <input
                    type="number"
                    value={customCementRate}
                    onChange={(e) => setCustomCementRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">
                    Steel (Kg)
                  </label>
                  <input
                    type="number"
                    value={customSteelRate}
                    onChange={(e) => setCustomSteelRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-medium block mb-1">
                    Brick (Unit)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={customBrickRate}
                    onChange={(e) => setCustomBrickRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Outputs Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Grand Total Banner (Clean, Calm, Elegant) */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Estimated Construction Cost
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-300/60 dark:border-emerald-800">
                {quality.toUpperCase()} QUALITY
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight my-2 font-mono">
              {formatPKR(estimate.grandTotal)}
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-emerald-100 dark:border-slate-800/80">
              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                ≈ {formatLakhCrore(estimate.grandTotal)}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-mono font-semibold">
                Rs. {formatNumber(estimate.costPerSqft)} / sq.ft
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-emerald-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={handleSaveEstimate}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Estimate to Records</span>
              </button>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="py-3 px-5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Allocation Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Civil &amp; Finishing Materials</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {formatLakhCrore(estimate.materialsCost)}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Labour &amp; Subcontractors</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {formatLakhCrore(estimate.labourCost)}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-1">
                <Truck className="w-3.5 h-3.5 text-teal-500" />
                <span>Equipment &amp; Transport</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {formatLakhCrore(estimate.equipmentCost + estimate.transportCost)}
              </span>
            </div>
          </div>

          {/* Material Consumption Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Calculated Material Consumption
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-2.5 font-semibold">Material</th>
                    <th className="py-2.5 text-right font-semibold">Quantity</th>
                    <th className="py-2.5 text-right font-semibold">Rate</th>
                    <th className="py-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {estimate.materials.slice(0, 5).map((m) => (
                    <tr key={m.materialId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                        {m.materialName}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatNumber(m.finalQuantity)} {m.unit}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600 dark:text-slate-400">
                        Rs. {formatNumber(m.unitRate)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                        {formatPKR(m.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clean Engineering Disclaimer */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {BRAND_CONFIG.disclaimer}
            </p>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        documentType="estimate"
        documentId={`est_${plotAreaMarla}_marla_${cityId}`}
        documentTitle={`${plotAreaMarla} Marla House Construction Estimate — ${selectedCity.name}`}
        documentData={{
          plotAreaMarla,
          coveredAreaSqft,
          numberOfFloors,
          city: selectedCity.name,
          quality,
          grandTotal: estimate.grandTotal,
          costPerSqft: estimate.costPerSqft
        }}
      />
    </div>
  );
}
