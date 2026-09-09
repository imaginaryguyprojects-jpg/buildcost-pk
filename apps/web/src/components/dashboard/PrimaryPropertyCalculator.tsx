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
  Info,
  Ruler,
  Maximize2
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

// Standard Pakistani Plot Presets with Typical Dimensions
export const PAK_STANDARD_PLOTS = [
  { size: 3, unit: "marla" as PlotUnit, dimensions: "20×35 ft", label: "3 Marla", sqft: 700, popular: true },
  { size: 5, unit: "marla" as PlotUnit, dimensions: "25×50 ft", label: "5 Marla", sqft: 1250, popular: true },
  { size: 7, unit: "marla" as PlotUnit, dimensions: "30×60 ft", label: "7 Marla", sqft: 1800, popular: true },
  { size: 10, unit: "marla" as PlotUnit, dimensions: "35×70 ft", label: "10 Marla", sqft: 2450, popular: true },
  { size: 1, unit: "kanal" as PlotUnit, dimensions: "50×90 ft", label: "1 Kanal", sqft: 4500, popular: true },
  { size: 2, unit: "kanal" as PlotUnit, dimensions: "75×120 ft", label: "2 Kanal", sqft: 9000, popular: false }
];

// Marla standard presets
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

  // 3. Property / Plot Size Mode & Custom Dimensions
  const [plotDimensionMode, setPlotDimensionMode] = useState<"standard" | "custom">("standard");
  const [customWidthFt, setCustomWidthFt] = useState<number>(25);
  const [customLengthFt, setCustomLengthFt] = useState<number>(50);

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
    if (plotDimensionMode === "custom") {
      const w = Math.max(1, customWidthFt || 1);
      const l = Math.max(1, customLengthFt || 1);
      return Math.round(w * l);
    }
    const size = Math.max(0.01, plotSize || 1);
    if (plotUnit === "marla") {
      return size * activeMarlaSqft;
    } else if (plotUnit === "kanal") {
      return size * 20 * activeMarlaSqft;
    } else {
      return size;
    }
  }, [plotDimensionMode, customWidthFt, customLengthFt, plotSize, plotUnit, activeMarlaSqft]);

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

  // 6. Custom / Editable Rates State
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

  // Active Rates
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

  // 7. Core Calculations
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

    // Specific Grey Breakdown Elements
    const brickMasonryCost = greyEst.elementsBreakdown.brickMasonryCost;
    const plasterCost = Math.round(greyEst.costs.grandTotal * 0.12);
    const roofSlabCost = greyEst.elementsBreakdown.roofSlabsCost + greyEst.elementsBreakdown.beamsAndLintelsCost;
    const foundationCost = greyEst.elementsBreakdown.foundationCost + greyEst.elementsBreakdown.plinthAndDpcCost;

    // Timeline in months
    const estimatedDurationMonths =
      safeFloors === 1 ? "4 - 5" : safeFloors === 2 ? "7 - 9" : safeFloors === 3 ? "10 - 12" : "13 - 16";

    // Dynamic Chart Data with real calculated percentages
    const chartItems = [
      { name: "Cement", cost: cementCost, color: "#059669" },
      { name: "Steel (Saria)", cost: steelCost, color: "#2563eb" },
      { name: "Bricks", cost: bricksCost, color: "#d97706" },
      { name: "Sand & Crush", cost: sandCost + crushCost, color: "#0891b2" },
      { name: "Labour & Shuttering", cost: labourCost, color: "#7c3aed" },
      { name: "Transport & Logistics", cost: transportCost, color: "#ea580c" },
      { name: "Wastage Allowance", cost: wastageCost, color: "#64748b" }
    ];

    if (!isGreyOnly) {
      chartItems.push({ name: "Finishing Package", cost: finishingCost, color: "#ec4899" });
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
      activeRates,
      greyEst,
      fullEst,
      brickMasonryCost,
      plasterCost,
      roofSlabCost,
      foundationCost
    };
  }, [
    coveredAreaSqft,
    autoSuggestedCoveredArea,
    effectiveFloors,
    activeRates,
    qualityTier,
    constructionScope,
    plotAreaInMarlas
  ]);

  // Breakdown Sub-tab state
  const [breakdownView, setBreakdownView] = useState<"grey" | "finishing">("grey");

  const scrollToResults = () => {
    const el = document.getElementById("calculation-results-anchor");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="calculator-section" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-7 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-[#059669] dark:text-emerald-400 shrink-0 shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Pakistan Property Construction Cost Calculator
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#059669] dark:bg-emerald-950/80 dark:text-emerald-300">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Empirical civil estimates calibrated for Pakistani housing societies (CDA, LDA, DHA, Bahria).
            </p>
          </div>
        </div>

        {/* Live City Badge & Edit Rates Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Building className="w-3.5 h-3.5 text-[#059669]" />
            <span>{selectedCity.name}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowRatesPanel(!showRatesPanel)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
              useCustomRates
                ? "bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#059669]"
            )}
          >
            <Sliders className="w-3.5 h-3.5 text-[#059669]" />
            <span>{useCustomRates ? "Rates: Custom" : "Live Rates"}</span>
            {showRatesPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* LIVE & EDITABLE MATERIAL RATES DRAWER */}
      {showRatesPanel && (
        <div className="mt-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                <span>Live Material Rates (Current Market Feeds)</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You can directly edit any material rate below. All calculations will update in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {useCustomRates && (
                <button
                  type="button"
                  onClick={handleResetToCityRates}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset to Benchmark</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            {/* Cement */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Cement (Bag)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  value={customRates.cement}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, cement: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.cement}</span>
            </div>

            {/* Steel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Steel / Sariya (Kg)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  value={customRates.steel}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, steel: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.steel}</span>
            </div>

            {/* Bricks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Bricks (Per Piece)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  step="0.5"
                  value={customRates.brick}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, brick: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.brick}</span>
            </div>

            {/* Sand */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Sand / Rait (CFT)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  value={customRates.sand}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, sand: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.sand}</span>
            </div>

            {/* Crush */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Crush / Bajri (CFT)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  value={customRates.crush}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, crush: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.crush}</span>
            </div>

            {/* Labour */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Labour (Sqft)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">Rs</span>
                <input
                  type="number"
                  value={customRates.labour}
                  onChange={(e) => {
                    setCustomRates((prev) => ({ ...prev, labour: parseFloat(e.target.value) || 0 }));
                    setUseCustomRates(true);
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-lg pl-7 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400">City: Rs {cityRates.labour}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CALCULATOR INPUT GRID */}
      {/* ======================================================== */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          scrollToResults();
        }}
        className="mt-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {/* 1. CITY SELECTION (Col 4) */}
          <div className="lg:col-span-4 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-[#059669] dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  1
                </span>
                <span>Select City (شہر کا انتخاب)</span>
              </span>
            </label>

            {/* Quick City Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {QUICK_CITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCitySelect(c.id)}
                  className={cn(
                    "py-2 px-1 text-xs font-bold rounded-xl border transition-all text-center",
                    selectedCityId === c.id
                      ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                      : "bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#059669]"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Dropdown for other Pakistani cities */}
            <select
              value={selectedCityId}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#059669]"
            >
              {PAKISTANI_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.province}) — Marla: {city.defaultMarlaSqft} sqft
                </option>
              ))}
            </select>
          </div>

          {/* 2. PLOT DIMENSIONS & MEASUREMENT (Col 5) */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-[#059669] dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                <span>Plot Dimensions (پلاٹ سائز)</span>
              </label>

              {/* Mode Toggle: Standard vs Custom Dimensions */}
              <div className="flex bg-[#F8FAFC] dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPlotDimensionMode("standard")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all",
                    plotDimensionMode === "standard"
                      ? "bg-white dark:bg-slate-900 text-[#059669] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Standard Plots
                </button>
                <button
                  type="button"
                  onClick={() => setPlotDimensionMode("custom")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1",
                    plotDimensionMode === "custom"
                      ? "bg-white dark:bg-slate-900 text-[#059669] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Ruler className="w-3 h-3 text-[#059669]" />
                  <span>Custom Dimensions</span>
                </button>
              </div>
            </div>

            {plotDimensionMode === "standard" ? (
              /* STANDARD PLOT CARDS */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PAK_STANDARD_PLOTS.map((p) => {
                  const isSelected = plotSize === p.size && plotUnit === p.unit;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setPlotSize(p.size);
                        setPlotUnit(p.unit);
                      }}
                      className={cn(
                        "p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center",
                        isSelected
                          ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                          : "bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#059669]"
                      )}
                    >
                      <span className="text-xs font-black">{p.label}</span>
                      <span className="text-[10px] opacity-80">{p.dimensions}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* CUSTOM PLOT DIMENSIONS INPUT */
              <div className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Plot Width (چوڑائی / فرنٹ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="500"
                        value={customWidthFt}
                        onChange={(e) => setCustomWidthFt(parseFloat(e.target.value) || 25)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1.5 text-[11px] text-slate-400 font-semibold">ft</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Plot Length (لمبائی / گہرائی)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="500"
                        value={customLengthFt}
                        onChange={(e) => setCustomLengthFt(parseFloat(e.target.value) || 50)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#059669] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-1.5 text-[11px] text-slate-400 font-semibold">ft</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#059669] dark:text-emerald-400 font-semibold flex items-center justify-between pt-1">
                  <span>Calculated Area: <strong>{formatNumber(plotAreaSqft)} sq ft</strong></span>
                  <span>≈ {(plotAreaSqft / activeMarlaSqft).toFixed(2)} Marlas</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. FLOORS & SCOPE (Col 3) */}
          <div className="lg:col-span-3 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-[#059669] dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Floors &amp; Scope (منزلیں اور قسم)</span>
            </label>

            {/* Floors Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 1, label: "Single (G)" },
                { val: 2, label: "Double (G+1)" },
                { val: 3, label: "Triple (G+2)" }
              ].map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => setFloorsSelection(f.val)}
                  className={cn(
                    "py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all",
                    floorsSelection === f.val
                      ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                      : "bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#059669]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Scope Selection: Grey vs Complete */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setConstructionScope("grey")}
                className={cn(
                  "p-2 rounded-xl text-center border transition-all",
                  constructionScope === "grey"
                    ? "bg-slate-900 text-white dark:bg-slate-800 border-slate-700 shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                )}
              >
                <div className="text-xs font-bold">Grey Structure</div>
                <div className="text-[10px] opacity-80">گرے اسٹرکچر</div>
              </button>

              <button
                type="button"
                onClick={() => setConstructionScope("complete")}
                className={cn(
                  "p-2 rounded-xl text-center border transition-all",
                  constructionScope === "complete"
                    ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                    : "bg-[#F8FAFC] dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-[#059669]"
                )}
              >
                <div className="text-xs font-bold">Full Finishing</div>
                <div className="text-[10px] opacity-80">مکمل فنشنگ</div>
              </button>
            </div>
          </div>
        </div>

        {/* CALCULATE BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer tracking-wide"
          >
            <Calculator className="w-5 h-5" />
            <span>CALCULATE CONSTRUCTION ESTIMATE</span>
          </button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* RESULTS HERO SECTION */}
      {/* ======================================================== */}
      <div id="calculation-results-anchor" className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        {/* Estimated Cost Result Cards */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-black text-[#059669] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>
                {constructionScope === "grey"
                  ? "ESTIMATED GREY STRUCTURE COST"
                  : "ESTIMATED COMPLETE HOUSE COST"}{' '}
                • {selectedCity.name}
              </span>
            </h3>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {formatLakhCrore(calculationResult.totalCost)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            {/* Grand Total */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 rounded-3xl p-5 shadow-sm">
              <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-extrabold uppercase tracking-wider block mb-1">
                {constructionScope === "grey" ? "Grey Structure Estimate" : "Complete Turnkey Estimate"}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight py-0.5">
                {formatPKR(calculationResult.totalCost)}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {formatLakhCrore(calculationResult.totalCost)}
                </span>
                <span className="text-slate-500">
                  • Rs {formatNumber(calculationResult.costPerSqft)} / sq ft
                </span>
              </div>
            </div>

            {/* Cost / Sq Ft & Construction Area */}
            <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Cost / Sq Ft &amp; Area
                </span>
                <div className="text-xl sm:text-2xl font-black text-[#059669] dark:text-emerald-400">
                  Rs {formatNumber(calculationResult.costPerSqft)}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                Covered Area: <strong className="text-slate-900 dark:text-white">{formatNumber(coveredAreaSqft)} sq ft</strong>
              </div>
            </div>

            {/* Timeline Duration */}
            <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1">
                  Estimated Schedule
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-5 h-5 shrink-0" />
                  <span>{calculationResult.estimatedDurationMonths} Months</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                Standard Pakistani civil timeline
              </div>
            </div>
          </div>
        </div>

        {/* MATERIAL COST GRAPH & BREAKDOWN DONUT */}
        <div className="bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#059669]" />
                <span>Cost Distribution &amp; Material Proportions</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated dynamic percentage shares based on empirical civil engineering formulas.
              </p>
            </div>
            <span className="text-xs text-[#059669] font-bold">
              Total: {formatPKR(calculationResult.totalCost)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
              {isMounted ? (
                <div className="w-52 h-52 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(value: any, name: any) => [formatPKR(Number(value)), name]}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                          color: "#f8fafc"
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

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] text-slate-500 font-medium uppercase">Cost / Sqft</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      Rs {formatNumber(calculationResult.costPerSqft)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">
                  Loading chart...
                </div>
              )}
            </div>

            {/* Legend List */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {calculationResult.chartData.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-semibold truncate text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-900 dark:text-white font-bold block text-xs">
                      {formatPKR(item.value)}
                    </span>
                    <span className="text-[10px] text-[#059669] font-medium block">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DETAILED COST BREAKDOWN: GREY STRUCTURE VS FINISHING */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#059669]" />
                <span>Detailed Construction Phase Breakdown</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Exact civil work itemization explicitly showing quantities and what is included in each phase.
              </p>
            </div>

            {/* Phase Sub-Tabs */}
            <div className="flex bg-[#F8FAFC] dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBreakdownView("grey")}
                className={cn(
                  "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
                  breakdownView === "grey"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <span>Grey Structure Phase (گرے اسٹرکچر)</span>
              </button>
              <button
                type="button"
                onClick={() => setBreakdownView("finishing")}
                className={cn(
                  "px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5",
                  breakdownView === "finishing"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <span>Finishing &amp; Furnishing (فنشنگ)</span>
              </button>
            </div>
          </div>

          {/* TAB 1: GREY STRUCTURE PHASE CARDS */}
          {breakdownView === "grey" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Brick Masonry */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                      🧱
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Brick Masonry (دیواریں چڑھانا)
                      </h4>
                      <span className="text-[10px] text-slate-500">First Class Kiln Awwal Bricks</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.brickMasonryCost)}
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">
                      {formatLakhCrore(calculationResult.brickMasonryCost)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Awwal Bricks Required:</span>
                    <strong className="text-slate-900 dark:text-white">{formatNumber(calculationResult.bricksCount)} Pcs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortar Cement:</span>
                    <span>~{Math.ceil(calculationResult.bricksCount * 0.0018)} Bags</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Screening Sand (Rait):</span>
                    <span>~{Math.round(calculationResult.bricksCount * 0.0095)} CFT</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                    <li>Awwal red kiln-fired bricks (اول کلاس پکی اینٹیں)</li>
                    <li>1:6 &amp; 1:4 cement-sand mortar mixing (سیمنٹ ریت مسالہ)</li>
                    <li>9-inch load-bearing exterior perimeter walls</li>
                    <li>4.5-inch interior room partition walls</li>
                    <li>Roof parapet walls &amp; boundary wall masonry</li>
                    <li>Mason (Mistry) &amp; labour laying with plumb line check</li>
                  </ul>
                </div>
              </div>

              {/* 2. Plastering */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                      🪚
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Plastering (پلستر کرنا)
                      </h4>
                      <span className="text-[10px] text-slate-500">Internal &amp; External Dual-Coat</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.plasterCost)}
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">
                      {formatLakhCrore(calculationResult.plasterCost)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Plaster Surface Area:</span>
                    <strong className="text-slate-900 dark:text-white">{formatNumber(Math.round(coveredAreaSqft * 3.4))} sq ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cement for Plaster:</span>
                    <span>~{Math.ceil(coveredAreaSqft * 0.12)} Bags</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chenab Fine Sand:</span>
                    <span>~{Math.round(coveredAreaSqft * 0.45)} CFT</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                    <li>0.5-inch internal 1:4 cement smooth trowel plaster</li>
                    <li>0.75-inch external 1:3 weather-resistant sand plaster</li>
                    <li>Ceiling underside chip-free neat plaster</li>
                    <li>Chicken wire mesh (مرغی جالی) on brick-column joints</li>
                    <li>Bamboo scaffolding (بانس پہاڑ) and 7-day water curing</li>
                  </ul>
                </div>
              </div>

              {/* 3. Roof Slab Casting & RCC */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                      🏗️
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Roof Slab Casting (چھت ڈالنا اور لنٹر)
                      </h4>
                      <span className="text-[10px] text-slate-500">RCC Concrete &amp; Grade 60 Sariya</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.roofSlabCost)}
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">
                      {formatLakhCrore(calculationResult.roofSlabCost)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Grade 60 Steel Rebar:</span>
                    <strong className="text-slate-900 dark:text-white">{calculationResult.steelTons} Tons ({formatNumber(calculationResult.steelKg)} kg)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Margalla Crush (Bajri):</span>
                    <span>{formatNumber(calculationResult.crushCft)} CFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slab Casting Cement:</span>
                    <span>~{Math.ceil(calculationResult.cementBags * 0.65)} Bags</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                    <li>Grade 60 deformed steel rebar bending and binding (سریے کی باندھائی)</li>
                    <li>1:2:4 ratio Margalla crushed stone concrete (لنٹر کنکریٹ)</li>
                    <li>Steel / marine ply shuttering formwork with iron props (شٹرنگ)</li>
                    <li>Electrical conduit piping &amp; fan boxes embedded prior to casting</li>
                    <li>Mechanical vibrator compaction &amp; 14-day pond curing (ترائی)</li>
                  </ul>
                </div>
              </div>

              {/* 4. Excavation & Foundation */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold">
                      ⛏️
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Foundation &amp; DPC (بنیادیں اور ڈی پی سی)
                      </h4>
                      <span className="text-[10px] text-slate-500">Excavation, Soling &amp; Damp Proofing</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.foundationCost)}
                    </span>
                    <span className="text-[10px] text-[#059669] font-bold">
                      {formatLakhCrore(calculationResult.foundationCost)}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Foundation Footings:</span>
                    <strong className="text-slate-900 dark:text-white">4 to 5 ft solid depth</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lean Concrete Soling:</span>
                    <span>1:4:8 nominal mix</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plinth Beam &amp; DPC:</span>
                    <span>Reinforced concrete + bitumen</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                    <li>Machine/manual trench excavation up to solid strata</li>
                    <li>Termite chemical treatment spray barrier (دیمک سپرے)</li>
                    <li>Lean concrete soling base layer</li>
                    <li>Stepped brick foundation with reinforced plinth beam</li>
                    <li>Double coat bitumen DPC with heavy polythene sheet (نمی سے بچاؤ)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: FINISHING & FURNISHING PHASE CARDS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* Tiles */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                    🔲
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Floor &amp; Wall Tiles (ٹائلز)</h4>
                    <span className="text-[10px] text-slate-400">Porcelain 60×60 / 60×120</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Porcelain tiles in rooms, Chinese/Spanish glazed wall tiles in bathrooms up to 8ft height, polymer bond adhesive &amp; matching grout.
                </p>
              </div>

              {/* Marble & Granite */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Marble &amp; Granite (ماربل)</h4>
                    <span className="text-[10px] text-slate-400">Staircase &amp; Counters</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Badal / Ziarat white marble steps with bullnose edge, granite kitchen counter slabs, vanity tops, window sills &amp; threshold plates.
                </p>
              </div>

              {/* Chips / Terrazzo */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Chips &amp; Terrazzo (چپس)</h4>
                    <span className="text-[10px] text-slate-400">Roof Terrace &amp; Garage</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Waterproof marble chips on rooftop terrace and garage with multi-stage machine grinding, crystallization, and chemical polish.
                </p>
              </div>

              {/* Windows */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                    🪟
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Windows &amp; Glazing (کھڑکیاں)</h4>
                    <span className="text-[10px] text-slate-400">1.6mm / 2mm Aluminium</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Powder-coated architectural aluminium sections (or UPVC), 5mm/8mm tinted tempered safety glass, and stainless steel wire mesh.
                </p>
              </div>

              {/* Doors */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                    🚪
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Doors &amp; Chowkhats (دروازے)</h4>
                    <span className="text-[10px] text-slate-400">Ash Wood &amp; Semi-Solid</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Solid ash wood main door, semi-solid grooved bedroom doors, waterproof PVC bathroom doors, 16-gauge steel chowkhats, mortise locks &amp; handles.
                </p>
              </div>

              {/* Complete Kitchen Setup */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                    🍳
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kitchen Setup (کچن سیٹ اپ)</h4>
                    <span className="text-[10px] text-slate-400">UV / Acrylic High Gloss</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Modular UV/Acrylic cabinets with soft-close hydraulic fittings, quartz/granite countertop, double-bowl sink with swivel mixer, hood &amp; hob.
                </p>
              </div>

              {/* Full Bathroom Construction */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center font-bold">
                    🚿
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bathroom Setup (باتھ روم)</h4>
                    <span className="text-[10px] text-slate-400">Sanitary &amp; Concealed PPRC</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Master/Porta commodes, vanity basins, concealed PPRC pipes (pressure tested), Grohe/Faisal mixer taps, shower sets, and anti-fog mirrors.
                </p>
              </div>

              {/* Electrical */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Electrical &amp; Wiring (الیکٹریکل)</h4>
                    <span className="text-[10px] text-slate-400">Pakistan Cables Copper</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pakistan Cables pure copper wiring, recessed LED panel lights, ceiling fans, distribution boards with Schneider/Hager breakers.
                </p>
              </div>

              {/* Paint & False Ceiling */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold">
                    🎨
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Paint &amp; False Ceiling (پینٹ)</h4>
                    <span className="text-[10px] text-slate-400">Gypsum Cove &amp; Matt Paint</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gypsum board false ceiling with cove light troughs, acrylic wall putty, primer undercoat, and 3 coats of premium matt finish emulsion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PRO TOOLS BANNER */}
        <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Professional Contractor Tools
            </span>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Export formal BOQ PDFs, track vendor purchases in Khata, and invite team members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openLoginModal();
                } else {
                  openCheckoutModal();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export BOQ Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
