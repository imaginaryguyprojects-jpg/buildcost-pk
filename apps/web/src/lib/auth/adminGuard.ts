import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  PlatformRole,
  SUPER_ADMIN_EMAILS,
  isSuperAdminEmail,
  hasRolePermission
} from "@buildcost/config";

export interface AdminAuthResult {
  authorized: boolean;
  role?: PlatformRole;
  email?: string;
  isSuperAdmin?: boolean;
  user?: any;
  error?: string;
  status?: number;
}

/**
 * Server-side RBAC authorization guard for Super Admin / Admin endpoints
 * Validates session, Supabase Auth tokens, and email God-Mode whitelist
 */
export async function verifyAdminSession(
  request: NextRequest,
  requiredRole: PlatformRole = "admin"
): Promise<AdminAuthResult> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return {
        authorized: false,
        error: "Authentication required. Please sign in with administrator credentials.",
        status: 401
      };
    }

    const effectiveEmail = user.email;

    // 1. Super Admin whitelist verification
    if (isSuperAdminEmail(effectiveEmail)) {
      return {
        authorized: true,
        role: "super_admin",
        email: effectiveEmail,
        isSuperAdmin: true,
        user
      };
    }

    // 2. Query profile role from Supabase PostgreSQL
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = (profile?.role || "user") as PlatformRole;

      if (hasRolePermission(userRole, requiredRole)) {
        return {
          authorized: true,
          role: userRole,
          email: user.email,
          isSuperAdmin: userRole === "super_admin",
          user
        };
      }
    }

    return {
      authorized: false,
      error: `Access denied. Requires '${requiredRole}' role or above.`,
      status: 403
    };
  } catch (err: any) {
    return {
      authorized: false,
      error: err.message || "Failed to verify admin credentials.",
      status: 500
    };
  }
}
