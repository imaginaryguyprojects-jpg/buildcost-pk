"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Layers,
  Sparkles,
  Users,
  Home,
  SlidersHorizontal,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Building,
  Check,
  Zap,
  BarChart3,
  Box,
  Palette,
  Grid,
  FileText,
  Printer,
  ShieldCheck,
  Lock,
  Download
} from "lucide-react";
import {
  calculateColumns,
  calculateRoofSlab,
  calculateBrickMasonry,
  calculateFoundation,
  calculateGreyStructureEstimate,
  calculateCompleteFinishing,
  estimateConstructionDuration,
  compareWorkforceScenarios,
  calculateFullHouseEstimate,
  STRUCTURAL_DISCLAIMER,
  DEFAULT_TRADE_RATES,
  DEFAULT_PRODUCTIVITY
} from "@buildcost/calculations";
import { formatPKR, formatNumber, formatCurrency } from "@/lib/formatters";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useOfflineSync } from "@/lib/offline/OfflineSyncManager";

type CalcMode = "grey" | "finishing" | "labour" | "full" | "scenario" | "rates";

export default function CalculatorHubPage() {
  const { selectedCityId, setSelectedCityId, materialRates } = useProjectStore();
  const { user, isSuperAdmin, openUpgradeModal } = useAuthStore();
  const isPro = Boolean(user?.is_pro || isSuperAdmin() || user?.plan === "pro");

  const handleSharePdfOrPrint = () => {
    if (!isPro) {
      openUpgradeModal("Share the calculation in PDF or Print");
    } else {
      window.print();
    }
  };

  const { isOnline, lastSyncTime } = useOfflineSync();
  const [activeMode, setActiveMode] = useState<CalcMode>("grey");
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Global Project Dimension Inputs
  const [coveredAreaSqft, setCoveredAreaSqft] = useState(2000);
  const [numberOfFloors, setNumberOfFloors] = useState(2);
  const [plotAreaMarla, setPlotAreaMarla] = useState(5);
  const [hasBasement, setHasBasement] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<"economy" | "standard" | "premium" | "luxury">("standard");

  // Grey Structure Sub-tab
  const [greySubTab, setGreySubTab] = useState<"summary" | "columns" | "slab" | "brickwork" | "foundation">("summary");

  // Columns state
  const [columnTypes, setColumnTypes] = useState([
    { name: "Column Type A (Main RCC)", lengthInches: 12, widthInches: 12, heightFt: 10.5, quantity: 12 },
    { name: "Column Type B (Corner / Partition)", lengthInches: 9, widthInches: 12, heightFt: 10.5, quantity: 8 }
  ]);

  // Roof Slab state
  const [slabLengthFt, setSlabLengthFt] = useState(50);
  const [slabWidthFt, setSlabWidthFt] = useState(30);
  const [slabThicknessInches, setSlabThicknessInches] = useState(5.5);

  // Brickwork state
  const [wallLengthFt, setWallLengthFt] = useState(120);
  const [wallHeightFt, setWallHeightFt] = useState(10.5);
  const [wallThicknessInches, setWallThicknessInches] = useState(9);
  const [openings, setOpenings] = useState([
    { name: "Main Door", widthFt: 4, heightFt: 7, quantity: 1 },
    { name: "Room Doors", widthFt: 3.5, heightFt: 7, quantity: 4 },
    { name: "Standard Windows", widthFt: 5, heightFt: 4, quantity: 6 }
  ]);

  // Labour state
  const [labourTeam, setLabourTeam] = useState({
    mistriCount: 3,
    labourCount: 5,
    steelFixerCount: 2,
    carpenterCount: 2
  });
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(6);

  // Price Scenario state
  const [steelAdj, setSteelAdj] = useState(10);
  const [cementAdj, setCementAdj] = useState(5);
  const [labourAdj, setLabourAdj] = useState(8);
  const [bricksAdj, setBricksAdj] = useState(0);

  // COMPUTED RESULTS
  const greyEstimate = calculateGreyStructureEstimate({
    coveredAreaSqft,
    numberOfFloors,
    plotAreaMarla
  });

  const finishingEstimate = calculateCompleteFinishing({
    coveredAreaSqft,
    numberOfFloors,
    quality: qualityLevel
  });

  const fullEstimate = calculateFullHouseEstimate({
    plotAreaMarla,
    coveredAreaSqft,
    numberOfFloors,
    hasBasement,
    quality: qualityLevel
  });

  const columnResult = calculateColumns(columnTypes);
  const slabResult = calculateRoofSlab([
    { lengthFt: slabLengthFt, widthFt: slabWidthFt, thicknessInches: slabThicknessInches }
  ]);
  const brickworkResult = calculateBrickMasonry({
    wallLengthFt,
    wallHeightFt,
    wallThicknessInches,
    openings
  });
  const durationResult = estimateConstructionDuration(coveredAreaSqft, labourTeam, DEFAULT_PRODUCTIVITY, workingDaysPerWeek);
  const scenarioResults = compareWorkforceScenarios(coveredAreaSqft);

  // What-If calculation
  const baseTotal = fullEstimate.summary.totalProjectEstimate;
  const whatIfDelta =
    (fullEstimate.greyStructure.materials.steel.totalCost * steelAdj) / 100 +
    (fullEstimate.greyStructure.materials.cement.totalCost * cementAdj) / 100 +
    (fullEstimate.summary.labourCost * labourAdj) / 100 +
    (fullEstimate.greyStructure.materials.bricks.totalCost * bricksAdj) / 100;
  const whatIfTotal = Math.round(baseTotal + whatIfDelta);

  // Derived metrics for sticky takeoff & 2-column layout
  const activeModeCost =
    activeMode === "grey"
      ? greyEstimate.costs.grandTotal
      : activeMode === "finishing"
      ? finishingEstimate.grandTotal
      : activeMode === "labour"
      ? fullEstimate.summary.labourCost
      : activeMode === "full"
      ? fullEstimate.summary.totalProjectEstimate
      : activeMode === "scenario"
      ? whatIfTotal
      : fullEstimate.summary.totalProjectEstimate;

  const activeModeRate =
    activeMode === "grey"
      ? greyEstimate.costs.costPerSqft
      : activeMode === "finishing"
      ? finishingEstimate.costPerSqft
      : activeMode === "labour"
      ? Math.round(fullEstimate.summary.labourCost / coveredAreaSqft)
      : activeMode === "full"
      ? fullEstimate.summary.costPerSqft
      : activeMode === "scenario"
      ? Math.round(whatIfTotal / coveredAreaSqft)
      : fullEstimate.summary.costPerSqft;

  const totalEstimateCost = fullEstimate.summary.totalProjectEstimate || 1;
  const greyCostPct = Math.round((fullEstimate.summary.greyStructureCost / totalEstimateCost) * 100);
  const finishingCostPct = Math.round((fullEstimate.summary.finishingCost / totalEstimateCost) * 100);
  const labourCostPct = Math.round((fullEstimate.summary.labourCost / totalEstimateCost) * 100);
  const contingencyCostPct = Math.max(0, 100 - greyCostPct - finishingCostPct - labourCostPct);
  const currentCityName = PAKISTANI_CITIES.find((c) => c.id === selectedCityId)?.name || "Islamabad";

  return (
    <div className="space-y-6">
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Advanced Construction Estimation Engine
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Phase 1.1 Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Progressive structural &amp; finishing calculations: Plot → Grey Structure → Finishing → Labour → Budget
          </p>
        </div>

        {/* Global Dimensions Bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="px-3 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Covered Area</span>
            <input
              type="number"
              value={coveredAreaSqft}
              onChange={(e) => setCoveredAreaSqft(Math.max(100, Number(e.target.value)))}
              className="w-16 font-mono font-bold text-slate-900 dark:text-white bg-transparent outline-none text-xs"
            />
            <span className="text-[10px] text-slate-400">sqft</span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="px-3 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Floors</span>
            <select
              value={numberOfFloors}
              onChange={(e) => setNumberOfFloors(Number(e.target.value))}
              className="font-bold text-slate-900 dark:text-white bg-transparent outline-none text-xs"
            >
              <option value={1}>1 Storey</option>
              <option value={2}>2 Storeys</option>
              <option value={3}>3 Storeys</option>
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <div className="px-3 py-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Quality</span>
            <select
              value={qualityLevel}
              onChange={(e) => setQualityLevel(e.target.value as any)}
              className="font-bold text-slate-900 dark:text-white bg-transparent outline-none text-xs capitalize"
            >
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>{showAssumptions ? "Hide Assumptions" : "Assumptions Panel"}</span>
        </button>
      </div>

      {/* SECTION 92: CALCULATION ASSUMPTIONS PANEL */}
      {showAssumptions && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Calculation Assumptions Panel (Section 92)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Pakistan Building Code (PBC) Standards
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Brick Size</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">9" × 4.5" × 3"</span>
              <span className="text-[10px] text-slate-500">13.5 bricks / cuft</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Concrete Ratio</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">1:2:4 (M15 Mix)</span>
              <span className="text-[10px] text-slate-500">Dry Factor: 1.54</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mortar Ratio</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">1:4 Load / 1:6 Part.</span>
              <span className="text-[10px] text-slate-500">Dry Factor: 1.33</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Plaster Depth</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">0.5" In / 0.75" Out</span>
              <span className="text-[10px] text-slate-500">Ratio 1:4 Cement:Sand</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Wastage Rules</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">Cement 3% • Sand 5%</span>
              <span className="text-[10px] text-slate-500">Crush 5% • Steel 4%</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Labour Output</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">100 sqft/day</span>
              <span className="text-[10px] text-slate-500">Mason + 2 Helpers</span>
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN RESPONSIVE LAYOUT (Left 7 cols: Inputs & Modes, Right 5 cols: Sticky Live Takeoff) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT 7 COLS: Primary Modes & Parameter Inputs */}
        <div className="lg:col-span-7 space-y-4">
          {/* 6 PRIMARY ESTIMATION MODES (Sections 1, 34, 68) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => setActiveMode("grey")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "grey"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs">Grey Structure</span>
        </button>

        <button
          onClick={() => setActiveMode("finishing")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "finishing"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span className="text-xs">Finishing</span>
        </button>

        <button
          onClick={() => setActiveMode("labour")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "labour"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs">Labour &amp; Time</span>
        </button>

        <button
          onClick={() => setActiveMode("full")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "full"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs">Full House</span>
        </button>

        <button
          onClick={() => setActiveMode("scenario")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "scenario"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs">Price Scenarios</span>
        </button>

        <button
          onClick={() => setActiveMode("rates")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
            activeMode === "rates"
              ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
          }`}
        >
          <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <span className="text-xs">Material Rates</span>
        </button>
      </div>

      {/* MODE 1: GREY STRUCTURE CALCULATOR (Sections 2–11) */}
      {activeMode === "grey" && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Structural Elements */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setGreySubTab("summary")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                greySubTab === "summary"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Whole Grey Summary
            </button>
            <button
              onClick={() => setGreySubTab("columns")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                greySubTab === "columns"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Columns (Multi-Type)
            </button>
            <button
              onClick={() => setGreySubTab("slab")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                greySubTab === "slab"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Roof Slab / RCC
            </button>
            <button
              onClick={() => setGreySubTab("brickwork")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                greySubTab === "brickwork"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Brickwork &amp; Deductions
            </button>
            <button
              onClick={() => setGreySubTab("foundation")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                greySubTab === "foundation"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Foundation &amp; PCC
            </button>
          </div>

          {/* Subtab A: Complete Grey Structure Summary */}
          {greySubTab === "summary" && (
            <div className="space-y-5">
              {/* Grand Total Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-200 block">
                      Estimated Grey Structure Shell Cost
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono mt-1">
                      Rs. {formatNumber(greyEstimate.costs.grandTotal)}
                    </div>
                    <div className="text-xs text-emerald-100 mt-1 flex items-center gap-3">
                      <span>Rate: <strong>Rs. {greyEstimate.costs.costPerSqft}</strong> / sqft</span>
                      <span>•</span>
                      <span>Total Concrete: <strong>{greyEstimate.totalConcreteVolumeCft} CFT</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/calculator/house-estimate"
                      className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Custom Height Controls</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Section 3: Itemized Material Quantities with Wastage */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-emerald-600" />
                    <span>Itemized Structural Materials (Required vs Wastage vs Final)</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">Excludes Finishing Items</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                        <th className="py-3 px-4">Material</th>
                        <th className="py-3 px-4 text-right">Required</th>
                        <th className="py-3 px-4 text-center">Wastage %</th>
                        <th className="py-3 px-4 text-right">Final Quantity</th>
                        <th className="py-3 px-4 text-right">Unit Rate</th>
                        <th className="py-3 px-4 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {Object.values(greyEstimate.materials).map((mat) => (
                        <tr key={mat.materialId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            {mat.name}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">
                            {formatNumber(mat.requiredQuantity)} {mat.unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                              +{mat.wastagePercent}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatNumber(mat.finalQuantity)} {mat.unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">
                            Rs. {mat.unitRate}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Rs. {formatNumber(mat.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Element Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Foundation &amp; PCC</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Rs. {formatNumber(greyEstimate.elementsBreakdown.foundationCost)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Columns &amp; Beams</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Rs. {formatNumber(greyEstimate.elementsBreakdown.columnsCost + greyEstimate.elementsBreakdown.beamsAndLintelsCost)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Roof Slabs</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Rs. {formatNumber(greyEstimate.elementsBreakdown.roofSlabsCost)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Brick Masonry</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1">
                    Rs. {formatNumber(greyEstimate.elementsBreakdown.brickMasonryCost)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab B: Section 5: Columns Calculator */}
          {greySubTab === "columns" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Multi-Type RCC Column Sizing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculate concrete and steel rebar requirements across varied column sections
                  </p>
                </div>
                <button
                  onClick={() =>
                    setColumnTypes([
                      ...columnTypes,
                      { name: `Column Type ${String.fromCharCode(65 + columnTypes.length)}`, lengthInches: 12, widthInches: 12, heightFt: 10.5, quantity: 4 }
                    ])
                  }
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column Type</span>
                </button>
              </div>

              <div className="space-y-3">
                {columnTypes.map((col, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-5 gap-3 items-center text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Name</label>
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => {
                          const updated = [...columnTypes];
                          updated[idx].name = e.target.value;
                          setColumnTypes(updated);
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Length x Width (in)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={col.lengthInches}
                          onChange={(e) => {
                            const updated = [...columnTypes];
                            updated[idx].lengthInches = Number(e.target.value);
                            setColumnTypes(updated);
                          }}
                          className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono text-center"
                        />
                        <span>x</span>
                        <input
                          type="number"
                          value={col.widthInches}
                          onChange={(e) => {
                            const updated = [...columnTypes];
                            updated[idx].widthInches = Number(e.target.value);
                            setColumnTypes(updated);
                          }}
                          className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Height (ft)</label>
                      <input
                        type="number"
                        value={col.heightFt}
                        onChange={(e) => {
                          const updated = [...columnTypes];
                          updated[idx].heightFt = Number(e.target.value);
                          setColumnTypes(updated);
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Quantity</label>
                      <input
                        type="number"
                        value={col.quantity}
                        onChange={(e) => {
                          const updated = [...columnTypes];
                          updated[idx].quantity = Number(e.target.value);
                          setColumnTypes(updated);
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 font-mono text-center font-bold"
                      />
                    </div>
                    <div className="flex justify-end">
                      {columnTypes.length > 1 && (
                        <button
                          onClick={() => setColumnTypes(columnTypes.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column Total Result */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Concrete</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{columnResult.totalVolumeCft} CFT</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cement Bags</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">{columnResult.totalCementBags} Bags</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Sand &amp; Crush</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{columnResult.totalSandCft} / {columnResult.totalCrushCft} CFT</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Steel Rebar</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">{columnResult.totalSteelKg} kg ({columnResult.totalSteelTons} Tons)</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                {columnResult.disclaimer}
              </p>
            </div>
          )}

          {/* Subtab C: Section 8: Roof Slab Calculator */}
          {greySubTab === "slab" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Roof Slab RCC Concrete &amp; Rebar Calculator
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Length (ft)</label>
                  <input
                    type="number"
                    value={slabLengthFt}
                    onChange={(e) => setSlabLengthFt(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Width (ft)</label>
                  <input
                    type="number"
                    value={slabWidthFt}
                    onChange={(e) => setSlabWidthFt(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Thickness (inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={slabThicknessInches}
                    onChange={(e) => setSlabThicknessInches(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Slab Area</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{slabResult.totalAreaSqft} sqft</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Concrete Vol</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{slabResult.totalVolumeCft} CFT</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Cement Required</span>
                  <span className="font-mono font-bold text-emerald-600">{slabResult.breakdown.cementBags} Bags</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Steel (Grade 60)</span>
                  <span className="font-mono font-bold text-emerald-600">{slabResult.breakdown.steelKg} kg</span>
                </div>
              </div>
            </div>
          )}

          {/* Subtab D: Section 9: Brick Masonry & Openings */}
          {greySubTab === "brickwork" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Brick Masonry with Door &amp; Window Opening Deductions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Total Wall Length (ft)</label>
                  <input
                    type="number"
                    value={wallLengthFt}
                    onChange={(e) => setWallLengthFt(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Wall Height (ft)</label>
                  <input
                    type="number"
                    value={wallHeightFt}
                    onChange={(e) => setWallHeightFt(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Wall Thickness</label>
                  <select
                    value={wallThicknessInches}
                    onChange={(e) => setWallThicknessInches(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value={9}>9-inch Main Load-Bearing Wall</option>
                    <option value={4.5}>4.5-inch Internal Partition Wall</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Gross Volume</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{brickworkResult.grossVolumeCft} CFT</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Opening Deduction</span>
                  <span className="font-mono font-bold text-rose-600">-{brickworkResult.openingDeductionAreaSqft} sqft</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Final Bricks (+5% Wastage)</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {formatNumber(brickworkResult.finalBricks)} Bricks
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Mortar Cement</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {brickworkResult.cementBags} Bags
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Subtab E: Section 10: Foundation & PCC */}
          {greySubTab === "foundation" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Substructure, Footing &amp; Excavation Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Calibrated for Isolated and Strip Footings with 1:4:8 Lean PCC bed and 1:2:4 RCC Footing pad
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Excavation Volume</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">~2,400 CFT</span>
                  <span className="text-[10px] text-slate-500">Includes trench offsets</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PCC Lean Bed (1:4:8)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">350 CFT</span>
                  <span className="text-[10px] text-slate-500">3-inch base layer</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">RCC Footings Pad</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">780 CFT</span>
                  <span className="text-[10px] text-slate-500">Grade 60 steel mesh</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Backfilling Volume</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">~1,270 CFT</span>
                  <span className="text-[10px] text-slate-500">Compacted earth/sand</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FINISHING ESTIMATOR (Sections 12–17) */}
      {activeMode === "finishing" && (
        <div className="space-y-6">
          {/* Grand Finishing Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-teal-200 block">
                  Complete Turnkey Finishing Cost ({qualityLevel.toUpperCase()} GRADE)
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono mt-1">
                  Rs. {formatNumber(finishingEstimate.grandTotal)}
                </div>
                <div className="text-xs text-teal-100 mt-1 flex items-center gap-3">
                  <span>Rate: <strong>Rs. {finishingEstimate.costPerSqft}</strong> / sqft</span>
                  <span>•</span>
                  <span>Materials: <strong>Rs. {formatNumber(finishingEstimate.totalMaterialCost)}</strong></span>
                  <span>•</span>
                  <span>Labour: <strong>Rs. {formatNumber(finishingEstimate.totalLabourCost)}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
                  17 Finishing Categories
                </span>
              </div>
            </div>
          </div>

          {/* 17 Categories Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed 17-Category Finishing Works Schedule
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Trade / Category</th>
                    <th className="py-3 px-4">Specifications</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Material Cost</th>
                    <th className="py-3 px-4 text-right">Labour Cost</th>
                    <th className="py-3 px-4 text-right">Category Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {Object.values(finishingEstimate.categories).map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {cat.details}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatNumber(cat.quantity)} {cat.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        Rs. {formatNumber(cat.materialCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        Rs. {formatNumber(cat.labourCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-700 dark:text-teal-400">
                        Rs. {formatNumber(cat.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: LABOUR & TIME ESTIMATOR (Sections 19–31) */}
      {activeMode === "labour" && (
        <div className="space-y-6">
          {/* Duration Forecast Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-200 block">
                  Estimated Construction Timeline
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono mt-1">
                  ~{durationResult.estimatedWorkingDays} Working Days
                </div>
                <div className="text-xs text-cyan-100 mt-1 flex items-center gap-3">
                  <span>Calendar Duration: <strong>~{durationResult.estimatedCalendarDays} Days</strong></span>
                  <span>•</span>
                  <span>Estimated Completion: <strong>{durationResult.estimatedCompletionDate}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-cyan-200 block uppercase font-bold">Total Labour Budget</span>
                <span className="text-2xl font-black font-mono">Rs. {formatNumber(durationResult.totalLabourCost)}</span>
              </div>
            </div>
          </div>

          {/* Custom Workforce Configurator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Custom Site Workforce Sizing</span>
              </h3>
              <span className="text-xs text-slate-500">Configured team directly controls completion timeline</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Head Masons (Mistris)</span>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={labourTeam.mistriCount}
                    onChange={(e) => setLabourTeam({ ...labourTeam, mistriCount: Math.max(1, Number(e.target.value)) })}
                    className="w-16 font-bold font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center"
                  />
                  <span className="text-[10px] text-slate-500">@ Rs. 2,600/day</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Labourers (Mazdoors)</span>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={labourTeam.labourCount}
                    onChange={(e) => setLabourTeam({ ...labourTeam, labourCount: Math.max(1, Number(e.target.value)) })}
                    className="w-16 font-bold font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center"
                  />
                  <span className="text-[10px] text-slate-500">@ Rs. 1,600/day</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Steel Fixers</span>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={labourTeam.steelFixerCount}
                    onChange={(e) => setLabourTeam({ ...labourTeam, steelFixerCount: Number(e.target.value) })}
                    className="w-16 font-bold font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center"
                  />
                  <span className="text-[10px] text-slate-500">@ Rs. 2,700/day</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Carpenters</span>
                <div className="flex items-center justify-between mt-1">
                  <input
                    type="number"
                    value={labourTeam.carpenterCount}
                    onChange={(e) => setLabourTeam({ ...labourTeam, carpenterCount: Number(e.target.value) })}
                    className="w-16 font-bold font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center"
                  />
                  <span className="text-[10px] text-slate-500">@ Rs. 2,600/day</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              {durationResult.disclaimer}
            </p>
          </div>

          {/* Workforce Scenario Comparison (Section 26) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Workforce Optimization Scenarios (Time vs Cost Trade-off)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {scenarioResults.scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className={`p-4 rounded-2xl border text-xs relative ${
                    sc.isRecommended
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                  }`}
                >
                  {sc.isRecommended && (
                    <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{sc.name}</h4>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Duration:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">~{sc.estimatedDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Labour Burn:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">Rs. {formatNumber(sc.dailyCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Labour Cost:</span>
                      <span className="font-mono font-bold text-emerald-600">Rs. {formatNumber(sc.totalCost)}</span>
                    </div>
                    {sc.timeSavedDays > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Time Saved:</span>
                        <span>{sc.timeSavedDays} Days faster</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: FULL PROGRESSIVE HOUSE ESTIMATE (Section 18 & 46–58) */}
      {activeMode === "full" && (
        <div className="space-y-6">
          {/* Executive Master Cost Card */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">
                  Total Project Cost (Grey + Finishing + Labour + Contingency)
                </span>
                <div className="text-3xl sm:text-5xl font-black font-mono text-white mt-1">
                  Rs. {formatNumber(fullEstimate.summary.totalProjectEstimate)}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Covered: <strong>{fullEstimate.coveredAreaSqft} sqft</strong></span>
                  <span>•</span>
                  <span>Average: <strong className="text-emerald-400">Rs. {fullEstimate.summary.costPerSqft} / sqft</strong></span>
                  <span>•</span>
                  <span>Plot: <strong>Rs. {formatNumber(fullEstimate.summary.costPerMarla)} / Marla</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/boq"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <span>Export Schedule of Rates BOQ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Percentage Progress Split Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Grey Shell ({fullEstimate.percentages.greyStructurePercent}%)</span>
                <span>Finishing ({fullEstimate.percentages.finishingPercent}%)</span>
                <span>Labour ({fullEstimate.percentages.labourPercent}%)</span>
                <span>Other &amp; Contingency ({fullEstimate.percentages.otherAndContingencyPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${fullEstimate.percentages.greyStructurePercent}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${fullEstimate.percentages.finishingPercent}%` }} className="bg-teal-400 h-full" />
                <div style={{ width: `${fullEstimate.percentages.labourPercent}%` }} className="bg-cyan-500 h-full" />
                <div style={{ width: `${fullEstimate.percentages.otherAndContingencyPercent}%` }} className="bg-amber-400 h-full" />
              </div>
            </div>
          </div>

          {/* Floor-by-Floor Breakdown Table (Section 58) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Floor-by-Floor Construction Cost Distribution
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Floor Level</th>
                    <th className="py-3 px-4 text-right">Covered Area</th>
                    <th className="py-3 px-4 text-right">Grey Structure</th>
                    <th className="py-3 px-4 text-right">Finishing</th>
                    <th className="py-3 px-4 text-right">Floor Grand Total</th>
                    <th className="py-3 px-4 text-right">Rate / sqft</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {fullEstimate.floorBreakdown.map((floor) => (
                    <tr key={floor.floorNumber} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{floor.name}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">{floor.coveredAreaSqft} sqft</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">Rs. {formatNumber(floor.greyCost)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">Rs. {formatNumber(floor.finishingCost)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">Rs. {formatNumber(floor.totalCost)}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">Rs. {floor.costPerSqft}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progressive Project Lifecycle Flow (Prompt Header) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Progressive Construction Project Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {fullEstimate.progressiveLifecycle.map((stage, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
                    {stage.stage}
                  </span>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{stage.description}</div>
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white pt-1">
                    Rs. {formatNumber(stage.cost)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: WHAT-IF PRICE SCENARIO SIMULATOR (Section 51) */}
      {activeMode === "scenario" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>What-If Price Sensitivity Simulator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Simulate inflation or deflation in critical construction commodities across Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Steel Rebar Price Delta:</span>
                <span className={steelAdj >= 0 ? "text-rose-600 font-mono" : "text-emerald-600 font-mono"}>
                  {steelAdj >= 0 ? `+${steelAdj}%` : `${steelAdj}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                value={steelAdj}
                onChange={(e) => setSteelAdj(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Cement Bag Price Delta:</span>
                <span className={cementAdj >= 0 ? "text-rose-600 font-mono" : "text-emerald-600 font-mono"}>
                  {cementAdj >= 0 ? `+${cementAdj}%` : `${cementAdj}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                value={cementAdj}
                onChange={(e) => setCementAdj(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Labour Wage Rates Delta:</span>
                <span className={labourAdj >= 0 ? "text-rose-600 font-mono" : "text-emerald-600 font-mono"}>
                  {labourAdj >= 0 ? `+${labourAdj}%` : `${labourAdj}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                value={labourAdj}
                onChange={(e) => setLabourAdj(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Red Clay Bricks Delta:</span>
                <span className={bricksAdj >= 0 ? "text-rose-600 font-mono" : "text-emerald-600 font-mono"}>
                  {bricksAdj >= 0 ? `+${bricksAdj}%` : `${bricksAdj}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                value={bricksAdj}
                onChange={(e) => setBricksAdj(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* Scenario Comparison Pill Card */}
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Original Baseline</span>
              <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                Rs. {formatNumber(baseTotal)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Adjusted Scenario Total</span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                Rs. {formatNumber(whatIfTotal)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Net Budget Variance</span>
              <div className={`text-base font-black font-mono ${whatIfDelta >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {whatIfDelta >= 0 ? `+Rs. ${formatNumber(whatIfDelta)}` : `-Rs. ${formatNumber(Math.abs(whatIfDelta))}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 6: MATERIAL RATES VIEWER */}
      {activeMode === "rates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Verified Civil Material Rates ({PAKISTANI_CITIES.find((c) => c.id === selectedCityId)?.name || "Islamabad"})
            </h3>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
            >
              {PAKISTANI_CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Delivered Rate</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {materialRates.slice(0, 12).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{r.materialName}</td>
                    <td className="py-3 px-4 text-slate-500">{r.unit}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">Rs. {formatNumber(r.deliveredRate)}</td>
                    <td className="py-3 px-4 text-slate-500">{r.sourceName}</td>
                    <td className="py-3 px-4">
                      {isOnline ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {r.status || "Verified"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Offline Cached
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>

        {/* RIGHT 5 COLS: Sticky Live Calculation Results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* 1. Live Takeoff Hero Card */}
            <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Live Takeoff Summary
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                  {activeMode} View
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {activeMode === "full"
                    ? "Turnkey House Estimate"
                    : activeMode === "grey"
                    ? "Grey Structure Shell"
                    : activeMode === "finishing"
                    ? "Finishing Shell Cost"
                    : activeMode === "labour"
                    ? "Labour Cost Estimate"
                    : activeMode === "scenario"
                    ? "Scenario Adjusted Cost"
                    : "Project Total Cost"}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                  Rs. {formatNumber(activeModeCost)}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="font-mono text-emerald-400 font-bold">
                    Rs. {formatNumber(activeModeRate)}/sqft
                  </span>
                  <span>•</span>
                  <span>{coveredAreaSqft.toLocaleString()} sqft ({numberOfFloors} Flr)</span>
                  <span>•</span>
                  <span className="capitalize text-slate-300">{qualityLevel}</span>
                </div>
              </div>

              {/* Stacked Phase Mini-Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1.5">
                  <span>Phase Allocation</span>
                  <span>Turnkey: Rs. {formatNumber(totalEstimateCost)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${greyCostPct}%` }} className="bg-emerald-500 h-full" title={`Grey Structure: ${greyCostPct}%`} />
                  <div style={{ width: `${finishingCostPct}%` }} className="bg-teal-400 h-full" title={`Finishing: ${finishingCostPct}%`} />
                  <div style={{ width: `${labourCostPct}%` }} className="bg-cyan-400 h-full" title={`Labour: ${labourCostPct}%`} />
                  <div style={{ width: `${contingencyCostPct}%` }} className="bg-amber-400 h-full" title={`Contingency: ${contingencyCostPct}%`} />
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2 text-[9px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Grey {greyCostPct}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    <span>Fin {finishingCostPct}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Lab {labourCostPct}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Cont {contingencyCostPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Key Material Quantities Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Key Material Bill (Grey Shell)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{currentCityName}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Cement (OPC/SRC)</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {greyEstimate.materials.cement.finalQuantity.toLocaleString()} bags
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Rs. {formatNumber(greyEstimate.materials.cement.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Steel Rebar (Grade 60)</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {(greyEstimate.materials.steel.finalQuantity / 1000).toFixed(2)} tons
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Rs. {formatNumber(greyEstimate.materials.steel.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Clay Bricks (Awwal)</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {greyEstimate.materials.bricks.finalQuantity.toLocaleString()} pcs
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Rs. {formatNumber(greyEstimate.materials.bricks.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sand (Chenab)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
                      {greyEstimate.materials.sand.finalQuantity.toLocaleString()} CFT
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Crush (Margalla)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">
                      {greyEstimate.materials.crush.finalQuantity.toLocaleString()} CFT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Project Schedule & Execution Speed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Estimated Timeline</span>
                </div>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  ~{(durationResult.estimatedCalendarDays / 30).toFixed(1)} Months
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Based on {workingDaysPerWeek} days/week work schedule with {labourTeam.mistriCount} masons &amp; {labourTeam.labourCount} helpers.
              </p>
            </div>

            {/* 4. Action Buttons */}
            <div className="space-y-2">
              <Link
                href="/reports"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official BOQ / PDF</span>
              </Link>

              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Fast Estimate</span>
              </button>
            </div>

            {/* 5. PBC Disclaimer Card */}
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                All estimates follow Pakistan Building Code standards (PBC-2021). Actual structural drawings from a licensed PEC civil engineer supersede generic estimates.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
