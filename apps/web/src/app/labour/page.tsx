"use client";

import React, { useState } from "react";
import { Users, MapPin, CheckCircle } from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function LabourRatesPage() {
  const { labourRates, selectedCityId, setSelectedCityId } = useProjectStore();
  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pakistan Labour Wage Schedule</h1>
          <p className="text-xs text-slate-400 mt-1">
            Current skilled artisan & helper daily wages for {selectedCity.name} and major districts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {PAKISTANI_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.province})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">Trade / Discipline</th>
                <th className="py-3.5 px-4">Urdu Title</th>
                <th className="py-3.5 px-4">Skill Level</th>
                <th className="py-3.5 px-4">Pricing Unit</th>
                <th className="py-3.5 px-4 text-right">Standard Wage</th>
                <th className="py-3.5 px-4">Source & Recency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {labourRates.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{l.role}</td>
                  <td className="py-3.5 px-4 font-arabic text-emerald-400 font-semibold text-sm">
                    {l.roleUrdu || "—"}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-400">{l.skillLevel.replace("_", " ")}</td>
                  <td className="py-3.5 px-4 capitalize font-mono text-slate-300">
                    {l.pricingType.replace("_", " ")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-400 text-sm">
                    {formatPKR(l.rate)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div>{l.sourceName}</div>
                    <div className="text-[10px] text-slate-500">Verified {l.verifiedAt}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
