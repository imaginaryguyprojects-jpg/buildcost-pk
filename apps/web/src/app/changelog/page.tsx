"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowLeft,
  Calculator,
  Layers,
  MapPin,
  Sliders,
  PieChart,
  ShieldCheck,
  Zap,
  Building,
  ArrowRight
} from "lucide-react";
import { APP_VERSION, APP_RELEASE_DATE } from "@buildcost/config";

interface ReleaseUpdate {
  version: string;
  date: string;
  badge?: string;
  highlights: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
}

const RELEASES: ReleaseUpdate[] = [
  {
    version: "v1.2.0",
    date: "September 2026",
    badge: "Current Production Release",
    highlights: [
      {
        title: "Hero Property Construction Calculator",
        description:
          "Redesigned the primary dashboard so any user gets an instant, accurate construction cost calculation within 5 seconds without navigating multiple sub-menus.",
        icon: Calculator
      },
      {
        title: "28 Major Pakistani Cities & Regional Markets",
        description:
          "Expanded city coverage from 13 to 28 major Pakistani cities across Punjab, Sindh, KPK, Balochistan, Federal, AJK, and Gilgit-Baltistan with localized civil benchmarks.",
        icon: MapPin
      },
      {
        title: "Multiple Marla Standards (272.25 / 250 / 225 & Custom)",
        description:
          "Full support for CDA/Islamabad (272.25 sq ft), Lahore (250 sq ft), Karachi (225 sq ft), and user-defined custom Marla measurements.",
        icon: Layers
      },
      {
        title: "Real-Time Area Conversion Summary Card",
        description:
          "Instant mathematical equivalence card converting between Marla, Kanal, and Square Feet dynamically as you type.",
        icon: Zap
      },
      {
        title: "Material Cost Breakdown Donut Chart",
        description:
          "Dynamic civil engineering percentage shares calculated in real-time for Cement, Steel, Bricks, Sand, Crush, Labour, Transport, and Wastage.",
        icon: PieChart
      },
      {
        title: "Custom / Manual Material Rates Panel",
        description:
          "Free on-screen customization of cement, steel, brick, sand, crush, and labour rates with immediate live recalculation and city benchmark comparisons.",
        icon: Sliders
      },
      {
        title: "Streamlined 5-Category Navigation",
        description:
          "Consolidated desktop sidebar and mobile drawer into 5 clean categories: Main, Estimation, Project, Reports, and Admin.",
        icon: Building
      }
    ]
  },
  {
    version: "v1.1.0",
    date: "September 2026",
    highlights: [
      {
        title: "Super Admin Platform Control Center",
        description:
          "Added platform control center with live telemetry, dynamic feature flags, payment review system, and account audit logs.",
        icon: ShieldCheck
      },
      {
        title: "Pakistan Manual Payment Gateway (EasyPaisa & JazzCash)",
        description:
          "Native manual payment slip upload with auto-calculated 18% GST and WhatsApp notification integration for instant upgrades.",
        icon: Zap
      },
      {
        title: "Contractor BOQ Studio & Site Diary",
        description:
          "Itemized Bill of Quantities generator with client PDF exports and digital daily site diary tracking.",
        icon: Layers
      }
    ]
  },
  {
    version: "v1.0.0",
    date: "August 2026",
    highlights: [
      {
        title: "Initial Production Launch",
        description:
          "Launched core construction calculators for RCC concrete, 9-inch brickwork, Grade 60 steel rebar, plaster, and flooring.",
        icon: Building
      },
      {
        title: "Supabase Authentication & Multi-Device Sync",
        description:
          "Secure cloud project storage, user profiles, and cross-device synchronization with offline fallback.",
        icon: ShieldCheck
      }
    ]
  }
];

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-16">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              v{APP_VERSION}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              BuildCost Pakistan
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-10">
        {/* Page Hero Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Release Notes &amp; Updates</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            BuildCost Pakistan Updates
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Follow the latest features, civil engineering engine refinements, and usability updates deployed to BuildCost Pakistan.
          </p>
        </div>

        {/* Releases Timeline */}
        <div className="space-y-8">
          {RELEASES.map((rel, idx) => (
            <article
              key={rel.version}
              className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden"
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              )}

              {/* Version & Date Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {rel.version}
                  </span>
                  {rel.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-[11px]">
                      {rel.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{rel.date}</span>
                </div>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rel.highlights.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.title}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-emerald-400">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-bold text-white leading-tight">
                          {feat.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pl-8">
                        {feat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA to Return to Calculator */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Experience the New Property Calculator</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculate construction costs across 28 Pakistani cities with live market rates.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0"
          >
            <span>Open Property Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
