import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // We only care about protecting /admin routes for now
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("better-auth.session_token") || 
                          request.cookies.get("__secure-better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Validate the session by calling the Better Auth API
      const response = await fetch(`${origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const session = await response.json();

      // If no session or user is not an admin, redirect
      // Note: We check session.user.role if we want strict admin-only access
      if (!session || !session.user || session.user.role !== "admin") {
        // You might want a different "unauthorized" page, 
        // but for now redirecting to home or login is common.
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware session validation error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
