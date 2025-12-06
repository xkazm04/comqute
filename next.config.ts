import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable aggressive caching to prevent stale component states on module transitions
  experimental: {
    // Disable ISR cache
    isrFlushToDisk: false,
  },
  // Disable static page generation caching in development
  generateEtags: false,
  // Disable powered-by header
  poweredByHeader: false,
};

export default nextConfig;
