"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { PurchaseOrder, PurchaseStatus, PurchasePaymentStatus } from "@buildcost/types";
import { AddPurchaseModal } from "@/components/purchases/AddPurchaseModal";
import { ProFeatureLock } from "@/components/pro/ProFeatureLock";
import { ProBadge } from "@/components/pro/ProBadge";
import {
  ShoppingCart,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Share2,
  MessageSquare,
  Eye,
  X,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PurchasesPage() {
  const { purchases, projects, vendors, updatePurchaseStatus } = useProjectStore();
  const { user, notify, openUpgradeModal } = useAuthStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const [viewBillOrder, setViewBillOrder] = useState<PurchaseOrder | null>(null);

  // Filtered orders
  const filteredPurchases = purchases.filter((po) => {
    if (selectedProjectId !== "all" && po.projectId !== selectedProjectId) return false;
    if (selectedStatus !== "all" && po.status !== selectedStatus) return false;
    if (selectedPaymentStatus !== "all" && po.paymentStatus !== selectedPaymentStatus) return false;
    return true;
  });

  // Summaries
  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const deliveredAmount = filteredPurchases
    .filter((p) => p.status === "delivered")
    .reduce((sum, p) => sum + p.totalAmount, 0);
  const pendingDeliveryCount = filteredPurchases.filter((p) => p.status === "ordered").length;
  const unpaidCount = filteredPurchases.filter((p) => p.paymentStatus === "unpaid").length;

  const handleMarkDelivered = (po: PurchaseOrder) => {
    updatePurchaseStatus(po.id, "delivered");
    notify(`Order for ${po.quantity} ${po.unit} ${po.materialName} marked as DELIVERED. Inventory updated!`, "success");
  };

  const handleSendVendorWhatsApp = (po: PurchaseOrder) => {
    const vendor = vendors.find((v) => v.id === po.vendorId);
    const rawNumber = vendor ? (vendor.whatsappNumber || vendor.mobileNumber).replace(/[^0-9]/g, "") : "";
    const phone = rawNumber.startsWith("0") ? "92" + rawNumber.slice(1) : rawNumber;

    const text = `📦 *BuildCost Connect — Purchase Order Confirmation*\n\n*Supplier:* ${po.vendorName || "Respected Vendor"}\n*Material:* ${po.materialName} ${po.brand ? `(${po.brand})` : ""}\n*Quantity:* ${po.quantity} ${po.unit}\n*Delivered Rate:* PKR ${po.rate.toLocaleString()} / ${po.unit}\n*Total Order Value:* PKR ${po.totalAmount.toLocaleString()}\n*Status:* ${po.status.toUpperCase()}\n*Delivery Date:* ${po.expectedDeliveryDate || "Immediate"}\n\nPlease dispatch this order to site and confirm receipt.\nThank you.`;

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Material Purchases &amp; Orders</span>
              <ProBadge size="sm" variant="amber" showIcon />
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500">
            Track site deliveries, receipts, invoices, and automated inventory sync.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isPro) {
              openUpgradeModal("Material Purchases & Orders");
              return;
            }
            setAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/20 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Purchase</span>
          {!isPro && <ProBadge size="xs" variant="amber" />}
        </button>
      </div>

      {!isPro ? (
        <div className="space-y-6">
          <ProFeatureLock
            title="Purchases, Bill Uploads & Weighbridge Slips"
            subtitle="Available with PRO"
            capabilities={[
              "Log daily material purchases directly from site gate (Cement, Saria, Bricks)",
              "Upload photos of vendor bills, receipts & weighbridge (Kanda) slips",
              "Auto-reconcile delivered quantities against estimated BOQ limits",
              "Filter purchases by project, supplier, and payment status",
              "Track delivery dates, drivers, and truck numbers"
            ]}
            backUrl="/calculator"
            backLabel="Continue with Free Calculators"
          />
        </div>
      ) : (
        <>

      {/* Overview Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Orders Value</div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            PKR {totalAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{filteredPurchases.length} total orders</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Delivered to Site</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            PKR {deliveredAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Safely stocked on site</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 bg-amber-50/20">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Pending Deliveries</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {pendingDeliveryCount} Orders
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">In transit from supplier</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Unpaid Invoices</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {unpaidCount} Bills
          </div>
          <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-1">Awaiting payment settlement</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        {/* Project Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered (Pending)</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500">Payment:</span>
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Payments</option>
            <option value="unpaid">Unpaid (Udhaar)</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Purchases List */}
      <div className="space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No purchase records found</div>
            <p className="text-xs text-slate-400 mt-1">Record purchases to track deliveries and material costs.</p>
          </div>
        ) : (
          filteredPurchases.map((po) => {
            const project = projects.find((p) => p.id === po.projectId);

            return (
              <div
                key={po.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {po.quantity} {po.unit} — {po.materialName}
                    </h3>
                    {po.brand && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {po.brand}
                      </span>
                    )}
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        po.status === "delivered" && "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800",
                        po.status === "ordered" && "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800",
                        po.status === "draft" && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                        po.status === "cancelled" && "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                      )}
                    >
                      {po.status}
                    </span>
                    {/* Payment Badge */}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        po.paymentStatus === "paid" && "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
                        po.paymentStatus === "partially_paid" && "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
                        po.paymentStatus === "unpaid" && "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                      )}
                    >
                      {po.paymentStatus.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Project: <strong className="text-slate-700 dark:text-slate-300">{project?.projectName || "Default"}</strong></span>
                    {po.vendorName && (
                      <span>Supplier: <strong className="text-slate-700 dark:text-slate-300">{po.vendorName}</strong></span>
                    )}
                    <span>Date: {po.purchaseDate}</span>
                    {po.transportCharges > 0 && (
                      <span>Freight: Rs {po.transportCharges.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Right Financials & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                      PKR {po.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      @ Rs {po.rate.toLocaleString()} / {po.unit}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp confirmation */}
                    <button
                      type="button"
                      onClick={() => handleSendVendorWhatsApp(po)}
                      title="Send WhatsApp PO Slip"
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* View Bill receipt if available */}
                    {po.billUrl && (
                      <button
                        type="button"
                        onClick={() => setViewBillOrder(po)}
                        title="View Receipt"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Mark as delivered button */}
                    {po.status === "ordered" && (
                      <button
                        type="button"
                        onClick={() => handleMarkDelivered(po)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Received</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Preview Modal */}
      {viewBillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Supplier Bill / Receipt — {viewBillOrder.materialName}
              </h3>
              <button
                type="button"
                onClick={() => setViewBillOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
              {viewBillOrder.billUrl && (
                <img
                  src={viewBillOrder.billUrl}
                  alt="Supplier Invoice"
                  className="max-h-96 rounded-xl object-contain border border-slate-200 dark:border-slate-800 shadow-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      <AddPurchaseModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
        </>
      )}
    </div>
  );
}
