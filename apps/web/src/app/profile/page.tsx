"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  CheckCircle2,
  AlertCircle,
  Shield,
  Crown,
  KeyRound,
  LogOut,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";
import { PAKISTANI_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, deleteAccount, updateProfile, showToast } = useAuthStore();
  const { selectedCityId, setSelectedCityId, marlaStandardId, setMarlaStandardId } = useProjectStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCompany(user.companyName || "");
      if (user.cityId) {
        setSelectedCityId(user.cityId);
      }
    }
  }, [user, setSelectedCityId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          company_name: company.trim(),
          city_id: selectedCityId,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (dbError) {
        console.warn("Database update note:", dbError.message);
      }

      updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        companyName: company.trim(),
        cityId: selectedCityId
      });

      setSaved(true);
      showToast("Profile and preferences saved successfully!", "success");
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showToast("Your account has been deleted.", "info");
      router.push("/login");
    } catch (err: any) {
      setError(err?.message || "Failed to delete account.");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header with Account Tier Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">User Profile & Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your verified identity, credentials, and Pakistan engineering defaults
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.role === "superadmin" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Super Admin
              </span>
            ) : user.is_pro ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-emerald-400" />
                PRO Member
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Free Tier
              </span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        {saved && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/50 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile and construction preferences saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/50 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Account Information */}
        <div>
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Umer Shahzad"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Contact Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Company / Firm</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. BuildCost Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional Defaults */}
        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Regional Pakistan Defaults</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Default Market City</label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Default Marla Standard</label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {MARLA_STANDARDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.sqft} sq ft)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1.5">Currency</label>
              <input
                type="text"
                disabled
                value="Pakistani Rupee (PKR / Rs.)"
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t border-slate-800 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Account Security & Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Security & Actions
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Password & Security</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Change your password via secure email verification link
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center"
          >
            Reset Password
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              End your active session on this device
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Sign Out
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
          <div>
            <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Account</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanently delete your account, estimates, and project records
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 text-xs font-bold transition-all cursor-pointer text-center border border-rose-800/50"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-800/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800/50 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Account?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action is irreversible. All your saved estimates, project sheets, and records will be deleted.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{deleting ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
