"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Sparkles,
  Layers,
  Ruler,
  Calendar,
  Wallet,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { PAKISTANI_CITIES, MARLA_STANDARDS, AreaUnit } from "@buildcost/config";
import { Project, ConstructionQuality, ProjectType } from "@buildcost/types";
import { ProjectCreateSchema } from "@buildcost/validation";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";

export default function NewProjectPage() {
  const router = useRouter();
  const { projects, addProject } = useProjectStore();
  const { user, openProjectUpgradeModal, showToast } = useAuthStore();
  const { freeProjectLimit } = useSystemSettingsStore();

  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";
  const activeProjectsCount = projects.filter((p) => !p.archivedAt).length;

  // Form State
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientWhatsApp, setClientWhatsApp] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(`BC-${Date.now().toString().slice(-6)}`);
  const [projectType, setProjectType] = useState<ProjectType>("residential");
  const [cityId, setCityId] = useState("isb");
  const [society, setSociety] = useState("");
  const [location, setLocation] = useState("");

  // Plot & Specs
  const [plotArea, setPlotArea] = useState<number>(5);
  const [plotUnit, setPlotUnit] = useState<AreaUnit>("marla");
  const [marlaStandardId, setMarlaStandardId] = useState("marla_225");
  const [plotFront, setPlotFront] = useState<number | undefined>(25);
  const [plotDepth, setPlotDepth] = useState<number | undefined>(45);

  // Construction Dimensions
  const [coveredArea, setCoveredArea] = useState<number>(2200);
  const [numberOfFloors, setNumberOfFloors] = useState<number>(2);
  const [constructionQuality, setConstructionQuality] = useState<ConstructionQuality>("standard");
  const [buildingHeight, setBuildingHeight] = useState<number | undefined>(24);
  const [plinthHeight, setPlinthHeight] = useState<number | undefined>(3);
  const [clearCeilingHeight, setClearCeilingHeight] = useState<number | undefined>(10.5);
  const [slabThickness, setSlabThickness] = useState<number | undefined>(6);

  // Financial & Schedule
  const [totalBudget, setTotalBudget] = useState<number>(12500000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedCompletion, setExpectedCompletion] = useState("");
  const [notes, setNotes] = useState("");

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro && activeProjectsCount >= freeProjectLimit) {
      openProjectUpgradeModal();
      return;
    }

    const payload = {
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
      coveredAreaUnit: "sqft" as AreaUnit,
      numberOfFloors: Number(numberOfFloors),
      hasBasement: false,
      hasGroundFloor: true,
      hasRoof: true,
      constructionQuality,
      buildingHeight: buildingHeight ? Number(buildingHeight) : undefined,
      plinthHeight: plinthHeight ? Number(plinthHeight) : undefined,
      clearCeilingHeight: clearCeilingHeight ? Number(clearCeilingHeight) : undefined,
      slabThickness: slabThickness ? Number(slabThickness) : undefined,
      totalBudget: Number(totalBudget),
      startDate,
      expectedCompletion: expectedCompletion || undefined,
      notes: notes.trim(),
      status: "planning" as const
    };

    // Zod validation (Section 3)
    const result = ProjectCreateSchema.safeParse(payload);
    if (!result.success) {
      setValidationErrors(result.error.flatten().fieldErrors);
      showToast("Please correct the form fields.", "error");
      return;
    }

    const projectId = `proj_${Date.now()}`;
    const newProject: Project = {
      ...payload,
      id: projectId,
      userId: user?.id || "usr_active",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      archivedAt: null
    };

    // Save to local store
    addProject(newProject);

    // Call server API for persistence & RLS sync (Section 3 & 17)
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-plan": user?.plan || "pro"
        },
        body: JSON.stringify(payload)
      });
    } catch {
      // Local fallback active
    }

    // Analytics event: project_created (Section 3)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("project_created", { detail: { projectId, projectName } }));
    }

    showToast(`Project "${projectName}" created successfully!`, "success");
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Construction Project
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure plot specifications, municipal bylaw dimensions, structural depths, and target capital budget
          </p>
        </div>
      </div>

      {!isPro && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <strong>Project Management is a PRO feature.</strong> Upgrade to PRO to save, manage, edit and track your construction projects.
            </div>
          </div>
          <button
            onClick={openProjectUpgradeModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
          >
            Upgrade to PRO
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: Project & Client Identity */}
        <div>
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>1. Project &amp; Client Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Modern Villa Sector G-13"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              {validationErrors.projectName && (
                <span className="text-[11px] text-rose-500 mt-1 block">{validationErrors.projectName[0]}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Project Reference Number
              </label>
              <input
                type="text"
                placeholder="e.g. BC-2026-001"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client / Owner Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ch. Mohammad Tariq"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client Contact / Phone
              </label>
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client WhatsApp (for instant reports)
              </label>
              <input
                type="text"
                placeholder="e.g. 0345-5074541"
                value={clientWhatsApp}
                onChange={(e) => setClientWhatsApp(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Project Category
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="residential">Residential House</option>
                <option value="commercial">Commercial Building / Plaza</option>
                <option value="renovation">Renovation &amp; Remodeling</option>
                <option value="addition">Floor Addition</option>
                <option value="industrial">Industrial Shed / Warehouse</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                City Construction Market *
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
                Housing Society / Authority
              </label>
              <input
                type="text"
                placeholder="e.g. DHA Phase 6, Bahria Town, CDA"
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
                placeholder="e.g. Street 14, Sector B, Bahria Enclave, Islamabad"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Plot Specifications & Dimensions */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <span>2. Plot Dimensions &amp; Marla Standard</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Plot Area *
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
                <option value="sqyd">Square Yards (Gazz)</option>
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
                Plot Front (ft)
              </label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={plotFront || ""}
                onChange={(e) => setPlotFront(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Plot Depth (ft)
              </label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={plotDepth || ""}
                onChange={(e) => setPlotDepth(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Structural Dimensions & Quality Tier */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Structural Scope &amp; Quality Tier</span>
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
                Quality Tier Specification
              </label>
              <select
                value={constructionQuality}
                onChange={(e) => setConstructionQuality(e.target.value as ConstructionQuality)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="economy">Economy (Essential Finishes)</option>
                <option value="standard">Standard (A-Category Grey + Standard Finishes)</option>
                <option value="premium">Premium (Imported Tiles &amp; Grohe/Porta)</option>
                <option value="luxury">Luxury (Architectural Marble &amp; Smart Home)</option>
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

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Plinth Height (ft)
              </label>
              <input
                type="number"
                step="0.5"
                value={plinthHeight || ""}
                onChange={(e) => setPlinthHeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                RCC Slab Thickness (in)
              </label>
              <input
                type="number"
                step="0.5"
                value={slabThickness || ""}
                onChange={(e) => setSlabThickness(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Building Height (ft)
              </label>
              <input
                type="number"
                step="1"
                value={buildingHeight || ""}
                onChange={(e) => setBuildingHeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Budget, Schedule & Notes */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>4. Financial Budget &amp; Project Schedule</span>
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Site Start Date
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
                Expected Completion Date
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
                Engineering Notes &amp; Special Client Instructions
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Basement waterproofing required, high-tensile Grade 60 de-formed steel to be inspected before pour..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Submit Buttons */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex items-center justify-end gap-3">
          <Link
            href="/projects"
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Create &amp; Launch Project Workspace</span>
          </button>
        </div>
      </form>
    </div>
  );
}
