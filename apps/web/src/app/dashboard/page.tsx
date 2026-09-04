"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectSummaryPills } from "@/components/dashboard/ProjectSummaryPills";
import { CostOverviewCard } from "@/components/dashboard/CostOverviewCard";
import { LiveRateTableCard } from "@/components/dashboard/LiveRateTableCard";
import { CostDonutChartsCard } from "@/components/dashboard/CostDonutChartsCard";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";

export default function DashboardPage() {
  const { projects, activeProjectId, selectedCityId, materialRates, getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();
  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  // Dynamic calculation based on active project
  const currentEstimate = calculateCompleteHouseEstimate({
    plotAreaMarla: (activeProject?.plotArea || 15500) / (activeProject?.plotUnit === "marla" ? 1 : 225),
    marlaSqft: 225,
    coveredAreaSqft: activeProject?.coveredArea || 15500,
    numberOfFloors: activeProject?.numberOfFloors || 13,
    quality: activeProject?.constructionQuality || "premium",
    cityId: selectedCity.id,
    cityName: selectedCity.name
  });

  return (
    <div className="space-y-6">
      {/* Top Title Bar matching UI.jpg */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Construction Cost Calculator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Pakistan civil & architectural estimation engine • Local market baseline:{" "}
            <span className="text-emerald-400 font-semibold">{selectedCity.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/calculator/house-estimate"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/50"
          >
            <Calculator className="w-4 h-4" />
            <span>Open Custom Calculator</span>
          </Link>

          <Link
            href="/projects"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Switch Project</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Summary Pill Cards matching UI.jpg */}
      <ProjectSummaryPills project={activeProject} />

      {/* 2-Column Main Dashboard Grid matching UI.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostOverviewCard
          totalEstimatedCost={currentEstimate.grandTotal}
          materialsCost={currentEstimate.materialsCost}
          laborCost={currentEstimate.labourCost}
          equipmentCost={currentEstimate.equipmentCost}
          permitsCost={currentEstimate.contingencyCost + currentEstimate.otherCost}
        />

        <LiveRateTableCard
          rates={materialRates.filter((r) => r.cityId === selectedCityId || r.cityId === "isb")}
          cityName={selectedCity.name}
        />
      </div>

      {/* Bottom Dual Donut Charts and Breakdown Card matching UI.jpg */}
      <CostDonutChartsCard />
    </div>
  );
}
