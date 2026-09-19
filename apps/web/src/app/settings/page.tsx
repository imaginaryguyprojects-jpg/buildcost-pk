"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Settings,
  Shield,
  Bell,
  Moon,
  Sun,
  Languages,
  User,
  MapPin,
  Scale,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Mail,
  Phone,
  RefreshCw,
  HelpCircle,
  Bug,
  Sparkle
} from "lucide-react";
import { PAK_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { ReportProblemModal } from "@/components/modals/ReportProblemModal";
import { WhatsNewModal } from "@/components/modals/WhatsNewModal";
import { useOfflineSync } from "@/lib/offline/OfflineSyncManager";

export default function SettingsPage() {
  const { theme, toggleTheme, selectedCityId, setSelectedCityId, marlaStandardId, setMarlaStandardId } = useProjectStore();
  const { user, isAuthenticated, updateProfile, deleteAccount, showToast, openLoginModal } = useAuthStore();
  const { isOnline, isSyncing, statusLabel, triggerManualSync } = useOfflineSync();

  const [fullName, setFullName] = useState(user?.fullName || "Engr. Asad Malik");
  const [company, setCompany] = useState(user?.companyName || "Habib & Sons Construction");
  const [phone, setPhone] = useState(user?.phone || "+92 300 1234567");
  const [defaultQuality, setDefaultQuality] = useState("standard");
  const [defaultWastage, setDefaultWastage] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [whatsNewModalOpen, setWhatsNewModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    updateProfile({ fullName, companyName: company, phone });
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      alert("Please type DELETE in capital letters to confirm.");
      return;
    }
    await deleteAccount();
    setDeleteModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Account & Application Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal defaults, engineering parameters, theme mode, and privacy controls.
        </p>
      </div>

      {/* 1. Visual Theme & Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Display & Appearance</h3>
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-emerald-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <div className="text-xs font-bold text-slate-200">Theme Mode</div>
              <div className="text-[11px] text-slate-400">
                Switch between high-contrast Dark Mode and clean Light Mode.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-emerald-400" />}
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">System Language</div>
              <div className="text-[11px] text-slate-400">English (Urdu technical terms supported across calculators)</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            English (LTR)
          </span>
        </div>
      </div>

      {/* 2. Engineering Defaults (Section 104) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Engineering Defaults</h3>
        <p className="text-xs text-slate-400">
          These default assumptions pre-fill your new calculations and speed up estimation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Default Pakistani City</label>
            <select
              value={selectedCityId}
              onChange={(e) => {
                setSelectedCityId(e.target.value);
                showToast("Default construction city updated", "success");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {PAK_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.province})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Default Marla Unit Standard</label>
            <select
              value={marlaStandardId}
              onChange={(e) => {
                setMarlaStandardId(e.target.value);
                showToast("Default Marla standard updated", "success");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {MARLA_STANDARDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.sqft} Sq. Ft.)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Default Construction Quality</label>
            <select
              value={defaultQuality}
              onChange={(e) => setDefaultQuality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="economy">Economy Grade (Basic)</option>
              <option value="standard">Standard Grade (A-Class Bricks & Grade 60)</option>
              <option value="premium">Premium Grade (Imported Tiles & Teak)</option>
              <option value="luxury">Luxury Grade (Smart HVAC & Quartz)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Default Material Wastage Buffer (%)</label>
            <input
              type="number"
              value={defaultWastage}
              onChange={(e) => setDefaultWastage(Number(e.target.value))}
              min={1}
              max={15}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Personal Profile */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Client / Contractor Profile</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Company / Firm Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all"
        >
          Save Profile Changes
        </button>
      </form>

      {/* 4. Official Customer Support & Payment Help (Sections 106–108) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Official Support &amp; Assistance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Have inquiries regarding your construction estimates, BOQ exports, or Pro subscription payment verification?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="mailto:imaginary.guy.project@gmail.com"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Support Email</span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                imaginary.guy.project@gmail.com
              </span>
            </div>
          </a>

          <a
            href="https://wa.me/923455074541"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 flex items-center gap-3 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Admin WhatsApp</span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                0345-50-74-541
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* App Version, Play Updates & Diagnostics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Application Release</span>
            <h3 className="text-base font-bold text-white mt-0.5">BuildCost.pk Mobile</h3>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-mono font-bold text-emerald-400">
              v3.0.7 (Code 16)
            </span>
            <span className="block text-[10px] text-slate-400 mt-1">Target: Android API 36</span>
          </div>
        </div>

        {/* Dynamic Connection & Sync Status Indicator */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? "bg-amber-400 animate-ping" : isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
            <div>
              <div className="text-xs font-bold text-slate-200">{statusLabel}</div>
              <div className="text-[10px] text-slate-400">
                {isOnline ? "Market rates, layouts & PRO state auto-synced" : "Running locally from verified cached data"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => triggerManualSync()}
            disabled={isSyncing || !isOnline}
            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-emerald-300 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Rates"}</span>
          </button>
        </div>

        {/* Feature & Support Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setWhatsNewModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">What's New</div>
              <div className="text-[10px] text-slate-400">v3.0.0 Release Highlights</div>
            </div>
            <Sparkle className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">Report a Problem</div>
              <div className="text-[10px] text-slate-400">Diagnostics & Bug Report</div>
            </div>
            <Bug className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.AndroidUpdates) {
                window.AndroidUpdates.checkForUpdate(false);
              } else {
                showToast("You are running the latest BuildCost.pk version 3.0.0.", "info");
              }
            }}
            className="p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-left transition flex items-center justify-between group"
          >
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">Play Store Update</div>
              <div className="text-[10px] text-slate-400">Check In-App Release</div>
            </div>
            <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 5. Danger Zone: Account Deletion (Section 99) */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanently delete your account and all associated construction data. This will irreversibly purge your saved projects, calculations, BOQs, quotations, expenses, and immediately revoke all active public share links.
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-md shadow-rose-950"
        >
          Request Permanent Account Deletion
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-800/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Permanent Account Deletion</h3>
              <p className="text-xs text-rose-300">
                Warning: This action cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div>• All saved calculation snapshots will be purged</div>
              <div>• All project ledgers and BOQs will be permanently removed</div>
              <div>• All active public share links will stop working immediately</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-rose-950 transition-all"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic & Release Modals */}
      <ReportProblemModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <WhatsNewModal isOpen={whatsNewModalOpen} onClose={() => setWhatsNewModalOpen(false)} />
    </div>
  );
}
