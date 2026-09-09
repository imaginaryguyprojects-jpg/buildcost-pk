"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building,
  KeyRound,
  ArrowDownCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface WelcomeAuthGateProps {
  onGuestAccess?: () => void;
}

export function WelcomeAuthGate({ onGuestAccess }: WelcomeAuthGateProps) {
  const router = useRouter();
  const { user, isAuthenticated, login, signup, showToast } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Homeowner / Plot Owner");

  const handleGuestClick = () => {
    if (onGuestAccess) {
      onGuestAccess();
    } else {
      const el = document.getElementById("calculator-section") || document.getElementById("estimate-wizard");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    showToast("Guest Access Active: Explore construction calculators freely without login!", "info");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        showToast("Signed in successfully!", "success");
      } else {
        setErrorMessage(res.error || "Invalid credentials. Please check your email and password.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signup({
        fullName: fullName || email.split("@")[0],
        email,
        password,
        companyName: role
      });
      if (res.success) {
        showToast("Account created successfully! Welcome to BuildCost.", "success");
      } else {
        setErrorMessage(res.error || "Account creation failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand Statement & Value Pillars */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 text-[#059669] dark:text-emerald-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
            Pakistan's Premier Construction Cost Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Plan Your House Construction <br className="hidden sm:inline" />
            <span className="text-[#059669] dark:text-emerald-400">Accurately &amp; Transparently</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Real-time material rates (Cement, Sariya, Bricks, Sand &amp; Crush), empirical civil engineering formulas, and itemized Grey Structure vs. Finishing cost estimations calibrated across 13 major Pakistani cities.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold mb-2">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Standard &amp; Custom Plots</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">3, 5, 10 Marla, 1 Kanal or exact dimensions</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold mb-2">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Editable Material Rates</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Override Cement, Steel, and Brick rates live</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] flex items-center justify-center font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Civil Phase Details</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Masonry, Plaster, Roof Slab, &amp; Finishing</p>
            </div>
          </div>

          {/* Quick guest jump button */}
          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={handleGuestClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#059669] text-[#059669] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 font-bold text-xs transition-all shadow-sm group"
            >
              <ArrowDownCircle className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Explore Calculator as Guest (No Login Required)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Pristine Auth Gate Card */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            {/* Emerald Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#059669] to-teal-600" />

            {isAuthenticated && user ? (
              /* Logged In View */
              <div className="space-y-6 py-2 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400">
                    Active Session
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    Welcome back, {user.fullName || user.email}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your construction projects and custom rate profiles are ready.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <Link
                    href="/dashboard"
                    className="w-full py-3.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Open Project Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleGuestClick}
                    className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4 text-[#059669]" />
                    <span>Use Quick Calculator Below</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Non-Logged In View with Sign In / Sign Up Tabs */
              <div className="space-y-5">
                {/* Header & Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">BuildCost Connect</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#059669] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      v1.2.0 Active
                    </span>
                  </div>

                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signin");
                        setErrorMessage(null);
                      }}
                      className={cn(
                        "py-2 text-xs font-bold rounded-xl transition-all",
                        activeTab === "signin"
                          ? "bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signup");
                        setErrorMessage(null);
                      }}
                      className={cn(
                        "py-2 text-xs font-bold rounded-xl transition-all",
                        activeTab === "signup"
                          ? "bg-white dark:bg-slate-900 text-[#059669] dark:text-emerald-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      )}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                    {errorMessage}
                  </div>
                )}

                {/* SIGN IN FORM */}
                {activeTab === "signin" ? (
                  <form onSubmit={handleSignIn} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contractor@buildcost.pk"
                          className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Password</label>
                        <Link href="/forgot-password" className="text-[11px] font-semibold text-[#059669] hover:underline">
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating...</span>
                      ) : (
                        <>
                          <span>Sign In to Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* SIGN UP FORM */
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Full Name / Company
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Mian Tariq / Al-Rehman Builders"
                          className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@buildcost.pk"
                          className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">Primary Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#059669]"
                      >
                        <option value="Homeowner / Plot Owner">Homeowner / Plot Owner</option>
                        <option value="Building Contractor">Building Contractor</option>
                        <option value="Civil Engineer / Architect">Civil Engineer / Architect</option>
                        <option value="Real Estate Consultant">Real Estate Consultant</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Creating Account...</span>
                      ) : (
                        <>
                          <span>Create Free Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* DIVIDER & GUEST QUICK ACCESS OPTION */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    <span>Or Explore Directly</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestClick}
                    className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 text-[#059669] dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue as Guest / Quick Access</span>
                    <ArrowDownCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
