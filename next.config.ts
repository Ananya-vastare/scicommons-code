import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Disable 'canvas' module for client-side
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;