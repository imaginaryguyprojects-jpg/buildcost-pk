"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { Vendor, VendorCategory } from "@buildcost/types";
import { PAKISTANI_CITIES } from "@buildcost/config";
import {
  X,
  Building2,
  Phone,
  MessageSquare,
  MapPin,
  Tag,
  Star,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: VendorCategory }[] = [
  { label: "Cement (سیمنٹ)", value: "cement" },
  { label: "Steel / Rebar (سریStaff)", value: "steel" },
  { label: "Bricks (اینٹیں)", value: "bricks" },
  { label: "Sand (ریت)", value: "sand" },
  { label: "Crush / Bajri (بجری)", value: "crush" },
  { label: "Tiles & Ceramics (ٹائلز)", value: "tiles" },
  { label: "Paint & Distemper (پینٹ)", value: "paint" },
  { label: "Electrical (بجلی کا سامان)", value: "electrical" },
  { label: "Plumbing (سینیٹری و پلمبنگ)", value: "plumbing" },
  { label: "Wood / Doors (لکڑی)", value: "wood" },
  { label: "Aluminium & Glass (ایلومینیم)", value: "aluminium" },
  { label: "Hardware & Tools (ہارڈویئر)", value: "hardware" },
  { label: "Labour Contractor (ٹھیکیدار)", value: "contractor" },
  { label: "General / Other (دیگر)", value: "other" }
];

export function AddVendorModal({ isOpen, onClose }: AddVendorModalProps) {
  const { addVendor, selectedCityId } = useProjectStore();
  const { user, notify } = useAuthStore();

  const [vendorName, setVendorName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<VendorCategory>("cement");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [cityId, setCityId] = useState(selectedCityId || "isb");
  const [address, setAddress] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"active" | "preferred">("active");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !businessName.trim() || !mobileNumber.trim()) {
      notify("Please fill vendor name, business name, and mobile number.", "error");
      return;
    }

    addVendor({
      userId: user?.id || "guest",
      vendorName: vendorName.trim(),
      businessName: businessName.trim(),
      mobileNumber: mobileNumber.trim(),
      whatsappNumber: whatsappNumber.trim() || mobileNumber.trim(),
      category,
      cityId,
      address: address.trim(),
      rating,
      status,
      notes: notes.trim()
    });

    notify(`Vendor "${businessName}" added to your directory.`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add Material Vendor / Supplier
              </h3>
              <p className="text-xs text-slate-500">
                Record supplier contact, rate category, and ledger profile
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Contact Person *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Haji Aslam / Malik Tariq"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chenab Building Material"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City Market *
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                {PAKISTANI_CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.urduName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Number (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-500" />
                <input
                  type="tel"
                  placeholder="0300-1234567 (if different)"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shop Address / Market Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Shop 14, Main Market, I-9 Industrial Area, Islamabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rating / Reliability
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        star <= rating
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-300 dark:text-slate-600"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-semibold transition-colors",
                    status === "active"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("preferred")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1",
                    status === "preferred"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Preferred</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes &amp; Credit Terms
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Provides 15 days credit, trolley delivery free within 5km, Best rate for DG Khan cement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          {/* Modal Actions */}
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
              <span>Save Vendor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
