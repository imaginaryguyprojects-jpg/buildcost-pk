"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Boxes,
  Compass,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ProFeatureLock } from "@/components/pro/ProFeatureLock";
import { ProBadge } from "@/components/pro/ProBadge";
import {
  PAK_VEHICLE_CAPACITIES,
  VehicleType,
  calculateTransportCost
} from "@buildcost/calculations";
import { formatPKR, formatNumber } from "@/lib/formatters";

export default function TransportLogisticsPage() {
  const { user, openUpgradeModal } = useAuthStore();
  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";

  // State for Pro mode calculations
  const [bricks, setBricks] = useState(15000);
  const [sandCft, setSandCft] = useState(1200);
  const [crushCft, setCrushCft] = useState(1000);
  const [cementBags, setCementBags] = useState(400);
  const [steelTons, setSteelTons] = useState(5.5);
  const [distanceKm, setDistanceKm] = useState(15);
  const [prefAggregate, setPrefAggregate] = useState<"tractor_trolley" | "dumper_truck">("tractor_trolley");

  const transportResult = calculateTransportCost({
    bricksCount: bricks,
    sandCft,
    crushCft,
    cementBags,
    steelTons,
    preferredAggregateVehicle: prefAggregate,
    distanceKm
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Transport &amp; Freight Logistics
            </h1>
            <ProBadge size="sm" variant="amber" showIcon />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pakistani haulage logistics, vehicle payload capacities, and manual unloading (&quot;Palledari&quot;) calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
          >
            All Calculators
          </Link>
        </div>
      </div>

      {!isPro ? (
        <div className="space-y-8">
          {/* Professional Locked Screen */}
          <ProFeatureLock
            title="Advanced Transport & Logistics Calculator"
            subtitle="Available with PRO"
            capabilities={[
              "Calculate exact truck capacity (Tractor Trolley, Dumper, Mazda, Shehzore)",
              "Optimize number of trips for bricks, sand (Rait), bajri, cement & steel",
              "Compute manual labour unloading charges (Palledari) per trip",
              "Delivery distance haulage and fuel surcharge adjustments",
              "Accurate landed cost per material unit delivered to site gate"
            ]}
            backUrl="/calculator"
            backLabel="Continue with Free Calculators"
          />

          {/* Read-Only Vehicle Specifications Preview (Section 6 & 15) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Standard Pakistani Construction Vehicle Capacities (Reference)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-configured baseline payload standards for Punjab, KPK, Sindh &amp; Federal capital.
                </p>
              </div>
              <ProBadge size="xs" variant="subtle" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(PAK_VEHICLE_CAPACITIES) as VehicleType[]).map((vKey) => {
                const v = PAK_VEHICLE_CAPACITIES[vKey];
                return (
                  <div
                    key={vKey}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {v.name}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 font-arabic">
                        {v.urduName}
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Typical Trip: Rs. {formatNumber(v.defaultTripCost)}
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div>• Bricks: Up to {formatNumber(v.maxBricks)} nos</div>
                      <div>• Sand / Crush: {v.maxSandCft} CFT</div>
                      <div>• Cement: {v.maxCementBags} bags</div>
                      <div>• Steel: {v.maxSteelTons} Tons</div>
                      <div className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                        Palledari: Rs. {formatNumber(v.palledariPerTrip)} / trip
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => openUpgradeModal("Transport Logistics Calculator")}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to PRO to Calculate Landed Freight Costs</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Full PRO Interactive Workspace */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>Site Material Quantities</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                    Bricks (Nos)
                  </label>
                  <input
                    type="number"
                    value={bricks}
                    onChange={(e) => setBricks(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                      Sand (CFT)
                    </label>
                    <input
                      type="number"
                      value={sandCft}
                      onChange={(e) => setSandCft(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                      Bajri / Crush (CFT)
                    </label>
                    <input
                      type="number"
                      value={crushCft}
                      onChange={(e) => setCrushCft(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                      Cement (Bags)
                    </label>
                    <input
                      type="number"
                      value={cementBags}
                      onChange={(e) => setCementBags(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                      Steel (Tons)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={steelTons}
                      onChange={(e) => setSteelTons(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                    Delivery Distance (km)
                  </label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1 font-semibold">
                    Aggregate Vehicle Choice
                  </label>
                  <select
                    value={prefAggregate}
                    onChange={(e) => setPrefAggregate(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="tractor_trolley">Tractor Trolley (Local Streets)</option>
                    <option value="dumper_truck">Dumper Truck (Commercial / Broad Road)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logistics Breakdown Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Transport Budget
                  </span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatPKR(transportResult.totalLogisticsCost)}
                  </div>
                  <span className="text-[10px] text-slate-400">Freight + Palledari</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Required Trips
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {transportResult.totalTripsCount} Trips
                  </div>
                  <span className="text-[10px] text-slate-400">Scheduled vehicle dispatches</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Palledari (Unloading)
                  </span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {formatPKR(transportResult.totalPalledariCost)}
                  </div>
                  <span className="text-[10px] text-slate-400">Manual labour compensation</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                  Trip Breakdown by Material
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                        <th className="py-2.5 px-4">Material</th>
                        <th className="py-2.5 px-4">Vehicle</th>
                        <th className="py-2.5 px-4 text-center">Trips</th>
                        <th className="py-2.5 px-4 text-right">Freight</th>
                        <th className="py-2.5 px-4 text-right">Palledari</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transportResult.breakdown.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {item.material} ({formatNumber(item.quantity)} {item.unit})
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {item.vehicleName}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {item.tripsRequired}
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {formatPKR(item.freightCost)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-amber-600">
                            {formatPKR(item.palledariCost)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                            {formatPKR(item.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
