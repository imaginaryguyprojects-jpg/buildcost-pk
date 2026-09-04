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
  Sparkles
} from "lucide-react";
import { PAK_CITIES, MARLA_STANDARDS } from "@buildcost/config";

export default function SettingsPage() {
  const { theme, toggleTheme, selectedCityId, setSelectedCityId, marlaStandardId, setMarlaStandardId } = useProjectStore();
  const { user, isAuthenticated, updateProfile, deleteAccount, showToast, openLoginModal } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || "Engr. Asad Malik");
  const [company, setCompany] = useState(user?.companyName || "Habib & Sons Construction");
  const [phone, setPhone] = useState(user?.phone || "+92 300 1234567");
  const [defaultQuality, setDefaultQuality] = useState("standard");
  const [defaultWastage, setDefaultWastage] = useState(5);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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

      {/* 4. Danger Zone: Account Deletion (Section 99) */}
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
    </div>
  );
}
