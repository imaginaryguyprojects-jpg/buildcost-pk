"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User, ChevronDown, Bell, Plus, Sun, Moon } from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const { selectedCityId, setSelectedCityId, theme, toggleTheme } = useProjectStore();
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];

  const topNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Rates", href: "/rates/materials" },
    { label: "Labour", href: "/labour" },
    { label: "Profile", href: "/profile" }
  ];

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md transition-colors">
      {/* Brand on Mobile / Tablet */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex lg:hidden items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            BC
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base">BuildCost Connect</span>
        </Link>

        {/* Center top nav links matching UI.jpg header */}
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

        {/* Quick New Project Button */}
        <Link
          href="/projects/new"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
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

        {/* Notification Bell */}
        <button
          aria-label="Rate Alerts"
          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Pill Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-700 text-emerald-100 flex items-center justify-center text-xs font-bold">
            U
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}
