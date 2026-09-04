"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Share2,
  Copy,
  Check,
  Download,
  Lock,
  Eye,
  Calendar,
  ShieldCheck,
  X,
  ExternalLink,
  MessageCircle,
  AlertTriangle
} from "lucide-react";
import { ShareLink } from "@buildcost/types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: "estimate" | "calculation" | "boq" | "quotation" | "cost_report";
  documentId: string;
  documentTitle: string;
  documentData: any;
  projectId?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  documentTitle,
  documentData,
  projectId
}: ShareModalProps) {
  const { user, isAuthenticated, openLoginModal, showToast } = useAuthStore();
  const { createShareLink, revokeShareLink, shareLinks } = useProjectStore();

  const [copied, setCopied] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [includeClientName, setIncludeClientName] = useState(false);
  const [includePhone, setIncludePhone] = useState(false);
  const [includeCompany, setIncludeCompany] = useState(true);
  const [includeProjectAddress, setIncludeProjectAddress] = useState(false);
  const [currentLink, setCurrentLink] = useState<ShareLink | null>(null);

  if (!isOpen) return null;

  // Login Gating Check: Only authenticated users can create share links!
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Sign In to Generate Share Link</h3>
          <p className="text-xs text-slate-400">
            Secure sharing links, client preview tokens, and PDF distribution require a free BuildCost Connect account.
          </p>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                openLoginModal();
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find existing active link for this document if any
  const existingLink = currentLink || shareLinks.find(
    (l) => l.documentId === documentId && l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date())
  );

  const handleGenerateLink = () => {
    const link = createShareLink({
      userId: user?.id || "usr_active",
      projectId,
      documentType,
      documentId,
      documentData,
      title: documentTitle,
      allowDownload,
      includeClientName,
      includePhone,
      includeCompany,
      includeProjectAddress
    });
    setCurrentLink(link);
    showToast("Secure share link generated successfully!", "success");
  };

  const shareUrl = existingLink
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${existingLink.token}`
    : "";

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast("Share link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: documentTitle,
          text: `Review construction cost estimate for ${documentTitle} on BuildCost Connect:`,
          url: shareUrl
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! Please review the construction cost calculation for *${documentTitle}*:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleRevoke = () => {
    if (!existingLink) return;
    revokeShareLink(existingLink.token);
    setCurrentLink(null);
    showToast("Share link revoked. Access has been immediately cut off.", "info");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Share Construction Document</h3>
            <p className="text-xs text-slate-400">Generate a cryptographically secure, read-only public token</p>
          </div>
        </div>

        {existingLink ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Public Access Link</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tokenized & Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Analytics preview */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> Views: {existingLink.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-slate-400" /> Downloads: {existingLink.downloadCount}
                </span>
                <span>Created: {new Date(existingLink.createdAt).toLocaleDateString("en-PK")}</span>
              </div>
            </div>

            {/* Sharing action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                WhatsApp Share
              </button>
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share / Copy
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Public Shared View
              </a>
              <button
                onClick={handleRevoke}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Revoke Link Immediately
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Privacy & Expose Controls</span>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Allow viewer to download official PDF estimate</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCompany}
                    onChange={(e) => setIncludeCompany(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include company name and professional letterhead</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeClientName}
                    onChange={(e) => setIncludeClientName(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include client name in shared report</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePhone}
                    onChange={(e) => setIncludePhone(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include contact phone number</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeProjectAddress}
                    onChange={(e) => setIncludeProjectAddress(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Include full project site address</span>
                </label>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  The public viewer gets strictly read-only access to this document. They CANNOT access your dashboard, other projects, private expenses, or notes.
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerateLink}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Generate Secure Public Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
