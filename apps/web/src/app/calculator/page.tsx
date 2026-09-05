"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Maximize2,
  Box,
  Layers,
  Sparkles,
  Palette,
  Grid,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { BRAND_CONFIG } from "@buildcost/config";

const calculators = [
  {
    title: "Complete House Cost Estimator",
    description: "30-category whole-house civil, structural, and finishing cost estimation engine.",
    href: "/calculator/house-estimate",
    icon: Home,
    badge: "Most Popular",
    color: "emerald"
  },
  {
    title: "Plot & Area Calculator",
    description: "Regional Marla standards (225, 250, 272.25 sqft), setbacks, ground coverage %, and FAR.",
    href: "/calculator/area",
    icon: Maximize2,
    color: "blue"
  },
  {
    title: "Concrete & RCC Calculator",
    description: "Slabs, beams, columns, footing dry volume (1.54 factor), cement bags, sand, and crush.",
    href: "/calculator/concrete",
    icon: Box,
    color: "amber"
  },
  {
    title: "Brick Masonry Calculator",
    description: "9-inch and 4.5-inch wall volumes, opening deductions, brick quantities, and mortar mixes.",
    href: "/calculator/brickwork",
    icon: Layers,
    color: "orange"
  },
  {
    title: "Steel & Rebar Calculator",
    description: "Rebar weight via D²/162.2 (kg/m), bar counts, and empirical structural estimates.",
    href: "/calculator/steel",
    icon: Sparkles,
    color: "indigo"
  },
  {
    title: "Plaster & Screed Calculator",
    description: "Internal, external, and ceiling plaster dry volume (1.27 factor), cement bags, and sand.",
    href: "/calculator/plaster",
    icon: Grid,
    color: "teal"
  },
  {
    title: "Flooring & Tiles Calculator",
    description: "Room tile requirements, box packaging, bond adhesive bags, and border cut allowances.",
    href: "/calculator/flooring",
    icon: Grid,
    color: "cyan"
  },
  {
    title: "Paint & Finishes Calculator",
    description: "Wall putty, undercoat primer, and multi-coat paint litres with coverage calculations.",
    href: "/calculator/paint",
    icon: Palette,
    color: "purple"
  }
];

export default function CalculatorHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Construction Calculators</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Specialized civil engineering and quantity estimation calculators calibrated for Pakistani standards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {calculators.map((calc) => {
          const Icon = calc.icon;

          return (
            <Link
              key={calc.href}
              href={calc.href}
              className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  {calc.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      {calc.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  {calc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <span>Launch Calculator</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Engineering Disclaimer Card matching specification */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">Civil Engineering Disclaimer</span>
          {BRAND_CONFIG.disclaimer}
        </div>
      </div>
    </div>
  );
}
