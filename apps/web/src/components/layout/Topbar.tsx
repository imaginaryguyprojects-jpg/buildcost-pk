"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  User,
  ChevronDown,
  Bell,
  Plus,
  Sun,
  Moon,
  LogOut,
  Settings,
  History,
  ShieldCheck,
  Search,
  CreditCard,
  Zap,
  Menu,
  Crown
} from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { MobileDrawer } from "./MobileDrawer";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const {
    selectedCityId,
    setSelectedCityId,
    theme,
    toggleTheme,
    setQuickAddOpen,
    setSmartSearchOpen
  } = useProjectStore();
  const {
    user,
    isAuthenticated,
    logout,
    openLoginModal,
    openUpgradeModal,
    isSuperAdmin
  } = useAuthStore();
  
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  const topNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Calculator", href: "/calculator" },
    { label: "Materials", href: "/materials" },
    { label: "Budget", href: "/budget" },
    { label: "Progress", href: "/progress" },
    { label: "Rates", href: "/rates/materials" },
    { label: "Pricing", href: "/pricing" }
  ];

  return (
    <>
      <header className="h-16 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800/80 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-xs transition-colors">
        {/* Brand & Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-1.5 -ml-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[#059669] flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:bg-emerald-700 transition-colors">
              BC
            </div>
            <span className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base tracking-tight hidden sm:inline">
              BuildCost<span className="text-[#059669] dark:text-emerald-400 font-bold">.pk</span>
            </span>
          </Link>

          {/* Top navigation tabs: Larger, crisp, highly legible */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {topNavLinks.map((link) => {
              const isActive =
                (link.href === "/dashboard" && (pathname === "/dashboard" || pathname === "/")) ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 lg:px-3.5 py-2 rounded-xl text-sm lg:text-[14.5px] transition-all flex items-center gap-1",
                    isActive
                      ? "text-[#059669] dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold hover:bg-slate-100/90 dark:hover:bg-slate-800/80"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2.5">
        {/* City Filter Selector */}
        <div className="relative">
          <button
            onClick={() => setCityMenuOpen(!cityMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{selectedCity?.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {cityMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Select City Market
              </div>
              <div className="max-h-60 overflow-y-auto">
                {PAKISTANI_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setCityMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors",
                      city.id === selectedCityId
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 font-medium"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-arabic">{city.urduName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Smart Search Button */}
        <button
          type="button"
          onClick={() => setSmartSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          title="Search anything (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Global Quick Add (+) Action Button */}
        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs transition-colors"
          title="Quick Add (Purchase, Vendor, Log, Reminder)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Quick New Project Button */}
        <Link
          href="/projects/new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-all"
        >
          <span>New Project</span>
        </Link>

        {/* PRO / God-Mode / Plan Branding */}
        <div className="hidden sm:flex items-center gap-2">
          {isSuperAdmin() ? (
            <>
              {/* GOD MODE Super Admin Badge */}
              <Link
                href="/admin/control-center"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FCD34D] dark:border-amber-700/60 rounded-xl text-xs font-black text-[#92400E] dark:text-amber-300 select-none hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-all shadow-xs"
                title="Super Admin God-Mode Active"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-tight">⚡ GOD MODE</span>
                <span className="text-[10px] text-amber-800 dark:text-amber-200 font-bold border-l border-amber-400/60 pl-1.5">
                  Super Admin
                </span>
              </Link>

              {/* God Mode Button */}
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FCD34D] dark:border-amber-700/60 text-[#92400E] dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                title="Open God Mode Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Admin</span>
              </Link>
            </>
          ) : user?.is_pro || user?.plan === "pro" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 select-none shadow-xs">
              <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
              <span>PRO MEMBER</span>
            </div>
          ) : (
            <button
              onClick={() => openUpgradeModal("Topbar")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Upgrade to PRO</span>
            </button>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors shadow-sm"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Material Watchlist Bell */}
        <Link
          href="/watchlist"
          aria-label="Price Alerts"
          title="Material Watchlist & Price Alerts"
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              if (isAuthenticated && user) {
                setUserMenuOpen(!userMenuOpen);
              } else {
                openLoginModal();
              }
            }}
            className="w-8 h-8 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer"
            title={isAuthenticated ? user?.fullName || "User Profile" : "Sign In / Profile"}
          >
            {isAuthenticated && user?.fullName ? user.fullName[0].toUpperCase() : "U"}
          </button>

          {isAuthenticated && user && userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white truncate">{user.fullName}</div>
                <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
              </div>
              <div className="py-1 border-b border-slate-100 dark:border-slate-800">
                {isSuperAdmin() && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/15 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>⚡ God-Mode Admin Panel</span>
                  </Link>
                )}
                <Link
                  href="/projects"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <History className="w-4 h-4 text-slate-400" />
                  <span>My Projects</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
  </>
  );
}
