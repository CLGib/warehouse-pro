import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/brief", destination: "/present", permanent: false },
      { source: "/ops", destination: "/operator", permanent: false },
    ];
  },
};

export default nextConfig;
