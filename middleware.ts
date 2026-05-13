import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// CRIT-3: Admin routes must be role-gated at middleware level, not just in layout.
// Without this, a logged-in STUDENT can call /api/admin/* directly.
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // BF-cache header override moved to next.config.mjs `headers()` — applies at
    // the edge AFTER Next.js sets its dynamic-page defaults (middleware headers
    // get overwritten for SSR pages, config.headers() do not).
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/learn/:path*",
    "/stories/:path*",
    "/tutor/:path*",
    "/games/:path*",
    "/dictionary/:path*",
    "/my-words/:path*",
    "/review/:path*",
    "/progress/:path*",
    "/analytics/:path*",
    "/leaderboard/:path*",
    "/settings/:path*",
    "/community/:path*",
    "/admin/:path*",
  ],
};
