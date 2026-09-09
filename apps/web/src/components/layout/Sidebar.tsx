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
  FolderArchive,
  Compass,
  Building2,
  ShoppingCart,
  Boxes,
  BookOpen,
  CalendarClock,
  CreditCard,
  Wallet,
  TrendingUp,
  Hammer,
  Activity,
  Truck,
  Layers,
  Paintbrush,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles
} from "lucide-react";
import { APP_VERSION } from "@buildcost/config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface NavSubItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ElementType;
  directHref?: string;
  items?: NavSubItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAuthStore();
  const isSuper = isSuperAdmin();

  const navSections: NavSection[] = [
    {
      id: "main",
      title: "Main",
      icon: LayoutGrid,
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
        { label: "Property Calculator", href: "/calculator", icon: Calculator }
      ]
    },
    {
      id: "estimation",
      title: "Estimation",
      icon: Calculator,
      items: [
        { label: "Grey Structure", href: "/calculator/concrete", icon: Layers, badge: "PRO" },
        { label: "Finishing", href: "/calculator/paint", icon: Paintbrush, badge: "PRO" },
        { label: "BOQ Studio", href: "/boq", icon: FileSpreadsheet, badge: "PRO" },
        { label: "Labour & Mistri", href: "/labour", icon: Hammer },
        { label: "Materials Takeoff", href: "/materials", icon: Boxes }
      ]
    },
    {
      id: "project",
      title: "Project",
      icon: FolderArchive,
      items: [
        { label: "My Projects", href: "/projects", icon: FolderArchive, badge: "PRO" },
        { label: "Budget & Cash Flow", href: "/budget", icon: Wallet, badge: "PRO" },
        { label: "Purchases & Slips", href: "/purchases", icon: ShoppingCart, badge: "PRO" },
        { label: "Vendors & Khata", href: "/vendors", icon: Building2, badge: "PRO" },
        { label: "Progress Tracking", href: "/progress", icon: Activity }
      ]
    },
    {
      id: "reports",
      title: "Reports",
      icon: BarChart3,
      items: [
        { label: "Reports & PDF Export", href: "/reports", icon: BarChart3 },
        { label: "Saved Calculations", href: "/history", icon: BookOpen }
      ]
    },
    {
      id: "admin",
      title: "Admin",
      icon: Settings,
      items: [
        {
          label: isSuper ? "God-Mode Admin" : "Admin Dashboard",
          href: "/admin",
          icon: ShieldAlert,
          badge: isSuper ? "⚡ GOD" : "ADMIN"
        },
        { label: "Market Rates", href: "/rates/materials", icon: TrendingUp, badge: "PRO" },
        { label: "Users & Subscriptions", href: "/admin?tab=users", icon: CreditCard },
        { label: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  // Auto-determine which section should be open based on current pathname
  const getActiveSectionId = (currentPath: string): string => {
    for (const section of navSections) {
      if (section.directHref && currentPath === section.directHref) {
        return section.id;
      }
      if (section.items) {
        for (const item of section.items) {
          if (currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href.split("?")[0]))) {
            return section.id;
          }
        }
      }
    }
    return "dashboard";
  };

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() => {
    const activeId = getActiveSectionId(pathname);
    return { [activeId]: true };
  });

  // Keep active section open when pathname changes
  React.useEffect(() => {
    const activeId = getActiveSectionId(pathname);
    setExpandedSections((prev) => ({
      ...prev,
      [activeId]: true
    }));
  }, [pathname]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <aside className="hidden lg:flex w-[230px] flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 p-3 select-none shrink-0 min-h-screen transition-colors">
      {/* Brand Header */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-2 mb-2 group">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20 transition-all">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            BuildCost
          </div>
          <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-tight">
            Connect Pakistan
          </div>
        </div>
      </Link>

      {/* Navigation Accordion */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5 text-xs">
        {navSections.map((section) => {
          const SectionIcon = section.icon;
          const isDirect = !!section.directHref;
          const isExpanded = !!expandedSections[section.id];

          // Check if this section contains the current active route
          const isCurrentSectionActive = isDirect
            ? pathname === section.directHref
            : section.items?.some(
                (it) => pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href.split("?")[0]))
              );

          if (isDirect && section.directHref) {
            return (
              <Link
                key={section.id}
                href={section.directHref}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-150",
                  isCurrentSectionActive
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <SectionIcon className={cn("w-4 h-4 shrink-0", isCurrentSectionActive ? "text-white" : "text-slate-400")} />
                <span>{section.title}</span>
              </Link>
            );
          }

          return (
            <div key={section.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-150 text-left",
                  isCurrentSectionActive && !isExpanded
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <SectionIcon className={cn("w-4 h-4 shrink-0", isCurrentSectionActive ? "text-emerald-500" : "text-slate-400")} />
                  <span>{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Sub-items drawer */}
              {isExpanded && section.items && (
                <div className="pl-4 pr-1 py-0.5 space-y-0.5 border-l border-slate-200/80 dark:border-slate-800 ml-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {section.items.map((item) => {
                    const itemBasePath = item.href.split("?")[0];
                    const isItemActive =
                      pathname === item.href ||
                      (itemBasePath !== "/dashboard" && pathname === itemBasePath);
                    const ItemIcon = item.icon;
                    const isGodBadge = item.badge === "⚡ GOD";

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                          isItemActive
                            ? isGodBadge
                              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                              : "bg-emerald-600 text-white font-bold shadow-xs"
                            : isGodBadge
                            ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/70"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon
                            className={cn(
                              "w-3.5 h-3.5 shrink-0",
                              isItemActive
                                ? isGodBadge ? "text-slate-950" : "text-white"
                                : isGodBadge ? "text-amber-500" : "text-slate-400"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[8px] font-black px-1 py-0.2 rounded uppercase tracking-wider shrink-0 ml-1",
                              item.badge === "⚡ GOD"
                                ? isItemActive
                                  ? "bg-slate-950 text-amber-400"
                                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                                : item.badge === "PRO"
                                ? isItemActive
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : isItemActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Compact Market Indicator Badge */}
      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
              PBS &amp; APCMA Active
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
              Live Pakistan rates
            </div>
          </div>
        </div>

        {/* Version & What's New Link */}
        <Link
          href="/updates"
          className="mt-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-between transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
        >
          <span className="font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-400">
            v{APP_VERSION}
          </span>
          <span className="font-semibold flex items-center gap-1 text-slate-600 dark:text-slate-300 group-hover:text-emerald-400">
            <span>What's New</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </span>
        </Link>
      </div>
    </aside>
  );
}
