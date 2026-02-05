import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/api/health"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/auth")
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (NextAuth session token)
  const sessionCookie = request.cookies.get("authjs.session-token") ||
                        request.cookies.get("__Secure-authjs.session-token");

  // Redirect to login if no session
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

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
