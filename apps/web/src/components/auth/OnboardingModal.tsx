"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { Sparkles, Home, Building, Wrench, Briefcase, Landmark, Calculator, ArrowRight, X } from "lucide-react";
import { PAK_CITIES, MARLA_STANDARDS } from "@buildcost/config";

const USE_CASES = [
  { id: "house", label: "Building a House", icon: Home, desc: "Personal plot construction (5/10 Marla, 1 Kanal)" },
  { id: "contractor", label: "Contractor Work", icon: Briefcase, desc: "Managing multiple client sites & BOQs" },
  { id: "renovation", label: "Renovation / Addition", icon: Wrench, desc: "Flooring, paint, grey structure remodeling" },
  { id: "commercial", label: "Commercial Project", icon: Building, desc: "Plaza, shop, or industrial development" },
  { id: "surveyor", label: "Quantity Surveying", icon: Calculator, desc: "Material estimations & engineering rates" },
  { id: "investment", label: "Property Investment", icon: Landmark, desc: "Feasibility studies & resale margin planning" }
];

export function OnboardingModal() {
  const { onboardingModalOpen, closeOnboardingModal, completeOnboarding } = useAuthStore();
  const { setSelectedCityId, setMarlaStandardId } = useProjectStore();

  const [selectedRole, setSelectedRole] = useState("house");
  const [cityId, setCityId] = useState("isb");
  const [marlaStandard, setMarlaStandard] = useState("marla_225");
  const [quality, setQuality] = useState("standard");

  if (!onboardingModalOpen) return null;

  const handleComplete = () => {
    setSelectedCityId(cityId);
    setMarlaStandardId(marlaStandard);
    completeOnboarding({
      role: selectedRole,
      cityId,
      areaUnit: "marla",
      quality
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeOnboardingModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Personalize Your BuildCost Experience</h2>
          <p className="text-xs text-slate-400">
            Tell us about your project so we can pre-calibrate your material rates and municipal bylaws.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Use Case */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2.5">
              What are you using BuildCost Connect for?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                const isSelected = selectedRole === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => setSelectedRole(uc.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{uc.label}</div>
                      <div className="text-[10px] text-slate-400 leading-snug mt-0.5">{uc.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. City & Marla standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Preferred Construction City</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {PAK_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Regional Marla Standard</label>
              <select
                value={marlaStandard}
                onChange={(e) => setMarlaStandard(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {MARLA_STANDARDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.sqft} Sq. Ft.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Preferred Quality */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Default Construction Quality</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "economy", label: "Economy", desc: "Basic finishes" },
                { id: "standard", label: "Standard", desc: "A-Class brick" },
                { id: "premium", label: "Premium", desc: "Granite & teak" },
                { id: "luxury", label: "Luxury", desc: "Imported fixtures" }
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuality(q.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    quality === q.id
                      ? "bg-emerald-950/50 border-emerald-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{q.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{q.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeOnboardingModal}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium px-4 py-2"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleComplete}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
