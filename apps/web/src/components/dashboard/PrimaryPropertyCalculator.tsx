"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calculator,
  Building2,
  Home,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  FileSpreadsheet,
  Layers,
  Clock,
  Sparkles,
  TrendingUp,
  Truck,
  Hammer,
  Boxes,
  HelpCircle,
  ArrowRight,
  Sliders,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Coins,
  Search,
  Building,
  Check,
  Info
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { calculateGreyStructureEstimate, calculateFullHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export type PlotUnit = "marla" | "kanal" | "sqft";
export type ConstructionScope = "grey" | "complete" | "custom";
export type QualityTier = "standard" | "economy" | "premium" | "luxury";

// Marla standard presets matching prompt
export const MARLA_STANDARD_PRESETS = [
  { id: "272.25", label: "272.25 sq ft", region: "Islamabad, Rawalpindi, CDA standard", sqft: 272.25 },
  { id: "250", label: "250 sq ft", region: "Lahore standard", sqft: 250 },
  { id: "225", label: "225 sq ft", region: "Karachi, traditional", sqft: 225 },
  { id: "custom", label: "Custom", region: "1 Marla = Custom sq ft", sqft: 272.25 }
];

// Quick city chips (Top 5 major Pakistan cities)
const QUICK_CITIES = [
  { id: "isb", name: "Islamabad" },
  { id: "rwp", name: "Rawalpindi" },
  { id: "lhr", name: "Lahore" },
  { id: "khi", name: "Karachi" },
  { id: "pew", name: "Peshawar" }
];

// Benchmark rates per city category
const CITY_BENCHMARKS: Record<string, { cement: number; steel: number; brick: number; sand: number; crush: number; labour: number; transportPerSqft: number }> = {
  isb: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 },
  rwp: { cement: 1450, steel: 262, brick: 14.0, sand: 45, crush: 92, labour: 420, transportPerSqft: 35 },
  lhr: { cement: 1430, steel: 258, brick: 13.5, sand: 42, crush: 88, labour: 410, transportPerSqft: 32 },
  khi: { cement: 1480, steel: 268, brick: 15.0, sand: 50, crush: 105, labour: 450, transportPerSqft: 40 },
  pew: { cement: 1440, steel: 262, brick: 13.8, sand: 44, crush: 90, labour: 400, transportPerSqft: 34 },
  default: { cement: 1450, steel: 260, brick: 14.0, sand: 45, crush: 95, labour: 420, transportPerSqft: 35 }
};

export function PrimaryPropertyCalculator() {
  const { isAuthenticated, openLoginModal, openProjectUpgradeModal, openCheckoutModal, showToast } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. City Selection
  const [selectedCityId, setSelectedCityId] = useState<string>("isb");

  // 2. Marla Standard (272.25, 250, 225, or custom)
  const [marlaStandardType, setMarlaStandardType] = useState<string>("272.25");
  const [customMarlaSqft, setCustomMarlaSqft] = useState<number>(272.25);

  // 3. Property / Plot Size
  const [plotUnit, setPlotUnit] = useState<PlotUnit>("marla");
  const [plotSize, setPlotSize] = useState<number>(5);

  // 4. Floors & Covered Area
  const [floorsSelection, setFloorsSelection] = useState<number | "custom">(2);
  const [customFloors, setCustomFloors] = useState<number>(4);
  const effectiveFloors = floorsSelection === "custom" ? Math.max(1, customFloors) : Number(floorsSelection);

  // Active Marla sq ft value
  const activeMarlaSqft = useMemo(() => {
    if (marlaStandardType === "custom") return Math.max(50, customMarlaSqft || 272.25);
    if (marlaStandardType === "250") return 250;
    if (marlaStandardType === "225") return 225;
    return 272.25;
  }, [marlaStandardType, customMarlaSqft]);

  // Derived plot area in square feet
  const plotAreaSqft = useMemo(() => {
    const size = Math.max(0.01, plotSize || 1);
    if (plotUnit === "marla") {
      return size * activeMarlaSqft;
    } else if (plotUnit === "kanal") {
      return size * 20 * activeMarlaSqft;
    } else {
      return size;
    }
  }, [plotSize, plotUnit, activeMarlaSqft]);

  // Derived plot area in Marlas and Kanals
  const plotAreaInMarlas = plotAreaSqft / activeMarlaSqft;
  const plotAreaInKanals = plotAreaInMarlas / 20;

  // Auto suggested covered area: ~70% plot coverage * number of floors
  const autoSuggestedCoveredArea = useMemo(() => {
    return Math.round(plotAreaSqft * 0.7 * effectiveFloors);
  }, [plotAreaSqft, effectiveFloors]);

  const [coveredAreaSqft, setCoveredAreaSqft] = useState<number>(autoSuggestedCoveredArea);
  const [isCoveredAreaManuallyModified, setIsCoveredAreaManuallyModified] = useState<boolean>(false);

  // Update covered area automatically when plot or floors change unless user manually overrode it
  useEffect(() => {
    if (!isCoveredAreaManuallyModified) {
      setCoveredAreaSqft(autoSuggestedCoveredArea);
    }
  }, [autoSuggestedCoveredArea, isCoveredAreaManuallyModified]);

  // 5. Construction Scope & Quality Tier
  const [constructionScope, setConstructionScope] = useState<ConstructionScope>("grey");
  const [qualityTier, setQualityTier] = useState<QualityTier>("standard");

  // Selected city object
  const selectedCity = useMemo(() => {
    return PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];
  }, [selectedCityId]);

  // Active City Benchmark Rates
  const cityRates = useMemo(() => {
    return CITY_BENCHMARKS[selectedCityId] || CITY_BENCHMARKS.default;
  }, [selectedCityId]);

  // 6. Custom Rates Panel State
  const [showRatesPanel, setShowRatesPanel] = useState<boolean>(false);
  const [useCustomRates, setUseCustomRates] = useState<boolean>(false);
  const [customRates, setCustomRates] = useState({
    cement: cityRates.cement,
    steel: cityRates.steel,
    brick: cityRates.brick,
    sand: cityRates.sand,
    crush: cityRates.crush,
    labour: cityRates.labour
  });

  // Keep custom rates aligned when city changes if custom rates are not currently applied
  useEffect(() => {
    if (!useCustomRates) {
      setCustomRates({
        cement: cityRates.cement,
        steel: cityRates.steel,
        brick: cityRates.brick,
        sand: cityRates.sand,
        crush: cityRates.crush,
        labour: cityRates.labour
      });
    }
  }, [cityRates, useCustomRates]);

  // Handle City Change (Auto-suggests local Marla Standard)
  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    const city = PAKISTANI_CITIES.find((c) => c.id === cityId);
    if (city) {
      if (city.defaultMarlaSqft === 250) {
        setMarlaStandardType("250");
      } else if (city.defaultMarlaSqft === 225) {
        setMarlaStandardType("225");
      } else {
        setMarlaStandardType("272.25");
      }
    }
  };

  // Reset Rates to City Defaults
  const handleResetToCityRates = () => {
    setCustomRates({
      cement: cityRates.cement,
      steel: cityRates.steel,
      brick: cityRates.brick,
      sand: cityRates.sand,
      crush: cityRates.crush,
      labour: cityRates.labour
    });
    setUseCustomRates(false);
    showToast(`Rates reset to official ${selectedCity.name} market benchmarks`, "info");
  };

  // 7. Core Calculations
  const activeRates = useMemo(() => {
    if (useCustomRates) {
      return {
        cementBagRate: customRates.cement,
        steelKgRate: customRates.steel,
        brickRate: customRates.brick,
        sandCftRate: customRates.sand,
        crushCftRate: customRates.crush,
        labourSqftRate: customRates.labour,
        transportRate: Math.round(coveredAreaSqft * cityRates.transportPerSqft)
      };
    }
    return {
      cementBagRate: cityRates.cement,
      steelKgRate: cityRates.steel,
      brickRate: cityRates.brick,
      sandCftRate: cityRates.sand,
      crushCftRate: cityRates.crush,
      labourSqftRate: cityRates.labour,
      transportRate: Math.round(coveredAreaSqft * cityRates.transportPerSqft)
    };
  }, [useCustomRates, customRates, cityRates, coveredAreaSqft]);

  const calculationResult = useMemo(() => {
    const safeCovered = Math.max(50, coveredAreaSqft || autoSuggestedCoveredArea);
    const safeFloors = Math.max(1, effectiveFloors);

    // 1. Grey structure civil engineering estimate
    const greyEst = calculateGreyStructureEstimate({
      coveredAreaSqft: safeCovered,
      numberOfFloors: safeFloors,
      rates: activeRates
    });

    // 2. Full house estimate (finishing package included)
    const fullEst = calculateFullHouseEstimate({
      plotAreaMarla: Math.max(0.1, plotAreaInMarlas),
      coveredAreaSqft: safeCovered,
      numberOfFloors: safeFloors,
      quality: qualityTier,
      rates: activeRates
    });

    const isGreyOnly = constructionScope === "grey";
    const totalCost = isGreyOnly ? greyEst.costs.grandTotal : fullEst.summary.totalProjectEstimate;
    const costPerSqft = Math.round(totalCost / safeCovered);

    // Itemized costs
    const cementCost = greyEst.materials.cement.finalQuantity * activeRates.cementBagRate;
    const steelCost = greyEst.materials.steel.finalQuantity * activeRates.steelKgRate;
    const bricksCost = greyEst.materials.bricks.finalQuantity * activeRates.brickRate;
    const sandCost = greyEst.materials.sand.finalQuantity * activeRates.sandCftRate;
    const crushCost = greyEst.materials.crush.finalQuantity * activeRates.crushCftRate;
    const labourCost = greyEst.costs.labourCost;
    const transportCost = greyEst.costs.transportCost;
    const wastageCost = Math.round((cementCost + steelCost + bricksCost + sandCost + crushCost) * 0.045);
    const finishingCost = isGreyOnly ? 0 : Math.round(totalCost - greyEst.costs.grandTotal);

    // Timeline in months
    const estimatedDurationMonths =
      safeFloors === 1 ? "4 - 5" : safeFloors === 2 ? "7 - 9" : safeFloors === 3 ? "10 - 12" : "13 - 16";

    // Dynamic Chart Data with real calculated percentages (not hardcoded)
    const chartItems = [
      { name: "Cement", cost: cementCost, color: "#059669" },      // Emerald
      { name: "Steel (Saria)", cost: steelCost, color: "#2563eb" }, // Blue
      { name: "Bricks", cost: bricksCost, color: "#d97706" },      // Amber
      { name: "Sand & Crush", cost: sandCost + crushCost, color: "#0891b2" }, // Cyan
      { name: "Labour & Shuttering", cost: labourCost, color: "#7c3aed" },    // Purple
      { name: "Transport & Logistics", cost: transportCost, color: "#ea580c" },// Orange
      { name: "Wastage Allowance", cost: wastageCost, color: "#64748b" }     // Slate
    ];

    if (!isGreyOnly) {
      chartItems.push({ name: "Finishing Package", cost: finishingCost, color: "#ec4899" }); // Pink
    }

    const chartTotal = chartItems.reduce((acc, i) => acc + i.cost, 0);
    const chartData = chartItems.map((item) => ({
      name: item.name,
      value: item.cost,
      percentage: chartTotal > 0 ? ((item.cost / chartTotal) * 100).toFixed(1) : "0",
      color: item.color
    }));

    return {
      totalCost,
      costPerSqft,
      greyStructureCost: greyEst.costs.grandTotal,
      finishingCost,
      estimatedDurationMonths,
      cementBags: greyEst.materials.cement.finalQuantity,
      cementCost,
      steelKg: greyEst.materials.steel.finalQuantity,
      steelTons: (greyEst.materials.steel.finalQuantity / 1000).toFixed(2),
      steelCost,
      bricksCount: greyEst.materials.bricks.finalQuantity,
      bricksCost,
      sandCft: greyEst.materials.sand.finalQuantity,
      sandCost,
      crushCft: greyEst.materials.crush.finalQuantity,
      crushCost,
      labourCost,
      transportCost,
      wastageCost,
      chartData,
      activeRates
    };
  }, [
    coveredAreaSqft,
    autoSuggestedCoveredArea,
    effectiveFloors,
    activeRates,
    qualityTier,
    constructionScope
  ]);

  // CTA Submit
  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Calculated successfully! Real Pakistani civil benchmarks applied.", "success");
    const el = document.getElementById("calculation-results-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Pro features gate
  const handleProFeature = (name: string) => {
    if (!isAuthenticated) {
      showToast(`${name} is a Pro feature. Please sign in or upgrade.`, "info");
      openLoginModal();
    } else {
      openProjectUpgradeModal();
    }
  };

  return (
    <div className="w-full space-y-4 font-sans text-slate-900 dark:text-slate-100">
      {/* ======================================================== */}
      {/* 100% FREE BADGE BANNER */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 text-xs shadow-md">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">100% Free Pakistan Property Construction Calculator:</strong> Real-time civil engineering calculations, material quantities, custom rate overrides, and area conversions.
          </span>
        </div>
        <button
          type="button"
          onClick={() => openCheckoutModal()}
          className="shrink-0 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-[11px] flex items-center gap-1.5 shadow-md transition-all"
        >
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* HERO PROPERTY CALCULATOR CARD */}
      {/* ======================================================== */}
      <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-28 -right-28 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Property Construction Calculator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[10px] uppercase tracking-wider">
                  100% Free
                </span>
                {useCustomRates && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                    Custom Rates Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate exact house construction costs across 28 Pakistani cities with live material benchmarks.
              </p>
            </div>
          </div>

          {/* Pro Action Buttons in Header */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleProFeature("Save Project")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-800 shadow-xs"
              title="Save calculation into your project Khata"
            >
              <span>Save Project</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleProFeature("PDF Export")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-800 shadow-xs"
              title="Export contractor-ready PDF estimate"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>PDF Report</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INPUTS FORM */}
        {/* ======================================================== */}
        <form onSubmit={handleCalculateSubmit} className="pt-5 space-y-5">
          {/* 1. CITY SELECTION */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select City / Market Location</span>
                <span className="text-emerald-400 text-[11px] font-medium">
                  ({selectedCity.name} — {selectedCity.urduName})
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                Default Marla: <strong className="text-emerald-400">{selectedCity.defaultMarlaSqft} sq ft</strong>
              </span>
            </div>

            {/* Quick City Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Cities:</span>
              {QUICK_CITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCitySelect(c.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-semibold transition-all",
                    selectedCityId === c.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950 border border-emerald-400/40"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Searchable Dropdown for all 28 cities */}
            <div className="relative">
              <select
                value={selectedCityId}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium focus:outline-none transition-colors appearance-none cursor-pointer pr-10"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.urduName}) — {c.province} • {c.defaultMarlaSqft} sqft/Marla
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2 & 3. PROPERTY / PLOT SIZE & MARLA STANDARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 2. Marla Standards Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Marla Standard (Conversion Benchmark)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {MARLA_STANDARD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setMarlaStandardType(preset.id);
                      if (preset.id !== "custom") {
                        setCustomMarlaSqft(preset.sqft);
                      }
                    }}
                    className={cn(
                      "p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center min-h-[54px]",
                      marlaStandardType === preset.id
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <span className="text-xs font-black">{preset.label}</span>
                    <span className="text-[9px] opacity-80 truncate max-w-full px-1">{preset.region}</span>
                  </button>
                ))}
              </div>

              {/* Custom Marla Input (revealed when custom chosen) */}
              {marlaStandardType === "custom" && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="text-xs text-slate-300 font-semibold shrink-0">1 Marla =</span>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={customMarlaSqft}
                    onChange={(e) => setCustomMarlaSqft(parseFloat(e.target.value) || 272.25)}
                    className="w-28 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">sq ft</span>
                  <span className="text-[10px] text-emerald-400 ml-auto">Custom Unit Active</span>
                </div>
              )}
            </div>

            {/* 3. Plot Size & Unit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Plot Size &amp; Measurement Unit</span>
                </label>
                {/* Segmented Unit Selector */}
                <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-bold">
                  {(['marla', 'kanal', 'sqft'] as PlotUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setPlotUnit(u)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all capitalize",
                        plotUnit === u
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      {u === 'sqft' ? 'Sq Ft' : u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Size Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 mr-1">Popular:</span>
                {plotUnit === "marla" && (
                  <>
                    {[3, 5, 7, 10, 20].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPlotSize(sz)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                          plotSize === sz
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        )}
                      >
                        {sz === 20 ? "20 Marla (1 Kanal)" : `${sz} Marla`}
                      </button>
                    ))}
                  </>
                )}
                {plotUnit === "kanal" && (
                  <>
                    {[0.5, 1, 2, 4].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPlotSize(sz)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                          plotSize === sz
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        )}
                      >
                        {sz === 0.5 ? "0.5 Kanal (10 Marla)" : `${sz} Kanal`}
                      </button>
                    ))}
                  </>
                )}
                {plotUnit === "sqft" && (
                  <>
                    {[1125, 1361, 2250, 2722.5, 5445].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setPlotSize(sz)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                          plotSize === sz
                            ? "bg-emerald-600 text-white border-emerald-400"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        )}
                      >
                        {formatNumber(sz)} sqft
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Number Input allowing decimals */}
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={plotSize}
                  onChange={(e) => setPlotSize(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none transition-colors pr-20"
                  placeholder="5"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-emerald-400 uppercase">
                  {plotUnit === "sqft" ? "Sq Ft" : plotUnit}
                </span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. AREA CONVERSION SUMMARY CARD (CORE REQUIREMENT) */}
          {/* ======================================================== */}
          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-emerald-500/30 text-xs shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Area Conversion Summary
                </span>
                <div className="text-sm font-black text-emerald-400 tracking-tight flex flex-wrap items-center gap-1.5">
                  <span>
                    {plotUnit === "marla" && `${plotSize} Marla`}
                    {plotUnit === "kanal" && `${plotSize} Kanal`}
                    {plotUnit === "sqft" && `${formatNumber(plotSize)} Sq Ft`}
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-white">{formatNumber(plotAreaSqft, 2)} Sq Ft</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-cyan-400">{plotAreaInKanals.toFixed(2)} Kanal</span>
                  <span className="text-slate-400 font-normal text-xs">
                    ({plotAreaInMarlas.toFixed(2)} Marla)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-[10px] text-slate-400 block">Active Benchmark</span>
              <span className="font-bold text-xs text-slate-200">
                1 Marla = <strong className="text-emerald-400">{activeMarlaSqft} sq ft</strong>
              </span>
            </div>
          </div>

          {/* 5. FLOORS, COVERED AREA & SCOPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Number of Floors */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 block">Number of Floors</label>
              <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                {[
                  { id: 1, label: "1 Floor" },
                  { id: 2, label: "2 Floors" },
                  { id: 3, label: "3 Floors" },
                  { id: "custom", label: "Custom" }
                ].map((fl) => (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => setFloorsSelection(fl.id as any)}
                    className={cn(
                      "py-2 px-1 text-center rounded-lg transition-all",
                      floorsSelection === fl.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>

              {floorsSelection === "custom" && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Total Storeys:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customFloors}
                    onChange={(e) => setCustomFloors(parseInt(e.target.value) || 1)}
                    className="w-20 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Plaza / Mid-Rise</span>
                </div>
              )}
            </div>

            {/* Covered Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200">Covered Area (Sq Ft)</label>
                <button
                  type="button"
                  onClick={() => {
                    setCoveredAreaSqft(autoSuggestedCoveredArea);
                    setIsCoveredAreaManuallyModified(false);
                  }}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                  title="Reset to civil standard recommended coverage"
                >
                  Auto: {formatNumber(autoSuggestedCoveredArea)} sqft
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  value={coveredAreaSqft}
                  onChange={(e) => {
                    setCoveredAreaSqft(parseInt(e.target.value) || 50);
                    setIsCoveredAreaManuallyModified(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none transition-colors pr-14"
                  placeholder="2200"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-500">
                  Sq Ft
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Suggested ~70% footprint per floor
              </span>
            </div>

            {/* Construction Scope */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="font-bold text-slate-200 block">Construction Scope</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                {[
                  { id: "grey", label: "Grey Structure" },
                  { id: "complete", label: "Complete House" },
                  { id: "custom", label: "Custom Scope" }
                ].map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setConstructionScope(sc.id as ConstructionScope)}
                    className={cn(
                      "py-2 px-1 text-center rounded-lg transition-all",
                      constructionScope === sc.id
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>

              {/* Quality Tier if complete or custom */}
              {constructionScope !== "grey" && (
                <div className="pt-1 animate-in fade-in duration-200">
                  <select
                    value={qualityTier}
                    onChange={(e) => setQualityTier(e.target.value as QualityTier)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none"
                  >
                    <option value="standard">Standard (A-Class Pakistani Specs)</option>
                    <option value="economy">Economy (Essential Local Materials)</option>
                    <option value="premium">Premium (Imported Tiles &amp; Fixtures)</option>
                    <option value="luxury">Luxury (Designer Architectural Build)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CUSTOM / MANUAL RATES DRAWER PANEL */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 overflow-hidden transition-all">
            <div
              className="flex items-center justify-between p-3.5 sm:px-4 cursor-pointer hover:bg-slate-900/60 transition-colors select-none"
              onClick={() => setShowRatesPanel(!showRatesPanel)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors shrink-0",
                    useCustomRates
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  )}
                >
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Material Rates (Cement, Steel, Bricks, Sand, Crush, Labour)
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                      Free Live Recalculation
                    </span>
                    {useCustomRates ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[9px] uppercase tracking-wider">
                        Custom Rates Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        {selectedCity.name} Official Benchmarks
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Override city benchmarks with your local mandi or supplier quotes. Instant recalculation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">
                  {showRatesPanel ? "Hide Rates" : "Edit Rates"}
                </span>
                {showRatesPanel ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expandable Rates Content */}
            {showRatesPanel && (
              <div className="p-4 pt-3 border-t border-slate-800/80 bg-slate-950 space-y-4 animate-in fade-in duration-200 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-400 pb-1">
                  <span>Edit any rate below to see the calculation update instantly:</span>
                  <span className="text-emerald-400 font-bold">Currency: Pakistani Rupee (PKR)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Cement */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Cement (Bag)</label>
                      <span className="text-[9px] font-semibold text-slate-500">50kg</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customRates.cement}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, cement: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.cement}
                    </span>
                  </div>

                  {/* Steel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Steel (Kg)</label>
                      <span className="text-[9px] font-semibold text-slate-500">Grade 60</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customRates.steel}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, steel: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.steel}
                    </span>
                  </div>

                  {/* Bricks */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Bricks (Pc)</label>
                      <span className="text-[9px] font-semibold text-slate-500">Awwal</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={customRates.brick}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, brick: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.brick}
                    </span>
                  </div>

                  {/* Sand */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Sand (Cft)</label>
                      <span className="text-[9px] font-semibold text-slate-500">Chenab/Ravi</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customRates.sand}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, sand: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.sand}
                    </span>
                  </div>

                  {/* Crush */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Crush (Cft)</label>
                      <span className="text-[9px] font-semibold text-slate-500">Margalla</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customRates.crush}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, crush: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.crush}
                    </span>
                  </div>

                  {/* Labour */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300">Labour (Sqft)</label>
                      <span className="text-[9px] font-semibold text-slate-500">Civil Shell</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customRates.labour}
                        onChange={(e) => {
                          setCustomRates((prev) => ({ ...prev, labour: parseFloat(e.target.value) || 0 }));
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      City: Rs {cityRates.labour}
                    </span>
                  </div>
                </div>

                {/* Rates Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseCustomRates(!useCustomRates)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all",
                        useCustomRates
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{useCustomRates ? "Custom Rates Applied (Active)" : "Apply Custom Rates"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToCityRates}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700/60"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Reset to City Rates</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    💡 Free instant calculation. Upgrade to Pro to save customized rate profiles.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* CALCULATE CTA BUTTON */}
          {/* ======================================================== */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer tracking-wide"
            >
              <Calculator className="w-5 h-5" />
              <span>CALCULATE FREE</span>
            </button>
          </div>
        </form>

        {/* ======================================================== */}
        {/* RESULTS HERO SECTION (ANCHOR) */}
        {/* ======================================================== */}
        <div id="calculation-results-anchor" className="mt-8 pt-6 border-t border-slate-800/90 space-y-6 animate-in fade-in duration-300">
          {/* 7. ESTIMATED COST RESULT (HERO CARD) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {constructionScope === "grey"
                      ? "ESTIMATED GREY STRUCTURE COST"
                      : "ESTIMATED COMPLETE HOUSE COST"}{' '}
                    • {selectedCity.name}
                  </span>
                </h2>
                {useCustomRates && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                    Custom Rates Active
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-300">
                {formatLakhCrore(calculationResult.totalCost)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              {/* Grand Total */}
              <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <span className="text-[11px] text-emerald-400 font-black uppercase tracking-wider block mb-1">
                  {constructionScope === "grey" ? "Grey Structure Estimate" : "Complete Turnkey Estimate"}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight py-0.5">
                  {formatPKR(calculationResult.totalCost)}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300 font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {formatLakhCrore(calculationResult.totalCost)}
                  </span>
                  <span className="text-slate-400 font-normal">
                    • Rs {formatNumber(calculationResult.costPerSqft)} / sq ft
                  </span>
                </div>
              </div>

              {/* Cost / Sq Ft & Construction Area */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Cost / Sq Ft &amp; Area
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">
                    Rs {formatNumber(calculationResult.costPerSqft)}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  Construction Area: <strong className="text-white">{formatNumber(coveredAreaSqft)} sq ft</strong>
                </div>
              </div>

              {/* Timeline Duration */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Estimated Duration
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{calculationResult.estimatedDurationMonths} Months</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                  Standard Pakistani civil schedule
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 8. MATERIAL COST GRAPH: DONUT CHART WITH REAL PERCENTAGES */}
          {/* ======================================================== */}
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>
                    {constructionScope === "grey"
                      ? "GREY STRUCTURE COST BREAKDOWN"
                      : "CONSTRUCTION COST BREAKDOWN"}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculated dynamic percentage shares for materials, civil labour, transport, and wastage.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">
                Total: {formatPKR(calculationResult.totalCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart Canvas */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
                {isMounted ? (
                  <div className="w-52 h-52 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value: any, name: any) => [formatPKR(Number(value)), name]}
                          contentStyle={{
                            backgroundColor: "#020617",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            color: "#f8fafc",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)"
                          }}
                        />
                        <Pie
                          data={calculationResult.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {calculationResult.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Donut Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Cost / Sqft</span>
                      <span className="text-base font-black text-white">
                        Rs {formatNumber(calculationResult.costPerSqft)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-500">
                    Loading chart...
                  </div>
                )}
              </div>

              {/* Dynamic Legend List with Real Percentages & Amounts */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {calculationResult.chartData.map((item) => (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-200 font-semibold truncate text-[11px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-white font-bold block text-xs">
                        {formatPKR(item.value)}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 9. MATERIAL COST CARDS (ITEMIZED QUANTITIES & COSTS) */}
          {/* ======================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-400" />
                <span>Itemized Material Quantities &amp; Civil Estimates</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Calibrated to Pakistan Engineering Council standards
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Cement */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Cement</span>
                  <span className="text-[9px] text-emerald-400">50kg Bags</span>
                </div>
                <div className="text-lg font-black text-white">
                  {formatNumber(calculationResult.cementBags)} Bags
                </div>
                <div className="text-[10px] text-slate-400">
                  @ Rs {formatNumber(calculationResult.activeRates.cementBagRate)} / bag
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.cementCost)}
                </div>
              </div>

              {/* Steel */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Steel</span>
                  <span className="text-[9px] text-emerald-400">Grade 60</span>
                </div>
                <div className="text-lg font-black text-white">
                  {calculationResult.steelTons} Tons
                </div>
                <div className="text-[10px] text-slate-400">
                  ({formatNumber(calculationResult.steelKg)} kg @ Rs {calculationResult.activeRates.steelKgRate}/kg)
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.steelCost)}
                </div>
              </div>

              {/* Bricks */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Bricks</span>
                  <span className="text-[9px] text-emerald-400">Awwal 1st</span>
                </div>
                <div className="text-lg font-black text-white">
                  {formatNumber(calculationResult.bricksCount)} Pcs
                </div>
                <div className="text-[10px] text-slate-400">
                  @ Rs {calculationResult.activeRates.brickRate} / pc
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.bricksCost)}
                </div>
              </div>

              {/* Sand */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Sand</span>
                  <span className="text-[9px] text-emerald-400">Chenab/Ravi</span>
                </div>
                <div className="text-lg font-black text-white">
                  {formatNumber(calculationResult.sandCft)} CFT
                </div>
                <div className="text-[10px] text-slate-400">
                  @ Rs {calculationResult.activeRates.sandCftRate} / cft
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.sandCost)}
                </div>
              </div>

              {/* Crush */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Crush (Bajri)</span>
                  <span className="text-[9px] text-emerald-400">Margalla</span>
                </div>
                <div className="text-lg font-black text-white">
                  {formatNumber(calculationResult.crushCft)} CFT
                </div>
                <div className="text-[10px] text-slate-400">
                  @ Rs {calculationResult.activeRates.crushCftRate} / cft
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.crushCost)}
                </div>
              </div>

              {/* Labour */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase">Labour</span>
                  <span className="text-[9px] text-emerald-400">Mason &amp; Fixers</span>
                </div>
                <div className="text-lg font-black text-white">
                  {formatNumber(coveredAreaSqft)} Sqft
                </div>
                <div className="text-[10px] text-slate-400">
                  @ Rs {calculationResult.activeRates.labourSqftRate} / sqft
                </div>
                <div className="pt-1 border-t border-slate-800 text-xs font-bold text-emerald-400">
                  {formatPKR(calculationResult.labourCost)}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* PRO ACTION BAR (NON-INTRUSIVE UPSELLS) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Unlock Pro Management Tools for this Project</h4>
                  <p className="text-[11px] text-slate-400">
                    Save this estimate to your Khata, export branded client BOQ PDFs, and track site expenses.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openCheckoutModal()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Activate Pro Access</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-1">
              {[
                { name: "Save Project", icon: Home, feature: "Save Project" },
                { name: "PDF BOQ Report", icon: Download, feature: "PDF Export" },
                { name: "Save Rate Profile", icon: Sliders, feature: "Rate Profile" },
                { name: "Vendor Khata", icon: Building2, feature: "Vendor Management" },
                { name: "Shareable Link", icon: Share2, feature: "Share Link" },
                { name: "Budget Track", icon: DollarSign, feature: "Budget Tracking" }
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => handleProFeature(act.feature)}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex flex-col justify-between h-16 group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    </div>
                    <span className="font-semibold text-slate-200 text-[11px] group-hover:text-white transition-colors">
                      {act.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
