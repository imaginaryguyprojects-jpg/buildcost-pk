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
  Maximize2,
  Printer,
  FileText
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { calculateGreyStructureEstimate, calculateFullHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
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
  { id: "rwp", name: "Rawalpindi" },
  { id: "isb", name: "Islamabad" },
  { id: "lhr", name: "Lahore" },
  { id: "khi", name: "Karachi" },
  { id: "pew", name: "Peshawar" }
];

// Benchmark rates per city category (Calibrated for Pakistani civil engineering benchmarks)
const CITY_BENCHMARKS: Record<string, { cement: number; steel: number; brick: number; sand: number; crush: number; labour: number; transportPerSqft: number }> = {
  isb: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 },
  rwp: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 },
  lhr: { cement: 1430, steel: 258, brick: 13.5, sand: 42, crush: 88, labour: 410, transportPerSqft: 32 },
  khi: { cement: 1480, steel: 268, brick: 15.0, sand: 50, crush: 105, labour: 450, transportPerSqft: 40 },
  pew: { cement: 1440, steel: 262, brick: 13.8, sand: 44, crush: 90, labour: 400, transportPerSqft: 34 },
  default: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 }
};

export function PrimaryPropertyCalculator() {
  const { isAuthenticated, user, isSuperAdmin, openLoginModal, openUpgradeModal, openProjectUpgradeModal, openCheckoutModal, showToast } = useAuthStore();
  const { selectedCityId: globalCityId, setSelectedCityId: setGlobalCityId } = useProjectStore();
  const [isMounted, setIsMounted] = useState(false);

  const isPro = Boolean(user?.is_pro || isSuperAdmin() || user?.plan === "pro");

  const handleSharePdfOrPrint = () => {
    if (!isPro) {
      openUpgradeModal("Share the calculation in PDF or Print");
    } else {
      window.print();
    }
  };


  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. City Selection (Synced with global store)
  const [selectedCityId, setSelectedCityId] = useState<string>(globalCityId || "rwp");

  useEffect(() => {
    if (globalCityId && globalCityId !== selectedCityId) {
      setSelectedCityId(globalCityId);
    }
  }, [globalCityId]);

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
    <div id="calculator-section" className="space-y-5 max-w-7xl mx-auto w-full text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 0. TOP BANNER: SHARE CALCULATION IN PDF OR PRINT (PREMIUM GATED) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-950/90 dark:via-teal-950/90 dark:to-emerald-950/90 border border-emerald-400/40 dark:border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-950/10 text-white transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Printer className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-xs">
                  Share the calculation in PDF or Print
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>PREMIUM</span>
                </span>
                <span className="text-xs text-emerald-100/90 font-semibold hidden sm:inline-block">
                  • Official Contractor &amp; Bank Estimation Report
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                Export an official watermarked PDF cost report with itemized civil quantities, live market rates, and labour schedules ready for WhatsApp sharing or instant printing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleSharePdfOrPrint}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Share in PDF / Print</span>
              {!isPro && <Lock className="w-3.5 h-3.5 text-amber-600 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 1. TOP CARD: MATERIAL RATES PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-[#059669] dark:text-emerald-400 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  Material Rates (Cement, Steel, Bricks, Sand, Crush, Labour)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-[#059669] dark:text-emerald-400">
                  FREE LIVE RECALCULATION
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {selectedCity.name} Official Benchmarks
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Override city benchmarks with your local mandi or supplier quotes. Instant recalculation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setShowRatesPanel(!showRatesPanel)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs",
                showRatesPanel
                  ? "bg-slate-800 dark:bg-slate-700 border-slate-800 text-white"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              <span>{useCustomRates ? "Rates: Custom" : "Edit Rates"}</span>
              {showRatesPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Rate Editor Drawer */}
        {showRatesPanel && (
          <div className="mt-4 pt-4 border-t border-slate-200/90 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#059669] dark:text-emerald-400" />
                <span>Adjust Live Supplier / Mandi Rates ({selectedCity.name})</span>
              </span>

              {useCustomRates && (
                <button
                  type="button"
                  onClick={handleResetToCityRates}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset to City Benchmark</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              {/* Cement */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Cement (Bag)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    value={customRates.cement}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, cement: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.cement}</span>
              </div>

              {/* Steel */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Steel / Sariya (Kg)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    value={customRates.steel}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, steel: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.steel}</span>
              </div>

              {/* Bricks */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Bricks (Per Piece)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    step="0.5"
                    value={customRates.brick}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, brick: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.brick}</span>
              </div>

              {/* Sand */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Sand / Rait (CFT)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    value={customRates.sand}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, sand: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.sand}</span>
              </div>

              {/* Crush */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Crush / Bajri (CFT)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    value={customRates.crush}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, crush: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.crush}</span>
              </div>

              {/* Labour */}
              <div className="bg-slate-50/80 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">Labour Rate (/Sqft)</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">Rs</span>
                  <input
                    type="number"
                    value={customRates.labour}
                    onChange={(e) => {
                      setCustomRates((prev) => ({ ...prev, labour: parseFloat(e.target.value) || 0 }));
                      setUseCustomRates(true);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-lg pl-8 pr-2 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none shadow-2xs"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">Benchmark: Rs {cityRates.labour}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PLOT & SPECIFICATION TUNING PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#059669] dark:text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Property Specifications &amp; Location
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {QUICK_CITIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCityId(c.id);
                  setGlobalCityId(c.id);
                }}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  selectedCityId === c.id
                    ? "bg-[#059669] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Plot Selection: Prominently Enlarged */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Plot Size Selection (پلاٹ کا سائز)
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPlotDimensionMode("standard")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    plotDimensionMode === "standard"
                      ? "bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 shadow-2xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setPlotDimensionMode("custom")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    plotDimensionMode === "custom"
                      ? "bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 shadow-2xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  Custom (W×L)
                </button>
              </div>
            </div>

            {plotDimensionMode === "standard" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
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
                        "py-3 sm:py-3.5 px-3 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[74px] sm:min-h-[82px]",
                        isSelected
                          ? "bg-[#059669] text-white border-emerald-600 shadow-md shadow-emerald-800/15 scale-[1.02]"
                          : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40"
                      )}
                    >
                      <span className="text-sm sm:text-base font-black tracking-tight">{p.label}</span>
                      <span className={cn("text-[11px] font-medium mt-0.5", isSelected ? "text-emerald-100" : "text-slate-400")}>
                        {p.dimensions}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-bold">Width (ft)</span>
                  <input
                    type="number"
                    value={customWidthFt}
                    onChange={(e) => setCustomWidthFt(parseFloat(e.target.value) || 25)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-bold">Length (ft)</span>
                  <input
                    type="number"
                    value={customLengthFt}
                    onChange={(e) => setCustomLengthFt(parseFloat(e.target.value) || 50)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#059669] rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Floors */}
          <div className="lg:col-span-3 space-y-2.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Storeys (منزلیں)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: "Single", sub: "Ground" },
                { val: 2, label: "Double", sub: "G + 1" },
                { val: 3, label: "Triple", sub: "G + 2" }
              ].map((f) => (
                <button
                  key={f.val}
                  type="button"
                  onClick={() => setFloorsSelection(f.val)}
                  className={cn(
                    "py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[74px] sm:min-h-[82px]",
                    floorsSelection === f.val
                      ? "bg-[#059669] text-white border-emerald-600 shadow-md shadow-emerald-800/15 scale-[1.02]"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-emerald-50/40"
                  )}
                >
                  <span className="text-xs sm:text-sm font-black">{f.label}</span>
                  <span className={cn("text-[10px] font-medium mt-0.5", floorsSelection === f.val ? "text-emerald-100" : "text-slate-400")}>
                    {f.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scope of Work */}
          <div className="lg:col-span-3 space-y-2.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Scope of Work
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConstructionScope("grey")}
                className={cn(
                  "py-3 px-2.5 rounded-2xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[74px] sm:min-h-[82px]",
                  constructionScope === "grey"
                    ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600 shadow-md scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <div className="text-xs sm:text-sm font-black">Grey Structure</div>
                <div className="text-[10px] opacity-80 font-medium">گرے اسٹرکچر</div>
              </button>
              <button
                type="button"
                onClick={() => setConstructionScope("complete")}
                className={cn(
                  "py-3 px-2.5 rounded-2xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[74px] sm:min-h-[82px]",
                  constructionScope === "complete"
                    ? "bg-[#059669] text-white border-emerald-600 shadow-md shadow-emerald-800/15 scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
                )}
              >
                <div className="text-xs sm:text-sm font-black">Full Finishing</div>
                <div className="text-[10px] opacity-80 font-medium">مکمل فنشنگ</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HERO ACTION BUTTON: Smaller, Sleeker, Elegant */}
      <div className="flex items-center justify-center py-1">
        <button
          type="button"
          onClick={() => {
            scrollToResults();
            showToast("Calculations updated successfully", "success");
          }}
          className="px-8 py-3.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-3 transition-all cursor-pointer tracking-wide group"
        >
          <Calculator className="w-5 h-5 text-emerald-100 group-hover:rotate-6 transition-transform" />
          <span>Calculate Free Estimate</span>
          <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 4. ESTIMATED SUMMARY SECTION */}
      <div id="calculation-results-anchor" className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h3 className="text-xs sm:text-sm font-black text-[#059669] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-emerald-400" />
            <span>
              {constructionScope === "grey"
                ? "ESTIMATED GREY STRUCTURE COST"
                : "ESTIMATED COMPLETE HOUSE COST"}{" "}
              • {selectedCity.name.toUpperCase()}
            </span>
          </h3>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
            {formatLakhCrore(calculationResult.totalCost)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card 1: Grand Total */}
          <div className="md:col-span-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/70 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-black text-[#059669] dark:text-emerald-400 uppercase tracking-wider block mb-1">
              {constructionScope === "grey" ? "GREY STRUCTURE ESTIMATE" : "COMPLETE TURNKEY ESTIMATE"}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight py-1">
              {formatPKR(calculationResult.totalCost)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm font-semibold">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-[#059669] dark:text-emerald-300 font-extrabold">
                {formatLakhCrore(calculationResult.totalCost)}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-bold">
                • Rs {formatNumber(calculationResult.costPerSqft)} / sq ft
              </span>
            </div>
          </div>

          {/* Card 2: Cost / Sq Ft & Area */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Cost / Sq Ft &amp; Area
              </span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-700 dark:text-cyan-400">
                Rs {formatNumber(calculationResult.costPerSqft)}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Construction Area: <strong className="text-slate-900 dark:text-slate-100 font-black">{formatNumber(coveredAreaSqft)} sq ft</strong>
            </div>
          </div>

          {/* Card 3: Estimated Duration */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Estimated Duration
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Clock className="w-5 h-5 shrink-0" />
                <span>{calculationResult.estimatedDurationMonths} Months</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              Standard Pakistani civil schedule
            </div>
          </div>
        </div>
      </div>

      {/* 5. GREY STRUCTURE COST BREAKDOWN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#059669] dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {constructionScope === "grey" ? "GREY STRUCTURE COST BREAKDOWN" : "TURNKEY HOUSE COST BREAKDOWN"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated dynamic percentage shares for materials, civil labour, transport, and wastage.
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-extrabold">
            Total: {formatPKR(calculationResult.totalCost)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[230px]">
            {isMounted ? (
              <div className="w-56 h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: any, name: any) => [formatPKR(Number(value)), name]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "#0f172a",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      }}
                    />
                    <Pie
                      data={calculationResult.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                    COST / SQFT
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Rs {formatNumber(calculationResult.costPerSqft)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          {/* Breakdown List: Significantly Larger, Bold, and Highly Legible */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {calculationResult.chartData.map((item) => (
              <div
                key={item.name}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-400/50 hover:bg-emerald-50/20 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-900 dark:text-slate-100 font-bold truncate text-sm sm:text-base">
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-900 dark:text-white font-black block text-sm sm:text-base">
                    {formatPKR(item.value)}
                  </span>
                  <span className="text-xs sm:text-sm text-[#059669] dark:text-emerald-400 font-extrabold block">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. DETAILED COST BREAKDOWN: GREY STRUCTURE VS FINISHING */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#059669] dark:text-emerald-400" />
              <span>Detailed Construction Phase Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact civil work itemization explicitly showing quantities and what is included in each phase.
            </p>
          </div>

          {/* Phase Sub-Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBreakdownView("grey")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                breakdownView === "grey"
                  ? "bg-[#059669] text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <span>Grey Structure Phase (گرے اسٹرکچر)</span>
            </button>
            <button
              type="button"
              onClick={() => setBreakdownView("finishing")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                breakdownView === "finishing"
                  ? "bg-[#059669] text-white shadow-xs font-extrabold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      🧱
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Brick Masonry (دیواریں چڑھانا)
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">First Class Kiln Awwal Bricks</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.brickMasonryCost)}
                    </span>
                    <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-extrabold">
                      {formatLakhCrore(calculationResult.brickMasonryCost)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Awwal Bricks Required:</span>
                    <strong className="text-slate-900 dark:text-white">{formatNumber(calculationResult.bricksCount)} Pcs</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mortar Cement:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{Math.ceil(calculationResult.bricksCount * 0.0018)} Bags</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Screening Sand (Rait):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{Math.round(calculationResult.bricksCount * 0.0095)} CFT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
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
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      🪚
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Plastering (پلستر کرنا)
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">Internal &amp; External Dual-Coat</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.plasterCost)}
                    </span>
                    <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-extrabold">
                      {formatLakhCrore(calculationResult.plasterCost)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Plaster Surface Area:</span>
                    <strong className="text-slate-900 dark:text-white">{formatNumber(Math.round(coveredAreaSqft * 3.4))} sq ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cement for Plaster:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{Math.ceil(coveredAreaSqft * 0.12)} Bags</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chenab Fine Sand:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{Math.round(coveredAreaSqft * 0.45)} CFT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>0.5-inch internal 1:4 cement smooth trowel plaster</li>
                    <li>0.75-inch external 1:3 weather-resistant sand plaster</li>
                    <li>Ceiling underside chip-free neat plaster</li>
                    <li>Chicken wire mesh (مرغی جالی) on brick-column joints</li>
                    <li>Bamboo scaffolding (بانس پہاڑ) and 7-day water curing</li>
                  </ul>
                </div>
              </div>

              {/* 3. Roof Slab Casting & RCC */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      🏗️
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Roof Slab Casting (چھت ڈالنا اور لنٹر)
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">RCC Concrete &amp; Grade 60 Sariya</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.roofSlabCost)}
                    </span>
                    <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-extrabold">
                      {formatLakhCrore(calculationResult.roofSlabCost)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Grade 60 Steel Rebar:</span>
                    <strong className="text-slate-900 dark:text-white">{calculationResult.steelTons} Tons ({formatNumber(calculationResult.steelKg)} kg)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Margalla Crush (Bajri):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(calculationResult.crushCft)} CFT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slab Casting Cement:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">~{Math.ceil(calculationResult.cementBags * 0.65)} Bags</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>Grade 60 deformed steel rebar bending and binding (سریے کی باندھائی)</li>
                    <li>1:2:4 ratio Margalla crushed stone concrete (لنٹر کنکریٹ)</li>
                    <li>Steel / marine ply shuttering formwork with iron props (شٹرنگ)</li>
                    <li>Electrical conduit piping &amp; fan boxes embedded prior to casting</li>
                    <li>Mechanical vibrator compaction &amp; 14-day pond curing (ترائی)</li>
                  </ul>
                </div>
              </div>

              {/* 4. Excavation & Foundation */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold">
                      ⛏️
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Foundation &amp; DPC (بنیادیں اور ڈی پی سی)
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">Excavation, Soling &amp; Damp Proofing</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                      {formatPKR(calculationResult.foundationCost)}
                    </span>
                    <span className="text-[11px] text-[#059669] dark:text-emerald-400 font-extrabold">
                      {formatLakhCrore(calculationResult.foundationCost)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Foundation Footings:</span>
                    <strong className="text-slate-900 dark:text-white">4 to 5 ft solid depth</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lean Concrete Soling:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">1:4:8 nominal mix</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plinth Beam &amp; DPC:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Reinforced concrete + bitumen</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                    What is Included (کیا شامل ہے):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
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
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    🔲
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Floor &amp; Wall Tiles (ٹائلز)</h4>
                    <span className="text-[10px] text-slate-500">Porcelain 60×60 / 60×120</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Porcelain tiles in rooms, Chinese/Spanish glazed wall tiles in bathrooms up to 8ft height, polymer bond adhesive &amp; matching grout.
                </p>
              </div>

              {/* Marble & Granite */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Marble &amp; Granite (ماربل)</h4>
                    <span className="text-[10px] text-slate-500">Staircase &amp; Counters</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Badal / Ziarat white marble steps with bullnose edge, granite kitchen counter slabs, vanity tops, window sills &amp; threshold plates.
                </p>
              </div>

              {/* Chips / Terrazzo */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Chips &amp; Terrazzo (چپس)</h4>
                    <span className="text-[10px] text-slate-500">Roof Terrace &amp; Garage</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Waterproof marble chips on rooftop terrace and garage with multi-stage machine grinding, crystallization, and chemical polish.
                </p>
              </div>

              {/* Windows */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    🪟
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Windows &amp; Glazing (کھڑکیاں)</h4>
                    <span className="text-[10px] text-slate-500">1.6mm / 2mm Aluminium</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Powder-coated architectural aluminium sections (or UPVC), 5mm/8mm tinted tempered safety glass, and stainless steel wire mesh.
                </p>
              </div>

              {/* Doors */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    🚪
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Doors &amp; Chowkhats (دروازے)</h4>
                    <span className="text-[10px] text-slate-500">Ash Wood &amp; Semi-Solid</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Solid ash wood main door, semi-solid grooved bedroom doors, waterproof PVC bathroom doors, 16-gauge steel chowkhats, mortise locks &amp; handles.
                </p>
              </div>

              {/* Complete Kitchen Setup */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                    🍳
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Kitchen Setup (کچن سیٹ اپ)</h4>
                    <span className="text-[10px] text-slate-500">UV / Acrylic High Gloss</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Modular UV/Acrylic cabinets with soft-close hydraulic fittings, quartz/granite countertop, double-bowl sink with swivel mixer, hood &amp; hob.
                </p>
              </div>

              {/* Full Bathroom Construction */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    🚿
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Bathroom Setup (باتھ روم)</h4>
                    <span className="text-[10px] text-slate-500">Sanitary &amp; Concealed PPRC</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Master/Porta commodes, vanity basins, concealed PPRC pipes (pressure tested), Grohe/Faisal mixer taps, shower sets, and anti-fog mirrors.
                </p>
              </div>

              {/* Electrical */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Electrical &amp; Wiring (الیکٹریکل)</h4>
                    <span className="text-[10px] text-slate-500">Pakistan Cables Copper</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pakistan Cables pure copper wiring, recessed LED panel lights, ceiling fans, distribution boards with Schneider/Hager breakers.
                </p>
              </div>

              {/* Paint & False Ceiling */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold">
                    🎨
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Paint &amp; False Ceiling (پینٹ)</h4>
                    <span className="text-[10px] text-slate-500">Gypsum Cove &amp; Matt Paint</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gypsum board false ceiling with cove light troughs, acrylic wall putty, primer undercoat, and 3 coats of premium matt finish emulsion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PRO TOOLS BANNER */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider block">
              Professional Contractor Tools
            </span>
            <p className="text-xs text-slate-300 mt-0.5">
              Export formal BOQ PDFs, track vendor purchases in Khata, and invite team members.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openLoginModal();
                } else {
                  openCheckoutModal();
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export BOQ Summary</span>
            </button>
          </div>
        </div>
      </div>
  );
}
