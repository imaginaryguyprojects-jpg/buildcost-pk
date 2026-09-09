"use client";

import React from "react";
import Link from "next/link";
import { SmartEstimateWizard } from "@/components/home/SmartEstimateWizard";
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
  Lock
} from "lucide-react";
import { PAK_CITIES } from "@buildcost/config";
import { useAuthStore } from "@/stores/authStore";

export default function LandingPage() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  const scrollToWizard = () => {
    const el = document.getElementById("estimate-wizard");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Banner / Hero Header */}
      <header className="border-b border-slate-800/80 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">BuildCost Connect</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Pakistan Construction Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#estimate-wizard" className="hover:text-emerald-400 transition-colors">
              Smart Wizard
            </a>
            <Link href="/rates/materials" className="hover:text-emerald-400 transition-colors">
              Live Material Rates
            </Link>
            <Link href="/labour" className="hover:text-emerald-400 transition-colors">
              Labour Rates
            </Link>
            <Link href="/tools/converter" className="hover:text-emerald-400 transition-colors">
              Marla & Currency
            </Link>
            <Link href="/advisor" className="hover:text-emerald-400 transition-colors">
              AI Advisor
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openLoginModal()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all"
                >
                  Create Free Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Pakistani Homeowners, Contractors & Engineers
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Calculate Your Construction Cost <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              With Absolute Confidence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Estimate materials, labour, construction costs and BOQs using Pakistan-focused rates and transparent calculations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={scrollToWizard}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              Start Calculating — Free
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/rates/materials"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Explore Material Rates
            </Link>
          </div>

          <p className="text-[11px] text-slate-500 italic pt-1">
            "Transparent estimates based on configurable assumptions and available market data."
          </p>
        </div>
      </section>

      {/* SMART ESTIMATE WIZARD EMBED */}
      <section id="estimate-wizard" className="max-w-5xl mx-auto px-4 sm:px-6 w-full pb-16 relative z-10">
        <SmartEstimateWizard />
      </section>

      {/* VALUE PROPOSITION PILLARS */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">The Complete Platform</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              From First Estimate to Final Key Handover
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              BuildCost Connect goes far beyond simple online spreadsheets. It delivers institutional civil engineering rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Precise Civil Calculators</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculators for RCC concrete (1:2:4, 1:1.5:3), kiln-fired Awwal bricks with 1:6 mortar, Grade 60 steel rebar binding, plaster, flooring tiles, and weather-proof paints.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Institutional Rate Feeds</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct indices referencing APCMA (Cement), PSRMA (Steel), Pakistan Bureau of Statistics (PBS), and regional Bhatta kiln associations across 13 cities.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">BOQ & PDF Generator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click export of formal, contractor-ready Bill of Quantities (BOQ) with contingencies, client disclaimers, and secure cryptographically tokenized share links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CITY COVERAGE GRID */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Localized Intelligence</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Calibrated Across 13 Pakistani Cities
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Freight tariffs from Margalla vs Sargodha crush quarries, Chenab vs Ravi sand, and local Mistry / Mazdoor daily wages.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PAK_CITIES.map((c) => (
            <Link
              key={c.id}
              href={`/rates/materials?city=${c.id}`}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-center group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {c.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{c.province}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO & FEATURE LINKS FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                BC
              </div>
              <span className="font-extrabold text-sm text-white">BuildCost Connect</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pakistan's Construction Cost Intelligence & Planning Platform. Engineered for accuracy, transparency, and effortless project management.
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-200 mb-3">Calculators</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/calculator/house-estimate" className="hover:text-emerald-400">Complete House Estimate</Link></li>
              <li><Link href="/calculator/concrete" className="hover:text-emerald-400">Concrete Slab & Foundation</Link></li>
              <li><Link href="/calculator/brickwork" className="hover:text-emerald-400">9-Inch Brickwork & Mortar</Link></li>
              <li><Link href="/calculator/steel" className="hover:text-emerald-400">Grade 60 Steel Rebar</Link></li>
              <li><Link href="/calculator/flooring" className="hover:text-emerald-400">Floor Tile & Plaster</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-200 mb-3">Live Market Rates</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/rates/materials" className="hover:text-emerald-400">Cement Rates (APCMA)</Link></li>
              <li><Link href="/rates/materials" className="hover:text-emerald-400">Steel Rebar Rates (PSRMA)</Link></li>
              <li><Link href="/rates/materials" className="hover:text-emerald-400">First Class Kiln Bricks</Link></li>
              <li><Link href="/labour" className="hover:text-emerald-400">Labour & Mazdoor Rates</Link></li>
              <li><Link href="/rates/history" className="hover:text-emerald-400">Historical Rate Simulator</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-slate-200 mb-3">Civil Engineering Tools</div>
            <ul className="space-y-2 text-[11px]">
              <li><Link href="/advisor" className="hover:text-emerald-400">AI Construction Advisor</Link></li>
              <li><Link href="/rooms" className="hover:text-emerald-400">Room-by-Room Estimator</Link></li>
              <li><Link href="/tools/converter" className="hover:text-emerald-400">Marla Variants & Lakh/Crore</Link></li>
              <li><Link href="/boq" className="hover:text-emerald-400">Contractor BOQ Generator</Link></li>
              <li><Link href="/updates" className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"><span>Project Updates &amp; What's New</span></Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} BuildCost Connect (Pvt) Ltd. • <Link href="/updates" className="text-emerald-400 hover:underline font-semibold">v1.2.0</Link></div>
          <div className="flex items-center gap-6">
            <Link href="/updates" className="hover:text-slate-200 transition-colors">Release Notes</Link>
            <Link href="/changelog" className="hover:text-slate-200 transition-colors">Changelog</Link>
            <span>Pakistan Standard Specifications</span>
            <span>CDA / LDA / DHA Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
