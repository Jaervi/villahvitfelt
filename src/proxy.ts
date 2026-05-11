import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`>>> [SUPER-PROXY] Request received for: ${pathname}`);

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    console.log(">>> [SUPER-PROXY] ADMIN ROUTE DETECTED. VALIDATING VIA API...");
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      if (!response.ok) {
        console.log(">>> [SUPER-PROXY] API ERROR. REDIRECTING TO /login");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const session = await response.json();

      if (!session) {
        console.log(">>> [SUPER-PROXY] NO SESSION FOUND. REDIRECTING TO /login");
        return NextResponse.redirect(new URL("/login", request.url));
      }

      console.log(`>>> [SUPER-PROXY] USER FOUND: ${session.user.email} (Role: ${session.user.role})`);

      if (session.user.role !== "admin") {
        console.log(">>> [SUPER-PROXY] USER IS NOT ADMIN. REDIRECTING TO /");
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      console.log(">>> [SUPER-PROXY] ACCESS GRANTED.");
    } catch (e: any) {
      console.error(">>> [SUPER-PROXY] ERROR:", e.message);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
