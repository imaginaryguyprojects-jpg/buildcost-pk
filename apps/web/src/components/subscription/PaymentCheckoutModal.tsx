"use client";

import React, { useState, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSystemSettingsStore } from "@/stores/systemSettingsStore";
import {
  CreditCard,
  Building2,
  Phone,
  CheckCircle2,
  X,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Calendar,
  FileText,
  Share2,
  Eye,
  Trash2,
  Send
} from "lucide-react";

type PaymentProvider = "easypaisa" | "jazzcash" | "bank_transfer";

export function PaymentCheckoutModal() {
  const { checkoutModalOpen, closeCheckoutModal, openUpgradeModal, showToast, user } = useAuthStore();
  const {
    easypaisa,
    jazzcash,
    bankTransfer,
    paymentAccounts,
    adminWhatsApp,
    adminWhatsAppRaw,
    adminEmail,
    submitPaymentVerification,
    getWhatsAppPaymentUrl,
    proMonthlyRate,
    proAnnualRate
  } = useSystemSettingsStore();

  const [provider, setProvider] = useState<PaymentProvider>("easypaisa");
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [senderName, setSenderName] = useState(user?.fullName || "");
  const [senderMobile, setSenderMobile] = useState(user?.phone || "");
  const [trxId, setTrxId] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [userNote, setUserNote] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTrx, setSubmittedTrx] = useState("");
  const [viewingSlipDetails, setViewingSlipDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeEasypaisa = paymentAccounts.find((a) => a.type === "easypaisa" && a.isDefault && a.isActive) ||
    paymentAccounts.find((a) => a.type === "easypaisa" && a.isActive) || {
      accountTitle: easypaisa.accountName,
      accountNumber: easypaisa.accountNumber,
      whatsappForSlip: adminWhatsApp,
      instructions: "Send the subscription fee to Easypaisa account. Copy the 11-digit TID and upload screenshot or share via WhatsApp."
    };

  const activeJazzcash = paymentAccounts.find((a) => a.type === "jazzcash" && a.isDefault && a.isActive) ||
    paymentAccounts.find((a) => a.type === "jazzcash" && a.isActive) || {
      accountTitle: jazzcash.accountName,
      accountNumber: jazzcash.accountNumber,
      whatsappForSlip: adminWhatsApp,
      instructions: "Open JazzCash app > Money Transfer > Mobile Account. Send payment, enter Transaction Reference (TID), and share slip on WhatsApp."
    };

  const activeBank = paymentAccounts.find((a) => a.type === "bank_transfer" && a.isDefault && a.isActive) ||
    paymentAccounts.find((a) => a.type === "bank_transfer" && a.isActive) || {
      accountTitle: bankTransfer.accountName,
      accountNumber: bankTransfer.accountNumber,
      bankName: bankTransfer.bankName,
      iban: bankTransfer.iban,
      whatsappForSlip: adminWhatsApp,
      instructions: "Transfer via Raast or IBAN from any banking app. Enter Transaction ID and upload screenshot slip for instant admin approval."
    };

  if (!checkoutModalOpen) return null;

  const amount = billingInterval === "monthly" ? proMonthlyRate : proAnnualRate;
  const providerLabel = provider === "easypaisa" ? "Easypaisa" : provider === "jazzcash" ? "JazzCash" : "Bank Transfer";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast(`Copied ${text} to clipboard`, "info");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be under 10MB", "error");
      return;
    }
    setSlipFile(file);
    setScreenshotUploaded(true);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    showToast(`Attached ${file.name}`, "success");
  };

  const handleRemoveFile = () => {
    setSlipFile(null);
    setSlipPreview(null);
    setScreenshotUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const buildWhatsAppMessage = (customTrx?: string) => {
    const targetTrx = customTrx || trxId.trim();
    return (
      `PRO Upgrade Payment\n\n` +
      `Name: ${senderName.trim() || user?.fullName || "Valued Customer"}\n` +
      `Email: ${user?.email || "customer@buildcost.pk"}\n` +
      `Amount: PKR ${amount.toLocaleString()}\n` +
      `Payment Method: ${providerLabel}\n` +
      `Transaction ID: ${targetTrx || "PENDING"}\n` +
      `Payment Date: ${paymentDate}\n\n` +
      `"Payment slip attached."`
    );
  };

  // Dedicated "Send Slip on WhatsApp" flow (Section 1 & 2)
  const handleSendSlipOnWhatsApp = async () => {
    if (!senderName.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    if (!trxId.trim()) {
      showToast("Please enter the Transaction ID / Reference Number", "error");
      return;
    }
    if (!paymentDate) {
      showToast("Please select the payment date", "error");
      return;
    }
    if (!slipFile && !screenshotUploaded) {
      showToast("Please upload your payment slip/screenshot before sending via WhatsApp", "error");
      return;
    }

    // 1. Save submission to queue
    submitPaymentVerification({
      userName: senderName.trim(),
      userEmail: user?.email || "customer@buildcost.pk",
      userPhone: senderMobile.trim() || "0300-XXXXXXX",
      plan: billingInterval === "monthly" ? "pro_monthly" : "pro_annual",
      amountPkr: amount,
      provider,
      trxId: trxId.trim(),
      screenshotName: slipFile ? slipFile.name : "payment_slip.jpg",
      paymentDate,
      note: userNote.trim()
    });

    setSubmittedTrx(trxId.trim());
    setIsSubmitted(true);

    // 2. Prepare message
    const waText = buildWhatsAppMessage(trxId.trim());

    // 3. Web Share API on Android / mobile devices
    if (navigator.canShare && slipFile && navigator.canShare({ files: [slipFile] })) {
      try {
        await navigator.share({
          files: [slipFile],
          title: "PRO Upgrade Payment",
          text: waText
        });
        showToast("Sharing slip via native share sheet", "success");
        return;
      } catch {
        // Fallback to click-to-chat if user dismissed or cancelled share dialog
      }
    }

    // 4. Official WhatsApp click-to-chat deep-link (Section 108)
    const encoded = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${adminWhatsAppRaw}?text=${encoded}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    showToast("Opened WhatsApp with payment details. Please attach your receipt and tap Send.", "info");
  };

  // Standard "Submit Payment" flow
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      showToast("Please enter your name", "error");
      return;
    }
    if (!trxId.trim()) {
      showToast("Please enter the Transaction ID / Reference Number", "error");
      return;
    }
    if (!paymentDate) {
      showToast("Please select the payment date", "error");
      return;
    }

    submitPaymentVerification({
      userName: senderName.trim(),
      userEmail: user?.email || "customer@buildcost.pk",
      userPhone: senderMobile.trim() || "0300-XXXXXXX",
      plan: billingInterval === "monthly" ? "pro_monthly" : "pro_annual",
      amountPkr: amount,
      provider,
      trxId: trxId.trim(),
      screenshotName: slipFile ? slipFile.name : screenshotUploaded ? "payment_receipt.jpg" : "unattached_receipt.jpg",
      paymentDate,
      note: userNote.trim()
    });

    setSubmittedTrx(trxId.trim());
    setIsSubmitted(true);
    showToast("Payment verification request submitted for Admin review", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                closeCheckoutModal();
                openUpgradeModal();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to plan overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pakistan Payment Gateway
              </h2>
              <p className="text-[11px] text-slate-500">
                Official verified manual payment workflow for BuildCost Pro
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckoutModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* ========================================================
             WHATSAPP PAYMENT CONFIRMATION SCREEN (Section 3)
             ======================================================== */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
                Status: Pending Verification
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Submitted
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed font-medium">
                Please send your payment slip to the admin on WhatsApp. Your Pro subscription will activate after admin verification.
              </p>
            </div>

            {/* Structured Payment Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  PKR {amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {providerLabel}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                  {submittedTrx}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {paymentDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Pending Verification
                </span>
              </div>
            </div>

            {/* WhatsApp Prominent Action Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-500/40 dark:border-emerald-700/60 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Admin WhatsApp: {adminWhatsApp}</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Click below to open WhatsApp with your pre-filled verification details. Don&apos;t forget to attach your payment receipt screenshot before tapping send!
              </p>
              <button
                type="button"
                onClick={() => {
                  const waText = buildWhatsAppMessage(submittedTrx);
                  const encoded = encodeURIComponent(waText);
                  window.open(`https://wa.me/${adminWhatsAppRaw}?text=${encoded}`, "_blank", "noopener,noreferrer");
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Slip on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>

            {/* Action Buttons: [View Payment] & [Back to Dashboard] */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setViewingSlipDetails(!viewingSlipDetails)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{viewingSlipDetails ? "Hide Details" : "View Payment"}</span>
              </button>

              <button
                type="button"
                onClick={closeCheckoutModal}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Expandable View Payment Details */}
            {viewingSlipDetails && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-left text-xs space-y-2 animate-in fade-in">
                <div className="font-bold text-slate-700 dark:text-slate-300">Payment Verification Snapshot:</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Customer: <strong>{senderName}</strong> ({user?.email})</div>
                  <div>Phone: <strong>{senderMobile || "N/A"}</strong></div>
                  <div>Reference: <span className="font-mono">{submittedTrx}</span></div>
                  {userNote && <div>Note: <em>&ldquo;{userNote}&rdquo;</em></div>}
                  {slipPreview && (
                    <div className="mt-2">
                      <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Uploaded Receipt Preview:</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slipPreview} alt="Receipt preview" className="max-h-36 rounded-lg border border-slate-300 dark:border-slate-700 object-contain mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleSubmitProof} className="space-y-5 text-xs">
            {/* Plan Duration Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-center ${
                  billingInterval === "monthly"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly Plan (Rs. {proMonthlyRate.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("annual")}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-center ${
                  billingInterval === "annual"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Annual Plan (Rs. {proAnnualRate.toLocaleString()})
                <span className="text-[9px] block text-emerald-600 dark:text-emerald-400 font-normal">Save Rs. 4,000</span>
              </button>
            </div>

            {/* Provider Selector Tabs */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
                Select Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* Easypaisa */}
                <button
                  type="button"
                  onClick={() => setProvider("easypaisa")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    provider === "easypaisa"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs">Easypaisa</span>
                </button>

                {/* JazzCash */}
                <button
                  type="button"
                  onClick={() => setProvider("jazzcash")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    provider === "jazzcash"
                      ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold shadow-xs ring-2 ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span className="text-xs">JazzCash</span>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setProvider("bank_transfer")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    provider === "bank_transfer"
                      ? "border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs ring-2 ring-cyan-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs">Bank / Raast</span>
                </button>
              </div>
            </div>

            {/* Selected Channel Instructions Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
              {/* SECTION 109: EASYPAISA PAYMENT METHOD */}
              {provider === "easypaisa" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Easypaisa Beneficiary Account</span>
                      <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
                        {activeEasypaisa.accountNumber}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Name: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeEasypaisa.accountTitle}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeEasypaisa.accountNumber, "easypaisa")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-xs"
                    >
                      {copiedKey === "easypaisa" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "easypaisa" ? "Copied" : "Copy Easypaisa Number"}</span>
                    </button>
                  </div>

                  {/* Action Buttons for Easypaisa per Section 109 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${activeEasypaisa.accountNumber.replace(/-/g, "")}`}
                      className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pay via Easypaisa</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSendSlipOnWhatsApp()}
                      className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Payment Slip on WhatsApp</span>
                    </button>
                  </div>

                  {/* 7-Step Instructions per Section 109 */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Payment Instructions:
                    </span>
                    <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Send <strong>Rs. {amount.toLocaleString()}</strong> to configured Easypaisa account (<strong>{activeEasypaisa.accountNumber}</strong> - <strong>{activeEasypaisa.accountTitle}</strong>).</li>
                      <li>Enter the transaction / reference number below.</li>
                      <li>Upload payment screenshot / slip.</li>
                      <li>Submit payment verification request.</li>
                      <li>Optionally contact Admin on WhatsApp (<strong>{activeEasypaisa.whatsappForSlip || adminWhatsApp}</strong>).</li>
                      <li>Admin verifies the payment.</li>
                      <li>Pro subscription is activated after approval.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* JAZZCASH METHOD */}
              {provider === "jazzcash" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">JazzCash Mobile Account</span>
                      <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
                        {activeJazzcash.accountNumber}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Name: <span className="text-rose-700 dark:text-rose-400 font-bold">{activeJazzcash.accountTitle}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeJazzcash.accountNumber, "jazzcash")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-xs"
                    >
                      {copiedKey === "jazzcash" ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "jazzcash" ? "Copied" : "Copy JazzCash Number"}</span>
                    </button>
                  </div>

                  {/* Action Buttons for JazzCash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${activeJazzcash.accountNumber.replace(/-/g, "")}`}
                      className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>Pay via JazzCash</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSendSlipOnWhatsApp()}
                      className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                      <span>Send Payment Slip on WhatsApp</span>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      JazzCash Instructions:
                    </span>
                    <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Open JazzCash app → <strong>Money Transfer</strong> → <strong>Mobile Account</strong>.</li>
                      <li>Send <strong>Rs. {amount.toLocaleString()}</strong> to <strong>{activeJazzcash.accountNumber}</strong> ({activeJazzcash.accountTitle}).</li>
                      <li>Take a screenshot or note the 10-12 digit TID / Transaction Reference.</li>
                      <li>Attach receipt or share slip directly to WhatsApp (<strong>{activeJazzcash.whatsappForSlip || adminWhatsApp}</strong>).</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* BANK TRANSFER & RAAST METHOD */}
              {provider === "bank_transfer" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Corporate Bank / Raast</span>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{activeBank.bankName || "Corporate Bank"}</div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Title: <span className="text-cyan-700 dark:text-cyan-400 font-bold">{activeBank.accountTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">IBAN / Raast ID</span>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{activeBank.iban || activeBank.accountNumber}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeBank.iban || activeBank.accountNumber, "iban")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                    >
                      {copiedKey === "iban" ? <Check className="w-3.5 h-3.5 text-cyan-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "iban" ? "Copied" : "Copy IBAN"}</span>
                    </button>
                  </div>

                  {/* WhatsApp Slip Button for Bank Transfer */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendSlipOnWhatsApp()}
                      className="w-full py-2 px-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-100"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Send Bank / Raast Slip on WhatsApp</span>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Bank Transfer Instructions:
                    </span>
                    <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Use any banking app (HBL, Meezan, Allied, MCB, UBL) or Raast Instant Transfer.</li>
                      <li>Transfer <strong>Rs. {amount.toLocaleString()}</strong> to IBAN <strong>{activeBank.iban || activeBank.accountNumber}</strong>.</li>
                      <li>Enter your Bank Reference / Transaction ID below.</li>
                      <li>Share receipt image via WhatsApp (<strong>{activeBank.whatsappForSlip || adminWhatsApp}</strong>).</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Sender Details Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Muhammad Aslam"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Sender Mobile Number
                  </label>
                  <input
                    type="text"
                    value={senderMobile}
                    onChange={(e) => setSenderMobile(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Transaction ID / Reference (TID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 11-digit TID or Bank Ref"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Amount Paid (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">Rs.</span>
                    <input
                      type="number"
                      readOnly
                      value={amount}
                      className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Optional Note
                  </label>
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="e.g. Paid via brother's Easypaisa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Screenshot / Payment Slip */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Payment Slip / Screenshot *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {slipFile || slipPreview ? (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {slipPreview ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={slipPreview} alt="Receipt preview" className="w-12 h-12 rounded-lg object-cover border border-emerald-400 shadow-xs" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600">
                          <FileCheck2 className="w-6 h-6" />
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
                          {slipFile?.name || "payment_slip.jpg"}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Receipt attached &bull; {slipFile ? `${(slipFile.size / 1024).toFixed(1)} KB` : "Ready to send"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
                        title="Change slip"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 transition-colors"
                        title="Remove slip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-6 h-6 text-emerald-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Click to upload payment slip / screenshot
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP, or PDF (Max 10MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* MANDATORY PAYMENT DISCLAIMER */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Payment Notice:</strong> After making your payment, submit the transaction reference and slip. Pro access is activated only after Admin verification.
              </span>
            </div>

            {/* DUAL ACTION BUTTONS: [Submit Payment] & [Send Slip on WhatsApp] */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSendSlipOnWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ring-2 ring-emerald-400/30 hover:ring-emerald-400/60"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Slip on WhatsApp ({adminWhatsApp})</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Submit Payment for Admin Verification</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-400">
                  Configured Admin WhatsApp: <strong className="text-slate-700 dark:text-slate-300 font-mono">{adminWhatsApp}</strong>
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
