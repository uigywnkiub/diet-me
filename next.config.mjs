// @ts-check
/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  cacheStartUrl: true,
  extendDefaultRuntimeCaching: true,
  // disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig = {
  // experimental: {
  //   outputFileTracingIncludes: {
  //     "/api/upload": ["./uploads/**/*"],
  //     "/api/upload": ["./public/uploads/**/*"],
  //   },
  // },
};

export default withPWA({
  nextConfig,
});
