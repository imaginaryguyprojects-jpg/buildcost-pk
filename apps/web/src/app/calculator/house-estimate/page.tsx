"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Calculator, Sparkles, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import { PAKISTANI_CITIES, MARLA_STANDARDS, BRAND_CONFIG } from "@buildcost/config";
import { ConstructionQuality } from "@buildcost/types";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";

export default function HouseEstimatePage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/calculator"
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Complete House Cost Estimator</h1>
          <p className="text-xs text-slate-400">
            30-Category civil structure, finishing, and labour cost calculation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Building Specifications</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Plot Area (Marlas)</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={plotAreaMarla}
                onChange={(e) => {
                  const m = parseFloat(e.target.value) || 1;
                  setPlotAreaMarla(m);
                  // Approximate covered area auto-calc: ~440 sqft per floor for 5 marla (2 floors = 2200)
                  setCoveredAreaSqft(Math.round(m * 225 * 0.9 * numberOfFloors));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Marla Standard</label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {MARLA_STANDARDS.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Total Covered Area (Sq Ft)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={coveredAreaSqft}
                onChange={(e) => setCoveredAreaSqft(parseFloat(e.target.value) || 100)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Floors</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">City Market</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {PAKISTANI_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Construction Quality Tier</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as ConstructionQuality)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="economy">Economy (Basic Finishes)</option>
                <option value="standard">Standard (A-Quality Grey + Porcelain)</option>
                <option value="premium">Premium (Imported Fixtures & Teak)</option>
                <option value="luxury">Luxury (Smart Home & High-end)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Custom Material Rates</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cement (Bag)</label>
                  <input
                    type="number"
                    value={customCementRate}
                    onChange={(e) => setCustomCementRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Steel (Kg)</label>
                  <input
                    type="number"
                    value={customSteelRate}
                    onChange={(e) => setCustomSteelRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Brick (Unit)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customBrickRate}
                    onChange={(e) => setCustomBrickRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Outputs Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Grand Total Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Estimated Construction Cost
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                {quality.toUpperCase()} QUALITY
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight my-2">
              {formatPKR(estimate.grandTotal)}
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800/80">
              <span className="text-emerald-400 font-semibold">
                ≈ {formatLakhCrore(estimate.grandTotal)}
              </span>
              <span className="text-slate-300 font-mono font-medium">
                Rs. {formatNumber(estimate.costPerSqft)} / sqft
              </span>
            </div>
          </div>

          {/* Allocation Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Civil & Finishing Materials</span>
              <span className="text-sm font-bold text-slate-100">{formatLakhCrore(estimate.materialsCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Labour & Subcontractors</span>
              <span className="text-sm font-bold text-slate-100">{formatLakhCrore(estimate.labourCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Equipment & Transport</span>
              <span className="text-sm font-bold text-slate-100">
                {formatLakhCrore(estimate.equipmentCost + estimate.transportCost)}
              </span>
            </div>
          </div>

          {/* Key Material Quantities Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Calculated Material Consumption
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 font-medium">Material</th>
                    <th className="py-2 text-right font-medium">Quantity</th>
                    <th className="py-2 text-right font-medium">Rate</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {estimate.materials.slice(0, 5).map((m) => (
                    <tr key={m.materialId}>
                      <td className="py-2.5 font-medium text-slate-200">{m.materialName}</td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        {formatNumber(m.finalQuantity)} {m.unit}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        Rs. {formatNumber(m.unitRate)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400 font-mono">
                        {formatPKR(m.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {BRAND_CONFIG.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
