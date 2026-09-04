"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calculator, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Calculator", href: "/calculator", icon: Calculator },
    { label: "Market", href: "/rates/materials", icon: TrendingUp },
    { label: "Account", href: "/profile", icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around z-50 px-2">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all",
              isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon className={cn("w-5 h-5 mb-1", isActive ? "text-emerald-400 stroke-[2.2]" : "text-slate-400")} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
