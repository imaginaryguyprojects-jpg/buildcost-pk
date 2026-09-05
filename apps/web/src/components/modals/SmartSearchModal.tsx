"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import {
  Search,
  X,
  Building2,
  ShoppingCart,
  Compass,
  Calculator,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SmartSearchModal() {
  const router = useRouter();
  const {
    smartSearchOpen,
    setSmartSearchOpen,
    projects,
    vendors,
    purchases,
    layouts,
    materialRates
  } = useProjectStore();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSmartSearchOpen(!smartSearchOpen);
      }
      if (e.key === "Escape" && smartSearchOpen) {
        setSmartSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [smartSearchOpen, setSmartSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        projects: projects.slice(0, 3),
        layouts: layouts.slice(0, 3),
        rates: materialRates.slice(0, 4),
        vendors: vendors.slice(0, 3)
      };
    }

    return {
      projects: projects.filter(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.cityId.toLowerCase().includes(q)
      ),
      layouts: layouts.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.plotCategory.toLowerCase().includes(q)
      ),
      rates: materialRates.filter(
        (r) =>
          (r.materialName || "").toLowerCase().includes(q) ||
          (r.brand || "").toLowerCase().includes(q) ||
          (r.categoryKey || "").toLowerCase().includes(q)
      ),
      vendors: vendors.filter(
        (v) =>
          v.vendorName.toLowerCase().includes(q) ||
          v.businessName.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.mobileNumber.includes(q)
      ),
      purchases: purchases.filter(
        (p) =>
          p.materialName.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      )
    };
  }, [query, projects, layouts, materialRates, vendors, purchases]);

  if (!smartSearchOpen) return null;

  const navigate = (url: string) => {
    setSmartSearchOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-emerald-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, floor plans, material rates, suppliers, orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Projects */}
          {searchResults.projects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Projects ({searchResults.projects.length})</span>
              </div>
              <div className="space-y-1">
                {searchResults.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {p.projectName}
                      </span>
                      <span className="text-slate-500 ml-2 text-[11px]">
                        • {p.location} ({p.plotArea} {p.plotUnit})
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* House Layouts */}
          {searchResults.layouts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-500" />
                <span>House Layouts &amp; Floor Plans</span>
              </div>
              <div className="space-y-1">
                {searchResults.layouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => navigate("/layouts")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {l.title}
                      </span>
                      <span className="text-slate-500 ml-2 text-[11px]">
                        • {l.plotWidthFt}&apos;×{l.plotDepthFt}&apos; ({l.bedrooms} Beds, {l.coveredAreaSqft} sqft)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      View CAD
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Material Rates */}
          {searchResults.rates.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Material Market Rates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.rates.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate("/rates/materials")}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {r.materialName || r.materialId}
                      </div>
                      {r.brand && (
                        <div className="text-[10px] text-slate-500">
                          {r.brand}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        Rs {r.deliveredRate.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        per {r.unit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vendors */}
          {searchResults.vendors.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Vendors &amp; Suppliers</span>
              </div>
              <div className="space-y-1">
                {searchResults.vendors.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => navigate("/vendors")}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors text-left"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {v.vendorName}
                      </span>
                      <span className="text-slate-500 ml-2">
                        ({v.businessName} • {v.category.toUpperCase()})
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {v.mobileNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Tool Shortcuts */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Calculator Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => navigate("/calculator/house-estimate")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-center transition-colors"
              >
                <div className="font-bold text-slate-900 dark:text-white">House Cost</div>
                <div className="text-[10px] text-slate-500">Grey + Finishes</div>
              </button>
              <button
                type="button"
                onClick={() => navigate("/rooms")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-center transition-colors"
              >
                <div className="font-bold text-slate-900 dark:text-white">Room Estimator</div>
                <div className="text-[10px] text-slate-500">Room-by-room</div>
              </button>
              <button
                type="button"
                onClick={() => navigate("/boq")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-center transition-colors"
              >
                <div className="font-bold text-slate-900 dark:text-white">BOQ &amp; Quotes</div>
                <div className="text-[10px] text-slate-500">Contractor formats</div>
              </button>
              <button
                type="button"
                onClick={() => navigate("/checklist")}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-center transition-colors"
              >
                <div className="font-bold text-slate-900 dark:text-white">Site Checklist</div>
                <div className="text-[10px] text-slate-500">Stage QA checks</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
