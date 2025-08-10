import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // 与原 next.config.cjs 合并，避免构建被 ESLint 阻塞
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 允许即使存在类型错误也能完成生产构建
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
