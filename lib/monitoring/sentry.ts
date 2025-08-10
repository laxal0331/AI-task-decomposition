/* Lightweight Sentry wrappers. Enabled only if DSN provided. */
export async function initSentryBrowser(): Promise<void> {
  if (typeof window === 'undefined') return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/browser');
  Sentry.init({ dsn, tracesSampleRate: 0.05 });
}

export async function initSentryNode(): Promise<void> {
  if (typeof window !== 'undefined') return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/node');
  // avoid re-init in serverless
  // @ts-expect-error: optional chaining for hub client presence in node env
  if ((Sentry as any).getCurrentHub?.()?.getClient?.()) return;
  (Sentry as any).init?.({ dsn, tracesSampleRate: 0.05 });
}

export async function captureError(err: unknown, context?: Record<string, any>) {
  const isBrowser = typeof window !== 'undefined';
  const dsn = isBrowser ? process.env.NEXT_PUBLIC_SENTRY_DSN : process.env.SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import(isBrowser ? '@sentry/browser' : '@sentry/node');
  (Sentry as any).captureException?.(err, { extra: context });
}


