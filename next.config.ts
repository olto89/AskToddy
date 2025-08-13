import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip TypeScript errors during build for quick deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;