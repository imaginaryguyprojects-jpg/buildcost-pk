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
  Menu
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
      <header className="h-14 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors">
        {/* Brand & Drawer Trigger on Mobile / Tablet */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-1.5 -ml-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              BC
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">BuildCost Connect</span>
          </Link>

          {/* Center top nav links */}
          <nav className="hidden md:flex items-center gap-1">
          {topNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
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

        {/* PRO / God-Mode / Plan Branding & Upgrade CTA */}
        {(() => {
          if (isSuperAdmin()) {
            return (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border border-amber-500/40 dark:border-amber-400/40 rounded-lg text-xs font-black text-amber-700 dark:text-amber-400 select-none hover:bg-amber-500/25 transition-all shadow-xs"
                title="Super Admin God-Mode Active — Click to Open Control Center"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>⚡ GOD MODE</span>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold border-l border-amber-500/40 pl-1.5">
                  Super Admin
                </span>
              </Link>
            );
          }

          const isPro =
            user?.plan === "pro" ||
            user?.plan === "business" ||
            user?.subscriptionStatus === "PRO_ACTIVE";

          if (isPro) {
            return (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs font-black text-emerald-700 dark:text-emerald-400 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PRO</span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold border-l border-emerald-500/30 pl-1.5">
                  Pro Member
                </span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                FREE PLAN
              </span>
              <button
                type="button"
                onClick={() => openUpgradeModal("Top Header Upgrade")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-lg text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Upgrade to Pro Plan"
              >
                <span>Upgrade to PRO</span>
              </button>
            </div>
          );
        })()}

        {/* Admin Mode Shortcut Button */}
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs",
            isSuperAdmin()
              ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40"
              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          )}
          title={isSuperAdmin() ? "Super Admin God-Mode Panel" : "Switch to Admin Mode & View Visitors/Payments"}
        >
          <ShieldCheck className={cn("w-3.5 h-3.5", isSuperAdmin() ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")} />
          <span className="hidden sm:inline">{isSuperAdmin() ? "God Mode" : "Admin Mode"}</span>
        </Link>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors shadow-sm"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Material Watchlist Bell */}
        <Link
          href="/watchlist"
          aria-label="Price Alerts"
          title="Material Watchlist & Price Alerts"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Auth State Button / Profile Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative">
            {(() => {
              const isUserPro =
                user?.plan === "pro" ||
                user?.plan === "business" ||
                user?.subscriptionStatus === "PRO_ACTIVE";

              return (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-all",
                      isUserPro
                        ? "bg-slate-100 dark:bg-slate-900 border-emerald-500/50 hover:border-emerald-500"
                        : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase",
                      isUserPro ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-100"
                    )}>
                      {user.fullName ? user.fullName[0] : "U"}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                      {user.fullName || "User"}
                    </span>
                    {isUserPro ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        PRO
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                        FREE
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{user.fullName}</div>
                          {isSuperAdmin() ? (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              SUPER ADMIN
                            </span>
                          ) : isUserPro ? (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              PRO MEMBER
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              FREE PLAN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>

                        {!isUserPro && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => {
                                setUserMenuOpen(false);
                                openUpgradeModal("User Dropdown Upgrade");
                              }}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                            >
                              <span>Upgrade to PRO</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isSuperAdmin() && (
                        <div className="py-1 border-b border-slate-100 dark:border-slate-800 bg-amber-500/5">
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/15 transition-colors"
                          >
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span>⚡ God-Mode Admin Panel</span>
                          </Link>
                          <Link
                            href="/admin?tab=accounts"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            <span>💳 Manage Payment Accounts</span>
                          </Link>
                        </div>
                      )}

                      <Link
                        href="/history"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <History className="w-4 h-4 text-emerald-500" />
                        <span>My Calculations &amp; BOQs</span>
                      </Link>

                      <Link
                        href="/pricing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Plans &amp; Pro Benefits</span>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account Settings</span>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
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
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openLoginModal()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </header>
    <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
  </>
  );
}
