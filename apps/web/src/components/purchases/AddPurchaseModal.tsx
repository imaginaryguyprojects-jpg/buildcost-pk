"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { PurchaseStatus, PurchasePaymentStatus } from "@buildcost/types";
import {
  X,
  ShoppingCart,
  Building2,
  Receipt,
  Truck,
  UploadCloud,
  CheckCircle2,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultMaterialId?: string;
}

const COMMON_MATERIALS = [
  { id: "mat_cement", name: "Cement (سیمنٹ)", unit: "Bags", defaultRate: 1450 },
  { id: "mat_steel", name: "Steel / Rebar Grade 60 (سریہ)", unit: "Tons", defaultRate: 260000 },
  { id: "mat_bricks", name: "Awwal Bricks (اول اینٹیں)", unit: "Nos", defaultRate: 14 },
  { id: "mat_sand", name: "Chenab Sand (چناب ریت)", unit: "Cu.ft", defaultRate: 60 },
  { id: "mat_crush", name: "Margalla Crush (مارگلہ بجری)", unit: "Cu.ft", defaultRate: 125 },
  { id: "mat_blocks", name: "Solid Concrete Blocks", unit: "Nos", defaultRate: 95 },
  { id: "mat_tiles", name: "Porcelain Floor Tiles 60x60", unit: "Sq.m", defaultRate: 2400 },
  { id: "mat_paint", name: "Weather Shield Paint", unit: "Gallons", defaultRate: 8500 },
  { id: "mat_plumbing", name: "PPRC / UPVC Pipes Bundle", unit: "Nos", defaultRate: 45000 },
  { id: "mat_electrical", name: "Copper Wiring Cables 7/29", unit: "Coils", defaultRate: 18500 }
];

export function AddPurchaseModal({
  isOpen,
  onClose,
  defaultProjectId,
  defaultMaterialId
}: AddPurchaseModalProps) {
  const { projects, vendors, addPurchase, activeProjectId } = useProjectStore();
  const { user, notify } = useAuthStore();

  const [projectId, setProjectId] = useState(defaultProjectId || activeProjectId || (projects[0]?.id ?? ""));
  const [vendorId, setVendorId] = useState(vendors[0]?.id || "");
  const [materialId, setMaterialId] = useState(defaultMaterialId || COMMON_MATERIALS[0].id);
  const [materialName, setMaterialName] = useState(COMMON_MATERIALS[0].name);
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState(COMMON_MATERIALS[0].unit);
  const [rate, setRate] = useState(COMMON_MATERIALS[0].defaultRate);
  const [transportCharges, setTransportCharges] = useState(0);
  const [loadingCharges, setLoadingCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<PurchaseStatus>("ordered");
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>("unpaid");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [billUrl, setBillUrl] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  const handleMaterialSelect = (matId: string) => {
    const mat = COMMON_MATERIALS.find((m) => m.id === matId);
    if (mat) {
      setMaterialId(mat.id);
      setMaterialName(mat.name);
      setUnit(mat.unit);
      setRate(mat.defaultRate);
    }
  };

  const subtotal = Math.round(quantity * rate);
  const totalAmount = Math.max(0, subtotal + transportCharges + loadingCharges - discount);

  const handleSimulatedReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In web app, create object URL for local preview
      const previewUrl = URL.createObjectURL(file);
      setBillUrl(previewUrl);
      notify("Receipt image attached successfully.", "success");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      notify("Please select or create a project first.", "error");
      return;
    }
    if (quantity <= 0 || rate <= 0) {
      notify("Quantity and rate must be greater than zero.", "error");
      return;
    }

    const matchedVendor = vendors.find((v) => v.id === vendorId);

    addPurchase({
      userId: user?.id || "guest",
      projectId,
      vendorId: vendorId || undefined,
      vendorName: matchedVendor ? `${matchedVendor.vendorName} (${matchedVendor.businessName})` : undefined,
      materialId,
      materialName,
      brand: brand.trim() || undefined,
      quantity,
      unit,
      rate,
      subtotal,
      discount,
      transportCharges,
      loadingCharges,
      unloadingCharges: 0,
      otherCharges: 0,
      totalAmount,
      status,
      paymentStatus,
      purchaseDate,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      billUrl,
      notes: notes.trim() || undefined
    });

    notify(
      `Purchase order for ${quantity} ${unit} ${materialName} saved.`,
      "success"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Record Material Purchase / Order
              </h3>
              <p className="text-xs text-slate-500">
                Syncs with vendor ledger, project expenses, and site inventory
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Project & Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.location || p.cityId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Supplier
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                <option value="">-- Select or Walk-in Supplier --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName} ({v.businessName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Material Category Preset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Material Item *
              </label>
              <select
                value={materialId}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                {COMMON_MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Specification
              </label>
              <input
                type="text"
                placeholder="e.g. Bestway / Mughal / Grade 60"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Quantity, Unit & Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate (PKR) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Extra Costs: Freight, Loading, Discount */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Transport / Carriage
              </label>
              <input
                type="number"
                min={0}
                value={transportCharges}
                onChange={(e) => setTransportCharges(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Loading / Palle Dari
              </label>
              <input
                type="number"
                min={0}
                value={loadingCharges}
                onChange={(e) => setLoadingCharges(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                Discount Given
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-emerald-600"
              />
            </div>
          </div>

          {/* Total Calculation Display Card */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-slate-600 dark:text-slate-400">Total Purchase Amount:</span>
              <div className="text-[10px] text-slate-500">
                Subtotal Rs {subtotal.toLocaleString()} + Freight Rs {transportCharges} - Disc Rs {discount}
              </div>
            </div>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
              PKR {totalAmount.toLocaleString()}
            </div>
          </div>

          {/* Status & Payment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="draft">Draft / Inquiry</option>
                <option value="ordered">Ordered (In Transit)</option>
                <option value="delivered">Delivered to Site (Sync Inventory)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PurchasePaymentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="unpaid">Unpaid (Udhaar / Credit)</option>
                <option value="partially_paid">Partially Paid (Advance)</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Receipt / Invoice Upload */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supplier Bill / Weighbridge Slip (Kanta Parchi)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50/50 dark:bg-slate-800/30">
              {billUrl ? (
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Receipt photo attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setBillUrl(undefined)}
                    className="text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Upload bill photo or weighbridge slip
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleSimulatedReceiptUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Gate pass #42, driver mobile 0321-xxxxxxx"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
