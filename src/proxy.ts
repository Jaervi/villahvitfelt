import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js 16 Proxy
 * 
 * RECOMMENDED PATTERN:
 * 1. Proxy handles "optimistic" redirection by checking for cookie existence.
 *    This is Edge-safe and prevents blocking the request with DB calls.
 * 2. Pages/Layouts handle "secure" validation (role checks, DB session validation).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Optimistic redirect for /admin
  if (pathname.startsWith("/admin")) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      console.log(">>> [PROXY] NO SESSION COOKIE FOUND. REDIRECTING TO /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
