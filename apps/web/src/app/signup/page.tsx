"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator, Lock, Mail, User, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { validateEmail, validatePassword } from "@/lib/auth/validation";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error || "Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(passCheck.error || "Password must be at least 8 characters with letters and numbers.");
      setLoading(false);
      return;
    }

    try {
      const res = await signup({
        fullName,
        email,
        password
      });

      if (!res.success) {
        setError(res.error || "Failed to create account. Please try again.");
        return;
      }

      if (res.needsVerification) {
        setVerificationSent(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 shadow-lg">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
            <p className="text-sm text-slate-400">
              We&apos;ve sent a verification link to <strong className="text-emerald-400">{email}</strong>.
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Please click the link in your email to activate your BuildCost account. Once verified, you can sign in to access your dashboard.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/40 transition-all"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Calculator className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-400">
            Join BuildCost Connect for construction cost estimation in Pakistan
          </p>
        </div>

        <form onSubmit={handleSignup} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Umer Sheikh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

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

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition-all disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Creating account..." : "Sign Up"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
