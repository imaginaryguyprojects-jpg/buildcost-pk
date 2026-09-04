"use client";

import React from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertCircle,
  Building,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { ChecklistStatus } from "@buildcost/types";

export default function ChecklistPage() {
  const { checklists, updateChecklistItemStatus, getActiveProject } = useProjectStore();
  const { showToast } = useAuthStore();
  const activeProject = getActiveProject();

  const total = checklists.length;
  const completed = checklists.filter((c) => c.status === "completed").length;
  const inProgress = checklists.filter((c) => c.status === "in_progress").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleStatusChange = (id: string, status: ChecklistStatus) => {
    updateChecklistItemStatus(id, status);
    showToast(`Checklist task updated to "${status.replace("_", " ")}"`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Site Construction Checklist
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard 12-stage Pakistani civil milestones from society approval to final key handover.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <Building className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Project: {activeProject?.projectName || "Residential Villa"}
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300">Overall Construction Progress</span>
            <div className="text-xs text-slate-400 mt-0.5">
              {completed} of {total} Milestones Finished • {inProgress} In Progress
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {progressPercent}%
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 12 Stages Checklist Items */}
      <div className="space-y-3">
        {checklists.map((item, idx) => {
          const isDone = item.status === "completed";
          const isInProgress = item.status === "in_progress";

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 ${
                isDone
                  ? "bg-slate-900/40 border-slate-800/60 opacity-80"
                  : isInProgress
                  ? "bg-slate-900 border-emerald-500/40 shadow-md"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {item.stage.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, "not_started")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      item.status === "not_started"
                        ? "bg-slate-800 text-slate-200 border border-slate-700"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Not Started
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, "in_progress")}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 ${
                      isInProgress
                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                        : "text-slate-500 hover:text-amber-400"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    In Progress
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, "completed")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                        : "text-slate-500 hover:text-emerald-400"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
