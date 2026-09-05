"use client";

import React from "react";
import { Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  size?: "xs" | "sm" | "md";
  variant?: "solid" | "subtle" | "amber" | "outline";
  showIcon?: boolean;
  className?: string;
}

export function ProBadge({
  size = "xs",
  variant = "subtle",
  showIcon = false,
  className
}: ProBadgeProps) {
  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 tracking-wider gap-0.5",
    sm: "text-[10px] px-2 py-0.5 tracking-wider gap-1",
    md: "text-xs px-2.5 py-1 tracking-wide gap-1.5"
  }[size];

  const variantClasses = {
    subtle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30",
    solid: "bg-emerald-600 text-white shadow-xs font-black",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/40",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center font-black uppercase rounded-md select-none transition-all",
        sizeClasses,
        variantClasses,
        className
      )}
    >
      {showIcon && <Sparkles className="w-2.5 h-2.5 shrink-0" />}
      <span>PRO</span>
    </span>
  );
}
