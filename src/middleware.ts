// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".") ||
    pathname.startsWith("/_vercel")
  ) {
    return NextResponse.next();
  }

  // Let all other requests through - client-side auth guards will handle authentication
  console.log(`Middleware: Allowing request to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|images|icons|.*\\.[\\w]+|_vercel).*)",
  ],
};