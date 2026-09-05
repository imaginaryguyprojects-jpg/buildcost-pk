"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Layers,
  Calendar,
  ChevronRight,
  MoreVertical,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit3,
  Eye,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  X
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { Project, ProjectStatus } from "@buildcost/types";

export default function ProjectsPage() {
  const router = useRouter();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    deleteProject,
    archiveProject,
    restoreProject,
    duplicateProject
  } = useProjectStore();
  const { user, openProjectUpgradeModal, showToast } = useAuthStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [floorsFilter, setFloorsFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated_desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Entitlement check
  const isPro = user?.plan === "pro" || user?.plan === "business";

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isPro) {
      e.preventDefault();
      openProjectUpgradeModal();
    } else {
      router.push("/projects/new");
    }
  };

  const handleDuplicate = (project: Project) => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    const cloned = duplicateProject(project.id);
    if (cloned) {
      showToast(`Duplicated as "${cloned.projectName}"`, "success");
    }
    setActionMenuOpenId(null);
  };

  const handleArchive = (project: Project) => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    archiveProject(project.id);
    showToast(`Project "${project.projectName}" moved to archive`, "info");
    setActionMenuOpenId(null);
  };

  const handleRestore = (project: Project) => {
    if (!isPro) {
      openProjectUpgradeModal();
      return;
    }
    restoreProject(project.id);
    showToast(`Project "${project.projectName}" restored to active`, "success");
    setActionMenuOpenId(null);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete.id);
    showToast(`Project "${projectToDelete.projectName}" permanently deleted`, "error");
    setProjectToDelete(null);
  };

  // Filter and Sort Pipeline
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Status filter
    if (statusFilter === "archived") {
      result = result.filter((p) => p.status === "archived");
    } else if (statusFilter === "all") {
      // By default, hide archived projects in "all" view
      result = result.filter((p) => p.status !== "archived");
    } else {
      result = result.filter((p) => p.status === statusFilter);
    }

    // City filter
    if (cityFilter !== "all") {
      result = result.filter((p) => p.cityId === cityFilter);
    }

    // Floors filter
    if (floorsFilter !== "all") {
      result = result.filter((p) => p.numberOfFloors === parseInt(floorsFilter));
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        return (
          p.projectName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          (p.society && p.society.toLowerCase().includes(q)) ||
          (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.projectName.localeCompare(b.projectName);
        case "name_desc":
          return b.projectName.localeCompare(a.projectName);
        case "budget_desc":
          return (b.totalBudget || 0) - (a.totalBudget || 0);
        case "budget_asc":
          return (a.totalBudget || 0) - (b.totalBudget || 0);
        case "covered_desc":
          return b.coveredArea - a.coveredArea;
        case "created_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated_desc":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [projects, statusFilter, cityFilter, floorsFilter, search, sortBy]);

  const activeCount = projects.filter((p) => p.status !== "archived").length;
  const archivedCount = projects.filter((p) => p.status === "archived").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Construction Projects
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              PRO Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise construction workspace • {activeCount} Active • {archivedCount} Archived
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View toggle */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Grid Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project, client, society, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Sorting & City Filter */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* City filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Cities</option>
              {PAKISTANI_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Floors filter */}
            <select
              value={floorsFilter}
              onChange={(e) => setFloorsFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Floors</option>
              <option value="1">Single Storey (1)</option>
              <option value="2">Double Storey (2)</option>
              <option value="3">Triple Storey (3)</option>
              <option value="4">4+ Floors</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs focus:outline-none cursor-pointer"
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="created_desc">Recently Created</option>
                <option value="name_asc">Project Name (A-Z)</option>
                <option value="budget_desc">Highest Budget</option>
                <option value="budget_asc">Lowest Budget</option>
                <option value="covered_desc">Largest Area</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {[
            { id: "all", label: "Active Projects" },
            { id: "planning", label: "Planning" },
            { id: "estimating", label: "Estimating" },
            { id: "under_construction", label: "Under Construction" },
            { id: "completed", label: "Completed" },
            { id: "on_hold", label: "On Hold" },
            { id: "archived", label: `Archived (${archivedCount})` }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors",
                statusFilter === st.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No projects found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {search || statusFilter !== "all"
              ? "No construction projects matched your filter criteria. Try resetting filters."
              : "Create your first professional construction project to start tracking civil estimates, BOQs, materials, and expenses."}
          </p>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>
      )}

      {/* View Mode: Grid Cards */}
      {viewMode === "grid" && filteredAndSortedProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedProjects.map((project) => {
            const isActive = project.id === activeProjectId;
            const isArchived = project.status === "archived";

            return (
              <div
                key={project.id}
                className={cn(
                  "bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all relative group",
                  isActive
                    ? "border-emerald-500/80 ring-1 ring-emerald-500/40"
                    : "border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div>
                  {/* Top Bar with Project Status and 3-Dot Action Menu */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base leading-snug truncate">
                          {project.projectName}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize block truncate">
                          {project.clientName ? `${project.clientName} • ` : ""}
                          {project.projectType} • {project.constructionQuality} Tier
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border",
                          isArchived
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {project.status.replace("_", " ")}
                      </span>

                      {/* 3-Dot Action Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActionMenuOpenId(
                              actionMenuOpenId === project.id ? null : project.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuOpenId === project.id && (
                          <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              onClick={() => setActionMenuOpenId(null)}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Overview</span>
                            </Link>

                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              onClick={() => setActionMenuOpenId(null)}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Project</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(project)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Duplicate Project</span>
                            </button>

                            {isArchived ? (
                              <button
                                type="button"
                                onClick={() => handleRestore(project)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore Project</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleArchive(project)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors text-left"
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>Archive Project</span>
                              </button>
                            )}

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setProjectToDelete(project);
                                setActionMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Project</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata rows */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 py-3 border-y border-slate-100 dark:border-slate-800/80 my-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {project.society ? `${project.society}, ` : ""}
                        {project.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Plot & Covered</span>
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {project.plotArea} {project.plotUnit} • {formatNumber(project.coveredArea)} sqft
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target Budget</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatLakhCrore(project.totalBudget || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveProjectId(project.id)}
                    className={cn(
                      "text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                      isActive
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
                    )}
                  >
                    {isActive ? "Active in Dashboard" : "Set Active"}
                  </button>

                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>Open Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode: Table View */}
      {viewMode === "table" && filteredAndSortedProjects.length > 0 && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Project / Client</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Plot & Covered</th>
                  <th className="p-4">Floors</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredAndSortedProjects.map((project) => {
                  const isArchived = project.status === "archived";

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 block"
                        >
                          {project.projectName}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          {project.clientName || "Private"} • {project.constructionQuality} Tier
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {project.society ? `${project.society}, ` : ""}
                        {project.location}
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {project.plotArea} {project.plotUnit}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {formatNumber(project.coveredArea)} sqft
                        </span>
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        G+{project.numberOfFloors - 1} ({project.numberOfFloors} fl)
                      </td>

                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatLakhCrore(project.totalBudget || 0)}
                      </td>

                      <td className="p-4">
                        <span
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border",
                            isArchived
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors font-medium"
                          >
                            View
                          </Link>
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Section 6 & 20) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Project?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This will permanently remove <strong>&ldquo;{projectToDelete.projectName}&rdquo;</strong> and its
                associated project data. This action cannot be undone.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              Tip: You can also choose to <strong>Archive</strong> this project to hide it while preserving all historical expenses and purchase orders.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 transition-all"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
