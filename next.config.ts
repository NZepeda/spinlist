import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.1.182"],
  productionBrowserSourceMaps: true,
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  sourcemaps: {
    disable:
      !process.env.SENTRY_AUTH_TOKEN ||
      !process.env.SENTRY_ORG ||
      !process.env.SENTRY_PROJECT,
  },
});
