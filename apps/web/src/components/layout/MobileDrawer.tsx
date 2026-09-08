"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
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
  MapPin,
  Moon,
  Sun,
  LogOut,
  Zap
} from "lucide-react";
import { PAKISTANI_CITIES } from "@buildcost/config";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const {
    selectedCityId,
    setSelectedCityId,
    theme,
    toggleTheme
  } = useProjectStore();
  const {
    user,
    isAuthenticated,
    logout,
    openLoginModal,
    openUpgradeModal,
    isSuperAdmin
  } = useAuthStore();
  const isSuper = isSuperAdmin();

  const selectedCity = PAKISTANI_CITIES.find((c) => c.id === selectedCityId) || PAKISTANI_CITIES[0];
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);

  const isPro =
    user?.plan === "pro" ||
    user?.plan === "business" ||
    user?.subscriptionStatus === "PRO_ACTIVE";

  const navSections: NavSection[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutGrid,
      directHref: "/dashboard"
    },
    {
      id: "project",
      title: "Project",
      icon: FolderArchive,
      items: [
        { label: "Active Projects", href: "/projects", icon: FolderArchive, badge: "PRO" },
        { label: "Create Project", href: "/projects/new", icon: Plus },
        { label: "Floor Plan Analysis", href: "/layouts", icon: Compass, badge: "PRO" }
      ]
    },
    {
      id: "calculators",
      title: "Calculators",
      icon: Calculator,
      items: [
        { label: "Civil Estimator", href: "/calculator", icon: Calculator },
        { label: "Grey Structure", href: "/calculator?step=grey", icon: Layers, badge: "PRO" },
        { label: "Finishing Works", href: "/calculator?step=finishing", icon: Paintbrush, badge: "PRO" },
        { label: "Labour Productivity", href: "/labour", icon: Hammer }
      ]
    },
    {
      id: "materials",
      title: "Materials",
      icon: Boxes,
      items: [
        { label: "Material Takeoffs", href: "/materials", icon: Boxes },
        { label: "Market Rates & Alerts", href: "/rates/materials", icon: TrendingUp, badge: "PRO" },
        { label: "Stock Inventory", href: "/inventory", icon: Boxes }
      ]
    },
    {
      id: "vendors",
      title: "Vendors",
      icon: Building2,
      items: [
        { label: "Vendors & Khata", href: "/vendors", icon: Building2, badge: "PRO" },
        { label: "Purchases & Slips", href: "/purchases", icon: ShoppingCart, badge: "PRO" },
        { label: "Transport & Logistics", href: "/transport", icon: Truck, badge: "PRO" }
      ]
    },
    {
      id: "reports",
      title: "Reports",
      icon: BarChart3,
      items: [
        { label: "Reports & PDF Export", href: "/reports", icon: BarChart3 },
        { label: "Advanced BOQ Studio", href: "/boq", icon: FileSpreadsheet, badge: "PRO" },
        { label: "Daily Site Diary", href: "/diary", icon: BookOpen },
        { label: "Budget & Cash Flow", href: "/budget", icon: Wallet, badge: "PRO" },
        { label: "Progress Tracking", href: "/progress", icon: Activity }
      ]
    },
    {
      id: "more",
      title: "More",
      icon: Settings,
      items: [
        { label: "Plans & Pricing", href: "/pricing", icon: CreditCard, badge: "PRO" },
        { label: "Reminders & Alerts", href: "/reminders", icon: CalendarClock },
        { label: "AI Advisor", href: "/advisor", icon: Bot, badge: "PRO" },
        { label: "Settings", href: "/settings", icon: Settings },
        {
          label: isSuper ? "God-Mode Admin" : "Admin Panel",
          href: "/admin",
          icon: ShieldAlert,
          badge: isSuper ? "⚡ GOD" : "ADMIN"
        }
      ]
    }
  ];

  const getActiveSectionId = (currentPath: string): string => {
    for (const section of navSections) {
      if (section.directHref && currentPath === section.directHref) return section.id;
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

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const activeId = getActiveSectionId(pathname);
    return { [activeId]: true };
  });

  useEffect(() => {
    const activeId = getActiveSectionId(pathname);
    setExpandedSections((prev) => ({ ...prev, [activeId]: true }));
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200 ease-out">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                BuildCost Connect
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Property Calculator 2.0
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.fullName || "User"}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
              {isSuper ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  GOD MODE
                </span>
              ) : isPro ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                  PRO
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openUpgradeModal("Mobile Drawer Upgrade");
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs shrink-0 cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Guest Explorer
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openLoginModal();
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCitySelectorOpen(!citySelectorOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Market: {selectedCity?.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {citySelectorOpen && (
              <div className="mt-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-48 overflow-y-auto z-10">
                {PAKISTANI_CITIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCityId(c.id);
                      setCitySelectorOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between",
                      c.id === selectedCityId
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-arabic">{c.urduName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/projects/new"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navSections.map((section) => {
            const isSectionExpanded = !!expandedSections[section.id];
            const SectionIcon = section.icon;

            if (section.directHref) {
              const isActive = pathname === section.directHref;
              return (
                <Link
                  key={section.id}
                  href={section.directHref}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                    isActive
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  )}
                >
                  <SectionIcon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                  <span>{section.title}</span>
                </Link>
              );
            }

            return (
              <div key={section.id} className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className="w-4 h-4 text-slate-400" />
                    <span>{section.title}</span>
                  </div>
                  {isSectionExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isSectionExpanded && section.items && (
                  <div className="ml-5 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                    {section.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isActive =
                        pathname === subItem.href ||
                        (subItem.href !== "/dashboard" && pathname.startsWith(subItem.href.split("?")[0]));
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                            <span className="truncate">{subItem.label}</span>
                          </div>
                          {subItem.badge && (
                            <span
                              className={cn(
                                "px-1.5 py-0.2 rounded text-[9px] font-black shrink-0 ml-1.5",
                                subItem.badge.includes("GOD")
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              )}
                            >
                              {subItem.badge}
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
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}