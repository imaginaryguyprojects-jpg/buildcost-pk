"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { InventoryItem } from "@buildcost/types";
import { AddPurchaseModal } from "@/components/purchases/AddPurchaseModal";
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingCart,
  TrendingDown,
  Building2,
  CheckCircle2,
  Layers,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "Site Demolition & Excavation",
  "PCC & Footings / Foundation",
  "Plinth Beam & DPC Level",
  "Brick Masonry Ground Floor",
  "Ground Floor Roof Slab Pouring",
  "First Floor Columns & Masonry",
  "First Floor Roof Slab Pouring",
  "Plastering (Internal & External)",
  "Flooring & Tile Work",
  "Finishing & Paint"
];

export default function InventoryPage() {
  const { inventory, projects, recordMaterialUsage, activeProjectId } = useProjectStore();
  const { notify } = useAuthStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects[0]?.id || "all");
  const [usageModalItem, setUsageModalItem] = useState<InventoryItem | null>(null);
  const [usedQty, setUsedQty] = useState<number>(10);
  const [usageStage, setUsageStage] = useState<string>(STAGES[3]);
  const [usageNotes, setUsageNotes] = useState<string>("");

  const [reorderModalOpen, setReorderModalOpen] = useState<boolean>(false);
  const [reorderMaterialId, setReorderMaterialId] = useState<string | undefined>(undefined);

  // Filtered inventory
  const projectItems = inventory.filter((item) => {
    if (selectedProjectId !== "all" && item.projectId !== selectedProjectId) return false;
    return true;
  });

  const lowStockItems = projectItems.filter((i) => i.isLowStock || i.remainingQuantity <= i.minStockThreshold);

  const handleRecordUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageModalItem || usedQty <= 0) {
      notify("Please enter a valid quantity.", "error");
      return;
    }
    if (usedQty > usageModalItem.remainingQuantity) {
      notify("Quantity used cannot exceed current available stock.", "error");
      return;
    }

    recordMaterialUsage({
      projectId: usageModalItem.projectId,
      materialId: usageModalItem.materialId,
      quantityUsed: usedQty,
      usageDate: new Date().toISOString().split("T")[0],
      constructionStage: usageStage,
      notes: usageNotes.trim() || undefined
    });

    notify(
      `Recorded ${usedQty} ${usageModalItem.unit} of ${usageModalItem.materialName} consumed at ${usageStage}.`,
      "success"
    );
    setUsageModalItem(null);
    setUsedQty(10);
    setUsageNotes("");
  };

  const handleOpenReorder = (item: InventoryItem) => {
    setReorderMaterialId(item.materialId);
    setReorderModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Site Inventory &amp; Material Stock
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Automated stock balance: Opening Stock + Delivered Orders − Daily Usage = Remaining Balance.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Project:</span>
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
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Low Stock Warning ({lowStockItems.length} Materials Below Threshold)
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
              Materials near depletion may halt construction site work. Reorder promptly from suppliers:{" "}
              {lowStockItems.map((i) => `${i.materialName} (${i.remainingQuantity} ${i.unit} left)`).join(", ")}.
            </p>
          </div>
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projectItems.map((item) => {
          const isLow = item.isLowStock || item.remainingQuantity <= item.minStockThreshold;
          const consumptionPct = Math.round(
            (item.usedQuantity / Math.max(1, item.openingQuantity + item.purchasedQuantity)) * 100
          );

          return (
            <div
              key={item.id}
              className={cn(
                "bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between",
                isLow
                  ? "border-amber-400 dark:border-amber-800 bg-amber-50/10"
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.materialName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Threshold limit: {item.minStockThreshold} {item.unit}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      isLow
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"
                        : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>

                {/* Remaining Quantity Highlight */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      Current Available
                    </span>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                      {item.remainingQuantity.toLocaleString()}{" "}
                      <span className="text-xs font-medium text-slate-500">{item.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Consumed</span>
                    <div className="text-sm font-bold font-mono text-slate-600 dark:text-slate-400">
                      {consumptionPct}%
                    </div>
                  </div>
                </div>

                {/* Formula Breakdown Breakdown */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 mb-4 font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400">Opening</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {item.openingQuantity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400">+ Bought</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{item.purchasedQuantity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-500">- Used</div>
                    <div className="font-bold text-rose-500">
                      -{item.usedQuantity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUsageModalItem(item)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-500" />
                  <span>Log Usage</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenReorder(item)}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Material Usage Modal */}
      {usageModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Log Usage — {usageModalItem.materialName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUsageModalItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordUsage} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Consumed ({usageModalItem.unit}) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={usageModalItem.remainingQuantity}
                  required
                  value={usedQty}
                  onChange={(e) => setUsedQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-emerald-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Available in stock: {usageModalItem.remainingQuantity} {usageModalItem.unit}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Construction Stage *
                </label>
                <select
                  value={usageStage}
                  onChange={(e) => setUsageStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mixed 1:2:4 ratio for porch slab beam"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUsageModalItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20"
                >
                  Confirm Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Modal (AddPurchaseModal) */}
      <AddPurchaseModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        defaultProjectId={selectedProjectId !== "all" ? selectedProjectId : undefined}
        defaultMaterialId={reorderMaterialId}
      />
    </div>
  );
}
