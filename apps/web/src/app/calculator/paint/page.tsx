"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import { calculatePaint } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function PaintCalculatorPage() {
  const [paintAreaSqft, setPaintAreaSqft] = useState<number>(2000);
  const [coats, setCoats] = useState<number>(2);
  const [includePrimer, setIncludePrimer] = useState<boolean>(true);
  const [includePutty, setIncludePutty] = useState<boolean>(true);

  const [paintPerLitre, setPaintPerLitre] = useState<number>(850);
  const [primerPerLitre, setPrimerPerLitre] = useState<number>(600);
  const [puttyPerKg, setPuttyPerKg] = useState<number>(45);
  const [labourPerSqft, setLabourPerSqft] = useState<number>(20);

  const result = calculatePaint(
    paintAreaSqft || 1,
    coats,
    includePrimer,
    includePutty,
    5,
    {
      paintPerLitre,
      primerPerLitre,
      puttyPerKg,
      labourPerSqft
    }
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Paint & Finishes Calculator</h1>
          <p className="text-xs text-slate-400">
            Multi-coat wall paint litres, undercoat primer, base wall putty, and painter labour
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Paint Area & Coats</span>
          </h2>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Total Surface Area (sqft)</label>
            <input
              type="number"
              min="1"
              value={paintAreaSqft}
              onChange={(e) => setPaintAreaSqft(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Number of Finish Coats</label>
            <select
              value={coats}
              onChange={(e) => setCoats(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
            >
              <option value={1}>1 Coat (Touch-up / Repaint)</option>
              <option value={2}>2 Coats (Standard New Work)</option>
              <option value={3}>3 Coats (High Opacity / Dark Colors)</option>
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={includePrimer}
                onChange={(e) => setIncludePrimer(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Include Acrylic Wall Sealer / Primer</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={includePutty}
                onChange={(e) => setIncludePutty(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0"
              />
              <span>Include Wall Putty Base Preparation</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Paint Package Cost
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-white my-2">
              {formatPKR(result.totalCost)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>Total Area: {formatNumber(result.netAreaSqft)} sqft</span>
              <span className="text-emerald-400 font-bold">
                Rs. {formatNumber(result.costPerSqft)} / sqft
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Emulsion Paint</span>
              <span className="text-2xl font-extrabold text-emerald-400">{result.paintLitres} Litres</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.paintCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Primer / Sealer</span>
              <span className="text-2xl font-extrabold text-slate-200">{result.primerLitres} Litres</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.primerCost)}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-400 block mb-1">Wall Putty</span>
              <span className="text-2xl font-extrabold text-slate-200">{result.puttyKg} Kg</span>
              <span className="text-[10px] text-slate-500 block mt-1">{formatPKR(result.puttyCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
