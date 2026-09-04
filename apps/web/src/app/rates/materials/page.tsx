"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, MapPin, CheckCircle2, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Sliders } from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function MaterialRatesPage() {
  const { materialRates, selectedCityId, setSelectedCityId } = useProjectStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  const filteredRates = materialRates.filter((r) => {
    const matchesSearch =
      r.materialName?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = r.cityId === selectedCityId || r.cityId === "isb";
    const matchesCategory = selectedCategory === "all" || r.categoryKey === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pakistan Material Rate Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified wholesale distributor & mandi rates for {selectedCity.name} and across Pakistan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/rates/history"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Rate History & Trends</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material or brand (e.g. Bestway, Steel)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["all", "civil", "structural", "masonry", "flooring", "paint"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors",
                selectedCategory === cat
                  ? "bg-emerald-600 text-white font-semibold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">Material & Brand</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4 text-right">Base Price</th>
                <th className="py-3.5 px-4 text-right">Delivered Rate</th>
                <th className="py-3.5 px-4 text-center">Trend</th>
                <th className="py-3.5 px-4">Source & Recency</th>
                <th className="py-3.5 px-4 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRates.map((r) => {
                const isPositive = (r.trendPercentage ?? 0) > 0;
                const isNegative = (r.trendPercentage ?? 0) < 0;

                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100">{r.materialName}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.brand || "Standard"} • {r.grade || "A-Quality"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">/{r.unit}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                      Rs. {formatNumber(r.baseRate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-400 text-sm">
                      Rs. {formatNumber(r.deliveredRate)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded",
                          isPositive
                            ? "text-emerald-400 bg-emerald-950/40"
                            : isNegative
                            ? "text-rose-400 bg-rose-950/40"
                            : "text-slate-400 bg-slate-800/50"
                        )}
                      >
                        {isPositive && <ArrowUpRight className="w-3 h-3" />}
                        {isNegative && <ArrowDownRight className="w-3 h-3" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                        {isPositive ? `+${r.trendPercentage}%` : `${r.trendPercentage ?? 0}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{r.sourceName}</div>
                      <div className="text-[10px] text-slate-500">Verified {r.verifiedAt}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        {r.confidenceScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Rates include local carriage & unloading within city municipal limits</span>
          <span className="text-emerald-400 font-medium">All rates marked as Verified Market Baseline</span>
        </div>
      </div>
    </div>
  );
}
