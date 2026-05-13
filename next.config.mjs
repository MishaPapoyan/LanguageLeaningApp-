/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

// Derive allowed origins from NEXTAUTH_URL so Server Actions work in production
// e.g. https://my-app.vercel.app → "my-app.vercel.app"
function getAllowedOrigins() {
  const base = ["localhost:3000", "localhost:3001"];
  const url = process.env.NEXTAUTH_URL;
  if (url) {
    try {
      const { host } = new URL(url);
      if (host && !base.includes(host)) base.push(host);
    } catch {}
  }
  return base;
}

const nextConfig = {
  // Remove X-Powered-By header
  poweredByHeader: false,

  // Tree-shake large barrel packages
  experimental: {
    optimizePackageImports: ["lucide-react", "@react-three/drei", "date-fns", "lodash"],
    serverActions: { allowedOrigins: getAllowedOrigins() },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Strip console.* in production builds
  compiler: {
    removeConsole: isProd ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
