"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { SiteDiaryEntry } from "@buildcost/types";
import {
  BookOpen,
  Plus,
  Sun,
  Cloud,
  CloudRain,
  Flame,
  Snowflake,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PackageCheck,
  Camera,
  X,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const WEATHER_ICONS: Record<SiteDiaryEntry["weather"], { label: string; icon: React.ElementType; color: string }> = {
  sunny: { label: "Sunny (دھوپ)", icon: Sun, color: "text-amber-500" },
  cloudy: { label: "Cloudy (ابر آلود)", icon: Cloud, color: "text-slate-400" },
  rainy: { label: "Rainy (بارش)", icon: CloudRain, color: "text-blue-500" },
  hot: { label: "Extreme Heat (شدید گرمی)", icon: Flame, color: "text-rose-500" },
  cold: { label: "Cold (سردی)", icon: Snowflake, color: "text-cyan-500" }
};

export default function SiteDiaryPage() {
  const { siteDiary, projects, addSiteDiaryEntry, activeProjectId } = useProjectStore();
  const { notify } = useAuthStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects[0]?.id || "all");

  // Form state
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || "");
  const [weather, setWeather] = useState<SiteDiaryEntry["weather"]>("sunny");
  const [workersPresent, setWorkersPresent] = useState(8);
  const [workCompleted, setWorkCompleted] = useState("");
  const [materialsReceived, setMaterialsReceived] = useState("");
  const [issues, setIssues] = useState("");
  const [notes, setNotes] = useState("");

  const filteredEntries = siteDiary.filter((entry) => {
    if (selectedProjectId !== "all" && entry.projectId !== selectedProjectId) return false;
    return true;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workCompleted.trim()) {
      notify("Please describe work completed today.", "error");
      return;
    }

    addSiteDiaryEntry({
      projectId: projectId || projects[0]?.id || "proj_1",
      logDate,
      weather,
      workersPresent,
      workCompleted: workCompleted.trim(),
      materialsReceived: materialsReceived.trim() || undefined,
      issues: issues.trim() || undefined,
      notes: notes.trim() || undefined
    });

    notify("Site diary log saved successfully.", "success");
    setAddModalOpen(false);
    setWorkCompleted("");
    setMaterialsReceived("");
    setIssues("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Daily Construction Site Diary
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Official daily progress journal: weather condition, worker attendance, work executed, site issues &amp; deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Daily Entry</span>
          </button>
        </div>
      </div>

      {/* Diary Timeline Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No site diary logs recorded yet</div>
            <p className="text-xs text-slate-400 mt-1">Record daily labor count, weather, and construction progress milestones.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const project = projects.find((p) => p.id === entry.projectId);
            const WeatherConfig = WEATHER_ICONS[entry.weather] || WEATHER_ICONS.sunny;
            const WeatherIcon = WeatherConfig.icon;

            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Entry Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{entry.logDate}</span>
                    </div>
                    {project && (
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {project.projectName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Weather */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <WeatherIcon className={cn("w-3.5 h-3.5", WeatherConfig.color)} />
                      <span>{WeatherConfig.label.split(" ")[0]}</span>
                    </div>

                    {/* Workers Count */}
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5" />
                      <span>{entry.workersPresent} Workers</span>
                    </div>
                  </div>
                </div>

                {/* Work Completed */}
                <div className="space-y-2 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                      Work Completed:
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {entry.workCompleted}
                    </p>
                  </div>

                  {/* Materials Received */}
                  {entry.materialsReceived && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                      <PackageCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <div>
                        <span className="font-bold">Materials Delivered: </span>
                        <span>{entry.materialsReceived}</span>
                      </div>
                    </div>
                  )}

                  {/* Site Issues / Delays */}
                  {entry.issues && (
                    <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-2 text-rose-800 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <span className="font-bold">Delays / Issues: </span>
                        <span>{entry.issues}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Entry Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Record Daily Site Diary Log
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Log Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Site Weather
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="sunny">Sunny (دھوپ)</option>
                    <option value="cloudy">Cloudy (ابر آلود)</option>
                    <option value="rainy">Rainy (بارش)</option>
                    <option value="hot">Extreme Heat (شدید گرمی)</option>
                    <option value="cold">Cold (سردی)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Workers Present (حاضری) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={workersPresent}
                    onChange={(e) => setWorkersPresent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Completed Today *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Completed boundary wall brickwork. Installed electrical conduits for 1st floor roof slab casting."
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Materials Received on Site
                </label>
                <input
                  type="text"
                  placeholder="e.g. 150 bags Bestway cement, 2 trolleys Chenab sand"
                  value={materialsReceived}
                  onChange={(e) => setMaterialsReceived(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delays, Rain or Site Obstacles
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rain delayed concreting by 3 hours, electricity feeder trip"
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
