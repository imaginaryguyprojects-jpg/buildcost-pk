"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Grid } from "lucide-react";
import { calculatePlaster } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function PlasterCalculatorPage() {
  const [wallAreaSqft, setWallAreaSqft] = useState<number>(800);
  const [openingsSqft, setOpeningsSqft] = useState<number>(50);
  const [thicknessInches, setThicknessInches] = useState<number>(0.5);
  const [mixRatio, setMixRatio] = useState<string>("1:4");

  const [cementPerBag, setCementPerBag] = useState<number>(1450);
  const [sandPerCft, setSandPerCft] = useState<number>(45);
  const [labourPerSqft, setLabourPerSqft] = useState<number>(25);

  const safeArea = Math.max(1, Math.abs(Number(wallAreaSqft) || 1));
  const safeOpenings = Math.max(0, Math.min(safeArea - 1, Math.abs(Number(openingsSqft) || 0)));
  const safeThickness = Math.max(0.1, Math.abs(Number(thicknessInches) || 0.5));

  let result: ReturnType<typeof calculatePlaster>;
  try {
    result = calculatePlaster(safeArea, safeOpenings, safeThickness, mixRatio, 7, {
      cementPerBag: Math.max(0, cementPerBag || 0),
      sandPerCft: Math.max(0, sandPerCft || 0),
      labourPerSqft: Math.max(0, labourPerSqft || 0)
    });
  } catch {
    result = calculatePlaster(800, 50, 0.5, "1:4", 7);
  }

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Plaster & Screed Calculator</h1>
          <p className="text-xs text-slate-400">
            Internal, external, and ceiling plaster dry volume (1.27 factor), cement bags, and fine sand
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>Plaster Parameters</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Gross Wall Area (sqft)</label>
              <input
                type="number"
                min="1"
                value={wallAreaSqft}
                onChange={(e) => setWallAreaSqft(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Deductions (sqft)</label>
              <input
                type="number"
                min="0"
                value={openingsSqft}
                onChange={(e) => setOpeningsSqft(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Thickness (inches)</label>
              <select
                value={thicknessInches}
                onChange={(e) => setThicknessInches(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value={0.5}>1/2&quot; (12mm Internal)</option>
                <option value={0.75}>3/4&quot; (20mm External)</option>
                <option value={0.375}>3/8&quot; (10mm Ceiling)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Mortar Mix</label>
              <select
                value={mixRatio}
                onChange={(e) => setMixRatio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="1:4">1:4 (Standard Internal)</option>
                <option value="1:3">1:3 (External Water-resistant)</option>
                <option value="1:5">1:5 (Economy Finish)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Plaster Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(result.totalCost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Net Area: {formatNumber(result.netAreaSqft)} sqft</span>
              <span className="text-emerald-400 font-bold">
                Rs. {formatNumber(result.costPerSqft)} / sqft
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Cement Required</span>
              <span className="text-2xl font-extrabold text-emerald-400">{result.cementBags} Bags</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.cementCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Fine Sand Required</span>
              <span className="text-2xl font-extrabold text-slate-200">{formatNumber(result.sandCft)} CFT</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.sandCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
