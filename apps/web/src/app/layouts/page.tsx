"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { HouseLayout, PlotCategory } from "@buildcost/types";
import { FloorPlanViewer2D } from "@/components/layouts/FloorPlanViewer2D";
import {
  Compass,
  Layers,
  Bed,
  Bath,
  Car,
  Maximize,
  Share2,
  Heart,
  ChevronRight,
  Filter,
  Check,
  Building2,
  FileCheck2,
  Sparkles,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLOT_TABS: { label: string; value: string; marla: number }[] = [
  { label: "All Sizes", value: "all", marla: 0 },
  { label: "3 Marla", value: "3_marla", marla: 3 },
  { label: "5 Marla", value: "5_marla", marla: 5 },
  { label: "7 Marla", value: "7_marla", marla: 7 },
  { label: "10 Marla", value: "10_marla", marla: 10 },
  { label: "1 Kanal", value: "1_kanal", marla: 20 }
];

export default function HouseLayoutsPage() {
  const router = useRouter();
  const { layouts, toggleLayoutFavorite } = useProjectStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bedFilter, setBedFilter] = useState<number | null>(null);
  const [floorFilter, setFloorFilter] = useState<number | null>(null);
  const [porchFilter, setPorchFilter] = useState<boolean | null>(null);
  const [cornerFilter, setCornerFilter] = useState<boolean | null>(null);

  const [activeModalLayout, setActiveModalLayout] = useState<HouseLayout | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered layouts
  const filteredLayouts = useMemo(() => {
    return layouts.filter((l) => {
      if (selectedCategory !== "all" && l.plotCategory !== selectedCategory) return false;
      if (bedFilter !== null && l.bedrooms !== bedFilter) return false;
      if (floorFilter !== null && l.floors !== floorFilter) return false;
      if (porchFilter !== null && l.hasCarPorch !== porchFilter) return false;
      if (cornerFilter !== null && l.isCornerPlot !== cornerFilter) return false;
      return true;
    });
  }, [layouts, selectedCategory, bedFilter, floorFilter, porchFilter, cornerFilter]);

  const handleUseInEstimate = (layout: HouseLayout) => {
    const marlaMap: Record<PlotCategory, number> = {
      "3_marla": 3,
      "5_marla": 5,
      "7_marla": 7,
      "10_marla": 10,
      "1_kanal": 20
    };
    const marla = marlaMap[layout.plotCategory] || 5;
    const query = new URLSearchParams({
      marla: marla.toString(),
      coveredArea: layout.coveredAreaSqft.toString(),
      floors: layout.floors.toString(),
      beds: layout.bedrooms.toString(),
      baths: layout.bathrooms.toString(),
      layoutName: layout.title
    });
    router.push(`/calculator/house-estimate?${query.toString()}`);
  };

  const handleShareWhatsApp = (layout: HouseLayout) => {
    const text = `🏡 *BuildCost Connect — House Floor Plan Idea*\n\n📐 *${layout.title}*\n• Plot Dimensions: ${layout.plotWidthFt}' × ${layout.plotDepthFt}' (${layout.plotAreaSqft} sq.ft)\n• Covered Area: ~${layout.coveredAreaSqft} sq.ft\n• Accommodation: ${layout.bedrooms} Beds, ${layout.bathrooms} Baths, ${layout.floors} Storey\n• Car Porch: ${layout.hasCarPorch ? "Yes" : "No"}\n• Features: ${layout.hasDrawingRoom ? "Drawing Room, " : ""}${layout.hasTvLounge ? "TV Lounge, " : ""}${layout.isCornerPlot ? "Corner Plot" : ""}\n\n*Note:* Conceptual planning template. Consult civil engineer for LDA/CDA structural approvals.\n🔗 View cost estimate on: https://buildcost.pk`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Standard Residential CAD Library</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
            Pakistani House Floor Plans &amp; 2D Layouts
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Explore architecturally optimized residential layout templates tailored for Pakistani plot sizes (3, 5, 7, 10 Marla &amp; 1 Kanal). View room dimensions, car porches, setbacks, and convert directly into a construction cost estimate with 1 click.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {PLOT_TABS.map((tab) => {
          const isActive = selectedCategory === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedCategory(tab.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <span>{tab.label}</span>
              {tab.marla > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-md font-mono",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  {tab.marla * 225} sqft
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-500" />
          <span>Filters:</span>
        </div>

        {/* Bedrooms Filter */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Beds:</span>
          {[2, 3, 4, 5].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBedFilter(bedFilter === b ? null : b)}
              className={cn(
                "px-2 py-1 rounded-lg font-semibold transition-colors",
                bedFilter === b
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              )}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Floors Filter */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Storeys:</span>
          {[1, 2].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFloorFilter(floorFilter === f ? null : f)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors",
                floorFilter === f
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              )}
            >
              {f === 1 ? "Single" : "Double"}
            </button>
          ))}
        </div>

        {/* Car Porch Filter */}
        <button
          type="button"
          onClick={() => setPorchFilter(porchFilter === true ? null : true)}
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1",
            porchFilter === true
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          )}
        >
          <Car className="w-3 h-3" />
          <span>Car Porch</span>
        </button>

        {/* Corner Plot Filter */}
        <button
          type="button"
          onClick={() => setCornerFilter(cornerFilter === true ? null : true)}
          className={cn(
            "px-2.5 py-1 rounded-lg font-semibold transition-colors",
            cornerFilter === true
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          )}
        >
          Corner Plot
        </button>

        {/* Clear filters */}
        {(bedFilter !== null || floorFilter !== null || porchFilter !== null || cornerFilter !== null) && (
          <button
            type="button"
            onClick={() => {
              setBedFilter(null);
              setFloorFilter(null);
              setPorchFilter(null);
              setCornerFilter(null);
            }}
            className="text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLayouts.map((layout) => {
          return (
            <div
              key={layout.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col group"
            >
              {/* Card Header & Mini Vector Thumbnail Preview */}
              <div
                onClick={() => setActiveModalLayout(layout)}
                className="cursor-pointer relative h-48 bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-center overflow-hidden group-hover:bg-slate-50 dark:group-hover:bg-[#0c1422] transition-colors"
              >
                {/* Mini SVG representation */}
                <div className="w-40 h-36 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col justify-between p-2 relative bg-white/60 dark:bg-slate-900/60 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{layout.plotWidthFt}&apos;W</span>
                    <span>{layout.plotDepthFt}&apos;D</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 my-auto">
                    <div className="bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 rounded p-1 text-[9px] font-bold text-center text-blue-700 dark:text-blue-300">
                      Bed
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 rounded p-1 text-[9px] font-bold text-center text-purple-700 dark:text-purple-300">
                      Lounge
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded p-1 text-[9px] font-bold text-center text-amber-700 dark:text-amber-300">
                      Kitchen
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-1 text-[9px] font-bold text-center text-slate-700 dark:text-slate-300">
                      Porch
                    </div>
                  </div>
                  <div className="text-center text-[9px] font-bold text-slate-400">
                    Road / Street
                  </div>
                </div>

                {/* Click to expand hover overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-xs">
                  <Maximize className="w-4 h-4" />
                  <span>View 2D Blueprint</span>
                </div>

                {/* Favorite Heart Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayoutFavorite(layout.id);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-colors shadow-xs"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      layout.isFavorite && "fill-rose-500 text-rose-500"
                    )}
                  />
                </button>

                {/* Plot Category Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/85 text-white backdrop-blur shadow-xs">
                  {layout.plotCategory.replace("_", " ")}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {layout.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md shrink-0">
                    {layout.plotWidthFt}&apos; × {layout.plotDepthFt}&apos;
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {layout.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                      <Bed className="w-3 h-3 text-blue-500" />
                      <span>Beds</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {layout.bedrooms}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                      <Bath className="w-3 h-3 text-cyan-500" />
                      <span>Baths</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {layout.bathrooms}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3 text-amber-500" />
                      <span>Covered</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs mt-1 font-mono">
                      {layout.coveredAreaSqft} sqft
                    </div>
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {layout.hasCarPorch && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      🚗 Car Porch
                    </span>
                  )}
                  {layout.hasTvLounge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                      📺 TV Lounge
                    </span>
                  )}
                  {layout.hasDrawingRoom && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                      🛋️ Drawing
                    </span>
                  )}
                  {layout.isCornerPlot && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      🌟 Corner Plot
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseInEstimate(layout)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Use In Estimate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(layout)}
                    title="Share on WhatsApp"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full 2D Blueprint Modal */}
      {activeModalLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                  {activeModalLayout.title} — 2D Architectural Layout
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalLayout(null)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <FloorPlanViewer2D
                layout={activeModalLayout}
                onUseInEstimate={() => {
                  const target = activeModalLayout;
                  setActiveModalLayout(null);
                  handleUseInEstimate(target);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
