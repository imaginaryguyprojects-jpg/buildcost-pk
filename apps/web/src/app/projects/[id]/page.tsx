"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  Building2,
  Calculator,
  Layers,
  Users,
  FileSpreadsheet,
  Receipt,
  FileText,
  Sliders,
  ArrowLeft,
  Download,
  Percent,
  TrendingUp,
  Plus
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { calculateCompleteHouseEstimate } from "@buildcost/calculations";
import { cn } from "@/lib/utils";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { projects } = useProjectStore();
  const project = projects.find((p) => p.id === resolvedParams.id) || projects[0];

  const [activeTab, setActiveTab] = useState<
    "overview" | "calculator" | "materials" | "labour" | "boq" | "expenses" | "quotations" | "reports"
  >("overview");

  // Dynamic estimate calculation for this specific project
  const estimate = calculateCompleteHouseEstimate({
    plotAreaMarla: project.plotArea / (project.plotUnit === "marla" ? 1 : 225),
    marlaSqft: 225,
    coveredAreaSqft: project.coveredArea,
    numberOfFloors: project.numberOfFloors,
    quality: project.constructionQuality,
    cityId: project.cityId,
    cityName: "Islamabad"
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "calculator", label: "Cost Estimator", icon: Calculator },
    { id: "materials", label: "Materials", icon: Layers },
    { id: "labour", label: "Labour", icon: Users },
    { id: "boq", label: "BOQ", icon: FileSpreadsheet },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "quotations", label: "Quotation", icon: FileText },
    { id: "reports", label: "Reports & PDF", icon: Download }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{project.projectName}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                {project.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {project.location} • {formatNumber(project.coveredArea)} sqft • {project.constructionQuality.toUpperCase()} Spec
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Link>
        </div>
      </div>

      {/* Tabs Bar matching SaaS workbench */}
      <div className="flex items-center gap-1 border-b border-slate-800 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Total Estimated Cost</span>
              <span className="text-2xl font-extrabold text-white block">
                {formatPKR(estimate.grandTotal)}
              </span>
              <span className="text-xs font-semibold text-emerald-400 mt-1 block">
                ≈ {formatLakhCrore(estimate.grandTotal)}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Rate per Sq Ft</span>
              <span className="text-2xl font-extrabold text-emerald-400 block">
                Rs. {formatNumber(estimate.costPerSqft)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Based on {formatNumber(project.coveredArea)} sqft
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Materials Allocation</span>
              <span className="text-2xl font-extrabold text-slate-100 block">
                {formatLakhCrore(estimate.materialsCost)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                ~{Math.round((estimate.materialsCost / estimate.grandTotal) * 100)}% of project value
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs text-slate-400 block mb-1">Labour Allocation</span>
              <span className="text-2xl font-extrabold text-slate-100 block">
                {formatLakhCrore(estimate.labourCost)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                ~{Math.round((estimate.labourCost / estimate.grandTotal) * 100)}% of project value
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-100 mb-4">Project Parameters & Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Plot Size</span>
                <span className="font-semibold text-slate-200">
                  {project.plotArea} {project.plotUnit.toUpperCase()}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Floors</span>
                <span className="font-semibold text-slate-200">
                  G+{project.numberOfFloors - 1} ({project.numberOfFloors} Floors)
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Quality Tier</span>
                <span className="font-semibold text-emerald-400 uppercase">
                  {project.constructionQuality}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-0.5">Assigned City</span>
                <span className="font-semibold text-slate-200">Islamabad (Federal)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cost Estimator */}
      {activeTab === "calculator" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Civil & Structural Bill of Materials</h2>
              <p className="text-xs text-slate-400">
                Calculated material consumption rates for {formatNumber(project.coveredArea)} sqft covered area
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5">Material</th>
                  <th className="py-2.5 text-right">Estimated Quantity</th>
                  <th className="py-2.5 text-right">Unit Rate</th>
                  <th className="py-2.5 text-right">Total Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {estimate.materials.map((m) => (
                  <tr key={m.materialId} className="hover:bg-slate-800/40">
                    <td className="py-3 font-medium text-slate-200">{m.materialName}</td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      {formatNumber(m.finalQuantity)} {m.unit}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      Rs. {formatNumber(m.unitRate)}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400 font-mono">
                      {formatPKR(m.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Materials with Custom Override */}
      {activeTab === "materials" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Project-Specific Material Rates</h2>
              <p className="text-xs text-slate-400">
                Override general market rates with your contracted supplier prices for this project
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estimate.materials.map((m) => (
              <div key={m.materialId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{m.materialName}</h4>
                  <span className="text-[11px] text-slate-400">
                    Baseline Market: Rs. {formatNumber(m.unitRate)} / {m.unit}
                  </span>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                  Override Rate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Labour */}
      {activeTab === "labour" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-100">Labour Work Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5">Trade / Discipline</th>
                  <th className="py-2.5 text-right">Scope</th>
                  <th className="py-2.5 text-right">Contract Rate</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {estimate.labour.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 font-medium text-slate-200">{l.role}</td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      {formatNumber(l.quantity)} {l.unit}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      Rs. {formatNumber(l.rate)}/{l.unit}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400 font-mono">
                      {formatPKR(l.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: BOQ */}
      {activeTab === "boq" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Bill of Quantities (BOQ)</h2>
              <p className="text-xs text-slate-400">Structured line items with quantities, rates, and totals</p>
            </div>
            <Link
              href="/boq"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Open Full BOQ Studio
            </Link>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>Section 1: Civil Works (Grey Structure)</span>
              <span>{formatPKR(estimate.materialsCost + estimate.labourCost * 0.7)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>Section 2: Finishing & Architectural Works</span>
              <span>{formatPKR(estimate.finishingCost + estimate.labourCost * 0.3)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-400 pt-2 text-sm">
              <span>Grand Total BOQ Value</span>
              <span>{formatPKR(estimate.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Expenses */}
      {activeTab === "expenses" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Site Expense Ledger</h2>
              <p className="text-xs text-slate-400">Log actual site spending against budgeted allocations</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
          </div>

          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
            No expenses recorded yet. Click &quot;Log Expense&quot; to begin tracking site expenditures.
          </div>
        </div>
      )}

      {/* Tab 7: Quotations */}
      {activeTab === "quotations" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Client Quotation Generator</h2>
              <p className="text-xs text-slate-400">Create client quotations with contractor markup and payment milestones</p>
            </div>
            <Link
              href="/quotations"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Generate Quotation
            </Link>
          </div>
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
            Draft quotation ready based on active estimate of {formatPKR(estimate.grandTotal)}.
          </div>
        </div>
      )}

      {/* Tab 8: Reports */}
      {activeTab === "reports" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-100">Engineering Estimation Report</h2>
          <p className="text-xs text-slate-400">
            Generate printable PDF reports with official company header, itemized quantities, and civil engineering disclaimers.
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Download className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </Link>
        </div>
      )}
    </div>
  );
}
