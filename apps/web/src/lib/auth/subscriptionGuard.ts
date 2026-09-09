import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSuperAdminEmail } from "@buildcost/config";
import type { User } from "@supabase/supabase-js";

export interface UserSubscriptionResult {
  authorized: boolean;
  isPro: boolean;
  tier: "free" | "pro" | "business";
  userId?: string;
  user?: User;
  email?: string;
  role?: string;
  expiresAt?: string | null;
  error?: string;
  status?: number;
}

/**
 * Server-side cryptographic session & PRO entitlement verification.
 * Validates Supabase JWT against PostgreSQL profiles & subscriptions table.
 * Strictly ignores spoofed client-side headers.
 */
export async function verifyUserProAccess(
  request?: NextRequest
): Promise<UserSubscriptionResult> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        authorized: false,
        isPro: false,
        tier: "free",
        error: "Authentication required. Please sign in to access this feature.",
        status: 401
      };
    }

    const email = user.email || "";

    // 1. Super Admin whitelist verification
    if (isSuperAdminEmail(email)) {
      return {
        authorized: true,
        isPro: true,
        tier: "pro",
        userId: user.id,
        user,
        email,
        role: "superadmin"
      };
    }

    // 2. Query verified user profile from database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_pro, pro_expires_at")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "user";
    if (role === "admin" || role === "superadmin") {
      return {
        authorized: true,
        isPro: true,
        tier: "pro",
        userId: user.id,
        user,
        email,
        role
      };
    }

    if (profile?.is_pro === true) {
      const expires = profile?.pro_expires_at;
      if (!expires || new Date(expires).getTime() > Date.now()) {
        return {
          authorized: true,
          isPro: true,
          tier: "pro",
          userId: user.id,
          user,
          email,
          role,
          expiresAt: expires
        };
      }
    }

    // 3. Fallback: Query active subscription record
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("plan_id, status, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeSub && (!activeSub.expires_at || new Date(activeSub.expires_at).getTime() > Date.now())) {
      return {
        authorized: true,
        isPro: true,
        tier: activeSub.plan_id === "plan_business" ? "business" : "pro",
        userId: user.id,
        user,
        email,
        role,
        expiresAt: activeSub.expires_at
      };
    }

    return {
      authorized: false,
      isPro: false,
      tier: "free",
      userId: user.id,
      user,
      email,
      role,
      error: "This feature requires an active BuildCost PRO subscription.",
      status: 403
    };
  } catch (err: any) {
    return {
      authorized: false,
      isPro: false,
      tier: "free",
      error: err.message || "Failed to verify PRO subscription entitlement.",
      status: 500
    };
  }
}
