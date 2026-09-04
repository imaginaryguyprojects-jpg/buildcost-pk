"use client";

import React from "react";
import Link from "next/link";
import { Settings, Shield, Bell, Moon, Languages } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Application configuration, display themes, and notification preferences
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold text-slate-200">Visual Theme</div>
              <div className="text-slate-400">Dark mode active matching UI.jpg engineering layout</div>
            </div>
          </div>
          <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
            Dark (Active)
          </span>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Languages className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold text-slate-200">System Language</div>
              <div className="text-slate-400">English (Urdu localization architecture ready)</div>
            </div>
          </div>
          <span className="font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            English (LTR)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold text-slate-200">Material Price Volatility Alerts</div>
              <div className="text-slate-400">Receive alerts when cement or steel shifts by more than ±3%</div>
            </div>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-slate-700 bg-slate-950 text-emerald-600 w-4 h-4"
          />
        </div>
      </div>
    </div>
  );
}
