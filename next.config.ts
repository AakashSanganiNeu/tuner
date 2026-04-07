import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Force clean CSS handling with Turbopack (Next.js 16 default)
  experimental: {
    // Ensure proper CSS module handling
  }
};

export default nextConfig;
