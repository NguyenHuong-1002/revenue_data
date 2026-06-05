import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack xử lý native module fallbacks tự động, không cần webpack config
  turbopack: {},
};

export default nextConfig;
