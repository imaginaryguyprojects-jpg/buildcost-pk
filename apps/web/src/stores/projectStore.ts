import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, MaterialRate, LabourRate } from "@buildcost/types";
import { INITIAL_MATERIAL_RATES, INITIAL_PROJECTS, INITIAL_LABOUR_RATES } from "../lib/mockData";

export type ThemeMode = "dark" | "light";

interface ProjectStoreState {
  theme: ThemeMode;
  projects: Project[];
  activeProjectId: string;
  selectedCityId: string;
  marlaStandardId: string;
  materialRates: MaterialRate[];
  labourRates: LabourRate[];
  lastSyncTimestamp: string;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveProjectId: (id: string) => void;
  setSelectedCityId: (cityId: string) => void;
  setMarlaStandardId: (standardId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateMaterialRate: (id: string, newRate: number, reason: string) => void;
  syncAuthenticRates: () => void;
  getActiveProject: () => Project | undefined;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      projects: INITIAL_PROJECTS,
      activeProjectId: INITIAL_PROJECTS[0]?.id || "",
      selectedCityId: "isb",
      marlaStandardId: "marla_225",
      materialRates: INITIAL_MATERIAL_RATES,
      labourRates: INITIAL_LABOUR_RATES,
      lastSyncTimestamp: "Today 09:30 AM PKT",

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },

      toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: nextTheme });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", nextTheme === "dark");
        }
      },

      setActiveProjectId: (id: string) => set({ activeProjectId: id }),
      setSelectedCityId: (cityId: string) => set({ selectedCityId: cityId }),
      setMarlaStandardId: (standardId: string) => set({ marlaStandardId: standardId }),

      addProject: (project: Project) =>
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id
        })),

      updateProject: (id: string, updates: Partial<Project>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        })),

      deleteProject: (id: string) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? state.projects[0]?.id || "" : state.activeProjectId
        })),

      updateMaterialRate: (id: string, newRate: number, reason: string) =>
        set((state) => ({
          materialRates: state.materialRates.map((r) =>
            r.id === id
              ? {
                  ...r,
                  deliveredRate: newRate,
                  baseRate: Math.round(newRate * 0.95),
                  verifiedAt: "Just now (Admin Verified)",
                  status: "verified"
                }
              : r
          )
        })),

      syncAuthenticRates: () => {
        set({
          materialRates: INITIAL_MATERIAL_RATES,
          lastSyncTimestamp: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"
        });
      },

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId) || projects[0];
      }
    }),
    {
      name: "buildcost_store_v2"
    }
  )
);
