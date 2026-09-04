"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { formatPKR } from "@/lib/formatters";
import {
  BellRing,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { PAK_CITIES } from "@buildcost/config";

export default function WatchlistPage() {
  const { isAuthenticated, openLoginModal, showToast } = useAuthStore();
  const { watchlist, materialRates, addWatchlistItem, removeWatchlistItem } = useProjectStore();

  const [selectedMaterialId, setSelectedMaterialId] = useState("mat_cement");
  const [selectedCityId, setSelectedCityId] = useState("isb");
  const [alertRate, setAlertRate] = useState<number>(1450);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal({
        actionName: "add_watchlist",
        payload: { selectedMaterialId, selectedCityId, alertRate },
        message: "Sign in to activate real-time material price alerts"
      });
      return;
    }
    addWatchlistItem(selectedMaterialId, selectedCityId, alertRate);
    showToast("Material added to personal price alert watchlist!", "success");
  };

  // Unique list of materials available
  const uniqueMaterials = Array.from(new Set(materialRates.map((r) => r.materialId))).map((id) => {
    return materialRates.find((r) => r.materialId === id)!;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Personal Material Watchlist & Price Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor volatile construction inputs (Cement, Steel Rebar, Bricks, Sand) and receive price alerts.
          </p>
        </div>
      </div>

      {/* Add to Watchlist Form */}
      <form
        onSubmit={handleAdd}
        className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Plus className="w-4 h-4 text-emerald-400" />
          Add Material to Monitor
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Material</label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {uniqueMaterials.map((m) => (
                <option key={m.materialId} value={m.materialId}>
                  {m.materialName} ({m.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target City</label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {PAK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Alert Threshold (PKR)</label>
            <input
              type="number"
              value={alertRate}
              onChange={(e) => setAlertRate(Number(e.target.value))}
              placeholder="e.g. 1450"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              Set Price Alert
            </button>
          </div>
        </div>
      </form>

      {/* Watchlist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Active Monitored Items ({watchlist.length})</h3>

        {watchlist.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No materials in your watchlist yet. Add materials above to track daily wholesale movements.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {watchlist.map((w) => {
              const rateMatch = materialRates.find(
                (r) => r.materialId === w.materialId && r.cityId === w.cityId
              ) || materialRates.find((r) => r.materialId === w.materialId);

              const currentRate = rateMatch?.deliveredRate || w.targetAlertRate || 0;
              const cityName = PAK_CITIES.find((c) => c.id === w.cityId)?.name || "Islamabad";
              const isTrendingUp = (rateMatch?.trendPercentage || 0) > 0;

              return (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {cityName} Mandi
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {rateMatch?.materialName || w.materialId}
                      </h4>
                      <div className="text-[11px] text-slate-400">
                        Per {rateMatch?.unit || "unit"} • {rateMatch?.sourceName || "Official Index"}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        removeWatchlistItem(w.id);
                        showToast("Removed from watchlist", "info");
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current Delivered Rate</span>
                      <span className="text-base font-black text-white font-mono">
                        {formatPKR(currentRate)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Alert Threshold</span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {w.targetAlertRate ? formatPKR(w.targetAlertRate) : "Default"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold">
                      {isTrendingUp ? (
                        <span className="text-rose-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> +{rateMatch?.trendPercentage || 2.1}%
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" /> -{Math.abs(rateMatch?.trendPercentage || 1.2)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
