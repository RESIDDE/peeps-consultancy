import path from "node:path";
import type { NextConfig } from "next";

// The console reuses the main site's code in ../src, so the project root is the parent folder.
const root = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  // The dev server trusts only localhost by default; 127.0.0.1 is a different origin to it,
  // so live reload is refused and pages never hydrate there. Dev-only; no effect on builds.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: { root },
  outputFileTracingRoot: root,
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
