"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Building, MapPin, Globe, CheckCircle2 } from "lucide-react";
import { PAKISTANI_CITIES, MARLA_STANDARDS } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";

export default function ProfilePage() {
  const { selectedCityId, setSelectedCityId, marlaStandardId, setMarlaStandardId } = useProjectStore();

  const [fullName, setFullName] = useState("Umer Sheikh");
  const [email, setEmail] = useState("umer@example.com");
  const [phone, setPhone] = useState("+92 300 1234567");
  const [company, setCompany] = useState("BuildCost Engineering & Builders");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Profile & Engineering Preferences</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account details and default Pakistan construction parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        {saved && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile and construction preferences saved successfully!</span>
          </div>
        )}

        <div>
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Company / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
            Regional Pakistan Defaults
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Default Market City</label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {PAKISTANI_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Default Marla Standard</label>
              <select
                value={marlaStandardId}
                onChange={(e) => setMarlaStandardId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {MARLA_STANDARDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Country</label>
              <input
                type="text"
                disabled
                value="Pakistan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Currency</label>
              <input
                type="text"
                disabled
                value="Pakistani Rupee (PKR / Rs.)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
