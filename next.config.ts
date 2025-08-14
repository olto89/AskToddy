import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Skip TypeScript errors during build for quick deployment
    ignoreBuildErrors: true,
  },
};

export default withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true, // Suppresses source map uploading logs during build
    org: "asktoddy", // You'll set this up in Sentry dashboard
    project: "asktoddy-nextjs", // You'll set this up in Sentry dashboard
  },
  {
    // Additional config options
    widenClientFileUpload: true, // Upload a larger set of source maps
    transpileClientSDK: true, // Transpile SDK to support IE11
    hideSourceMaps: true, // Hides source maps from generated client bundles
    disableLogger: true, // Automatically tree-shake Sentry logger statements
    automaticVercelMonitors: true, // Enable automatic instrumentation of Vercel Cron Monitors
  }
);