import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "../lib/supabase/client";

export interface CalculationRecord {
  id: string;
  title: string;
  timestamp: string;
  cityId: string;
  cityName: string;
  plotSize: string;
  plotSizeUnit: string;
  coveredAreaSqFt: number;
  floors: number;
  constructionType: string;
  wallHeightFeet?: number;
  bathroomsCount?: number;
  foundationType?: string;
  hasColumns?: boolean;
  hasBeams?: boolean;
  totalCostPkr: number;
  costPerSqFtPkr: number;
  isFavorite: boolean;
  syncedToCloud: boolean;
  metadata?: Record<string, any>;
}

export interface LayoutRecord {
  id: string;
  title: string;
  plotSize: string;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  isFavorite: boolean;
  selectedAt: string;
  previewUrl?: string;
}

interface RecentCalculationsState {
  recentCalculations: CalculationRecord[];
  favoriteCalculations: CalculationRecord[];
  recentLayouts: LayoutRecord[];
  favoriteLayouts: LayoutRecord[];
  unclaimedGuestCalculations: CalculationRecord[];

  // Calculation Actions
  addCalculation: (calc: Omit<CalculationRecord, "id" | "timestamp" | "isFavorite" | "syncedToCloud">) => CalculationRecord;
  toggleFavoriteCalculation: (id: string) => void;
  removeCalculation: (id: string) => void;
  getCalculationById: (id: string) => CalculationRecord | undefined;

  // Layout Actions
  addRecentLayout: (layout: Omit<LayoutRecord, "selectedAt" | "isFavorite">) => void;
  toggleFavoriteLayout: (id: string) => void;

  // Guest to Account Sync
  claimGuestCalculations: (userId: string) => Promise<{ claimedCount: number }>;
  syncWithSupabase: (userId: string) => Promise<void>;
  clearLocalHistory: () => void;
}

export const useRecentCalculationsStore = create<RecentCalculationsState>()(
  persist(
    (set, get) => ({
      recentCalculations: [],
      favoriteCalculations: [],
      recentLayouts: [],
      favoriteLayouts: [],
      unclaimedGuestCalculations: [],

      addCalculation: (data) => {
        const id = "calc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
        const newRecord: CalculationRecord = {
          ...data,
          id,
          timestamp: new Date().toISOString(),
          isFavorite: false,
          syncedToCloud: false,
        };

        set((state) => {
          const updatedRecent = [newRecord, ...state.recentCalculations.filter((c) => c.id !== id)].slice(0, 30);
          return {
            recentCalculations: updatedRecent,
            unclaimedGuestCalculations: [newRecord, ...state.unclaimedGuestCalculations].slice(0, 10),
          };
        });

        return newRecord;
      },

      toggleFavoriteCalculation: (id: string) => {
        set((state) => {
          const recent = state.recentCalculations.map((c) =>
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          );
          const favItem = recent.find((c) => c.id === id);
          let favorites = [...state.favoriteCalculations];

          if (favItem?.isFavorite) {
            if (!favorites.some((f) => f.id === id)) {
              favorites = [favItem, ...favorites];
            }
          } else {
            favorites = favorites.filter((f) => f.id !== id);
          }

          return { recentCalculations: recent, favoriteCalculations: favorites };
        });
      },

      removeCalculation: (id: string) => {
        set((state) => ({
          recentCalculations: state.recentCalculations.filter((c) => c.id !== id),
          favoriteCalculations: state.favoriteCalculations.filter((c) => c.id !== id),
          unclaimedGuestCalculations: state.unclaimedGuestCalculations.filter((c) => c.id !== id),
        }));
      },

      getCalculationById: (id: string) => {
        return (
          get().recentCalculations.find((c) => c.id === id) ||
          get().favoriteCalculations.find((c) => c.id === id)
        );
      },

      addRecentLayout: (layout) => {
        const record: LayoutRecord = {
          ...layout,
          isFavorite: false,
          selectedAt: new Date().toISOString(),
        };

        set((state) => ({
          recentLayouts: [record, ...state.recentLayouts.filter((l) => l.id !== layout.id)].slice(0, 20),
        }));
      },

      toggleFavoriteLayout: (id: string) => {
        set((state) => {
          const updatedRecent = state.recentLayouts.map((l) =>
            l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
          );
          const item = updatedRecent.find((l) => l.id === id);
          let favorites = [...state.favoriteLayouts];

          if (item?.isFavorite) {
            if (!favorites.some((f) => f.id === id)) {
              favorites = [item, ...favorites];
            }
          } else {
            favorites = favorites.filter((f) => f.id !== id);
          }

          return { recentLayouts: updatedRecent, favoriteLayouts: favorites };
        });
      },

      claimGuestCalculations: async (userId: string) => {
        const guestItems = get().unclaimedGuestCalculations;
        if (!guestItems || guestItems.length === 0) return { claimedCount: 0 };

        try {
          const supabase = createClient();
          for (const item of guestItems) {
            await supabase.from("saved_estimates").insert({
              user_id: userId,
              title: item.title,
              city_id: item.cityId,
              city_name: item.cityName,
              covered_area: item.coveredAreaSqFt,
              total_cost: item.totalCostPkr,
              cost_per_sqft: item.costPerSqFtPkr,
              calculation_data: item,
            });
          }

          set({ unclaimedGuestCalculations: [] });
          return { claimedCount: guestItems.length };
        } catch (err) {
          console.warn("Failed to claim guest calculations into Supabase:", err);
          return { claimedCount: 0 };
        }
      },

      syncWithSupabase: async (userId: string) => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("saved_estimates")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(30);

          if (!error && data) {
            const remoteRecords: CalculationRecord[] = data.map((d) => ({
              id: d.id,
              title: d.title || "Custom Estimate",
              timestamp: d.created_at,
              cityId: d.city_id || "isb",
              cityName: d.city_name || "Islamabad",
              plotSize: d.calculation_data?.plotSize || "5 Marla",
              plotSizeUnit: d.calculation_data?.plotSizeUnit || "marla",
              coveredAreaSqFt: Number(d.covered_area) || 0,
              floors: d.calculation_data?.floors || 2,
              constructionType: d.calculation_data?.constructionType || "Grey Structure",
              wallHeightFeet: d.calculation_data?.wallHeightFeet || 10,
              bathroomsCount: d.calculation_data?.bathroomsCount || 3,
              foundationType: d.calculation_data?.foundationType || "Strip Footing",
              hasColumns: d.calculation_data?.hasColumns ?? true,
              hasBeams: d.calculation_data?.hasBeams ?? true,
              totalCostPkr: Number(d.total_cost) || 0,
              costPerSqFtPkr: Number(d.cost_per_sqft) || 0,
              isFavorite: Boolean(d.is_favorite),
              syncedToCloud: true,
              metadata: d.calculation_data?.metadata,
            }));

            set((state) => {
              // Merge without duplicates
              const existingIds = new Set(remoteRecords.map((r) => r.id));
              const localOnly = state.recentCalculations.filter((c) => !existingIds.has(c.id));
              const merged = [...remoteRecords, ...localOnly].slice(0, 30);
              const favorites = merged.filter((c) => c.isFavorite);
              return { recentCalculations: merged, favoriteCalculations: favorites };
            });
          }
        } catch (err) {
          console.warn("Offline: skipping remote estimates sync", err);
        }
      },

      clearLocalHistory: () => {
        set({
          recentCalculations: [],
          favoriteCalculations: [],
          recentLayouts: [],
          favoriteLayouts: [],
          unclaimedGuestCalculations: [],
        });
      },
    }),
    {
      name: "buildcost_recent_calculations_v3",
    }
  )
);
