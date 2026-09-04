"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PAKISTANI_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { Project, ConstructionQuality, ProjectType } from "@buildcost/types";
import { useProjectStore } from "@/stores/projectStore";

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjectStore();

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("residential");
  const [cityId, setCityId] = useState("isb");
  const [location, setLocation] = useState("");
  const [plotArea, setPlotArea] = useState<number>(5);
  const [plotUnit, setPlotUnit] = useState<"marla" | "kanal" | "sqft" | "sqyd">("marla");
  const [marlaStandardId, setMarlaStandardId] = useState("marla_225");
  const [coveredArea, setCoveredArea] = useState<number>(2200);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [constructionQuality, setConstructionQuality] = useState<ConstructionQuality>("standard");
  const [totalBudget, setTotalBudget] = useState<number>(12000000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProj: Project = {
      id: `proj_${Date.now()}`,
      userId: "usr_active",
      projectName: projectName || "New Project",
      clientName,
      projectType,
      cityId,
      location: location || "Islamabad",
      plotArea: Number(plotArea),
      plotUnit,
      marlaStandardId,
      coveredArea: Number(coveredArea),
      coveredAreaUnit: "sqft",
      numberOfFloors: Number(numberOfFloors),
      hasBasement: false,
      hasGroundFloor: true,
      hasRoof: true,
      constructionQuality,
      totalBudget: Number(totalBudget),
      status: "estimating",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };

    addProject(newProj);
    router.push(`/projects/${newProj.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Construction Project</h1>
          <p className="text-xs text-slate-400">
            Define plot dimensions, regional Marla standards, and target construction tier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Step 1: Basic Identity */}
        <div>
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>1. Project Identity</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. F-8 Contemporary Villa"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Client / Owner Name</label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="residential">Residential House</option>
                <option value="commercial">Commercial Building / Plaza</option>
                <option value="renovation">Renovation & Remodeling</option>
                <option value="addition">Floor Addition</option>
                <option value="industrial">Industrial Warehouse</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">City Market *</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {PAKISTANI_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.province})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Location / Sector / Housing Society *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sector B, Bahria Enclave, Islamabad"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Plot & Regional Standards */}
        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
            2. Plot & Marla Standard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Plot Area</label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={plotArea}
                onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Plot Unit</label>
              <select
                value={plotUnit}
                onChange={(e) => setPlotUnit(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqyd">Square Yards (Gazz)</option>
                <option value="sqft">Square Feet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Regional Marla Standard</label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {MARLA_STANDARDS.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Construction Dimensions & Tier */}
        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
            3. Construction Scope & Quality Tier
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Covered Area (Sq Ft) *</label>
              <input
                type="number"
                min="100"
                required
                value={coveredArea}
                onChange={(e) => setCoveredArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Number of Floors</label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={numberOfFloors}
                onChange={(e) => setNumberOfFloors(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Quality Specification Tier</label>
              <select
                value={constructionQuality}
                onChange={(e) => setConstructionQuality(e.target.value as ConstructionQuality)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="economy">Economy (Basic Finishes)</option>
                <option value="standard">Standard (Good Quality Grey + Finishes)</option>
                <option value="premium">Premium (Imported Fittings & Tiles)</option>
                <option value="luxury">Luxury (High-end Architecture & Smart Home)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Budget (PKR)</label>
              <input
                type="number"
                step="50000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex items-center justify-end gap-3">
          <Link
            href="/projects"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Create & Launch Workspace</span>
          </button>
        </div>
      </form>
    </div>
  );
}
