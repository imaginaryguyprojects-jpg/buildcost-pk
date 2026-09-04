"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, ShieldAlert } from "lucide-react";
import { MARLA_STANDARDS, BRAND_CONFIG } from "@buildcost/config";
import { calculatePlotGeometry, calculateZoningCoverage, convertArea } from "@buildcost/calculations";
import { formatNumber } from "@/lib/formatters";

export default function AreaCalculatorPage() {
  const [frontFt, setFrontFt] = useState<number>(25);
  const [depthFt, setDepthFt] = useState<number>(45);
  const [marlaStandardId, setMarlaStandardId] = useState<string>("marla_225");
  const [groundCoveredAreaSqft, setGroundCoveredAreaSqft] = useState<number>(850);
  const [totalCoveredAreaSqft, setTotalCoveredAreaSqft] = useState<number>(1800);

  const selectedStandard = MARLA_STANDARDS.find((m) => m.id === marlaStandardId) || MARLA_STANDARDS[0];

  const plot = calculatePlotGeometry(frontFt || 1, depthFt || 1, selectedStandard.sqft);
  const coverage = calculateZoningCoverage(
    plot.plotAreaSqft,
    Math.min(groundCoveredAreaSqft, plot.plotAreaSqft),
    totalCoveredAreaSqft
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/calculator"
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plot & Area Calculator</h1>
          <p className="text-xs text-slate-400">
            Regional Pakistani Marla standards, setbacks, ground coverage %, and FAR
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            <span>Plot Dimensions</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Front Width (ft)</label>
              <input
                type="number"
                min="1"
                value={frontFt}
                onChange={(e) => setFrontFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Depth / Length (ft)</label>
              <input
                type="number"
                min="1"
                value={depthFt}
                onChange={(e) => setDepthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Marla Standard</label>
            <select
              value={marlaStandardId}
              onChange={(e) => setMarlaStandardId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
            >
              {MARLA_STANDARDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200">Zoning & Covered Area</h3>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Ground Floor Footprint (sqft)</label>
              <input
                type="number"
                min="0"
                value={groundCoveredAreaSqft}
                onChange={(e) => setGroundCoveredAreaSqft(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Total Covered Area across all Floors (sqft)</label>
              <input
                type="number"
                min="0"
                value={totalCoveredAreaSqft}
                onChange={(e) => setTotalCoveredAreaSqft(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Plot Area</span>
              <span className="text-xl font-bold text-white block">{formatNumber(plot.plotAreaSqft)}</span>
              <span className="text-[10px] text-slate-500">Square Feet</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">In Marlas</span>
              <span className="text-xl font-bold text-emerald-400 block">{formatNumber(plot.marla, 2)}</span>
              <span className="text-[10px] text-slate-500">@ {selectedStandard.sqft} sqft</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">In Kanals</span>
              <span className="text-xl font-bold text-white block">{formatNumber(plot.kanal, 3)}</span>
              <span className="text-[10px] text-slate-500">20 Marlas</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 block mb-1">Square Yards (Gazz)</span>
              <span className="text-xl font-bold text-white block">{formatNumber(plot.sqyd, 1)}</span>
              <span className="text-[10px] text-slate-500">9 sqft per sqyd</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Zoning Bylaws & Coverage Ratio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Ground Coverage</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {formatNumber(coverage.groundCoveragePercent, 1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Allowed typically 65-75%</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Floor Area Ratio (FAR)</span>
                <span className="text-2xl font-extrabold text-slate-200">
                  {formatNumber(coverage.floorAreaRatio, 2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Total area / Plot area</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Open / Lawn Area</span>
                <span className="text-2xl font-extrabold text-slate-200">
                  {formatNumber(coverage.openAreaSqft)} sqft
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">{formatNumber(coverage.openAreaPercent, 1)}% open</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {BRAND_CONFIG.societyRulesDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
