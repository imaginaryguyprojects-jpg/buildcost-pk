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
  ChecklistStatus,
  HouseLayout,
  Vendor,
  PurchaseOrder,
  PurchaseStatus,
  PurchasePaymentStatus,
  VendorPayment,
  InventoryItem,
  MaterialUsage,
  ProjectReminder,
  ReminderStatus,
  SiteDiaryEntry,
  SitePhoto,
  ProjectAuditLog,
  ProjectAuditAction
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
  INITIAL_SHARE_LINKS,
  INITIAL_HOUSE_LAYOUTS,
  INITIAL_VENDORS,
  INITIAL_PURCHASES,
  INITIAL_INVENTORY,
  INITIAL_REMINDERS,
  INITIAL_SITE_DIARY
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
  layouts: HouseLayout[];
  vendors: Vendor[];
  purchases: PurchaseOrder[];
  inventory: InventoryItem[];
  reminders: ProjectReminder[];
  siteDiary: SiteDiaryEntry[];
  auditLogs: ProjectAuditLog[];
  lastSyncTimestamp: string;

  // Global modals
  quickAddOpen: boolean;
  smartSearchOpen: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveProjectId: (id: string) => void;
  setSelectedCityId: (cityId: string) => void;
  setMarlaStandardId: (standardId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
  duplicateProject: (id: string, newName?: string, newCityId?: string) => Project | undefined;
  logProjectAudit: (projectId: string, action: ProjectAuditAction, metadata?: any) => void;
  updateMaterialRate: (id: string, newRate: number, reason: string) => void;
  syncAuthenticRates: () => void;
  getActiveProject: () => Project | undefined;

  // Modals
  setQuickAddOpen: (open: boolean) => void;
  setSmartSearchOpen: (open: boolean) => void;

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

  // Layouts
  toggleFavoriteLayout: (id: string) => void;
  toggleLayoutFavorite: (id: string) => void;

  // Vendors
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt">) => Vendor;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  // Purchases
  addPurchase: (purchase: Omit<PurchaseOrder, "id" | "createdAt">) => PurchaseOrder;
  updatePurchaseStatus: (id: string, status: PurchaseStatus, paymentStatus?: PurchasePaymentStatus) => void;
  recordVendorPayment: (payment: Omit<VendorPayment, "id" | "createdAt">) => void;

  // Inventory & Usages
  recordMaterialUsage: (usage: Omit<MaterialUsage, "id" | "createdAt">) => void;

  // Reminders
  addReminder: (reminder: Omit<ProjectReminder, "id" | "createdAt">) => ProjectReminder;
  updateReminderStatus: (id: string, status: ReminderStatus) => void;
  deleteReminder: (id: string) => void;

  // Site Diary
  addSiteDiaryEntry: (entry: Omit<SiteDiaryEntry, "id" | "createdAt">) => SiteDiaryEntry;
  addPhotoToDiaryEntry: (entryId: string, photo: Omit<SitePhoto, "id">) => void;
  deleteSiteDiaryEntry: (id: string) => void;
}


export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      theme: "light",
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
      layouts: INITIAL_HOUSE_LAYOUTS,
      vendors: INITIAL_VENDORS,
      purchases: INITIAL_PURCHASES,
      inventory: INITIAL_INVENTORY,
      reminders: INITIAL_REMINDERS,
      siteDiary: INITIAL_SITE_DIARY,
      auditLogs: [],
      lastSyncTimestamp: "Today 09:30 AM PKT",

      quickAddOpen: false,
      smartSearchOpen: false,

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

      addProject: (project: Project) => {
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: project.id
        }));
        get().logProjectAudit(project.id, "project_created", { projectName: project.projectName });
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        const original = get().projects.find((p) => p.id === id);
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        }));
        const action: ProjectAuditAction = updates.totalBudget !== undefined && original?.totalBudget !== updates.totalBudget
          ? "budget_changed"
          : "project_edited";
        get().logProjectAudit(id, action, { fields: Object.keys(updates) });
      },

      deleteProject: (id: string) => {
        get().logProjectAudit(id, "project_deleted");
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? state.projects[0]?.id || "" : state.activeProjectId
        }));
      },

      archiveProject: (id: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, status: "archived", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : p
          )
        }));
        get().logProjectAudit(id, "project_archived");
      },

      restoreProject: (id: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, status: "active", archivedAt: null, updatedAt: new Date().toISOString() }
              : p
          )
        }));
        get().logProjectAudit(id, "project_restored");
      },

      duplicateProject: (id: string, newName?: string, newCityId?: string) => {
        const original = get().projects.find((p) => p.id === id);
        if (!original) return undefined;
        const newProjId = "proj_" + Math.random().toString(36).substring(2, 9);
        const cloned: Project = {
          ...original,
          id: newProjId,
          projectName: newName || `${original.projectName} - Copy`,
          cityId: newCityId || original.cityId,
          status: "planning",
          archivedAt: null,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0]
        };
        set((state) => ({
          projects: [cloned, ...state.projects],
          activeProjectId: cloned.id
        }));
        get().logProjectAudit(newProjId, "project_duplicated", { sourceProjectId: id, newName: cloned.projectName });
        return cloned;
      },

      logProjectAudit: (projectId: string, action: ProjectAuditAction, metadata?: any) => {
        const entry: ProjectAuditLog = {
          id: "aud_" + Math.random().toString(36).substring(2, 9),
          projectId,
          userId: "usr_active",
          action,
          metadata: metadata || {},
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          auditLogs: [entry, ...state.auditLogs]
        }));
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

      // Modals
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      setSmartSearchOpen: (open) => set({ smartSearchOpen: open }),

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

        const updatedGrandTotal =
          materialsCost +
          original.result.labourCost +
          original.result.equipmentCost +
          original.result.transportCost +
          original.result.finishingCost +
          original.result.contingencyCost;
        const updatedCostPerSqft =
          original.result.totalCoveredAreaSqft > 0
            ? Math.round(updatedGrandTotal / original.result.totalCoveredAreaSqft)
            : 0;

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
        const deltaPercentage =
          prevVersion && prevVersion.summaryData.grandTotal > 0
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
      },

      // Layouts
      toggleFavoriteLayout: (id: string) => {
        set((state) => ({
          layouts: state.layouts.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          )
        }));
      },
      toggleLayoutFavorite: (id: string) => {
        get().toggleFavoriteLayout(id);
      },

      // Vendors
      addVendor: (vendor) => {
        const newVendor: Vendor = {
          ...vendor,
          id: "vnd_" + Math.random().toString(36).substring(2, 9),
          totalPurchases: 0,
          totalPaid: 0,
          outstandingBalance: 0,
          createdAt: new Date().toISOString().split("T")[0]
        };
        set((state) => ({
          vendors: [newVendor, ...state.vendors]
        }));
        return newVendor;
      },

      updateVendor: (id, updates) => {
        set((state) => ({
          vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v))
        }));
      },

      deleteVendor: (id) => {
        set((state) => ({
          vendors: state.vendors.filter((v) => v.id !== id)
        }));
      },

      // Purchases & Inventory linking
      addPurchase: (purchase) => {
        const newPO: PurchaseOrder = {
          ...purchase,
          id: "po_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString().split("T")[0]
        };

        // If marked as delivered, automatically increment inventory
        let updatedInventory = [...get().inventory];
        if (newPO.status === "delivered") {
          const invMatch = updatedInventory.find(
            (i) => i.projectId === newPO.projectId && i.materialId === newPO.materialId
          );
          if (invMatch) {
            const newPurchased = invMatch.purchasedQuantity + newPO.quantity;
            const newRemaining = invMatch.openingQuantity + newPurchased - invMatch.usedQuantity;
            updatedInventory = updatedInventory.map((i) =>
              i.id === invMatch.id
                ? {
                    ...i,
                    purchasedQuantity: newPurchased,
                    remainingQuantity: newRemaining,
                    isLowStock: newRemaining <= i.minStockThreshold
                  }
                : i
            );
          }
        }

        // Update vendor financial ledger
        const updatedVendors = get().vendors.map((v) => {
          if (v.id === newPO.vendorId) {
            const newTotal = (v.totalPurchases || 0) + newPO.totalAmount;
            const newPaid = newPO.paymentStatus === "paid" ? (v.totalPaid || 0) + newPO.totalAmount : (v.totalPaid || 0);
            return {
              ...v,
              totalPurchases: newTotal,
              totalPaid: newPaid,
              outstandingBalance: newTotal - newPaid
            };
          }
          return v;
        });

        set((state) => ({
          purchases: [newPO, ...state.purchases],
          inventory: updatedInventory,
          vendors: updatedVendors
        }));
        return newPO;
      },

      updatePurchaseStatus: (id, status, paymentStatus) => {
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  paymentStatus: paymentStatus || p.paymentStatus,
                  deliveredAt: status === "delivered" ? new Date().toISOString() : p.deliveredAt
                }
              : p
          )
        }));
      },

      recordVendorPayment: (payment) => {
        set((state) => ({
          vendors: state.vendors.map((v) => {
            if (v.id === payment.vendorId) {
              const newPaid = (v.totalPaid || 0) + payment.amount;
              return {
                ...v,
                totalPaid: newPaid,
                outstandingBalance: Math.max(0, (v.totalPurchases || 0) - newPaid)
              };
            }
            return v;
          })
        }));
      },

      recordMaterialUsage: (usage) => {
        const newUsage: MaterialUsage = {
          ...usage,
          id: "usg_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };

        const updatedInventory = get().inventory.map((i) => {
          if (i.projectId === usage.projectId && i.materialId === usage.materialId) {
            const newUsed = i.usedQuantity + usage.quantityUsed;
            const newRemaining = i.openingQuantity + i.purchasedQuantity - newUsed;
            return {
              ...i,
              usedQuantity: newUsed,
              remainingQuantity: newRemaining,
              isLowStock: newRemaining <= i.minStockThreshold
            };
          }
          return i;
        });

        set({ inventory: updatedInventory });
      },

      // Reminders
      addReminder: (reminder) => {
        const newRem: ProjectReminder = {
          ...reminder,
          id: "rem_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          reminders: [newRem, ...state.reminders]
        }));
        return newRem;
      },

      updateReminderStatus: (id, status) => {
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, status } : r))
        }));
      },

      deleteReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id)
        }));
      },

      // Site Diary
      addSiteDiaryEntry: (entry) => {
        const newLog: SiteDiaryEntry = {
          ...entry,
          id: "log_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          siteDiary: [newLog, ...state.siteDiary]
        }));
        return newLog;
      },

      addPhotoToDiaryEntry: (entryId, photo) => {
        const newPhoto: SitePhoto = {
          ...photo,
          id: "photo_" + Math.random().toString(36).substring(2, 9)
        };
        set((state) => ({
          siteDiary: state.siteDiary.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  photos: [newPhoto, ...(entry.photos || [])],
                  photoUrls: [newPhoto.url, ...(entry.photoUrls || [])]
                }
              : entry
          )
        }));
      },

      deleteSiteDiaryEntry: (id) => {
        set((state) => ({
          siteDiary: state.siteDiary.filter((entry) => entry.id !== id)
        }));
      }
    }),

    {
      name: "buildcost_store_v5"
    }
  )
);
