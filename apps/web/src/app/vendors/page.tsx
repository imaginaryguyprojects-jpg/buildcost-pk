"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { Vendor, VendorCategory } from "@buildcost/types";
import { AddVendorModal } from "@/components/vendors/AddVendorModal";
import { ProFeatureLock } from "@/components/pro/ProFeatureLock";
import { ProBadge } from "@/components/pro/ProBadge";
import {
  Building2,
  Plus,
  Phone,
  MessageSquare,
  FileText,
  Star,
  DollarSign,
  Wallet,
  Clock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  X,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VendorsPage() {
  const { vendors, purchases, recordVendorPayment, deleteVendor, materialRates } = useProjectStore();
  const { user, notify, openUpgradeModal } = useAuthStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeLedgerVendor, setActiveLedgerVendor] = useState<Vendor | null>(null);
  const [paymentModalVendor, setPaymentModalVendor] = useState<Vendor | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "cheque">("cash");

  // Summary totals
  const totalPurchases = vendors.reduce((acc, v) => acc + (v.totalPurchases || 0), 0);
  const totalPaid = vendors.reduce((acc, v) => acc + (v.totalPaid || 0), 0);
  const totalOutstanding = vendors.reduce((acc, v) => acc + (v.outstandingBalance || 0), 0);

  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== "all" && v.category !== selectedCategory) return false;
    return true;
  });

  const handleWhatsAppContact = (vendor: Vendor) => {
    const rawNumber = (vendor.whatsappNumber || vendor.mobileNumber).replace(/[^0-9]/g, "");
    const formattedNumber = rawNumber.startsWith("0") ? "92" + rawNumber.slice(1) : rawNumber;
    const message = `Assalam-o-Alaikum ${vendor.vendorName} sb,\n\nI am contacting you from BuildCost Connect regarding construction material supplies (${vendor.category.toUpperCase()}). Could you please share your latest delivered rates and availability?\n\nThank you.`;
    window.open(`https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalVendor || paymentAmount <= 0) {
      notify("Please enter a valid payment amount.", "error");
      return;
    }

    recordVendorPayment({
      userId: "guest",
      vendorId: paymentModalVendor.id,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod
    });

    notify(`Payment of PKR ${paymentAmount.toLocaleString()} recorded for ${paymentModalVendor.businessName}.`, "success");
    setPaymentModalVendor(null);
    setPaymentAmount(0);
  };

  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Vendor Directory &amp; Khata Ledger</span>
              <ProBadge size="sm" variant="amber" showIcon />
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Manage material suppliers, contact via Call/WhatsApp, and track supplier khata (واجب الادا).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isPro) {
              openUpgradeModal("Vendor Management & Khata Ledger");
              return;
            }
            setAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vendor</span>
          {!isPro && <ProBadge size="xs" variant="amber" />}
        </button>
      </div>

      {!isPro ? (
        <div className="space-y-6">
          <ProFeatureLock
            title="Vendor Management & WhatsApp Khata Ledger"
            subtitle="Available with PRO"
            capabilities={[
              "Directory of material suppliers (Cement dealers, Steel mills, Bhatta bricks)",
              "Digital Khata ledger & Udhaar credit balance tracking (واجب الادا)",
              "Automated 1-click WhatsApp payment reminders with balance summary",
              "Supplier payment history, cheque numbers & cleared transaction receipts",
              "Direct reconciliation with site purchase orders and material delivery slips"
            ]}
            backUrl="/calculator"
            backLabel="Continue with Free Calculators"
          />
        </div>
      ) : (
        <>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Orders Placed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            PKR {totalPurchases.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all registered suppliers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Amount Paid</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            PKR {totalPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cleared invoices &amp; advances</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 bg-rose-50/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-semibold mb-2">
            <span>Outstanding Udhaar (واجب الادا)</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            PKR {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Pending payments to vendors</div>
        </div>
      </div>

      {/* Vendor Rate & Transport Comparison (Section 80) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Vendor Delivered Rate Comparison (Market vs. Supplier Logistics)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">True landed cost including freight &amp; unloading charges</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Comparison 1: Cement */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>Bestway / Fauji Cement (200 Bags)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Islamabad / RWP</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Al-Madina Traders</div>
                <div className="text-slate-500 text-[11px]">Base: Rs. 1,420/bag</div>
                <div className="text-slate-500 text-[11px]">Freight: Rs. 6,000 (Rs. 30/bag)</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Landed: Rs. 1,450/bag
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Fauji Direct Agency</span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Save Rs. 5</span>
                </div>
                <div className="text-slate-500 text-[11px]">Base: Rs. 1,440/bag</div>
                <div className="text-slate-500 text-[11px]">Freight: Rs. 1,000 (Rs. 5/bag)</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Landed: Rs. 1,445/bag (Best)
                </div>
              </div>
            </div>
          </div>

          {/* Comparison 2: Grade 60 Steel */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span>Grade 60 Deformed Rebar (5 Tons)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Lahore / Gujranwala</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Mughal Steel Dealer</div>
                <div className="text-slate-500 text-[11px]">Base: Rs. 260,000/ton</div>
                <div className="text-slate-500 text-[11px]">Trailer: Rs. 15,000</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Landed: Rs. 263,000/ton
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/20">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Ittefaq Mills Outlet</span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">Save Rs. 600</span>
                </div>
                <div className="text-slate-500 text-[11px]">Base: Rs. 258,000/ton</div>
                <div className="text-slate-500 text-[11px]">Trailer: Rs. 22,000</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Landed: Rs. 262,400/ton (Best)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {["all", "cement", "steel", "bricks", "sand", "crush", "tiles", "paint", "plumbing", "electrical"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors",
              selectedCategory === cat
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          return (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Vendor Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {vendor.businessName}
                      </h3>
                      {vendor.status === "preferred" && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Preferred
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Contact: {vendor.vendorName}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {vendor.category}
                  </span>
                </div>

                {/* Address & Phone */}
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                  {vendor.address && (
                    <div className="truncate text-slate-500">{vendor.address}</div>
                  )}
                  <div className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                    {vendor.mobileNumber}
                  </div>
                </div>

                {/* Khata Ledger Mini Summary */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Purchases:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      Rs {(vendor.totalPurchases || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Paid so far:</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      Rs {(vendor.totalPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Balance Due:</span>
                    <span
                      className={cn(
                        "font-mono font-bold",
                        (vendor.outstandingBalance || 0) > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      Rs {(vendor.outstandingBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${vendor.mobileNumber}`}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Call Vendor"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleWhatsAppContact(vendor)}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 transition-colors"
                  title="WhatsApp Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLedgerVendor(vendor)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ledger</span>
                </button>

                {(vendor.outstandingBalance || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalVendor(vendor);
                      setPaymentAmount(vendor.outstandingBalance || 0);
                    }}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vendor Ledger Modal */}
      {activeLedgerVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Khata Ledger: {activeLedgerVendor.businessName}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeLedgerVendor.vendorName} • {activeLedgerVendor.mobileNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLedgerVendor(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-slate-500">Total Invoiced</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    Rs {(activeLedgerVendor.totalPurchases || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Total Paid</div>
                  <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                    Rs {(activeLedgerVendor.totalPaid || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Remaining Balance</div>
                  <div className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                    Rs {(activeLedgerVendor.outstandingBalance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Order &amp; Invoices History
                </h4>
                {purchases.filter((p) => p.vendorId === activeLedgerVendor.id).length === 0 ? (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    No orders recorded with this supplier yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {purchases
                      .filter((p) => p.vendorId === activeLedgerVendor.id)
                      .map((po) => (
                        <div
                          key={po.id}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {po.quantity} {po.unit} {po.materialName}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {po.purchaseDate} • Status: {po.status} • Payment: {po.paymentStatus}
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                            Rs {po.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Record Payment to {paymentModalVendor.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalVendor(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (PKR) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-emerald-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Current outstanding: Rs {(paymentModalVendor.outstandingBalance || 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="cash">Cash (روپیہ نقد)</option>
                  <option value="bank_transfer">Online Bank Transfer</option>
                  <option value="cheque">Bank Cheque</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalVendor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/20"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
        </>
      )}
    </div>
  );
}
