"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { formatPKR } from "@/lib/formatters";
import {
  FolderArchive,
  Search,
  FileText,
  Download,
  Share2,
  Calendar,
  Building,
  Filter,
  Eye,
  FileSpreadsheet
} from "lucide-react";
import { ShareModal } from "@/components/sharing/ShareModal";

export default function DocumentCenterPage() {
  const { savedCalculations, projects, shareLinks } = useProjectStore();
  const { showToast } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedDocForShare, setSelectedDocForShare] = useState<any | null>(null);

  // Synthesize documents list from saved calculations and projects
  const documents = savedCalculations.map((c) => {
    const proj = projects.find((p) => p.id === c.projectId);
    return {
      id: c.id,
      title: c.inputs.projectName || proj?.projectName || "Construction Estimate Report",
      type: "estimate",
      project: proj?.projectName || "General",
      date: new Date(c.createdAt).toLocaleDateString("en-PK"),
      amount: c.result.grandTotal,
      rawCalc: c
    };
  });

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || d.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FolderArchive className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Document Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search, preview, and download your formal PDF estimates, BOQs, and quotations.
          </p>
        </div>

        <Link
          href="/reports"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-all"
        >
          <FileText className="w-4 h-4" />
          Generate New PDF Report
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by project or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="estimate">Estimates</option>
            <option value="boq">Bill of Quantities (BOQ)</option>
            <option value="quotation">Quotations</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-xs text-slate-500">
            No matching documents found in your library.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">PDF Report</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{doc.project}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">{doc.title}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">Created: {doc.date}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right sm:pr-4 sm:border-r border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Value</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {formatPKR(doc.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForShare(doc.rawCalc)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Share document"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href="/reports"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedDocForShare && (
        <ShareModal
          isOpen={true}
          onClose={() => setSelectedDocForShare(null)}
          documentType="estimate"
          documentId={selectedDocForShare.id}
          documentTitle={selectedDocForShare.inputs.projectName || "Construction Estimate"}
          documentData={selectedDocForShare.result}
          projectId={selectedDocForShare.projectId}
        />
      )}
    </div>
  );
}
