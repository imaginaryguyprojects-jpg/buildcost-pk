"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Sliders, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { simulatePriceScenario, calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";

const HISTORICAL_CEMENT_DATA = [
  { day: "Aug 1", isb: 1380, lhe: 1350, khi: 1330 },
  { day: "Aug 8", isb: 1400, lhe: 1370, khi: 1340 },
  { day: "Aug 15", isb: 1410, lhe: 1380, khi: 1360 },
  { day: "Aug 22", isb: 1430, lhe: 1400, khi: 1380 },
  { day: "Aug 29", isb: 1440, lhe: 1410, khi: 1390 },
  { day: "Sep 4", isb: 1450, lhe: 1420, khi: 1400 }
];

export default function RateHistoryPage() {
  const [activeTab, setActiveTab] = useState<"trends" | "simulator">("simulator");

  // What-If Simulator adjustments
  const [cementPct, setCementPct] = useState<number>(5);
  const [steelPct, setSteelPct] = useState<number>(10);
  const [bricksPct, setBricksPct] = useState<number>(-3);
  const [labourPct, setLabourPct] = useState<number>(8);
  const [finishingPct, setFinishingPct] = useState<number>(5);

  const baseEstimate = calculateCompleteHouseEstimate({
    plotAreaMarla: 5,
    marlaSqft: 225,
    coveredAreaSqft: 2200,
    numberOfFloors: 2,
    quality: "standard",
    cityId: "isb",
    cityName: "Islamabad"
  });

  const scenarioResult = simulatePriceScenario(baseEstimate, {
    cementPct,
    steelPct,
    bricksPct,
    labourPct,
    finishingPct
  });

  const isCostIncrease = scenarioResult.deltaAmount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/rates/materials"
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Rate Intelligence & Scenarios</h1>
          <p className="text-xs text-slate-400">
            Historical price trends across Pakistani cities and What-If price volatility simulator
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "simulator"
              ? "bg-emerald-600 text-white"
              : "text-slate-400 hover:text-slate-200 bg-slate-900"
          }`}
        >
          What-If Price Sensitivity Simulator
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "trends"
              ? "bg-emerald-600 text-white"
              : "text-slate-400 hover:text-slate-200 bg-slate-900"
          }`}
        >
          City Rate Comparison Trends
        </button>
      </div>

      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Simulate Price Fluctuations</span>
              </h3>
              <button
                onClick={() => {
                  setCementPct(0);
                  setSteelPct(0);
                  setBricksPct(0);
                  setLabourPct(0);
                  setFinishingPct(0);
                }}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Reset
              </button>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Steel Price Change</span>
                <span className="font-bold text-emerald-400">{steelPct > 0 ? `+${steelPct}%` : `${steelPct}%`}</span>
              </div>
              <input
                type="range"
                min="-25"
                max="35"
                value={steelPct}
                onChange={(e) => setSteelPct(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Cement Price Change</span>
                <span className="font-bold text-emerald-400">{cementPct > 0 ? `+${cementPct}%` : `${cementPct}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                value={cementPct}
                onChange={(e) => setCementPct(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Bricks Price Change</span>
                <span className="font-bold text-emerald-400">{bricksPct > 0 ? `+${bricksPct}%` : `${bricksPct}%`}</span>
              </div>
              <input
                type="range"
                min="-20"
                max="25"
                value={bricksPct}
                onChange={(e) => setBricksPct(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Labour Wage Rates</span>
                <span className="font-bold text-emerald-400">{labourPct > 0 ? `+${labourPct}%` : `${labourPct}%`}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                value={labourPct}
                onChange={(e) => setLabourPct(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Scenario Impact Display */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Simulated Project Impact
              </span>
              <div className="flex items-baseline gap-4 my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {formatPKR(scenarioResult.scenarioTotal)}
                </span>
                <span
                  className={`flex items-center text-sm font-bold px-2 py-0.5 rounded-md ${
                    isCostIncrease ? "text-rose-400 bg-rose-950/40" : "text-emerald-400 bg-emerald-950/40"
                  }`}
                >
                  {isCostIncrease ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {scenarioResult.deltaPercentage > 0 ? `+${scenarioResult.deltaPercentage}%` : `${scenarioResult.deltaPercentage}%`}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                <span>Net Difference: {formatPKR(scenarioResult.deltaAmount)}</span>
                <span className="text-emerald-400 font-bold">
                  Scenario Rate: Rs. {formatNumber(scenarioResult.scenarioCostPerSqft)} / sqft
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-400 block mb-1">Original Baseline Cost</span>
                <span className="text-lg font-bold text-slate-200">
                  {formatLakhCrore(scenarioResult.originalTotal)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Rs. {formatNumber(scenarioResult.originalCostPerSqft)} / sqft
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-400 block mb-1">Scenario Cost</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatLakhCrore(scenarioResult.scenarioTotal)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Rs. {formatNumber(scenarioResult.scenarioCostPerSqft)} / sqft
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100">
            Cement Price Trend Comparison (Islamabad vs Lahore vs Karachi)
          </h3>
          <p className="text-xs text-slate-400">Rates recorded over the past 30 days (Rs. per 50kg bag)</p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_CEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" domain={[1300, 1500]} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#f8fafc"
                  }}
                />
                <Line type="monotone" dataKey="isb" name="Islamabad" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="lhe" name="Lahore" stroke="#3b82f6" strokeWidth={2.5} />
                <Line type="monotone" dataKey="khi" name="Karachi" stroke="#f59e0b" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
