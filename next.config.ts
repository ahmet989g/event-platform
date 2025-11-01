import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['nyuvivzufmaxafniqsxu.supabase.co']
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
