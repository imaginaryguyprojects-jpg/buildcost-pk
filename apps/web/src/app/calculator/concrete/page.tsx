"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Box } from "lucide-react";
import { CONSTRUCTION_DEFAULTS } from "@buildcost/config";
import { calculateConcrete } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function ConcreteCalculatorPage() {
  const [lengthFt, setLengthFt] = useState<number>(30);
  const [widthFt, setWidthFt] = useState<number>(20);
  const [depthInches, setDepthInches] = useState<number>(6);
  const [mixRatio, setMixRatio] = useState<string>("1:2:4");
  const [wastagePercent, setWastagePercent] = useState<number>(5);

  const [cementPerBag, setCementPerBag] = useState<number>(1450);
  const [sandPerCft, setSandPerCft] = useState<number>(45);
  const [crushPerCft, setCrushPerCft] = useState<number>(65);
  const [labourPerCft, setLabourPerCft] = useState<number>(35);

  const depthFt = depthInches / 12;
  const result = calculateConcrete(lengthFt || 1, widthFt || 1, depthFt || 0.1, mixRatio, wastagePercent, {
    cementPerBag,
    sandPerCft,
    crushPerCft,
    labourPerCft
  });

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Concrete & RCC Calculator</h1>
          <p className="text-xs text-slate-400">
            Wet and dry volume shrinkage (1.54 factor), cement bags, sand, crush, and labour
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span>Dimensions & Specification</span>
          </h2>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Length (ft)</label>
              <input
                type="number"
                min="1"
                value={lengthFt}
                onChange={(e) => setLengthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Width (ft)</label>
              <input
                type="number"
                min="1"
                value={widthFt}
                onChange={(e) => setWidthFt(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Thickness (in)</label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={depthInches}
                onChange={(e) => setDepthInches(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Nominal Concrete Mix Ratio</label>
            <select
              value={mixRatio}
              onChange={(e) => setMixRatio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              {Object.entries(CONSTRUCTION_DEFAULTS.concrete.mixRatios).map(([key, mix]) => (
                <option key={key} value={key}>
                  {mix.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase">Market Rates</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Cement (Rs/Bag)</label>
                <input
                  type="number"
                  value={cementPerBag}
                  onChange={(e) => setCementPerBag(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sand (Rs/CFT)</label>
                <input
                  type="number"
                  value={sandPerCft}
                  onChange={(e) => setSandPerCft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Crush/Bajri (Rs/CFT)</label>
                <input
                  type="number"
                  value={crushPerCft}
                  onChange={(e) => setCrushPerCft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Labour (Rs/CFT)</label>
                <input
                  type="number"
                  value={labourPerCft}
                  onChange={(e) => setLabourPerCft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Estimated Concrete Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(result.totalCost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Wet Volume: {formatNumber(result.wetVolumeCft)} CFT</span>
              <span className="text-emerald-400 font-bold">
                Dry Volume: {formatNumber(result.dryVolumeCft)} CFT (×1.54)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Required Material Quantities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Cement Bags</span>
                <span className="text-2xl font-extrabold text-emerald-400">{result.cementBags} Bags</span>
                <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.cementCost)}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Sand (Chenab)</span>
                <span className="text-2xl font-extrabold text-slate-200">{formatNumber(result.sandCft)} CFT</span>
                <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.sandCost)}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Crush (Bajri)</span>
                <span className="text-2xl font-extrabold text-slate-200">{formatNumber(result.crushCft)} CFT</span>
                <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.crushCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
