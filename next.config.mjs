/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trim X-Powered-By header
  poweredByHeader: false,

  // Tree-shake large barrel packages — only bundles what's imported
  experimental: {
    optimizePackageImports: ["recharts", "date-fns", "lodash"],
    serverActions: { allowedOrigins: ["localhost:3000", "localhost:3001"] },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Faster production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
