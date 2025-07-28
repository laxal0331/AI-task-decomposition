// next.config.js
const nextConfig = {
  eslint: {
    // ❗ 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 其他配置项...
};

module.exports = nextConfig;
