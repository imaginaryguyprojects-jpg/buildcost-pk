"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { SiteDiaryEntry, SitePhoto } from "@buildcost/types";
import { GeoPhotoUploadModal } from "@/components/diary/GeoPhotoUploadModal";
import { VoiceDiaryRecorder, ParsedDiaryData } from "@/components/diary/VoiceDiaryRecorder";
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
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  ImageIcon,
  Mic,
  Share2,
  Trash2,
  Sparkles,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const WEATHER_ICONS: Record<SiteDiaryEntry["weather"], { label: string; icon: React.ElementType; color: string }> = {
  sunny: { label: "Sunny (دھوپ)", icon: Sun, color: "text-amber-500" },
  cloudy: { label: "Cloudy (ابر آلود)", icon: Cloud, color: "text-slate-400" },
  rainy: { label: "Rainy (بارش)", icon: CloudRain, color: "text-blue-500" },
  hot: { label: "Extreme Heat (شدید گرمی)", icon: Flame, color: "text-rose-500" },
  cold: { label: "Cold (سردی)", icon: Snowflake, color: "text-cyan-500" }
};

const STAGE_LABELS: Record<string, string> = {
  excavation: "Excavation (کھدائی)",
  foundation: "Foundation (بنیاد)",
  columns: "Columns & Plinth (ستون)",
  shuttering: "Slab Shuttering (شٹرنگ)",
  slab: "Slab Pouring (چھت ڈھلائی)",
  brickwork: "Brick Masonry (چنائی)",
  plaster: "Plaster & Conduits (پلستر)",
  finishing: "Finishing & Tile (فنشنگ)",
  other: "General Site (عام سائٹ)"
};

export default function SiteDiaryPage() {
  const { siteDiary, projects, addSiteDiaryEntry, addPhotoToDiaryEntry, deleteSiteDiaryEntry, activeProjectId } = useProjectStore();
  const { notify } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"diary" | "photos">("diary");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [geoModalOpen, setGeoModalOpen] = useState(false);
  const [targetEntryIdForPhoto, setTargetEntryIdForPhoto] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects[0]?.id || "all");
  const [stageFilter, setStageFilter] = useState<string>("all");

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

  // Extract all photos across entries for the Remote Timeline tab
  const allPhotos: { photo: SitePhoto; entry: SiteDiaryEntry; projectName: string }[] = [];
  filteredEntries.forEach((entry) => {
    const proj = projects.find((p) => p.id === entry.projectId);
    const pName = proj ? proj.projectName : "Site Project";

    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((ph) => {
        if (stageFilter === "all" || ph.stage === stageFilter) {
          allPhotos.push({ photo: ph, entry, projectName: pName });
        }
      });
    } else if (entry.photoUrls && entry.photoUrls.length > 0) {
      entry.photoUrls.forEach((url, idx) => {
        allPhotos.push({
          photo: {
            id: `legacy_${entry.id}_${idx}`,
            url,
            stage: "other",
            timestamp: entry.createdAt || new Date().toISOString(),
            isGpsVerified: false
          },
          entry,
          projectName: pName
        });
      });
    }
  });

  const handleVoiceData = (parsed: ParsedDiaryData) => {
    if (parsed.workersPresent) setWorkersPresent(parsed.workersPresent);
    if (parsed.weather) setWeather(parsed.weather);
    if (parsed.workCompleted) setWorkCompleted(parsed.workCompleted);
    if (parsed.materialsReceived) setMaterialsReceived(parsed.materialsReceived);
    if (parsed.issues) setIssues(parsed.issues);

    notify("Voice note parsed and applied to form!", "success");
  };

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

  const handlePhotoCaptured = (photoData: Omit<SitePhoto, "id">) => {
    if (targetEntryIdForPhoto) {
      addPhotoToDiaryEntry(targetEntryIdForPhoto, photoData);
      notify("Geo-tagged photo linked to diary entry!", "success");
    } else {
      // Create a fresh diary entry for this photo capture
      const currentProj = projectId || selectedProjectId !== "all" ? (projectId || selectedProjectId) : projects[0]?.id || "proj_1";
      const newEntry = addSiteDiaryEntry({
        projectId: currentProj,
        logDate: new Date().toISOString().split("T")[0],
        weather: "sunny",
        workersPresent: 8,
        workCompleted: photoData.caption || `Geo-tagged site inspection photo captured for ${photoData.stage || "site"}.`,
        photos: [
          {
            ...photoData,
            id: "photo_" + Math.random().toString(36).substring(2, 9)
          }
        ]
      });
      notify("Geo-tagged photo saved to Site Timeline!", "success");
    }
    setTargetEntryIdForPhoto(null);
  };

  const currentProjectObj = projects.find((p) => p.id === (projectId || selectedProjectId !== "all" ? (projectId || selectedProjectId) : projects[0]?.id));
  const activeProjectName = currentProjectObj ? currentProjectObj.projectName : "Pakistan Construction Site";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Daily Construction Site Diary</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                v2.1 Remote Verified
              </span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Official journal: Voice-dictated daily attendance, material receipts &amp; GPS-stamped photo timeline for overseas clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Quick Geo Photo CTA */}
          <button
            type="button"
            onClick={() => {
              setTargetEntryIdForPhoto(null);
              setGeoModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-emerald-500" />
            <span>Capture Geo Photo</span>
          </button>

          {/* Add Daily Log */}
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("diary")}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2",
            activeTab === "diary"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Daily Site Logs ({filteredEntries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2",
            activeTab === "photos"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Camera className="w-4 h-4" />
          <span>Remote Photo Timeline ({allPhotos.length})</span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
            GPS Locked
          </span>
        </button>
      </div>

      {/* TAB 1: DAILY SITE LOGS */}
      {activeTab === "diary" && (
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Entry Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold font-mono text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{entry.logDate}</span>
                      </div>
                      {project && (
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project.projectName}</span>
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

                      {/* Add Photo to Entry Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetEntryIdForPhoto(entry.id);
                          setGeoModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Attach Geo-Tagged Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this diary entry?")) {
                            deleteSiteDiaryEntry(entry.id);
                            notify("Diary entry removed.", "info");
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Work Completed */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                        Work Executed Today:
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
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

                    {/* Attached Geo-Tagged Photos */}
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Attached Geo-Tagged Site Photos ({entry.photos.length}):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {entry.photos.map((ph) => (
                            <div
                              key={ph.id}
                              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950"
                            >
                              <img
                                src={ph.url}
                                alt={ph.caption || "Site Photo"}
                                className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-2 text-[10px] text-white">
                                {ph.isGpsVerified && (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold mb-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>GPS Verified</span>
                                  </span>
                                )}
                                {ph.stage && (
                                  <span className="text-slate-300 font-medium capitalize">
                                    {STAGE_LABELS[ph.stage] || ph.stage}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: REMOTE SITE PHOTO TIMELINE */}
      {activeTab === "photos" && (
        <div className="space-y-4">
          {/* Milestone Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Filter by Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">All Construction Stages</option>
                <option value="excavation">Excavation (کھدائی)</option>
                <option value="foundation">Foundation (بنیاد)</option>
                <option value="columns">Columns &amp; Plinth (ستون)</option>
                <option value="shuttering">Shuttering &amp; Steel (شٹرنگ)</option>
                <option value="slab">Roof Slab Pouring (چھت ڈھلائی)</option>
                <option value="brickwork">Brick Masonry (چنائی)</option>
                <option value="plaster">Plaster (پلستر)</option>
                <option value="finishing">Finishing &amp; Tile (فنشنگ)</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500">
              Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{allPhotos.length}</span> Verified Site Photos
            </div>
          </div>

          {/* Photos Grid */}
          {allPhotos.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No Geo-Tagged Photos Found
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Take live photos with GPS coordinates and real-time timestamp watermarking to give overseas owners full site transparency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGeoModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20"
              >
                Capture First Site Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allPhotos.map(({ photo, entry, projectName }) => (
                <div
                  key={photo.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption || "Site Photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Verified Overlay Badge */}
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-sm text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{photo.isGpsVerified ? "GPS Locked" : "Site Photo"}</span>
                    </div>

                    {/* Stage Tag */}
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold capitalize">
                      {photo.stage ? STAGE_LABELS[photo.stage] || photo.stage : "Inspection"}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {projectName}
                        </span>
                        <span>{entry.logDate}</span>
                      </div>

                      {photo.caption && (
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {photo.caption}
                        </p>
                      )}
                    </div>

                    {/* Coordinates & Metadata Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                      {photo.latitude && photo.longitude && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span>
                            {photo.latitude.toFixed(4)}°N, {photo.longitude.toFixed(4)}°E
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(photo.timestamp).toLocaleString("en-PK", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}{" "}
                          PKT
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal with Voice Recorder */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
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

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Voice Note Quick Recorder */}
              <VoiceDiaryRecorder onParsedData={handleVoiceData} />

              <form onSubmit={handleCreateEntry} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                    Save Diary Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Geo-Tagged Photo Upload Modal */}
      <GeoPhotoUploadModal
        isOpen={geoModalOpen}
        onClose={() => {
          setGeoModalOpen(false);
          setTargetEntryIdForPhoto(null);
        }}
        projectName={activeProjectName}
        projectId={selectedProjectId !== "all" ? selectedProjectId : projects[0]?.id || "proj_1"}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
}
