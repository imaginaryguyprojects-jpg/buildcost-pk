"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calculator, Lock, Mail, ArrowRight, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2, Fingerprint } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { validateEmail } from "@/lib/auth/validation";
import { getBiometricStatus, BiometricStatus } from "@/lib/auth/biometricService";
import { BiometricPromptModal } from "@/components/auth/BiometricPromptModal";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");

  const { login, loginWithGoogle, loginWithBiometrics, resendVerificationEmail, showToast } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "oauth_exchange_failed"
      ? "Google sign-in could not be completed. Please try again or use email."
      : null
  );
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  // Biometric state
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);
  const [showBioPrompt, setShowBioPrompt] = useState(false);
  const [pendingBioEmail, setPendingBioEmail] = useState("");

  useEffect(() => {
    getBiometricStatus().then((status) => {
      setBiometricStatus(status);
      if (status.storedEmail && !email) {
        setEmail(status.storedEmail);
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || "Failed to initialize Google login.");
        setGoogleLoading(false);
      }
      // If success, Supabase will redirect to Google OAuth URL
    } catch (err: any) {
      setError(err?.message || "Google sign-in encountered an error.");
      setGoogleLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBioLoading(true);
    setError(null);
    try {
      const res = await loginWithBiometrics();
      if (res.success) {
        router.push(redirectTarget);
      } else {
        setError(res.error || "Biometric authentication failed. Please sign in with your password.");
      }
    } catch (err: any) {
      setError(err.message || "Biometric verification error.");
    } finally {
      setBioLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendSuccess(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || "Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await login(email, password);
      if (res.success) {
        // If biometric hardware is available on this device and not yet enabled, prompt user
        if (biometricStatus?.isAvailable && !biometricStatus?.isEnabled) {
          setPendingBioEmail(email);
          setShowBioPrompt(true);
        } else {
          router.push(redirectTarget);
        }
      } else {
        setError(res.error || "Invalid credentials. Please verify your email and password.");
        if (res.needsVerification) {
          setNeedsVerification(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendSuccess(null);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setResendSuccess(res.message || "Verification email re-sent! Please check your Inbox and Spam folder.");
        showToast("Verification link dispatched!", "success");
      } else {
        setError(res.error || "Could not resend email. Please try again in a few moments.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend verification link.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
          <Calculator className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">BuildCost Connect</h1>
        <p className="text-xs text-slate-400">
          Sign in to access your construction estimates and project ledgers
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or email</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? "Sending Link..." : "Resend Verification Email"}</span>
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setNeedsVerification(false);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-emerald-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Biometric Unlock Button */}
          {biometricStatus?.isAvailable && (biometricStatus?.isEnabled || biometricStatus?.hasStoredCredentials) && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={bioLoading}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 font-extrabold text-xs shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Fingerprint className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span>
                  {bioLoading ? "Verifying..." : `Unlock with Fingerprint ${biometricStatus.storedEmail ? `(${biometricStatus.storedEmail})` : ""}`}
                </span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or password</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
                Create account
              </Link>
            </span>
          </div>
        </form>
      </div>

      {/* Biometric Enable Prompt Modal */}
      <BiometricPromptModal
        isOpen={showBioPrompt}
        email={pendingBioEmail}
        onClose={() => {
          setShowBioPrompt(false);
          router.push(redirectTarget);
        }}
        onSuccess={() => {
          showToast("Fingerprint login enabled!", "success");
          setShowBioPrompt(false);
          router.push(redirectTarget);
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
