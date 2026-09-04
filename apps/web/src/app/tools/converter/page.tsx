"use client";

import React, { useState } from "react";
import { ArrowRightLeft, Maximize2, Coins, ArrowRight } from "lucide-react";
import { MARLA_STANDARDS } from "@buildcost/config";
import { convertArea } from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function UnitConverterPage() {
  // Area State
  const [areaValue, setAreaValue] = useState<number>(5);
  const [fromAreaUnit, setFromAreaUnit] = useState<"marla" | "kanal" | "sqft" | "sqyd" | "sqm">("marla");
  const [marlaStandardId, setMarlaStandardId] = useState<string>("marla_225");

  // Currency State
  const [rupeeAmount, setRupeeAmount] = useState<number>(25000000); // 2.5 Crore

  const selectedStandard = MARLA_STANDARDS.find((s) => s.id === marlaStandardId) || MARLA_STANDARDS[0];
  const sqftPerMarla = selectedStandard.sqft;

  // Compute all area equivalents
  const inSqft = convertArea(areaValue || 0, fromAreaUnit, "sqft", sqftPerMarla);
  const inMarla = inSqft / sqftPerMarla;
  const inKanal = inSqft / (20 * sqftPerMarla);
  const inSqyd = inSqft / 9;
  const inSqm = inSqft / 10.7639104;
  const inAcre = inSqft / 43560;

  // Currency breakdown
  const inLakhs = rupeeAmount / 100000;
  const inCrores = rupeeAmount / 10000000;
  const inMillions = rupeeAmount / 1000000;
  const inArabs = rupeeAmount / 1000000000;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Smart Units & Vernacular Currency Converter
          </h1>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            Pakistan Standards
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Instant conversion between regional Marla standards, Kanals, Gazz, and Pakistani financial units (Lakhs & Crores)
        </p>
      </div>

      {/* Tool 1: Regional Area Converter */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Maximize2 className="w-4 h-4 text-emerald-500" />
          <span>Pakistan Land & Area Measurement Converter</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Enter Value</label>
            <input
              type="number"
              min="0"
              step="any"
              value={areaValue}
              onChange={(e) => setAreaValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">From Unit</label>
            <select
              value={fromAreaUnit}
              onChange={(e) => setFromAreaUnit(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            >
              <option value="marla">Marla</option>
              <option value="kanal">Kanal (20 Marlas)</option>
              <option value="sqft">Square Feet (sqft)</option>
              <option value="sqyd">Square Yards / Gazz</option>
              <option value="sqm">Square Meters (sqm)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Marla Standard Definition</label>
            <select
              value={marlaStandardId}
              onChange={(e) => setMarlaStandardId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
            >
              {MARLA_STANDARDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Marla</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
              {formatNumber(inMarla, 2)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Kanal</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block">
              {formatNumber(inKanal, 3)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Sq Feet</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block">
              {formatNumber(inSqft, 0)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Gazz (Sq Yd)</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block">
              {formatNumber(inSqyd, 1)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Sq Meters</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block">
              {formatNumber(inSqm, 1)}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-0.5">Acres</span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block">
              {formatNumber(inAcre, 3)}
            </span>
          </div>
        </div>
      </div>

      {/* Tool 2: Pakistani Financial Vernacular Converter */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
          <Coins className="w-4 h-4 text-emerald-500" />
          <span>Pakistani Financial Vernacular (Lakh, Crore, Arab)</span>
        </h2>

        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1.5">
            Enter Total Amount in Rupees (PKR)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="50000"
              value={rupeeAmount}
              onChange={(e) => setRupeeAmount(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPKR(rupeeAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">In Lakhs (100k)</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono block">
              {formatNumber(inLakhs, 2)} Lakh
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">In Crores (10M)</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
              {formatNumber(inCrores, 2)} Crore
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">In Millions</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono block">
              {formatNumber(inMillions, 2)} Million
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">In Arabs (Billion)</span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-mono block">
              {formatNumber(inArabs, 3)} Arab
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
