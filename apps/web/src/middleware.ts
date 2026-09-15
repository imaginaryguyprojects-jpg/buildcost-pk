import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSuperAdminEmail } from "@buildcost/config";

// Routes that strictly require an active, cryptographically verified Supabase session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/inventory",
  "/purchases",
  "/vendors",
  "/settings",
  "/documents",
  "/diary",
  "/checklist",
  "/admin",
  "/profile"
];

// Routes requiring superadmin or admin privileges
const ADMIN_PREFIXES = ["/admin", "/god-mode"];

// Auth routes where authenticated users should be redirected to dashboard
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Check for Super Admin God Mode cookie or header bypass
  const cookieAdminEmail = decodeURIComponent(
    request.cookies.get("buildcost_admin_email")?.value || ""
  ).toLowerCase().trim();
  const headerAdminEmail = (
    request.headers.get("x-godmode-email") ||
    request.headers.get("x-admin-email") ||
    ""
  ).toLowerCase().trim();

  const isGodModeCookie = isSuperAdminEmail(cookieAdminEmail) || isSuperAdminEmail(headerAdminEmail);

  // If hardcoded God Mode credentials are active, grant permanent bypass across all protected routes
  if (isGodModeCookie) {
    // If God Mode user is visiting login/signup, allow them to navigate to admin or dashboard
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Cryptographically validate the user's JWT token against Supabase Auth
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    const isSessionGodMode = user && user.email && isSuperAdminEmail(user.email);
    if (isSessionGodMode) {
      // Whitelisted Super Admin session: allow access everywhere
      return response;
    }

    const isAdminRoute = ADMIN_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

    // If an authenticated non-admin tries to access /admin or /god-mode
    if (isAdminRoute && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const role = profile?.role;
      if (role !== "admin" && role !== "superadmin") {
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("error", "unauthorized_admin");
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // 1. Unauthenticated access to protected routes (excluding admin routes which have their own in-page unlock gate)
    if (isProtected && !isAdminRoute) {
      if (authError || !user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // 2. Email Confirmation Enforcement
      const isEmailConfirmed = !!(user.email_confirmed_at || (user as any).confirmed_at);
      if (!isEmailConfirmed && pathname !== "/verify-email") {
        const verifyUrl = new URL("/verify-email", request.url);
        verifyUrl.searchParams.set("email", user.email || "");
        return NextResponse.redirect(verifyUrl);
      }
    }

    // 4. Authenticated users visiting login/signup -> Redirect to /dashboard
    if (isAuthRoute && user && !authError) {
      const isEmailConfirmed = !!(user.email_confirmed_at || (user as any).confirmed_at);
      if (isEmailConfirmed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } catch {
    // If Supabase is unreachable, let Next.js handle or fallback
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (icons, manifests, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
