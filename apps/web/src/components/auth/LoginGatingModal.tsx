"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  X,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { PAK_CITIES } from "@buildcost/config";
import { validateEmail } from "@/lib/auth/validation";

export function LoginGatingModal() {
  const {
    loginModalOpen,
    closeLoginModal,
    pendingAction,
    clearPendingAction,
    login,
    signup,
    resetPassword,
    resendVerificationEmail,
    showToast
  } = useAuthStore();
  const { saveCalculation, addProject } = useProjectStore();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cityId, setCityId] = useState("isb");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  if (!loginModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Authentication failed. Please check your credentials.");
          if (res.needsVerification) {
            setNeedsVerification(true);
          }
          return;
        }
      } else if (mode === "signup") {
        const res = await signup({
          fullName: fullName || "Valued User",
          email,
          password,
          phone,
          companyName,
          cityId
        });
        if (!res.success) {
          setError(res.error || "Failed to create account.");
          return;
        }
        if (res.needsVerification) {
          showToast(res.message || "Please check your email to verify your account.", "info");
          closeLoginModal();
          return;
        }
      } else if (mode === "forgot") {
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
          setError(emailCheck.error || "Please enter a valid email address.");
          return;
        }
        const res = await resetPassword(email);
        if (res.success) {
          setForgotSuccess(true);
          showToast("Password recovery link sent!", "success");
          return;
        } else {
          setError(res.error || "Failed to send reset link.");
          return;
        }
      }

      // EXECUTE PENDING ACTION (CRITICAL LOGIN GATING RULE: Preserves state without loss!)
      if (pendingAction) {
        if (pendingAction.actionName === "save_calculation") {
          saveCalculation(pendingAction.payload);
          showToast("Calculation successfully saved to your account!", "success");
        } else if (pendingAction.actionName === "save_project") {
          addProject(pendingAction.payload);
          showToast("Project successfully saved to your account!", "success");
        }
        clearPendingAction();
      }

      closeLoginModal();
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        showToast("Verification link sent! Please check Inbox and Spam.", "success");
      } else {
        showToast(res.error || "Could not resend email.", "error");
      }
    } catch {
      showToast("Failed to resend email.", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Save & Sync Across Devices
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {mode === "forgot"
              ? "Reset Your Password"
              : mode === "signup"
              ? "Create Free Account to Save"
              : "Sign In to Your Account"}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {mode === "forgot"
              ? "Enter your account email to receive password recovery instructions."
              : pendingAction
              ? "Your calculation is safe and will be automatically saved right after sign-in."
              : "Access your saved estimates, custom rates, BOQs, and PDF reports from any device."}
          </p>
        </div>

        {/* Tab Switcher (Visible in Login & Signup modes) */}
        {mode !== "forgot" && (
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setNeedsVerification(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setNeedsVerification(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Free Account
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? "Resending Link..." : "Resend Verification Email"}</span>
              </button>
            )}
          </div>
        )}

        {mode === "forgot" && forgotSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="text-sm font-bold text-slate-100">Recovery Instructions Dispatched</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We&apos;ve sent recovery instructions to <strong className="text-emerald-400">{email}</strong>. Please check your Inbox and Spam folder.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotSuccess(false);
                  setError(null);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Asad Malik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNeedsVerification(false);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError(null);
                        setNeedsVerification(false);
                      }}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
            )}

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">City (Optional)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {PAK_CITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Company (Optional)</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Builders / Private"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === "forgot" ? (
                <span>Send Password Reset Link</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {mode === "signup" ? "Create Free Account & Save" : "Sign In & Continue"}
                </>
              )}
            </button>

            {mode === "forgot" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            )}
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>✓ Free Forever Tier</span>
          <span>✓ Zero Spam</span>
          <span>✓ Instant PDF Export</span>
        </div>
      </div>
    </div>
  );
}

