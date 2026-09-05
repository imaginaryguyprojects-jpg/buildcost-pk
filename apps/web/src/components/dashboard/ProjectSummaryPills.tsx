"use client";

import React from "react";
import { Project } from "@buildcost/types";
import { formatNumber } from "@/lib/formatters";

interface ProjectSummaryPillsProps {
  project?: Project;
}

export function ProjectSummaryPills({ project }: ProjectSummaryPillsProps) {
  const p = project || {
    projectName: "Buildify Tower",
    location: "Central Business District",
    coveredArea: 15500,
    coveredAreaUnit: "sqft",
    numberOfFloors: 13
  };

  const floorLabel = p.numberOfFloors > 1 ? `G+${p.numberOfFloors - 1}` : "Ground Floor Only";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Pill 1: Project Name */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Project Name</span>
        <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 truncate block">
          {p.projectName}
        </span>
      </div>

      {/* Pill 2: Location */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Location</span>
        <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 truncate block">
          {p.location}
        </span>
      </div>

      {/* Pill 3: Total Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Total Area</span>
        <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 font-mono block">
          {formatNumber(p.coveredArea)} {p.coveredAreaUnit || "sqft"}
        </span>
      </div>

      {/* Pill 4: No. of Floors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">No. of Floors</span>
        <span className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 block">
          {floorLabel}
        </span>
      </div>
    </div>
  );
}
