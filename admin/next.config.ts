import path from "node:path";
import type { NextConfig } from "next";

// The console reuses the main site's code in ../src, so the project root is the parent folder.
const root = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
