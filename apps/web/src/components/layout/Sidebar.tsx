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
  CalendarClock
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
    title: "Estimation & Design",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
      { label: "Cost Calculator", href: "/calculator", icon: Calculator },
      { label: "House Layouts", href: "/layouts", icon: Compass, badge: "2D CAD" }
    ]
  },
  {
    title: "Site Operations",
    items: [
      { label: "Purchases & Orders", href: "/purchases", icon: ShoppingCart },
      { label: "Stock Inventory", href: "/inventory", icon: Boxes },
      { label: "Vendors & Khata", href: "/vendors", icon: Building2 },
      { label: "Daily Site Diary", href: "/diary", icon: BookOpen },
      { label: "Reminders & Tasks", href: "/reminders", icon: CalendarClock }
    ]
  },
  {
    title: "Tools & Quantity",
    items: [
      { label: "Room Estimator", href: "/rooms", icon: Grid },
      { label: "BOQ & Quotes", href: "/boq", icon: FileSpreadsheet },
      { label: "Unit Converter", href: "/tools/converter", icon: ArrowRightLeft },
      { label: "Price Watchlist", href: "/watchlist", icon: Bell },
      { label: "AI Advisor", href: "/advisor", icon: Bot, badge: "AI" }
    ]
  },
  {
    title: "Records & Settings",
    items: [
      { label: "My History", href: "/history", icon: History },
      { label: "Site Checklist", href: "/checklist", icon: CheckSquare },
      { label: "Documents", href: "/documents", icon: FolderArchive },
      { label: "Reports & PDF", href: "/reports", icon: BarChart3 },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Admin Panel", href: "/admin", icon: ShieldAlert }
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
                          isActive
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
