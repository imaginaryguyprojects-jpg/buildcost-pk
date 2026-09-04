import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Project,
  MaterialRate,
  LabourRate,
  CalculationSnapshot,
  EstimateVersion,
  CalculatorTemplate,
  MaterialWatchlistItem,
  ProjectChecklistItem,
  ShareLink,
  ChecklistStatus
} from "@buildcost/types";
import {
  INITIAL_MATERIAL_RATES,
  INITIAL_PROJECTS,
  INITIAL_LABOUR_RATES,
  INITIAL_TEMPLATES,
  INITIAL_CHECKLIST,
  INITIAL_WATCHLIST,
  INITIAL_CALCULATIONS,
  INITIAL_ESTIMATE_VERSIONS,
  INITIAL_SHARE_LINKS
} from "../lib/mockData";

export type ThemeMode = "dark" | "light";

interface ProjectStoreState {
  theme: ThemeMode;
  projects: Project[];
  activeProjectId: string;
  selectedCityId: string;
  marlaStandardId: string;
  materialRates: MaterialRate[];
  labourRates: LabourRate[];
  savedCalculations: CalculationSnapshot[];
  estimateVersions: EstimateVersion[];
  templates: CalculatorTemplate[];
  watchlist: MaterialWatchlistItem[];
  checklists: ProjectChecklistItem[];
  shareLinks: ShareLink[];
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
  duplicateProject: (id: string, newName?: string, newCityId?: string) => Project | undefined;
  updateMaterialRate: (id: string, newRate: number, reason: string) => void;
  syncAuthenticRates: () => void;
  getActiveProject: () => Project | undefined;

  // Calculation & Versioning actions
  saveCalculation: (calc: Omit<CalculationSnapshot, "id" | "createdAt">) => CalculationSnapshot;
  deleteCalculation: (id: string) => void;
  updateCalculationWithLatestRates: (id: string) => CalculationSnapshot | undefined;
  createEstimateVersion: (projectId: string, versionName: string, data: any) => EstimateVersion;

  // Sharing actions
  createShareLink: (params: {
    userId: string;
    projectId?: string;
    documentType: any;
    documentId: string;
    documentData: any;
    title: string;
    allowDownload?: boolean;
    viewOnly?: boolean;
    includeClientName?: boolean;
    includePhone?: boolean;
    includeCompany?: boolean;
    includeProjectAddress?: boolean;
    expiresAt?: string | null;
  }) => ShareLink;
  revokeShareLink: (token: string) => void;
  getShareLinkByToken: (token: string) => ShareLink | undefined;
  incrementShareView: (token: string) => void;

  // Templates
  addTemplate: (template: Omit<CalculatorTemplate, "id" | "createdAt">) => void;
  duplicateTemplate: (templateId: string) => CalculatorTemplate | undefined;

  // Watchlist & Alerts
  addWatchlistItem: (materialId: string, cityId: string, targetAlertRate?: number) => void;
  removeWatchlistItem: (id: string) => void;

  // Checklist
  updateChecklistItemStatus: (id: string, status: ChecklistStatus) => void;
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
      savedCalculations: INITIAL_CALCULATIONS,
      estimateVersions: INITIAL_ESTIMATE_VERSIONS,
      templates: INITIAL_TEMPLATES,
      watchlist: INITIAL_WATCHLIST,
      checklists: INITIAL_CHECKLIST,
      shareLinks: INITIAL_SHARE_LINKS,
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

      duplicateProject: (id: string, newName?: string, newCityId?: string) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return undefined;
        const newProjId = "proj_" + Math.random().toString(36).substring(2, 9);
        const cloned: Project = {
          ...original,
          id: newProjId,
          projectName: newName || `${original.projectName} (Copy)`,
          cityId: newCityId || original.cityId,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0]
        };
        set((state) => ({
          projects: [cloned, ...state.projects],
          activeProjectId: cloned.id
        }));
        return cloned;
      },

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
      },

      // Calculation history & preservation
      saveCalculation: (calc) => {
        const newCalc: CalculationSnapshot = {
          ...calc,
          id: "calc_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          savedCalculations: [newCalc, ...state.savedCalculations]
        }));
        return newCalc;
      },

      deleteCalculation: (id: string) =>
        set((state) => ({
          savedCalculations: state.savedCalculations.filter((c) => c.id !== id)
        })),

      updateCalculationWithLatestRates: (id: string) => {
        const original = get().savedCalculations.find((c) => c.id === id);
        if (!original) return undefined;

        // Create updated rate snapshot from current rates
        const currentRates = get().materialRates;
        const newRatesSnapshot: Record<string, { rate: number; source: string; verifiedAt: string }> = {};
        
        let materialsCost = 0;
        const updatedMaterials = original.result.materials.map((m) => {
          const match = currentRates.find((r) => r.materialId === m.materialId);
          const currentUnitRate = match ? match.deliveredRate : m.unitRate;
          const cost = m.finalQuantity * currentUnitRate;
          materialsCost += cost;
          newRatesSnapshot[m.materialId] = {
            rate: currentUnitRate,
            source: match?.sourceName || "Market Baseline",
            verifiedAt: match?.verifiedAt || "Current"
          };
          return {
            ...m,
            unitRate: currentUnitRate,
            cost
          };
        });

        const updatedGrandTotal = materialsCost + original.result.labourCost + original.result.equipmentCost + original.result.transportCost + original.result.finishingCost + original.result.contingencyCost;
        const updatedCostPerSqft = original.result.totalCoveredAreaSqft > 0 ? Math.round(updatedGrandTotal / original.result.totalCoveredAreaSqft) : 0;

        // Creates a NEW historically accurate calculation record without overwriting original
        const updatedCalc: CalculationSnapshot = {
          id: "calc_" + Math.random().toString(36).substring(2, 9),
          projectId: original.projectId,
          calculatorType: original.calculatorType,
          inputs: { ...original.inputs, updatedAt: new Date().toISOString() },
          result: {
            ...original.result,
            materialsCost,
            grandTotal: updatedGrandTotal,
            costPerSqft: updatedCostPerSqft,
            materials: updatedMaterials
          },
          ratesSnapshot: newRatesSnapshot,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          savedCalculations: [updatedCalc, ...state.savedCalculations]
        }));
        return updatedCalc;
      },

      createEstimateVersion: (projectId: string, versionName: string, data: any) => {
        const existing = get().estimateVersions.filter((v) => v.projectId === projectId);
        const nextVersionNum = existing.length + 1;
        const prevVersion = existing[existing.length - 1];

        const deltaAmount = prevVersion ? data.grandTotal - prevVersion.summaryData.grandTotal : 0;
        const deltaPercentage = prevVersion && prevVersion.summaryData.grandTotal > 0
          ? Number(((deltaAmount / prevVersion.summaryData.grandTotal) * 100).toFixed(2))
          : 0;

        const newVersion: EstimateVersion = {
          id: "ver_" + Math.random().toString(36).substring(2, 9),
          projectId,
          versionNumber: nextVersionNum,
          versionName: versionName || `Estimate v${nextVersionNum}`,
          rateSnapshotDate: new Date().toISOString(),
          summaryData: {
            totalCoveredAreaSqft: data.coveredArea || data.totalCoveredAreaSqft || 2000,
            grandTotal: data.grandTotal,
            costPerSqft: data.costPerSqft,
            materialsCost: data.materialsCost || 0,
            labourCost: data.labourCost || 0,
            finishingCost: data.finishingCost || 0
          },
          ratesSnapshot: data.ratesSnapshot || {},
          deltaAmount,
          deltaPercentage,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          estimateVersions: [newVersion, ...state.estimateVersions]
        }));
        return newVersion;
      },

      // Sharing
      createShareLink: (params) => {
        const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        const token = `sh-${randomHex.substring(0, 8)}-${randomHex.substring(8, 12)}-${randomHex.substring(12, 16)}-${randomHex.substring(16, 20)}-${randomHex.substring(20, 32)}`;

        const newLink: ShareLink = {
          id: "sh_" + Math.random().toString(36).substring(2, 9),
          userId: params.userId,
          projectId: params.projectId,
          documentType: params.documentType,
          documentId: params.documentId,
          documentData: params.documentData,
          token,
          title: params.title,
          isActive: true,
          allowDownload: params.allowDownload ?? true,
          viewOnly: params.viewOnly ?? true,
          includeClientName: params.includeClientName ?? false,
          includePhone: params.includePhone ?? false,
          includeCompany: params.includeCompany ?? true,
          includeProjectAddress: params.includeProjectAddress ?? false,
          expiresAt: params.expiresAt || null,
          revokedAt: null,
          viewCount: 0,
          downloadCount: 0,
          lastViewedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          shareLinks: [newLink, ...state.shareLinks]
        }));
        return newLink;
      },

      revokeShareLink: (token: string) => {
        set((state) => ({
          shareLinks: state.shareLinks.map((l) =>
            l.token === token
              ? { ...l, isActive: false, revokedAt: new Date().toISOString() }
              : l
          )
        }));
      },

      getShareLinkByToken: (token: string) => {
        return get().shareLinks.find((l) => l.token === token);
      },

      incrementShareView: (token: string) => {
        set((state) => ({
          shareLinks: state.shareLinks.map((l) =>
            l.token === token
              ? {
                  ...l,
                  viewCount: l.viewCount + 1,
                  lastViewedAt: new Date().toISOString()
                }
              : l
          )
        }));
      },

      // Templates
      addTemplate: (template) => {
        const newTemplate: CalculatorTemplate = {
          ...template,
          id: "tpl_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          templates: [newTemplate, ...state.templates]
        }));
      },

      duplicateTemplate: (templateId: string) => {
        const orig = get().templates.find((t) => t.id === templateId);
        if (!orig) return undefined;
        const copy: CalculatorTemplate = {
          ...orig,
          id: "tpl_" + Math.random().toString(36).substring(2, 9),
          title: `${orig.title} (Custom)`,
          isSystemPreset: false,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          templates: [copy, ...state.templates]
        }));
        return copy;
      },

      // Watchlist
      addWatchlistItem: (materialId, cityId, targetAlertRate) => {
        const exists = get().watchlist.some((w) => w.materialId === materialId && w.cityId === cityId);
        if (exists) return;
        const item: MaterialWatchlistItem = {
          id: "wtch_" + Math.random().toString(36).substring(2, 9),
          userId: "usr_active",
          materialId,
          cityId,
          targetAlertRate,
          alertOnIncrease: true,
          alertOnDecrease: true,
          notifyEmail: true,
          notifyInApp: true,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          watchlist: [item, ...state.watchlist]
        }));
      },

      removeWatchlistItem: (id: string) => {
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.id !== id)
        }));
      },

      // Checklist
      updateChecklistItemStatus: (id: string, status: ChecklistStatus) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status,
                  completedAt: status === "completed" ? new Date().toISOString() : undefined
                }
              : c
          )
        }));
      }
    }),
    {
      name: "buildcost_store_v3"
    }
  )
);
