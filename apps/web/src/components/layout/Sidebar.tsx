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
  History,
  CheckSquare,
  Bell,
  FolderArchive,
  ArrowRightLeft,
  Compass,
  Building2,
  ShoppingCart,
  Boxes,
  BookOpen,
  CalendarClock,
  CreditCard,
  Wallet,
  TrendingUp,
  User,
  Hammer,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Planning & Design",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Projects", href: "/projects", icon: FolderArchive, badge: "PRO" },
      { label: "Calculator", href: "/calculator", icon: Calculator },
      { label: "Materials", href: "/materials", icon: Boxes },
      { label: "Labour", href: "/labour", icon: Hammer },
      { label: "Floor Plan Analysis", href: "/layouts", icon: Compass, badge: "PRO" }
    ]
  },
  {
    title: "Site & Financials",
    items: [
      { label: "Cash Flow & Budget", href: "/budget", icon: Wallet, badge: "PRO" },
      { label: "Progress", href: "/progress", icon: Activity },
      { label: "Vendors & Khata", href: "/vendors", icon: Building2, badge: "PRO" },
      { label: "Purchases & Orders", href: "/purchases", icon: ShoppingCart, badge: "PRO" },
      { label: "Transport & Logistics", href: "/transport", icon: ShoppingCart, badge: "PRO" },
      { label: "Reminders", href: "/reminders", icon: CalendarClock }
    ]
  },
  {
    title: "Intelligence & Rates",
    items: [
      { label: "Rates & Price Alerts", href: "/rates/materials", icon: TrendingUp, badge: "PRO" },
      { label: "Reports & PDF", href: "/reports", icon: BarChart3 },
      { label: "Advanced BOQ", href: "/boq", icon: FileSpreadsheet, badge: "PRO" },
      { label: "Daily Site Diary", href: "/diary", icon: BookOpen },
      { label: "Stock Inventory", href: "/inventory", icon: Boxes },
      { label: "AI Advisor", href: "/advisor", icon: Bot, badge: "PRO" }
    ]
  },
  {
    title: "Account & Administration",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Plans & Pricing", href: "/pricing", icon: CreditCard, badge: "PRO" },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Admin Panel", href: "/admin", icon: ShieldAlert, badge: "ADMIN" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 p-4 select-none shrink-0 min-h-screen transition-colors">
      {/* Clean Brand Header */}
      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 mb-3 group">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20 transition-all">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            BuildCost
          </div>
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            Connect Pakistan
          </div>
        </div>
      </Link>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/80"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          item.badge === "PRO"
                            ? isActive
                              ? "bg-white/20 text-white font-black"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : item.badge === "ADMIN"
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            : isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Clean Verified Market Status Card */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              PBS &amp; APCMA Rates Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            Real-time Pakistan civil engineering rates loaded.
          </p>
        </div>
      </div>
    </aside>
  );
}
