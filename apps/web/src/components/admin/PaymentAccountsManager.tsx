"use client";

import React, { useState } from "react";
import {
  useSystemSettingsStore,
  PaymentAccount,
  PaymentAccountType
} from "@/stores/systemSettingsStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Star,
  Phone,
  Building,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: { id: PaymentAccountType; label: string; color: string }[] = [
  { id: "easypaisa", label: "Easypaisa Mobile Wallet", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  { id: "jazzcash", label: "JazzCash Mobile Account", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
  { id: "bank_transfer", label: "Corporate Bank Transfer", color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30" },
  { id: "raast", label: "Raast Instant P2P / P2M", color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30" },
  { id: "sadapay", label: "SadaPay Digital Wallet", color: "text-teal-600 bg-teal-500/10 border-teal-500/30" },
  { id: "nayapay", label: "NayaPay Digital Wallet", color: "text-orange-600 bg-orange-500/10 border-orange-500/30" },
  { id: "other", label: "Other Payment Method", color: "text-slate-600 bg-slate-500/10 border-slate-500/30" }
];

export function PaymentAccountsManager() {
  const {
    paymentAccounts,
    addPaymentAccount,
    updatePaymentAccount,
    deletePaymentAccount,
    togglePaymentAccountActive,
    setDefaultPaymentAccount,
    resetPaymentAccountsToDefault,
    adminWhatsApp
  } = useSystemSettingsStore();

  const { showToast, isSuperAdmin, user } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<PaymentAccountType>("jazzcash");
  const [title, setTitle] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [whatsappForSlip, setWhatsappForSlip] = useState(adminWhatsApp || "0345-50-74-541");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setType("jazzcash");
    setTitle("Primary JazzCash Mobile Account");
    setAccountTitle(user?.fullName || "Umer Shahzad");
    setAccountNumber("");
    setBankName("");
    setIban("");
    setWhatsappForSlip(adminWhatsApp || "0345-50-74-541");
    setInstructions("Open JazzCash app > Money Transfer > Mobile Account. Send payment, enter Transaction Reference (TID), and share slip on WhatsApp.");
    setIsActive(true);
    setIsDefault(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (account: PaymentAccount) => {
    setEditingAccount(account);
    setType(account.type);
    setTitle(account.title);
    setAccountTitle(account.accountTitle);
    setAccountNumber(account.accountNumber);
    setBankName(account.bankName || "");
    setIban(account.iban || "");
    setWhatsappForSlip(account.whatsappForSlip || adminWhatsApp || "0345-50-74-541");
    setInstructions(account.instructions || "");
    setIsActive(account.isActive);
    setIsDefault(account.isDefault);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountTitle.trim() || !accountNumber.trim()) {
      showToast("Account Title and Account / Mobile Number are required.", "error");
      return;
    }

    if (editingAccount) {
      updatePaymentAccount(editingAccount.id, {
        type,
        title: title.trim() || `${type.toUpperCase()} Account`,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim() || undefined,
        iban: iban.trim() || undefined,
        whatsappForSlip: whatsappForSlip.trim() || undefined,
        instructions: instructions.trim() || undefined,
        isActive,
        isDefault
      });
      showToast(`Updated ${accountTitle}'s ${type.toUpperCase()} account successfully!`, "success");
    } else {
      addPaymentAccount({
        type,
        title: title.trim() || `${type.toUpperCase()} Account`,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim() || undefined,
        iban: iban.trim() || undefined,
        whatsappForSlip: whatsappForSlip.trim() || undefined,
        instructions: instructions.trim() || undefined,
        isActive,
        isDefault
      });
      showToast(`Added new ${type.toUpperCase()} receiving account successfully!`, "success");
    }

    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    deletePaymentAccount(deletingId);
    showToast("Payment account removed.", "info");
    setDeletingId(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`Copied ${text} to clipboard!`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Payment & Payout Accounts (God Mode)</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full Super Admin authority to Add, Edit, or Delete receiving accounts (JazzCash, EasyPaisa, Bank, Raast). Displayed directly on customer checkout modals and WhatsApp slips.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all payment methods to default official accounts?")) {
                resetPaymentAccountsToDefault();
                showToast("Reset payment accounts to default official configuration.", "info");
              }
            }}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            title="Reset to default accounts"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paymentAccounts.map((acc) => {
          const typeConfig = ACCOUNT_TYPES.find((t) => t.id === acc.type) || ACCOUNT_TYPES[0];
          const isCopied = copiedId === acc.id;

          return (
            <div
              key={acc.id}
              className={cn(
                "relative rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs",
                acc.isActive
                  ? "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80"
              )}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="space-y-1">
                    <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border inline-block", typeConfig.color)}>
                      {typeConfig.label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {acc.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {acc.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black" title="Primary Account for this channel">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>Default</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Account Title:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                      {acc.accountTitle}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Number / Account:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {acc.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.accountNumber, acc.id)}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy Account Number"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {acc.bankName && (
                    <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bank:</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                        {acc.bankName}
                      </span>
                    </div>
                  )}

                  {acc.iban && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">IBAN / Raast:</span>
                      <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                        {acc.iban}
                      </span>
                    </div>
                  )}

                  {acc.whatsappForSlip && (
                    <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Slip WhatsApp:</span>
                      <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {acc.whatsappForSlip}
                      </span>
                    </div>
                  )}
                </div>

                {/* Instructions preview */}
                {acc.instructions && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 mb-4">
                    &ldquo;{acc.instructions}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePaymentAccountActive(acc.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors",
                      acc.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    )}
                    title="Toggle customer visibility"
                  >
                    {acc.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{acc.isActive ? "Active" : "Disabled"}</span>
                  </button>

                  {!acc.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultPaymentAccount(acc.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Set as primary default"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit account details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingId(acc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingAccount ? "Edit Payment Method" : "Add New Payment Method"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live updates to customer checkout modal and pricing tables.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Type Selection */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Payment Channel Type
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as PaymentAccountType;
                    setType(newType);
                    if (!editingAccount) {
                      if (newType === "easypaisa") {
                        setTitle("Easypaisa Mobile Wallet");
                        setInstructions("Send subscription fee to Easypaisa account. Copy the 11-digit TID and upload screenshot or share via WhatsApp.");
                      } else if (newType === "jazzcash") {
                        setTitle("JazzCash Mobile Account");
                        setInstructions("Open JazzCash app > Money Transfer > Mobile Account. Send payment, enter Transaction Reference (TID), and share slip on WhatsApp.");
                      } else if (newType === "bank_transfer" || newType === "raast") {
                        setTitle("Bank Transfer / Raast ID");
                        setInstructions("Transfer via Raast or IBAN from any banking app. Enter Transaction ID and upload screenshot slip for instant admin approval.");
                      }
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Nickname */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Display Title (e.g. Official JazzCash Account)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Primary Easypaisa Wallet"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Account Title & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Beneficiary Account Title
                  </label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="e.g. Umer Shahzad"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Account / Mobile Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Bank Details (Conditional) */}
              {(type === "bank_transfer" || type === "raast") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Bank & Branch Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Meezan Bank Limited"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                      Corporate IBAN / Raast ID
                    </label>
                    <input
                      type="text"
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="PK72MEZN..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Slip WhatsApp Number */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  WhatsApp Number for Payment Slips
                </label>
                <input
                  type="text"
                  value={whatsappForSlip}
                  onChange={(e) => setWhatsappForSlip(e.target.value)}
                  placeholder="0345-50-74-541"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Customer Transfer Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions displayed to customers when this payment method is selected..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Active (Show to Customers)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultToggle"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="isDefaultToggle" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Set as Primary Default
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAccount ? "Save Changes" : "Create Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Delete Payment Account?
              </h3>
              <p className="text-xs text-slate-500">
                This account will no longer appear on customer checkout and payment option cards.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
