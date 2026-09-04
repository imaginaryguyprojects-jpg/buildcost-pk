"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Calculator,
  BarChart3,
  Settings,
  FileSpreadsheet,
  ShieldAlert,
  Bot,
  Grid,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "AI Advisor", href: "/advisor", icon: Bot, badge: "AI" },
  { label: "Room Estimator", href: "/rooms", icon: Grid },
  { label: "Unit Converter", href: "/tools/converter", icon: ArrowRightLeft },
  { label: "BOQ & Quotes", href: "/boq", icon: FileSpreadsheet },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin Panel", href: "/admin", icon: ShieldAlert }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80 p-5 select-none shrink-0 min-h-screen transition-colors">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/40">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight">BuildCost</div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Connect PK</div>
        </div>
      </div>

      {/* Navigation items matching UI.jpg pill styling */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-transform", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider",
                  isActive ? "bg-white text-emerald-700" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live System Indicator */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-900">
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">PBS & APCMA Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Live Pakistan construction market intelligence feed active.
          </p>
        </div>
      </div>
    </aside>
  );
}
