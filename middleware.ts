import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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
