"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Building2, MapPin, Layers, Calendar, ChevronRight } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatLakhCrore, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/stores/authStore";
import { isWithinPlanLimit, PLAN_LIMITS } from "@buildcost/config";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, activeProjectId, setActiveProjectId } = useProjectStore();
  const { user, openUpgradeModal } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const canCreateProject = isWithinPlanLimit(user?.plan, "maxProjects", projects.length);
  const maxAllowed = PLAN_LIMITS[(user?.plan as "free" | "pro" | "business") || "free"]?.maxProjects || 3;

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!canCreateProject) {
      e.preventDefault();
      openUpgradeModal(`Project limit reached (${projects.length}/${maxAllowed}). Upgrade for Unlimited Projects`);
    } else {
      router.push("/projects/new");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Construction Projects</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your residential and commercial estimation workspaces ({projects.length}/{maxAllowed} projects used)
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["all", "planning", "estimating", "under_construction", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors",
                statusFilter === st
                  ? "bg-emerald-600 text-white font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              )}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;

          return (
            <div
              key={project.id}
              className={cn(
                "bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all",
                isActive
                  ? "border-emerald-500/80 ring-1 ring-emerald-500/40"
                  : "border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base leading-snug">
                        {project.projectName}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                        {project.projectType} • {project.constructionQuality} Tier
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                    {project.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 py-3 border-y border-slate-100 dark:border-slate-800/80 my-3">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Covered Area</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatNumber(project.coveredArea)} sqft (G+{project.numberOfFloors - 1})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target Budget</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatLakhCrore(project.totalBudget || 0)}
                    </span>
                  </div>
                </div>
              </div>

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
    </div>
  );
}
