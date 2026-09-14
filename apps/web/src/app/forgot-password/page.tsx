"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { validateEmail } from "@/lib/auth/validation";

export default function ForgotPasswordPage() {
  const { resetPassword, showToast } = useAuthStore();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSubmitted(true);
        showToast("Password reset link sent!", "success");
      } else {
        setError(res.error || "Unable to send reset email. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to dispatch reset email. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        showToast("Reset link sent again! Please check your Inbox and Spam folder.", "success");
      } else {
        showToast(res.error || "Could not resend email. Please try again in a few moments.", "error");
      }
    } catch {
      showToast("Failed to resend email.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Calculator className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your account email to receive recovery instructions
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="p-3.5 mb-4 rounded-xl bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-base font-bold text-slate-100">Check Your Inbox</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                We&apos;ve dispatched a recovery link to <strong className="text-emerald-400 font-semibold">{email}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
                <p>• Click the link in the email to set your new password.</p>
                <p>• If you don&apos;t see it in 1–2 minutes, please check your <strong>Spam or Junk folder</strong>.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>{resending ? "Resending..." : "Resend Recovery Email"}</span>
                </button>

                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all text-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? "Sending Link..." : "Send Reset Link"}</span>
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
