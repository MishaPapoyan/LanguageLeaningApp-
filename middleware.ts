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

    // PERF: enable browser back/forward cache restoration on dynamic pages.
    // Next.js auto-adds `Cache-Control: private, no-cache, no-store, max-age=0,
    // must-revalidate` to every SSR'd dynamic page, which disables BF-cache and
    // forces a full reload on browser-back. We strip `no-store` so BF-cache works
    // while keeping `no-cache + must-revalidate` so fresh data still loads on
    // direct navigation. Personal-data API routes continue to set their own headers.
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-cache, must-revalidate, max-age=0");
    return res;
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
