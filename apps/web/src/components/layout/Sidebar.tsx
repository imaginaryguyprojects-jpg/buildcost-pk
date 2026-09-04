"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calculator, BarChart3, Settings, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "BOQ & Quotes", href: "/boq", icon: FileSpreadsheet },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin Panel", href: "/admin", icon: ShieldAlert }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-slate-950 border-r border-slate-800/80 p-5 select-none shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-950/40">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-tight">BuildCost</div>
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Connect PK</div>
        </div>
      </div>

      {/* Navigation items matching UI.jpg pill styling */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive ? "text-white" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Live System Indicator */}
      <div className="mt-auto pt-4 border-t border-slate-900">
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">Pakistan Market Rates</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            City-aware verified rates active across 13 major districts.
          </p>
        </div>
      </div>
    </aside>
  );
}
