import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Public routes that don't require authentication
// Note: /api/health is excluded by the matcher regex, and /api/auth is handled
// earlier in the middleware with rate limiting before this check runs.
const publicRoutes = ["/", "/login"];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname);
}

// Lightweight auth rate limiter for middleware (Edge-compatible, no pino dependency)
// Limits auth endpoint requests by IP to prevent brute-force OAuth abuse
const authRateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>();
const AUTH_WINDOW_MS = 300000; // 5 minutes
const AUTH_MAX_REQUESTS = 10; // 10 requests per window
let lastAuthCleanup = Date.now();

function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();

  // Lazy cleanup: evict expired entries every 60 seconds to prevent unbounded Map growth
  if (now - lastAuthCleanup > 60000) {
    lastAuthCleanup = now;
    for (const [key, entry] of authRateLimitStore.entries()) {
      if (now > entry.resetTime) {
        authRateLimitStore.delete(key);
      }
    }
  }

  const entry = authRateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    authRateLimitStore.set(ip, { count: 1, resetTime: now + AUTH_WINDOW_MS });
    return true;
  }

  entry.count++;
  return entry.count <= AUTH_MAX_REQUESTS;
}

// Use NextAuth's auth() wrapper for proper JWT validation in middleware
// This validates the token signature and expiration, not just cookie presence
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // IMPORTANT: Auth route check MUST come before the !req.auth redirect below,
  // because unauthenticated users need to reach /api/auth/* to sign in.
  if (pathname.startsWith("/api/auth")) {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
    if (!checkAuthRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "300" } },
      );
    }
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // req.auth is null if the JWT is missing, expired, or invalid
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)",
  ],
};
