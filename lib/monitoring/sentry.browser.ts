// Browser-only Sentry helpers. Safe to be imported in client bundles.
export async function initSentryBrowser(): Promise<void> {
  if (typeof window === 'undefined') return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/browser');
  Sentry.init({ dsn, tracesSampleRate: 0.05 });
}

export async function captureErrorBrowser(err: unknown, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/browser');
    (Sentry as any).captureException?.(err, { extra: context });
  } catch {}
}


