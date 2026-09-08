"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function useHeartbeat() {
  const { user } = useAuthStore();

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/analytics/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "web",
            plan: user?.plan || "free",
            userId: user?.id || null,
            city: "Islamabad"
          })
        });
      } catch {
        // Silent fail for telemetry
      }
    };

    // Initial ping
    sendHeartbeat();

    // Ping every 60 seconds
    const intervalId = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(intervalId);
  }, [user?.id, user?.plan]);
}
