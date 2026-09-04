"use client";

import React, { useState } from "react";
import { ShieldCheck, Edit3, History, Building, CheckCircle2, Save } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { formatPKR, formatNumber } from "@/lib/formatters";

interface AuditEntry {
  id: string;
  adminName: string;
  materialName: string;
  oldRate: number;
  newRate: number;
  reason: string;
  timestamp: string;
}

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "log_1",
    adminName: "Umer Sheikh (Admin)",
    materialName: "Portland Cement (50kg Bag)",
    oldRate: 1420,
    newRate: 1450,
    reason: "Wholesale factory gate price revision by Bestway & Fauji",
    timestamp: "2026-09-04 14:30 PKT"
  },
  {
    id: "log_2",
    adminName: "Umer Sheikh (Admin)",
    materialName: "Deformed Steel Bar Grade 60",
    oldRate: 265000,
    newRate: 260000,
    reason: "Imported scrap parity decline and rupee stabilization",
    timestamp: "2026-09-03 10:15 PKT"
  }
];

export default function AdminDashboardPage() {
  const { materialRates, updateMaterialRate, selectedCityId, setSelectedCityId } = useProjectStore();
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>("");

  const handleStartEdit = (rateId: string, currentRate: number) => {
    setEditingId(rateId);
    setEditRateValue(currentRate);
    setEditReason("");
  };

  const handleSaveRate = (rateId: string, materialName: string, oldRate: number) => {
    if (!editReason.trim()) {
      alert("An audit reason is required when modifying verified market rates.");
      return;
    }

    updateMaterialRate(rateId, editRateValue, editReason);

    const newLog: AuditEntry = {
      id: `log_${Date.now()}`,
      adminName: "Umer Sheikh (Admin)",
      materialName,
      oldRate,
      newRate: editRateValue,
      reason: editReason,
      timestamp: new Date().toLocaleString("en-PK")
    };

    setAuditLogs([newLog, ...auditLogs]);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Rate & System Studio</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              Role: Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain verified market baselines with mandatory audit logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none"
          >
            {PAKISTANI_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate Editor Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Market Rate Master Editor</span>
          </h2>
          <span className="text-[11px] text-slate-400">All modifications logged in PostgreSQL audit ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Delivered Rate</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {materialRates.map((r) => {
                const isEditing = editingId === r.id;

                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{r.materialName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">/{r.unit}</td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-400">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRateValue}
                          onChange={(e) => setEditRateValue(parseFloat(e.target.value) || 0)}
                          className="w-28 bg-slate-950 border border-emerald-500 rounded-lg p-1.5 text-right text-xs text-white"
                        />
                      ) : (
                        `Rs. ${formatNumber(r.deliveredRate)}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{r.sourceName}</td>
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="text"
                            placeholder="Reason for rate change..."
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 w-44"
                          />
                          <button
                            onClick={() => handleSaveRate(r.id, r.materialName || "Material", r.deliveredRate)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(r.id, r.deliveredRate)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                        >
                          Update Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Administrative Audit Log</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4 text-right">Old Rate</th>
                <th className="py-3 px-4 text-right">New Rate</th>
                <th className="py-3 px-4">Justification / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{log.adminName}</td>
                  <td className="py-3 px-4 text-slate-300">{log.materialName}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    Rs. {formatNumber(log.oldRate)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    Rs. {formatNumber(log.newRate)}
                  </td>
                  <td className="py-3 px-4 text-slate-300 italic">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
