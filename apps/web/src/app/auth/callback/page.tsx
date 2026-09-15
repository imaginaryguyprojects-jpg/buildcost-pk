"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Calculator, RefreshCw } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying credentials with Supabase...");
  const { initializeAuth, showToast } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      try {
        const supabase = createClient();
        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/dashboard";

        if (code) {
          setStatus("Exchanging authorization code for secure session...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange failed:", error.message);
            if (mounted) {
              router.replace(`/login?error=oauth_exchange_failed`);
            }
            return;
          }
        }

        // Fetch user and session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setStatus("Synchronizing user profile and entitlements...");
          await initializeAuth();
          if (mounted) {
            showToast("Successfully signed in!", "success");
            router.replace(next);
          }
        } else {
          // If no code and no session, wait briefly or redirect to login
          if (mounted) {
            router.replace("/login");
          }
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (mounted) {
          router.replace("/login?error=oauth_exchange_failed");
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [router, searchParams, initializeAuth, showToast]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
          <Calculator className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">Completing Sign-In</h2>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>{status}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Loading authentication...
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
