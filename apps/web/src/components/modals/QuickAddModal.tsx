"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/projectStore";
import { AddPurchaseModal } from "@/components/purchases/AddPurchaseModal";
import { AddVendorModal } from "@/components/vendors/AddVendorModal";
import {
  X,
  Plus,
  ShoppingCart,
  Building2,
  FolderPlus,
  CalendarClock,
  BookOpen,
  Compass,
  Calculator,
  Layers
} from "lucide-react";

export function QuickAddModal() {
  const router = useRouter();
  const { quickAddOpen, setQuickAddOpen } = useProjectStore();

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  if (!quickAddOpen) return null;

  const actions = [
    {
      title: "Record Purchase",
      description: "Log cement, steel, bricks or finishings with bill receipt",
      icon: ShoppingCart,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      action: () => {
        setQuickAddOpen(false);
        setPurchaseModalOpen(true);
      }
    },
    {
      title: "Add Material Vendor",
      description: "Save supplier mobile, WhatsApp, category & credit terms",
      icon: Building2,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      action: () => {
        setQuickAddOpen(false);
        setVendorModalOpen(true);
      }
    },
    {
      title: "Start New Project",
      description: "Create a new residential or commercial construction file",
      icon: FolderPlus,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      action: () => {
        setQuickAddOpen(false);
        router.push("/projects/new");
      }
    },
    {
      title: "Site Diary Entry",
      description: "Log today's weather, labor headcount, work done & photos",
      icon: BookOpen,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      action: () => {
        setQuickAddOpen(false);
        router.push("/diary");
      }
    },
    {
      title: "Set Site Reminder",
      description: "Curing schedule, inspection dates & contractor payments",
      icon: CalendarClock,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      action: () => {
        setQuickAddOpen(false);
        router.push("/reminders");
      }
    },
    {
      title: "Browse House Layouts",
      description: "Explore standard 3M, 5M, 7M, 10M & 1 Kanal 2D blueprints",
      icon: Compass,
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      action: () => {
        setQuickAddOpen(false);
        router.push("/layouts");
      }
    }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Quick Actions
                </h3>
                <p className="text-xs text-slate-500">
                  What would you like to create or record?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.title}
                  type="button"
                  onClick={act.action}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${act.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                      {act.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-modals triggered from QuickAdd */}
      <AddPurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
      />
      <AddVendorModal
        isOpen={vendorModalOpen}
        onClose={() => setVendorModalOpen(false)}
      />
    </>
  );
}
