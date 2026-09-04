"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/projectStore";

export function ThemeSync() {
  const { theme } = useProjectStore();

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  return null;
}
