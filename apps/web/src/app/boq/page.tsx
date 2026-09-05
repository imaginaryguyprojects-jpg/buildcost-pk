"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Plus, Trash2, Download, Printer } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatPKR, formatNumber } from "@/lib/formatters";

interface BOQRow {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

const DEFAULT_BOQ_ROWS: BOQRow[] = [
  { id: "1", category: "Excavation", description: "Earthwork excavation in foundation trenches", unit: "cft", quantity: 3500, rate: 18 },
  { id: "2", category: "PCC Bed", description: "Plain cement concrete 1:4:8 under foundations", unit: "cft", quantity: 1200, rate: 280 },
  { id: "3", category: "Brickwork", description: "First class burnt brick masonry in 1:5 cement sand mortar", unit: "cft", quantity: 4200, rate: 420 },
  { id: "4", category: "RCC Structure", description: "Reinforced cement concrete 1:2:4 in slabs, beams and columns", unit: "cft", quantity: 3200, rate: 580 },
  { id: "5", category: "Steel Rebar", description: "Grade 60 deformed rebar including cutting, bending & tying", unit: "kg", quantity: 8500, rate: 285 },
  { id: "6", category: "Plaster", description: "1/2 inch thick cement sand plaster 1:4 on interior walls", unit: "sqft", quantity: 7200, rate: 48 },
  { id: "7", category: "Flooring", description: "Porcelain floor tiles 60x60cm with cement-bond adhesive", unit: "sqft", quantity: 2400, rate: 260 }
];

export default function BOQStudioPage() {
  const { getActiveProject } = useProjectStore();
  const project = getActiveProject();

  const [items, setItems] = useState<BOQRow[]>(DEFAULT_BOQ_ROWS);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [contingencyPercent, setContingencyPercent] = useState<number>(5);

  const subtotal = items.reduce((acc, row) => acc + row.quantity * row.rate, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const contingencyAmount = Math.round((subtotal - discountAmount) * (contingencyPercent / 100));
  const grandTotal = subtotal - discountAmount + contingencyAmount;

  const handleAddItem = () => {
    const newItem: BOQRow = {
      id: String(Date.now()),
      category: "Civil",
      description: "Custom Line Item Specification",
      unit: "sqft",
      quantity: 100,
      rate: 150
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bill of Quantities (BOQ) Studio</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured contractor BOQ schedule for {project?.projectName || "Active Project"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add BOQ Item</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-center">Unit</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Rate (Rs)</th>
                <th className="py-3 px-3 text-right">Amount (PKR)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-300">{row.category}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-200">{row.description}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500 dark:text-slate-400">{row.unit}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    {formatNumber(row.quantity)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    Rs. {formatNumber(row.rate)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPKR(row.quantity * row.rate)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleRemoveItem(row.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Discount %</label>
              <input
                type="number"
                min="0"
                max="20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Contingency %</label>
              <input
                type="number"
                min="0"
                max="15"
                value={contingencyPercent}
                onChange={(e) => setContingencyPercent(parseFloat(e.target.value) || 0)}
                className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-slate-800 dark:text-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="w-full md:w-72 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{formatPKR(subtotal)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-rose-500 dark:text-rose-400">
                <span>Discount ({discountPercent}%):</span>
                <span className="font-mono">- {formatPKR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Contingency ({contingencyPercent}%):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">+{formatPKR(contingencyAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total BOQ:</span>
              <span className="font-mono">{formatPKR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
