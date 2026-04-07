import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Force Turbopack bundler for dev mode
  turbopack: {}
};

export default nextConfig;
