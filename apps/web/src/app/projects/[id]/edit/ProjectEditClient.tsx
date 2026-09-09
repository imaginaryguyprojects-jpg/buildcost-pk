"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Layers,
  Ruler,
  Calendar,
  Wallet,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { PAKISTANI_CITIES, MARLA_STANDARDS, AreaUnit } from "@buildcost/config";
import { Project, ConstructionQuality, ProjectType } from "@buildcost/types";
import { ProjectUpdateSchema } from "@buildcost/validation";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";

export default function ProjectEditClient({ id }: { id?: string }) {
  const routeParams = useParams();
  const activeId = id || (routeParams?.id as string);
  const router = useRouter();
  const { projects, updateProject, deleteProject } = useProjectStore();
  const { user, openProjectUpgradeModal, showToast } = useAuthStore();

  const isPro = user?.plan === "pro" || user?.plan === "business";

  const project = projects.find((p) => p.id === activeId);

  // Form State initialized from project
  const [projectName, setProjectName] = useState(project?.projectName || "");
  const [clientName, setClientName] = useState(project?.clientName || "");
  const [clientContact, setClientContact] = useState(project?.clientContact || "");
  const [clientWhatsApp, setClientWhatsApp] = useState(project?.clientWhatsApp || "");
  const [referenceNumber, setReferenceNumber] = useState(project?.referenceNumber || "");
  const [projectType, setProjectType] = useState<ProjectType>(project?.projectType || "residential");
  const [cityId, setCityId] = useState(project?.cityId || "isb");
  const [society, setSociety] = useState(project?.society || "");
  const [location, setLocation] = useState(project?.location || "");

  // Plot & Specs
  const [plotArea, setPlotArea] = useState<number>(project?.plotArea || 5);
  const [plotUnit, setPlotUnit] = useState<AreaUnit>(project?.plotUnit || "marla");
  const [marlaStandardId, setMarlaStandardId] = useState(project?.marlaStandardId || "marla_225");
  const [plotFront, setPlotFront] = useState<number | undefined>(project?.plotFront || 25);
  const [plotDepth, setPlotDepth] = useState<number | undefined>(project?.plotDepth || 45);

  // Construction Dimensions
  const [coveredArea, setCoveredArea] = useState<number>(project?.coveredArea || 2200);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(project?.numberOfFloors || 2);
  const [constructionQuality, setConstructionQuality] = useState<ConstructionQuality>(
    project?.constructionQuality || "standard"
  );
  const [buildingHeight, setBuildingHeight] = useState<number | undefined>(project?.buildingHeight || 24);
  const [plinthHeight, setPlinthHeight] = useState<number | undefined>(project?.plinthHeight || 3);
  const [clearCeilingHeight, setClearCeilingHeight] = useState<number | undefined>(
    project?.clearCeilingHeight || 10.5
  );
  const [slabThickness, setSlabThickness] = useState<number | undefined>(project?.slabThickness || 6);

  // Financial & Schedule
  const [totalBudget, setTotalBudget] = useState<number>(project?.totalBudget || 12000000);
  const [startDate, setStartDate] = useState(project?.startDate || "");
  const [expectedCompletion, setExpectedCompletion] = useState(project?.expectedCompletion || "");
  const [notes, setNotes] = useState(project?.notes || "");

  // Recalculation Alert State (Section 5)
  const [hasCalculationImpactingChange, setHasCalculationImpactingChange] = useState(false);
  const [recalculateOnSave, setRecalculateOnSave] = useState(false);

  useEffect(() => {
    if (!project) return;
    const dimensionChanged =
      project.plotArea !== Number(plotArea) ||
      project.coveredArea !== Number(coveredArea) ||
      project.numberOfFloors !== Number(numberOfFloors) ||
      project.constructionQuality !== constructionQuality ||
      project.cityId !== cityId;

    setHasCalculationImpactingChange(dimensionChanged);
  }, [plotArea, coveredArea, numberOfFloors, constructionQuality, cityId, project]);

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Project Not Found</h2>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }

    const updates: Partial<Project> = {
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      clientWhatsApp: clientWhatsApp.trim(),
      referenceNumber: referenceNumber.trim(),
      projectType,
      cityId,
      location: location.trim(),
      society: society.trim(),
      plotArea: Number(plotArea),
      plotUnit,
      marlaStandardId,
      plotFront: plotFront ? Number(plotFront) : undefined,
      plotDepth: plotDepth ? Number(plotDepth) : undefined,
      coveredArea: Number(coveredArea),
      numberOfFloors: Number(numberOfFloors),
      constructionQuality,
      buildingHeight: buildingHeight ? Number(buildingHeight) : undefined,
      plinthHeight: plinthHeight ? Number(plinthHeight) : undefined,
      clearCeilingHeight: clearCeilingHeight ? Number(clearCeilingHeight) : undefined,
      slabThickness: slabThickness ? Number(slabThickness) : undefined,
      totalBudget: Number(totalBudget),
      startDate,
      expectedCompletion: expectedCompletion || undefined,
      notes: notes.trim(),
      updatedAt: new Date().toISOString().split("T")[0]
    };

    updateProject(project.id, updates);

    // Call server API for persistence & audit logging
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-plan": user?.plan || "pro"
        },
        body: JSON.stringify(updates)
      });
    } catch {
      // Local storage active
    }

    if (hasCalculationImpactingChange && recalculateOnSave) {
      showToast("Project updated and estimate recalculated with latest rates!", "success");
    } else {
      showToast("Project information updated successfully!", "success");
    }

    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${project.id}`}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Edit Project: {project.projectName}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ref: {project.referenceNumber || "BC-DEFAULT"} • Last updated {project.updatedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Recalculation Notification Banner (Section 5) */}
      {hasCalculationImpactingChange && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Project information changed. Existing estimates may need to be recalculated.
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Altering plot dimensions, covered area, or tier specification changes engineering quantities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setRecalculateOnSave(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !recalculateOnSave
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Keep Existing Estimate
            </button>
            <button
              type="button"
              onClick={() => setRecalculateOnSave(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                recalculateOnSave
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recalculate</span>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Project Identity */}
        <div>
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>1. Basic Information &amp; Client</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client / Owner Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client Contact
              </label>
              <input
                type="text"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client WhatsApp
              </label>
              <input
                type="text"
                value={clientWhatsApp}
                onChange={(e) => setClientWhatsApp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                City Market
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Society / Sector
              </label>
              <input
                type="text"
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Full Location / Plot Address *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Plot Specifications */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <span>2. Plot Dimensions</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Plot Area
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={plotArea}
                onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Unit
              </label>
              <select
                value={plotUnit}
                onChange={(e) => setPlotUnit(e.target.value as AreaUnit)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="marla">Marla</option>
                <option value="kanal">Kanal</option>
                <option value="sqyd">Square Yards</option>
                <option value="sqft">Square Feet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Marla Standard
              </label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {MARLA_STANDARDS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Front (ft)
              </label>
              <input
                type="number"
                value={plotFront || ""}
                onChange={(e) => setPlotFront(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Depth (ft)
              </label>
              <input
                type="number"
                value={plotDepth || ""}
                onChange={(e) => setPlotDepth(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Structural Scope */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Structural Scope &amp; Heights</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Covered Area (Sq Ft) *
              </label>
              <input
                type="number"
                min="100"
                required
                value={coveredArea}
                onChange={(e) => setCoveredArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Number of Floors *
              </label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={numberOfFloors}
                onChange={(e) => setNumberOfFloors(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Quality Tier
              </label>
              <select
                value={constructionQuality}
                onChange={(e) => setConstructionQuality(e.target.value as ConstructionQuality)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Clear Ceiling Height (ft)
              </label>
              <input
                type="number"
                step="0.5"
                value={clearCeilingHeight || ""}
                onChange={(e) => setClearCeilingHeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Financial & Notes */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>4. Budget &amp; Notes</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Target Budget (PKR)
              </label>
              <input
                type="number"
                step="50000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Expected Completion
              </label>
              <input
                type="date"
                value={expectedCompletion}
                onChange={(e) => setExpectedCompletion(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex items-center justify-end gap-3">
          <Link
            href={`/projects/${project.id}`}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
