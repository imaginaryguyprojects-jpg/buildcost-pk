"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  FileSpreadsheet,
  HardHat,
  Home,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building,
  Scale,
  DollarSign,
  BarChart3,
  Lock,
  ArrowDownCircle
} from "lucide-react";
import { PAK_CITIES } from "@buildcost/config";
import { useAuthStore } from "@/stores/authStore";
import { WelcomeAuthGate } from "@/components/auth/WelcomeAuthGate";
import { PrimaryPropertyCalculator } from "@/components/dashboard/PrimaryPropertyCalculator";

export default function LandingPage() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  const scrollToCalculator = () => {
    const el = document.getElementById("calculator-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900 transition-colors duration-200">
      {/* Top Banner / Corporate Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-800/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                BuildCost Connect
              </span>
              <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-bold tracking-wider uppercase">
                Pakistan Construction Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={scrollToCalculator}
              className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors"
            >
              Property Calculator
            </button>
            <Link href="/rates/materials" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Live Material Rates
            </Link>
            <Link href="/labour" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Labour Wages
            </Link>
            <Link href="/tools/converter" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              Marla &amp; Currency
            </Link>
            <Link href="/updates" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">
              What's New
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. AUTHENTICATION & WELCOME SCREEN (LANDING / AUTH UI) */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <WelcomeAuthGate onGuestAccess={scrollToCalculator} />
      </section>

      {/* 2. CORPORATE PROPERTY CALCULATOR SECTION */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#059669] dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Hero Property Estimator
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Calculate Your Construction Cost In Seconds
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose your city, pick a standard plot size or enter custom dimensions, and view transparent Grey Structure &amp; Finishing cost projections.
          </p>
        </div>

        {/* Primary Corporate Calculator */}
        <PrimaryPropertyCalculator />
      </section>

      {/* 3. CITY BENCHMARK COVERAGE */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#059669] dark:text-emerald-400 uppercase tracking-wider">
              Localized Intelligence
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Calibrated Across 13 Major Pakistani Cities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Freight tariffs from Margalla vs Sargodha quarries, Chenab vs Ravi sand, and local Mistry/Mazdoor daily wages.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {PAK_CITIES.map((c) => (
              <Link
                key={c.id}
                href={`/rates/materials?city=${c.id}`}
                className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#059669] transition-all text-center group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#059669] transition-colors">
                  {c.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{c.province}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRISTINE FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950 py-10 text-slate-600 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#059669] flex items-center justify-center text-white font-bold">
                BC
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">BuildCost Connect</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pakistan's Construction Cost Intelligence &amp; Planning Platform. Engineered for accuracy, transparency, and effortless project budgeting.
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-3">Calculators</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/calculator/house-estimate" className="hover:text-[#059669]">Complete House Estimate</Link></li>
              <li><Link href="/calculator/concrete" className="hover:text-[#059669]">Concrete Slab &amp; Foundation</Link></li>
              <li><Link href="/calculator/brickwork" className="hover:text-[#059669]">9-Inch Brickwork &amp; Mortar</Link></li>
              <li><Link href="/calculator/steel" className="hover:text-[#059669]">Grade 60 Steel Rebar</Link></li>
              <li><Link href="/calculator/flooring" className="hover:text-[#059669]">Floor Tile &amp; Plaster</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-3">Live Market Rates</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/rates/materials" className="hover:text-[#059669]">Cement Rates (APCMA)</Link></li>
              <li><Link href="/rates/materials" className="hover:text-[#059669]">Steel Rebar Rates (PSRMA)</Link></li>
              <li><Link href="/rates/materials" className="hover:text-[#059669]">First Class Kiln Bricks</Link></li>
              <li><Link href="/labour" className="hover:text-[#059669]">Labour &amp; Mazdoor Rates</Link></li>
              <li><Link href="/rates/history" className="hover:text-[#059669]">Historical Rate Simulator</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100 mb-3">Civil Tools &amp; Updates</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/advisor" className="hover:text-[#059669]">AI Construction Advisor</Link></li>
              <li><Link href="/tools/converter" className="hover:text-[#059669]">Marla &amp; Lakh/Crore Converter</Link></li>
              <li><Link href="/boq" className="hover:text-[#059669]">Contractor BOQ Generator</Link></li>
              <li><Link href="/updates" className="text-[#059669] dark:text-emerald-400 font-semibold hover:underline">Project Updates &amp; What's New</Link></li>
              <li><Link href="/changelog" className="hover:text-[#059669]">Release Notes &amp; Changelog</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} BuildCost Connect (Pvt) Ltd. • <Link href="/updates" className="text-[#059669] font-bold hover:underline">v1.2.0</Link></div>
          <div className="flex items-center gap-5">
            <Link href="/updates" className="hover:text-slate-900 transition-colors">Release Notes</Link>
            <Link href="/changelog" className="hover:text-slate-900 transition-colors">Changelog</Link>
            <span>Pakistan Standard Specifications</span>
            <span>CDA / LDA / DHA Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
