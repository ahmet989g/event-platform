import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['nyuvivzufmaxafniqsxu.supabase.co']
  },
  experimental: {
    turbo: {
      root: process.cwd() // Set the root directory for Turbopack to the current working directory
    }
  }
};

export default nextConfig;
