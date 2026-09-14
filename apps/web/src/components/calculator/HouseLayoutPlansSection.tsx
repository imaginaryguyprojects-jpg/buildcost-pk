"use client";

import React, { useState } from "react";
import {
  Bed,
  Bath,
  Utensils,
  Layers,
  Lock,
  Check,
  Maximize2,
  Sparkles,
  Eye,
  Compass,
  Building,
  ArrowRight,
  ShieldCheck,
  X
} from "lucide-react";

export interface HouseLayoutPlan {
  id: string;
  name: string;
  tier: "free" | "pro";
  plotSize: string;
  plotDimensions: string;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  buildupAreaSqft: number;
  coveredAreaSqft: number;
  floorsText: string;
  description: string;
  rooms: {
    name: string;
    dims: string;
    areaSqft: number;
  }[];
  features: string[];
}

export const HOUSE_LAYOUT_PLANS: HouseLayoutPlan[] = [
  {
    id: "layout_free_3bhk",
    name: "Modern 3BHK Layout",
    tier: "free",
    plotSize: "5 Marla (25×50 ft)",
    plotDimensions: "25×50 ft",
    bedrooms: 3,
    bathrooms: 2,
    kitchens: 1,
    buildupAreaSqft: 1200,
    coveredAreaSqft: 1050,
    floorsText: "Ground + 1",
    description: "Optimal 5 Marla Pakistani family layout with car porch, drawing room, open kitchen, and private bedrooms.",
    rooms: [
      { name: "Car Porch", dims: "11' × 15'", areaSqft: 165 },
      { name: "Drawing Room", dims: "12' × 14'", areaSqft: 168 },
      { name: "TV Lounge & Dining", dims: "16' × 14'", areaSqft: 224 },
      { name: "Kitchen", dims: "8' × 10'", areaSqft: 80 },
      { name: "Master Bedroom", dims: "13' × 12'", areaSqft: 156 },
      { name: "Attached Bath", dims: "6' × 7'", areaSqft: 42 },
      { name: "Bedroom 2", dims: "12' × 11'", areaSqft: 132 },
      { name: "Common Bath", dims: "5' × 7'", areaSqft: 35 },
      { name: "Backyard / Utility", dims: "25' × 4'", areaSqft: 100 }
    ],
    features: ["Dedicated Car Porch", "Cross-ventilation shaft", "Separate Drawing entry", "Modern Open Kitchen"]
  },
  {
    id: "layout_pro_4bhk_luxury",
    name: "Luxury 4BHK Layout",
    tier: "pro",
    plotSize: "7 Marla (30×60 ft)",
    plotDimensions: "30×60 ft",
    bedrooms: 4,
    bathrooms: 3,
    kitchens: 1,
    buildupAreaSqft: 1800,
    coveredAreaSqft: 1550,
    floorsText: "Ground + 2",
    description: "Premium double-height lounge layout with formal drawing room, dirty kitchen, and en-suite master suites.",
    rooms: [
      { name: "Wide Car Porch", dims: "14' × 18'", areaSqft: 252 },
      { name: "Front Lawn", dims: "14' × 6'", areaSqft: 84 },
      { name: "Executive Drawing Room", dims: "14' × 16'", areaSqft: 224 },
      { name: "Powder Bath", dims: "5' × 5'", areaSqft: 25 },
      { name: "Grand TV Lounge", dims: "18' × 16'", areaSqft: 288 },
      { name: "Chef's Kitchen", dims: "10' × 12'", areaSqft: 120 },
      { name: "Dirty / Wet Kitchen", dims: "6' × 8'", areaSqft: 48 },
      { name: "Master Suite", dims: "15' × 14'", areaSqft: 210 },
      { name: "Walk-in Dressing & Bath", dims: "8' × 8'", areaSqft: 64 },
      { name: "Bedroom 2 (Attached)", dims: "13' × 12'", areaSqft: 156 }
    ],
    features: ["Dual Car Garage", "Dirty Kitchen with service door", "Powder Room", "Double-height Lounge ceiling"]
  },
  {
    id: "layout_pro_4bhk_study",
    name: "Modern 4BHK + Study",
    tier: "pro",
    plotSize: "10 Marla (35×70 ft)",
    plotDimensions: "35×70 ft",
    bedrooms: 4,
    bathrooms: 3,
    kitchens: 1,
    buildupAreaSqft: 2200,
    coveredAreaSqft: 1950,
    floorsText: "Ground + 2",
    description: "Architectural 10 Marla residence featuring dedicated home office/study room, side patio, and laundry yard.",
    rooms: [
      { name: "Dual Car Porch", dims: "18' × 20'", areaSqft: 360 },
      { name: "Home Office / Study", dims: "11' × 12'", areaSqft: 132 },
      { name: "Formal Drawing & Dining", dims: "15' × 20'", areaSqft: 300 },
      { name: "Central Courtyard / Patio", dims: "8' × 14'", areaSqft: 112 },
      { name: "Family Lounge", dims: "20' × 16'", areaSqft: 320 },
      { name: "Island Kitchen", dims: "12' × 14'", areaSqft: 168 },
      { name: "Master Bedroom 1", dims: "16' × 14'", areaSqft: 224 },
      { name: "Luxury Bath 1", dims: "8' × 9'", areaSqft: 72 },
      { name: "Bedroom 2", dims: "14' × 13'", areaSqft: 182 },
      { name: "Bath 2", dims: "7' × 8'", areaSqft: 56 }
    ],
    features: ["Private Home Office / Study", "Internal Light Courtyard", "Island Kitchen", "Independent Servant Quarter"]
  },
  {
    id: "layout_pro_5bhk_villa",
    name: "Premium Villa Layout",
    tier: "pro",
    plotSize: "1 Kanal (50×90 ft)",
    plotDimensions: "50×90 ft",
    bedrooms: 5,
    bathrooms: 4,
    kitchens: 1,
    buildupAreaSqft: 2800,
    coveredAreaSqft: 2450,
    floorsText: "Ground + 2",
    description: "Palatial 1 Kanal estate layout with grand entrance lobby, 3-car parking, swimming pool patio, and maid suite.",
    rooms: [
      { name: "3-Car Portico", dims: "22' × 24'", areaSqft: 528 },
      { name: "Manicured Front Lawn", dims: "25' × 12'", areaSqft: 300 },
      { name: "Grand Foyer & Lobby", dims: "12' × 14'", areaSqft: 168 },
      { name: "Royal Drawing Room", dims: "18' × 22'", areaSqft: 396 },
      { name: "Formal Dining Hall", dims: "14' × 16'", areaSqft: 224 },
      { name: "Expansive Family Lounge", dims: "24' × 20'", areaSqft: 480 },
      { name: "Imported Italian Kitchen", dims: "14' × 16'", areaSqft: 224 },
      { name: "Presidential Master Suite", dims: "18' × 16'", areaSqft: 288 },
      { name: "Spa Bathroom & Jacuzzi", dims: "10' × 12'", areaSqft: 120 },
      { name: "Bedroom 2 (Guest Suite)", dims: "15' × 14'", areaSqft: 210 }
    ],
    features: ["3-Car Parking Portico", "Rear Swimming Pool deck", "Separate Servant Entrance", "Private Spa Bathrooms"]
  }
];

// Architectural Blueprint SVG Vector Renderer
function ArchitecturalPlanSvg({ layout }: { layout: HouseLayoutPlan }) {
  if (layout.id === "layout_free_3bhk") {
    return (
      <svg viewBox="0 0 400 280" className="w-full h-full bg-[#fbf9f4] dark:bg-[#111927]">
        {/* Exterior Foundation Border */}
        <rect x="15" y="15" width="370" height="250" fill="none" stroke="#2563eb" strokeWidth="3" rx="2" opacity="0.8" />
        <rect x="18" y="18" width="364" height="244" fill="#f8fafc" className="dark:fill-slate-900/60" />

        {/* Room 1: Car Porch */}
        <rect x="20" y="20" width="130" height="110" fill="#f1f5f9" className="dark:fill-slate-800/60" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="85" y="65" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 font-bold text-[11px]">CAR PORCH</text>
        <text x="85" y="80" textAnchor="middle" className="fill-slate-400 font-mono text-[9px]">11&apos; × 15&apos;</text>
        {/* Car outline hint */}
        <rect x="50" y="40" width="70" height="45" rx="8" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />

        {/* Room 2: Drawing Room */}
        <rect x="150" y="20" width="120" height="110" fill="#fef3c7" className="dark:fill-amber-950/20" stroke="#334155" strokeWidth="2" />
        <text x="210" y="65" textAnchor="middle" className="fill-slate-800 dark:fill-amber-200 font-bold text-[11px]">DRAWING RM</text>
        <text x="210" y="80" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">12&apos; × 14&apos;</text>

        {/* Room 3: Powder Bath */}
        <rect x="270" y="20" width="110" height="60" fill="#e0f2fe" className="dark:fill-sky-950/30" stroke="#334155" strokeWidth="2" />
        <text x="325" y="48" textAnchor="middle" className="fill-sky-900 dark:fill-sky-300 font-bold text-[9px]">BATH (COMMON)</text>
        <text x="325" y="62" textAnchor="middle" className="fill-slate-400 font-mono text-[8px]">5&apos; × 7&apos;</text>

        {/* Room 4: Kitchen */}
        <rect x="270" y="80" width="110" height="75" fill="#fed7aa" className="dark:fill-orange-950/20" stroke="#334155" strokeWidth="2" />
        <text x="325" y="115" textAnchor="middle" className="fill-orange-900 dark:fill-orange-300 font-bold text-[10px]">KITCHEN</text>
        <text x="325" y="130" textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">8&apos; × 10&apos;</text>

        {/* Room 5: Central TV Lounge */}
        <rect x="20" y="130" width="250" height="70" fill="#ecfdf5" className="dark:fill-emerald-950/20" stroke="#334155" strokeWidth="2" />
        <text x="145" y="165" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-300 font-extrabold text-[12px]">TV LOUNGE &amp; DINING</text>
        <text x="145" y="180" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">16&apos; × 14&apos;</text>

        {/* Stairs indicator */}
        <rect x="25" y="135" width="40" height="60" fill="none" stroke="#94a3b8" strokeWidth="1" />
        <line x1="25" y1="145" x2="65" y2="145" stroke="#94a3b8" />
        <line x1="25" y1="155" x2="65" y2="155" stroke="#94a3b8" />
        <line x1="25" y1="165" x2="65" y2="165" stroke="#94a3b8" />
        <line x1="25" y1="175" x2="65" y2="175" stroke="#94a3b8" />
        <line x1="25" y1="185" x2="65" y2="185" stroke="#94a3b8" />
        <text x="45" y="193" textAnchor="middle" className="fill-slate-500 text-[8px]">UP</text>

        {/* Room 6: Master Bed (Rear Left) */}
        <rect x="20" y="200" width="170" height="65" fill="#f8fafc" className="dark:fill-slate-800/40" stroke="#334155" strokeWidth="2" />
        <text x="105" y="230" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-bold text-[11px]">MASTER BEDROOM</text>
        <text x="105" y="245" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">13&apos; × 12&apos;</text>

        {/* Room 7: Bed 2 (Rear Right) */}
        <rect x="190" y="200" width="130" height="65" fill="#f8fafc" className="dark:fill-slate-800/40" stroke="#334155" strokeWidth="2" />
        <text x="255" y="230" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 font-bold text-[11px]">BEDROOM 2</text>
        <text x="255" y="245" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">12&apos; × 11&apos;</text>

        {/* Attached Bath for Master Bed */}
        <rect x="320" y="200" width="60" height="65" fill="#e0f2fe" className="dark:fill-sky-950/30" stroke="#334155" strokeWidth="2" />
        <text x="350" y="230" textAnchor="middle" className="fill-sky-900 dark:fill-sky-300 font-bold text-[9px]">ATT. BATH</text>
        <text x="350" y="245" textAnchor="middle" className="fill-slate-400 font-mono text-[8px]">6&apos; × 7&apos;</text>

        {/* Door Swings */}
        <path d="M 148 55 A 15 15 0 0 1 133 40" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 272 110 A 15 15 0 0 1 257 95" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 100 202 A 15 15 0 0 1 85 187" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        <path d="M 250 202 A 15 15 0 0 1 235 187" fill="none" stroke="#2563eb" strokeWidth="1.5" />

        {/* Dimension Callout */}
        <line x1="20" y1="272" x2="380" y2="272" stroke="#94a3b8" strokeWidth="1" />
        <text x="200" y="278" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">FRONT: 25&apos;-0&quot; • DEPTH: 50&apos;-0&quot;</text>
      </svg>
    );
  }

  // PRO Layouts (Rich Architectural CAD Rendering)
  return (
    <svg viewBox="0 0 400 280" className="w-full h-full bg-[#fdfbf7] dark:bg-[#0c1424]">
      {/* Outer Plot Boundary */}
      <rect x="12" y="12" width="376" height="256" fill="none" stroke="#059669" strokeWidth="2.5" rx="3" opacity="0.9" />
      <rect x="15" y="15" width="370" height="250" fill="#ffffff" className="dark:fill-slate-900/80" />

      {/* Grid Pattern */}
      <defs>
        <pattern id={`cad-grid-${layout.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.3" />
        </pattern>
      </defs>
      <rect x="15" y="15" width="370" height="250" fill={`url(#cad-grid-${layout.id})`} />

      {/* Front Garage / Porch */}
      <rect x="16" y="16" width="140" height="100" fill="#f8fafc" className="dark:fill-slate-800/50" stroke="#047857" strokeWidth="2" strokeDasharray="3 3" />
      <text x="86" y="55" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-400 font-extrabold text-[11px]">CAR PORCH &amp; DRIVEWAY</text>
      <text x="86" y="70" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">14&apos; × 18&apos;</text>

      {/* Lawn / Verandah */}
      <rect x="156" y="16" width="70" height="40" fill="#dcfce7" className="dark:fill-emerald-950/30" stroke="#059669" strokeWidth="1.5" />
      <text x="191" y="38" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-300 font-bold text-[9px]">LAWN</text>

      {/* Drawing Room */}
      <rect x="226" y="16" width="158" height="100" fill="#fffbeb" className="dark:fill-amber-950/20" stroke="#047857" strokeWidth="2" />
      <text x="305" y="55" textAnchor="middle" className="fill-amber-900 dark:fill-amber-300 font-extrabold text-[11px]">DRAWING &amp; DINING</text>
      <text x="305" y="70" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">14&apos; × 16&apos;</text>
      <circle cx="370" cy="50" r="3" fill="#047857" />
      <circle cx="370" cy="80" r="3" fill="#047857" />

      {/* Powder Room */}
      <rect x="156" y="56" width="70" height="60" fill="#e0f2fe" className="dark:fill-sky-950/30" stroke="#047857" strokeWidth="1.5" />
      <text x="191" y="85" textAnchor="middle" className="fill-sky-800 dark:fill-sky-300 font-bold text-[8px]">POWDER</text>
      <text x="191" y="98" textAnchor="middle" className="fill-slate-500 font-mono text-[7px]">5&apos; × 5&apos;</text>

      {/* Central Grand TV Lounge */}
      <rect x="16" y="116" width="230" height="85" fill="#f0fdf4" className="dark:fill-emerald-950/20" stroke="#047857" strokeWidth="2" />
      <text x="131" y="150" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-200 font-black text-[12px]">GRAND FAMILY LOUNGE</text>
      <text x="131" y="165" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">18&apos; × 16&apos; (Double Height)</text>

      {/* Stairs Floating Tower */}
      <rect x="22" y="122" width="38" height="72" fill="none" stroke="#64748b" strokeWidth="1" />
      <line x1="22" y1="134" x2="60" y2="134" stroke="#64748b" />
      <line x1="22" y1="146" x2="60" y2="146" stroke="#64748b" />
      <line x1="22" y1="158" x2="60" y2="158" stroke="#64748b" />
      <line x1="22" y1="170" x2="60" y2="170" stroke="#64748b" />
      <line x1="22" y1="182" x2="60" y2="182" stroke="#64748b" />
      <text x="41" y="191" textAnchor="middle" className="fill-slate-500 text-[8px] font-bold">STAIRS</text>

      {/* Kitchen & Wet Kitchen */}
      <rect x="246" y="116" width="138" height="85" fill="#ffedd5" className="dark:fill-orange-950/20" stroke="#047857" strokeWidth="2" />
      <text x="315" y="150" textAnchor="middle" className="fill-orange-900 dark:fill-orange-300 font-extrabold text-[11px]">CHEF&apos;S KITCHEN</text>
      <text x="315" y="165" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">10&apos; × 12&apos; + DIRTY KITCHEN</text>

      {/* Master Bedroom Suite */}
      <rect x="16" y="201" width="180" height="64" fill="#fafafa" className="dark:fill-slate-800/40" stroke="#047857" strokeWidth="2" />
      <text x="106" y="230" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-bold text-[11px]">MASTER BEDROOM</text>
      <text x="106" y="245" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">15&apos; × 14&apos;</text>

      {/* Bedroom 2 */}
      <rect x="196" y="201" width="120" height="64" fill="#fafafa" className="dark:fill-slate-800/40" stroke="#047857" strokeWidth="2" />
      <text x="256" y="230" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-bold text-[11px]">BEDROOM 2</text>
      <text x="256" y="245" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">13&apos; × 12&apos;</text>

      {/* En-suite Bath & Dress */}
      <rect x="316" y="201" width="68" height="64" fill="#e0f2fe" className="dark:fill-sky-950/30" stroke="#047857" strokeWidth="2" />
      <text x="350" y="230" textAnchor="middle" className="fill-sky-800 dark:fill-sky-200 font-bold text-[9px]">EN-SUITE</text>
      <text x="350" y="245" textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">8&apos; × 8&apos;</text>

      {/* Door Swings */}
      <path d="M 224 55 A 15 15 0 0 1 209 40" fill="none" stroke="#059669" strokeWidth="1.5" />
      <path d="M 244 140 A 15 15 0 0 1 229 125" fill="none" stroke="#059669" strokeWidth="1.5" />
      <path d="M 110 203 A 15 15 0 0 1 95 188" fill="none" stroke="#059669" strokeWidth="1.5" />
      <path d="M 250 203 A 15 15 0 0 1 235 188" fill="none" stroke="#059669" strokeWidth="1.5" />

      {/* Dimension Callout */}
      <line x1="16" y1="273" x2="384" y2="273" stroke="#64748b" strokeWidth="1" />
      <text x="200" y="278" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
        {layout.plotDimensions.toUpperCase()} • RESIDENTIAL ARCHITECTURAL CAD PLAN
      </text>
    </svg>
  );
}

interface HouseLayoutPlansSectionProps {
  isPro: boolean;
  onUpgradeClick: (feature: string) => void;
  onSelectLayout?: (layout: HouseLayoutPlan) => void;
}

export function HouseLayoutPlansSection({
  isPro,
  onUpgradeClick,
  onSelectLayout
}: HouseLayoutPlansSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "free" | "pro">("all");
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("layout_free_3bhk");
  const [modalLayout, setModalLayout] = useState<HouseLayoutPlan | null>(null);

  const filteredPlans = HOUSE_LAYOUT_PLANS.filter((plan) => {
    if (activeFilter === "free") return plan.tier === "free";
    if (activeFilter === "pro") return plan.tier === "pro";
    return true;
  });

  const handleLayoutAction = (layout: HouseLayoutPlan) => {
    if (layout.tier === "pro" && !isPro) {
      onUpgradeClick(`Architectural Plan: ${layout.name}`);
      return;
    }
    setSelectedLayoutId(layout.id);
    if (onSelectLayout) {
      onSelectLayout(layout);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Section Header with Free / PRO filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Available Layout Plans</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose from multiple modern and efficient designs. Select your preferred layout or customize it.
          </p>
        </div>

        {/* Filter Pills matching the reference image */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            All (4)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("free")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "free"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span>Free (1)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("pro")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "pro"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
                : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>PRO (3)</span>
          </button>
        </div>
      </div>

      {/* Grid of 4 Layout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {filteredPlans.map((plan) => {
          const isSelected = selectedLayoutId === plan.id;
          const isLocked = plan.tier === "pro" && !isPro;

          return (
            <div
              key={plan.id}
              className={`group flex flex-col rounded-2xl border-2 overflow-hidden transition-all bg-white dark:bg-slate-950/60 ${
                isSelected
                  ? "border-blue-600 shadow-md shadow-blue-500/10"
                  : plan.tier === "pro"
                  ? "border-amber-400/40 hover:border-amber-400"
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-400"
              }`}
            >
              {/* Card Top Banner with Title & Badges */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  {plan.tier === "free" ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                      FREE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-slate-400">{plan.plotDimensions}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight truncate">
                  {plan.name}
                </h3>

                {/* Tags: Bedrooms, Bathrooms, Kitchen */}
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5 text-blue-500" />
                    {plan.bedrooms} Beds
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3.5 h-3.5 text-cyan-500" />
                    {plan.bathrooms} Baths
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-orange-500" />
                    {plan.kitchens} Kitchen
                  </span>
                </div>
              </div>

              {/* Realistic Architectural Plan Diagram Viewport */}
              <div className="relative aspect-[4/3] w-full border-b border-slate-100 dark:border-slate-800 bg-[#faf8f5] dark:bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
                <ArchitecturalPlanSvg layout={plan} />

                {/* Inspect Zoom Button */}
                <button
                  type="button"
                  onClick={() => setModalLayout(plan)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white shadow-xs backdrop-blur-xs transition-colors"
                  title="Enlarge Floor Plan & Dimensions"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Lock Overlay for PRO plans if not authenticated */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Lock className="w-3.5 h-3.5" />
                      <span>PRO Architectural Plan</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Areas & Floors */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/40">
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] font-medium text-slate-400 uppercase">Build-up Area</div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {plan.buildupAreaSqft.toLocaleString()} sq ft
                    </div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] font-medium text-slate-400 uppercase">Covered Area</div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {plan.coveredAreaSqft.toLocaleString()} sq ft
                    </div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] font-medium text-slate-400 uppercase">Floors</div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {plan.floorsText}
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                {isSelected ? (
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </button>
                ) : isLocked ? (
                  <button
                    type="button"
                    onClick={() => handleLayoutAction(plan)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>View Details</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLayoutAction(plan)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-blue-600 text-white dark:bg-slate-800 dark:hover:bg-blue-600 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Select Layout</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enlarged Layout Detail Modal */}
      {modalLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    modalLayout.tier === "free"
                      ? "bg-blue-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {modalLayout.tier.toUpperCase()}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {modalLayout.name} • {modalLayout.plotSize}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalLayout(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-3">
                <div className="aspect-[16/10] w-full flex items-center justify-center">
                  <ArchitecturalPlanSvg layout={modalLayout} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Dimensions Table */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                    Room Schedule &amp; Dimensions
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {modalLayout.rooms.map((room, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{room.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500">{room.dims}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{room.areaSqft} sqft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Architectural Highlights */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                    Architectural Specifications
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {modalLayout.description}
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {modalLayout.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs text-slate-500">
                Plot: <strong>{modalLayout.plotSize}</strong> • Covered:{" "}
                <strong>{modalLayout.coveredAreaSqft} sq ft</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalLayout(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                {modalLayout.tier === "pro" && !isPro ? (
                  <button
                    type="button"
                    onClick={() => {
                      setModalLayout(null);
                      onUpgradeClick(`Architectural Plan: ${modalLayout.name}`);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock with PRO</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleLayoutAction(modalLayout);
                      setModalLayout(null);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Select This Layout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

