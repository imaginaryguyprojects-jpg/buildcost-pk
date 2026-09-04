"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { formatPKR, formatLakhCrore } from "@/lib/formatters";
import {
  History,
  Calculator,
  RefreshCw,
  Share2,
  Trash2,
  Copy,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Scale,
  Sparkles,
  ExternalLink,
  Plus
} from "lucide-react";
import { ShareModal } from "@/components/sharing/ShareModal";
import { CalculationSnapshot } from "@buildcost/types";

export default function HistoryPage() {
  const { isAuthenticated, openLoginModal, showToast } = useAuthStore();
  const {
    savedCalculations,
    projects,
    estimateVersions,
    updateCalculationWithLatestRates,
    deleteCalculation,
    duplicateProject
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<"calculations" | "projects" | "versions" | "compare">("calculations");
  const [selectedCalcForShare, setSelectedCalcForShare] = useState<CalculationSnapshot | null>(null);

  // Compare mode selections
  const [compareCalcA, setCompareCalcA] = useState<string>(savedCalculations[0]?.id || "");
  const [compareCalcB, setCompareCalcB] = useState<string>(savedCalculations[1]?.id || savedCalculations[0]?.id || "");

  const handleUpdateRates = (id: string) => {
    const updated = updateCalculationWithLatestRates(id);
    if (updated) {
      showToast("Calculation recomputed with today's market rates! Created a new version.", "success");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this calculation record?")) {
      deleteCalculation(id);
      showToast("Calculation record deleted.", "info");
    }
  };

  const calcA = savedCalculations.find((c) => c.id === compareCalcA);
  const calcB = savedCalculations.find((c) => c.id === compareCalcB);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              My Records & Calculation History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historically frozen estimates, version deltas, and side-by-side comparison.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/calculator/house-estimate"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Calculation
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("calculations")}
          className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === "calculations"
              ? "bg-slate-900 border-t border-x border-slate-800 text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Saved Calculations ({savedCalculations.length})
        </button>

        <button
          onClick={() => setActiveTab("versions")}
          className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === "versions"
              ? "bg-slate-900 border-t border-x border-slate-800 text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Estimate Versions ({estimateVersions.length})
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === "compare"
              ? "bg-slate-900 border-t border-x border-slate-800 text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Compare Estimates
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === "projects"
              ? "bg-slate-900 border-t border-x border-slate-800 text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          My Projects ({projects.length})
        </button>
      </div>

      {/* TAB 1: Saved Calculations */}
      {activeTab === "calculations" && (
        <div className="space-y-4">
          {savedCalculations.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <Calculator className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Your saved calculations will appear here</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Run any civil, concrete, brickwork, or house estimator and click "Save Estimate" to freeze its historical numbers.
              </p>
              <Link
                href="/calculator/house-estimate"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950"
              >
                Start First Calculation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedCalculations.map((c) => {
                const proj = projects.find((p) => p.id === c.projectId);
                return (
                  <div
                    key={c.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                            {c.calculatorType.replace("-", " ")}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                            ID: {c.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1">
                          {c.inputs.projectName || proj?.projectName || "Residential Construction Estimate"}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Saved: {new Date(c.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                          </span>
                          <span>•</span>
                          <span>Covered Area: <strong>{c.result.totalCoveredAreaSqft?.toLocaleString() || 2000} Sq. Ft.</strong></span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right sm:min-w-[170px]">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Historical Total</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">
                          {formatPKR(c.result.grandTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Rs. {c.result.costPerSqft?.toLocaleString() || 0} / sqft
                        </div>
                      </div>
                    </div>

                    {/* Rates frozen preview */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center gap-4">
                      <span className="font-semibold text-slate-300 text-[11px]">Snapshot Rates:</span>
                      {Object.entries(c.ratesSnapshot || {}).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="text-[11px]">
                          {key.replace("mat_", "").toUpperCase()}: <strong className="text-slate-200">Rs. {val.rate}</strong> ({val.source})
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateRates(c.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                          title="Recalculates this formula with today's live rates and creates a new calculation version"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                          Update with Latest Rates
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedCalcForShare(c)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Share
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/reports"
                          className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete calculation record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Estimate Versions (Section 109) */}
      {activeTab === "versions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-200">Historical Preservation Rule:</span> Saved calculations never silently change. Market price fluctuations are recorded as discrete version iterations.
          </div>

          <div className="space-y-3">
            {estimateVersions.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      Version {v.versionNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">{v.versionName}</h4>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Snapshot Date: {new Date(v.rateSnapshotDate).toLocaleDateString("en-PK", { dateStyle: "long" })} • {v.summaryData.totalCoveredAreaSqft} Sq. Ft.
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {v.deltaAmount !== 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Market Delta</span>
                      <span className={`text-xs font-bold font-mono ${v.deltaAmount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {v.deltaAmount > 0 ? `+${formatPKR(v.deltaAmount)}` : formatPKR(v.deltaAmount)} ({v.deltaPercentage > 0 ? `+${v.deltaPercentage}%` : `${v.deltaPercentage}%`})
                      </span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right min-w-[140px]">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Estimate Total</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      {formatPKR(v.summaryData.grandTotal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Compare Estimates (Section 110) */}
      {activeTab === "compare" && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Select Two Estimates to Compare Side-by-Side</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Estimate A</label>
                <select
                  value={compareCalcA}
                  onChange={(e) => setCompareCalcA(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {savedCalculations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.inputs.projectName || c.calculatorType} — {formatPKR(c.result.grandTotal)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Estimate B</label>
                <select
                  value={compareCalcB}
                  onChange={(e) => setCompareCalcB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {savedCalculations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.inputs.projectName || c.calculatorType} — {formatPKR(c.result.grandTotal)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {calcA && calcB ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-800 text-xs font-bold text-slate-400">
                <span>Cost Metric</span>
                <span className="text-right text-emerald-400">Estimate A</span>
                <span className="text-right text-cyan-400">Estimate B</span>
              </div>

              <div className="divide-y divide-slate-800/80 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="font-semibold text-slate-300">Grand Total</span>
                  <span className="text-right font-black font-mono text-emerald-400">{formatPKR(calcA.result.grandTotal)}</span>
                  <span className="text-right font-black font-mono text-cyan-400">{formatPKR(calcB.result.grandTotal)}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="text-slate-400">Cost / Sq. Ft.</span>
                  <span className="text-right font-mono font-bold text-slate-200">Rs. {calcA.result.costPerSqft?.toLocaleString()}</span>
                  <span className="text-right font-mono font-bold text-slate-200">Rs. {calcB.result.costPerSqft?.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="text-slate-400">Grey Materials</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcA.result.materialsCost)}</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcB.result.materialsCost)}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="text-slate-400">Labour Contracts</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcA.result.labourCost)}</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcB.result.labourCost)}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="text-slate-400">Finishes & Sanitary</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcA.result.finishingCost || 0)}</span>
                  <span className="text-right font-mono text-slate-300">{formatPKR(calcB.result.finishingCost || 0)}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <span className="font-bold text-amber-400">Variance / Difference</span>
                  <span className="text-right font-bold text-slate-400">—</span>
                  <span className="text-right font-mono font-black text-amber-400">
                    {formatPKR(Math.abs(calcB.result.grandTotal - calcA.result.grandTotal))} (
                    {(((calcB.result.grandTotal - calcA.result.grandTotal) / calcA.result.grandTotal) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center p-6">Please select two calculations to compare.</div>
          )}
        </div>
      )}

      {/* TAB 4: My Projects (Section 89, 106) */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{p.projectName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{p.location}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Plot</span>
                  <span className="font-bold text-slate-200">{p.plotArea} {p.plotUnit}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Covered</span>
                  <span className="font-bold text-slate-200">{p.coveredArea} sqft</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Budget</span>
                  <span className="font-bold text-emerald-400">{formatLakhCrore(p.totalBudget || 0)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const cloned = duplicateProject(p.id);
                    if (cloned) showToast(`Duplicated as "${cloned.projectName}"`, "success");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate Project
                </button>
                <Link href={`/projects/${p.id}`} className="text-emerald-400 font-bold hover:underline">
                  Open Project →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {selectedCalcForShare && (
        <ShareModal
          isOpen={true}
          onClose={() => setSelectedCalcForShare(null)}
          documentType="calculation"
          documentId={selectedCalcForShare.id}
          documentTitle={selectedCalcForShare.inputs.projectName || "House Construction Calculation"}
          documentData={selectedCalcForShare.result}
          projectId={selectedCalcForShare.projectId}
        />
      )}
    </div>
  );
}
