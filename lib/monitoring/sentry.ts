/* Lightweight Sentry wrappers. Enabled only if DSN provided. */
// Node 环境使用的（目前项目未启用，保留以便后续 API 路由接入）
export async function initSentryBrowser(): Promise<void> { /* noop for server bundle */ }

// 避免在 Next.js 客户端打包时引入 Node-only 依赖
export async function initSentryNode(): Promise<void> {
  if (typeof window !== 'undefined') return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/node');
    // @ts-expect-error: optional chaining for hub client presence in node env
    if ((Sentry as any).getCurrentHub?.()?.getClient?.()) return;
    (Sentry as any).init?.({ dsn, tracesSampleRate: 0.05, autoSessionTracking: false });
  } catch {
    // 忽略构建环境缺少 node-only 依赖
  }
}

export async function captureError(err: unknown, context?: Record<string, any>) {
  // 仅在服务器端调用；客户端请使用 sentry.browser.ts
}


