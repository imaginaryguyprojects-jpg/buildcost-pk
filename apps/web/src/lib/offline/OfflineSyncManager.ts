"use client";

import { useState, useEffect, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useRecentCalculationsStore } from "@/stores/recentCalculationsStore";
import { createClient } from "../supabase/client";

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastSyncFullDate: string | null;
  statusLabel: string;
  pendingSyncCount: number;
}

const STORAGE_KEY_LAST_SYNC = "buildcost_last_sync_timestamp";

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private lastSyncTime: string | null = null;
  private lastSyncFullDate: string | null = null;
  private pendingSyncCount: number = 0;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;

      // Restore persisted last sync time
      try {
        const saved = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
        if (saved) {
          const d = new Date(saved);
          this.lastSyncFullDate = saved;
          this.lastSyncTime = d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
        }
      } catch (ignored) {}

      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);

      // Attempt initial background sync if online
      if (this.isOnline) {
        setTimeout(() => this.performSync(), 2500);
      }
    }
  }

  public static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.performSync();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStatus());
    return () => this.listeners.delete(callback);
  }

  public getStatus(): SyncStatus {
    let statusLabel: string;
    if (this.isSyncing) {
      statusLabel = "Syncing with live cloud...";
    } else if (this.isOnline) {
      statusLabel = this.lastSyncTime
        ? `Last Synced: ${this.lastSyncTime}`
        : "Connected — Live Rates Active";
    } else {
      statusLabel = this.lastSyncTime
        ? `Offline — Last synced data: ${this.lastSyncTime}`
        : "Offline — Using Verified Cached Data";
    }

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastSyncFullDate: this.lastSyncFullDate,
      statusLabel,
      pendingSyncCount: this.pendingSyncCount,
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  public async performSync(): Promise<boolean> {
    if (!this.isOnline || this.isSyncing) return false;

    this.isSyncing = true;
    this.notify();

    try {
      const supabase = createClient();

      // 1. Sync verified material rates from Supabase if connected
      try {
        const { data: remoteRates, error: ratesError } = await supabase
          .from("material_rates")
          .select("*")
          .order("updated_at", { ascending: false });

        if (!ratesError && remoteRates && remoteRates.length > 0) {
          const { materialRates, updateMaterialRate } = useProjectStore.getState();
          for (const remote of remoteRates) {
            const local = materialRates.find((m) => m.id === remote.id || m.materialName === remote.material_name);
            if (local && remote.price_pkr && remote.price_pkr !== (local.deliveredRate || local.baseRate)) {
              updateMaterialRate(local.id, remote.price_pkr, "Synced from verified live market feed");
            }
          }
        }
      } catch (rateErr) {
        console.warn("Material rates sync deferred:", rateErr);
      }

      // 2. Sync Pro status & profile if user is authenticated
      const { user, refreshSubscription } = useAuthStore.getState();
      if (user && refreshSubscription) {
        await refreshSubscription();
      }

      // 3. Sync calculations for authenticated users
      if (user?.id) {
        const calcStore = useRecentCalculationsStore.getState();
        await calcStore.syncWithSupabase(user.id);
      }

      const now = new Date();
      this.lastSyncFullDate = now.toISOString();
      this.lastSyncTime = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
      this.pendingSyncCount = 0;

      try {
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, this.lastSyncFullDate);
      } catch (ignored) {}

      return true;
    } catch (err) {
      console.warn("Offline sync deferral: operation will retry when network stabilizes", err);
      return false;
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>(() =>
    OfflineSyncManager.getInstance().getStatus()
  );

  useEffect(() => {
    const manager = OfflineSyncManager.getInstance();
    return manager.subscribe(setStatus);
  }, []);

  const triggerManualSync = useCallback(() => {
    return OfflineSyncManager.getInstance().performSync();
  }, []);

  return {
    ...status,
    triggerManualSync,
  };
}
