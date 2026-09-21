import { NextRequest, NextResponse } from "next/server";
import { verifyUserProAccess } from "@/lib/auth/subscriptionGuard";

export async function GET(request: NextRequest) {
  const result = await verifyUserProAccess(request);

  if (!result.user) {
    return NextResponse.json(
      { authenticated: false, isPro: false, tier: "free", error: result.error },
      { status: result.status || 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    userId: result.userId,
    email: result.email,
    role: result.role,
    isPro: result.isPro,
    tier: result.tier,
    expiresAt: result.expiresAt || null
  });
}
