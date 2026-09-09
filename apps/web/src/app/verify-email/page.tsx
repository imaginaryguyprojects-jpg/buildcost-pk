"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/auth/validation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || "Please enter a valid email address.");
      return;
    }

    setResending(true);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase()
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResentSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend confirmation email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg">
        <Mail className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          An email verification link is required to access your dashboard and saved estimates.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resentSuccess ? (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-300 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verification Link Resent!</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Please check your inbox or spam folder for {email} and follow the link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-3 pt-2">
          <div className="text-left">
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Didn&apos;t receive the link? Resend to:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={resending}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Resend Verification Link</span>
            )}
          </button>
        </form>
      )}

      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <Link
          href="/login"
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
        >
          <span>Return to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-[11px] text-slate-500">
          Already verified? Sign in to access your account immediately.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
