"use client";

import React from "react";
import Link from "next/link";
import { SmartEstimateWizard } from "@/components/home/SmartEstimateWizard";
import { Calculator, ArrowRight, ShieldCheck, MapPin, Building } from "lucide-react";
import { PAK_CITIES } from "@buildcost/config";

export default function ConstructionCostCalculatorPakistanPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <span className="text-slate-200">Construction Cost Calculator Pakistan</span>
      </nav>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Construction Cost Calculator Pakistan (2026 Updated)
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          Accurate, transparent civil engineering cost calculator for residential, commercial, and plaza construction in Pakistan. Calculates exact cement bags, Grade 60 steel tonnage, kiln bricks, and labour chowk contracts across Islamabad, Rawalpindi, Lahore, and Karachi.
        </p>
      </div>

      {/* Embedded Wizard */}
      <SmartEstimateWizard />

      {/* Technical Overview Article */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
        <h2 className="text-base font-bold text-white">How Construction Cost is Calculated in Pakistan</h2>
        <p>
          Construction cost in Pakistan is predominantly divided into two primary milestones: <strong>Grey Structure</strong> (approx. 50% to 55% of total budget) and <strong>Turnkey Finishing</strong> (approx. 45% to 50%).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-emerald-400">Grey Structure Inclusions</h3>
            <p className="text-slate-400">
              RCC foundations, excavation, lean concrete (1:4:8), slab beams (1:2:4), Grade 60 steel rebar binding (3.5 to 4.2 kg/sqft), 9-inch exterior Awwal brick masonry, internal/external sand-cement plastering, underground water tank, and electrical conduit laying.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h3 className="font-bold text-teal-400">Finishing Inclusions</h3>
            <p className="text-slate-400">
              Master porcelain or Spanish floor tiles, marble staircases with safety bullnosing, solid ash/deodar doors, powder-coated aluminum windows, false ceiling plasterboard, Berger/Dulux weather-resistant paint, and branded sanitary ware (Porta/Sonex).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
