"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  MapPin,
  TrendingUp,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  Edit3,
  Check,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { formatPKR, formatNumber } from "@/lib/formatters";

interface MaterialCatalogItem {
  id: string;
  name: string;
  category: "civil" | "finishing" | "mep" | "fixtures";
  brand: string;
  grade: string;
  unit: string;
  defaultRate: number;
  projectRate?: number;
  cityId: string;
  supplier: string;
  source: string;
  lastVerifiedDate: string;
  confidence: "HIGH" | "MEDIUM" | "ESTIMATED";
}

const INITIAL_MATERIALS_CATALOG: MaterialCatalogItem[] = [
  {
    id: "mat_1",
    name: "Portland Cement (50kg Bag)",
    category: "civil",
    brand: "Bestway / Fauji / DG Khan",
    grade: "Ordinary Portland (OPC)",
    unit: "Bag",
    defaultRate: 1450,
    projectRate: 1420,
    cityId: "isb",
    supplier: "Capital Building Materials, I-9",
    source: "APCMA / PBS Weekly Survey",
    lastVerifiedDate: "Sep 04, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_2",
    name: "Deformed Steel Bar Grade 60",
    category: "civil",
    brand: "Mughal / Amreli / Agha Steel",
    grade: "ASTM A615 Grade 60 (60,000 psi)",
    unit: "Kg",
    defaultRate: 260,
    projectRate: 258,
    cityId: "isb",
    supplier: "Al-Fateh Steel Syndicate, I-10",
    source: "Daily Mill Gate Benchmark",
    lastVerifiedDate: "Sep 04, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_3",
    name: "First Class Red Clay Bricks (Awal)",
    category: "civil",
    brand: "AWT / Rawat Bhatta Syndicate",
    grade: "First Class Hand Moulded Kiln Burnt",
    unit: "1,000 Bricks",
    defaultRate: 14500,
    cityId: "isb",
    supplier: "Chatha Bhatta Co., Mandra",
    source: "Bhatta Association Market Quote",
    lastVerifiedDate: "Sep 03, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_4",
    name: "Coarse River Sand (Chenab / Ravi)",
    category: "civil",
    brand: "Chenab River Bed",
    grade: "Medium Coarse Screeded FM 2.2-2.6",
    unit: "Cuft",
    defaultRate: 65,
    cityId: "isb",
    supplier: "Rawal Dumper Logistics",
    source: "Sand Quarry Pithead Price",
    lastVerifiedDate: "Sep 02, 2026",
    confidence: "MEDIUM"
  },
  {
    id: "mat_5",
    name: "Crushed Stone / Aggregate (Bajri)",
    category: "civil",
    brand: "Margalla / Taxila Hills",
    grade: "3/4\" Down Crushed Blue Limestone",
    unit: "Cuft",
    defaultRate: 110,
    cityId: "isb",
    supplier: "Taxila Crusher Syndicate",
    source: "Crusher Association Tariff",
    lastVerifiedDate: "Sep 02, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_6",
    name: "Porcelain Floor Tiles (600x600mm)",
    category: "finishing",
    brand: "Master / Shabbir / Karam",
    grade: "Grade AAA Glazed Vitrified",
    unit: "Sqft",
    defaultRate: 280,
    projectRate: 265,
    cityId: "isb",
    supplier: "Al-Madina Ceramic Gallery, Golra",
    source: "Manufacturer Wholesale Price List",
    lastVerifiedDate: "Aug 28, 2026",
    confidence: "MEDIUM"
  },
  {
    id: "mat_7",
    name: "Tavera / Sunny Grey Marble",
    category: "finishing",
    brand: "Balochistan / KP Quarries",
    grade: "First Quality Polished 1/2\" Slab",
    unit: "Sqft",
    defaultRate: 145,
    cityId: "isb",
    supplier: "Khyber Marble Factory, I-9",
    source: "Marble Market Association",
    lastVerifiedDate: "Aug 30, 2026",
    confidence: "MEDIUM"
  },
  {
    id: "mat_8",
    name: "Weather Shield Exterior Acrylic Paint",
    category: "finishing",
    brand: "Berger / Dulux / Brighto",
    grade: "Exterior Silicon Emulsion",
    unit: "Drum (16 Litre)",
    defaultRate: 18500,
    cityId: "isb",
    supplier: "Dulux Paint Depot, Blue Area",
    source: "Retail Brand Official Tariff",
    lastVerifiedDate: "Sep 01, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_9",
    name: "PPRC Water Supply Pipe PN-20 (25mm)",
    category: "mep",
    brand: "Popular / Master / IIL",
    grade: "DIN 8077/8078 Hot & Cold Water",
    unit: "Length (13 ft)",
    defaultRate: 850,
    cityId: "isb",
    supplier: "Capital Sanitary Store, G-9",
    source: "Popular Pipes Price List",
    lastVerifiedDate: "Aug 25, 2026",
    confidence: "MEDIUM"
  },
  {
    id: "mat_10",
    name: "Pure Copper Electrical Cable 3/.029",
    category: "mep",
    brand: "Pakistan Cables / GM / Newage",
    grade: "99.99% Electrolytic Copper 250/440V",
    unit: "Coil (90 Meters)",
    defaultRate: 9800,
    projectRate: 9500,
    cityId: "isb",
    supplier: "Pak Light Corporation, Saddar",
    source: "Pakistan Cables Wholesale Gazette",
    lastVerifiedDate: "Sep 02, 2026",
    confidence: "HIGH"
  },
  {
    id: "mat_11",
    name: "Sanitary Commode + Cistern Suite",
    category: "fixtures",
    brand: "Porta / Marcopolo / Faisal",
    grade: "First Class Vitreous China",
    unit: "Set",
    defaultRate: 16500,
    cityId: "isb",
    supplier: "Al-Haram Sanitary, G-8",
    source: "Showroom List Price",
    lastVerifiedDate: "Aug 20, 2026",
    confidence: "ESTIMATED"
  }
];

export default function MaterialsCatalogPage() {
  const { selectedCityId, setSelectedCityId } = useProjectStore();
  const { showToast } = useAuthStore();

  const [items, setItems] = useState<MaterialCatalogItem[]>(INITIAL_MATERIALS_CATALOG);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingItem, setEditingItem] = useState<MaterialCatalogItem | null>(null);
  const [overrideRateValue, setOverrideRateValue] = useState<number>(0);

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  const handleStartOverride = (item: MaterialCatalogItem) => {
    setEditingItem(item);
    setOverrideRateValue(item.projectRate || item.defaultRate);
  };

  const handleSaveOverride = () => {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((it) => (it.id === editingItem.id ? { ...it, projectRate: overrideRateValue } : it))
    );
    showToast(
      `Custom project rate saved: ${editingItem.name} updated to Rs. ${formatNumber(overrideRateValue)}/${editingItem.unit}.`,
      "success"
    );
    setEditingItem(null);
  };

  const handleClearOverride = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, projectRate: undefined } : it))
    );
    showToast("Reverted back to default Pakistani benchmark market rate.", "info");
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Materials Catalog &amp; Custom Project Rates
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Section 16, 46 &amp; 47
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified market benchmarks, brands, grades, confidence levels, and customize project-level rates.
          </p>
        </div>

        {/* City Filter & Rate History Link */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none"
          >
            {PAKISTANI_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Link
            href="/rates/history"
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Rate History Charts</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Materials" },
            { id: "civil", label: "Civil & Structural" },
            { id: "finishing", label: "Finishing & Tiles" },
            { id: "mep", label: "MEP, Pipes & Cables" },
            { id: "fixtures", label: "Fixtures & Sanitary" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterCategory === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search material, brand, grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Materials Table with Custom Overrides & Confidence Badges */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-slate-700/60">
              <tr>
                <th className="px-5 py-3">Material &amp; Specification</th>
                <th className="px-4 py-3">Brand &amp; Grade</th>
                <th className="px-4 py-3 text-right">Default Market Rate</th>
                <th className="px-4 py-3 text-right">Custom Project Rate</th>
                <th className="px-4 py-3 text-center">Confidence (Sec 47)</th>
                <th className="px-4 py-3">Source &amp; Verification (Sec 49)</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredItems.map((mat) => {
                const isOverridden = mat.projectRate !== undefined;

                return (
                  <tr key={mat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Material */}
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      <div>{mat.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">Unit: {mat.unit}</div>
                    </td>

                    {/* Brand & Grade */}
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{mat.brand}</div>
                      <div className="text-[10px] text-slate-400">{mat.grade}</div>
                    </td>

                    {/* Default Benchmark Rate */}
                    <td className="px-4 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      Rs. {formatNumber(mat.defaultRate)}
                      <span className="text-[10px] font-normal text-slate-400 block">/{mat.unit}</span>
                    </td>

                    {/* Custom Project Rate */}
                    <td className="px-4 py-4 text-right">
                      {isOverridden ? (
                        <div className="space-y-0.5">
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                            Rs. {formatNumber(mat.projectRate!)}
                          </span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 block w-fit ml-auto">
                            Custom
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Using Default</span>
                      )}
                    </td>

                    {/* Confidence Rating (Section 47) */}
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        mat.confidence === "HIGH"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                          : mat.confidence === "MEDIUM"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                      }`}>
                        {mat.confidence}
                      </span>
                    </td>

                    {/* Source & Fallback Timestamp (Section 49) */}
                    <td className="px-4 py-4 text-slate-500 text-[11px]">
                      <div>{mat.source}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Last verified on: <span className="font-medium text-slate-600 dark:text-slate-300">{mat.lastVerifiedDate}</span>
                      </div>
                    </td>

                    {/* Override Actions */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleStartOverride(mat)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Override Rate for this Project (Section 16)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isOverridden && (
                          <button
                            onClick={() => handleClearOverride(mat.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 transition-colors"
                            title="Reset to default benchmark rate"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Override Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Customize Project Rate (Section 16)</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{editingItem.name}</div>
              <div className="text-slate-500">Brand: {editingItem.brand} • Unit: {editingItem.unit}</div>
              <div className="text-slate-400">
                Default Market Rate: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Rs. {formatNumber(editingItem.defaultRate)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Custom Project Rate (PKR per {editingItem.unit}):
              </label>
              <input
                type="number"
                value={overrideRateValue}
                onChange={(e) => setOverrideRateValue(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                This project rate will override the benchmark rate across all cost calculations for your project without altering the global database benchmarks.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                Apply Project Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
