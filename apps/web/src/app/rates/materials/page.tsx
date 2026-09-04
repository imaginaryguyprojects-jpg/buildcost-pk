"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Building,
  Info,
  ExternalLink
} from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function MaterialRatesPage() {
  const { materialRates, selectedCityId, setSelectedCityId, syncAuthenticRates, lastSyncTimestamp } = useProjectStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  const categories = [
    { id: "all", label: "All Materials" },
    { id: "civil", label: "Civil & Foundation" },
    { id: "structural", label: "Structural Steel" },
    { id: "masonry", label: "Bricks & Blocks" },
    { id: "flooring", label: "Tiles & Flooring" },
    { id: "paint", label: "Paints & Finishes" },
    { id: "plumbing", label: "Plumbing & Pipes" },
    { id: "electrical", label: "Cables & Electrical" },
    { id: "woodwork", label: "Doors & Wood" },
    { id: "sanitary", label: "Sanitary Ware" },
    { id: "aluminium", label: "Aluminium & Glass" }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncAuthenticRates();
      setIsSyncing(false);
    }, 700);
  };

  const filteredRates = materialRates.filter((r) => {
    const matchesSearch =
      r.materialName?.toLowerCase().includes(search.toLowerCase()) ||
      r.brand?.toLowerCase().includes(search.toLowerCase()) ||
      r.grade?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = r.cityId === selectedCityId || r.cityId === "isb";
    const matchesCategory = selectedCategory === "all" || r.categoryKey === selectedCategory;
    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pakistan Material Rate Engine
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Authentic Live Feeds
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified wholesale distributor, association indices & mandi rates for{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCity.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
            <span>{isSyncing ? "Syncing..." : "Refresh Live Feeds"}</span>
          </button>

          <Link
            href="/rates/history"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>30-Day Trends</span>
          </Link>
        </div>
      </div>

      {/* Authentic Source Telemetry Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Authorized Regulatory & Association Rate Providers
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prices calibrated with official PBS indices, APCMA, PSRMA, and wholesale district distribution ledgers.
              </p>
            </div>
          </div>

          <div className="text-left md:text-right text-xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Last Verified
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{lastSyncTimestamp}</span>
          </div>
        </div>

        {/* Association Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">Cement</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">APCMA & PBS Index</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">Steel (Grade 60)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">PSRMA & Badami Bagh</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">Bricks & Masonry</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">Bhatta Association</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-0.5">Cables & Electrical</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">Pakistan Cables Depot</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by material, brand, or grade (e.g., Bestway, Mughal, Porcelain)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500 dark:text-slate-400">
            <span>City Market:</span>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {PAKISTANI_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material Rates Table */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">Material & Specification</th>
                <th className="py-3.5 px-4">Brand / Manufacturer</th>
                <th className="py-3.5 px-4">Unit</th>
                <th className="py-3.5 px-4 text-right">Delivered Rate</th>
                <th className="py-3.5 px-4 text-center">Trend (24h)</th>
                <th className="py-3.5 px-4">Authentic Source Attribution</th>
                <th className="py-3.5 px-4 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRates.map((r) => {
                const isPositive = (r.trendPercentage ?? 0) > 0;
                const isNegative = (r.trendPercentage ?? 0) < 0;

                return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{r.materialName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {r.grade || "Commercial Grade"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {r.brand || "Verified Manufacturer"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">/{r.unit}</td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      Rs. {formatNumber(r.deliveredRate)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded",
                          isPositive
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            : isNegative
                            ? "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                            : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50"
                        )}
                      >
                        {isPositive && <ArrowUpRight className="w-3 h-3" />}
                        {isNegative && <ArrowDownRight className="w-3 h-3" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                        {isPositive ? `+${r.trendPercentage}%` : `${r.trendPercentage ?? 0}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{r.sourceName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Verified {r.verifiedAt}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        {r.confidenceScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Rates include local carriage & unloading within municipal limits of {selectedCity.name}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Source Status: Verified Authentic Feeds</span>
        </div>
      </div>
    </div>
  );
}
