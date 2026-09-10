"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, Copy, CheckCircle2, X, Send, Truck, Building2, Package, Sparkles } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVendorId?: string;
}

const MATERIAL_PRESETS = [
  {
    category: "Cement",
    label: "Cement (سیمنٹ)",
    defaultUnit: "Bags",
    brands: ["Fauji Cement", "Lucky Cement", "Bestway Cement", "Maple Leaf", "DG Khan Cement", "Pioneer Cement"],
    defaultQty: 100,
    unitRates: 1380
  },
  {
    category: "Steel",
    label: "Steel / Sariya 60-Grade (سریہ)",
    defaultUnit: "Tons",
    brands: ["Mughal Supreme 60", "Amreli Steels 60", "Ittefaq Steel 60", "Model Steel 60", "Agha Steel"],
    defaultQty: 3,
    unitRates: 260000
  },
  {
    category: "Sand",
    label: "Sand / Ret (ریت)",
    defaultUnit: "Trolleys",
    brands: ["Chenab Sand (Plaster Quality)", "Ravi Sand (Structure)", "Dina Sand", "Bholari Sand (Karachi)"],
    defaultQty: 2,
    unitRates: 9500
  },
  {
    category: "Crush",
    label: "Crush / Bajri (بجری)",
    defaultUnit: "Cft",
    brands: ["Margalla 1/2'' Down Plant Clean", "Sargodha 3/4'' Down", "Dina Bajri", "Hub River Crush"],
    defaultQty: 400,
    unitRates: 135
  },
  {
    category: "Bricks",
    label: "Bricks / Eent (اینٹیں)",
    defaultUnit: "Thousands (ہزار)",
    brands: ["Awwal Bhatta Bricks (Special)", "Chakwal Awwal", "Solid Concrete Blocks", "Fly Ash Blocks"],
    defaultQty: 5,
    unitRates: 14500
  }
];

export function WhatsAppOrderModal({ isOpen, onClose, defaultVendorId }: WhatsAppOrderModalProps) {
  const { vendors, projects, activeProjectId, addPurchase } = useProjectStore();
  const { notify } = useAuthStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(activeProjectId || projects[0]?.id || "");
  const [selectedVendorId, setSelectedVendorId] = useState<string>(defaultVendorId || vendors[0]?.id || "");
  const [customVendorName, setCustomVendorName] = useState<string>("");
  const [vendorPhone, setVendorPhone] = useState<string>("");

  // Material selection
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const activePreset = MATERIAL_PRESETS[presetIndex];
  const [selectedBrand, setSelectedBrand] = useState<string>(activePreset.brands[0]);
  const [quantity, setQuantity] = useState<number>(activePreset.defaultQty);
  const [unit, setUnit] = useState<string>(activePreset.defaultUnit);
  const [rate, setRate] = useState<number>(activePreset.unitRates);

  // Delivery specifications
  const [deliveryTiming, setDeliveryTiming] = useState<string>("Kal Subah 8:00 AM (Urgent)");
  const [unloadingOption, setUnloadingOption] = useState<string>("Site par hamare mazdoor utrai kareinge");
  const [siteAddress, setSiteAddress] = useState<string>("Plot #42, Street 5, Main Boulevard");
  const [additionalNote, setAdditionalNote] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Update phone when vendor changes
  React.useEffect(() => {
    if (selectedVendorId && selectedVendorId !== "custom") {
      const v = vendors.find((vend) => vend.id === selectedVendorId);
      if (v) {
        setVendorPhone(v.whatsappNumber || v.mobileNumber || "");
      }
    }
  }, [selectedVendorId, vendors]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const generateSlipText = () => {
    const projName = activeProject ? activeProject.projectName : "Site Project";
    const vendorObj = vendors.find((v) => v.id === selectedVendorId);
    const vendorDisplayName = selectedVendorId === "custom" ? customVendorName || "Haji Sahab" : vendorObj?.vendorName || "Haji Sahab";

    const totalEstimate = quantity * rate;

    return `📦 *BuildCost Connect — Material Order Slip*
Assalam-o-Alaikum ${vendorDisplayName},

*Project:* ${projName}
*Site Address:* ${siteAddress}

*Order Details:*
• *Item:* ${activePreset.category} — ${selectedBrand}
• *Quantity Required:* ${quantity} ${unit}
• *Agreed Rate:* PKR ${rate.toLocaleString()} / ${unit}
• *Approx. Order Value:* PKR ${totalEstimate.toLocaleString()}

*Delivery Logistics:*
• *Delivery Timing:* ${deliveryTiming}
• *Unloading (Utrai):* ${unloadingOption}
${additionalNote.trim() ? `• *Note:* ${additionalNote.trim()}\n` : ""}
Meherbani farma kar gaari dispatch kar ke driver ka naam, mobile number aur gaari number share kar dein taake gate pass tayyar rakhein.

JazakAllah Khair!`;
  };

  const handleCopy = () => {
    const text = generateSlipText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    notify("WhatsApp order slip copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = (saveOrder: boolean = true) => {
    const text = generateSlipText();
    const rawNumber = vendorPhone.replace(/[^0-9]/g, "");
    const formattedPhone = rawNumber.startsWith("0") ? "92" + rawNumber.slice(1) : rawNumber;

    if (saveOrder && selectedProjectId) {
      try {
        addPurchase({

          userId: "guest",
          projectId: selectedProjectId,
          vendorId: selectedVendorId !== "custom" ? selectedVendorId : undefined,
          vendorName: selectedVendorId === "custom" ? customVendorName : vendors.find((v) => v.id === selectedVendorId)?.vendorName,
          materialId: `mat_${activePreset.category.toLowerCase()}`,
          materialName: `${activePreset.category} (${selectedBrand})`,
          brand: selectedBrand,
          quantity,
          unit,
          rate,
          subtotal: quantity * rate,
          discount: 0,
          transportCharges: 0,
          loadingCharges: 0,
          unloadingCharges: 0,
          otherCharges: 0,
          totalAmount: quantity * rate,
          status: "ordered",
          paymentStatus: "unpaid",
          purchaseDate: new Date().toISOString().split("T")[0],
          notes: `WhatsApp Order Slip sent: ${deliveryTiming}`
        });

        notify("Order automatically logged into Purchases!", "success");
      } catch (err) {
        console.warn("Could not auto log purchase:", err);
      }
    }

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, "_blank");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-slate-800 dark:text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Contractor &amp; Site Utility
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1-Click WhatsApp Material Order Slip
            </h2>
          </div>
        </div>

        {/* Preset Category Chips */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Material Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {MATERIAL_PRESETS.map((preset, idx) => (
              <button
                key={preset.category}
                type="button"
                onClick={() => {
                  setPresetIndex(idx);
                  setSelectedBrand(preset.brands[0]);
                  setQuantity(preset.defaultQty);
                  setUnit(preset.defaultUnit);
                  setRate(preset.unitRates);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                  presetIndex === idx
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Details */}
        <div className="space-y-3 text-xs">
          {/* Project & Vendor row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Supplier *
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendorName} ({v.category})
                  </option>

                ))}
                <option value="custom">+ Custom / New Vendor</option>
              </select>
            </div>
          </div>

          {/* Custom Vendor Details (if custom selected) */}
          {selectedVendorId === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haji Cement Store"
                  value={customVendorName}
                  onChange={(e) => setCustomVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="03001234567"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Material Brand & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Spec *
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {activePreset.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity *
              </label>
              <div className="flex">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate (PKR/{unit}) *
              </label>
              <input
                type="number"
                min={0}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Delivery Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Delivery Timing *
              </label>
              <select
                value={deliveryTiming}
                onChange={(e) => setDeliveryTiming(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Kal Subah 8:00 AM (Urgent)">Kal Subah 8:00 AM (Urgent)</option>
                <option value="Aaj Sham Tak (Same Day)">Aaj Sham Tak (Same Day)</option>
                <option value="Kal Dopahar 12:00 PM Tak">Kal Dopahar 12:00 PM Tak</option>
                <option value="Within 2 Days">Within 2 Days</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unloading (اترائی) *
              </label>
              <select
                value={unloadingOption}
                onChange={(e) => setUnloadingOption(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Site par hamare mazdoor utrai kareinge">Site par hamare mazdoor utrai kareinge</option>
                <option value="Driver ke sath 2 mazdoor bhejein utrai ke liye">Driver ke sath 2 mazdoor bhejein utrai ke liye</option>
                <option value="Trolley hydraulically dump karni hai">Trolley hydraulically dump karni hai</option>
              </select>
            </div>
          </div>

          {/* Address & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site Address
              </label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Special Instructions / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh stock only, no hardened bags"
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Message Slip Preview */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
              Formatted WhatsApp Message Preview:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
          </div>
          <pre className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {generateSlipText()}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            * Automatically logs into <span className="font-bold text-emerald-600 dark:text-emerald-400">Purchases &amp; Orders</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSendWhatsApp(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
