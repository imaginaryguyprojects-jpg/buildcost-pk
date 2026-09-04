"use client";

import React, { useState } from "react";
import { FileText, Printer, CheckCircle, Percent, Plus } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";

export default function QuotationsPage() {
  const { getActiveProject } = useProjectStore();
  const project = getActiveProject();

  const [markupPercent, setMarkupPercent] = useState<number>(10);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [clientName, setClientName] = useState<string>(project?.clientName || "Dr. Tariq Mehmood");
  const [validDays, setValidDays] = useState<number>(15);

  const baseCost = 14500000;
  const markupAmount = Math.round(baseCost * (markupPercent / 100));
  const taxAmount = Math.round((baseCost + markupAmount) * (taxPercent / 100));
  const quotationTotal = baseCost + markupAmount + taxAmount;

  const milestones = [
    { name: "Advance on Signing Agreement", pct: 15, amount: Math.round(quotationTotal * 0.15) },
    { name: "Foundation & Plinth Level Completion", pct: 20, amount: Math.round(quotationTotal * 0.20) },
    { name: "Ground Floor Roof Slab Pouring", pct: 25, amount: Math.round(quotationTotal * 0.25) },
    { name: "First Floor Slab & Masonry Completion", pct: 20, amount: Math.round(quotationTotal * 0.20) },
    { name: "Internal Plaster & Plumbing Rough-in", pct: 10, amount: Math.round(quotationTotal * 0.10) },
    { name: "Final Handover & Snagging Clearance", pct: 10, amount: Math.round(quotationTotal * 0.10) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Quotation Studio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official commercial proposal for {project?.projectName || "Construction Project"}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Print Quotation</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        {/* Letterhead */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-800 pb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              BuildCost Connect Official Quote
            </span>
            <h2 className="text-xl font-extrabold text-white">Commercial Construction Proposal</h2>
            <span className="text-xs text-slate-400 font-mono">Ref: BC-PK-2026-0904</span>
          </div>

          <div className="text-xs text-slate-400 md:text-right space-y-1">
            <div className="text-slate-200 font-semibold">Client: {clientName}</div>
            <div>Project: {project?.projectName}</div>
            <div>Location: {project?.location}</div>
            <div>Valid for: {validDays} days from date of issue</div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Civil & Material Direct Cost</span>
            <span className="text-lg font-bold text-slate-200">{formatPKR(baseCost)}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Contractor Margin ({markupPercent}%)</span>
            <span className="text-lg font-bold text-emerald-400">+{formatPKR(markupAmount)}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Total Client Proposal</span>
            <span className="text-xl font-extrabold text-white">{formatPKR(quotationTotal)}</span>
          </div>
        </div>

        {/* Milestone Schedule */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Milestone Payment Schedule
          </h3>
          <div className="space-y-2 text-xs">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] border border-emerald-800/40">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 font-medium">{m.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-mono">{m.pct}%</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatPKR(m.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-400 space-y-1.5">
          <div className="font-bold text-slate-300">Terms & Conditions:</div>
          <div>1. Rates quoted are subject to cement and steel market fluctuations exceeding ±5%.</div>
          <div>2. All architectural and structural working drawings must be approved prior to site mobilization.</div>
          <div>3. Water and electricity connections at the construction site are to be provided by the client.</div>
        </div>
      </div>
    </div>
  );
}
