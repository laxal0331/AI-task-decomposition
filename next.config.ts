import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // 允许即使存在类型错误也能完成生产构建
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
