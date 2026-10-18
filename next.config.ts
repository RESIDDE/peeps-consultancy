import type { NextConfig } from "next";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

const nextConfig: NextConfig = {
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
