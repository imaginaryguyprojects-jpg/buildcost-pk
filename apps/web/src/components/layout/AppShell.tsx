"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { LoginGatingModal } from "@/components/auth/LoginGatingModal";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { useAuthStore } from "@/stores/authStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { lastToast, clearToast } = useAuthStore();

  const isFullPageLayout =
    pathname === "/" ||
    pathname.startsWith("/share/") ||
    pathname === "/login" ||
    pathname === "/signup";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-700 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Global Toast Notification */}
      {lastToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 px-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-slate-100 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs">
            {lastToast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {lastToast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {lastToast.type === "info" && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span className="font-medium">{lastToast.message}</span>
            <button
              type="button"
              onClick={clearToast}
              className="text-slate-500 hover:text-slate-300 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Auth Modals */}
      <LoginGatingModal />
      <OnboardingModal />

      {isFullPageLayout ? (
        <main className="flex-1 w-full">{children}</main>
      ) : (
        <div className="flex flex-1 w-full">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      )}
    </div>
  );
}
