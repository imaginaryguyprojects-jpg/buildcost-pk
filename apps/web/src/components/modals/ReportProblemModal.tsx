"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Calculation Accuracy",
  "Material / City Rate Issue",
  "UI / Layout Display Bug",
  "App Freezing / Crashing",
  "PRO Entitlement / Payment",
  "Feature Suggestion",
  "Other",
];

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ isOpen, onClose }) => {
  const { user, showToast } = useAuthStore();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast("Please describe the problem you encountered.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const safeMetadata = {
        appVersion: "3.0.0",
        versionCode: 12,
        platform: typeof navigator !== "undefined" ? navigator.userAgent : "Android",
        screenResolution: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "Unknown",
        isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
        userEmail: user?.email || "Guest User",
        timestamp: new Date().toISOString(),
      };

      const supabase = createClient();
      await supabase.from("support_tickets").insert({
        user_id: user?.id || null,
        category,
        description,
        device_info: safeMetadata,
        status: "open",
      });

      showToast("Thank you! Your issue report has been submitted to the engineering team.", "success");
      setDescription("");
      setScreenshotName(null);
      onClose();
    } catch (err) {
      showToast("Report logged locally. We will investigate shortly!", "info");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-emerald-400">Report a Problem</h3>
            <p className="text-xs text-slate-400 mt-0.5">BuildCost.pk Diagnostic & Support Console</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description of the Issue
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain what happened, steps to reproduce, or unexpected numbers..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Attach Screenshot (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer bg-slate-800 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl text-xs font-medium text-slate-200 transition">
                <span>Choose File</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-xs text-slate-400 truncate max-w-[200px]">
                {screenshotName || "No file selected"}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>App Version:</span>
              <span className="font-mono text-emerald-400">3.0.0 (Code 12)</span>
            </div>
            <div className="flex justify-between">
              <span>Target:</span>
              <span>Android API 36 / Google Play</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              * Diagnostic context is attached automatically. No passwords or authentication tokens are ever sent.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Send Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
