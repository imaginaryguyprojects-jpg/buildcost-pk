import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, MaterialRate, LabourRate } from "@buildcost/types";
import { INITIAL_MATERIAL_RATES, INITIAL_PROJECTS, INITIAL_LABOUR_RATES } from "../lib/mockData";

interface ProjectStoreState {
  projects: Project[];
  activeProjectId: string;
  selectedCityId: string;
  marlaStandardId: string;
  materialRates: MaterialRate[];
  labourRates: LabourRate[];

  // Actions
  setActiveProjectId: (id: string) => void;
  setSelectedCityId: (cityId: string) => void;
  setMarlaStandardId: (standardId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateMaterialRate: (id: string, newRate: number, reason: string) => void;
  getActiveProject: () => Project | undefined;
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,
      activeProjectId: INITIAL_PROJECTS[0]?.id || "",
      selectedCityId: "isb",
      marlaStandardId: "marla_225",
      materialRates: INITIAL_MATERIAL_RATES,
      labourRates: INITIAL_LABOUR_RATES,

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
                  verifiedAt: "Just now",
                  status: "verified"
                }
              : r
          )
        })),

      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId) || projects[0];
      }
    }),
    {
      name: "buildcost_store_v1"
    }
  )
);
