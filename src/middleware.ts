// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- Settings ---------------------------------------------------
const LOGIN_ROUTE = "/auth/login";
const PUBLIC_ROUTES = new Set([
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/forgot-password",
  "/reset-password",
  "/", // landing
]);

// Dynamic, user-scoped parents we enforce:
const USER_SCOPED_PREFIXES = [
  "/dashboard",
  "/deployments",
  "/(github)",
  "/(analysis)",
] as const;

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuth(request: NextRequest): Promise<{ uid: string } | null> {
  const accessToken = request.cookies.get("access_token")?.value;
  const userId = request.cookies.get("user_id")?.value;

  console.log("Auth check:", { 
    hasToken: !!accessToken, 
    hasUserId: !!userId, 
    userId: userId?.substring(0, 8) + "..." 
  });

  if (!accessToken || !userId) {
    return null;
  }

  return { uid: userId };
}

// Ensure a path is user-scoped (/uid/...); if not, we’ll rewrite/redirect.
function needsUserScope(pathname: string) {
  // e.g. "/dashboard" or "/deployments" or "/(github)/..." at root
  return USER_SCOPED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

// Extract the first segment (potential userId)
function getFirstSegment(pathname: string) {
  const [, seg] = pathname.split("/");
  return seg || "";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow all routes - let client-side auth guards handle authentication
  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|icons|.*\\.[\\w]+).*)",
  ],
};
