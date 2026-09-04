"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldAlert } from "lucide-react";
import { calculateSteelWeight, estimateStructuralSteel, StructuralMemberType } from "@buildcost/calculations";
import { BRAND_CONFIG } from "@buildcost/config";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function SteelCalculatorPage() {
  const [calcMode, setCalcMode] = useState<"direct" | "empirical">("direct");

  // Direct inputs
  const [diameterMm, setDiameterMm] = useState<number>(12); // #4 bar / 12mm
  const [lengthMeters, setLengthMeters] = useState<number>(12); // standard 40ft/12m length
  const [numberOfBars, setNumberOfBars] = useState<number>(50);
  const [ratePerKg, setRatePerKg] = useState<number>(260);

  // Empirical inputs
  const [concreteVolumeCft, setConcreteVolumeCft] = useState<number>(1000);
  const [memberType, setMemberType] = useState<StructuralMemberType>("slab");

  const directResult = calculateSteelWeight(
    diameterMm || 8,
    lengthMeters || 1,
    numberOfBars || 1,
    4,
    ratePerKg
  );

  const empiricalResult = estimateStructuralSteel(
    concreteVolumeCft || 10,
    memberType,
    4,
    ratePerKg
  );

  const activeResult = calcMode === "direct" ? directResult : empiricalResult;

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Steel & Rebar Calculator</h1>
          <p className="text-xs text-slate-400">
            Deformed Grade 60 rebar weights via D²/162.2 (kg/m) and structural allowance estimations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          {/* Mode Switch */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setCalcMode("direct")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                calcMode === "direct" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Direct Bar Schedule
            </button>
            <button
              onClick={() => setCalcMode("empirical")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                calcMode === "empirical" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Structural Allowance
            </button>
          </div>

          {calcMode === "direct" ? (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Rebar Diameter / Bar Size
                </label>
                <select
                  value={diameterMm}
                  onChange={(e) => setDiameterMm(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value={9.525}>#3 (3/8&quot; / 10mm)</option>
                  <option value={12}>#4 (1/2&quot; / 12mm) - Standard Slab</option>
                  <option value={16}>#5 (5/8&quot; / 16mm) - Beams & Columns</option>
                  <option value={19}>#6 (3/4&quot; / 19mm) - Heavy Columns</option>
                  <option value={25}>#8 (1&quot; / 25mm) - Heavy Foundations</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Length per Bar (m)</label>
                  <input
                    type="number"
                    min="1"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                  <span className="text-[10px] text-slate-500">Standard mill: 12m (~40 ft)</span>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Number of Bars</label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfBars}
                    onChange={(e) => setNumberOfBars(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Structural Member</label>
                <select
                  value={memberType}
                  onChange={(e) => setMemberType(e.target.value as StructuralMemberType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="slab">RCC Slab (1.0% volume / ~2.2 kg/cft)</option>
                  <option value="beam">RCC Beams (1.8% volume / ~4.0 kg/cft)</option>
                  <option value="column">RCC Columns (2.5% volume / ~5.5 kg/cft)</option>
                  <option value="footing">Foundations / Footing (0.9% volume / ~2.0 kg/cft)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Total Concrete Volume (CFT)</label>
                <input
                  type="number"
                  min="1"
                  value={concreteVolumeCft}
                  onChange={(e) => setConcreteVolumeCft(parseFloat(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800">
            <label className="text-[10px] text-slate-400 block mb-1">Market Steel Rate (Rs/Kg)</label>
            <input
              type="number"
              value={ratePerKg}
              onChange={(e) => setRatePerKg(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Steel Expenditure
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(activeResult.cost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Total Weight: {formatNumber(activeResult.finalWeightKg, 1)} kg</span>
              <span className="text-emerald-400 font-bold">
                {formatNumber(activeResult.finalWeightTons, 3)} Metric Tons
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {BRAND_CONFIG.structuralSteelDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
