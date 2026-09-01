import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 400,
        ignored: ["**/node_modules/**", "**/.next/**", "**/.next-verify/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
