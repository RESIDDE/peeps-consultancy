import type { NextConfig } from "next";

// The staff console is a separate app (./admin) at its own address. Nothing on this site
// links or redirects to it.
const nextConfig: NextConfig = {
  // The dev server trusts only localhost by default; 127.0.0.1 is a different origin to it,
  // so live reload is refused and pages never hydrate there. Dev-only; no effect on builds.
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
