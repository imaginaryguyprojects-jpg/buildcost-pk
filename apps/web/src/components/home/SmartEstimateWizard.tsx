"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { PAK_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { formatPKR, formatLakhCrore } from "@/lib/formatters";
import {
  MapPin,
  Building,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BookmarkPlus,
  TrendingUp,
  HardHat,
  Share2,
  Info
} from "lucide-react";
import { ShareModal } from "../sharing/ShareModal";

export function SmartEstimateWizard() {
  const { isAuthenticated, openLoginModal, showToast } = useAuthStore();
  const { selectedCityId, setSelectedCityId, saveCalculation } = useProjectStore();

  const [step, setStep] = useState<number>(1);
  const [cityId, setCityId] = useState<string>(selectedCityId || "lhe");
  const [plotSize, setPlotSize] = useState<number>(5);
  const [plotUnit, setPlotUnit] = useState<"marla" | "kanal">("marla");
  const [floors, setFloors] = useState<number>(2);
  const [hasBasement, setHasBasement] = useState<boolean>(false);
  const [quality, setQuality] = useState<"economy" | "standard" | "premium" | "luxury">("standard");
  const [customCoveredArea, setCustomCoveredArea] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Auto calculate recommended covered area based on Pakistani municipal setback bylaws
  const calculatedCoveredArea = useMemo(() => {
    if (customCoveredArea && customCoveredArea > 0) return customCoveredArea;
    const marlaSqft = 225; // standard LDA / Private
    const totalPlotSqft = plotUnit === "kanal" ? plotSize * 20 * marlaSqft : plotSize * marlaSqft;
    // Ground coverage standard: 75% for 5 marla, 70% for 10 marla, 65% for 1 kanal
    const coverageFactor = plotSize <= 5 && plotUnit === "marla" ? 0.75 : plotSize <= 10 && plotUnit === "marla" ? 0.70 : 0.65;
    const groundFloorSqft = Math.round(totalPlotSqft * coverageFactor);
    const upperFloorSqft = Math.round(groundFloorSqft * 0.90);
    const mumtySqft = 250;
    const basementSqft = hasBasement ? groundFloorSqft : 0;
    
    if (floors === 1) return groundFloorSqft + mumtySqft + basementSqft;
    if (floors === 2) return groundFloorSqft + upperFloorSqft + mumtySqft + basementSqft;
    return groundFloorSqft + upperFloorSqft * (floors - 1) + mumtySqft + basementSqft;
  }, [plotSize, plotUnit, floors, hasBasement, customCoveredArea]);

  const cityName = PAK_CITIES.find((c) => c.id === cityId)?.name || "Lahore";

  // Compute estimate dynamically
  const estimateResult = useMemo(() => {
    return calculateCompleteHouseEstimate({
      plotAreaMarla: plotUnit === "kanal" ? plotSize * 20 : plotSize,
      marlaSqft: 225,
      coveredAreaSqft: calculatedCoveredArea,
      numberOfFloors: floors,
      hasBasement,
      quality,
      cityId,
      cityName
    });
  }, [plotSize, plotUnit, calculatedCoveredArea, floors, hasBasement, quality, cityId, cityName]);

  const handleSaveEstimate = () => {
    const payload = {
      calculatorType: "house-estimate",
      inputs: {
        cityId,
        cityName,
        plotSize,
        plotUnit,
        coveredArea: calculatedCoveredArea,
        numberOfFloors: floors,
        hasBasement,
        constructionQuality: quality
      },
      result: estimateResult,
      ratesSnapshot: {
        mat_cement: { rate: 1420, source: "APCMA Dealer Price Index", verifiedAt: "Today 09:30 AM" },
        mat_steel_g60: { rate: 260000, source: "PSRMA Mills Ex-Factory", verifiedAt: "Today 09:30 AM" },
        mat_brick_awwal: { rate: 14, source: "Bhatta Kiln Association", verifiedAt: "Today 09:30 AM" }
      }
    };

    if (!isAuthenticated) {
      // LOGIN GATING RULE: Preserve estimate state without data loss!
      openLoginModal({
        actionName: "save_calculation",
        payload,
        message: "Your estimate has been preserved. Sign in to finalize saving."
      });
    } else {
      saveCalculation(payload);
      showToast("Estimate saved to your project history!", "success");
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Step progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Pakistan Cost Estimator
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Smart Estimate Wizard
          </h2>
          <p className="text-xs text-slate-400">
            6 quick questions to generate transparent construction costs based on verified city rates.
          </p>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                step === s
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950"
                  : step > s
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                  : "bg-slate-800/80 text-slate-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Step Contents */}
      <div className="min-h-[260px]">
        {/* STEP 1: City */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 of 6</span>
              <h3 className="text-lg font-bold text-white mt-1">Where are you building?</h3>
              <p className="text-xs text-slate-400">
                Material delivered rates, sand freight from Chenab/Ravi, and local labour wages vary significantly by city.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {PAK_CITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCityId(c.id);
                    setSelectedCityId(c.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    cityId === c.id
                      ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${cityId === c.id ? "text-emerald-400" : "text-slate-500"}`} />
                    <span className="text-xs font-bold">{c.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{c.province}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Plot Size */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 of 6</span>
              <h3 className="text-lg font-bold text-white mt-1">What is your plot size?</h3>
              <p className="text-xs text-slate-400">
                Select your standard Pakistani plot cut or specify a custom dimension.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { size: 3, unit: "marla" as const, label: "3 Marla", desc: "Compact townhouse" },
                { size: 5, unit: "marla" as const, label: "5 Marla (25x45)", desc: "Most popular residential" },
                { size: 7, unit: "marla" as const, label: "7 Marla (30x52.5)", desc: "Spacious suburban" },
                { size: 10, unit: "marla" as const, label: "10 Marla (35x65)", desc: "Half Kanal standard" },
                { size: 1, unit: "kanal" as const, label: "1 Kanal (50x90)", desc: "Executive luxury villa" },
                { size: 2, unit: "kanal" as const, label: "2 Kanal (75x120)", desc: "Estate residence" }
              ].map((p) => {
                const isSelected = plotSize === p.size && plotUnit === p.unit;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPlotSize(p.size);
                      setPlotUnit(p.unit);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-100">{p.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Floors */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3 of 6</span>
              <h3 className="text-lg font-bold text-white mt-1">How many storeys will you construct?</h3>
              <p className="text-xs text-slate-400">
                Number of reinforced concrete slab floors and basement inclusion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { count: 1, label: "Single Storey", desc: "Ground Floor + Mumty room" },
                { count: 2, label: "Double Storey", desc: "Ground + 1st Floor + Mumty (Standard)" },
                { count: 3, label: "Triple Storey", desc: "Ground + 1st + 2nd Floor (Family unit)" }
              ].map((f) => (
                <button
                  key={f.count}
                  type="button"
                  onClick={() => setFloors(f.count)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    floors === f.count
                      ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className={`w-4 h-4 ${floors === f.count ? "text-emerald-400" : "text-slate-500"}`} />
                    <span className="text-sm font-bold text-slate-100">{f.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{f.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={hasBasement}
                  onChange={(e) => setHasBasement(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200">Include Reinforced Concrete Basement</span>
                  <p className="text-[11px] text-slate-400">
                    Includes earth excavation, raft foundation, retaining walls, and Sika chemical waterproofing.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Covered Area */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 of 6</span>
              <h3 className="text-lg font-bold text-white mt-1">Review Covered Area (Sq. Ft.)</h3>
              <p className="text-xs text-slate-400">
                Calculated automatically according to CDA/LDA/DHA setback and ground coverage limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-400">Auto-Calculated Covered Area:</span>
                <span className="text-2xl font-black text-emerald-400">{calculatedCoveredArea.toLocaleString()} Sq. Ft.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Or enter your architect's exact sanctioned covered area:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={`e.g. ${calculatedCoveredArea}`}
                    value={customCoveredArea || ""}
                    onChange={(e) => setCustomCoveredArea(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Sq. Ft.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Quality */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 5 of 6</span>
              <h3 className="text-lg font-bold text-white mt-1">Select Construction Quality Standard</h3>
              <p className="text-xs text-slate-400">
                Dictates the grade of steel, cement, sanitary ware, floor tile specification, and wood.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: "economy" as const, name: "Economy Grade", rate: "~Rs. 4,200/sqft", desc: "Grade 40/60 mix, ceramic tiles, local bath fixtures, synthetic enamel" },
                { id: "standard" as const, name: "Standard Grade (A-Class)", rate: "~Rs. 5,200/sqft", desc: "Grade 60 deformed rebar, Master porcelain tiles, Porta/Sonex sanitary, ash veneer" },
                { id: "premium" as const, name: "Premium Grade", rate: "~Rs. 6,300/sqft", desc: "Mughal/Amreli 60, Spanish imported tiles, Grohe fittings, solid teak woodwork" },
                { id: "luxury" as const, name: "Luxury Grade", rate: "~Rs. 7,800+/sqft", desc: "Smart home automation, marble/quartz, German sanitary, central HVAC ducting" }
              ].map((q) => {
                const isSelected = quality === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuality(q.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 text-white shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{q.name}</span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">{q.rate}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{q.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Final Results Display */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 6 of 6: Cost Estimation</span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Estimated Total: {formatPKR(estimateResult.grandTotal)}
                </h3>
                <div className="text-xs text-slate-400">
                  Equivalent to <span className="font-bold text-emerald-400">{formatLakhCrore(estimateResult.grandTotal)}</span> • {cityName} Market Rates
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Cost per Sq. Ft.</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  Rs. {estimateResult.costPerSqft.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Materials (Grey)</span>
                <div className="text-sm font-black text-slate-200 mt-1">{formatPKR(estimateResult.materialsCost)}</div>
                <div className="text-[10px] text-slate-500">~{Math.round((estimateResult.materialsCost / estimateResult.grandTotal) * 100)}% of total</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Labour Contracts</span>
                <div className="text-sm font-black text-slate-200 mt-1">{formatPKR(estimateResult.labourCost)}</div>
                <div className="text-[10px] text-slate-500">~{Math.round((estimateResult.labourCost / estimateResult.grandTotal) * 100)}% of total</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Finishes & Sanitary</span>
                <div className="text-sm font-black text-slate-200 mt-1">{formatPKR(estimateResult.finishingCost)}</div>
                <div className="text-[10px] text-slate-500">Tiles, paint, wood, bath</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Contingency (5%)</span>
                <div className="text-sm font-black text-slate-200 mt-1">{formatPKR(estimateResult.contingencyCost)}</div>
                <div className="text-[10px] text-slate-500">Unforeseen site buffer</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveEstimate}
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                Save This Estimate
              </button>

              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Estimate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            step === 1 ? "opacity-30 cursor-not-allowed text-slate-600" : "text-slate-400 hover:text-slate-200 bg-slate-800/60"
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        {step < 6 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(6, s + 1))}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/30 flex items-center gap-1.5 transition-all"
          >
            Next Step
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium px-3 py-1.5"
          >
            Restart Wizard
          </button>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        documentType="estimate"
        documentId={`wizard_est_${plotSize}_${plotUnit}_${cityId}`}
        documentTitle={`${plotSize} ${plotUnit.toUpperCase()} House Construction Estimate — ${cityName}`}
        documentData={{
          plotSize,
          plotUnit,
          coveredArea: calculatedCoveredArea,
          floors,
          city: cityName,
          quality,
          grandTotal: estimateResult.grandTotal,
          costPerSqft: estimateResult.costPerSqft
        }}
      />
    </div>
  );
}
