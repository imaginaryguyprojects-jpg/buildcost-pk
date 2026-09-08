"use client";

import React, { useState, useMemo } from "react";
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
  Coins
} from "lucide-react";
import { PAKISTANI_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export type PlotUnit = "marla" | "kanal" | "sqft" | "sqyd" | "sqm" | "acre";
export type ConstructionType = "complete" | "grey" | "custom";
export type EstimateType = "quick" | "detailed";

const DEFAULT_RATES = {
  cement: 1450, // PKR per 50kg bag
  steel: 260,   // PKR per kg
  brick: 14,    // PKR per brick
  sand: 45,     // PKR per cft
  crush: 65     // PKR per cft
};

export function PrimaryPropertyCalculator() {
  const { isAuthenticated, openLoginModal, openProjectUpgradeModal, openCheckoutModal, showToast } = useAuthStore();

  // Inputs
  const [cityId, setCityId] = useState<string>("isb");
  const [plotSize, setPlotSize] = useState<number>(5);
  const [plotUnit, setPlotUnit] = useState<PlotUnit>("marla");
  const [coveredAreaSqft, setCoveredAreaSqft] = useState<number>(2200);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [constructionType, setConstructionType] = useState<ConstructionType>("complete");
  const [estimateType, setEstimateType] = useState<EstimateType>("quick");
  const [qualityTier, setQualityTier] = useState<"standard" | "economy" | "premium" | "luxury">("standard");

  // Custom Rates State (100% Free to tweak and calculate on-screen)
  const [showCustomRates, setShowCustomRates] = useState<boolean>(false);
  const [useCustomRates, setUseCustomRates] = useState<boolean>(false);
  const [customCementRate, setCustomCementRate] = useState<number>(DEFAULT_RATES.cement);
  const [customSteelRate, setCustomSteelRate] = useState<number>(DEFAULT_RATES.steel);
  const [customBrickRate, setCustomBrickRate] = useState<number>(DEFAULT_RATES.brick);
  const [customSandRate, setCustomSandRate] = useState<number>(DEFAULT_RATES.sand);
  const [customCrushRate, setCustomCrushRate] = useState<number>(DEFAULT_RATES.crush);

  // Calculation State
  const [hasCalculated, setHasCalculated] = useState<boolean>(true); // initially computed on load with 5-marla defaults
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Selected city
  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === cityId) || PAKISTANI_CITIES[0];
  const marlaSqft = selectedCity.defaultMarlaSqft || 225;

  // Convert any plot unit into total square feet
  const plotAreaInSqft = useMemo(() => {
    const size = Math.max(0.1, plotSize || 1);
    switch (plotUnit) {
      case "marla":
        return size * marlaSqft;
      case "kanal":
        return size * 20 * marlaSqft;
      case "sqyd":
        return size * 9;
      case "sqm":
        return size * 10.7639;
      case "acre":
        return size * 43560;
      case "sqft":
      default:
        return size;
    }
  }, [plotSize, plotUnit, marlaSqft]);

  // Convert to marlas for calculations
  const plotAreaInMarlas = plotAreaInSqft / marlaSqft;

  // Auto-suggest covered area when plot or floors change
  const autoSuggestedCoveredArea = Math.round(plotAreaInSqft * 0.7 * Math.max(1, numberOfFloors));

  // Sync suggested covered area when plot size or unit changes if user hasn't explicitly set it
  const handlePlotUnitOrSizeChange = (newSize: number, newUnit: PlotUnit) => {
    setPlotSize(newSize);
    setPlotUnit(newUnit);
    let sqft = newSize;
    if (newUnit === "marla") sqft = newSize * marlaSqft;
    else if (newUnit === "kanal") sqft = newSize * 20 * marlaSqft;
    else if (newUnit === "sqyd") sqft = newSize * 9;
    else if (newUnit === "sqm") sqft = newSize * 10.7639;
    else if (newUnit === "acre") sqft = newSize * 43560;
    setCoveredAreaSqft(Math.round(sqft * 0.7 * Math.max(1, numberOfFloors)));
  };

  const handleFloorsChange = (floors: number) => {
    setNumberOfFloors(floors);
    setCoveredAreaSqft(Math.round(plotAreaInSqft * 0.7 * floors));
  };

  const handleResetRates = () => {
    setCustomCementRate(DEFAULT_RATES.cement);
    setCustomSteelRate(DEFAULT_RATES.steel);
    setCustomBrickRate(DEFAULT_RATES.brick);
    setCustomSandRate(DEFAULT_RATES.sand);
    setCustomCrushRate(DEFAULT_RATES.crush);
    setUseCustomRates(false);
    showToast("Rates reset to official Pakistani city benchmarks", "info");
  };

  // Perform Calculation
  const calculationResult = useMemo(() => {
    const safeCovered = Math.max(50, coveredAreaSqft || autoSuggestedCoveredArea);
    const safeFloors = Math.max(1, numberOfFloors || 1);

    const baseEstimate = calculateCompleteHouseEstimate({
      plotAreaMarla: Math.max(0.1, plotAreaInMarlas),
      marlaSqft,
      coveredAreaSqft: safeCovered,
      numberOfFloors: safeFloors,
      quality: qualityTier,
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      ...(useCustomRates
        ? {
            customCementRate: customCementRate || DEFAULT_RATES.cement,
            customSteelRate: customSteelRate || DEFAULT_RATES.steel,
            customBrickRate: customBrickRate || DEFAULT_RATES.brick,
            customSandRate: customSandRate || DEFAULT_RATES.sand,
            customCrushRate: customCrushRate || DEFAULT_RATES.crush
          }
        : {})
    });

    // Approximate breakdown adjustments based on construction type
    const isGreyOnly = constructionType === "grey";
    const greyStructureCost = Math.round(
      baseEstimate.materialsCost * 0.75 + baseEstimate.labourCost * 0.65 + baseEstimate.transportCost * 0.8
    );
    const finishingCost = isGreyOnly ? 0 : Math.round(baseEstimate.grandTotal - greyStructureCost);
    const totalCost = isGreyOnly ? greyStructureCost : baseEstimate.grandTotal;
    const costPerSqft = Math.round(totalCost / safeCovered);

    // Approximate duration: 4-6 months for 1 floor, +2 months per additional floor
    const estimatedDurationMonths = safeFloors === 1 ? "4 - 5" : safeFloors === 2 ? "7 - 9" : safeFloors === 3 ? "10 - 12" : "13 - 16";

    // Category breakdown
    const materialCost = Math.round(isGreyOnly ? baseEstimate.materialsCost * 0.75 : baseEstimate.materialsCost);
    const labourCost = Math.round(isGreyOnly ? baseEstimate.labourCost * 0.65 : baseEstimate.labourCost);
    const transportCost = Math.round(baseEstimate.transportCost * (isGreyOnly ? 0.8 : 1.0));
    const wastageCost = Math.round(materialCost * 0.05); // 5% standard wastage
    const contingencyCost = baseEstimate.contingencyCost;

    // Material requirements & quantities
    const cementMat = baseEstimate.materials.find((m) => m.materialId === "cement");
    const steelMat = baseEstimate.materials.find((m) => m.materialId === "steel");
    const bricksMat = baseEstimate.materials.find((m) => m.materialId === "bricks");
    const sandMat = baseEstimate.materials.find((m) => m.materialId === "sand");
    const crushMat = baseEstimate.materials.find((m) => m.materialId === "crush");

    const cementBags = cementMat?.finalQuantity ?? Math.round(safeCovered * (isGreyOnly ? 0.38 : 0.48));
    const steelKg = steelMat?.finalQuantity ?? Math.round(safeCovered * (isGreyOnly ? 3.4 : 4.0));
    const steelTons = (steelKg / 1000).toFixed(2);
    const bricksCount = bricksMat?.finalQuantity ?? Math.round(safeCovered * 24);
    const sandCft = sandMat?.finalQuantity ?? Math.round(safeCovered * 1.8);
    const crushCft = crushMat?.finalQuantity ?? Math.round(safeCovered * 1.4);

    return {
      totalCost,
      costPerSqft,
      greyStructureCost,
      finishingCost,
      estimatedDurationMonths,
      materialCost,
      labourCost,
      transportCost,
      wastageCost,
      contingencyCost,
      isCustomRatesActive: useCustomRates,
      activeRates: {
        cement: useCustomRates ? customCementRate : (cementMat?.unitRate ?? DEFAULT_RATES.cement),
        steel: useCustomRates ? customSteelRate : (steelMat?.unitRate ?? DEFAULT_RATES.steel),
        brick: useCustomRates ? customBrickRate : (bricksMat?.unitRate ?? DEFAULT_RATES.brick),
        sand: useCustomRates ? customSandRate : (sandMat?.unitRate ?? DEFAULT_RATES.sand),
        crush: useCustomRates ? customCrushRate : (crushMat?.unitRate ?? DEFAULT_RATES.crush)
      },
      materials: {
        cementBags,
        steelKg,
        steelTons,
        bricksCount,
        sandCft,
        crushCft
      }
    };
  }, [
    coveredAreaSqft,
    autoSuggestedCoveredArea,
    numberOfFloors,
    plotAreaInMarlas,
    marlaSqft,
    qualityTier,
    selectedCity,
    constructionType,
    useCustomRates,
    customCementRate,
    customSteelRate,
    customBrickRate,
    customSandRate,
    customCrushRate
  ]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setIsCalculating(false);
      // Smooth scroll to results on mobile
      const el = document.getElementById("calculation-summary-card");
      if (el && window.innerWidth < 1024) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleProAction = (featureName: string) => {
    if (!isAuthenticated) {
      showToast(`${featureName} is a Pro feature. Please sign in or upgrade to continue.`, "info");
      openLoginModal();
    } else {
      openProjectUpgradeModal();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* FREE VS PRO BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Free Instant Estimator:</strong> Calculate for free with Pakistani city rates or custom market rates. Upgrade to Pro to save projects, export PDF reports, and unlock BOQ tools.
          </span>
        </div>
        <button
          type="button"
          onClick={() => openCheckoutModal()}
          className="shrink-0 self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
        >
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* PRIMARY PROPERTY CALCULATOR CARD */}
      <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl shadow-emerald-950/20 text-slate-100 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Pakistan Property Construction Calculator
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                  Free
                </span>
                {useCustomRates && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider hidden sm:inline-block">
                    Custom Rates Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant Pakistan-calibrated material quantities, civil structural costs, custom rate overrides, and labour wages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleProAction("Save Project")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Save this project into your account"
            >
              <span>Save Project</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleProAction("PDF Export")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700/80"
              title="Download formal contractor-ready PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>PDF Report</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> PRO
              </span>
            </button>
          </div>
        </div>

        {/* INPUTS GRID */}
        <form onSubmit={handleCalculate} className="pt-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. City */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                <span>City Location</span>
                <span className="text-emerald-400 font-normal">({selectedCity.province})</span>
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-200 font-medium focus:outline-none transition-colors"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.urduName}) — {c.defaultMarlaSqft} sqft/Marla
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Plot Size & Unit */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Plot Size &amp; Unit</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={plotSize}
                  onChange={(e) => handlePlotUnitOrSizeChange(parseFloat(e.target.value) || 1, plotUnit)}
                  className="w-1/2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-200 font-bold focus:outline-none transition-colors"
                  placeholder="5"
                  required
                />
                <select
                  value={plotUnit}
                  onChange={(e) => handlePlotUnitOrSizeChange(plotSize, e.target.value as PlotUnit)}
                  className="w-1/2 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-2.5 py-2.5 text-slate-200 font-semibold focus:outline-none transition-colors"
                >
                  <option value="marla">Marla</option>
                  <option value="kanal">Kanal</option>
                  <option value="sqft">Sq Ft</option>
                  <option value="sqyd">Sq Yd (Guz)</option>
                  <option value="sqm">Sq Meters</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                ≈ {formatNumber(plotAreaInSqft)} sqft ({plotAreaInMarlas.toFixed(1)} Marlas)
              </span>
            </div>

            {/* 3. Number of Floors */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Number of Floors</label>
              <select
                value={numberOfFloors}
                onChange={(e) => handleFloorsChange(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-200 font-semibold focus:outline-none transition-colors"
              >
                <option value={1}>Single Story (Ground Floor)</option>
                <option value={2}>Double Story (Ground + 1st)</option>
                <option value={3}>Triple Story (Ground + 2 Floors)</option>
                <option value={4}>4 Floors (Plaza / Building)</option>
                <option value={5}>5 Floors (Mid-Rise)</option>
              </select>
            </div>

            {/* 4. Covered Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold block">Total Covered Area</label>
                <button
                  type="button"
                  onClick={() => setCoveredAreaSqft(autoSuggestedCoveredArea)}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium underline"
                >
                  Auto: {formatNumber(autoSuggestedCoveredArea)}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  value={coveredAreaSqft}
                  onChange={(e) => setCoveredAreaSqft(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-slate-200 font-bold focus:outline-none transition-colors pr-12"
                  placeholder="2200"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-500">
                  sqft
                </span>
              </div>
            </div>
          </div>

          {/* SECOND ROW: Construction Scope & Quality Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Construction Type */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Construction Scope</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "complete", label: "Complete House" },
                  { id: "grey", label: "Grey Structure" },
                  { id: "custom", label: "Custom Scope" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setConstructionType(t.id as ConstructionType)}
                    className={cn(
                      "py-2 px-1 text-center font-bold text-[11px] rounded-lg transition-all",
                      constructionType === t.id
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Tier */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Finishing Quality Specification</label>
              <select
                value={qualityTier}
                onChange={(e) => setQualityTier(e.target.value as any)}
                disabled={constructionType === "grey"}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 disabled:opacity-50 rounded-xl px-3.5 py-2.5 text-slate-200 font-medium focus:outline-none transition-colors"
              >
                <option value="standard">Standard Quality (A-Class Pakistani Standard)</option>
                <option value="economy">Economy Tier (Essential Local Materials)</option>
                <option value="premium">Premium Executive (Imported Tiles &amp; Fittings)</option>
                <option value="luxury">Luxury Elite (Designer Architecture)</option>
              </select>
            </div>
          </div>

          {/* CUSTOM MATERIAL RATES COLLAPSIBLE DRAWER (100% FREE FOR LOCAL MARKET ACCURACY) */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-950/70 overflow-hidden transition-all">
            <div
              className="flex items-center justify-between p-3.5 sm:px-4 cursor-pointer hover:bg-slate-850/50 transition-colors select-none"
              onClick={() => setShowCustomRates(!showCustomRates)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors shrink-0",
                    useCustomRates
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Customize Material Rates (Cement, Steel, Bricks, Sand, Crush)
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                      Free Feature
                    </span>
                    {useCustomRates ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[9px] uppercase tracking-wider">
                        Custom Rates Applied
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        Default City Benchmarks
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Adjust rates if your local supplier or mandi prices differ. Free live calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">
                  {showCustomRates ? "Hide Rates" : "Edit Rates"}
                </span>
                {showCustomRates ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expandable Rates Content */}
            {showCustomRates && (
              <div className="p-4 pt-3 border-t border-slate-800/80 bg-slate-950 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>Enter your local vendor rates below. Calculations update instantly:</span>
                  <span className="text-emerald-400 font-medium hidden sm:inline">
                    Pakistani Rupee (PKR)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  {/* Cement */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Cement (50kg Bag)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customCementRate}
                        onChange={(e) => {
                          setCustomCementRate(parseFloat(e.target.value) || 0);
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                        placeholder="1450"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Default: Rs 1,450</span>
                  </div>

                  {/* Steel */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Steel / Saria (per Kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customSteelRate}
                        onChange={(e) => {
                          setCustomSteelRate(parseFloat(e.target.value) || 0);
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                        placeholder="260"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Default: Rs 260</span>
                  </div>

                  {/* Bricks */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Bricks (per Piece)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={customBrickRate}
                        onChange={(e) => {
                          setCustomBrickRate(parseFloat(e.target.value) || 0);
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                        placeholder="14"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Default: Rs 14</span>
                  </div>

                  {/* Sand */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Sand / Reti (per Cft)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customSandRate}
                        onChange={(e) => {
                          setCustomSandRate(parseFloat(e.target.value) || 0);
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                        placeholder="45"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Default: Rs 45</span>
                  </div>

                  {/* Crush */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Crush / Bajri (per Cft)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-[11px] text-slate-500">Rs</span>
                      <input
                        type="number"
                        min="1"
                        value={customCrushRate}
                        onChange={(e) => {
                          setCustomCrushRate(parseFloat(e.target.value) || 0);
                          setUseCustomRates(true);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 font-bold focus:outline-none"
                        placeholder="65"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 block">Default: Rs 65</span>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseCustomRates(!useCustomRates)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all",
                        useCustomRates
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{useCustomRates ? "Custom Rates Applied (Active)" : "Apply Custom Rates"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRates}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700/60"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    💡 Free users can customize rates on-screen anytime. Saving rate profiles to Khata requires Pro.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* CTA & ESTIMATE TYPE */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Calculation Mode:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEstimateType("quick")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all text-xs",
                    estimateType === "quick" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Quick Summary
                </button>
                <button
                  type="button"
                  onClick={() => setEstimateType("detailed")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-all text-xs",
                    estimateType === "detailed" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Detailed Breakdown
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? "Calculating..." : "Calculate Free"}</span>
            </button>
          </div>
        </form>

        {/* RESULTS VIEW */}
        {hasCalculated && (
          <div id="calculation-summary-card" className="mt-8 pt-6 border-t border-slate-800/90 space-y-6 animate-in fade-in duration-300">
            {/* Top Results Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cost Intelligence Summary • {selectedCity.name} Rates</span>
                  </h2>
                  {calculationResult.isCustomRatesActive && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                      Custom Rates Active
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-emerald-400">
                  {formatLakhCrore(calculationResult.totalCost)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {/* 1. Total Cost */}
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-lg">
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                    Estimated Total Cost
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {formatPKR(calculationResult.totalCost)}
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    {formatLakhCrore(calculationResult.totalCost)}
                  </span>
                </div>

                {/* 2. Rate per Sqft */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Cost per Sq Ft
                  </span>
                  <div className="text-xl font-bold text-emerald-400">
                    Rs {formatNumber(calculationResult.costPerSqft)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Based on {formatNumber(coveredAreaSqft)} sqft
                  </span>
                </div>

                {/* 3. Grey Structure */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Grey Structure
                  </span>
                  <div className="text-xl font-bold text-cyan-400">
                    {formatPKR(calculationResult.greyStructureCost)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Rs {formatNumber(Math.round(calculationResult.greyStructureCost / coveredAreaSqft))}/sqft
                  </span>
                </div>

                {/* 4. Finishing Cost */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Finishing Cost
                  </span>
                  <div className="text-xl font-bold text-slate-200">
                    {constructionType === "grey" ? "Excluded" : formatPKR(calculationResult.finishingCost)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {constructionType === "grey" ? "Grey scope only" : `${qualityTier.toUpperCase()} quality tier`}
                  </span>
                </div>

                {/* 5. Timeline */}
                <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Estimated Timeline
                  </span>
                  <div className="text-xl font-bold text-amber-400">
                    {calculationResult.estimatedDurationMonths} Months
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Standard Pakistan build rate
                  </span>
                </div>
              </div>
            </div>

            {/* COLOR-CODED BREAKDOWN SECTION */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Cost Components Breakdown</span>
                </span>
                <span className="text-[11px] text-slate-500">5 Distinct Construction Buckets</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {/* Materials — Blue Accent */}
                <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">Materials</span>
                    <Boxes className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatPKR(calculationResult.materialCost)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Cement, Steel, Bricks, Sand, Crush
                  </span>
                </div>

                {/* Labour — Amber Accent */}
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Labour</span>
                    <Hammer className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatPKR(calculationResult.labourCost)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Masonry, steel fixers, plumber
                  </span>
                </div>

                {/* Transport — Purple Accent */}
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">Transport</span>
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatPKR(calculationResult.transportCost)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Quarry freight &amp; delivery
                  </span>
                </div>

                {/* Wastage — Orange Accent */}
                <div className="bg-orange-950/40 border border-orange-500/30 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">Wastage (5%)</span>
                    <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatPKR(calculationResult.wastageCost)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Site cutting &amp; breakage allowance
                  </span>
                </div>

                {/* Contingency — Teal Accent */}
                <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wide">Contingency</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatPKR(calculationResult.contingencyCost)}
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    3% price buffer reserve
                  </span>
                </div>
              </div>
            </div>

            {/* BASIC MATERIAL QUANTITIES & ACTIVE UNIT RATES */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <span>Key Estimated Material Quantities (Pakistan Civil Standards)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  <span>{calculationResult.isCustomRatesActive ? "Calculated with Custom Rates" : "Standard Benchmark Rates"}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {/* Cement */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Cement Required</span>
                    {calculationResult.isCustomRatesActive && (
                      <span className="text-[9px] text-emerald-400 font-bold">Custom</span>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm block">
                    {formatNumber(calculationResult.materials.cementBags)} Bags
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    @ Rs {formatNumber(calculationResult.activeRates.cement)} / bag
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Total: {formatPKR(calculationResult.materials.cementBags * calculationResult.activeRates.cement)}
                  </span>
                </div>

                {/* Steel */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Deformed Steel</span>
                    {calculationResult.isCustomRatesActive && (
                      <span className="text-[9px] text-emerald-400 font-bold">Custom</span>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm block">
                    {calculationResult.materials.steelTons} Tons
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    @ Rs {formatNumber(calculationResult.activeRates.steel)} / kg
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Total: {formatPKR(calculationResult.materials.steelKg * calculationResult.activeRates.steel)}
                  </span>
                </div>

                {/* Bricks */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">First Class Bricks</span>
                    {calculationResult.isCustomRatesActive && (
                      <span className="text-[9px] text-emerald-400 font-bold">Custom</span>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm block">
                    {formatNumber(calculationResult.materials.bricksCount)} Pcs
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    @ Rs {calculationResult.activeRates.brick} / pc
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Total: {formatPKR(calculationResult.materials.bricksCount * calculationResult.activeRates.brick)}
                  </span>
                </div>

                {/* Sand */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">River Sand</span>
                    {calculationResult.isCustomRatesActive && (
                      <span className="text-[9px] text-emerald-400 font-bold">Custom</span>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm block">
                    {formatNumber(calculationResult.materials.sandCft)} Cft
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    @ Rs {calculationResult.activeRates.sand} / cft
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Total: {formatPKR(calculationResult.materials.sandCft * calculationResult.activeRates.sand)}
                  </span>
                </div>

                {/* Crush */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block text-[10px]">Crush (Bajri)</span>
                    {calculationResult.isCustomRatesActive && (
                      <span className="text-[9px] text-emerald-400 font-bold">Custom</span>
                    )}
                  </div>
                  <span className="font-bold text-white text-sm block">
                    {formatNumber(calculationResult.materials.crushCft)} Cft
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    @ Rs {calculationResult.activeRates.crush} / cft
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    Total: {formatPKR(calculationResult.materials.crushCft * calculationResult.activeRates.crush)}
                  </span>
                </div>
              </div>
            </div>

            {/* PRO ACTION BAR */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Unlock Advanced Pro Features for this Project</h4>
                    <p className="text-[11px] text-slate-400">
                      Save calculations, export client BOQs, save rate profiles permanently, and track bills in Khata.
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

              {/* Action Buttons with PRO Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-1">
                {[
                  { name: "Save Project", icon: Home, feature: "Save Project" },
                  { name: "PDF BOQ", icon: Download, feature: "PDF Report" },
                  { name: "Rate Profiles", icon: Sliders, feature: "Save Rate Profile" },
                  { name: "Vendor Khata", icon: Building2, feature: "Vendor Management" },
                  { name: "Share Link", icon: Share2, feature: "Shareable Estimate" },
                  { name: "Budget Track", icon: DollarSign, feature: "Budget Tracking" }
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.name}
                      type="button"
                      onClick={() => handleProAction(act.feature)}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex flex-col justify-between h-16 group"
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
        )}
      </div>
    </div>
  );
}
