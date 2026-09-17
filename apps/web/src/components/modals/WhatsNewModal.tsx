"use client";

import React from "react";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HIGHLIGHTS = [
  {
    icon: "🏗️",
    title: "Advanced Construction Calculation",
    desc: "Calculate precise grey structure quantities with custom wall heights (9-14 ft), bathroom finishes, strip/raft foundations, and structural RCC columns & beams.",
  },
  {
    icon: "📐",
    title: "Modern Architectural Layout Plans",
    desc: "Explore complete floor plans for 3 Marla, 5 Marla, 10 Marla, and 1 Kanal plots. Free tier gets 1 verified plan; PRO members unlock 3+ premium layouts.",
  },
  {
    icon: "💎",
    title: "Ad-Supported Free & 100% Ad-Free Pro",
    desc: "Free members enjoy unrestricted estimation supported by Google AdMob. Verified PRO subscribers experience zero ads, instant PDF reports, and cloud sync.",
  },
  {
    icon: "🔄",
    title: "Official Google Play In-App Updates",
    desc: "Seamlessly update the application without leaving your workflow or downloading APKs manually. Automatic backend data sync for market rates without reinstalling.",
  },
  {
    icon: "⚡",
    title: "Offline-First & Live Rate Verification",
    desc: "Work on construction sites without internet. Rates display 'Last Verified' timestamps, ensuring you never mistake cached figures for live market rates.",
  },
  {
    icon: "🛡️",
    title: "Enterprise Security Hardening",
    desc: "Strict Supabase Row Level Security (RLS), biometric screen lock, verified Google OAuth, and instant sign-in security notifications.",
  },
];

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
              Version 3.0.3
            </div>
            <h3 className="text-xl font-bold text-white">What's New in BuildCost.pk</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3.5 bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-xl">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">{item.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-900/40"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
