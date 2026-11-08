import type { NextConfig } from "next";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

const nextConfig: NextConfig = {
  // The dev server trusts only localhost by default; 127.0.0.1 is a different origin to it,
  // so live reload is refused and pages never hydrate there. Dev-only; no effect on builds.
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  // The staff console is a separate app (./admin); keep old /console links working.
  async redirects() {
    return adminUrl
      ? [
          { source: "/console", destination: `${adminUrl}/console`, permanent: false },
          { source: "/console/:path*", destination: `${adminUrl}/console/:path*`, permanent: false },
        ]
      : [];
  },
};

export default nextConfig;
