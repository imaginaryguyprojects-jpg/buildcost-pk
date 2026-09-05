"use client";

import React, { useState } from "react";
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
  HelpCircle
} from "lucide-react";

type PaymentProvider = "easypaisa" | "jazzcash" | "bank_transfer";

export function PaymentCheckoutModal() {
  const { checkoutModalOpen, closeCheckoutModal, openUpgradeModal, showToast, user } = useAuthStore();
  const {
    easypaisa,
    jazzcash,
    bankTransfer,
    adminWhatsApp,
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
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTrx, setSubmittedTrx] = useState("");

  if (!checkoutModalOpen) return null;

  const amount = billingInterval === "monthly" ? proMonthlyRate : proAnnualRate;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast(`Copied ${text} to clipboard`, "info");
  };

  const handleOpenWhatsAppSlip = (customTrx?: string) => {
    const targetTrx = customTrx || trxId;
    const url = getWhatsAppPaymentUrl({
      name: senderName || user?.fullName || "Valued Customer",
      email: user?.email || "customer@buildcost.pk",
      paymentMethod: provider,
      amount,
      trxId: targetTrx || "TRX-PENDING"
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

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

    // Submit verification to system settings store queue (Section 110 & 111)
    submitPaymentVerification({
      userName: senderName.trim(),
      userEmail: user?.email || "customer@buildcost.pk",
      userPhone: senderMobile.trim() || "0300-XXXXXXX",
      plan: billingInterval === "monthly" ? "pro_monthly" : "pro_annual",
      amountPkr: amount,
      provider,
      trxId: trxId.trim(),
      screenshotName: screenshotUploaded ? "payment_receipt.jpg" : "unattached_receipt.jpg"
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
          /* Submission Success State (Section 110: Status = PENDING) */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-2">
                Status: Pending Admin Verification
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment Verification Submitted!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{senderName}</strong>. Your transaction reference <strong>{submittedTrx}</strong> has been logged into our admin verification queue.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Method:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{provider.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary Account:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {provider === "easypaisa"
                    ? `${easypaisa.accountNumber} (${easypaisa.accountName})`
                    : provider === "jazzcash"
                    ? `${jazzcash.accountNumber} (${jazzcash.accountName})`
                    : `${bankTransfer.bankName}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rs. {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{submittedTrx}</span>
              </div>
            </div>

            {/* Section 108: Send Payment Slip on WhatsApp Button */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Expedite Approval via WhatsApp</span>
              </div>
              <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 leading-relaxed">
                You can optionally send your payment receipt directly to the Admin WhatsApp (<strong>{adminWhatsApp}</strong>) for faster verification.
              </p>
              <button
                type="button"
                onClick={() => handleOpenWhatsAppSlip(submittedTrx)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Payment Slip on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            {/* Section 119: Payment Disclaimer */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic px-2">
              &ldquo;After making your payment, submit the transaction/reference number and payment slip for verification. Pro access will be activated after payment verification.&rdquo;
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={closeCheckoutModal}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Done / Return to Dashboard
              </button>
            </div>
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
                        {easypaisa.accountNumber}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Name: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{easypaisa.accountName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(easypaisa.accountNumber, "easypaisa")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-xs"
                    >
                      {copiedKey === "easypaisa" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "easypaisa" ? "Copied" : "Copy Easypaisa Number"}</span>
                    </button>
                  </div>

                  {/* Action Buttons for Easypaisa per Section 109 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${easypaisa.accountNumber.replace(/-/g, "")}`}
                      className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pay via Easypaisa</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppSlip()}
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
                      <li>Send <strong>Rs. {amount.toLocaleString()}</strong> to configured Easypaisa account (<strong>{easypaisa.accountNumber}</strong> - <strong>{easypaisa.accountName}</strong>).</li>
                      <li>Enter the transaction / reference number below.</li>
                      <li>Upload payment screenshot / slip.</li>
                      <li>Submit payment verification request.</li>
                      <li>Optionally contact Admin on WhatsApp (<strong>{adminWhatsApp}</strong>).</li>
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
                        {jazzcash.accountNumber}
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Name: <span className="text-rose-700 dark:text-rose-400 font-bold">{jazzcash.accountName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(jazzcash.accountNumber, "jazzcash")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-xs"
                    >
                      {copiedKey === "jazzcash" ? <Check className="w-3.5 h-3.5 text-rose-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "jazzcash" ? "Copied" : "Copy JazzCash Number"}</span>
                    </button>
                  </div>

                  {/* Action Buttons for JazzCash */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${jazzcash.accountNumber.replace(/-/g, "")}`}
                      className="py-2 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                    >
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>Pay via JazzCash</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppSlip()}
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
                      <li>Send <strong>Rs. {amount.toLocaleString()}</strong> to <strong>{jazzcash.accountNumber}</strong> ({jazzcash.accountName}).</li>
                      <li>Take a screenshot or note the 10-12 digit TID / Transaction Reference.</li>
                      <li>Attach receipt or share slip directly to WhatsApp (<strong>{adminWhatsApp}</strong>).</li>
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
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{bankTransfer.bankName}</div>
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                        Account Title: <span className="text-cyan-700 dark:text-cyan-400 font-bold">{bankTransfer.accountName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">IBAN / Raast ID</span>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{bankTransfer.iban}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankTransfer.iban || "", "iban")}
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
                      onClick={() => handleOpenWhatsAppSlip()}
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
                      <li>Transfer <strong>Rs. {amount.toLocaleString()}</strong> to IBAN <strong>{bankTransfer.iban}</strong>.</li>
                      <li>Enter your Bank Reference / Transaction ID below.</li>
                      <li>Share receipt image via WhatsApp (<strong>{adminWhatsApp}</strong>).</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Sender Details Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Transaction Reference ID (TRX / TID) *
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 11-digit TRX ID or Bank Transfer Reference"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Upload Screenshot Proof */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Payment Receipt Screenshot (JPG / PNG)
                </label>
                <div
                  onClick={() => setScreenshotUploaded(!screenshotUploaded)}
                  className={`p-3 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                    screenshotUploaded
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500"
                  }`}
                >
                  {screenshotUploaded ? (
                    <>
                      <FileCheck2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-xs">Receipt attached: payment_slip.jpg (Click to change)</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      <span>Click to upload receipt screenshot</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 119: MANDATORY PAYMENT DISCLAIMER */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Payment Notice:</strong> After making your payment, submit the transaction/reference number and payment slip for verification. Pro access will be activated after payment verification.
              </span>
            </div>

            {/* Submit Button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Submit Payment for Admin Verification</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsAppSlip()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-100"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Need assistance? WhatsApp Admin ({adminWhatsApp})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
