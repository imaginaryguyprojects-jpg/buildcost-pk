"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  Ruler,
  Bath,
  Building,
  Layers,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Info,
  Sliders,
  Maximize2,
  Plus,
  Trash2,
  Check
} from "lucide-react";
import { ProBadge } from "@/components/pro/ProBadge";
import { ProConstructionInputs, ProBathroomItem, ProFoundationType } from "@buildcost/types";
import { BlueprintLayout2D } from "./BlueprintLayout2D";

interface ProConstructionSectionProps {
  inputs: ProConstructionInputs;
  onChange: (inputs: ProConstructionInputs) => void;
  isPro: boolean;
  onProLockClick: (featureTitle: string) => void;
  proMonthlyPrice?: number;
  proAnnualPrice?: number;
  coveredAreaSqft: number;
  floors: number;
  plotWidthFt?: number;
  plotLengthFt?: number;
}

export function ProConstructionSection({
  inputs,
  onChange,
  isPro,
  onProLockClick,
  proMonthlyPrice = 200,
  proAnnualPrice = 799,
  coveredAreaSqft,
  floors,
  plotWidthFt = 30,
  plotLengthFt = 60
}: ProConstructionSectionProps) {
  const [openWallHeight, setOpenWallHeight] = useState(true);
  const [openBathrooms, setOpenBathrooms] = useState(false);
  const [openFoundation, setOpenFoundation] = useState(false);
  const [openColumns, setOpenColumns] = useState(false);
  const [openBeams, setOpenBeams] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(true);

  const handleGatedAction = (featureTitle: string, action: () => void) => {
    if (!isPro) {
      onProLockClick(featureTitle);
      return;
    }
    action();
  };

  const handleWallHeightMode = (mode: "auto" | "manual") => {
    handleGatedAction("Custom Wall Height Calculation", () => {
      onChange({ ...inputs, wallHeightMode: mode });
    });
  };

  const handleWallHeightChange = (val: number) => {
    onChange({ ...inputs, manualWallHeightFt: Math.max(8, Math.min(20, val)) });
  };

  const handleBathroomMode = (mode: "auto" | "manual") => {
    handleGatedAction("Individual Bathroom Dimensions", () => {
      onChange({ ...inputs, bathroomCountMode: mode });
    });
  };

  const handleBathroomCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(12, count));
    const currentList = [...inputs.bathrooms];
    while (currentList.length < safeCount) {
      const idx = currentList.length + 1;
      currentList.push({
        id: "bath_" + Date.now() + "_" + idx,
        name: "Bathroom " + idx,
        lengthFt: 8,
        widthFt: 6,
        heightMode: "auto",
        heightFt: inputs.manualWallHeightFt || 10
      });
    }
    const trimmedList = currentList.slice(0, safeCount);
    onChange({
      ...inputs,
      manualBathroomCount: safeCount,
      bathrooms: trimmedList
    });
  };

  const handleBathroomDimensionChange = (idx: number, field: "lengthFt" | "widthFt", val: number) => {
    const updated = [...inputs.bathrooms];
    if (updated[idx]) {
      updated[idx] = {
        ...updated[idx],
        [field]: Math.max(3, Math.min(25, val))
      };
      if (inputs.applySameBathroomSize) {
        for (let i = 0; i < updated.length; i++) {
          updated[i] = {
            ...updated[i],
            [field]: Math.max(3, Math.min(25, val))
          };
        }
      }
      onChange({ ...inputs, bathrooms: updated });
    }
  };

  const handleApplySameBathroomToggle = () => {
    handleGatedAction("Uniform Bathroom Sizing", () => {
      const next = !inputs.applySameBathroomSize;
      let updated = [...inputs.bathrooms];
      if (next && updated.length > 0) {
        const master = updated[0];
        updated = updated.map((b) => ({
          ...b,
          lengthFt: master.lengthFt,
          widthFt: master.widthFt
        }));
      }
      onChange({
        ...inputs,
        applySameBathroomSize: next,
        bathrooms: updated
      });
    });
  };

  const handleFoundationMode = (mode: "auto" | "manual") => {
    handleGatedAction("Exact Foundation (Bunyad) Modeling", () => {
      onChange({ ...inputs, foundationMode: mode });
    });
  };

  const handleFoundationType = (type: ProFoundationType) => {
    handleGatedAction("Foundation Type Selection", () => {
      onChange({ ...inputs, foundationType: type });
    });
  };

  const handleColumnMode = (mode: "auto" | "manual") => {
    handleGatedAction("Custom RCC Column Modeling", () => {
      onChange({ ...inputs, columnMode: mode });
    });
  };

  const handleBeamMode = (mode: "auto" | "manual") => {
    handleGatedAction("RCC Beam Grid Modeling", () => {
      onChange({ ...inputs, beamMode: mode });
    });
  };

  const effectiveWallHeight = inputs.wallHeightMode === "manual" ? inputs.manualWallHeightFt : 10;
  const effectiveBathCount = inputs.bathroomCountMode === "manual" ? inputs.manualBathroomCount : floors * 2;
  return (
    <div className="w-full bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>PRO — Exact Construction Calculation</span>
            </h2>
            <ProBadge size="md" variant="solid" showIcon />
          </div>
          <p className="text-xs sm:text-sm text-emerald-300/80 font-medium max-w-2xl">
            Eliminate double-counting with exact civil engineering parameters: wall heights, custom bathroom footprints, deep foundations, column grids, and beams.
          </p>
        </div>

        <div className="shrink-0">
          {!isPro ? (
            <button
              onClick={() => onProLockClick("PRO — Exact Construction Calculation")}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all font-bold text-xs"
            >
              <Lock className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-black tracking-wider text-emerald-200">
                  Upgrade to PRO
                </div>
                <div className="text-xs font-black">
                  PKR {proMonthlyPrice}/mo • PKR {proAnnualPrice}/yr
                </div>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PRO Active • Exact Mode Enabled</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-sections */}
      <div className="space-y-4">
        {/* 1. Wall Height */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            onClick={() => setOpenWallHeight(!openWallHeight)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    1. Wall Height & Exact Wall Volume
                  </span>
                  {!isPro && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-amber-400">{effectiveWallHeight} ft</strong> ({inputs.wallHeightMode === "manual" ? "Manual Exact" : "Auto Default"})
                </p>
              </div>
            </div>
            {openWallHeight ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openWallHeight && (
            <div className="p-5 pt-1 border-t border-slate-800/60 space-y-4 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleWallHeightMode("auto")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    inputs.wallHeightMode === "auto"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto Default (10 ft)
                </button>
                <button
                  onClick={() => handleWallHeightMode("manual")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inputs.wallHeightMode === "manual"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {!isPro && <Lock className="w-3 h-3 text-amber-400" />}
                  Manual Exact Height
                </button>
              </div>

              {inputs.wallHeightMode === "manual" && (
                <div className="space-y-3 pt-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Exact Ceiling / Wall Height (Feet):</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {inputs.manualWallHeightFt} ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    step="0.5"
                    disabled={!isPro}
                    value={inputs.manualWallHeightFt}
                    onChange={(e) => handleWallHeightChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>8 ft (Low)</span>
                    <span>10 ft (Standard)</span>
                    <span>11 ft (Grand)</span>
                    <span>14+ ft (High Ceiling)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * Modifying wall height recalculates masonry bricks, cement mortar bags, plaster surface area, labour duration, and wastage allowances with 100% mathematical fidelity.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* 2. Bathrooms */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            onClick={() => setOpenBathrooms(!openBathrooms)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Bath className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    2. Bathrooms & Dedicated 4.5" Partition Walls
                  </span>
                  {!isPro && <Lock className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-cyan-400">{effectiveBathCount} Bathrooms</strong> ({inputs.bathroomCountMode === "manual" ? "Custom Dimensions" : "Auto: 2/floor"})
                </p>
              </div>
            </div>
            {openBathrooms ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openBathrooms && (
            <div className="p-5 pt-1 border-t border-slate-800/60 space-y-4 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBathroomMode("auto")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    inputs.bathroomCountMode === "auto"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto Default (2 per floor)
                </button>
                <button
                  onClick={() => handleBathroomMode("manual")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inputs.bathroomCountMode === "manual"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {!isPro && <Lock className="w-3 h-3 text-cyan-400" />}
                  Manual Bathrooms Count & Dimensions
                </button>
              </div>

              {inputs.bathroomCountMode === "manual" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">Total Bathrooms in Building:</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          disabled={!isPro}
                          onClick={() => handleBathroomCountChange(num)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            inputs.manualBathroomCount === num
                              ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs">
                      <div className="font-semibold text-slate-200">Apply same size to all bathrooms</div>
                      <div className="text-[10px] text-slate-400">Syncs length and width across every bathroom</div>
                    </div>
                    <button
                      onClick={handleApplySameBathroomToggle}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        inputs.applySameBathroomSize ? "bg-cyan-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          inputs.applySameBathroomSize ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {inputs.bathrooms.map((bath, idx) => (
                      <div
                        key={bath.id || idx}
                        className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="font-bold text-slate-300 min-w-[100px]">
                          {bath.name || `Bathroom ${idx + 1}`}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Length:</span>
                            <input
                              type="number"
                              min="3"
                              max="25"
                              disabled={!isPro}
                              value={bath.lengthFt}
                              onChange={(e) =>
                                handleBathroomDimensionChange(idx, "lengthFt", parseFloat(e.target.value) || 3)
                              }
                              className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono text-center"
                            />
                            <span className="text-slate-500">ft</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Width:</span>
                            <input
                              type="number"
                              min="3"
                              max="20"
                              disabled={!isPro}
                              value={bath.widthFt}
                              onChange={(e) =>
                                handleBathroomDimensionChange(idx, "widthFt", parseFloat(e.target.value) || 3)
                              }
                              className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono text-center"
                            />
                            <span className="text-slate-500">ft</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Foundation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            onClick={() => setOpenFoundation(!openFoundation)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    3. Foundation (Bunyad) & Sub-structure
                  </span>
                  {!isPro && <Lock className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Type: <strong className="text-emerald-400 uppercase">{inputs.foundationType}</strong> • Depth: {inputs.foundationDepthFt} ft • Width: {inputs.foundationWidthFt} ft
                </p>
              </div>
            </div>
            {openFoundation ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openFoundation && (
            <div className="p-5 pt-1 border-t border-slate-800/60 space-y-4 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleFoundationMode("auto")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    inputs.foundationMode === "auto"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto Soil Standard (4.0 ft)
                </button>
                <button
                  onClick={() => handleFoundationMode("manual")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inputs.foundationMode === "manual"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {!isPro && <Lock className="w-3 h-3 text-emerald-400" />}
                  Manual Foundation Parameters
                </button>
              </div>

              {inputs.foundationMode === "manual" && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">
                      Foundation Type:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "strip", label: "Strip Trench (Standard)", desc: "Stepped brickwork" },
                        { id: "isolated", label: "Isolated Pad Footings", desc: "RCC column pads" },
                        { id: "raft", label: "Raft / Mat Slab", desc: "Monolithic RCC raft" },
                        { id: "other", label: "Custom Foundation", desc: "Deep foundation" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          disabled={!isPro}
                          onClick={() => handleFoundationType(t.id as ProFoundationType)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            inputs.foundationType === t.id
                              ? "bg-emerald-500/20 border-emerald-500 text-white shadow-xs"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-bold">{t.label}</div>
                          <div className="text-[10px] text-slate-500">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Excavation Depth:</span>
                        <strong className="text-emerald-400 font-mono">{inputs.foundationDepthFt} ft</strong>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="0.5"
                        disabled={!isPro}
                        value={inputs.foundationDepthFt}
                        onChange={(e) =>
                          onChange({ ...inputs, foundationDepthFt: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Trench / Base Width:</span>
                        <strong className="text-emerald-400 font-mono">{inputs.foundationWidthFt} ft</strong>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="8"
                        step="0.5"
                        disabled={!isPro}
                        value={inputs.foundationWidthFt}
                        onChange={(e) =>
                          onChange({ ...inputs, foundationWidthFt: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                      <strong>Structural Disclaimer:</strong> Foundation depth and footing dimensions are estimates for accurate civil cost calculations. A licensed geotechnical & structural engineer must inspect actual site soil bearing capacity before casting.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* 4. RCC Columns */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            onClick={() => setOpenColumns(!openColumns)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    4. RCC Columns (Count & Cross-section)
                  </span>
                  {!isPro && <Lock className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-blue-400">{inputs.columnMode === "manual" ? inputs.manualColumnCount : "Auto Grid"} Columns</strong> • Cross-section: {inputs.columnWidthFt * 12}"×{inputs.columnDepthFt * 12}"
                </p>
              </div>
            </div>
            {openColumns ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openColumns && (
            <div className="p-5 pt-1 border-t border-slate-800/60 space-y-4 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleColumnMode("auto")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    inputs.columnMode === "auto"
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto Engineering Grid
                </button>
                <button
                  onClick={() => handleColumnMode("manual")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inputs.columnMode === "manual"
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {!isPro && <Lock className="w-3 h-3 text-blue-400" />}
                  Manual Columns Specification
                </button>
              </div>

              {inputs.columnMode === "manual" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Total Column Count:</span>
                    <input
                      type="number"
                      min="4"
                      max="60"
                      disabled={!isPro}
                      value={inputs.manualColumnCount}
                      onChange={(e) =>
                        onChange({ ...inputs, manualColumnCount: parseInt(e.target.value) || 8 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Width (Inches):</span>
                    <input
                      type="number"
                      min="6"
                      max="24"
                      disabled={!isPro}
                      value={Math.round(inputs.columnWidthFt * 12)}
                      onChange={(e) =>
                        onChange({ ...inputs, columnWidthFt: (parseFloat(e.target.value) || 9) / 12 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Depth (Inches):</span>
                    <input
                      type="number"
                      min="6"
                      max="36"
                      disabled={!isPro}
                      value={Math.round(inputs.columnDepthFt * 12)}
                      onChange={(e) =>
                        onChange({ ...inputs, columnDepthFt: (parseFloat(e.target.value) || 12) / 12 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. RCC Beams */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            onClick={() => setOpenBeams(!openBeams)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    5. RCC Beams (Plinth, Tie & Lintel Spans)
                  </span>
                  {!isPro && <Lock className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Current: <strong className="text-purple-400">{inputs.beamLengthMode === "manual" ? inputs.manualBeamTotalLengthFt : "Auto Frame"} ft</strong> • Size: {inputs.beamWidthFt * 12}"×{inputs.beamDepthFt * 12}"
                </p>
              </div>
            </div>
            {openBeams ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {openBeams && (
            <div className="p-5 pt-1 border-t border-slate-800/60 space-y-4 bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBeamMode("auto")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    inputs.beamLengthMode === "auto"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  Auto Framed Length
                </button>
                <button
                  onClick={() => handleBeamMode("manual")}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    inputs.beamLengthMode === "manual"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {!isPro && <Lock className="w-3 h-3 text-purple-400" />}
                  Manual Beams Length & Depth
                </button>
              </div>

              {inputs.beamLengthMode === "manual" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Total Running Length (Ft):</span>
                    <input
                      type="number"
                      min="50"
                      max="2000"
                      disabled={!isPro}
                      value={inputs.manualBeamTotalLengthFt}
                      onChange={(e) =>
                        onChange({ ...inputs, manualBeamTotalLengthFt: parseInt(e.target.value) || 200 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Beam Width (Inches):</span>
                    <input
                      type="number"
                      min="6"
                      max="18"
                      disabled={!isPro}
                      value={Math.round(inputs.beamWidthFt * 12)}
                      onChange={(e) =>
                        onChange({ ...inputs, beamWidthFt: (parseFloat(e.target.value) || 9) / 12 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Beam Depth (Inches):</span>
                    <input
                      type="number"
                      min="9"
                      max="36"
                      disabled={!isPro}
                      value={Math.round(inputs.beamDepthFt * 12)}
                      onChange={(e) =>
                        onChange({ ...inputs, beamDepthFt: (parseFloat(e.target.value) || 15) / 12 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Interactive 2D Blueprint Diagram */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2D Structural Blueprint Diagram
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              Interactive CAD View
            </span>
          </div>

          <button
            onClick={() => setShowBlueprint(!showBlueprint)}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            {showBlueprint ? "Hide Blueprint" : "Show Blueprint"}
            {showBlueprint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showBlueprint && (
          <div className="relative rounded-3xl overflow-hidden border border-slate-800">
            <BlueprintLayout2D
              plotWidthFt={plotWidthFt}
              plotLengthFt={plotLengthFt}
              coveredAreaSqft={coveredAreaSqft}
              floors={floors}
              columnCount={inputs.columnMode === "manual" ? inputs.manualColumnCount : Math.max(8, Math.round((coveredAreaSqft / floors) / 160) * floors)}
              columnWidthInches={Math.round(inputs.columnWidthFt * 12)}
              columnDepthInches={Math.round(inputs.columnDepthFt * 12)}
              beamLengthFt={inputs.beamLengthMode === "manual" ? inputs.manualBeamTotalLengthFt : Math.round(Math.sqrt(coveredAreaSqft / floors) * 4 * 1.4 * floors)}
              bathrooms={inputs.bathrooms}
              wallHeightFt={effectiveWallHeight}
              foundationType={inputs.foundationType}
              isPro={isPro}
              onLockClick={() => onProLockClick("2D Architectural Blueprint Layout")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
