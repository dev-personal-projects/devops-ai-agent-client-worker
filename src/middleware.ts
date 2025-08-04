// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Protected route patterns
const protectedRoutePatterns = [
  /^\/dashboard/,
  /^\/profile/,
  /^\/settings/,
];

const LOGIN_ROUTE = "/login";
const DASHBOARD_ROUTE = "/dashboard";
const HOME_ROUTE = "/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const authToken = request.cookies.get("access_token")?.value;

  // 1. Allow Next.js internals, assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // 2. Handle root path "/"
  if (pathname === HOME_ROUTE) {
    if (!authToken) {
      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
    }

    // If coming from a specific page, allow access to home
    if (request.nextUrl.searchParams.get("from")) {
      return NextResponse.next();
    }

    // If user is authenticated, redirect to dashboard
    const dashboardUrl = new URL(DASHBOARD_ROUTE, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Handle public routes (login, signup, etc.)
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If user is already authenticated and trying to access auth pages, redirect to dashboard
    if (authToken && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // 4. Handle protected routes
  if (protectedRoutePatterns.some((pattern) => pattern.test(pathname))) {
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Handle any other paths that should be protected by default
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/profile") || 
      pathname.startsWith("/settings")) {
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Default behavior - allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};