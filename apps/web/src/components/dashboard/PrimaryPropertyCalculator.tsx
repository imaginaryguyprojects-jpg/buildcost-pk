"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Home,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  Clock,
  Sparkles,
  RotateCcw,
  Building,
  Check,
  Ruler,
  Maximize2,
  Printer,
  Calendar,
  Layers,
  Bath,
  Settings,
  BarChart3,
  Sliders,
  DollarSign,
  Crown,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PAKISTANI_CITIES, DEFAULT_LAUNCH_PRICE_CONFIG } from "@buildcost/config";
import {
  calculateGreyStructureEstimate,
  calculateFullHouseEstimate,
  calculateAdvancedGreyStructure
} from "@buildcost/calculations";
import { ProConstructionInputs, ProBathroomItem, ProDetailedEstimate } from "@buildcost/types";
import { ProConstructionSection } from "@/components/calculator/ProConstructionSection";
import { HouseLayoutPlansSection } from "@/components/calculator/HouseLayoutPlansSection";
import { FeatureComparisonSection } from "@/components/calculator/FeatureComparisonSection";
import { GreyStructureBreakdownGrid } from "@/components/calculator/GreyStructureBreakdownGrid";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { cn } from "@/lib/utils";

export type PlotUnit = "marla" | "kanal" | "sqft";
export type ConstructionScope = "grey" | "complete" | "custom";
export type QualityTier = "standard" | "economy" | "premium" | "luxury";

// Standard Pakistani Plot Presets
export const PAK_STANDARD_PLOTS = [
  { size: 3, unit: "marla" as PlotUnit, dimensions: "20×35 ft", label: "3 Marla", sqft: 700 },
  { size: 5, unit: "marla" as PlotUnit, dimensions: "25×50 ft", label: "5 Marla", sqft: 1250 },
  { size: 7, unit: "marla" as PlotUnit, dimensions: "30×60 ft", label: "7 Marla", sqft: 1800 },
  { size: 10, unit: "marla" as PlotUnit, dimensions: "35×70 ft", label: "10 Marla", sqft: 2450 },
  { size: 1, unit: "kanal" as PlotUnit, dimensions: "50×90 ft", label: "1 Kanal", sqft: 4500 },
  { size: 2, unit: "kanal" as PlotUnit, dimensions: "75×120 ft", label: "2 Kanal", sqft: 9000 }
];

// Marla standard presets
export const MARLA_STANDARD_PRESETS = [
  { id: "272.25", label: "272.25 sq ft", region: "Islamabad, Rawalpindi, CDA standard", sqft: 272.25 },
  { id: "250", label: "250 sq ft", region: "Lahore standard", sqft: 250 },
  { id: "225", label: "225 sq ft", region: "Karachi, traditional", sqft: 225 },
  { id: "custom", label: "Custom", region: "1 Marla = Custom sq ft", sqft: 272.25 }
];

// Benchmark rates per city category
const CITY_BENCHMARKS: Record<
  string,
  { cement: number; steel: number; brick: number; sand: number; crush: number; labour: number; transportPerSqft: number }
> = {
  isb: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 },
  rwp: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 },
  lhr: { cement: 1430, steel: 258, brick: 13.5, sand: 42, crush: 88, labour: 410, transportPerSqft: 32 },
  khi: { cement: 1480, steel: 268, brick: 15.0, sand: 50, crush: 105, labour: 450, transportPerSqft: 40 },
  pew: { cement: 1440, steel: 262, brick: 13.8, sand: 44, crush: 90, labour: 400, transportPerSqft: 34 },
  default: { cement: 1460, steel: 265, brick: 14.5, sand: 45, crush: 95, labour: 430, transportPerSqft: 38 }
};

export function PrimaryPropertyCalculator() {
  const {
    isAuthenticated,
    user,
    isSuperAdmin,
    openLoginModal,
    openUpgradeModal,
    openCheckoutModal,
    showToast
  } = useAuthStore();

  const { selectedCityId: globalCityId, setSelectedCityId: setGlobalCityId, saveCalculation } = useProjectStore();
  const [isMounted, setIsMounted] = useState(false);

  const isPro = Boolean(user?.is_pro || isSuperAdmin() || user?.plan === "pro" || user?.plan === "business");

  // Advanced PRO Construction Inputs (Version 3.0.0)
  const [proInputs, setProInputs] = useState<ProConstructionInputs>({
    isProEnabled: isPro,
    wallHeightMode: "auto",
    manualWallHeightFt: 10,
    bathroomCountMode: "auto",
    manualBathroomCount: 2,
    bathrooms: [
      { id: "bath_1", name: "Bathroom 1", lengthFt: 8, widthFt: 6, heightMode: "auto", heightFt: 10 },
      { id: "bath_2", name: "Bathroom 2", lengthFt: 8, widthFt: 6, heightMode: "auto", heightFt: 10 }
    ],
    applySameBathroomSize: true,
    foundationMode: "auto",
    foundationType: "strip",
    foundationDepthFt: 4.0,
    foundationWidthFt: 3.0,
    columnMode: "auto",
    manualColumnCount: 16,
    columnWidthFt: 1.0,
    columnDepthFt: 1.0,
    columnHeightMode: "auto",
    manualColumnHeightFt: 10,
    beamMode: "auto",
    manualBeamCount: 20,
    beamWidthFt: 0.75,
    beamDepthFt: 1.25,
    beamLengthMode: "auto",
    manualBeamTotalLengthFt: 300
  });

  useEffect(() => {
    setProInputs((prev) => ({ ...prev, isProEnabled: isPro }));
  }, [isPro]);

  // Drawer to configure detailed PRO parameters
  const [showProDrawer, setShowProDrawer] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. City Selection (Default to Lahore or Islamabad as in reference image)
  const [selectedCityId, setSelectedCityId] = useState<string>(globalCityId || "lhr");

  useEffect(() => {
    if (globalCityId && globalCityId !== selectedCityId) {
      setSelectedCityId(globalCityId);
    }
  }, [globalCityId]);

  // 2. Marla Standard (272.25, 250, 225, or custom)
  const [marlaStandardType, setMarlaStandardType] = useState<string>("272.25");
  const [customMarlaSqft, setCustomMarlaSqft] = useState<number>(272.25);

  // 3. Property / Plot Size Mode & Dimensions
  const [plotSizeMode, setPlotSizeMode] = useState<"preset" | "custom">("preset");
  const [customLengthFt, setCustomLengthFt] = useState<number>(50);
  const [customWidthFt, setCustomWidthFt] = useState<number>(25);
  const [plotUnit, setPlotUnit] = useState<PlotUnit>("marla");
  const [plotSize, setPlotSize] = useState<number>(10);

  // 4. Floors & Scope
  const [floorsSelection, setFloorsSelection] = useState<number>(2);
  const [constructionScope, setConstructionScope] = useState<ConstructionScope>("grey");
  const [qualityTier, setQualityTier] = useState<QualityTier>("standard");

  // Active Marla sq ft value
  const activeMarlaSqft = useMemo(() => {
    if (marlaStandardType === "custom") return Math.max(50, customMarlaSqft || 272.25);
    if (marlaStandardType === "250") return 250;
    if (marlaStandardType === "225") return 225;
    return 272.25;
  }, [marlaStandardType, customMarlaSqft]);

  // Derived plot area in square feet
  const plotAreaSqft = useMemo(() => {
    if (plotSizeMode === "custom") {
      const length = Math.max(1, customLengthFt || 0);
      const width = Math.max(1, customWidthFt || 0);
      return Math.round(length * width);
    }
    const size = Math.max(0.01, plotSize || 1);
    if (plotUnit === "marla") {
      return Math.round(size * activeMarlaSqft);
    }
    if (plotUnit === "kanal") {
      return Math.round(size * 20 * activeMarlaSqft);
    }
    return Math.round(size);
  }, [plotSizeMode, customLengthFt, customWidthFt, plotSize, plotUnit, activeMarlaSqft]);

  const plotAreaInMarlas = useMemo(() => {
    if (plotSizeMode === "custom") {
      return Number((plotAreaSqft / activeMarlaSqft).toFixed(2));
    }
    if (plotUnit === "marla") return plotSize;
    if (plotUnit === "kanal") return plotSize * 20;
    return Number((plotAreaSqft / activeMarlaSqft).toFixed(2));
  }, [plotSizeMode, plotAreaSqft, activeMarlaSqft, plotUnit, plotSize]);

  // Standard setback & coverage ratio in Pakistan
  const coverageRatio = useMemo(() => {
    if (plotAreaInMarlas <= 5) return 0.88;
    if (plotAreaInMarlas <= 7) return 0.82;
    if (plotAreaInMarlas <= 10) return 0.76;
    return 0.70;
  }, [plotAreaInMarlas]);

  const autoSuggestedCoveredArea = useMemo(() => {
    const groundCovered = Math.round(plotAreaSqft * coverageRatio);
    const upperCovered = Math.round(groundCovered * 0.95);
    const total = groundCovered + Math.max(0, floorsSelection - 1) * upperCovered;
    return total;
  }, [plotAreaSqft, coverageRatio, floorsSelection]);

  // Covered Area input state (auto suggested, but user editable)
  const [userCoveredArea, setUserCoveredArea] = useState<number | null>(null);
  const coveredAreaSqft = userCoveredArea !== null ? userCoveredArea : autoSuggestedCoveredArea;

  // Selected City object
  const selectedCity = useMemo(() => {
    const found = PAKISTANI_CITIES.find((c) => c.id === selectedCityId);
    if (found) return found;
    return { id: "lhr", name: "Lahore", province: "Punjab", marlaSize: 250 };
  }, [selectedCityId]);

  // City benchmark rates
  const cityRates = useMemo(() => {
    return CITY_BENCHMARKS[selectedCityId] || CITY_BENCHMARKS.default;
  }, [selectedCityId]);

  // Custom rates overrides
  const [useCustomRates, setUseCustomRates] = useState<boolean>(false);
  const [customRates, setCustomRates] = useState({
    cement: 1430,
    steel: 258,
    brick: 13.5,
    sand: 42,
    crush: 88,
    labour: 410
  });

  // Effective rates
  const activeRates = useMemo(() => {
    return {
      cementBagRate: useCustomRates ? customRates.cement : cityRates.cement,
      steelKgRate: useCustomRates ? customRates.steel : cityRates.steel,
      brickRate: useCustomRates ? customRates.brick : cityRates.brick,
      sandCftRate: useCustomRates ? customRates.sand : cityRates.sand,
      crushCftRate: useCustomRates ? customRates.crush : cityRates.crush,
      labourRate: useCustomRates ? customRates.labour : cityRates.labour,
      transportRatePerSqft: cityRates.transportPerSqft
    };
  }, [useCustomRates, customRates, cityRates]);

  // Real Civil Engineering Calculation Engine Integration
  const calculationResult = useMemo(() => {
    const isGreyOnly = constructionScope === "grey";

    const greyEst = calculateGreyStructureEstimate({
      coveredAreaSqft,
      numberOfFloors: floorsSelection,
      rates: {
        cementBagRate: activeRates.cementBagRate,
        steelKgRate: activeRates.steelKgRate,
        brickRate: activeRates.brickRate,
        sandCftRate: activeRates.sandCftRate,
        crushCftRate: activeRates.crushCftRate,
        labourSqftRate: activeRates.labourRate,
        transportRate: activeRates.transportRatePerSqft * coveredAreaSqft
      }
    });

    const fullEst = calculateFullHouseEstimate({
      plotAreaMarla: Math.max(1, Math.round(coveredAreaSqft / 225)),
      coveredAreaSqft,
      numberOfFloors: floorsSelection,
      quality: qualityTier,
      rates: {
        cementBagRate: activeRates.cementBagRate,
        steelKgRate: activeRates.steelKgRate,
        brickRate: activeRates.brickRate,
        sandCftRate: activeRates.sandCftRate,
        crushCftRate: activeRates.crushCftRate,
        greyLabourSqftRate: activeRates.labourRate
      }
    });

    // Version 3.0.0: Reconciled Structural Master Engine
    const advancedPro = calculateAdvancedGreyStructure({
      coveredAreaSqft,
      numberOfFloors: floorsSelection,
      proInputs: {
        ...proInputs,
        isProEnabled: isPro
      },
      rates: {
        cementBagRate: activeRates.cementBagRate,
        steelKgRate: activeRates.steelKgRate,
        brickRate: activeRates.brickRate,
        sandCftRate: activeRates.sandCftRate,
        crushCftRate: activeRates.crushCftRate,
        labourSqftRate: activeRates.labourRate,
        transportRate: activeRates.transportRatePerSqft * coveredAreaSqft
      }
    });

    const cementBags = isPro ? advancedPro.materials.cement.finalQuantity : greyEst.materials.cement.finalQuantity;
    const steelKg = isPro ? advancedPro.materials.steel.finalQuantity : greyEst.materials.steel.finalQuantity;
    const bricksCount = isPro ? advancedPro.materials.bricks.finalQuantity : greyEst.materials.bricks.finalQuantity;
    const sandCft = isPro ? advancedPro.materials.sand.finalQuantity : greyEst.materials.sand.finalQuantity;
    const crushCft = isPro ? advancedPro.materials.crush.finalQuantity : greyEst.materials.crush.finalQuantity;

    const cementCost = Math.round(cementBags * activeRates.cementBagRate);
    const steelCost = Math.round(steelKg * activeRates.steelKgRate);
    const bricksCost = Math.round(bricksCount * activeRates.brickRate);
    const sandCost = Math.round(sandCft * activeRates.sandCftRate);
    const crushCost = Math.round(crushCft * activeRates.crushCftRate);

    const labourCost = isPro ? advancedPro.costs.labourCost : greyEst.costs.labourCost;
    const transportCost = isPro
      ? advancedPro.costs.transportCost
      : Math.round(coveredAreaSqft * activeRates.transportRatePerSqft);
    const wastageCost = Math.round((cementCost + steelCost + bricksCost + sandCost + crushCost) * 0.035);

    const greyGrandTotal = isPro
      ? advancedPro.totalCost
      : cementCost + steelCost + bricksCost + sandCost + crushCost + labourCost + transportCost + wastageCost;

    const finishingCost = isGreyOnly ? 0 : Math.max(0, fullEst.summary.totalProjectEstimate - greyGrandTotal);
    const totalCost = isGreyOnly ? greyGrandTotal : greyGrandTotal + finishingCost;
    const costPerSqft = Math.round(totalCost / Math.max(1, coveredAreaSqft));

    // Estimated duration
    let durationMin = 5;
    let durationMax = 7;
    if (coveredAreaSqft > 4000 || floorsSelection >= 3) {
      durationMin = 10;
      durationMax = 14;
    } else if (coveredAreaSqft > 2200 || floorsSelection === 2) {
      durationMin = 7;
      durationMax = 9;
    }
    const estimatedDuration = `${durationMin} - ${durationMax} Months`;

    // 7 Real Material Breakdown Items for Donut Chart
    const chartItems = [
      { name: "Cement", cost: cementCost, color: "#2563eb" },
      { name: "Steel (Saria)", cost: steelCost, color: "#3b82f6" },
      { name: "Bricks", cost: bricksCost, color: "#f97316" },
      { name: "Sand & Crush", cost: sandCost + crushCost, color: "#10b981" },
      { name: "Labour & Shuttering", cost: labourCost, color: "#8b5cf6" },
      { name: "Transport & Logistics", cost: transportCost, color: "#ec4899" },
      { name: "Wastage Allowance", cost: wastageCost, color: "#06b6d4" }
    ];

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
      estimatedDuration,
      cementBags,
      cementCost,
      steelKg,
      steelCost,
      bricksCount,
      bricksCost,
      sandCft,
      sandCost,
      crushCft,
      crushCost,
      labourCost,
      transportCost,
      wastageCost,
      chartData,
      chartTotal
    };
  }, [coveredAreaSqft, floorsSelection, activeRates, qualityTier, constructionScope, isPro, proInputs]);

  // Handlers
  const handleCalculateEstimate = () => {
    showToast("Calculation updated with latest parameters!", "info");
  };

  const handleReset = () => {
    setPlotSizeMode("preset");
    setPlotSize(10);
    setPlotUnit("marla");
    setCustomLengthFt(50);
    setCustomWidthFt(25);
    setMarlaStandardType("272.25");
    setCustomMarlaSqft(272.25);
    setFloorsSelection(2);
    setConstructionScope("grey");
    setUserCoveredArea(null);
    setUseCustomRates(false);
    showToast("Calculator reset to standard defaults.", "info");
  };

  const handleSharePdfOrPrint = () => {
    if (!isPro) {
      openUpgradeModal("Share the calculation in PDF or Print");
    } else {
      window.print();
    }
  };

  return (
    <div id="calculator-section" className="space-y-6 max-w-7xl mx-auto w-full text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. HERO PROPERTY CALCULATOR BANNER (EXACT MATCH TO REFERENCE IMAGE)       */}
      {/* ========================================================================= */}
      <div className="bg-[#054e38] dark:bg-[#033023] border border-emerald-600/40 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        {/* Subtle ambient blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Home Icon + Title + Subtitle */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Home className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                Property Calculator
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 mt-0.5">
                Estimate your construction cost with confidence
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5">
                Get accurate material quantities, labour cost and total estimate for your dream home or project.
              </p>
            </div>
          </div>

          {/* Right: City Selector Dropdown + Live Rates Pill */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
            {/* Select City Dropdown */}
            <div className="flex flex-col text-left">
              <label className="text-[10px] font-bold text-emerald-200/80 uppercase tracking-wider mb-1">
                Select City
              </label>
              <div className="relative">
                <select
                  value={selectedCityId}
                  onChange={(e) => {
                    setSelectedCityId(e.target.value);
                    setGlobalCityId(e.target.value);
                  }}
                  className="appearance-none bg-white text-slate-800 font-bold text-xs pl-8 pr-9 py-2 rounded-xl shadow-sm focus:outline-none cursor-pointer border border-white/30"
                >
                  <option value="lhr">Lahore</option>
                  <option value="isb">Islamabad</option>
                  <option value="rwp">Rawalpindi</option>
                  <option value="khi">Karachi</option>
                  <option value="pew">Peshawar</option>
                  <option value="mul">Multan</option>
                  <option value="fsd">Faisalabad</option>
                  <option value="skt">Sialkot</option>
                </select>
                <MapPin className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 top-2.5 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Live Rates Pill Badge */}
            <div className="flex flex-col text-left self-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#033827] border border-emerald-500/40 text-emerald-200 rounded-xl text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-[11px] font-extrabold text-white leading-none">Live Rates</div>
                  <div className="text-[9px] text-emerald-300/80 font-medium mt-0.5">Last updated: 09 Sep 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL-TIER SIDE-BY-SIDE PANELS (PRO LEFT • FREE RIGHT)                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-stretch">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANEL: PRO — EXACT CONSTRUCTION CALCULATION (5 COLS)               */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-[#f0fdf4] dark:bg-emerald-950/20 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Top Bar: PRO Badge + Title + Upgrade Button */}
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>PRO</span>
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Exact Construction Calculation
                </h2>
              </div>

              <button
                type="button"
                onClick={() => openUpgradeModal("PRO — Exact Construction Calculation")}
                className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade to PRO</span>
              </button>
            </div>

            {/* Sub-Badges: More Accurate • Detailed • Professional */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                More Accurate
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Detailed
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Professional
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Get precise material quantities, accurate costs and advanced construction options for a more reliable estimate.
            </p>

            {/* 6 Compact Feature Cards Grid (2 cols x 3 rows) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Card 1: Wall Height */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">Wall Height</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Set exact wall height (automatic or manual) for accurate wall volume and material calculation.
                </p>
              </div>

              {/* Card 2: Bathroom Count & Size */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <Bath className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">Bathroom Count &amp; Size</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Add multiple bathrooms with custom dimensions for precise material and cost estimation.
                </p>
              </div>

              {/* Card 3: Foundation Depth & Dimensions */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">Foundation Depth &amp; Dimensions</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Specify foundation depth, width and type for exact excavation and material needs.
                </p>
              </div>

              {/* Card 4: Columns & Beams */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">Columns &amp; Beams</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Add column and beam count, size and length for structural accuracy.
                </p>
              </div>

              {/* Card 5: Automatic / Manual Mode */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">Automatic / Manual Mode</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Choose automatic calculations or enter your exact dimensions and specifications.
                </p>
              </div>

              {/* Card 6: Detailed Material Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">Detailed Material Breakdown</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Get exact quantities of cement, steel, bricks, sand, crush, labour and more.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Pro Callout & Drawer Toggle */}
          <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  These advanced features are available in PRO version only.
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Unlock exact construction calculation and get the most accurate estimate.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openUpgradeModal("PRO — Exact Construction Calculation")}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade to PRO (PKR 200/mo • PKR 799/yr)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProDrawer(!showProDrawer)}
                className="py-2.5 px-3 rounded-xl border border-emerald-400 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 transition-colors flex items-center gap-1"
                title="Configure Exact Structural Parameters"
              >
                <span>{showProDrawer ? "Hide Details" : "Configure"}</span>
                {showProDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANEL: FREE — BASIC CALCULATOR (7 COLS)                           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-blue-200/80 dark:border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header: FREE Badge + Title + Subtitle + Segmented Mode Switcher */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                    FREE
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Basic Calculator
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick estimate with standard settings
                </p>
              </div>

              {/* Mode Toggle: Preset vs Custom */}
              <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPlotSizeMode("preset");
                    setUserCoveredArea(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    plotSizeMode === "preset"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Standard Plots
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlotSizeMode("custom");
                    setUserCoveredArea(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    plotSizeMode === "custom"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Custom Dimensions
                </button>
              </div>
            </div>

            {/* Inputs & Estimate Split (Row with Inputs on Left, Estimate Card on Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left: Inputs (7 cols on md) */}
              <div className="md:col-span-7 space-y-3.5">
                {/* Plot Size & Marla Standard or Custom Dimensions */}
                {plotSizeMode === "preset" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                        Plot Size
                      </label>
                      <select
                        value={plotSize}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlotSize(val);
                          setUserCoveredArea(null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value={3}>3 Marla ({Math.round(3 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                        <option value={5}>5 Marla ({Math.round(5 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                        <option value={7}>7 Marla ({Math.round(7 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                        <option value={10}>10 Marla ({Math.round(10 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                        <option value={20}>1 Kanal ({Math.round(20 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                        <option value={40}>2 Kanal ({Math.round(40 * activeMarlaSqft).toLocaleString()} sq ft)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                        Marla Standard
                      </label>
                      <select
                        value={marlaStandardType}
                        onChange={(e) => {
                          setMarlaStandardType(e.target.value);
                          setUserCoveredArea(null);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="272.25">272.25 sq ft (Official / Revenue)</option>
                        <option value="250">250 sq ft (CDA / Bahria / DHA)</option>
                        <option value="225">225 sq ft (Urban Societies)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Length (ft)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={customLengthFt}
                          onChange={(e) => {
                            setCustomLengthFt(parseFloat(e.target.value) || 0);
                            setUserCoveredArea(null);
                          }}
                          placeholder="e.g. 50"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Width (ft)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={customWidthFt}
                          onChange={(e) => {
                            setCustomWidthFt(parseFloat(e.target.value) || 0);
                            setUserCoveredArea(null);
                          }}
                          placeholder="e.g. 25"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                          Marla Standard
                        </label>
                        <select
                          value={marlaStandardType}
                          onChange={(e) => {
                            setMarlaStandardType(e.target.value);
                            setUserCoveredArea(null);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="272.25">272.25 sq ft (Official / Revenue)</option>
                          <option value="250">250 sq ft (CDA / Bahria / DHA)</option>
                          <option value="225">225 sq ft (Urban Societies)</option>
                        </select>
                      </div>

                      {/* Dynamic Readout Badge */}
                      <div className="p-2 sm:mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold">{customLengthFt || 0}′ × {customWidthFt || 0}′</span> = {plotAreaSqft.toLocaleString()} sq ft
                          <span className="text-blue-600 dark:text-blue-400 font-extrabold block text-[11px]">
                            ({plotAreaInMarlas} Marla @ {activeMarlaSqft} sq ft/m)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Row: Construction Type & Floors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                      Construction Type
                    </label>
                    <select
                      value={constructionScope}
                      onChange={(e) => setConstructionScope(e.target.value as ConstructionScope)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="grey">Grey Structure</option>
                      <option value="complete">Full Finishing</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                      Floors
                    </label>
                    <select
                      value={floorsSelection}
                      onChange={(e) => {
                        setFloorsSelection(parseInt(e.target.value));
                        setUserCoveredArea(null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value={1}>Single (Ground)</option>
                      <option value={2}>Double (Ground + 1)</option>
                      <option value={3}>Triple (Ground + 2)</option>
                    </select>
                  </div>
                </div>

                {/* Covered Area (sq ft) + Quick Ratio Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Covered Area (sq ft)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setUserCoveredArea(null)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                          userCoveredArea === null
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title="Auto-suggested covered area with standard setback and floors"
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserCoveredArea(Math.round(plotAreaSqft * 0.8 * floorsSelection))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                          userCoveredArea === Math.round(plotAreaSqft * 0.8 * floorsSelection)
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title="80% plot coverage per floor"
                      >
                        80%
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserCoveredArea(Math.round(plotAreaSqft * 1.0 * floorsSelection))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                          userCoveredArea === Math.round(plotAreaSqft * 1.0 * floorsSelection)
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                        title="100% full coverage per floor"
                      >
                        100%
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={coveredAreaSqft}
                    onChange={(e) => setUserCoveredArea(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 2,722"
                  />
                </div>

                {/* Calculate Estimate & Reset Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCalculateEstimate}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Calculate Estimate</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Right: Your Estimate Result Card (5 cols on md) */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 text-center space-y-2">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Your Estimate <span className="text-[10px] text-slate-400 font-medium">(Free Version)</span>
                </div>

                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Home className="w-5 h-5" />
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatPKR(calculationResult.totalCost)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Total Construction Cost
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/40 grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Cost per Sq Ft</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      Rs. {formatNumber(calculationResult.costPerSqft)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Estimated Duration</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {calculationResult.estimatedDuration}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Material Breakdown (Free Version) - Donut Chart + Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Material Breakdown <span className="text-[10px] text-slate-400 lowercase font-normal">(free version)</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">
                  Total: {formatPKR(calculationResult.totalCost)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Donut Chart Viewport (5 cols on md) */}
                <div className="md:col-span-5 h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculationResult.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={66}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {calculationResult.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatPKR(Number(val)), "Cost"]}
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          fontSize: "11px",
                          color: "#fff"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[9px] text-slate-400 font-medium leading-none">Total Cost</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white mt-0.5 leading-none">
                      {formatLakhCrore(calculationResult.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Legend List (7 cols on md) */}
                <div className="md:col-span-7 space-y-1.5 text-xs">
                  {calculationResult.chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate font-medium text-[11px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                        <span className="text-slate-400 w-10 text-right">{item.percentage}%</span>
                        <span className="font-bold text-slate-900 dark:text-white w-20 text-right">
                          {formatPKR(item.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Pro Drawer for Deep Input Tuning (Appears if user clicked Configure) */}
      {showProDrawer && (
        <div className="animate-in fade-in duration-200">
          <ProConstructionSection
            isPro={isPro}
            inputs={proInputs}
            onChange={setProInputs}
            coveredAreaSqft={coveredAreaSqft}
            floors={floorsSelection}
            onProLockClick={(feat: string) => {
              if (!isAuthenticated) {
                openLoginModal();
              } else {
                openUpgradeModal(`PRO Feature: ${feat}`);
              }
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AVAILABLE LAYOUT PLANS (FREE 1 • PRO 3)                                */}
      {/* ========================================================================= */}
      <HouseLayoutPlansSection
        isPro={isPro}
        onUpgradeClick={(feat) => openUpgradeModal(feat)}
      />

      {/* ========================================================================= */}
      {/* 4. THREE-COLUMN FEATURE COMPARISON & APP UPDATE SECTION                   */}
      {/* ========================================================================= */}
      <FeatureComparisonSection
        onUpgradeClick={(feat) => openUpgradeModal(feat)}
      />

      {/* ========================================================================= */}
      {/* 5. GREY STRUCTURE COST BREAKDOWN (8 COMPACT CARDS)                        */}
      {/* ========================================================================= */}
      <GreyStructureBreakdownGrid
        totalCost={calculationResult.totalCost}
        coveredAreaSqft={coveredAreaSqft}
        floors={floorsSelection}
        cementBags={calculationResult.cementBags}
        steelKg={calculationResult.steelKg}
        bricksCount={calculationResult.bricksCount}
        sandCft={calculationResult.sandCft}
        crushCft={calculationResult.crushCft}
        labourCost={calculationResult.labourCost}
        transportCost={calculationResult.transportCost}
        wastageCost={calculationResult.wastageCost}
        cementBagRate={activeRates.cementBagRate}
        steelKgRate={activeRates.steelKgRate}
        brickRate={activeRates.brickRate}
        sandCftRate={activeRates.sandCftRate}
        crushCftRate={activeRates.crushCftRate}
        labourRate={activeRates.labourRate}
      />

      {/* ========================================================================= */}
      {/* 6. PROFESSIONAL CONTRACTOR TOOLS BAR                                      */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider block">
            Professional Contractor Tools
          </span>
          <p className="text-xs text-slate-300 mt-0.5">
            Export detailed BOQ, PDF reports, vendor comparison and more with PRO features.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                openLoginModal();
              } else if (!isPro) {
                openUpgradeModal("Export BOQ Summary");
              } else {
                window.print();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export BOQ Summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}
