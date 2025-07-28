// next.config.cjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ 禁用 ESLint 阻止构建
  },
};

module.exports = nextConfig;
